# Zasady sprawdzania

Claude czyta ten plik przed każdym sprawdzeniem i przed oddaniem rolki. Gdy kursantka da uwagę, jedna z tych zasad
zostaje PRZEPISANA (nie dopisujesz nowej obok).

## Jak sprawdzać

- **Podglądy w trakcie budowy:** `snapshot` w 10–20 momentach (wejścia grafik, cięcia, wezwanie do działania), potem
  `strefa <podglądy>` — czerwone pola to miejsca zajęte przez interfejs Reels. Nic ważnego nie może w nie wchodzić.
  Nie oceniaj strefy na oko.
- **Tempo, przed renderem:** przejrzyj plan sekunda po sekundzie. Fragment dłuższy niż około 3 s bez cięcia, nowej
  grafiki i zmiany napisów to do poprawy.
- **Wycięcie, przed renderem:** `kontrola-wyciecia <projekt>`, oba arkusze, każde okno. Na gładkim płótnie widać
  wszystko: plamy tła, resztki mebli, otoczkę przy włosach, ucięte włosy, ucięty palec. Mały arkusz pokazuje plamy
  i migotanie, duży brzeg włosów i ramion. Potem obejrzyj klatkę, na której osoba unosi dłoń albo pochyla się: wtedy
  wycięcie psuje się najczęściej.
- **Polskie litery w zbliżeniu, przed renderem:** każdy tekst z ą, ć, ę, ł, ń, ó, ś, ź, ż (nagłówek, karta, napisy;
  co najmniej jeden na każdą parę czcionka + grubość) obejrzyj przez `snapshot --at <czas> --zoom "<selektor>"`.
  Każda polska litera ma tę samą grubość i krój co reszta słowa. Litera cieńsza albo w innym kroju = czcionka bez
  polskich znaków: zmień grubość albo czcionkę według `pulapki.md` („Polskie znaki”) i obejrzyj jeszcze raz.
- **Cięcia sprawdzaj tylko na gotowym renderze**, nie na podglądach: podglądy przy cięciach potrafią pokazać klatkę
  z sąsiedniego ujęcia. `sprawdz-ciecia <projekt> <render.mp4>` robi arkusz `work/kontrola-ciec.jpg`:
  pary klatek czytane wierszami, po 5 par w rzędzie. Klatka z żółtym paskiem to ostatnia przed cięciem, następna po
  prawej to pierwsza po nim. Ta druga musi pokazywać już nowe ujęcie, z grafikami tej sekcji, bez resztek poprzedniej
  (karta, napis, sylwetka z poprzedniego ujęcia) i bez mignięcia płótna, które ma wjechać dopiero później.
- Mów, co widzisz, z podaniem czasu: „grafika o 8,2 s zakrywa brodę”. Nigdy „wygląda dobrze”.
- Zanim nazwiesz coś błędem, obejrzyj jedną pełną klatkę w tym miejscu. Miniatury potrafią mylić.
- Synchronizacja ust: wybierz 5 momentów i porównaj kształt ust z napisem.
- Popraw → nowy render (nowa nazwa: `-v002`, `-v003`…) → sprawdź ponownie. Dopiero potem pokaż kursantce.

## 8 defektów do wyłapania

1. **Animacja odgrywa się dwa razy** — grafika lub napis wchodzi, wychodzi i wchodzi jeszcze raz.
2. **Mignięcie krótsze niż 0,5 s** — grafika błyska albo obraz skacze przez jedną klatkę.
3. **Tekst pojawia się za późno** — widoczny zbyt krótko, żeby go przeczytać.
4. **Grafika zakrywa twarz** — cokolwiek zachodzi na oczy, nos, usta lub brodę.
5. **Słowo powiedziane dwa razy** — zostało przy cięciu zamiast wypaść.
6. **Ruch ust nie zgadza się z głosem.**
7. **Prześwit w wycięciu** — plama tła, kawałek mebla przy włosach, półprzezroczysty koniec grafiki.
8. **Napis na brodzie** — w przybliżeniu napis wchodzi na brodę lub usta.

## Rzeczy, które muszą być OK

| Co sprawdzam | Kiedy nie przechodzi | Co robić |
|---|---|---|
| Nic nie zakrywa twarzy | napis, karta lub tytuł zachodzi na oczy, nos, usta, brodę | przesuń (pozycje z `glowa.json`), zmniejsz albo użyj wycięcia z tła |
| Wycięcie czyste | plama tła, ucięte włosy, ucięta dłoń na `kontrola-wyciecia.jpg` albo na klatce | `rules/pulapki.md`, „Wycięcie z tła” |
| Strefa bezpieczna | coś wchodzi w czerwone pole na podglądzie `strefa` | skróć tekst, zmniejsz, przesuń albo usuń |
| Tekst czytelny | jasny tekst na jasnym tle; słowo za głową zasłonięte w więcej niż ~30% | cień lub tło pod tekstem; słowo za głową wyżej albo przed osobą |
| Cięcia czyste | na `kontrola-ciec.jpg` po cięciu widać coś z poprzedniego ujęcia | czas tej grafiki z `segmenty.json` (pole `start`), nie zaokrąglony |

## Dźwięk

- `sprawdz-ciecia` podaje głośność. Cel: około −14 LUFS, szczyt od −5 do −1 dB. Ciszej — podnieś głos w miksie;
  szczyt powyżej −1 dB — ścisz.
- Posłuchaj każdego cięcia: bez kliknięć, bez uciętej końcówki słowa.

## Oddanie

- Oddajesz jeden plik w pełnej jakości: ten do publikacji. Lekką kopię 720p (`--telefon`, plik `-telefon.mp4`)
  robisz tylko na prośbę kursantki.
- Starsze wersje i pliki robocze sprząta porządek w projekcie (`SKILL.md`, „Porządek w projekcie”). Sam niczego
  nie kasujesz.

## Po znalezieniu problemu

- Napraw, zrób nowy render, sprawdź to miejsce jeszcze raz.
- Jeśli po jednej próbie naprawy dalej nie wychodzi — usuń ten element i powiedz kursantce w jednym zdaniu, co
  i dlaczego zostało usunięte. Czysty film bez efektu jest lepszy niż film z zepsutym efektem.
