# Script para instalar certificado do registry no Windows
$certPath = "C:\Users\matheus\Documents\Locacao\Locacao\certs\registry.crt"

Write-Host "🔐 Instalando certificado do Registry..." -ForegroundColor Cyan

$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certPath)
$store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root","CurrentUser")
$store.Open("ReadWrite")
$store.Add($cert)
$store.Close()

Write-Host "✅ Certificado instalado com sucesso no Windows!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Detalhes do certificado:" -ForegroundColor Yellow
Write-Host "   Subject: $($cert.Subject)" -ForegroundColor White
Write-Host "   Issuer: $($cert.Issuer)" -ForegroundColor White
Write-Host "   Valid From: $($cert.NotBefore)" -ForegroundColor White
Write-Host "   Valid To: $($cert.NotAfter)" -ForegroundColor White
