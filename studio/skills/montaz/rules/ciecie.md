# Zasady cięcia

Claude czyta ten plik przed każdym planem cięć. Kursantka go nie widzi. Gdy kursantka da uwagę, jedna z tych zasad
zostaje PRZEPISANA (nie dopisujesz nowej obok).

## Skąd brać czasy

- `transkrypt.txt` (z `wczytaj`) daje tekst każdego nagrania z czasami, dzielony na pauzach. Czasy słów są w
  `work/slowa_kN.json`, a pomiar ciszy w `work/cisze_kN.json`.
- **Transkrypcja myli się w czasach o 0,1–0,3 s**, a koniec słowa często zawyża. Przed ustaleniem każdego cięcia
  potwierdź pauzę pomiarem: `pauzy <nagranie> <od> <do>`.
- **Program do transkrypcji dopisuje czasem słowo na początku fragmentu** (np. „Nie, nie zatrudniłam”), którego
  w nagraniu nie ma. Gdy początek linii brzmi podejrzanie, sprawdź `pauzy` w tym miejscu.

## Wybór ujęć

- **Zostaw ostatnie czyste ujęcie.** Ludzie powtarzają zdanie, aż wyjdzie. Gdy linia była powiedziana kilka razy,
  także w różnych nagraniach, bierz ostatnią pełną wersję, chyba że kursantka wskaże inną („lepsza wersja zaczyna
  się od 0:47” = jedno ciągłe ujęcie od tego miejsca).
- **Podwójne słowo albo zdanie zaczęte od nowa:** zostaw tylko ostatnie czyste.
- **Kilka nagrań naraz:** traktuj je jak jeden materiał. Scenariusz budujesz z najlepszych ujęć ze wszystkich
  nagrań (`k1`, `k2`…), w kolejności, w jakiej mają paść w rolce.
- **Gdy nie wiesz, czy to powtórka — zostaw i powiedz kursantce.**
- Widz nigdy nie widzi, jak kursantka sięga po telefon albo poprawia kamerę. Sprawdź to na arkuszach klatek
  (`work/arkusz_kN.jpg`).

## Punkty cięcia

- **Początek:** 0,05–0,07 s przed pierwszym słowem.
- **Koniec:** na początku ciszy po ostatnim słowie (z `pauzy`), nie na końcu słowa z transkrypcji.
- **Nigdy nie tnij w środku słowa.** Cisza wewnątrz słowa to nie pauza: przed spółgłoskami „t, k, p, b, d, g”
  głos na chwilę milknie („szyb-ko”). Gdy coś brzmi jak urwane słowo, sprawdź, zanim wytniesz.
- **Pauza dłuższa niż 0,6 s:** skróć, zostaw około ćwierć sekundy, żeby brzmiało naturalnie.
- **Martwe powietrze między sekcjami wycinaj w całości.**

## Przybliżenia

- **Dwa segmenty pod rząd z tego samego ujęcia wyglądają jak skok.** Na jednym z nich daj przybliżenie
  `zoom` 1,3–1,9, ze środkiem na klatce piersiowej / twarzy (`cx` 0,5, `cy` około 0,35–0,45). Wtedy cięcie wygląda
  jak zmiana planu.
- Nagranie 4K znosi przybliżenie do 1,9 bez utraty ostrości; nagranie 1080p — najwyżej około 1,3.
- Gdy kursantka wybrała w Lookbooku `zoom: bez`, nie dawaj przybliżeń, łącz takie segmenty albo zostaw skok.

## Plan cięć (edl.json)

```json
[
  {"id": "hak", "klip": "k1", "od": 12.66, "do": 15.72, "tekst": "…"},
  {"id": "dowod", "klip": "k2", "od": 3.13, "do": 6.86, "zoom": 1.4, "cx": 0.5, "cy": 0.4, "tekst": "…"}
]
```

- Pokaż kursantce plan jako krótką tabelę (sekcja, tekst, nagranie, przybliżenie) i **czekaj na OK** przed `zloz`.
- `zloz` robi z tego `assets/aroll.mp4` (1080×1920, równe 30 klatek/s od zera) i `segmenty.json` z dokładną
  klatką każdego cięcia. Z tych liczb biorą się wszystkie czasy cięć w animacjach.
- Po każdej zmianie planu: `zloz` od nowa, potem `transkrypcja` (czasy słów na nowej rolce), a jeśli była
  sylwetka — `wytnij-tlo` od nowa. Stare czasy słów po zmianie cięć są nieaktualne.

## Dźwięk

- `zloz` daje 10–12 ms wyciszenia na brzegach każdego segmentu, żeby cięcie nie klikało.
- Po montażu: `glosnosc`. Cel: około −14 LUFS, szczyt nie wyżej niż −1 dB. Efekty dźwiękowe zawsze ciszej niż głos.
