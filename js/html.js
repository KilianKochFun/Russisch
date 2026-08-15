// Text, der von Menschen kommt, sicher in HTML setzen.
//
// Die App baut ihre Oberfläche aus Zeichenketten und setzt sie über
// `innerHTML`. Solange dort nur eigene Inhalte landen, ist das harmlos. Zwei
// Stellen sind es aber nicht:
//
//   · der Anzeigename in der Bestenliste — den setzt jeder selbst, und LESEN
//     dürfen ihn alle Angemeldeten. Wer sich `<img src=x onerror=…>` nennt,
//     führt sonst Code im Browser der anderen aus.
//   · der eigene Merksatz — nur für einen selbst sichtbar, aber ein `<` darin
//     würde die Anzeige zerlegen.
//
// Deshalb: alles, was ein Mensch eingetippt hat, geht durch `escapeHtml`.

const ERSATZ = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, z => ERSATZ[z]);
}
