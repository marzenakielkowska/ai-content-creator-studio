> ⚠️ **Sprawdzenie twarzy:** pole komentarza i odpowiedź nad głową, wezwanie pod brodą (od `broda + 30` po przybliżeniu); wielkie słowo spada nad głową, nie przez twarz. Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Spadający komentarz

**Co robi:** na słowie „skomentuj” pod brodą wskakuje wezwanie z hasłem („Skomentuj STUDIO”), a nad głową wjeżdża pole
komentarza: szary napis „Dodaj komentarz…” i przycisk „Opublikuj”. Gdy kursantka mówi hasło, z góry spada wielkie słowo
w kolorze akcentu, zmniejsza się i wpada do pola. „Opublikuj” zmienia kolor i się wciska, a komentarz zostaje
opublikowany: pojawia się „Ty · teraz” i serduszko. Na obietnicy („a wyślę Ci link”) pod wezwaniem dochodzi druga
linijka, a pod komentarzem wjeżdża odpowiedź kursantki: jej zdjęcie, nazwa konta, ✓ i krótki tekst. Serduszko robi się
czerwone, a na końcu wszystko odjeżdża w górę.

**Kiedy:** wezwanie do komentarza ze słowem-hasłem: „skomentuj STUDIO, a wyślę Ci link”, „napisz ZADŁUŻENIE, a podeślę
listę”. Zwykle przy końcu rolki, raz.

**Czego potrzeba:** hasło i obietnica z nagrania, jej zdjęcie profilowe i nazwa konta (z marki albo od kursantki).

## Słowa kursantki

- Hasło to słowo, które ona mówi, wielkimi literami. Obietnica to jej słowa („a wyślę Ci link”). Odpowiedź pod
  komentarzem pasuje do obietnicy: „link wysłany”, „lista wysłana”, „sprawdź wiadomości”.
- Dłuższe hasło dostaje mniejsze litery: rozmiar wielkiego słowa = najwyżej 150 px i najwyżej 1300 / liczba liter
  (STUDIO 150 px, ZADŁUŻENIE 130 px). W polu komentarza słowo ma zawsze 38 px.
- Słowa z filmu podglądowego to tylko przykład. W planie montażu pokaż kursantce hasło, obietnicę i odpowiedź.

## Kod

```html
<div id="pk-o" class="clip" data-start="T" data-duration="D" style="position:absolute;inset:0">
  <div class="karta" id="pk">
    <div class="pk-av"><svg viewBox="0 0 24 24" width="40" height="40"><circle cx="12" cy="9" r="4.2" fill="#fff"/><path d="M4 21c1.4-4.2 4.4-6.2 8-6.2s6.6 2 8 6.2" fill="#fff"/></svg></div>
    <div id="pk-tx"><div id="pk-n">Ty <b>· teraz</b></div><div id="pk-w"><span id="pk-ph">Dodaj komentarz…</span><span id="pk-st">STUDIO</span></div></div>
    <div id="pk-op">Opublikuj</div>
    <svg id="pk-s" viewBox="0 0 24 24" width="40" height="40"><path id="pk-sp" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3.2 5 6.6 5c2 0 3.6 1.1 5.4 3 1.8-1.9 3.4-3 5.4-3 3.4 0 5.7 3.4 4.2 6.8C19.5 16.4 12 21 12 21z" fill="none" stroke="#3A3A44" stroke-width="2"/></svg>
  </div>
  <div class="karta" id="pr"><div class="pr-av"><img src="assets/profil.jpg" alt=""></div>
    <div class="pr-tx"><div class="pr-n">nazwa_konta <b>· teraz</b></div><div class="pr-w"><svg viewBox="0 0 24 24" width="28" height="28"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#6C4BEF" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>link wysłany</div></div></div>
  <div id="pk-sl">STUDIO</div>   <!-- po polu i odpowiedzi, żeby spadało nad nimi -->
  <div class="pk-cw" style="top:1160px"><div class="karta pk-c" id="pc0">Skomentuj <span>STUDIO</span></div></div>   <!-- broda + 30 -->
  <div class="pk-cw" style="top:1240px"><div class="karta pk-c" id="pc1">a wyślę Ci link</div></div>
</div>
```
```css
.karta { position: absolute; background: #fff; border-radius: 28px; box-shadow: 0 18px 44px rgba(0,0,0,.32); box-sizing: border-box; font-family: Nunito, sans-serif; font-weight: 800; color: #1C1C1E; }
#pk-sl { position: absolute; left: 0; right: 0; top: 0; text-align: center; font: 800 150px Nunito, sans-serif; line-height: 1; color: #6C4BEF; text-shadow: 0 5px 0 #5A3BE0, 0 10px 0 #4527C2, 0 22px 34px rgba(0,0,0,.45); }   /* rozmiar = ROZ */
#pk { left: 70px; top: 226px; width: 940px; height: 104px; border-radius: 52px; display: flex; align-items: center; gap: 18px; padding: 0 22px 0 14px; }
.pk-av { width: 76px; height: 76px; border-radius: 50%; background: #B9B4C9; display: flex; align-items: center; justify-content: center; flex: none; }
#pk-tx { flex: 1; line-height: 1.05; min-width: 0; }
#pk-n { font-size: 25px; color: #3A3A44; height: 0; overflow: hidden; } #pk-n b { color: #8E8B9E; font-weight: 700; }
#pk-w { font-size: 38px; white-space: nowrap; display: flex; }
#pk-ph { color: #8E8B9E; font-weight: 700; }
#pk-st { display: none; color: #6C4BEF; transform-origin: 0 50%; }
#pk-op { height: 60px; padding: 0 26px; border-radius: 30px; background: #E4E1EC; color: #8E8B9E; font-size: 30px; display: flex; align-items: center; flex: none; }
#pk-s { flex: none; display: none; width: 46px; height: 46px; }
#pr { left: 150px; top: 342px; width: 800px; height: 92px; border-radius: 46px; display: flex; align-items: center; gap: 16px; padding: 0 24px 0 12px; }
.pr-av { width: 68px; height: 68px; border-radius: 50%; overflow: hidden; flex: none; } .pr-av img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pr-tx { line-height: 1.1; } .pr-n { font-size: 23px; color: #3A3A44; } .pr-n b { color: #8E8B9E; font-weight: 700; }
.pr-w { font-size: 34px; color: #1C1C1E; display: flex; align-items: center; gap: 6px; }
.pk-cw { position: absolute; left: 0; right: 0; height: 66px; display: flex; justify-content: center; }
.pk-c { position: relative; height: 66px; padding: 0 26px; border-radius: 18px; font-size: 40px; display: flex; align-items: center; white-space: nowrap; }
.pk-c span { color: #6C4BEF; margin-left: 10px; }
```
```js
// T_SKOM = „skomentuj”, T_HASLO = hasło, T_OBIET = pierwsze słowo obietnicy („wyślę”), T_LINK = jej ostatnie słowo,
// T_KONIEC ≈ 0,5 s po obietnicy. ROZ = rozmiar wielkiego słowa, LITERY = liczba liter hasła.
const ROZ = 150, LITERY = 6, SK = 38 / ROZ, SZER = 0.68 * ROZ * LITERY;
gsap.set("#pk-sl", { y: -(ROZ + 20), opacity: 0 }); gsap.set("#pk", { y: -480 }); gsap.set("#pr", { opacity: 0, x: 60 });
gsap.set(["#pc0", "#pc1"], { opacity: 0 });
tl.fromTo("#pc0", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)", immediateRender: false }, T_SKOM);
tl.to("#pk", { y: 0, duration: 0.24, ease: "power3.out" }, T_SKOM + 0.08);
tl.set("#pk-sl", { opacity: 1 }, T_HASLO - 0.24);
tl.to("#pk-sl", { y: 271 - ROZ / 2, duration: 0.24, ease: "power2.in" }, T_HASLO - 0.24);
// słowo maleje do 38 px i staje na początku pola (tekst pola zaczyna się na X 178, środek pola na Y 278)
tl.to("#pk-sl", { scale: SK, x: 178 + SK * SZER / 2 - 540, y: 278 - ROZ / 2, duration: 0.14, ease: "power2.in" }, T_HASLO);
tl.to("#pk-sl", { opacity: 0, duration: 0.04 }, T_HASLO + 0.1);
tl.set("#pk-ph", { display: "none" }, T_HASLO + 0.12); tl.set("#pk-st", { display: "inline-block" }, T_HASLO + 0.12);
tl.fromTo("#pk-st", { scale: 1.25 }, { scale: 1, duration: 0.16, ease: "back.out(3)", immediateRender: false }, T_HASLO + 0.12);
tl.set("#pk-op", { background: "#6C4BEF", color: "#fff" }, T_HASLO + 0.23);
tl.to("#pk-op", { scale: 0.88, duration: 0.07, yoyo: true, repeat: 1 }, T_HASLO + 0.33);
tl.set("#pk-op", { display: "none" }, T_HASLO + 0.49); tl.set("#pk-s", { display: "block" }, T_HASLO + 0.49);
tl.to("#pk-n", { height: 30, duration: 0.16, ease: "power2.out" }, T_HASLO + 0.49);
tl.fromTo("#pc1", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)", immediateRender: false }, T_OBIET);
tl.fromTo("#pr", { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.2, ease: "back.out(1.6)", immediateRender: false }, T_LINK);
tl.set("#pk-sp", { fill: "#E5484D", stroke: "#E5484D" }, T_LINK + 0.3);
tl.fromTo("#pk-s", { scale: 1 }, { scale: 1.3, duration: 0.1, yoyo: true, repeat: 1, immediateRender: false }, T_LINK + 0.3);
tl.to(["#pk", "#pr"], { y: -480, duration: 0.18, ease: "power3.in" }, T_KONIEC);
tl.to(["#pc0", "#pc1"], { opacity: 0, scale: 0.9, duration: 0.14 }, T_KONIEC);
```

## Zasady

- Hasło dokładnie takie, jakie pada w nagraniu i jakie kursantka naprawdę obsługuje (np. automatyczną odpowiedzią na
  komentarze). W odpowiedzi nie ma niczego, czego nie obiecała.
- Pole komentarza i odpowiedź nad głową (Y 226–434), wezwanie w dwóch linijkach pod brodą, od `broda + 30` po
  przybliżeniu (przy kadrze 1,06–1,1 broda schodzi niżej: sprawdź na klatce).
- Wielkie słowo spada nad głową i ląduje w polu komentarza w chwili, gdy ona mówi hasło; nie przelatuje przez twarz.
- Stan początkowy pola `y: −480`, wyjazd w górę razem z wygaszeniem wezwania.
- Zdjęcie i nazwa konta prawdziwe, kursantki. Komentarz podpisany „Ty” (to widz), bez cudzych imion.
- Dźwięki: pop na wezwanie, whoosh na spadające słowo, pop na wpadnięcie, click na „Opublikuj”, pop na odpowiedź,
  soft-click na serduszko.

## Wspólne zasady

- Kolory, czcionki i płótno ze stylu kursantki (`moj-brand.json`, `moj-styl.json`); kolory podane niżej to tylko przykład.
- Stany początkowe ustawiaj `gsap.set(...)` poza osią czasu, a wejścia `fromTo` z `immediateRender: false`. Inaczej element
  stoi przez klatkę na miejscu końcowym, zanim wjedzie (`rules/pulapki.md`).
- Element wchodzi na słowie, którego dotyczy (czasy z `slowa.json`), i trwa co najmniej do końca zdania.
- Treść tylko prawdziwa: liczby, nazwy i materiały z nagrania albo od kursantki, bez zmyślonych kwot i dowodów.
- Dźwięki z jej wyboru, ciszej niż głos, bez ping.
