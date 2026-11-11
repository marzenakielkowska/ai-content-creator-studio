# Jak napisać slajd

Każdy slajd to plik `karuzela/slajdy/NN.html` (01, 02…) z jednym elementem `<div class="s …">`. Bez `<html>`, `<head>`
i skryptów strony: `zbuduj` (wołane przez `kontrola` i `render`) dokłada resztę. Ścieżki do plików zawsze
`assets/<plik>`. Wszystko pozycjonujesz w pikselach slajdu 1080 × 1650.

## Klasy szablonu (`szablon/slajd.css`)

| Klasa | Co to |
|---|---|
| `s` + `t1` / `t2` / `t3` | slajd na tle 1, 2 albo 3 z Lookbooka (tekst sam dobiera kolor); bez `t…` jasne tło |
| `s jasny` / `s ciemny` | wymuszony biały albo ciemny tekst |
| `s ze-zdjeciem` | slajd ze zdjęciem: konto w białej pigułce |
| `tekst` | blok tekstu w strefie (left 90, right 90, top 200), elementy jeden pod drugim |
| `pyt` | pytanie / nagłówek, 92 px, 800 |
| `odp` | odpowiedź, 54 px, 600 |
| `pod` | zdanie pomocnicze, 46 px |
| `wielki` | ogromne słowo na okładce, 220 px, w kolorze akcentu |
| `ak` / `mk` | słowo w kolorze akcentu / podkreślone markerem (`mk` tylko gdy kursantka chce) |
| `wyc` | postać wycięta z tła (poświata i cień w szablonie); `<img class="wyc" src="assets/x-wyciecie.png">` |
| `foto` | zwykłe zdjęcie w zaokrąglonej ramce: `<div class="foto" style="…"><img src="assets/x.jpg"></div>` |
| `karta-tekst` | mała biała karta z tekstem na zdjęciu |
| `karta` | biała karta na zrzut ekranu (`<img>` w środku przycięty od góry) |
| `ramka` | ramka na klatkę albo film z rolki (biała obwódka) |
| `lista` | lista kroków: `<div class="lista"><div><i>1</i>Krok</div>…</div>` |
| `pigulki` | pigułki: `<div class="pigulki"><div><i class="tak">✓</i>tak</div><div><i class="nie">✕</i>nie</div></div>` |
| `pole` | pole komentarza: `<div class="pole" style="top:620px"><img src="assets/profil.jpg"><div class="w"><small>napisz w komentarzu</small>SŁOWO</div><div class="wyslij">➤</div></div>` |
| `dop` | odręczny dopisek (czcionka odręczna), pozycja w `style` |
| `strz` | odręczna strzałka: `<svg class="strz" style="left:…;top:…" width="150" height="90" viewBox="0 0 150 90"><path d="M10 20 C 50 70, 100 78, 136 52" stroke="#FFD166"/><path d="M108 36 L138 52 L112 76" stroke="#FFD166"/></svg>` |

Atrybuty na `<div class="s">`: `data-bez-konta` (slajd bez konta), `data-konto-pigulka` (konto w białej pigułce).

## Postać wycięta z tła

Zdjęcie z `klatka` ma 1080 × 1920. `assets/<nazwa>.twarz.json` podaje głowę w % zdjęcia (`x`, `y` = czubek, `w`, `h`).
Głowa ma mieć ok. 1/4 szerokości slajdu: wysokość obrazka ok. `1080 × 0.25 / (w/100) / (1080/1920)` px, zwykle
1150–1300 px. Ustaw `top` tak, żeby czubek głowy był pod tekstem, a obrazek sięgał dolnej krawędzi (top + wysokość ≥
1650), i `left` tak, żeby głowa była po prawej i w strefie (`left + (x + w)% × szerokość obrazka ≤ 1030`).

## Filmy

`<video src="assets/<nazwa>.mp4"></video>` w `ramka`, `karta` albo `foto`. Bez atrybutów: program dokłada wyciszenie,
czasy i id. Długość slajdu-filmu = najdłuższy film w nim (do 15 s).

Przewijanie zrzutu ekranu w karcie: `<div class="karta" style="…"><img src="assets/zrzut.png" data-przewin="-300"
style="height:auto; object-fit:initial"></div>` (przesunięcie w px, w trakcie trwania slajdu; ma sens na slajdzie
z filmem albo gdy kursantka chce ruchu). Własny ruch: `<script type="text/x-ruch">tl.to('#kursor', { x: 600, y: 650,
duration: 1.2 }, 2.5);</script>` (`tl` to oś czasu slajdu; stan początkowy ustaw `gsap.set` w tym samym skrypcie).

## Przykłady

Okładka z wycięciem:

```html
<div class="s t1 ze-zdjeciem">
  <div class="tekst" style="gap:6px;">
    <div class="wielki">Claude</div>
    <div style="font-weight:800; font-size:124px; line-height:1; letter-spacing:-3px;">edytuje wideo</div>
  </div>
  <img src="assets/ikona.png" alt="" style="position:absolute; right:90px; top:225px; width:170px; height:170px; border-radius:40px;">
  <img class="wyc" src="assets/okladka-wyciecie.png" alt="" style="left:300px; top:380px; height:1290px;">
  <div class="karta-tekst" style="left:90px; top:1250px;">Pewnie zastanawiasz się,<br>jak to naprawdę <span class="ak">działa?</span></div>
  <div class="dop" style="left:90px; top:720px; font-size:84px; color:#fff; transform:rotate(-8deg);">pokażę Ci</div>
</div>
```

Drugi hak z nagłówkiem okładki i trzema fragmentami rolki:

```html
<div class="s t2">
  <div class="tekst">
    <div style="display:flex; align-items:center; gap:18px;"><img src="assets/ikona.png" alt="" style="width:78px; height:78px; border-radius:20px;"><span style="font-weight:800; font-size:60px;">Claude edytuje wideo</span></div>
    <div class="pyt" style="font-size:66px; white-space:nowrap;">Ile zajęłoby Ci przygotowanie<br><span class="ak">takich efektów?</span></div>
  </div>
  <div class="ramka" style="left:100px; top:640px; width:320px; height:569px; transform:rotate(-7deg);"><video src="assets/r1.mp4"></video></div>
  <div class="ramka" style="left:380px; top:605px; width:320px; height:569px; z-index:2;"><video src="assets/r2.mp4"></video></div>
  <div class="ramka" style="left:660px; top:640px; width:320px; height:569px; transform:rotate(7deg);"><video src="assets/r3.mp4"></video></div>
  <div class="dop" style="left:90px; top:1245px; font-size:84px; color:var(--tlo-1);">Ja nie robiłam ich ręcznie.</div>
  <div class="odp" style="position:absolute; left:90px; top:1350px;">Zobacz, kto je zrobił</div>
</div>
```

Pytanie i odpowiedź z listą:

```html
<div class="s">
  <div class="tekst">
    <div class="pyt">Co musisz zrobić?</div>
    <div class="odp">Tylko <span class="ak">trzy rzeczy:</span></div>
    <div class="lista" style="margin-top:24px;"><div><i>1</i>Wejść do Claude'a</div><div><i>2</i>Zainstalować wtyczkę</div><div><i>3</i>Odpowiedzieć na kilka pytań</div></div>
  </div>
</div>
```

Surowe i gotowe (film):

```html
<div class="s t2">
  <div class="tekst">
    <div class="pyt">A montaż?</div>
    <div class="odp">Mówisz Claude'owi, żeby zmontował Twoje surowe nagranie.</div>
  </div>
  <div class="ramka" style="left:90px; top:800px; width:400px; height:650px;"><video src="assets/surowe.mp4"></video></div>
  <div class="ramka" style="left:590px; top:800px; width:400px; height:650px;"><video src="assets/gotowe.mp4"></video></div>
  <div class="dop" style="left:120px; top:740px; font-size:62px; background:#fff; color:var(--ciemny); padding:2px 18px; border-radius:18px;">surowe</div>
  <div class="dop" style="left:640px; top:740px; font-size:62px; background:var(--tlo-1); color:#fff; padding:2px 18px; border-radius:18px;">gotowe</div>
</div>
```

Kadr filmu do ramki 400 × 650 (obwódka 8 px): `fragment … --kadr 768x1268` (dwa razy większy niż środek ramki).

Wezwanie do działania:

```html
<div class="s ze-zdjeciem">
  <div class="tekst">
    <div class="pyt" style="font-size:84px;">Chcesz tak montować swoje wideo?</div>
    <div class="odp">Za moment otwieram drzwi do <span class="ak" style="white-space:nowrap;">AI Content Creator Studio.</span></div>
  </div>
  <div class="pole" style="top:620px;"><img src="assets/profil.jpg" alt=""><div class="w"><small>napisz w komentarzu</small>STUDIO</div><div class="wyslij">➤</div></div>
  <img class="wyc" src="assets/cta-wyciecie.png" alt="" style="left:380px; top:560px; height:1150px;">
  <div class="karta-tekst" style="left:90px; top:1020px; width:430px; font-size:38px; font-weight:600;">Tylko osoby z listy otrzymają bonus i zniżki na start.</div>
</div>
```

Słowa w przykładach są tylko po to, żeby pokazać układ. W karuzeli kursantki zawsze jej słowa z rolki.
