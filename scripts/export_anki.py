#!/usr/bin/env python3
"""
export_anki.py — Vokabeln als Anki-kompatibles TSV exportieren

Liest data/a1-vokabeln-gesamt.js (oder alle 01-vokabeln.js) und
exportiert als TSV für Anki-Import (Vorderseite: RU, Rückseite: DE).

Verwendung:
  python3 scripts/export_anki.py                    # alle A1-Vokabeln
  python3 scripts/export_anki.py --kapitel a1.1     # nur ein Kapitel
  python3 scripts/export_anki.py --output meine.txt # anderer Dateiname

Anki-Import: Datei > Importieren > TSV, Felder: Vorderseite / Rückseite / Merksatz
"""

import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR   = os.path.join(SCRIPT_DIR, '..', 'data')

# Argumente
output_file = 'anki_export.txt'
kapitel_filter = None

i = 1
while i < len(sys.argv):
    if sys.argv[i] == '--output' and i + 1 < len(sys.argv):
        output_file = sys.argv[i + 1]; i += 2
    elif sys.argv[i] == '--kapitel' and i + 1 < len(sys.argv):
        kapitel_filter = sys.argv[i + 1]; i += 2
    else:
        i += 1


def extract_karten_from_js(filepath):
    """Einfacher Regex-Parser für { ru: `...`, de: `...`, m: `...` }"""
    with open(filepath, encoding='utf-8') as f:
        content = f.read()
    pattern = r'\{\s*ru:\s*`([^`]*)`\s*,\s*de:\s*`([^`]*)`\s*(?:,\s*m:\s*`([^`]*)`\s*)?\}'
    karten = []
    for m in re.finditer(pattern, content):
        karten.append({
            'ru': m.group(1),
            'de': m.group(2),
            'm':  m.group(3) or '',
        })
    return karten


# Dateien sammeln
all_karten = []

if kapitel_filter:
    path = os.path.join(DATA_DIR, kapitel_filter, '01-vokabeln.js')
    if os.path.exists(path):
        all_karten = extract_karten_from_js(path)
    else:
        print(f'Fehler: {path} nicht gefunden')
        sys.exit(1)
else:
    # Alle Kapitel-Ordner
    for entry in sorted(os.listdir(DATA_DIR)):
        vok_path = os.path.join(DATA_DIR, entry, '01-vokabeln.js')
        if os.path.isfile(vok_path):
            karten = extract_karten_from_js(vok_path)
            all_karten.extend(karten)
            print(f'  {entry}: {len(karten)} Karten')

# TSV schreiben
out_path = os.path.join(SCRIPT_DIR, '..', output_file)
with open(out_path, 'w', encoding='utf-8') as f:
    # Anki-Header (optional)
    f.write('#separator:tab\n')
    f.write('#html:false\n')
    f.write('#notetype:Basic\n')
    f.write('#deck:Russisch A1\n')
    for k in all_karten:
        ru = k['ru'].replace('\t', ' ')
        de = k['de'].replace('\t', ' ')
        m  = k['m'].replace('\t', ' ')
        f.write(f'{ru}\t{de}\t{m}\n')

print(f'\n✓ {len(all_karten)} Karten exportiert nach {out_path}')
print('  Anki: Datei > Importieren > Felder zuordnen: Vorderseite, Rückseite, Extra')
