// Einstiegspunkt — lädt Inhalte, initialisiert SRS und Eingabe, zeigt das Sprachen-Menü.
import { S } from './state.js';
import { ladeSprachen } from './content.js';
import { renderSprachen, srsBuildCardMap, srsLoad } from './ui.js';
import { initInput } from './input.js';

initInput();

async function init() {
  try {
    S.sprachenData = await ladeSprachen();
  } catch (e) {
    console.warn('Sprachen nicht geladen:', e.message);
  }
  srsBuildCardMap();
  await srsLoad();
  renderSprachen();
}

init();
