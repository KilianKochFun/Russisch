// Einstiegspunkt — Auth-Gate (Phase 2), dann Inhalte laden und App starten.
// supabase.js wird dynamisch importiert: schlägt das fehl (kein Internet, esm.sh down),
// startet die App trotzdem — nur ohne Login/Sync.
import { S } from './state.js';
import { ladeSprachen } from './content.js';
import { renderSprachen, srsBuildCardMap, srsLoad } from './ui.js';
import { initInput } from './input.js';
import { progressInit, ladeProgress, ladeSettings } from './progress.js';

initInput();

let auth = null; // Modul js/supabase.js (oder null im Offline-Fallback)

async function startApp(session) {
  if (session && auth) progressInit(auth.supabase, session.user.id);
  try {
    S.sprachenData = await ladeSprachen();
  } catch (e) {
    console.warn('Sprachen nicht geladen:', e.message);
  }
  srsBuildCardMap();
  await srsLoad();
  if (session) {
    await Promise.all([ladeProgress(), ladeSettings()]);
  }
  renderSprachen();
}

function zeigeLogin() {
  S.state = 'login';
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('login-offline').style.display = 'block';

  const fehler = document.getElementById('login-fehler');
  const submit = document.getElementById('login-submit');

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
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

  document.getElementById('login-ohne').addEventListener('click', () => startApp(null));
}

async function init() {
  try {
    auth = await import('./supabase.js');
  } catch (e) {
    console.warn('Supabase nicht erreichbar — Start ohne Login:', e.message);
    await startApp(null);
    return;
  }
  const session = await auth.getSession();
  if (session) await startApp(session);
  else zeigeLogin();
}

init();
