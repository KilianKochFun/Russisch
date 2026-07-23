// Lädt die komplette Inhalts-Hierarchie (Sprache → Kapitel → Unterkapitel → Einheiten).
// content/sprachen.json wird von `npm run build:content` aus data/ generiert.
export async function ladeSprachen() {
  const res = await fetch('content/sprachen.json');
  if (!res.ok) throw new Error('content/sprachen.json: HTTP ' + res.status);
  return res.json();
}
