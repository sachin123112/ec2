param(
    [string]$PostgresHost = 'localhost',
    [int]$PostgresPort = 5432,
    [string]$PostgresUser = 'postgres',
    [string]$PostgresPassword = 'postgres',
    [string]$Database = 'ec2_db'
)

$env:PGHOST = $PostgresHost
$env:PGPORT = $PostgresPort.ToString()
$env:PGUSER = $PostgresUser
$env:PGPASSWORD = $PostgresPassword

Write-Host "Applying migrations to $PostgresUser@$PostgresHost`:$PostgresPort/$Database"

$base = Join-Path $PSScriptRoot '..\database\migrations'
Get-ChildItem -Path $base -Filter '*.sql' | Sort-Object Name | ForEach-Object {
    Write-Host "Running: $($_.FullName)"
    & psql -h $env:PGHOST -p $env:PGPORT -U $env:PGUSER -d $Database -f $_.FullName
}

$authMigs = Join-Path $PSScriptRoot '..\backend-platform\services\auth-service\src\main\resources\db\migration'
Get-ChildItem -Path $authMigs -Filter '*.sql' | Sort-Object Name | ForEach-Object {
    Write-Host "Running auth-service migration: $($_.FullName)"
    & psql -h $env:PGHOST -p $env:PGPORT -U $env:PGUSER -d $Database -f $_.FullName
}

Write-Host "Migrations applied. Verifying tables..."
& psql -h $env:PGHOST -p $env:PGPORT -U $env:PGUSER -d $Database -c "\dt"
