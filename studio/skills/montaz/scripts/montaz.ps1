# AI Content Creator Studio: wrapper skryptow montazowych na Windows.
#
# Uzycie:  powershell -NoProfile -ExecutionPolicy Bypass -File montaz.ps1 <polecenie> [argumenty...]
#
# Polecenia i opis: naglowek montaz.mjs (wczytaj, pauzy, zloz, transkrypcja, wytnij-tlo, glowa,
# strefa, sprawdz-ciecia, glosnosc).

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
