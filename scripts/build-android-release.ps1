param(
    [string]$Version = ''
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$secureDir = Join-Path $env:USERPROFILE 'Documents\Felipe Docs\Otros'
$oldKey = Join-Path $secureDir 'flux-release.keystore'
$newKey = Join-Path $secureDir 'quacker-release-2026.keystore'
$lineage = Join-Path $secureDir 'quacker-signing-lineage.bin'
$androidHome = $env:ANDROID_HOME
$javaHome = $env:JAVA_HOME

if (-not $javaHome -or -not (Test-Path (Join-Path $javaHome 'bin\java.exe'))) {
    $candidate = Join-Path $env:LOCALAPPDATA 'QuackerBuildTools\jdk'
    if (Test-Path (Join-Path $candidate 'bin\java.exe')) { $javaHome = $candidate }
}
if (-not $androidHome -or -not (Test-Path (Join-Path $androidHome 'build-tools\36.0.0\apksigner.bat'))) {
    $candidate = Join-Path $env:LOCALAPPDATA 'QuackerBuildTools\android-sdk'
    if (Test-Path (Join-Path $candidate 'build-tools\36.0.0\apksigner.bat')) { $androidHome = $candidate }
}
foreach ($path in @($oldKey, $newKey, $lineage, $javaHome, $androidHome)) {
    if (-not $path -or -not (Test-Path $path)) { throw "Required Android signing/build file not found: $path" }
}

function Read-DpapiPassword([string]$Path) {
    $secure = [IO.File]::ReadAllText($Path).Trim() | ConvertTo-SecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

$gradleFile = Join-Path $repo 'android\app\build.gradle'
if (-not $Version) {
    $match = [regex]::Match([IO.File]::ReadAllText($gradleFile), 'versionName\s+"([^"]+)"')
    if (-not $match.Success) { throw 'Could not read Android versionName.' }
    $Version = $match.Groups[1].Value
}
$outputApk = Join-Path $repo "android\app\build\outputs\apk\release\Quacker-$Version.apk"
$inputApk = Join-Path $repo 'android\app\build\outputs\apk\release\app-release.apk'
$apksigner = Join-Path $androidHome 'build-tools\36.0.0\apksigner.bat'

try {
    $env:JAVA_HOME = $javaHome
    $env:ANDROID_HOME = $androidHome
    $env:PATH = "$javaHome\bin;$env:PATH"
    $env:FLUX_KEYSTORE_FILE = $oldKey
    $env:FLUX_KEYSTORE_PASSWORD = Read-DpapiPassword (Join-Path $secureDir 'flux-release-keystore-password.dpapi')
    $env:FLUX_KEY_PASSWORD = Read-DpapiPassword (Join-Path $secureDir 'flux-release-key-password.dpapi')
    $env:QUACKER_NEW_PASS = Read-DpapiPassword (Join-Path $secureDir 'quacker-release-2026-password.dpapi')

    & (Join-Path $repo 'android\gradlew.bat') --no-daemon "-Dorg.gradle.java.home=$javaHome" -p (Join-Path $repo 'android') assembleRelease
    if ($LASTEXITCODE -ne 0) { throw 'Gradle release build failed.' }
    if (-not (Test-Path $inputApk)) { throw 'Gradle did not produce app-release.apk.' }

    & $apksigner sign --ks $oldKey --ks-key-alias flux --ks-pass env:FLUX_KEYSTORE_PASSWORD --key-pass env:FLUX_KEY_PASSWORD --next-signer --ks $newKey --ks-key-alias quacker2026 --ks-pass env:QUACKER_NEW_PASS --key-pass env:QUACKER_NEW_PASS --lineage $lineage --rotation-min-sdk-version 28 --out $outputApk $inputApk
    if ($LASTEXITCODE -ne 0) { throw 'APK signing with the rotated lineage failed.' }

    foreach ($api in @(24, 28, 33)) {
        & $apksigner verify --min-sdk-version $api $outputApk
        if ($LASTEXITCODE -ne 0) { throw "APK signature verification failed for API $api." }
    }
    $hash = (Get-FileHash -Algorithm SHA256 $outputApk).Hash.ToLowerInvariant()
    $size = (Get-Item $outputApk).Length
    Write-Output "APK=$outputApk"
    Write-Output "SHA256=$hash"
    Write-Output "SIZE_BYTES=$size"
}
finally {
    Remove-Item Env:FLUX_KEYSTORE_FILE,Env:FLUX_KEYSTORE_PASSWORD,Env:FLUX_KEY_PASSWORD,Env:QUACKER_NEW_PASS -ErrorAction SilentlyContinue
}
