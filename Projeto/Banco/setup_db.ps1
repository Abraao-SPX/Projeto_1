# Executa schema.sql e seed.sql (PowerShell)
# Uso: execute na pasta projeto (ou passe caminho correto)

$schema = Join-Path $PSScriptRoot 'schema.sql'
$seed = Join-Path $PSScriptRoot 'seed.sql'

Write-Host "Importando schema: $schema"
mysql -u root -p < $schema

Write-Host "Importando seed (se existir): $seed"
mysql -u root -p < $seed

Write-Host "Concluído."
