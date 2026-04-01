module.exports = {
  typ: `theorie`,
  titel: `Personalpronomen im Akkusativ`,
  karten: [
    {
      titel: `Warum ändern sich die Pronomen?`,
      erklaerung: `Im Deutschen ändert sich „ich" zu „mich", „du" zu „dich", „er" zu „ihn". Russisch macht dasselbe — nur mit anderen Formen. Nach transitiven Verben (sehen, hören, lieben, warten auf ...) steht das Pronomen im Akkusativ, nicht im Nominativ. Das ist im Deutschen und Russischen identisch.`,
      tabelle: [
        [`Nominativ`, `Akkusativ`, `Deutsch`, `Beispiel`],
        [`я`, `меня`, `mich`, `Он видит меня. — Er sieht mich.`],
        [`ты`, `тебя`, `dich`, `Я жду тебя. — Ich warte auf dich.`],
        [`он/оно`, `его`, `ihn / es`, `Ты знаешь его? — Kennst du ihn?`],
        [`она`, `её`, `sie`, `Мы любим её. — Wir lieben sie.`],
        [`мы`, `нас`, `uns`, `Вы понимаете нас? — Verstehen Sie uns?`],
        [`вы`, `вас`, `euch / Sie`, `Я слышу вас. — Ich höre Sie.`],
        [`они`, `их`, `sie (Pl.)`   , `Он не знает их. — Er kennt sie nicht.`],
      ],
      m: `Merkhilfe: меня/тебя/его/её — alle enden auf -я/-ё (außer Plural). нас/вас/их — kurze Formen.`
    },
    {
      titel: `его und её — Vorsicht Verwechslung!`,
      erklaerung: `его gibt es zweimal im Russischen: als Akkusativ von он/оно (ihn/es) und als Possessivpronomen (sein). Und её gibt es als Akkusativ von она (sie) und als Possessivpronomen (ihr). Am Kontext erkennt man, was gemeint ist: nach Verben = Akkusativ, vor Nomen = Possessivpronomen.`,
      beispiele: [
        `Я вижу его. — Ich sehe ihn. (Akkusativ von он)`,
        `Это его книга. — Das ist sein Buch. (Possessivpronomen)`,
        `Я знаю её. — Ich kenne sie. (Akkusativ von она)`,
        `Это её сестра. — Das ist ihre Schwester. (Possessivpronomen)`,
      ],
      m: `Nach einem Verb: Akkusativ. Vor einem Nomen: Possessivpronomen. Nie verwechseln!`
    },
    {
      titel: `Pronomen mit Präposition: н-Anlaut`,
      erklaerung: `Wenn ein Personalpronomen der 3. Person (его, её, их) nach einer Präposition steht, bekommt es ein н- am Anfang. Das gilt für alle Präpositionen: к, о, про, без, для, от, у, через, за, по, с, на, в, при ... Das н- entsteht aus historischen Gründen — heute ist es einfach Regel.`,
      tabelle: [
        [`Ohne Präposition`, `Mit Präposition`, `Bedeutung`],
        [`его`, `у него`, `bei ihm`],
        [`её`, `к ней`, `zu ihr`],
        [`их`, `о них`, `über sie`],
        [`его`, `без него`, `ohne ihn`],
        [`их`, `для них`, `für sie`],
      ],
      beispiele: [
        `Я иду к нему. — Ich gehe zu ihm.`,
        `Он живёт у неё. — Er wohnt bei ihr.`,
        `Мы говорим о них. — Wir sprechen über sie.`,
      ],
      m: `Faustregel: Präposition + 3. Person → н- vorne dranhängen: его → него, её → неё, их → них.`
    },
  ]
}
