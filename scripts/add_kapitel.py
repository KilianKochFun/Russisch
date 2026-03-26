#!/usr/bin/env python3
"""
add_kapitel.py — Neues Kapitel-Grundgerüst anlegen

Legt einen neuen Ordner data/<id>/ mit index.js und leeren Einheiten-Dateien an.

Verwendung:
  python3 scripts/add_kapitel.py a2.1 "A2.1 — Kasussystem" --einheiten vokabeln grammatik dialog text

Optionen:
  --einheiten   Kommagetrennte Liste der Einheiten-Typen (Standard: vokabeln grammatik dialog text)
  --beschreibung  Kurzbeschreibung für das Kapitel
"""

import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR   = os.path.join(SCRIPT_DIR, '..', 'data')

# Argumente parsen
args = sys.argv[1:]
if len(args) < 2:
    print('Verwendung: python3 scripts/add_kapitel.py <id> "<name>" [--einheiten typ1,typ2,...] [--beschreibung "..."]')
    sys.exit(1)

kap_id   = args[0]
kap_name = args[1]
einheiten_typen = ['vokabeln', 'grammatik', 'dialog', 'text']
beschreibung = ''

i = 2
while i < len(args):
    if args[i] == '--einheiten' and i + 1 < len(args):
        einheiten_typen = args[i + 1].split(',')
        i += 2
    elif args[i] == '--beschreibung' and i + 1 < len(args):
        beschreibung = args[i + 1]
        i += 2
    else:
        i += 1

kap_dir = os.path.join(DATA_DIR, kap_id)

if os.path.exists(kap_dir):
    print(f'Fehler: {kap_dir} existiert bereits!')
    sys.exit(1)

os.makedirs(kap_dir)

# Einheiten-Templates
TEMPLATES = {
    'vokabeln': lambda n: f"""module.exports = {{
  typ: `vokabeln`,
  titel: `Vokabeln`,
  karten: [
    // {{ ru: `слово`, de: `Wort`, m: `n.` }},
    // Generieren mit: python3 scripts/generate_vocab.py
  ]
}}
""",
    'grammatik': lambda n: f"""module.exports = {{
  typ: `grammatik`,
  titel: `Grammatik`,
  fragen: [
    // {{
    //   q: `Frage?`,
    //   a: [`Option A`, `Option B`, `Option C`],
    //   c: 0,
    //   m: `Merksatz / Erklärung`
    // }},
  ]
}}
""",
    'dialog': lambda n: f"""module.exports = {{
  typ: `dialog`,
  titel: `Dialog`,
  tts: true,
  zeilen: [
    // {{ sprecher: `Анна`, text: `Привет!` }},
    // {{ sprecher: `Борис`, text: `Привет! Как дела?` }},
  ],
  fragen: [
    // {{
    //   q: `Was sagt Boris?`,
    //   a: [`Option A`, `Option B`, `Option C`],
    //   c: 0,
    //   m: `Merksatz`
    // }},
  ]
}}
""",
    'text': lambda n: f"""module.exports = {{
  typ: `text`,
  titel: `Lesetext`,
  tts: true,
  inhalt: `Hier kommt der Lesetext auf Russisch...`,
  fragen: [
    // {{
    //   q: `Verständnisfrage?`,
    //   a: [`Option A`, `Option B`, `Option C`],
    //   c: 0,
    //   m: `Merksatz`
    // }},
  ]
}}
""",
}

# Einheiten-Dateien anlegen
einheiten_require = []
for i, typ in enumerate(einheiten_typen, 1):
    filename = f'{i:02d}-{typ}.js'
    filepath = os.path.join(kap_dir, filename)
    template = TEMPLATES.get(typ, TEMPLATES['grammatik'])
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(template(i))
    print(f'  Erstellt: {filename}')
    einheiten_require.append(f"    require('./{filename}'),")

# index.js anlegen
index_content = f"""module.exports = {{
  id: `{kap_id}`,
  name: `{kap_name}`,
  beschreibung: `{beschreibung}`,
  einheiten: [
{chr(10).join(einheiten_require)}
  ]
}}
"""

with open(os.path.join(kap_dir, 'index.js'), 'w', encoding='utf-8') as f:
    f.write(index_content)
print(f'  Erstellt: index.js')

# data/index.js aktualisieren
data_index_path = os.path.join(DATA_DIR, 'index.js')
if os.path.exists(data_index_path):
    with open(data_index_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if kap_id not in content:
        # Vor dem letzten ']' einfügen
        new_line = f"  require('./{kap_id}'),\n"
        content = content.replace(']', new_line + ']', 1)
        with open(data_index_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  Aktualisiert: data/index.js (+ {kap_id})')
    else:
        print(f'  data/index.js: {kap_id} schon vorhanden')

print(f'\n✓ Kapitel {kap_id} ("{kap_name}") angelegt in {kap_dir}')
print(f'  → node server.js und http://localhost:3000 aufrufen zum Testen')
