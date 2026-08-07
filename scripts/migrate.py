#!/usr/bin/env python3
"""Spielt eine Migration aus supabase/migrations/ gegen die Datenbank ein.

Warum ein eigenes Skript und nicht `psql`: Die Direktverbindung
(db.<ref>.supabase.co) ist nur über IPv6 erreichbar. Wo das Netz kein IPv6 hat,
läuft es über den Pooler, und dessen Benutzername hat die Form
`postgres.<projekt-ref>`. Das Passwort enthält Sonderzeichen und muss in der URL
prozentkodiert sein — pg8000 bekommt die Teile deshalb einzeln statt als URL.

Die Verbindungsdaten stehen in .env (SUPABASE_DB_URL). Die Datei ist gitignored,
und dieses Skript gibt ihren Inhalt nie aus — auch nicht im Fehlerfall.

Aufruf: python3 scripts/migrate.py supabase/migrations/20260807120000_bestenliste.sql
"""

import os
import re
import sys
import urllib.parse
from pathlib import Path

import pg8000.dbapi

WURZEL = Path(__file__).resolve().parent.parent


def db_url():
    env = WURZEL / '.env'
    if not env.exists():
        sys.exit('.env fehlt')
    for zeile in env.read_text(encoding='utf-8').splitlines():
        if zeile.startswith('SUPABASE_DB_URL='):
            return zeile.split('=', 1)[1].strip().strip('"').strip("'")
    sys.exit('SUPABASE_DB_URL steht nicht in .env')


def zerlege(url):
    """postgresql://benutzer:passwort@host:port/datenbank → Einzelteile.

    Nicht mit urlparse: Das Passwort ist in .env nicht prozentkodiert und
    enthält Sonderzeichen, an denen urlparse den Port falsch findet. Von rechts
    zu zerlegen ist unempfindlich dagegen — im Passwort darf dann alles stehen,
    solange der Rest der URL wohlgeformt ist.
    """
    rest = url.split('://', 1)[1] if '://' in url else url
    creds, hostteil = rest.rsplit('@', 1)
    benutzer, _, passwort = creds.partition(':')
    hostport, _, datenbank = hostteil.partition('/')
    host, _, port = hostport.rpartition(':')
    if not port.isdigit():          # kein Port angegeben
        host, port = hostport, '5432'
    return {
        'user': urllib.parse.unquote(benutzer),
        'password': urllib.parse.unquote(passwort),
        'host': host,
        'port': int(port),
        'database': (datenbank or 'postgres').split('?')[0],
    }


def verbinde():
    return pg8000.dbapi.connect(**zerlege(db_url()), ssl_context=True)


def anweisungen(sql):
    """Zerlegt in einzelne Anweisungen.

    Zwei Fallen, in die ein naives `sql.split(";")` beide tappt:
    Kommentarzeilen werden vorher entfernt, weil ein `--`-Block vor einer
    Anweisung den Zerleger schon einmal die Anweisung dahinter hat
    verschlucken lassen. Und Dollar-Quoting ($$ … $$) bleibt zusammen, sonst
    zerfällt jeder Funktionsrumpf an den Semikola darin.
    """
    ohne = '\n'.join(z for z in sql.splitlines() if not z.strip().startswith('--'))
    teile, akt, in_dollar, i = [], [], False, 0
    while i < len(ohne):
        if ohne.startswith('$$', i):
            in_dollar = not in_dollar
            akt.append('$$')
            i += 2
            continue
        if ohne[i] == ';' and not in_dollar:
            teile.append(''.join(akt))
            akt = []
        else:
            akt.append(ohne[i])
        i += 1
    teile.append(''.join(akt))
    return [t.strip() for t in teile if t.strip()]


def main():
    if len(sys.argv) < 2:
        sys.exit('Aufruf: python3 scripts/migrate.py <datei.sql>')
    datei = Path(sys.argv[1])
    if not datei.is_absolute():
        datei = WURZEL / datei
    sql = datei.read_text(encoding='utf-8')

    conn = verbinde()
    cur = conn.cursor()
    n = 0
    for a in anweisungen(sql):
        try:
            cur.execute(a)
            n += 1
        except Exception as e:
            conn.rollback()
            kopf = ' '.join(a.split())[:90]
            sys.exit(f'✗ fehlgeschlagen bei: {kopf}…\n  {e}')
    conn.commit()
    cur.close()
    conn.close()
    print(f'✓ {datei.name}: {n} Anweisung(en) ausgeführt.')


if __name__ == '__main__':
    main()
