param(
    [Parameter(Mandatory)][string]$Id
)
# Remove uma linha de Kanban via DELETE /api/tasks/{id} (admin_master).
# Uso: .\scripts\delete-kanban-task.ps1 -Id 'e37581ca-2854-4445-8400-8dff64f5a469'
# Requer API em localhost:8117 com a rota DELETE (rebuild da imagem/container apos deploy).
$ErrorActionPreference = 'Stop'

$taskId = [guid]::Parse($Id)

Set-Location (Join-Path $PSScriptRoot '..')
$taskPs1 = Join-Path $PWD '.cursor/skills/devcraft-task-lifecycle/scripts/task.ps1'
& $taskPs1 login | Out-Null

$cfgPath = Join-Path $env:TEMP 'devcraft-task.json'
$cfg = Get-Content $cfgPath -Raw | ConvertFrom-Json
$uri = "$($cfg.baseUrl)/api/tasks/$taskId"
$headers = @{
    Authorization = "Bearer $($cfg.token)"
    'X-Tenant-Id'   = $cfg.tenantId
}

try {
    Invoke-RestMethod -Uri $uri -Method Delete -Headers $headers -TimeoutSec 60
    Write-Host "[delete-kanban-task] OK (204) $uri"
} catch {
    Write-Host "[delete-kanban-task] Falha: $_"
    exit 1
}
