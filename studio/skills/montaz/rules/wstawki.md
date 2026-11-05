# Animowane wstawki (aplikacja na ekranie, profil, czat, plik)

Claude czyta ten plik, gdy plan montażu ma animowaną wstawkę: odtworzenie aplikacji, profil z przyciskiem
„Obserwuj”, rozmowa z AI, przewijany plik, powiadomienie. Wygląd każdej wstawki opisuje `PRZEPIS.md` jej efektu
w Lookbooku (np. `czat-z-ai`, `makieta-telefonu`, `live-profile-cta`, `profil-na-zywo`, `swiat-interfejsu`).

## Po kolei czy równolegle

- **Jedna wstawka albo proste nakładki** (karta, lista, liczba): buduj sama, w głównej kompozycji.
- **Dwie lub więcej złożonych wstawek** (każda to osobna mini-scena z własną animacją): buduj je **równolegle**,
  każdą przez osobnego pomocnika (narzędzie Agent, w tle). Główna rolka powstaje w tym czasie. To skraca montaż
  o kilkanaście minut, a każdy pomocnik skupia się na jednej scenie, więc wychodzi staranniej.
- Kursantce mów tylko: „Buduję animacje w tle, w tym czasie składam rolkę”. Bez szczegółów technicznych.

## Jak (równolegle)

1. **Najpierw zablokuj czasy.** Plan cięć zatwierdzony, `zloz` i `transkrypcja` zrobione. Każda wstawka zaczyna się
   w znanym momencie rolki; jej wewnętrzne czasy = czas słowa z `slowa.json` minus ten moment.
2. **Każdy pomocnik w swoim folderze:** `<projekt>/wstawki/<nazwa>/`. Niczego poza nim nie rusza.
3. **Wynik każdego:** przezroczysty WebM (VP9 z kanałem alfa), stały rozmiar i długość, 30 klatek/s. Główna
   kompozycja wstawia go jako `<video>` w opakowaniu (`div` z pozycją, skalą, przechyleniem).
4. **Gdy pomocnik skończy,** przeczytaj jego uwagi (to, co oznaczy jako „może wyglądać dziwnie”, zwykle jest
   prawdziwe). Poprawki odsyłaj temu samemu pomocnikowi (SendMessage), zamiast budować od nowa.

## Zlecenie dla pomocnika (wypełnij każde pole — konkrety robią jakość)

```
Zbuduj JEDEN krótki animowany klip w HyperFrames: [co pokazuje]. Leci w rolce na Instagramie, gdy mówiąca
mówi „[linia]”, więc ma wyglądać dopracowanie, realistycznie i być czytelny na telefonie.

Folder pracy: [projekt]/wstawki/[nazwa]/ (nic poza nim). Materiały: [pliki]. Narzędzia: Node [ścieżka node],
HyperFrames [ścieżka hyperframes] z narzedzia.json (uruchamiaj: "<node>" "<hyperframes>" <polecenie>, ze zmiennymi
HYPERFRAMES_FFMPEG_PATH i HYPERFRAMES_FFPROBE_PATH ustawionymi na ffmpeg i ffprobe z narzedzia.json).
Zasady i znane pułapki: [ścieżka]/rules/pulapki.md i rules/ruch.md — przeczytaj przed budową.

Wynik: kompozycja [szer × wys], przezroczyste tło poza [oknem/kartą] z zaokrągleniem ~[R] px. Długość [D] s,
30 kl/s. Render do renders/[nazwa].webm w formacie webm z kanałem alfa. Sprawdź przezroczystość: ffprobe pokazuje
alpha_mode=1, a narożnik zdekodowanej klatki (dekoder libvpx-vp9) jest przezroczysty.

Wygląd: [kolory i czcionki ze stylu kursantki, prawdziwe dane do pokazania, ogólne wymyślone nazwy dla wszystkiego,
co nie jest prawdziwe; bez kopiowania cudzych logotypów]. Kluczowy tekst co najmniej 24 px w docelowym rozmiarze.

Oś czasu (sekundy od początku klipu, zgodnie z głosem, ±0,05 s): [lista momentów].

Kolejność: lint (0 błędów) → snapshot i OBEJRZYJ podglądy → render. Pliki tekstowe zapisuj w UTF-8. Nic nie usuwaj.

Odpowiedz: ścieżka pliku, dokładna długość, potwierdzona przezroczystość, rzeczywiste czasy momentów (do efektów
dźwiękowych), wszystko, co może wyglądać dziwnie.
```
