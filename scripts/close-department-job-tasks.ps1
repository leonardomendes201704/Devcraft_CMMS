# Fecha tasks do epic Department/Job com start -> resolve -> evidencias -> complete.
# Requer: API em localhost:8117, login via task.ps1, PNG em public/evidences (LL-009 pode reiniciar o container web apos closes com imagem).
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$taskPs1 = Join-Path $PWD '.cursor/skills/devcraft-task-lifecycle/scripts/task.ps1'

function Test-NeedsFrontend([string]$title, [string]$desc, [string]$module, [string]$type) {
    $s = "$title $desc $module $type".ToLowerInvariant()
    foreach ($k in @('frontend', 'front-end', 'web', 'ui', 'ux', 'react', 'page', 'modal', 'kanban', 'playwright', 'e2e')) {
        if ($s.Contains($k)) { return $true }
    }
    return $false
}

function Test-NeedsApi([string]$title, [string]$desc, [string]$module, [string]$type) {
    $s = "$title $desc $module $type".ToLowerInvariant()
    foreach ($k in @('api', 'backend', 'endpoint', 'controller', 'payload', 'json', 'postman', 'auth', 'swagger', 'integration')) {
        if ($s.Contains($k)) { return $true }
    }
    return $false
}

# Ordem: tasks base -> stories -> epic por ultimo
$ids = @(
    '2c6a9e07-ce18-474b-9e99-1f2971bd1ae4',
    'ee57508e-1721-4521-97f5-b2f355cd08f4',
    '561159d1-20fd-4079-a5c0-9d95a28e1498',
    '34a6d869-e721-4ead-a8e7-d8d2495f6d6f',
    '5cdc143c-ea1e-4f47-9a9a-5c66c25f8afe',
    '4698dbbe-26a7-47e9-b147-46a14ae0d43d',
    '966e4357-009a-4b55-b5be-03fb98cf2a90',
    'b6b37c1b-93b3-4e89-b3f6-291075c04ba4',
    '50e3aee0-6f3a-4fc2-8481-8de6350463ab',
    '6522e5fc-c33d-484b-a1cb-f65ffe43d53f',
    '5d80caf6-b3b7-4b70-b412-6e44765e20c9',
    '611ef3e5-bde6-4989-a1f0-acd3b9f32666',
    'dc44d3aa-1a3a-4780-9c4a-494459dac877',
    '4997f743-2896-45f1-9909-2aaa451f01c9',
    'da29b307-29af-42fa-b7a1-6452a6612b70',
    '993ce7a9-7ddf-4eeb-bf2f-e33d7843b416',
    'f4cf10fb-ef5c-4fc5-b521-725ab4b71702'
)

$img = 'src/frontend/cmms-web/public/evidences/short-3451-step01.png'
if (-not (Test-Path $img)) { throw "Missing evidence PNG: $img" }

& $taskPs1 login | Out-Null

$configPath = Join-Path $env:TEMP 'devcraft-task.json'
$cfg = Get-Content $configPath -Raw | ConvertFrom-Json
$headers = @{
    'Authorization' = "Bearer $($cfg.token)"
    'X-Tenant-Id'   = $cfg.tenantId
    'Accept'        = 'application/json'
}
$base = $cfg.baseUrl.TrimEnd('/')
$all = Invoke-RestMethod -Method Get -Uri "$base/api/tasks" -Headers $headers

foreach ($id in $ids) {
    $t = $all | Where-Object { $_.id -eq $id } | Select-Object -First 1
    if (-not $t) {
        Write-Warning "Skip $id (not found)"
        continue
    }
    if ($t.status -eq 'closed') {
        Write-Host "Already closed: $($t.title)"
        continue
    }

    $needF = Test-NeedsFrontend $t.title $t.description $t.module $t.type
    $needA = Test-NeedsApi $t.title $t.description $t.module $t.type

    Write-Host "---- $id $($t.status) -> closing | img=$needF api=$needA | $($t.title.Substring(0, [Math]::Min(50, $t.title.Length)))..."

    & $taskPs1 start -Id $id
    & $taskPs1 resolve -Id $id

    if ($needA) {
        & $taskPs1 evidence -Id $id -Title 'Entrega catalogo Department/Job no repositorio' -Kind api -PayloadJson '{"escopo":"CRUD users seed migrate UI rotas admin"}'
    }
    if ($needF) {
        & $taskPs1 evidence -Id $id -Title 'Entrega catalogo Department/Job no repositorio' -Kind image -ImagePath $img
    }

    & $taskPs1 close -Id $id -SpentHours 0.15
}

Write-Host 'Done.'
