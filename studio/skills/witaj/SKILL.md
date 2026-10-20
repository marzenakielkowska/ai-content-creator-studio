---
name: witaj
description: Sprawdza, czy wtyczka AI Content Creator Studio jest poprawnie zainstalowana. Użyj, gdy użytkownik wpisze /studio:witaj albo zapyta, czy Studio działa lub czy instalacja się udała.
---

# Test instalacji AI Content Creator Studio

Ta umiejętność potwierdza, że wtyczka została zainstalowana i Claude ją widzi. Nic nie instaluje, niczego nie pobiera
i nie zmienia żadnych plików na komputerze.

Gdy ją uruchomisz:

1. Odpowiedz po polsku, ciepło i krótko, prostym językiem dla osoby, która nigdy nie pracowała z kodem.
2. Potwierdź, że AI Content Creator Studio jest zainstalowane i działa.
3. Podaj numer wersji z pliku `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` (pole `version`). Jeśli nie możesz go
   odczytać, pomiń numer i nie zgaduj.
4. Powiedz w jednym zdaniu, co dalej: żeby przygotować komputer do montażu, wystarczy wpisać `/studio:start`.
   Montaż rolek jedną komendą pojawi się w kolejnych aktualizacjach tej samej wtyczki.
5. Nie wymieniaj nazw plików, ścieżek ani komend technicznych (poza `/studio:start`).

Przykład odpowiedzi:

> Wszystko działa. AI Content Creator Studio jest zainstalowane (wersja 0.2.0). Żeby przygotować komputer do montażu,
> wpisz /studio:start.
