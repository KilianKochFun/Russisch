#!/usr/bin/env python3
"""
generate_vocab.py — A1-Vokabeldaten aus SMARTool + OpenRussian generieren

Quellen:
  SMARTool:    https://github.com/smartool/data-rus-eng  (A1/A2/B1/B2 CSVs)
  OpenRussian: https://github.com/Badestrand/russian-dictionary (nouns/verbs/adjectives.csv)

Ausgabe:
  data/a1.1/01-vokabeln.js  ... data/a1.4/01-vokabeln.js
  data/a1-vokabeln-gesamt.js

Verwendung:
  python3 scripts/generate_vocab.py
  python3 scripts/generate_vocab.py --level A2   # für A2-Wörter
  python3 scripts/generate_vocab.py --dry-run     # nur Statistik, keine Dateien
"""

import csv
import os
import sys
import urllib.request

LEVEL = 'A1'
DRY_RUN = '--dry-run' in sys.argv
for i, arg in enumerate(sys.argv):
    if arg == '--level' and i + 1 < len(sys.argv):
        LEVEL = sys.argv[i + 1]

BASE_URL = 'https://raw.githubusercontent.com'
SMARTOOL_URL  = f'{BASE_URL}/smartool/data-rus-eng/master/SMARTool_data_{LEVEL}.csv'
OR_NOUNS_URL  = f'{BASE_URL}/Badestrand/russian-dictionary/master/nouns.csv'
OR_VERBS_URL  = f'{BASE_URL}/Badestrand/russian-dictionary/master/verbs.csv'
OR_ADJ_URL    = f'{BASE_URL}/Badestrand/russian-dictionary/master/adjectives.csv'

CACHE_DIR = '/tmp/russisch_cache'
os.makedirs(CACHE_DIR, exist_ok=True)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR   = os.path.join(SCRIPT_DIR, '..', 'data')


def download_cached(url, filename):
    path = os.path.join(CACHE_DIR, filename)
    if not os.path.exists(path):
        print(f'  Download: {url}')
        urllib.request.urlretrieve(url, path)
    else:
        print(f'  Cache:    {filename}')
    return path


def load_smartool(level):
    path = download_cached(SMARTOOL_URL, f'smartool_{level}.csv')
    seen = set()
    words = []
    with open(path, encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader)  # header
        for row in reader:
            if not row: continue
            lemma    = row[0].strip()
            gloss_en = row[2].strip()
            pos      = row[4].strip()
            topic    = row[14].strip() if len(row) > 14 else ''
            if lemma and lemma not in seen and not lemma[0].isdigit():
                seen.add(lemma)
                words.append({'ru': lemma, 'en': gloss_en, 'pos': pos, 'topic': topic})
    return words


def load_openrussian_de():
    de = {}
    files = [
        (OR_NOUNS_URL, 'or_nouns.csv'),
        (OR_VERBS_URL, 'or_verbs.csv'),
        (OR_ADJ_URL,   'or_adj.csv'),
    ]
    for url, fname in files:
        path = download_cached(url, fname)
        with open(path, encoding='utf-8') as f:
            reader = csv.reader(f, delimiter='\t')
            header = next(reader)
            de_idx   = header.index('translations_de')
            bare_idx = header.index('bare')
            for row in reader:
                if len(row) > de_idx:
                    bare = row[bare_idx].strip()
                    trans = row[de_idx].strip()
                    if bare and trans and bare not in de:
                        de[bare] = trans
    return de


def clean_de(raw):
    """Erste sinnvolle Übersetzung (vor Semikolon/Komma)."""
    return raw.split(';')[0].split(',')[0].strip()


POS_HINTS = {
    'N.Masc.Inan': 'm.',        'N.Masc.Anim': 'm. (Pers.)',
    'N.Fem.Inan':  'f.',        'N.Fem.Anim':  'f. (Pers.)',
    'N.Neut.Inan': 'n.',        'N.Neut.Anim': 'n.',
    'N.Inan':      'nur Pl.',   'V':            'Verb',
    'A':           'Adj.',      'Pron':         'Pron.',
    'Prep':        'Präp.',     'Conj':         'Konj.',
}


def make_js_vokabeln(words, titel='Vokabeln'):
    lines = []
    for w in words:
        ru = w['ru'].replace('`', "'")
        de = w['de'].replace('`', "'")
        m  = w['m'].replace('`', "'")
        lines.append(f"    {{ ru: `{ru}`, de: `{de}`, m: `{m}` }},")
    return (
        f"module.exports = {{\n"
        f"  typ: `vokabeln`,\n"
        f"  titel: `{titel}`,\n"
        f"  karten: [\n"
        + '\n'.join(lines) +
        f"\n  ]\n}}\n"
    )


def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  → {path}')


# ── Hauptprogramm ───────────────────────────────────────────────────────────

print(f'\n=== Russisch Vokabeln generieren (Level: {LEVEL}) ===\n')

print('1. SMARTool laden...')
words = load_smartool(LEVEL)
print(f'   {len(words)} eindeutige Lemmata\n')

print('2. OpenRussian DE-Übersetzungen laden...')
de_dict = load_openrussian_de()
print(f'   {len(de_dict)} DE-Einträge\n')

print('3. Cross-Referenz...')
found, missing = 0, []
for w in words:
    de_raw = de_dict.get(w['ru'], '')
    if de_raw:
        found += 1
        w['de'] = clean_de(de_raw)
    else:
        missing.append(w['ru'])
        w['de'] = w['en']  # Fallback auf Englisch
    w['m'] = POS_HINTS.get(w['pos'], w['pos'] or '—')

print(f'   {found}/{len(words)} mit DE-Übersetzung')
if missing:
    print(f'   Ohne DE: {missing[:10]}{"..." if len(missing) > 10 else ""}')
print()

# In 4 Gruppen aufteilen
n = len(words)
splits = [n // 4, n // 2, 3 * n // 4, n]
chunks = [
    words[0:splits[0]],
    words[splits[0]:splits[1]],
    words[splits[1]:splits[2]],
    words[splits[2]:splits[3]],
]

print('4. Kapitel-Aufteilung:')
level_lower = LEVEL.lower()
for i, chunk in enumerate(chunks, 1):
    first, last = chunk[0]['ru'], chunk[-1]['ru']
    print(f'   {level_lower}.{i}: {len(chunk)} Wörter ({first} … {last})')
print()

if DRY_RUN:
    print('(--dry-run: keine Dateien geschrieben)')
    sys.exit(0)

print('5. Dateien schreiben...')
for i, chunk in enumerate(chunks, 1):
    path = os.path.join(DATA_DIR, f'{level_lower}.{i}', '01-vokabeln.js')
    write_file(path, make_js_vokabeln(chunk))

# Vollständige Referenzliste
ref_lines = []
for w in words:
    ru    = w['ru'].replace('`', "'")
    de    = w['de'].replace('`', "'")
    m     = w['m'].replace('`', "'")
    topic = w.get('topic', '').replace('`', "'")
    ref_lines.append(f"  {{ ru: `{ru}`, de: `{de}`, m: `{m}`, topic: `{topic}` }},")

ref_content = (
    f"// Vollständige {LEVEL}-Vokabelliste ({len(words)} Wörter)\n"
    f"// Quelle: SMARTool (smartool/data-rus-eng) + OpenRussian (Badestrand/russian-dictionary)\n"
    f"// Generiert mit: python3 scripts/generate_vocab.py\n"
    f"module.exports = [\n"
    + '\n'.join(ref_lines) +
    f"\n];\n"
)
ref_path = os.path.join(DATA_DIR, f'{level_lower}-vokabeln-gesamt.js')
write_file(ref_path, ref_content)

print(f'\nFertig! {len(words)} Wörter in 4 Kapitel aufgeteilt.')
