# AI Content Creator Studio: wrapper sprzatania na Windows.
#
# Uzycie:  powershell -NoProfile -ExecutionPolicy Bypass -File sprzatanie.ps1 <polecenie> [argumenty...]
#
# Polecenia i opis: naglowek sprzatanie.mjs (pokaz, usun, miejsce, projekty, porzadek-ustaw).

$ErrorActionPreference = "Stop"

$TU = Split-Path -Parent $MyInvocation.MyCommand.Path
$DOM = if ($env:AI_STUDIO_HOME) { $env:AI_STUDIO_HOME } else { Join-Path $HOME ".ai-content-studio" }

# Znajdz Node
$NODE = $null
$kandydatNode = Join-Path $DOM "node\node.exe"
if (Test-Path $kandydatNode) {
    # Windows nie usunie programu, ktory wlasnie dziala, a ten Node lezy w folderze Studio.
    # Uruchamiamy wiec jego kopie z folderu tymczasowego.
    $NODE = Join-Path ([System.IO.Path]::GetTempPath()) "ai-studio-sprzatanie-node.exe"
    Copy-Item -Force $kandydatNode $NODE
} else {
    try { $NODE = (Get-Command node -ErrorAction Stop).Source } catch { }
}

if (-not $NODE) {
    Write-Output "STATUS blad Node nie jest zainstalowany - nie ma czego sprzatac w folderze Studio"
    exit 1
}

$env:AI_STUDIO_HOME = $DOM
& $NODE (Join-Path $TU "sprzatanie.mjs") @args
exit $LASTEXITCODE
