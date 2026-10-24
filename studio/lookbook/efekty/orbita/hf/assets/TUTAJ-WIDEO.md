# Pliki do wstawienia przed renderem

Claude podmienia te pliki automatycznie po wybraniu efektu przez kursantkę.

## cutout.webm
Nagranie kursantki wycięte z tła (przezroczyste tło).
Generowane przez: `npx hyperframes remove-background wideo.mp4 --output assets/cutout.webm`

## card1.png, card2.png, card3.png
Miniatury innych rolek kursantki (9:16, min. 400×710 px).
Możliwe też card4.png, card5.png — dodaj element `.card` w index.html i dopisz do tablicy `cards`.
