$ErrorActionPreference = "Stop"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   MineCoords Client Mod - Compilador Automatico  " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$binDir = Join-Path $PSScriptRoot ".gradle-bin"
if (-not (Test-Path $binDir)) { New-Item -ItemType Directory -Path $binDir | Out-Null }

# 1. Preparar JDK 25 (Exigido por Minecraft 26.3 y Loom 1.17)
$jdkDir = Join-Path $binDir "jdk-25"
$java25Exe = Get-ChildItem -Path $binDir -Filter "java.exe" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -like "*jdk*25*" } | Select-Object -First 1

if (-not $java25Exe) {
    Write-Host "`nMinecraft 26.3 exige Java 25 (tu sistema tiene Java 21)." -ForegroundColor Yellow
    Write-Host "Descargando JDK 25 portable oficial (sin modificar tu instalacion actual)..." -ForegroundColor Yellow
    
    $jdkZip = Join-Path $PSScriptRoot "jdk25-temp.zip"
    $jdkUrl = "https://download.oracle.com/java/25/latest/jdk-25_windows-x64_bin.zip"
    
    Write-Host "Descargando JDK 25 desde Oracle CDN..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $jdkUrl -OutFile $jdkZip
    
    Write-Host "Extrayendo JDK 25..." -ForegroundColor Cyan
    Expand-Archive -Path $jdkZip -DestinationPath $binDir -Force
    Remove-Item $jdkZip -Force
    
    $java25Exe = Get-ChildItem -Path $binDir -Filter "java.exe" -Recurse | Where-Object { $_.FullName -like "*jdk*25*" } | Select-Object -First 1
}

if ($java25Exe) {
    $jdkHome = $java25Exe.Directory.Parent.FullName
    $env:JAVA_HOME = $jdkHome
    $env:PATH = "$($java25Exe.Directory.FullName);$env:PATH"
    Write-Host "Usando Java 25: $jdkHome" -ForegroundColor Green
}

# 2. Preparar Gradle 9.6.0
$targetGradleVersion = "9.6.0"
$localGradle = Join-Path $binDir "gradle-$targetGradleVersion\bin\gradle.bat"

if (-not (Test-Path $localGradle)) {
    Write-Host "Descargando Gradle $targetGradleVersion..." -ForegroundColor Yellow
    $zipPath = Join-Path $PSScriptRoot "gradle-temp.zip"
    $downloadUrl = "https://services.gradle.org/distributions/gradle-$targetGradleVersion-bin.zip"
    
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath
    Expand-Archive -Path $zipPath -DestinationPath $binDir -Force
    Remove-Item $zipPath -Force
}

$gradleExec = $localGradle

Write-Host "`nIniciando compilacion del mod Fabric con Java 25 y Gradle $targetGradleVersion..." -ForegroundColor Green
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
