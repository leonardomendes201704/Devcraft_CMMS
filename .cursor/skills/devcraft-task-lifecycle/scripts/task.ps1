#Requires -Version 5.1
<#
.SYNOPSIS
  Devcraft CMMS Kanban task lifecycle helper.

.DESCRIPTION
  Encapsulates the mandatory new -> active -> resolved -> closed flow
  defined in guidelines/workflows/task-lifecycle-directive.md.

  Subcommands:
    login      Authenticate and cache {baseUrl, tenantId, token}.
    new        Create a Kanban task.
    start      Move task to active.
    resolve    Move task to resolved.
    close      Complete task (resolved -> closed) with spentHours; restarts web container if image evidence was attached.
    evidence   Attach image or api evidence. For image, copies a PNG into public/evidences/.
    show       Print task JSON plus ready-to-paste changelog and board snippets.
    help       Usage.

  See SKILL.md for the full workflow.
#>

param()

$ErrorActionPreference = 'Stop'

$Command = 'help'
$Rest = @()
if ($args.Count -ge 1) {
    $Command = [string]$args[0]
    if ($args.Count -ge 2) { $Rest = $args[1..($args.Count - 1)] }
}
$validCommands = @('login','new','start','resolve','close','evidence','show','help','')
if ($Command -and ($validCommands -notcontains $Command)) {
    Write-Host "[task] Unknown command: $Command" -ForegroundColor Red
    $Command = 'help'
}

# -------- Paths --------
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot  = (Resolve-Path (Join-Path $ScriptDir '..\..\..\..')).Path
$PublicEvidencesDir = Join-Path $RepoRoot 'src\frontend\cmms-web\public\evidences'
$ConfigPath = Join-Path $env:TEMP 'devcraft-task.json'
$DockerExe  = 'C:\Program Files\Docker\Docker\resources\bin\docker.exe'
$WebContainer = 'devcraft_cmms_web'

# -------- Helpers --------
function Write-Info($msg)  { Write-Host "[task] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)    { Write-Host "[task] $msg" -ForegroundColor Green }
function Write-Warn2($msg) { Write-Host "[task] $msg" -ForegroundColor Yellow }
function Write-Err($msg)   { Write-Host "[task] $msg" -ForegroundColor Red }

function Parse-KV {
    param([string[]]$Tokens)
    $map = @{}
    if (-not $Tokens) { return $map }
    for ($i = 0; $i -lt $Tokens.Count; $i++) {
        $a = $Tokens[$i]
        if ($a -like '-*') {
            $key = $a.TrimStart('-')
            $next = $null
            if ($i + 1 -lt $Tokens.Count -and -not ($Tokens[$i + 1] -like '-*')) {
                $next = $Tokens[$i + 1]
                $i++
            } else {
                $next = $true
            }
            $map[$key] = $next
        }
    }
    return $map
}

function Load-Config {
    if (-not (Test-Path $ConfigPath)) {
        throw "Not authenticated. Run: task.ps1 login"
    }
    return Get-Content $ConfigPath -Raw | ConvertFrom-Json
}

function Save-Config($cfg) {
    $cfg | ConvertTo-Json -Depth 10 | Set-Content -Path $ConfigPath -Encoding UTF8
}

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        $Body = $null,
        [switch]$NoAuth
    )
    $cfg = if ($NoAuth) { $null } else { Load-Config }
    $url = if ($NoAuth) { $Path } else { "$($cfg.baseUrl)$Path" }

    $headers = @{
        'Content-Type' = 'application/json'
        'Accept'       = 'application/json'
    }
    if (-not $NoAuth) {
        $headers['Authorization'] = "Bearer $($cfg.token)"
        $headers['X-Tenant-Id']   = $cfg.tenantId
    }

    $jsonBody = $null
    if ($null -ne $Body) {
        $jsonBody = ($Body | ConvertTo-Json -Depth 12 -Compress)
    }

    try {
        if ($null -ne $jsonBody) {
            return Invoke-RestMethod -Method $Method -Uri $url -Headers $headers -Body $jsonBody
        } else {
            return Invoke-RestMethod -Method $Method -Uri $url -Headers $headers
        }
    } catch {
        $resp = $_.Exception.Response
        if ($resp) {
            try {
                $reader = [IO.StreamReader]::new($resp.GetResponseStream())
                $raw = $reader.ReadToEnd()
                Write-Err "HTTP $([int]$resp.StatusCode) $($resp.StatusDescription) - $raw"
            } catch {}
        }
        throw
    }
}

function Slugify([string]$value) {
    if ([string]::IsNullOrWhiteSpace($value)) { return 'step' }
    $v = $value.ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD)
    $sb = New-Object System.Text.StringBuilder
    foreach ($c in $v.ToCharArray()) {
        $cat = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($c)
        if ($cat -ne [Globalization.UnicodeCategory]::NonSpacingMark) { [void]$sb.Append($c) }
    }
    $stripped = $sb.ToString()
    $out = [regex]::Replace($stripped, '[^a-z0-9]+', '-').Trim('-')
    if ([string]::IsNullOrEmpty($out)) { return 'step' }
    return $out
}

# -------- Commands --------
function Cmd-Help {
    Write-Host @"
Devcraft CMMS Task Lifecycle Helper

Usage:
  task.ps1 login    [-BaseUrl <url>] [-Tenant <guid>] [-Email <email>] [-Password <pwd>]
  task.ps1 new      -Title <str> -Description <str> -Type <story|feature|test|hotfix|chore|bug> -Module <str> [-Assignee <str>] [-Estimate <decimal>]
  task.ps1 start    -Id <guid>
  task.ps1 resolve  -Id <guid>
  task.ps1 close    -Id <guid> -SpentHours <decimal>
  task.ps1 evidence -Id <guid> -Title <str> [-Kind image|api] [-ImagePath <path>] [-PayloadJson <json>] [-Step <nn>] [-Source <str>]
  task.ps1 show     -Id <guid> [-Snippets]
  task.ps1 help

Defaults:
  BaseUrl  = http://localhost:8117
  Tenant   = 11111111-1111-1111-1111-111111111111
  Email    = admin@cmms.local
  Password = Naotemsenha0(
"@
}

function Cmd-Login {
    $kv = Parse-KV -Tokens $Rest
    $baseUrl = if ($kv.BaseUrl) { [string]$kv.BaseUrl } else { 'http://localhost:8117' }
    $tenant  = if ($kv.Tenant)  { [string]$kv.Tenant }  else { '11111111-1111-1111-1111-111111111111' }
    $email   = if ($kv.Email)   { [string]$kv.Email }   else { 'admin@cmms.local' }
    $password = if ($kv.Password) { [string]$kv.Password } else { 'Naotemsenha0(' }

    Write-Info "Login -> $baseUrl as $email (tenant $tenant)"
    $body = @{ email = $email; password = $password } | ConvertTo-Json -Compress
    $headers = @{
        'Content-Type' = 'application/json'
        'Accept'       = 'application/json'
        'X-Tenant-Id'  = $tenant
    }
    $resp = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/login" -Headers $headers -Body $body
    $cfg = [ordered]@{
        baseUrl  = $baseUrl
        tenantId = $tenant
        token    = $resp.accessToken
        user     = $resp.user
        savedAt  = (Get-Date).ToString('o')
    }
    Save-Config $cfg
    Write-Ok "Token cached in $ConfigPath (expires in $($resp.expiresInSeconds)s)."
}

function Cmd-New {
    $kv = Parse-KV -Tokens $Rest
    foreach ($k in 'Title','Description','Type','Module') {
        if (-not $kv[$k]) { throw "Missing -$k" }
    }
    $estimate = if ($kv.Estimate) { [decimal]$kv.Estimate } else { 0.5 }
    $assignee = if ($kv.Assignee) { [string]$kv.Assignee } else { 'Unassigned' }

    $body = [ordered]@{
        title         = [string]$kv.Title
        description   = [string]$kv.Description
        type          = [string]$kv.Type
        module        = [string]$kv.Module
        assignee      = $assignee
        estimateHours = $estimate
    }
    $task = Invoke-Api -Method Post -Path '/api/tasks' -Body $body
    Write-Ok "Task created id=$($task.id) title=`"$($task.title)`" status=$($task.status) estimate=$($task.estimateHours)h"
    Write-Output $task.id
}

function Cmd-Status {
    param([string]$TargetStatus)
    $kv = Parse-KV -Tokens $Rest
    if (-not $kv.Id) { throw "Missing -Id" }
    $task = Invoke-Api -Method Patch -Path "/api/tasks/$($kv.Id)/status" -Body @{ status = $TargetStatus }
    Write-Ok "Task $($task.id) -> status=$($task.status)"
}

function Cmd-Close {
    $kv = Parse-KV -Tokens $Rest
    if (-not $kv.Id) { throw "Missing -Id" }
    if (-not $kv.SpentHours) { throw "Missing -SpentHours" }
    $spent = [decimal]$kv.SpentHours

    # get task to know if image evidence exists (no GET-by-id endpoint; use list)
    $all = Invoke-Api -Method Get -Path "/api/tasks"
    $pre = $all | Where-Object { $_.id -eq $kv.Id } | Select-Object -First 1
    if (-not $pre) { throw "Task $($kv.Id) not found via /api/tasks list." }
    $hasImageEvidence = $false
    if ($pre.evidences) {
        foreach ($e in $pre.evidences) {
            $k = ($e.kind | Out-String).Trim().ToLowerInvariant()
            if ($k -eq 'image' -and $e.imageUrl) { $hasImageEvidence = $true; break }
        }
    }

    $body = @{ spentHours = $spent }
    $task = Invoke-Api -Method Post -Path "/api/tasks/$($kv.Id)/complete" -Body $body
    Write-Ok "Task $($task.id) closed: spent=$($task.totalSpentHoursOnClose)h leadTime=$($task.totalLeadTimeHoursOnClose)h closedAtUtc=$($task.closedAtUtc)"

    if ($hasImageEvidence) {
        if (Test-Path $DockerExe) {
            Write-Info "Restarting $WebContainer so new evidences are picked up by Vite (known issue LL-009)..."
            & $DockerExe restart $WebContainer | Out-Null
            Start-Sleep -Seconds 5
            Write-Ok "$WebContainer restarted."
        } else {
            Write-Warn2 "docker.exe not found at $DockerExe; skip web container restart. New evidences may appear as 'Image unavailable' until the dev server is restarted."
        }
    }
}

function Cmd-Evidence {
    $kv = Parse-KV -Tokens $Rest
    if (-not $kv.Id) { throw "Missing -Id" }
    if (-not $kv.Title) { throw "Missing -Title" }
    $kind = if ($kv.Kind) { ([string]$kv.Kind).ToLowerInvariant() } else { 'image' }
    $source = if ($kv.Source) { [string]$kv.Source } else { 'manual' }

    if ($kind -eq 'image') {
        if (-not $kv.ImagePath) { throw "Missing -ImagePath (absolute or repo-relative path to PNG)" }
        $src = [string]$kv.ImagePath
        if (-not (Test-Path $src)) {
            $rel = Join-Path $RepoRoot $src
            if (Test-Path $rel) { $src = $rel } else { throw "Image not found: $($kv.ImagePath)" }
        }
        if (-not (Test-Path $PublicEvidencesDir)) {
            New-Item -ItemType Directory -Force -Path $PublicEvidencesDir | Out-Null
        }
        $step = if ($kv.Step) { ('{0:D2}' -f [int]$kv.Step) } else { '01' }
        $rawTitle = [string]$kv.Title
        # If the caller already prefixed the title with "Step NN - ...", strip it so the slug is not duplicated.
        $stripped = [regex]::Replace($rawTitle, '^\s*step\s*\d+\s*[-:]\s*', '', 'IgnoreCase')
        $slug = Slugify $stripped
        $unix = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
        $fileName = "task-$($kv.Id)-pw-step-$step-$slug-$unix.png"
        $dst = Join-Path $PublicEvidencesDir $fileName
        Copy-Item -Path $src -Destination $dst -Force
        Write-Info "Copied evidence to public/evidences/$fileName"

        $body = [ordered]@{
            title         = [string]$kv.Title
            kind          = 'image'
            imageUrl      = "/evidences/$fileName"
            capturedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
            source        = $source
        }
        $task = Invoke-Api -Method Post -Path "/api/tasks/$($kv.Id)/evidences" -Body $body
        Write-Ok "Image evidence attached to task $($task.id) ($fileName)"
    }
    elseif ($kind -eq 'api') {
        if (-not $kv.PayloadJson) { throw "Missing -PayloadJson" }
        $body = [ordered]@{
            title         = [string]$kv.Title
            kind          = 'api'
            payloadJson   = [string]$kv.PayloadJson
            capturedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
            source        = $source
        }
        $task = Invoke-Api -Method Post -Path "/api/tasks/$($kv.Id)/evidences" -Body $body
        Write-Ok "API evidence attached to task $($task.id)"
    }
    else {
        throw "Invalid -Kind: $kind (expected image|api)"
    }
}

function Cmd-Show {
    $kv = Parse-KV -Tokens $Rest
    if (-not $kv.Id) { throw "Missing -Id" }
    $all = Invoke-Api -Method Get -Path "/api/tasks"
    $task = $all | Where-Object { $_.id -eq $kv.Id } | Select-Object -First 1
    if (-not $task) { throw "Task $($kv.Id) not found via /api/tasks list." }
    Write-Host ($task | ConvertTo-Json -Depth 10)

    if ($kv.Snippets) {
        $localNow = Get-Date -Format 'dd/MM/yyyy, HH:mm:ss'
        $evList = @()
        foreach ($e in ($task.evidences | Sort-Object capturedAtUtc)) {
            $title = $e.title
            if ($e.kind -eq 'image') { $evList += "  - $title ($($e.imageUrl))" } else { $evList += "  - $title (api)" }
        }
        $evBlock = if ($evList.Count -gt 0) { $evList -join "`n" } else { '  - (none)' }

        $changelog = @"

### Changelog snippet (paste under current date in CHANGELOG.md)

- $($task.title) (task $($task.id)) - module $($task.module), type $($task.type), spent $($task.totalSpentHoursOnClose)h, lead $($task.totalLeadTimeHoursOnClose)h.
  - Evidence:
$evBlock

"@
        $board = @"

### Board snippet (paste into management/kanban/board.md)

| Id | Title | Type | Module | Status | Estimate (h) | Spent (h) |
|----|-------|------|--------|--------|--------------|-----------|
| $($task.id) | $($task.title) | $($task.type) | $($task.module) | $($task.status) | $($task.estimateHours) | $($task.totalSpentHoursOnClose) |

Transition Log $($task.id):
- new      -> active   at (local start, fill in)
- active   -> resolved at (local resolve, fill in)
- resolved -> closed   at $localNow (local close)
- spentHours on close: $($task.totalSpentHoursOnClose)h
- leadTimeHoursOnClose: $($task.totalLeadTimeHoursOnClose)h
- evidences:
$evBlock

"@
        Write-Host $changelog
        Write-Host $board
    }
}

# -------- Dispatcher --------
switch ($Command) {
    'login'    { Cmd-Login }
    'new'      { Cmd-New }
    'start'    { Cmd-Status -TargetStatus 'active' }
    'resolve'  { Cmd-Status -TargetStatus 'resolved' }
    'close'    { Cmd-Close }
    'evidence' { Cmd-Evidence }
    'show'     { Cmd-Show }
    default    { Cmd-Help }
}

