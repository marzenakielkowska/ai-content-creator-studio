#!/bin/sh
# AI Content Creator Studio: wrapper sprzatania na Macu.
#
# Uzycie:  sh sprzatanie.sh <polecenie> [argumenty...]
#
# Polecenia i opis: naglowek sprzatanie.mjs (pokaz, usun, miejsce, projekty, porzadek-ustaw).

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
  echo "STATUS blad Node nie jest zainstalowany - nie ma czego sprzatac w folderze Studio"
  exit 1
fi

AI_STUDIO_HOME="$DOM" exec "$NODE" "$TU/sprzatanie.mjs" "$@"
