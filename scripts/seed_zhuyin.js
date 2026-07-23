#!/usr/bin/env node
// Seedet das Zhuyin-Deck (ㄅㄆㄇㄈ, 37 Zeichen + 5 Töne) nach Supabase.
// Braucht SUPABASE_SECRET_KEY in .env. Aufruf: node scripts/seed_zhuyin.js
// Idempotent: löscht vorher alle chinese-tw/zhuyin-Einträge und schreibt neu.

const fs = require('fs');
const path = require('path');

const SUPA_URL = 'https://qqvmovinqupunbsexiev.supabase.co';
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8')
    .split('\n').filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);
const KEY = env.SUPABASE_SECRET_KEY;
if (!KEY) { console.error('SUPABASE_SECRET_KEY fehlt in .env'); process.exit(1); }

// z = Zhuyin, p = Pinyin, h = Hinweis (Aussprache für Deutschsprachige),
// b = Beispielwort {zh, zy (Zhuyin), py, de}
const LEVELS = [
  // Level 1 — Anlaute: Lippen & Zunge vorn
  [
    { z: 'ㄅ', p: 'b', h: 'wie „b“ in Ball, aber unbehaucht (ohne Luftstoß)', b: { zh: '爸爸', zy: 'ㄅㄚˋ ˙ㄅㄚ', py: 'bàba', de: 'Papa' } },
    { z: 'ㄆ', p: 'p', h: 'wie „p“ in Post, kräftig behaucht', b: { zh: '朋友', zy: 'ㄆㄥˊ ㄧㄡˇ', py: 'péngyǒu', de: 'Freund' } },
    { z: 'ㄇ', p: 'm', h: 'wie deutsches „m“', b: { zh: '媽媽', zy: 'ㄇㄚ ˙ㄇㄚ', py: 'māma', de: 'Mama' } },
    { z: 'ㄈ', p: 'f', h: 'wie deutsches „f“', b: { zh: '飯', zy: 'ㄈㄢˋ', py: 'fàn', de: 'Reis / Essen' } },
    { z: 'ㄉ', p: 'd', h: 'wie „d“ in dann, unbehaucht', b: { zh: '大', zy: 'ㄉㄚˋ', py: 'dà', de: 'groß' } },
    { z: 'ㄊ', p: 't', h: 'wie „t“ in Tag, behaucht', b: { zh: '他', zy: 'ㄊㄚ', py: 'tā', de: 'er' } },
    { z: 'ㄋ', p: 'n', h: 'wie deutsches „n“', b: { zh: '你', zy: 'ㄋㄧˇ', py: 'nǐ', de: 'du' } },
    { z: 'ㄌ', p: 'l', h: 'wie deutsches „l“', b: { zh: '老師', zy: 'ㄌㄠˇ ㄕ', py: 'lǎoshī', de: 'Lehrer' } },
  ],
  // Level 2 — Anlaute: Kehle & Zungenmitte
  [
    { z: 'ㄍ', p: 'g', h: 'wie „g“ in gut, unbehaucht', b: { zh: '狗', zy: 'ㄍㄡˇ', py: 'gǒu', de: 'Hund' } },
    { z: 'ㄎ', p: 'k', h: 'wie „k“ in kalt, behaucht', b: { zh: '看', zy: 'ㄎㄢˋ', py: 'kàn', de: 'sehen' } },
    { z: 'ㄏ', p: 'h', h: 'wie „ch“ in Bach (rauer als deutsches h)', b: { zh: '好', zy: 'ㄏㄠˇ', py: 'hǎo', de: 'gut' } },
    { z: 'ㄐ', p: 'j', h: 'wie „dj“ — weiches dsch mit gespreizten Lippen', b: { zh: '家', zy: 'ㄐㄧㄚ', py: 'jiā', de: 'Zuhause / Familie' } },
    { z: 'ㄑ', p: 'q', h: 'wie „tch“ — behauchtes tsch mit gespreizten Lippen', b: { zh: '錢', zy: 'ㄑㄧㄢˊ', py: 'qián', de: 'Geld' } },
    { z: 'ㄒ', p: 'x', h: 'zwischen „ch“ in ich und „s“ — weiches ß mit Lächeln', b: { zh: '謝謝', zy: 'ㄒㄧㄝˋ ˙ㄒㄧㄝ', py: 'xièxie', de: 'danke' } },
  ],
  // Level 3 — Anlaute: Zunge zurückgebogen & Zischlaute
  [
    { z: 'ㄓ', p: 'zh', h: 'wie „dsch“ mit zurückgebogener Zunge', b: { zh: '中', zy: 'ㄓㄨㄥ', py: 'zhōng', de: 'Mitte' } },
    { z: 'ㄔ', p: 'ch', h: 'wie „tsch“ mit zurückgebogener Zunge, behaucht', b: { zh: '吃', zy: 'ㄔ', py: 'chī', de: 'essen' } },
    { z: 'ㄕ', p: 'sh', h: 'wie „sch“ mit zurückgebogener Zunge', b: { zh: '是', zy: 'ㄕˋ', py: 'shì', de: 'sein' } },
    { z: 'ㄖ', p: 'r', h: 'wie „j“ in Journal, Zunge zurückgebogen', b: { zh: '人', zy: 'ㄖㄣˊ', py: 'rén', de: 'Mensch' } },
    { z: 'ㄗ', p: 'z', h: 'wie „ds“ in Rätsel, unbehaucht', b: { zh: '字', zy: 'ㄗˋ', py: 'zì', de: 'Schriftzeichen' } },
    { z: 'ㄘ', p: 'c', h: 'wie „z“ in Zahl, kräftig behaucht', b: { zh: '菜', zy: 'ㄘㄞˋ', py: 'cài', de: 'Gemüse / Gericht' } },
    { z: 'ㄙ', p: 's', h: 'wie scharfes „ß“', b: { zh: '三', zy: 'ㄙㄢ', py: 'sān', de: 'drei' } },
  ],
  // Level 4 — Vokale & Gleitlaute
  [
    { z: 'ㄧ', p: 'i / yi', h: 'wie „i“ in Musik', b: { zh: '一', zy: 'ㄧ', py: 'yī', de: 'eins' } },
    { z: 'ㄨ', p: 'u / wu', h: 'wie „u“ in gut', b: { zh: '五', zy: 'ㄨˇ', py: 'wǔ', de: 'fünf' } },
    { z: 'ㄩ', p: 'ü / yu', h: 'wie deutsches „ü“', b: { zh: '魚', zy: 'ㄩˊ', py: 'yú', de: 'Fisch' } },
    { z: 'ㄚ', p: 'a', h: 'wie „a“ in Vater', b: { zh: '大', zy: 'ㄉㄚˋ', py: 'dà', de: 'groß' } },
    { z: 'ㄛ', p: 'o', h: 'wie „o“ in oft', b: { zh: '我', zy: 'ㄨㄛˇ', py: 'wǒ', de: 'ich' } },
    { z: 'ㄜ', p: 'e', h: 'dumpfes „ö/e“ wie in bitte — Kehle offen', b: { zh: '喝', zy: 'ㄏㄜ', py: 'hē', de: 'trinken' } },
    { z: 'ㄝ', p: 'ê / -ie', h: 'offenes „ä“ wie in Bär', b: { zh: '謝謝', zy: 'ㄒㄧㄝˋ ˙ㄒㄧㄝ', py: 'xièxie', de: 'danke' } },
  ],
  // Level 5 — Doppelvokale
  [
    { z: 'ㄞ', p: 'ai', h: 'wie „ei“ in Mai', b: { zh: '愛', zy: 'ㄞˋ', py: 'ài', de: 'Liebe / lieben' } },
    { z: 'ㄟ', p: 'ei', h: 'wie „ee“ in Idee + kurzes i (eng. „hey“)', b: { zh: '妹妹', zy: 'ㄇㄟˋ ˙ㄇㄟ', py: 'mèimei', de: 'kleine Schwester' } },
    { z: 'ㄠ', p: 'ao', h: 'wie „au“ in Haus', b: { zh: '好', zy: 'ㄏㄠˇ', py: 'hǎo', de: 'gut' } },
    { z: 'ㄡ', p: 'ou', h: 'wie „ou“ in engl. „go“', b: { zh: '狗', zy: 'ㄍㄡˇ', py: 'gǒu', de: 'Hund' } },
  ],
  // Level 6 — Nasale & Erlaut
  [
    { z: 'ㄢ', p: 'an', h: 'wie „an“ in Bahn', b: { zh: '三', zy: 'ㄙㄢ', py: 'sān', de: 'drei' } },
    { z: 'ㄣ', p: 'en', h: 'wie „en“ in offen', b: { zh: '很', zy: 'ㄏㄣˇ', py: 'hěn', de: 'sehr' } },
    { z: 'ㄤ', p: 'ang', h: 'wie „ang“ in lang (nasal)', b: { zh: '忙', zy: 'ㄇㄤˊ', py: 'máng', de: 'beschäftigt' } },
    { z: 'ㄥ', p: 'eng', h: 'wie „ung“ ohne u — dumpfes -ng', b: { zh: '朋友', zy: 'ㄆㄥˊ ㄧㄡˇ', py: 'péngyǒu', de: 'Freund' } },
    { z: 'ㄦ', p: 'er', h: 'wie amerikanisches „er“ in her', b: { zh: '二', zy: 'ㄦˋ', py: 'èr', de: 'zwei' } },
  ],
  // Level 7 — Die 5 Töne (an der klassischen ma-Reihe)
  [
    { z: 'ˉ', p: '1. Ton (mā)', h: 'hoch und eben — wie beim Summen eines Tons', b: { zh: '媽', zy: 'ㄇㄚ', py: 'mā', de: 'Mama' } },
    { z: 'ˊ', p: '2. Ton (má)', h: 'steigend — wie eine Rückfrage: „Was?“', b: { zh: '麻', zy: 'ㄇㄚˊ', py: 'má', de: 'Hanf' } },
    { z: 'ˇ', p: '3. Ton (mǎ)', h: 'fallend-steigend — tief durchschwingen', b: { zh: '馬', zy: 'ㄇㄚˇ', py: 'mǎ', de: 'Pferd' } },
    { z: 'ˋ', p: '4. Ton (mà)', h: 'scharf fallend — wie ein Befehl: „Nein!“', b: { zh: '罵', zy: 'ㄇㄚˋ', py: 'mà', de: 'schimpfen' } },
    { z: '˙', p: 'neutraler Ton (ma)', h: 'kurz und unbetont — angehängt wie ein Hauch', b: { zh: '嗎', zy: '˙ㄇㄚ', py: 'ma', de: 'Fragepartikel' } },
  ],
];

async function main() {
  const headers = {
    apikey: KEY,
    Authorization: 'Bearer ' + KEY,
    'Content-Type': 'application/json',
  };

  // Alte Zhuyin-Einträge löschen (idempotent)
  const del = await fetch(`${SUPA_URL}/rest/v1/vocab_items?language=eq.chinese-tw&item_type=eq.zhuyin`, {
    method: 'DELETE', headers,
  });
  if (!del.ok) throw new Error('DELETE fehlgeschlagen: ' + del.status + ' ' + await del.text());

  const rows = [];
  LEVELS.forEach((level, li) => {
    level.forEach((item, pi) => {
      rows.push({
        language: 'chinese-tw',
        item_type: 'zhuyin',
        level: li + 1,
        position: pi,
        data: { zhuyin: item.z, pinyin: item.p, hinweis: item.h, beispiel: item.b },
      });
    });
  });

  const res = await fetch(`${SUPA_URL}/rest/v1/vocab_items`, {
    method: 'POST', headers, body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error('INSERT fehlgeschlagen: ' + res.status + ' ' + await res.text());
  console.log(`✓ ${rows.length} Zhuyin-Items in ${LEVELS.length} Leveln geseedet`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
