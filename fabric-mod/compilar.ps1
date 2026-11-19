$ErrorActionPreference = "Stop"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   MineCoords Client Mod - Compilador Automatico  " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# 1. Verificar si Gradle ya está en el sistema
$gradleCmd = Get-Command "gradle" -ErrorAction SilentlyContinue

if (-not $gradleCmd) {
    $localGradle = Join-Path $PSScriptRoot ".gradle-bin\gradle-8.10\bin\gradle.bat"
    if (-not (Test-Path $localGradle)) {
        Write-Host "Gradle no esta instalado en el sistema." -ForegroundColor Yellow
        Write-Host "Descargando Gradle portable oficial (Gradle 8.10)..." -ForegroundColor Yellow
        
        $zipPath = Join-Path $PSScriptRoot "gradle-temp.zip"
        $binDir = Join-Path $PSScriptRoot ".gradle-bin"
        
        if (-not (Test-Path $binDir)) { New-Item -ItemType Directory -Path $binDir | Out-Null }
        
        Invoke-WebRequest -Uri "https://services.gradle.org/distributions/gradle-8.10-bin.zip" -OutFile $zipPath
        Write-Host "Extrayendo Gradle..." -ForegroundColor Cyan
        Expand-Archive -Path $zipPath -DestinationPath $binDir -Force
        Remove-Item $zipPath -Force
    }
    $gradleExec = $localGradle
} else {
    $gradleExec = "gradle"
}

Write-Host "`nIniciando compilacion del mod Fabric..." -ForegroundColor Green
Set-Location $PSScriptRoot

& $gradleExec build --no-daemon

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n===================================================" -ForegroundColor Green
    Write-Host " [OK] COMPILACION EXITOSA!" -ForegroundColor Green
    Write-Host " Tu archivo mod esta listo en:" -ForegroundColor White
    Write-Host " fabric-mod\build\libs\minecoords-mod-1.0.0.jar" -ForegroundColor Yellow
    Write-Host "===================================================" -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] Ocurrio un fallo durante la compilacion." -ForegroundColor Red
}
