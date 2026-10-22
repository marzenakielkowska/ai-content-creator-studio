# AI Content Creator Studio: wrapper skryptow montazowych na Windows.
#
# Uzycie:  powershell -NoProfile -ExecutionPolicy Bypass -File montaz.ps1 <polecenie> [argumenty...]
#
# Polecenia:
#   transkrypcja <plik-wideo>
#   klatki-pozycja <plik-wideo>
#   klatki-sprawdzenie <plik-wideo>
#   sprawdz-dzwiek <plik-wideo>
#   tnij <plik-wideo> <cuts.json> <wyjscie.mp4>
#   render <projekt-dir> <wyjscie.mp4> [--draft]
#   overlay-image <plik-wideo> <config.json> <wyjscie.mp4>   (wymaga Python3 + Pillow)

$ErrorActionPreference = "Stop"

$TU = Split-Path -Parent $MyInvocation.MyCommand.Path
$DOM = if ($env:AI_STUDIO_HOME) { $env:AI_STUDIO_HOME } else { Join-Path $HOME ".ai-content-studio" }

# Znajdz Node
$NODE = $null
$kandydatNode = Join-Path $DOM "node\node.exe"
if (Test-Path $kandydatNode) {
    $NODE = $kandydatNode
} else {
    try { $NODE = (Get-Command node -ErrorAction Stop).Source } catch { }
}

if (-not $NODE) {
    Write-Output "STATUS blad Node nie jest zainstalowany - uruchom /studio:start"
    exit 1
}

$env:AI_STUDIO_HOME = $DOM
& $NODE (Join-Path $TU "montaz.mjs") @args
exit $LASTEXITCODE
