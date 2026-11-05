#!/bin/sh
# AI Content Creator Studio: przygotowanie srodowiska na Macu (Linux tylko do testow).
#
# Uzycie:  sh start.sh sprawdz              co jest, czego brakuje (niczego nie pobiera)
#          sh start.sh instaluj             pobiera brakujace narzedzia
#          sh start.sh ustaw --nagrania <folder> --projekty <folder>
#          sh start.sh test                 sprawdza, czy wszystko dziala
#          sh start.sh aktualizuj           raz na dobe sprawdza aktualizacje (po cichu)
#
# Ten skrypt dba tylko o Node (bez Node nie da sie uruchomic reszty). Reszte robi przygotuj.mjs.
# Wszystko trafia do jednego folderu (domyslnie ~/.ai-content-studio). Bez hasla administratora,
# bez zmian w systemie. Wypisuje linie "STATUS ...", ktore Claude tlumaczy kursantowi.

set -u
NODE_LINIA=22

TU=$(cd "$(dirname "$0")" && pwd)
DOM=${AI_STUDIO_HOME:-$HOME/.ai-content-studio}
TRYB=${1:-sprawdz}
mkdir -p "$DOM/pobrane"

blad() { echo "STATUS blad $*"; exit 1; }

node_wystarczy() {
  [ -n "$1" ] && "$1" -e "process.exit(Number(process.versions.node.split('.')[0]) >= $NODE_LINIA ? 0 : 1)" >/dev/null 2>&1
}

znajdz_node() {
  NODE=""
  ZRODLO=""
  if node_wystarczy "$DOM/node/bin/node"; then
    NODE="$DOM/node/bin/node"; ZRODLO=studio; return 0
  fi
  SYS=$(command -v node 2>/dev/null || true)
  if node_wystarczy "$SYS"; then
    NODE="$SYS"; ZRODLO=system; return 0
  fi
  return 1
}

suma_sha256() {
  if command -v shasum >/dev/null 2>&1; then shasum -a 256 "$1" | cut -d' ' -f1
  else sha256sum "$1" | cut -d' ' -f1
  fi
}

pobierz_node() {
  case $(uname -s) in
    Darwin) OS=darwin ;;
    Linux) OS=linux ;;
    *) blad "system $(uname -s) nieobslugiwany" ;;
  esac
  case $(uname -m) in
    arm64|aarch64) ARCH=arm64 ;;
    x86_64|amd64) ARCH=x64 ;;
    *) blad "procesor $(uname -m) nieobslugiwany" ;;
  esac
  BAZA="https://nodejs.org/dist/latest-v$NODE_LINIA.x"
  echo "KROK node pobieram (okolo 50 MB)"
  LISTA=$(curl -fsSL --retry 3 --connect-timeout 20 "$BAZA/SHASUMS256.txt") || blad "node nie udalo sie pobrac listy wersji (sprawdz internet)"
  LINIA=$(printf '%s\n' "$LISTA" | grep " node-v[0-9.]*-$OS-$ARCH\.tar\.gz\$" | head -n 1)
  [ -n "$LINIA" ] || blad "node brak paczki dla $OS-$ARCH"
  SUMA=${LINIA%% *}
  PLIK=${LINIA##* }
  CEL="$DOM/pobrane/$PLIK"
  curl -fSL --retry 3 --connect-timeout 20 --speed-limit 1024 --speed-time 60 -o "$CEL.czesc" "$BAZA/$PLIK" 2>/dev/null \
    || blad "node pobieranie przerwane (sprawdz internet i uruchom ponownie)"
  [ "$(suma_sha256 "$CEL.czesc")" = "$SUMA" ] || { rm -f "$CEL.czesc"; blad "node plik uszkodzony (suma kontrolna sie nie zgadza), uruchom ponownie"; }
  rm -rf "$DOM/pobrane/node-rozpakowany" "$DOM/node"
  mkdir -p "$DOM/pobrane/node-rozpakowany"
  tar -xzf "$CEL.czesc" -C "$DOM/pobrane/node-rozpakowany" || blad "node nie udalo sie rozpakowac"
  mv "$DOM/pobrane/node-rozpakowany"/node-v* "$DOM/node" || blad "node nie udalo sie przeniesc"
  rm -rf "$CEL.czesc" "$DOM/pobrane/node-rozpakowany"
  echo "KROK node gotowe"
}

if ! znajdz_node; then
  if [ "$TRYB" = "instaluj" ]; then
    pobierz_node
    znajdz_node || blad "node po instalacji nadal nie dziala"
  else
    # Bez Node nie sprawdzimy reszty. Mowimy, co wiemy, i konczymy.
    echo "STATUS system $(uname -s) $(uname -m)"
    echo "STATUS node BRAK"
    for n in ffmpeg hyperframes przegladarka transkrypcja; do echo "STATUS $n NIEZNANE"; done
    if [ -f "$DOM/ustawienia.json" ]; then echo "STATUS ustawienia OK"; else echo "STATUS ustawienia BRAK"; fi
    echo "STATUS do_pobrania_mb 1200"
    echo "WYNIK NIEGOTOWE"
    exit 0
  fi
fi

AI_STUDIO_HOME="$DOM" STUDIO_NODE_ZRODLO="$ZRODLO" exec "$NODE" "$TU/przygotuj.mjs" "$@"
