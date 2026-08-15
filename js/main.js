// Einstiegspunkt — Auth-Gate (Phase 2), dann Inhalte laden und App starten.
// supabase.js wird dynamisch importiert: schlägt das fehl (kein Internet, esm.sh down),
// startet die App trotzdem — nur ohne Login/Sync.
import { S } from './state.js';
import { ladeSprachen } from './content.js';
import { renderSprachen } from './ui.js';
import { initInput } from './input.js';
import { progressInit, ladeProgress, ladeSettings } from './progress.js';
import { aufSyncStatus, schreibe, syncInit } from './sync.js';
import './forecast.js';  // hängt sich an window, wie trainer.js
import './buecher.js';   // hängt sich an window, wie trainer.js
import './vergleich.js'; // ebenso
import { zeigeScreen } from './screen.js';

initInput();

// Speicherstatus sichtbar machen. Vorher landeten Fehlschläge nur in der
// Konsole — man lernte weiter im Glauben, alles sei gesichert.
const statusEl = document.getElementById('sync-status');
aufSyncStatus(({ offen, laeuft, fehler, online }) => {
  if (!offen && !fehler) { statusEl.style.display = 'none'; return; }
  statusEl.style.display = 'block';
  if (!online) {
    statusEl.textContent = `OFFLINE · ${offen} gemerkt`;
    statusEl.style.color = 'var(--yellow)'; statusEl.style.borderColor = 'var(--yellow)';
    statusEl.title = 'Ohne Netz. Die Antworten sind lokal gesichert und gehen hoch, sobald es wieder geht.';
  } else if (fehler) {
    statusEl.textContent = `NICHT GESPEICHERT · ${offen}`;
    statusEl.style.color = 'var(--red)'; statusEl.style.borderColor = 'var(--red)';
    statusEl.title = `${fehler} — Antippen für neuen Versuch.`;
  } else {
    statusEl.textContent = laeuft ? 'SPEICHERT …' : `${offen} offen`;
    statusEl.style.color = 'var(--muted)'; statusEl.style.borderColor = 'var(--border)';
    statusEl.title = 'Antippen, um sofort zu speichern.';
  }
});
statusEl.onclick = () => schreibe();

// PWA: Service Worker für Offline-Betrieb (App-Shell + Inhalte).
// Auto-Update: Übernimmt eine neue Version die Kontrolle, einmal neu laden —
// sonst würde nach einem Deploy noch der alte Cache angezeigt.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW nicht registriert:', e.message));
  let neuGeladen = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (neuGeladen) return;
    neuGeladen = true;
    location.reload();
  });
}

let auth = null; // Modul js/supabase.js (oder null im Offline-Fallback)

async function startApp(session) {
  if (session && auth) { progressInit(auth.supabase, session.user.id);
                         syncInit(auth.supabase, session.user.id); }
  try {
    S.sprachenData = await ladeSprachen();
  } catch (e) {
    console.warn('Sprachen nicht geladen:', e.message);
  }
  if (session) {
    await Promise.all([ladeProgress(), ladeSettings()]);
  }
  renderSprachen();
}

function zeigeLogin(hinweis) {
  S.state = 'login';
  zeigeScreen('login-screen');

  const fehler = document.getElementById('login-fehler');
  const submit = document.getElementById('login-submit');
  if (hinweis) fehler.textContent = hinweis;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!auth) { fehler.textContent = 'Keine Verbindung — bitte Internet prüfen und neu laden.'; return; }
    fehler.textContent = '';
    submit.disabled = true;
    try {
      const session = await auth.login(
        document.getElementById('login-email').value.trim(),
        document.getElementById('login-passwort').value
      );
      await startApp(session);
    } catch (err) {
      fehler.textContent = 'Anmeldung fehlgeschlagen: ' + (err.message || err);
      submit.disabled = false;
    }
  });
}

// Ohne Anmeldung geht nichts — die Session bleibt aber pro Gerät gespeichert,
// d.h. einmal einloggen reicht (auch offline nutzbar, sobald Session existiert).
async function init() {
  try {
    auth = await import('./supabase.js');
  } catch (e) {
    console.warn('Supabase nicht erreichbar:', e.message);
    zeigeLogin('Keine Verbindung — bitte Internet prüfen und neu laden.');
    return;
  }
  const session = await auth.getSession();
  if (session) await startApp(session);
  else zeigeLogin();
}

init();
