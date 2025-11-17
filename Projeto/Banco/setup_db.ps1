$schema = Join-Path $PSScriptRoot 'schema.sql'
$seed = Join-Path $PSScriptRoot 'seed.sql'

Write-Host "Importando schema: $schema"
mysql -u root -p < $schema

Write-Host "Importando seed (se existir): $seed"
mysql -u root -p < $seed

Write-Host "Concluído."
