# Pomiar i zapamiętywanie wzorców (`zbadaj-wzorzec`, `zapisz-wzorzec`, `lista-wzorcow`)

Gdy kursantka przynosi film referencyjny (rolka z Instagrama, Pinterestu lub plik lokalny), użyj `zbadaj-wzorzec`. Wynikiem są arkusze klatek i liczby do wizualnej analizy stylu.

**Na początku każdej sesji montażowej** sprawdź czy kursantka ma zapisane wzorce:

```sh
sh montaz.sh lista-wzorcow
```

Jeśli `WYNIK wzorzec nazwa=...` — powiedz co masz: „Mam zapisany efekt X i Y — chcesz użyć jednego z nich?". Jeśli `STATUS lista-wzorcow PUSTA` — nie wspominaj nic.

---

## Analiza rolki wzorcowej

```sh
sh montaz.sh zbadaj-wzorzec <plik-wideo-lub-url> <folder-wyjscia>
```

Pierwszym argumentem może być:
- ścieżka do lokalnego pliku MP4 / MOV
- bezpośredni URL do pliku MP4 (np. link z Apify po pobraniu z Instagrama)

Gdy podano URL: skrypt pobiera plik tymczasowo, robi analizę, **usuwa plik** — na dysku zostają tylko wyniki.

Wynik: `STATUS analizuj-wzorzec OK folder=<ścieżka>`

### Co powstaje w folderze

| Plik | Co zawiera |
|------|-----------|
| `arkusz_01.jpg`, `arkusz_02.jpg` ... | Siatka 4×5 klatek co 0.5s |
| `ciecia.jpg` | Klatki przy każdym cięciu montażowym |
| `ruch_01.jpg` ... | Klatki wokół nagłych wejść grafik/napisów |
| `pomiary.json` | Zmierzone liczby: fps, cięcia, ruch, głośność |

### Co zrobić po analizie

1. **Obejrzyj arkusze klatek** — oceń wizualnie co się dzieje w tym filmie
2. **Przeczytaj `pomiary.json`** — `sredni_odstep_s` to tempo, `momenty_ruchu_s` to kiedy coś wchodzi
3. **Zapytaj kursantkę** czy chce zachować ten wzorzec do późniejszego użycia

---

## Zapisanie wzorca do biblioteki

Gdy kursantka chce zachować efekt na przyszłość:

```sh
sh montaz.sh zapisz-wzorzec <folder-analizy> <nazwa>
```

`nazwa` to krótka, bez spacji, np. `split-screen`, `zoom-in-twarz`, `caps-zolty`.

Po uruchomieniu skrypt wypisze: `STATUS zapisz-wzorzec OK folder=~/.ai-content-studio/wzorce/<nazwa>/`

**Po wykonaniu — napisz `opis.md` do tego folderu.** Opis powinien zawierać:
- Co to za efekt (jednozdaniowo)
- Jak jest zbudowany (konkretnie: co się dzieje, timing, animacja)
- Jak go odtworzyć w montażu (jakie komendy, jakie parametry)

Przykład `opis.md`:
```
# Split-screen przed i po

Ekran dzielony pionowo w połowie: lewa strona to stan "przed", prawa "po".
Linia podziału wchodzi z prawej animacją 0.3s ease-out. Obie strony
wchodzą jednocześnie. Użyj HyperFrames z layoutem split-horizontal,
appear_t=0.5, anim_dur=0.3.
```

Wzorzec zostaje na dysku kursantki w `~/.ai-content-studio/wzorce/`. Nie jest wspólny — każda ma swoją bibliotekę.

---

## Korzystanie z zapisanego wzorca

Gdy kursantka mówi „chcę ten efekt co go zapisałam" albo „użyj split-screen":

1. Jeśli nie masz wyników `lista-wzorcow` — uruchom je teraz
2. Wczytaj `~/.ai-content-studio/wzorce/<nazwa>/opis.md`
3. Wczytaj `~/.ai-content-studio/wzorce/<nazwa>/pomiary.json`
4. Odtwórz efekt według opisu — bez potrzeby ponownej analizy, bez linku

---

## Ograniczenia

- Folder `~/.ai-content-studio/wzorce/` istnieje tylko na lokalnej maszynie — nowy komputer = pusta biblioteka
- Opis efektu jest tak dokładny jak to co Claude napisał — warto sprawdzić `opis.md` przed użyciem
- Wzorce z Lookbooka są osobne — `lista-wzorcow` pokazuje tylko te zapisane lokalnie przez kursantkę
