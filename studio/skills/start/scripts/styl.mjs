// AI Content Creator Studio: gdzie lezy styl kursantki (moj-styl.json, moj-brand.json).
//
// Styl mieszkal kiedys w osobnym folderze ~/.ai-content-creator-studio. Teraz jest w folderze Studio razem z reszta,
// zeby wszystko Studio bylo w jednym miejscu (latwiej sprzatac i pomagac). przeniesStyl() przenosi stare pliki:
// kopiuje, sprawdza, ze kopia jest taka sama, i dopiero wtedy usuwa stary plik. Pliku, ktory juz jest w folderze
// Studio, nie nadpisuje. Wola je /studio:start (aktualizuj) i serwery Lookbooka i Dzwiekow.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const FOLDER_STUDIO = process.env.AI_STUDIO_HOME || path.join(os.homedir(), '.ai-content-studio');
export const STARY_FOLDER_STYLU = path.join(os.homedir(), '.ai-content-creator-studio');
export const PLIKI_STYLU = ['moj-styl.json', 'moj-brand.json'];

export function przeniesStyl() {
  if (!fs.existsSync(STARY_FOLDER_STYLU)) return [];
  const przeniesione = [];
  fs.mkdirSync(FOLDER_STUDIO, { recursive: true });
  for (const nazwa of PLIKI_STYLU) {
    const stary = path.join(STARY_FOLDER_STYLU, nazwa);
    const nowy = path.join(FOLDER_STUDIO, nazwa);
    if (!fs.existsSync(stary) || fs.existsSync(nowy)) continue;
    fs.copyFileSync(stary, nowy);
    if (fs.readFileSync(nowy).equals(fs.readFileSync(stary))) {
      fs.unlinkSync(stary);
      przeniesione.push(nazwa);
    }
  }
  if (fs.readdirSync(STARY_FOLDER_STYLU).length === 0) fs.rmdirSync(STARY_FOLDER_STYLU);
  return przeniesione;
}
