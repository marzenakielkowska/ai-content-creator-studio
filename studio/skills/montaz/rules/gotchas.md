# Znane błędy — HyperFrames i FFmpeg

Ten plik czyta Claude gdy coś nie działa. Kursantka nie widzi tego pliku.
Zanim zaczniesz debugować losowo — sprawdź czy błąd pasuje do jednego z poniższych.

---

## HyperFrames

### Czarny ekran lub zamrożony render

**Objaw:** render się uruchamia, postęp jest, ale wynik to czarny ekran lub pierwsza klatka zamrożona przez cały czas.

**Przyczyna 1:** Element `<video>` nie ma atrybutu `id`.
**Rozwiązanie:** Dodaj `id="video-main"` (lub dowolny unikalny id) do każdego elementu `<video>`.

**Przyczyna 2:** Animacja CSS zaczyna się od `opacity: 0` — renderer traktuje to jako nieistniejący element.
**Rozwiązanie:** Zacznij od `opacity: 0.01` zamiast `0`.

---

### Tekst wyświetla się inną czcionką niż wybrana

**Objaw:** Tekst pojawia się w systemowej czcionce (Arial/sans-serif), nie w Google Fonts.

**Przyczyna:** Czcionka nie zdążyła się załadować przed renderem.
**Rozwiązanie:** Dodaj preload link w `<head>`:
```html
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;700&display=swap" as="style">
```
Zawsze używaj `display=swap` w URL Google Fonts.

---

### Tekst rozmazany lub pikselowany po skalowaniu

**Objaw:** Napis wygląda ostro w przeglądarce, ale w rendzie jest rozmazany.

**Przyczyna:** `transform: scale()` na tekście — renderer renderuje w małym rozmiarze i powiększa bitmapowo.
**Rozwiązanie:** Zamiast skalować element, ustaw większy `font-size` bezpośrednio.

---

### Animacja nie działa

**Objaw:** Element pojawia się bez animacji wejścia/wyjścia.

**Przyczyna:** HyperFrames nie obsługuje animacji JavaScript (`requestAnimationFrame`, `setTimeout`, biblioteki JS).
**Rozwiązanie:** Wszystkie animacje muszą być CSS (`@keyframes`, `transition`). Tylko CSS animacje są gwarantowane.

---

### Render przekroczył czas (timeout)

**Objaw:** Błąd "render timeout" lub "process killed after 30s".

**Przyczyna:** Za dużo elementów, za długa scena, albo pętla nieskończona w CSS.
**Rozwiązanie:**
1. Skróć pojedynczą scenę do max 15 sekund.
2. Sprawdź czy `animation-iteration-count` nie jest ustawione na `infinite`.
3. Zmniejsz liczbę warstw.

---

### Wideo nie synchronizuje się z animacjami

**Objaw:** Napisy lub grafiki pojawiają się w złym momencie względem obrazu.

**Przyczyna:** HyperFrames oblicza czas w klatkach (frames), nie w sekundach. Przy 30fps: 1s = 30 klatek.
**Rozwiązanie:** Zawsze przeliczaj: `klatka = Math.round(czas_w_sekundach * 30)`.

---

## FFmpeg

### Błąd filtrów na Windows

**Objaw:** Błąd `Invalid option or argument` albo `No such file or directory` przy użyciu `-filter_complex` lub `-vf`.

**Przyczyna:** Windows ścieżki z `C:\` psują składnię filtrów. Backslash (`\`) jest znakiem specjalnym w FFmpeg.
**Rozwiązanie:** Zamień backslash na forward slash: `C:/Users/...` zamiast `C:\Users\...`. W Node.js użyj `path.replace(/\\/g, '/')`.

---

### Nie można łączyć `-vf` i `-af` jednocześnie

**Objaw:** Błąd `Filtergraph has too many inputs` lub ignorowanie jednego filtra.

**Przyczyna:** Nie można używać `-vf` i `-af` razem gdy jedno wideo ma być wynikiem.
**Rozwiązanie:** Użyj `-filter_complex` zamiast obu:
```
-filter_complex "[0:v]scale=1080:1920[v];[0:a]loudnorm[a]" -map "[v]" -map "[a]"
```

---

### Plik WebM bez przezroczystości

**Objaw:** Grafika nakładana na wideo ma czarne tło zamiast przezroczystości.

**Przyczyna:** WebM kodowany bez kanału alpha.
**Rozwiązanie:** Dodaj flagę przy kodowaniu:
```
-c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0
```

---

### FFmpeg kończy się kodem błędu 1 mimo sukcesu

**Objaw:** FFmpeg wyświetla `Exiting normally` ale `$?` zwraca `1`.

**Przyczyna:** Znany bug w niektórych wersjach FFmpeg przy filtrowaniu.
**Rozwiązanie:** Sprawdź czy plik wyjściowy istnieje i ma rozmiar > 0. Jeśli tak — render się udał, zignoruj kod wyjścia.
```js
const { size } = fs.statSync(outputPath);
if (size > 0) { /* OK */ }
```

---

### Pliki .ass z polskimi znakami wyświetlają się źle

**Objaw:** Litery ą, ę, ś, ó, ć pojawiają się jako `?` lub są pomijane.

**Przyczyna:** Plik .ass zapisany w kodowaniu innym niż UTF-8.
**Rozwiązanie:** Zawsze zapisuj pliki .ass z `encoding: 'utf8'` w Node.js. Na Windows sprawdź też czy edytor nie dodaje BOM — FFmpeg go nie lubi: usuń BOM przy zapisie.

---

### Szukanie klatki `-ss` jest niedokładne

**Objaw:** Wyciągnięta klatka jest z innego momentu niż podano.

**Przyczyna:** `-ss` przed `-i` jest szybkie ale niedokładne (szuka do najbliższego keyframe).
**Rozwiązanie:** Użyj `-ss` PO `-i` dla precyzji (wolniejsze, ale dokładne co do klatki):
```
ffmpeg -i input.mp4 -ss 00:00:05.000 -frames:v 1 output.jpg
```
Przy ekstrakcji klatek do sprawdzenia — tu dokładność jest ważna.
