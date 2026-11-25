> ⚠️ **Sprawdzenie twarzy:** powiadomienia pod brodą, górna krawędź pierwszego co najmniej `broda + 60`; dolna krawędź ostatniego nad strefą Instagrama (Y 1470). Patrz: sekcja **„Twarz — reguła nadrzędna”** w `studio/skills/montaz/SKILL.md`.

# Efekt: Powiadomienia z telefonu

**Co robi:** pod brodą wskakuje powiadomienie jak na iPhonie: zielona ikonka wiadomości, nadawca, „teraz” i jedna
linijka treści. Na kolejne słowa wskakują następne, każde pod poprzednim, z cichym „pop”. Zostają do końca zdania, potem
znikają razem z cięciem.

**Kiedy:** kursantka mówi o czekaniu, terminach, wiadomościach, które przychodzą od kogoś: „do tej pory robili to ludzie
i trwało to długo”, „klientki ciągle piszą”, „księgowa odpisuje po tygodniu”. Od 1 do 4 powiadomień, 2–5 s.

**Czego potrzeba:** nic poza nagraniem. Ikonka i karta są w kodzie.

## Słowa kursantki

- Nadawca i treść wynikają z jej zdania i jej branży („Księgowa · Faktury dopiero w poniedziałek”, „Klientka · Czy
  jest jeszcze wolny termin?”). Słowa z filmu podglądowego („Montażystka · Rolka będzie gotowa w przyszły czwartek”) to
  tylko przykład.
- Każde powiadomienie wchodzi na słowo, które je uzasadnia. Treść najwyżej ok. 40 znaków, inaczej utnie się kropkami.
- W planie montażu pokaż kursantce nadawcę i treści do zmiany.
- Powiadomienia o komentarzach z Instagrama to osobny efekt: `komentarze-z-instagrama`.

## Kod

```html
<div id="pt" class="clip" data-start="T" data-duration="D" style="position:absolute;inset:0">
  <div class="pow" id="pt0" style="top:820px"><div class="apka wiad"><svg viewBox="0 0 24 24" width="42" height="42"><path d="M12 4c-4.7 0-8.5 3.1-8.5 7 0 2.2 1.2 4.1 3.1 5.4L6 20l3.6-1.6c.8.2 1.6.3 2.4.3 4.7 0 8.5-3.1 8.5-7S16.7 4 12 4z" fill="#fff"/></svg></div>
    <div class="tr"><div class="t1">Nadawca <em>teraz</em></div><div class="t2">Treść wiadomości</div></div></div>
  <!-- kolejne: id pt1, pt2…, top +114 px -->
</div>
```
```css
.pow { position: absolute; left: 90px; width: 900px; height: 104px; border-radius: 30px; background: rgba(255,255,255,.97); box-shadow: 0 18px 40px rgba(18,10,70,.34), 0 4px 10px rgba(18,10,70,.18); display: flex; align-items: center; gap: 22px; padding: 0 24px; box-sizing: border-box; color: #1D1B2A; font-family: Figtree, sans-serif; overflow: hidden; }
.apka { flex: none; width: 70px; height: 70px; border-radius: 18px; display: flex; align-items: center; justify-content: center; }
.apka.wiad { background: linear-gradient(180deg, #67E66F, #1FBF3A); }
.pow .tr { flex: 1; min-width: 0; }
.pow .t1 { display: flex; justify-content: space-between; align-items: baseline; font-size: 23px; font-weight: 700; line-height: 30px; color: #6B6880; }
.pow .t1 em { font-style: normal; font-weight: 500; font-size: 20px; opacity: .7; }
.pow .t2 { font-size: 32px; font-weight: 600; line-height: 42px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
```
```js
// T_n = słowo, na które wchodzi n-te powiadomienie (z slowa.json)
["#pt0", "#pt1", "#pt2"].forEach((s, n) => {
  gsap.set(s, { opacity: 0.001, y: 46, scale: 0.9 });
  tl.to(s, { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: "back.out(1.7)" }, [T_0, T_1, T_2][n]);
});
```

Dźwięk: `pop` przy każdym powiadomieniu, `data-volume` 0,08.

Czcionka Figtree 600/700 (polskie litery sprawdzone). Gdy marka kursantki ma inną czcionkę główną, użyj jej, w grubości
z tabeli w SKILL montażu.
