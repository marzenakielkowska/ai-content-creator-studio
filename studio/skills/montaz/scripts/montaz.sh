#!/bin/sh
# AI Content Creator Studio: wrapper skryptow montazowych na Macu.
#
# Uzycie:  sh montaz.sh <polecenie> [argumenty...]
#
# Polecenia:
#   transkrypcja <plik-wideo>
#   klatki-pozycja <plik-wideo>
#   klatki-sprawdzenie <plik-wideo>
#   sprawdz-dzwiek <plik-wideo>
#   tnij <plik-wideo> <cuts.json> <wyjscie.mp4>
#   render <projekt-dir> <wyjscie.mp4> [--draft]
#   overlay-image <plik-wideo> <config.json> <wyjscie.mp4>   (wymaga Python3 + Pillow)

set -u

TU=$(cd "$(dirname "$0")" && pwd)
DOM=${AI_STUDIO_HOME:-$HOME/.ai-content-studio}

# Znajdz Node
NODE=""
if [ -x "$DOM/node/bin/node" ]; then
  NODE="$DOM/node/bin/node"
elif command -v node >/dev/null 2>&1; then
  NODE=$(command -v node)
fi

if [ -z "$NODE" ]; then
  echo "STATUS blad Node nie jest zainstalowany - uruchom /studio:start"
  exit 1
fi

AI_STUDIO_HOME="$DOM" exec "$NODE" "$TU/montaz.mjs" "$@"
