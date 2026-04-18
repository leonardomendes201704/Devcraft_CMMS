# Sobe db + api + web conforme docker-compose.yml na raiz do repositorio.
# Pre-requisito: Docker Desktop em execucao (daemon ativo).
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

$docker = 'C:\Program Files\Docker\Docker\resources\bin\docker.exe'
if (-not (Test-Path $docker)) {
    Write-Host "[docker-up] docker.exe nao encontrado em $docker. Ajuste o caminho ou instale Docker Desktop."
    exit 1
}

Write-Host "[docker-up] docker compose up -d --build ..."
& $docker compose -f (Join-Path $PWD 'docker-compose.yml') up -d --build
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "[docker-up] OK. API http://localhost:8117  Web http://localhost:5487  Swagger http://localhost:8117/swagger"
