// ════════════════════════════════════════════════════
// RUSSISCH QUIZ — Fragendatenbank
// ════════════════════════════════════════════════════
// Neues Quiz hinzufügen: Objekt ans Ende von QUIZZE anhängen.
// Neue Fragen: ans Ende von "fragen" anhängen.
//
// Fragen-Format:
//   q  = Fragetext
//   a  = Array mit genau 3 Antworten [A, B, C]
//   c  = Index der richtigen Antwort (0, 1 oder 2)
//   m  = Merksatz / Erklärung (wird nach der Antwort gezeigt)
//
// schwierigkeit: 1 = leicht, 2 = mittel, 3 = schwer
// ════════════════════════════════════════════════════

window.QUIZZE = [

  // ──────────────────────────────────────────────────
  {
    id: "a1-vokabeln",
    name: `A1 — Vokabeln`,
    schwierigkeit: 1,
    beschreibung: `Grundvokabular mit Etymologie`,
    fragen: [
      {
        q: `Was bedeutet „солнце"?`,
        a: [`Mond`, `Sonne`, `Stern`],
        c: 1,
        m: `„Солнце" ist urverwandt mit lat. sol (Sonne) → Solar, Solarium. Die PIE-Wurzel *sóh₂wl̥ steckt in fast allen europäischen Sprachen – Sonne hat überall dieselbe Herkunft.`
      },
      {
        q: `Was bedeutet „вода"?`,
        a: [`Feuer`, `Erde`, `Wasser`],
        c: 2,
        m: `„Вода" ist urverwandt mit dt. Wasser, engl. water und lat. unda (Welle → Unterwasser). Alle aus PIE *wódr̥. Das russische „водка" ist also wörtlich „Wässerchen"!`
      },
      {
        q: `Was bedeutet „мать"?`,
        a: [`Mutter`, `Vater`, `Schwester`],
        c: 0,
        m: `„Мать" ist direkt verwandt mit dt. Mutter, lat. mater (→ maternal, Matriarchat) und engl. mother. PIE *méh₂tēr – eines der ältesten und konstantesten Wörter der Menschheit.`
      },
      {
        q: `Was bedeutet „брат"?`,
        a: [`Sohn`, `Onkel`, `Bruder`],
        c: 2,
        m: `„Брат" verwandt mit dt. Bruder, lat. frater (→ Fraternität, Bruderschaft) und engl. brother. PIE *bʰréh₂tēr. Auch der „Bruder"-Begriff in Mönchsorden (frater) kommt hier her.`
      },
      {
        q: `Was bedeutet „дом"?`,
        a: [`Straße`, `Haus`, `Garten`],
        c: 1,
        m: `„Дом" verwandt mit lat. domus (Haus) → Domizil, domestisch, Dom. Der „Dominus" war der Herr des Hauses. Griechisch: οἶκος (→ Ökonomie = Haushaltsverwaltung).`
      },
      {
        q: `Was bedeutet „хлеб"?`,
        a: [`Brot`, `Fleisch`, `Käse`],
        c: 0,
        m: `„Хлеб" ist aus dem Germanischen entlehnt – verwandt mit dt. Laib (Brotlaib) und engl. loaf. Ein Kulturwort, das mit dem Brotbacken nach Osteuropa gelangte.`
      },
      {
        q: `Was bedeutet „молоко"?`,
        a: [`Wein`, `Milch`, `Saft`],
        c: 1,
        m: `„Молоко" ist urverwandt mit dt. Milch und engl. milk. Alle aus PIE *h₂melǵ- (melken). Das Verb „melken" steckt noch direkt drin – man „melkt" Milch heraus.`
      },
      {
        q: `Was bedeutet „рука"?`,
        a: [`Fuß`, `Kopf`, `Hand / Arm`],
        c: 2,
        m: `„Рука" steckt im deutschen Wort Rucksack! Das slawische „ruka" (Hand/Arm) wurde ins Deutsche entlehnt. Im Polnischen heißt es auch heute noch „ręka".`
      },
      {
        q: `Was bedeutet „нос"?`,
        a: [`Ohr`, `Nase`, `Mund`],
        c: 1,
        m: `„Нос" ist direkt verwandt mit dt. Nase, lat. nasus (→ nasal) und engl. nose. PIE *néh₂s-. Ein schönes Beispiel, wie lautlich sehr ähnliche Wörter über Jahrtausende erhalten bleiben.`
      },
      {
        q: `Was bedeutet „год"?`,
        a: [`Monat`, `Woche`, `Jahr`],
        c: 2,
        m: `„Год" ist verwandt mit dt. gut und engl. good – aus PIE *gʰedʰ- (passen/gut sein). Ein „gutes" Jahr war ein ernteseitig gesegnetes Jahr. „С Новым Годом!" = Frohes neues Jahr!`
      },
      {
        q: `Was bedeutet „новый"?`,
        a: [`alt`, `groß`, `neu`],
        c: 2,
        m: `„Новый" ist verwandt mit lat. novus (→ November, Innovation, Novität) und dt. neu. PIE *néwos. Новгород = „Neustadt" – genau wie Neustadt/Neutstadt im Deutschen!`
      },
      {
        q: `Was bedeutet „знать"?`,
        a: [`wissen / kennen`, `sagen`, `hören`],
        c: 0,
        m: `„Знать" ist verwandt mit dt. kennen/können, lat. gnoscere (→ Diagnose, Kognition, Ignoranz) und engl. know. PIE *ǵneh₃- = erkennen. Die Wurzel bedeutet buchstäblich „Erkenntnis gewinnen".`
      },
      {
        q: `Was bedeutet „день"?`,
        a: [`Nacht`, `Tag`, `Abend`],
        c: 1,
        m: `„День" ist verwandt mit lat. dies (Tag) → Diarium (Tagebuch) → Diary. PIE *dyew- steht für Himmel und Licht. „Добрый день!" = Guten Tag! (wörtlich: Guter Tag!)`
      },
      {
        q: `Was bedeutet „имя"?`,
        a: [`Name`, `Stimme`, `Wort`],
        c: 0,
        m: `„Имя" ist urverwandt mit lat. nomen (→ Nominativ, nominal) und dt. Name. PIE *h₁nómn̥. Faszinierend: Das Wort für „Name" klingt in fast allen indoeuropäischen Sprachen ähnlich!`
      },
      {
        q: `Was bedeutet „сердце"?`,
        a: [`Lunge`, `Magen`, `Herz`],
        c: 2,
        m: `„Сердце" verwandt mit lat. cor/cordis (→ Kordial, Concorde = Herzenseintracht) und dt. Herz. PIE *ḱér-. Das Herzwort aller europäischen Sprachen hat dieselbe Wurzel!`
      },
      {
        q: `Was bedeutet „огонь"?`,
        a: [`Wasser`, `Feuer`, `Wind`],
        c: 1,
        m: `„Огонь" ist verwandt mit lat. ignis (→ Ignition = Zündung) und Sanskrit agni (Feuer – daher der Gott Agni). PIE *h₁égnis. Im Russischen gibt es auch „пожар" für Feuer/Brand.`
      },
      {
        q: `Was bedeutet „ночь"?`,
        a: [`Morgen`, `Abend`, `Nacht`],
        c: 2,
        m: `„Ночь" direkt verwandt mit dt. Nacht, lat. nox/noctis (→ Nocturne, nächtlich) und engl. night. PIE *nókʷts. „Спокойной ночи!" = Gute Nacht! (wörtlich: Ruhiger Nacht!)`
      },
      {
        q: `Was bedeutet „небо"?`,
        a: [`Erde`, `Himmel`, `Wolke`],
        c: 1,
        m: `„Небо" ist urverwandt mit dt. Nebel und lat. nebula (→ Nebula = Nebelfleck im All)! PIE *nébʰos = Wolke/Himmel. Im Slawischen wurde aus der „Wolkendecke" der gesamte Himmel.`
      },
      {
        q: `Was bedeutet „есть" (im Sinne von essen)?`,
        a: [`schlafen`, `essen`, `laufen`],
        c: 1,
        m: `„Есть" (essen) ist verwandt mit lat. edere (essen) und dt. essen / engl. eat. PIE *h₁ed-. Achtung: „есть" bedeutet im Russischen auch „es gibt / es ist" – Kontext entscheidet!`
      },
      {
        q: `Was bedeutet „пить"?`,
        a: [`trinken`, `kaufen`, `schreiben`],
        c: 0,
        m: `„Пить" ist verwandt mit lat. potare (trinken → Potion, potable = trinkbar). PIE *peh₃-. Das englische poison (Gift) kommt übrigens auch davon – ein Trank, der tötet.`
      },
      {
        q: `Was bedeutet „видеть"?`,
        a: [`hören`, `fühlen`, `sehen`],
        c: 2,
        m: `„Видеть" ist verwandt mit lat. videre (→ Video, Vision, evident) und dt. wissen. PIE *weyd- = sehen. Im Deutschen zeigt sich noch die Doppelbedeutung: wissen = einst „gesehen haben".`
      },
      {
        q: `Was bedeutet „говорить"?`,
        a: [`zuhören`, `sprechen / reden`, `schweigen`],
        c: 1,
        m: `„Говорить" kommt von „говор" (Dialekt, Gerede). Verwandt mit „Gerücht" im alten Sinne von Gerede/Erzählung. „Говорите" ist die formelle Imperativform: Sprechen Sie!`
      },
      {
        q: `Was bedeutet „работа"?`,
        a: [`Urlaub`, `Arbeit`, `Schule`],
        c: 1,
        m: `„Работа" (Arbeit) kommt aus dem Slawischen und ist verwandt mit deutsch Roboter! „Robot" kommt aus tschechisch „robota" (Zwangsarbeit). Karel Čapeks Stück prägte das Wort weltweit.`
      },
      {
        q: `Was bedeutet „время"?`,
        a: [`Wetter`, `Zeit`, `Moment`],
        c: 1,
        m: `„Время" bedeutet Zeit UND Wetter (wie frz. temps, span. tiempo). Beide Bedeutungen teilen PIE *wer- (drehen/wenden) – Zeit als Kreislauf, Wetter als Umschwung.`
      },
      {
        q: `Was bedeutet „земля"?`,
        a: [`Himmel`, `Erde / Land`, `Meer`],
        c: 1,
        m: `„Земля" ist verwandt mit dt. Erde/Humus (lat. humus → human, Humor). Interessant: Deutsch verwendet „Erde" für Erde und Boden, Russisch „земля". Beide meinen denselben PIE *dʰéǵʰōm-Ursprung.`
      }
    ]
  },

  // ──────────────────────────────────────────────────
  {
    id: "a1-grammatik",
    name: `A1 — Grammatik`,
    schwierigkeit: 1,
    beschreibung: `Genus, Kasus, Konjugation`,
    fragen: [
      {
        q: `Welches grammatische Geschlecht hat „стол" (Tisch)?`,
        a: [`männlich`, `weiblich`, `sächlich`],
        c: 0,
        m: `Russische Nomen auf einen Konsonanten (ohne Vokalendung) sind fast immer männlich: стол, дом, брат, день. Ausnahmen bilden Wörter auf -ь – die können auch weiblich sein (дверь, ночь).`
      },
      {
        q: `Welches grammatische Geschlecht hat „книга" (Buch)?`,
        a: [`männlich`, `weiblich`, `sächlich`],
        c: 1,
        m: `Nomen auf -а/-я sind fast immer weiblich: книга, мама, женщина, неделя. Ausnahme: Männliche Personen wie папа (Papa) und дядя (Onkel) enden auf -а, bleiben aber grammatisch männlich!`
      },
      {
        q: `Welches grammatische Geschlecht hat „море" (Meer)?`,
        a: [`männlich`, `weiblich`, `sächlich`],
        c: 2,
        m: `Nomen auf -о/-е sind fast immer sächlich: море, поле, окно, слово. Wichtige Ausnahme: кофе (Kaffee) ist männlich, obwohl es auf -е endet – als entlehntes Fremdwort folgt es anderen Regeln.`
      },
      {
        q: `Was ist die korrekte Verneinung von „я знаю" (ich weiß)?`,
        a: [`я не знаю`, `я без знаю`, `я нет знаю`],
        c: 0,
        m: `Die Verneinung im Russischen ist immer „не" direkt vor dem Verb oder Adjektiv. „Нет" steht alleinstehend als „Nein" oder in „нет + Genitiv" für Nichtvorhandensein: У меня нет книги.`
      },
      {
        q: `Wie sagt man „Ich habe ein Buch" auf Russisch?`,
        a: [`Я имею книгу`, `У меня есть книга`, `Мне есть книга`],
        c: 1,
        m: `Russisch kennt kein Verb „haben"! Stattdessen: „у + Genitiv + есть" = wörtlich „bei mir gibt es". У тебя есть? = Hast du? У него/неё есть = Er/Sie hat. У нас есть = Wir haben.`
      },
      {
        q: `Wie lautet „Ich bin Student" auf Russisch?`,
        a: [`Я есть студент`, `Я являюсь студент`, `Я студент`],
        c: 2,
        m: `Im russischen Präsens fällt das Verb „быть" (sein) komplett weg! Я студент, он врач, она учитель – kein „bin/ist" nötig. Nur im Vergangenheits- (был) und Zukunftstempus (буду) erscheint es.`
      },
      {
        q: `Was ist der Plural von „стол" (Tisch)?`,
        a: [`столи`, `столы`, `столе`],
        c: 1,
        m: `Männliche und weibliche Nomen bekommen im Plural meist -ы/-и: столы, книги. Nach den Buchstaben г, к, х, ж, ш, щ, ч steht immer -и (nicht -ы), da diese eine Rechtschreibregel verlangen.`
      },
      {
        q: `Welche Endung hat ein weibliches Adjektiv im Nominativ Singular?`,
        a: [`-ый`, `-ое`, `-ая`],
        c: 2,
        m: `Adjektivendungen: männlich -ый/-ий (новый), weiblich -ая/-яя (новая), sächlich -ое/-ее (новое). Im Plural gilt für alle Geschlechter: -ые/-ие (новые). Merkhilfe: „А" = feminin.`
      },
      {
        q: `Wie fragt man „Wie heißt du?" auf Russisch?`,
        a: [`Как ты называешься?`, `Как тебя зовут?`, `Что твоё имя?`],
        c: 1,
        m: `„Как тебя зовут?" = wörtlich „Wie ruft man dich?". Das Verb „звать" (rufen) zeigt: man wird beim Namen gerufen. Formell: Как вас зовут? Die Antwort: Меня зовут... (Mich nennt man...)`
      },
      {
        q: `Was ist die 1. Person Singular von „читать" (lesen) im Präsens?`,
        a: [`я читаю`, `я читает`, `я читаем`],
        c: 0,
        m: `-ать Verben (1. Konjugation) enden in der 1. Person auf -аю: читаю, знаю, играю, понимаю, думаю. Diese Endung deckt sehr viele häufige Verben ab und ist gut zu merken!`
      },
      {
        q: `Welcher Fall steht nach „в" bei Ortsangaben (WO)?`,
        a: [`Nominativ`, `Genitiv`, `Präpositiv`],
        c: 2,
        m: `„В" + Präpositiv = WO? (в Москве). „В" + Akkusativ = WOHIN? (в Москву). Der Präpositiv heißt so, weil er im Russischen NUR nach Präpositionen steht – er hat keine eigenständige Funktion.`
      },
      {
        q: `Wie lautet der Akkusativ von „книга" (Buch)?`,
        a: [`книги`, `книге`, `книгу`],
        c: 2,
        m: `Weibliche Nomen auf -а bekommen im Akkusativ -у: книга → книгу. Ich lese das Buch = Я читаю книгу. Diese -у Endung markiert immer das direkte Objekt bei belebten und unbelebten Feminina.`
      },
      {
        q: `Was steht nach der Zahl „пять" (5): пять ___?`,
        a: [`стол`, `столы`, `столов`],
        c: 2,
        m: `Nach 5–20 steht der Genitiv Plural: пять столов. Nach 2–4: Genitiv Singular (два стола). Nach 1: Nominativ Singular (один стол). Diese Regelkette gilt auch für 21, 22 usw. (nach dem letzten Wort).`
      },
      {
        q: `Wie sagt man „mir gefällt der Film" auf Russisch?`,
        a: [`я нравлю фильм`, `мне нравится фильм`, `я люблю фильм`],
        c: 1,
        m: `„Мне нравится" = wörtlich „mir gefällt sich". Das Subjekt ist das Gefallende (der Film), die Person steht im Dativ (мне). Genau wie dt. „mir gefällt" – nicht ich mag, sondern es gefällt mir!`
      },
      {
        q: `Was ist der Unterschied zwischen „ты" und „вы"?`,
        a: [`ты = wir, вы = ihr`, `ты = du (vertraut), вы = Sie / ihr (formell)`, `ты = er, вы = sie`],
        c: 1,
        m: `Genau wie dt. du/Sie oder frz. tu/vous! „Вы" ist formelle oder Pluralform. Mit Fremden, Älteren, im Beruf immer „вы". Mit Freunden und Familie „ты". Das Duzen heißt auf Russisch „тыкать".`
      },
      {
        q: `Was bedeutet „Wortstellung im Russischen ist relativ frei"?`,
        a: [`Alles ist erlaubt, Regeln gibt es nicht`, `Kasus-Endungen zeigen Funktion – Position zeigt Betonung`, `Verben stehen immer am Ende`],
        c: 1,
        m: `„Маша любит Сашу" und „Сашу любит Маша" bedeuten beide: Mascha liebt Sascha. Die -у Endung (Akkusativ) zeigt das Objekt an, egal wo es steht. Wortstellung signalisiert Betonung und Thema.`
      },
      {
        q: `Was ist die korrekte Form: „Это ___ книга" (Dies ist eine neue Buchhandlung)?`,
        a: [`новый`, `новое`, `новая`],
        c: 2,
        m: `„Книга" ist weiblich → das Adjektiv bekommt die weibliche Endung -ая: новая книга. Это новая книга. Das Adjektiv stimmt immer in Genus, Numerus und Kasus mit dem Nomen überein.`
      },
      {
        q: `Wie bildet man das Futur von „читать" in der 1. Person?`,
        a: [`я читаю`, `я буду читать`, `я читал`],
        c: 1,
        m: `Futur Imperfektiv: „буду" (Futur von быть) + Infinitiv: я буду читать (ich werde lesen). „Читал" ist Vergangenheit. Das perfektive Futur wird anders gebildet: я прочитаю (ich werde es fertig lesen).`
      }
    ]
  },

  // ──────────────────────────────────────────────────
  {
    id: "a1-uebersetzung",
    name: `A1 — Übersetzungen`,
    schwierigkeit: 1,
    beschreibung: `Häufige Ausdrücke und Phrasen`,
    fragen: [
      {
        q: `Was bedeutet „Я не понимаю"?`,
        a: [`Ich weiß nicht`, `Ich verstehe nicht`, `Ich höre nicht`],
        c: 1,
        m: `„Понимать" (verstehen) kommt von „по-нимать" = hinaufnehmen/aufgreifen. Wörtlich: Du „greifst" den Sinn. Verwandt mit dem deutschen „Begreifen" – Verstehen als geistiges Ergreifen.`
      },
      {
        q: `Was bedeutet „Где туалет?"?`,
        a: [`Wann fährt der Bus?`, `Wo ist die Toilette?`, `Wie viel kostet das?`],
        c: 1,
        m: `„Где" = wo. Merke: г klingt wie g in „gut". „Где" ist eines der wichtigsten Fragewörter: где (wo), куда (wohin), откуда (woher).`
      },
      {
        q: `Was bedeutet „Меня зовут Анна"?`,
        a: [`Ich bin Anna`, `Ich heiße Anna`, `Kennst du Anna?`],
        c: 1,
        m: `„Меня зовут" = wörtlich „mich ruft man". „Зовут" ist 3. Person Plural von „звать" (rufen). Buchstäblich: „Man ruft mich Anna" = Ich heiße Anna.`
      },
      {
        q: `Was bedeutet „Сколько стоит?"?`,
        a: [`Wie spät ist es?`, `Wie weit ist es?`, `Wie viel kostet das?`],
        c: 2,
        m: `„Сколько" = wie viel, „стоит" = kostet (von стоять = stehen → „für wie viel steht es?"). Unverzichtbar beim Einkaufen! Antwort: „Это стоит сто рублей" (Das kostet 100 Rubel).`
      },
      {
        q: `Was bedeutet „Я живу в Германии"?`,
        a: [`Ich reise nach Deutschland`, `Ich komme aus Deutschland`, `Ich wohne in Deutschland`],
        c: 2,
        m: `„Живу" kommt von „жить" (leben/wohnen). „В Германии" steht im Präpositiv – erkennbar an der -и Endung. Wo? → в + Präpositiv. Wohin? → в + Akkusativ (Я еду в Германию).`
      },
      {
        q: `Was bedeutet „Это моя семья"?`,
        a: [`Das ist mein Freund`, `Das ist meine Familie`, `Das ist mein Zuhause`],
        c: 1,
        m: `„Семья" (Familie) soll von „семь" (sieben) kommen – früher galt 7 als typische Haushaltsgröße. „Семь" ist verwandt mit lat. septem → September (der 7. Monat im alten Kalender).`
      },
      {
        q: `Was bedeutet „Говорите помедленнее, пожалуйста"?`,
        a: [`Sprechen Sie bitte lauter`, `Sprechen Sie bitte langsamer`, `Können Sie das wiederholen?`],
        c: 1,
        m: `„Помедленнее" ist ein Komparativ von „медленный" (langsam). Das „по-" + Komparativ = etwas [Adjektiv]-er. Absolut essenziell als Sprachlernender! Einüben: Говорите помедленнее!`
      },
      {
        q: `Was bedeutet „Я не говорю по-русски"?`,
        a: [`Ich lerne Russisch`, `Ich spreche kein Russisch`, `Ich verstehe Russisch`],
        c: 1,
        m: `„По-русски" = auf Russisch (wörtlich: nach russischer Art). Schema: по- + Sprache: по-немецки (auf Deutsch), по-японски (auf Japanisch), по-английски (auf Englisch).`
      },
      {
        q: `Was bedeutet „Который час?"?`,
        a: [`Welcher Tag ist heute?`, `Wie spät ist es?`, `Wie lange dauert es?`],
        c: 1,
        m: `„Который" = welcher/der wievielte, „час" = Stunde/Uhr. Wörtlich: „Die wievielte Stunde?" Alternative: „Сколько времени?" Antwort: „Сейчас три часа" (Es ist jetzt 3 Uhr).`
      },
      {
        q: `Was bedeutet „Как вы себя чувствуете?"?`,
        a: [`Wo leben Sie?`, `Wie geht es Ihnen?`, `Was machen Sie?`],
        c: 1,
        m: `„Чувствовать" = fühlen, „себя" = sich (Reflexivpronomen). Wörtlich: „Wie fühlen Sie sich?" Umgangssprachlich: „Как дела?" (Wie läuft's?). Antwort: „Хорошо, спасибо!"`
      },
      {
        q: `Wie sagt man „Entschuldigung" auf Russisch?`,
        a: [`Пожалуйста`, `Извините`, `Спасибо`],
        c: 1,
        m: `„Извините" kommt von „вина" (Schuld) + из- (heraus). Wörtlich: „Nehmt die Schuld heraus aus mir". Informell: „Извини" (ohne -те). Пожалуйста = bitte, Спасибо = danke.`
      },
      {
        q: `Was bedeutet „Мне холодно"?`,
        a: [`Das Wetter ist kalt`, `Mir ist kalt`, `Der Winter ist kalt`],
        c: 1,
        m: `Körperempfindungen werden auf Russisch unpersönlich ausgedrückt! „Мне" = mir (Dativ) + Adverb. Schema: мне жарко (mir ist heiß), мне хорошо (mir geht's gut), мне скучно (mir ist langweilig).`
      },
      {
        q: `Was bedeutet „Давай познакомимся!"?`,
        a: [`Tschüss, bis bald!`, `Ich kenne dich bereits`, `Lass uns uns kennenlernen!`],
        c: 2,
        m: `„Познакомимся" kommt von „знать" (kennen) + Präfix по- + Suffix -ться (reflexiv) = sich miteinander bekannt machen. Die Wurzel „зна-" taucht überall auf: знание (Wissen), знакомый (Bekannter).`
      }
    ]
  },

  // ──────────────────────────────────────────────────
  {
    id: "aspekte",
    name: `Verbalaspekte`,
    schwierigkeit: 2,
    beschreibung: `Imperfektiv vs. Perfektiv — wann und warum?`,
    fragen: [
      {
        q: `Was ist der Hauptunterschied zwischen „читать" und „прочитать"?`,
        a: [`прочитать ist höflicher`, `читать = lesen (Prozess), прочитать = fertig lesen (Ergebnis)`, `Beide bedeuten dasselbe`],
        c: 1,
        m: `читать (impf.) = lesen, im Allgemeinen oder gerade dabei. прочитать (pf.) = zu Ende lesen, das Buch ist durch. Imperfektiv = Prozess oder Wiederholung. Perfektiv = abgeschlossenes Ergebnis.`
      },
      {
        q: `„Ich habe gestern das Buch fertig gelesen." Welcher Satz ist richtig?`,
        a: [`Я читал книгу вчера.`, `Я прочитал книгу вчера.`, `Я буду читать книгу вчера.`],
        c: 1,
        m: `Perfektiv bei abgeschlossenem Ergebnis! „Я прочитал книгу" = fertig gelesen, das Buch ist durch. „Я читал книгу" sagt nur: Ich las (Prozess), ohne zu sagen ob fertig oder nicht.`
      },
      {
        q: `„Ich lese jeden Tag eine Stunde." Welche Form passt?`,
        a: [`Я прочитаю каждый день час.`, `Я читаю каждый день час.`, `Я читал каждый день час.`],
        c: 1,
        m: `Gewohnheiten und Wiederholungen → immer Imperfektiv! „Я читаю каждый день" (ich lese jeden Tag). Perfektiv würde eine einmalige, abgeschlossene Handlung beschreiben – passt nicht zu „jeden Tag".`
      },
      {
        q: `„Ruf mich einmal an!" — Eine konkrete, einmalige Bitte. Welche Form?`,
        a: [`Звони мне! (imperfektiv)`, `Позвони мне! (perfektiv)`, `Оба sind gleich gut`],
        c: 1,
        m: `Позвони! (pf.) = Ruf einmal an — einmalige, konkrete Bitte. Звони! (impf.) = Ruf mich an (öfter, immer mal wieder). Bei einmaligen Aufforderungen → Perfektiv. Bei Gewohnheiten → Imperfektiv.`
      },
      {
        q: `Was ist das perfektive Pendant von „писать" (schreiben)?`,
        a: [`записать`, `вписать`, `написать`],
        c: 2,
        m: `написать = fertig schreiben (Standard-Aspektpaar von писать). Das Präfix „на-" macht oft den Standardperfektiv von Schreibverben: писать/написать, рисовать/нарисовать. записать = notieren, вписать = einschreiben.`
      },
      {
        q: `„Я учил слова" vs „Я выучил слова" — wo ist der Unterschied?`,
        a: [`учил = Präsens, выучил = Futur`, `учил = ich lernte (Prozess, offen), выучил = ich habe gelernt (fertig, ich kann sie!)`, `Kein Unterschied, beide sind Vergangenheit`],
        c: 1,
        m: `учил (impf.) = ich war beim Lernen, Prozess ohne Aussage über Ergebnis. выучил (pf.) = ich habe sie gelernt und kann sie jetzt — das Ergebnis ist da! Perfektiv = Handlung + ihr Ergebnis.`
      },
      {
        q: `Nach „начать" (anfangen): Welchen Aspekt benutzt man?`,
        a: [`Perfektiv: начать прочитать`, `Imperfektiv: начать читать`, `Beide sind möglich`],
        c: 1,
        m: `Nach начать, продолжать, заканчивать steht der Imperfektiv-Infinitiv — der Fokus liegt auf dem Prozess: начать читать (anfangen zu lesen). „Anfangen fertig zu lesen" wäre ein semantischer Widerspruch.`
      },
      {
        q: `Allgemeines Verbot: „Rauch hier nicht!" Welche Form ist richtig?`,
        a: [`Не покури здесь! (perfektiv)`, `Не кури здесь! (imperfektiv)`, `Beide sind korrekt`],
        c: 1,
        m: `Verbote stehen fast immer im imperfektivischen Imperativ: Не кури! (Rauch nicht!). Der negative perfektive Imperativ hat eine andere Nuance — eher eine Warnung: „Sieh zu, dass du nicht..." Regel: Verbote → Imperfektiv.`
      },
      {
        q: `„Ich werde den Brief schreiben (und fertigstellen)." Wie auf Russisch?`,
        a: [`Я буду писать письмо.`, `Я напишу письмо.`, `Я написал письмо.`],
        c: 1,
        m: `Perfektives Futur wird direkt konjugiert: напишу (ich werde fertig schreiben). Imperfektives Futur: буду писать = werde am Schreiben sein (Prozess, ohne Aussage über Abschluss). Für konkreten Abschluss → Perfektiv.`
      },
      {
        q: `„Er rief an, während ich las." — Welcher Aspekt für „ich las"?`,
        a: [`imperfektiv: я читал (Hintergrundhandlung, dauerte an)`, `perfektiv: я прочитал (fertig gelesen)`, `Beide passen gleich gut`],
        c: 0,
        m: `Hintergrundhandlungen in der Vergangenheit → Imperfektiv! „Он позвонил, пока я читал" — das Lesen dauerte an (impf.), der Anruf unterbrach es (pf. позвонил). Imperfektiv = Hintergrund, Perfektiv = Ereignis.`
      }
    ]
  }

  // ──────────────────────────────────────────────────
  ,{
    id: "vokabeln-de-ru",
    name: "A1 — Deutsch → Russisch",
    schwierigkeit: 1,
    beschreibung: "Wie heißt das auf Russisch?",
    fragen: [
      { q: `Wie heißt „Sonne" auf Russisch?`, a: [`луна`, `небо`, `солнце`], c: 2, m: `„Солнце" ist urverwandt mit lat. sol → Solar, Solarium. PIE *sóh₂wl̥ steckt in fast allen europäischen Sprachen.` },
      { q: `Wie heißt „Wasser" auf Russisch?`, a: [`молоко`, `вода`, `огонь`], c: 1, m: `„Вода" ist urverwandt mit dt. Wasser, engl. water und lat. unda. Und „водка" bedeutet wörtlich „Wässerchen"!` },
      { q: `Wie heißt „Mutter" auf Russisch?`, a: [`мать`, `брат`, `имя`], c: 0, m: `„Мать" ist direkt verwandt mit dt. Mutter, lat. mater (→ maternal) und engl. mother. PIE *méh₂tēr.` },
      { q: `Wie heißt „Bruder" auf Russisch?`, a: [`дом`, `мать`, `брат`], c: 2, m: `„Брат" verwandt mit dt. Bruder, lat. frater (→ Fraternität) und engl. brother. PIE *bʰréh₂tēr.` },
      { q: `Wie heißt „Haus" auf Russisch?`, a: [`земля`, `дом`, `год`], c: 1, m: `„Дом" verwandt mit lat. domus → Domizil, domestisch. Der „Dominus" war der Herr des Hauses.` },
      { q: `Wie heißt „Brot" auf Russisch?`, a: [`хлеб`, `молоко`, `вода`], c: 0, m: `„Хлеб" aus dem Germanischen entlehnt – verwandt mit dt. Laib (Brotlaib) und engl. loaf.` },
      { q: `Wie heißt „Milch" auf Russisch?`, a: [`вода`, `хлеб`, `молоко`], c: 2, m: `„Молоко" urverwandt mit dt. Milch und engl. milk. PIE *h₂melǵ- (melken). Das Verb „melken" steckt direkt drin.` },
      { q: `Wie heißt „Hand / Arm" auf Russisch?`, a: [`нос`, `рука`, `сердце`], c: 1, m: `„Рука" steckt im deutschen Wort Rucksack! Das slawische „ruka" (Hand/Arm) wurde ins Deutsche entlehnt.` },
      { q: `Wie heißt „Nase" auf Russisch?`, a: [`рука`, `нос`, `имя`], c: 1, m: `„Нос" direkt verwandt mit dt. Nase, lat. nasus (→ nasal) und engl. nose. PIE *néh₂s-.` },
      { q: `Wie heißt „Jahr" auf Russisch?`, a: [`день`, `время`, `год`], c: 2, m: `„Год" verwandt mit dt. gut und engl. good. Ein „gutes" Jahr war ein gesegnetes Erntejahr. С Новым Годом!` },
      { q: `Wie heißt „neu" auf Russisch?`, a: [`большой`, `старый`, `новый`], c: 2, m: `„Новый" verwandt mit lat. novus (→ November, Innovation) und dt. neu. Новгород = Neustadt!` },
      { q: `Wie heißt „wissen / kennen" auf Russisch?`, a: [`говорить`, `знать`, `видеть`], c: 1, m: `„Знать" verwandt mit dt. kennen, lat. gnoscere (→ Diagnose, Kognition) und engl. know. PIE *ǵneh₃-.` },
      { q: `Wie heißt „Tag" auf Russisch?`, a: [`ночь`, `небо`, `день`], c: 2, m: `„День" verwandt mit lat. dies (Tag) → Diarium. Добрый день! = Guten Tag! (wörtlich: Guter Tag!)` },
      { q: `Wie heißt „Name" auf Russisch?`, a: [`время`, `имя`, `земля`], c: 1, m: `„Имя" urverwandt mit lat. nomen (→ Nominativ) und dt. Name. PIE *h₁nómn̥ – klingt in fast allen indoeuropäischen Sprachen ähnlich!` },
      { q: `Wie heißt „Herz" auf Russisch?`, a: [`огонь`, `сердце`, `земля`], c: 1, m: `„Сердце" verwandt mit lat. cor/cordis (→ Concorde = Herzenseintracht) und dt. Herz. PIE *ḱér-.` },
      { q: `Wie heißt „Feuer" auf Russisch?`, a: [`вода`, `земля`, `огонь`], c: 2, m: `„Огонь" verwandt mit lat. ignis (→ Ignition) und Sanskrit agni (Feuer, Gott Agni). PIE *h₁égnis.` },
      { q: `Wie heißt „Nacht" auf Russisch?`, a: [`день`, `небо`, `ночь`], c: 2, m: `„Ночь" direkt verwandt mit dt. Nacht, lat. nox (→ Nocturne) und engl. night. Спокойной ночи! = Gute Nacht!` },
      { q: `Wie heißt „Himmel" auf Russisch?`, a: [`земля`, `небо`, `огонь`], c: 1, m: `„Небо" urverwandt mit dt. Nebel und lat. nebula! PIE *nébʰos = Wolke/Himmel. Aus der „Wolkendecke" wurde der gesamte Himmel.` },
      { q: `Wie heißt „essen" auf Russisch?`, a: [`пить`, `есть`, `знать`], c: 1, m: `„Есть" verwandt mit lat. edere und dt. essen / engl. eat. Achtung: „есть" bedeutet auch „es gibt / es ist"!` },
      { q: `Wie heißt „trinken" auf Russisch?`, a: [`есть`, `говорить`, `пить`], c: 2, m: `„Пить" verwandt mit lat. potare (→ Potion). Das englische poison (Gift) kommt auch davon – ein Trank, der tötet.` },
      { q: `Wie heißt „sehen" auf Russisch?`, a: [`знать`, `говорить`, `видеть`], c: 2, m: `„Видеть" verwandt mit lat. videre (→ Video, Vision) und dt. wissen. PIE *weyd-. Wissen = einst „gesehen haben".` },
      { q: `Wie heißt „sprechen / reden" auf Russisch?`, a: [`говорить`, `знать`, `видеть`], c: 0, m: `„Говорить" kommt von „говор" (Dialekt, Gerede). Говорите! = Sprechen Sie! (formeller Imperativ)` },
      { q: `Wie heißt „Arbeit" auf Russisch?`, a: [`время`, `работа`, `земля`], c: 1, m: `„Работа" ist verwandt mit deutsch Roboter! Aus tschechisch „robota" (Zwangsarbeit). Karel Čapeks Stück prägte das Wort weltweit.` },
      { q: `Wie heißt „Zeit" auf Russisch?`, a: [`год`, `день`, `время`], c: 2, m: `„Время" bedeutet Zeit UND Wetter (wie frz. temps). Beide teilen PIE *wer- (drehen/wenden) – Zeit als Kreislauf.` },
      { q: `Wie heißt „Erde / Land" auf Russisch?`, a: [`небо`, `вода`, `земля`], c: 2, m: `„Земля" verwandt mit lat. humus (→ human, Humor). Deutsch „Erde" und russisch „земля" – beide aus PIE *dʰéǵʰōm-.` }
    ]
  }

  // Hier weitere Quizze hinzufügen:
  // ,{
  //   id: "a2-...",
  //   name: "A2 — ...",
  //   schwierigkeit: 2,
  //   beschreibung: "...",
  //   fragen: [ ... ]
  // }

];
