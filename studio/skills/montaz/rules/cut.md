# Zasady cięcia

Krótki zbiór zasad. Claude czyta go przed każdym cięciem. Gdy kursantka da uwagę, jedna z tych zasad zostaje PRZEPISANA (nie dodajesz nowej obok). Ustawienia skryptów są w plikach skryptów — nie przepisuj ich tutaj.

- **Zostaw ostatnie czyste ujęcie.** Jeśli linia była powiedziana kilka razy, wyrzuć wcześniejsze próby. Zdanie urwane w połowie i zaczęte od nowa to retake — zostaw pełną wersję.
- **Podwójne słowo lub restart.** Słowo powiedziane dwa razy pod rząd, albo zdanie zaczęte od nowa — zostaw tylko ostatnie czyste.
- **Nigdy nie ucinaj w środku słowa.** Zacznij każdy kawałek 0,07 sekundy przed pierwszym słowem. Kończ dopiero gdy dźwięk ostatniego słowa naprawdę się skończy — nie na sztywnym czasie. Ucięcie za wcześnie odcina końcówkę słowa.
- **Nie ufaj samej transkrypcji przy zająknięciach.** Whisper często je pomija. Skrypt wypisuje dźwięki siedzące między słowami — sprawdź każde ze słuchu. Jeśli to zająknięcie, wytnij.
- **Skróć pauzę dłuższą niż 0,6 sekundy.** Zostaw około ćwierć sekundy, żeby brzmiało jak człowiek.
- **Dwie zmiany obrazu z tego samego ujęcia w ciągu 1,5 sekundy wyglądają skocznie.** Połącz je albo zastosuj przybliżenie (zoom 1,3–1,9) na jednym z kawałków — wtedy zmiana wygląda jak cięcie do innego planu.
- **Gdy nie wiesz czy to retake — zostaw i powiedz kursantce.**
- **Sprawdź poziom dźwięku po montażu.** Peak −6 dB lub wyżej — w porządku. Ciszej — powiedz o tym przy dostarczeniu i zaproponuj głośniejszą kopię.
- **Zawsze pokaż listę cięć i czekaj na OK przed cięciem.**
