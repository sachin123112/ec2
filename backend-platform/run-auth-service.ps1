$envFile = Join-Path $PSScriptRoot '.env'

if (-not (Test-Path $envFile)) {
    throw 'backend-platform/.env not found. Copy .env.example to .env and set local values first.'
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
        Set-Item -Path ("Env:" + $matches[1].Trim()) -Value $matches[2].Trim()
    }
}

$env:DB_URL = 'jdbc:postgresql://127.0.0.1:5433/backend_platform'
$env:DB_USERNAME = 'postgres'
$env:REDIS_HOST = '127.0.0.1'
$env:REDIS_PORT = '6380'
$env:SERVER_PORT = '8081'

docker compose up -d postgres redis
Push-Location (Join-Path $PSScriptRoot 'services\auth-service')
try {
    mvn spring-boot:run
}
finally {
    Pop-Location
}
