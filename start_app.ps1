# Iniciar Central Financeira Pessoal
Write-Host "Iniciando Central Financeira Pessoal..." -ForegroundColor Green
$filePath = Join-Path $PSScriptRoot "index.html"
Start-Process $filePath
Write-Host "Aplicacao aberta no seu navegador padrao com sucesso!" -ForegroundColor Cyan
