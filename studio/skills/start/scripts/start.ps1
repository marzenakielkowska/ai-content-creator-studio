# AI Content Creator Studio: przygotowanie srodowiska na Windowsie.
#
# Uzycie (z Claude Code):
#   powershell -NoProfile -ExecutionPolicy Bypass -File "<folder>\start.ps1" sprawdz
#   ... instaluj | ustaw --nagrania <folder> --projekty <folder> | test
#
# Ten skrypt dba tylko o Node (bez Node nie da sie uruchomic reszty). Reszte robi przygotuj.mjs.
# Wszystko trafia do jednego folderu (domyslnie %USERPROFILE%\.ai-content-studio). Bez uprawnien
# administratora, bez zmian w systemie. Plik celowo bez polskich znakow (Windows PowerShell 5.1).

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
} catch {}

$NodeLinia = 22
$Tu = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($env:AI_STUDIO_HOME) { $Dom = $env:AI_STUDIO_HOME } else { $Dom = Join-Path $env:USERPROFILE '.ai-content-studio' }
$Tryb = if ($args.Count -gt 0) { [string]$args[0] } else { 'sprawdz' }
New-Item -ItemType Directory -Force -Path (Join-Path $Dom 'pobrane') | Out-Null

function Blad([string]$tekst) {
  Write-Output "STATUS blad $tekst"
  exit 1
}

function NodeWystarczy([string]$sciezka) {
  if (-not $sciezka -or -not (Test-Path -LiteralPath $sciezka)) { return $false }
  # Lokalnie 'Continue': w Windows PowerShell 5.1 tekst na stderr przy 'Stop' przerwalby sprawdzenie.
  $ErrorActionPreference = 'Continue'
  try {
    & $sciezka -e "process.exit(Number(process.versions.node.split('.')[0]) >= $NodeLinia ? 0 : 1)" 2>$null | Out-Null
    return ($LASTEXITCODE -eq 0)
  } catch { return $false }
}

function ZnajdzNode {
  $wlasny = Join-Path $Dom 'node\node.exe'
  if (NodeWystarczy $wlasny) { return @{ Sciezka = $wlasny; Zrodlo = 'studio' } }
  $sys = Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($sys -and (NodeWystarczy $sys.Path)) { return @{ Sciezka = $sys.Path; Zrodlo = 'system' } }
  return $null
}

function Architektura {
  $a = $env:PROCESSOR_ARCHITEW6432
  if (-not $a) { $a = $env:PROCESSOR_ARCHITECTURE }
  switch ($a) {
    'ARM64' { return 'arm64' }
    'AMD64' { return 'x64' }
    default { Blad "procesor $a nieobslugiwany" }
  }
}

function PobierzNode {
  $arch = Architektura
  $baza = "https://nodejs.org/dist/latest-v$NodeLinia.x"
  Write-Output 'KROK node pobieram (okolo 50 MB)'
  try { $lista = (Invoke-WebRequest -UseBasicParsing -Uri "$baza/SHASUMS256.txt").Content }
  catch { Blad 'node nie udalo sie pobrac listy wersji (sprawdz internet)' }
  $linia = ($lista -split "`n") | Where-Object { $_ -match " node-v[0-9.]+-win-$arch\.zip\s*$" } | Select-Object -First 1
  if (-not $linia) { Blad "node brak paczki dla win-$arch" }
  $czesci = $linia.Trim() -split '\s+'
  $suma = $czesci[0].ToLower()
  $plik = $czesci[-1]
  $cel = Join-Path $Dom "pobrane\$plik"
  try { Invoke-WebRequest -UseBasicParsing -Uri "$baza/$plik" -OutFile $cel }
  catch { Blad 'node pobieranie przerwane (sprawdz internet i uruchom ponownie)' }
  if ((Get-FileHash -Algorithm SHA256 -LiteralPath $cel).Hash.ToLower() -ne $suma) {
    Remove-Item -Force -LiteralPath $cel
    Blad 'node plik uszkodzony (suma kontrolna sie nie zgadza), uruchom ponownie'
  }
  $tmp = Join-Path $Dom 'pobrane\node-rozpakowany'
  $docelowy = Join-Path $Dom 'node'
  if (Test-Path -LiteralPath $tmp) { Remove-Item -Recurse -Force -LiteralPath $tmp }
  if (Test-Path -LiteralPath $docelowy) { Remove-Item -Recurse -Force -LiteralPath $docelowy }
  try { Expand-Archive -LiteralPath $cel -DestinationPath $tmp -Force }
  catch { Blad 'node nie udalo sie rozpakowac' }
  $srodek = Get-ChildItem -LiteralPath $tmp -Directory | Where-Object { $_.Name -like 'node-v*' } | Select-Object -First 1
  if (-not $srodek) { Blad 'node rozpakowana paczka ma nieoczekiwany uklad' }
  Move-Item -LiteralPath $srodek.FullName -Destination $docelowy
  Remove-Item -Recurse -Force -LiteralPath $tmp
  Remove-Item -Force -LiteralPath $cel
  Write-Output 'KROK node gotowe'
}

$node = ZnajdzNode
if (-not $node) {
  if ($Tryb -eq 'instaluj') {
    PobierzNode
    $node = ZnajdzNode
    if (-not $node) { Blad 'node po instalacji nadal nie dziala' }
  } else {
    Write-Output "STATUS system Windows $(Architektura)"
    Write-Output 'STATUS node BRAK'
    foreach ($n in 'ffmpeg', 'hyperframes', 'przegladarka', 'transkrypcja') { Write-Output "STATUS $n NIEZNANE" }
    if (Test-Path -LiteralPath (Join-Path $Dom 'ustawienia.json')) { Write-Output 'STATUS ustawienia OK' } else { Write-Output 'STATUS ustawienia BRAK' }
    Write-Output 'STATUS do_pobrania_mb 1200'
    Write-Output 'WYNIK NIEGOTOWE'
    exit 0
  }
}

$env:AI_STUDIO_HOME = $Dom
$env:STUDIO_NODE_ZRODLO = $node.Zrodlo
# Komunikaty Node na stderr nie moga zatrzymac skryptu (Windows PowerShell 5.1).
$ErrorActionPreference = 'Continue'
& $node.Sciezka (Join-Path $Tu 'przygotuj.mjs') @args
exit $LASTEXITCODE
