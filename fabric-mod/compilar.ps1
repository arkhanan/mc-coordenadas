$ErrorActionPreference = "Stop"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   MineCoords Client Mod - Compilador Automatico  " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Loom 1.17 requiere Gradle 9.6.0
$targetGradleVersion = "9.6.0"
$binDir = Join-Path $PSScriptRoot ".gradle-bin"
$localGradle = Join-Path $binDir "gradle-$targetGradleVersion\bin\gradle.bat"

if (-not (Test-Path $localGradle)) {
    Write-Host "Preparando Gradle $targetGradleVersion para Loom 1.17..." -ForegroundColor Yellow
    
    # Limpiar versiones viejas si existieran
    if (Test-Path $binDir) {
        Remove-Item -Path $binDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    New-Item -ItemType Directory -Path $binDir | Out-Null
    
    $zipPath = Join-Path $PSScriptRoot "gradle-temp.zip"
    $downloadUrl = "https://services.gradle.org/distributions/gradle-$targetGradleVersion-bin.zip"
    
    Write-Host "Descargando Gradle $targetGradleVersion oficial..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath
    
    Write-Host "Extrayendo Gradle $targetGradleVersion..." -ForegroundColor Cyan
    Expand-Archive -Path $zipPath -DestinationPath $binDir -Force
    Remove-Item $zipPath -Force
}

$gradleExec = $localGradle

Write-Host "`nIniciando compilacion del mod Fabric con Gradle $targetGradleVersion..." -ForegroundColor Green
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
