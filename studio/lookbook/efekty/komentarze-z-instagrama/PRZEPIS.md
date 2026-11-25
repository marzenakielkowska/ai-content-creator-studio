> ⚠️ **Sprawdzenie twarzy:** powiadomienia pod brodą, górna krawędź pierwszego co najmniej `broda + 60`; dolna krawędź ostatniego nad strefą Instagrama (Y 1470). Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Komentarze z Instagrama

**Co robi:** gdy kursantka mówi swoje hasło („Skomentuj słowem NAGRANIE…”), pod brodą wskakuje powiadomienie
z Instagrama: kolorowa ikonka, „Instagram · teraz” i „kasia.rolki skomentowała: NAGRANIE”. Co 0,4 s wskakuje następne,
od innej osoby, jedno pod drugim, aż powstaje kolumna 3–4 komentarzy z tym samym słowem. Zostają do końca zdania.

**Kiedy:** wezwanie do komentarza ze słowem-hasłem, zapisy, lead magnet. Zwykle przy końcu rolki, raz. Pokazuje widzowi,
że inni już komentują.

**Czego potrzeba:** hasło z nagrania kursantki. Ikonka Instagrama i karta są w kodzie.

## Słowa kursantki

- Hasło to słowo, które ona mówi, wielkimi literami. Pierwsze powiadomienie wchodzi na to słowo, kolejne co 0,4 s.
- Nazwy kont wymyślone i ogólne, pasujące do jej odbiorczyń (`kasia.rolki`, `ania_po_godzinach`, `gabinet.ewy`). Nigdy
  prawdziwe konta ani nazwiska. „skomentowała” albo „skomentował”, zależnie od nazwy.
- Słowa z filmu podglądowego (hasło NAGRANIE) to tylko przykład. W planie montażu pokaż kursantce hasło i nazwy kont.
- Gdy do tego samego wezwania używasz efektu `spadajacy-komentarz`, wybierz jeden z nich, nie oba.

## Kod

```html
<div id="ki" class="clip" data-start="T" data-duration="D" style="position:absolute;inset:0">
  <div class="pow" id="ki0" style="top:720px"><div class="apka">
    <svg viewBox="0 0 24 24" width="70" height="70"><defs><radialGradient id="igg" cx="30%" cy="107%" r="150%"><stop offset="0" stop-color="#FDF497"/><stop offset=".05" stop-color="#FDF497"/><stop offset=".45" stop-color="#FD5949"/><stop offset=".6" stop-color="#D6249F"/><stop offset=".9" stop-color="#285AEB"/></radialGradient></defs><rect width="24" height="24" rx="6" fill="url(#igg)"/><rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="16.2" cy="7.8" r="1" fill="#fff"/></svg></div>
    <div class="tr"><div class="t1">Instagram <em>teraz</em></div><div class="t2"><b>kasia.rolki</b> skomentowała: HASŁO</div></div></div>
  <!-- kolejne: id ki1, ki2, ki3, top +114 px, ta sama ikonka (gradient zdefiniuj raz, w kolejnych użyj url(#igg)) -->
</div>
```
```css
.pow { position: absolute; left: 90px; width: 900px; height: 104px; border-radius: 30px; background: rgba(255,255,255,.97); box-shadow: 0 18px 40px rgba(18,10,70,.34), 0 4px 10px rgba(18,10,70,.18); display: flex; align-items: center; gap: 22px; padding: 0 24px; box-sizing: border-box; color: #1D1B2A; font-family: Figtree, sans-serif; overflow: hidden; }
.apka { flex: none; width: 70px; height: 70px; border-radius: 18px; display: flex; align-items: center; justify-content: center; }
.pow .tr { flex: 1; min-width: 0; }
.pow .t1 { display: flex; justify-content: space-between; align-items: baseline; font-size: 23px; font-weight: 700; line-height: 30px; color: #6B6880; }
.pow .t1 em { font-style: normal; font-weight: 500; font-size: 20px; opacity: .7; }
.pow .t2 { font-size: 32px; font-weight: 600; line-height: 42px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pow .t2 b { font-weight: 800; }
```
```js
// T_HASLO = chwila, gdy kursantka mówi hasło (z slowa.json)
["#ki0", "#ki1", "#ki2", "#ki3"].forEach((s, n) => {
  gsap.set(s, { opacity: 0.001, y: 46, scale: 0.9 });
  tl.to(s, { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: "back.out(1.7)" }, T_HASLO - 0.25 + n * 0.4);
});
```

Dźwięk: `pop` przy każdym powiadomieniu, `data-volume` 0,08.
