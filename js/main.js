// Einstiegspunkt — Auth-Gate (Phase 2), dann Inhalte laden und App starten.
// supabase.js wird dynamisch importiert: schlägt das fehl (kein Internet, esm.sh down),
// startet die App trotzdem — nur ohne Login/Sync.
import { S } from './state.js';
import { ladeSprachen } from './content.js';
import { renderSprachen, srsBuildCardMap, srsLoad } from './ui.js';
import { initInput } from './input.js';
import { progressInit, ladeProgress, ladeSettings } from './progress.js';

initInput();

// PWA: Service Worker für Offline-Betrieb (App-Shell + Inhalte)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW nicht registriert:', e.message));
}

let auth = null; // Modul js/supabase.js (oder null im Offline-Fallback)

async function startApp(session) {
  if (session && auth) progressInit(auth.supabase, session.user.id);
  try {
    S.sprachenData = await ladeSprachen();
  } catch (e) {
    console.warn('Sprachen nicht geladen:', e.message);
  }
  srsBuildCardMap();
  if (session) {
    await Promise.all([ladeProgress(), ladeSettings()]);
  }
  await srsLoad(); // nach ladeSettings — Cloud-Stand hat Vorrang
  renderSprachen();
}

function zeigeLogin(hinweis) {
  S.state = 'login';
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('login-screen').classList.add('active');

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
