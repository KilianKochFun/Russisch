// SRS Level-Definitionen: ~482 Vokabeln in 24 Level
// Sortiert nach Häufigkeit/Nützlichkeit, thematisch gruppiert
// Jeder Eintrag ist der Key "ru|de" der Vokabel

const SRS_LEVELS = [

  // ── Level 1: Familie & Personen (Grundlagen) ──
  [
    'мама|Mama', 'папа|Papa', 'брат|Bruder', 'сестра|Schwester',
    'бабушка|Großmutter', 'дедушка|Großvater', 'друг|Freund', 'подруга|Freundin',
    'жена|Ehefrau', 'муж|Mann', 'сын|Sohn', 'дочь|Tochter',
    'ребёнок|Kind', 'мальчик|Junge', 'девочка|Mädchen', 'девушка|junge Frau',
    'мужчина|Mann', 'женщина|Frau', 'человек|Mensch', 'семья|Familie',
  ],

  // ── Level 2: Grundverben (Alltag) ──
  [
    'говорить|sprechen', 'делать|machen', 'знать|wissen', 'жить|leben',
    'думать|denken', 'видеть|sehen', 'идти|gehen', 'ехать|fahren',
    'давать|geben', 'брать|nehmen', 'есть|essen', 'пить|trinken',
    'спать|schlafen', 'работать|arbeiten', 'играть|spielen', 'любить|lieben',
    'хотеть|wollen', 'мочь|können', 'учить|lernen', 'писать|schreiben',
  ],

  // ── Level 3: Haus & Wohnung ──
  [
    'дом|Haus', 'квартира|Wohnung', 'комната|Zimmer', 'кухня|Küche',
    'окно|Fenster', 'дверь|Tür', 'стена|Wand', 'стол|Tisch',
    'стул|Stuhl', 'кресло|Sessel', 'шкаф|Schrank', 'лампа|Lampe',
    'мебель|Möbel', 'этаж|Stockwerk', 'сад|Garten', 'ключ|Schlüssel',
    'домохозяйка|Hausfrau', 'сосед|Nachbar', 'место|Platz', 'вход|Eingang',
  ],

  // ── Level 4: Essen & Trinken ──
  [
    'еда|Essen', 'хлеб|Brot', 'масло|Butter', 'молоко|Milch',
    'мясо|Fleisch', 'рыба|Fisch', 'суп|Suppe', 'салат|Salat',
    'картошка|Kartoffel', 'овощ|Gemüse', 'фрукт|Frucht', 'яблоко|Apfel',
    'яйцо|Ei', 'сыр|Käse', 'колбаса|Wurst', 'сахар|Zucker',
    'соль|Salz', 'чай|Tee', 'сок|Saft', 'вода|Wasser',
  ],

  // ── Level 5: Grundadjektive ──
  [
    'большой|groß', 'маленький|klein', 'новый|neu', 'старый|alt',
    'хороший|gut', 'плохой|schlecht', 'красивый|schön', 'молодой|jung',
    'богатый|reich', 'бедный|arm', 'сильный|stark', 'лёгкий|leicht',
    'трудный|schwer', 'интересный|interessant', 'известный|bekannt',
    'серьёзный|ernst', 'весёлый|fröhlich', 'добрый|gutmütig', 'умный|klug',
    'смелый|mutig',
  ],

  // ── Level 6: Tage & Monate I ──
  [
    'день|Tag', 'неделя|Woche', 'месяц|Monat', 'год|Jahr',
    'время|Zeit', 'час|Stunde', 'минута|Minute', 'утро|der Morgen (Tagesanfang)',
    'вечер|Abend', 'ночь|Nacht', 'понедельник|Montag', 'вторник|Dienstag',
    'среда|Mittwoch', 'четверг|Donnerstag', 'пятница|Freitag', 'суббота|Samstag',
    'воскресенье|Sonntag', 'раз|Mal', 'следующий|nächste', 'настоящий|echt',
  ],

  // ── Level 7: Monate & Jahreszeiten ──
  [
    'январь|Januar', 'февраль|Februar', 'март|März', 'апрель|April',
    'май|Mai', 'июнь|Juni', 'июль|Juli', 'август|August',
    'сентябрь|September', 'октябрь|Oktober', 'ноябрь|November', 'декабрь|Dezember',
    'весна|Frühling', 'лето|Sommer', 'осень|Herbst', 'зима|Winter',
    'погода|Wetter', 'дождь|Regen', 'снег|Schnee', 'солнце|Sonne',
  ],

  // ── Level 8: Farben & Aussehen ──
  [
    'белый|weiß', 'чёрный|schwarz', 'красный|Rot', 'синий|blau',
    'зелёный|Grün', 'жёлтый|gelb', 'голубой|hellblau', 'коричневый|braun',
    'серый|grau', 'цвет|Farbe', 'цветок|Blume', 'глаз|Auge',
    'голова|Kopf', 'рука|Hand', 'нога|Fuß', 'рот|Mund',
    'лицо|Gesicht', 'высокий|hoch', 'горячий|heiß', 'холодный|kalt',
  ],

  // ── Level 9: Stadt & Orte ──
  [
    'город|Stadt', 'улица|Straße', 'площадь|Platz', 'парк|Park',
    'магазин|Geschäft', 'ресторан|Restaurant', 'аптека|Apotheke', 'банк|Bank',
    'гостиница|Hotel', 'библиотека|Bibliothek', 'музей|Museum', 'театр|Theater',
    'вокзал|Bahnhof', 'остановка|Haltestelle', 'аэропорт|Flughafen', 'стадион|Stadion',
    'центр|Mitte / Mittelpunkt', 'район|Gebiet', 'страна|Land', 'столица|Hauptstadt',
  ],

  // ── Level 10: Transport & Bewegung ──
  [
    'машина|Auto', 'автобус|Bus', 'трамвай|Straßenbahn', 'троллейбус|Trolleybus',
    'поезд|Zug', 'самолет|airplane', 'транспорт|Transport', 'дорога|Weg',
    'ходить|gehen', 'ездить|fahren', 'поехать|fahren', 'пойти|losgehen (gehen',
    'приезжать|ankommen', 'опаздывать|sich verspäten', 'поездка|Reise',
    'билет|Eintrittskarte', 'касса|Kasse', 'станция|Station', 'карта|Karte',
    'адрес|Adresse',
  ],

  // ── Level 11: Arbeit & Beruf ──
  [
    'работа|Arbeit', 'профессия|Beruf', 'врач|Arzt', 'учитель|Lehrer',
    'учительница|Lehrerin', 'преподаватель|Lehrer', 'инженер|Ingenieur',
    'журналист|Journalist', 'артист|Künstler', 'художник|(Kunst)maler',
    'писатель|Schriftsteller', 'поэт|Dichter', 'музыкант|Musiker',
    'бизнесмен|Geschäftsmann', 'менеджер|Manager', 'юрист|Jurist',
    'хозяин|Besitzer', 'господин|Herr', 'гость|Gast', 'житель|Einwohner',
  ],

  // ── Level 12: Schule & Bildung ──
  [
    'школа|Schule', 'университет|Universität', 'студент|Student', 'ученик|Schüler',
    'учебник|Lehrbuch', 'тетрадь|Heft', 'книга|Buch', 'ручка|Stift',
    'карандаш|Bleistift', 'урок|Lektion', 'лекция|Vorlesung', 'класс|Klasse',
    'экзамен|Prüfung', 'упражнение|Übung', 'ошибка|Fehler', 'слово|Wort',
    'словарь|Wörterbuch', 'вопрос|Frage', 'ответ|Antwort', 'предмет|Gegenstand',
  ],

  // ── Level 13: Kommunikation & Medien ──
  [
    'телефон|Telefon', 'компьютер|Computer', 'телевизор|Fernsehgerät', 'газета|Zeitung',
    'журнал|Zeitschrift', 'письмо|Brief', 'открытка|Postkarte', 'конверт|Briefumschlag',
    'почта|Post', 'марка|Briefmarke', 'звонить|anrufen', 'позвонить|klingeln',
    'называться|heißen', 'написать|schreiben', 'сказать|sagen', 'просить|bitten',
    'попросить|bitten', 'посылать|schicken', 'разговаривать|sprechen',
    'коммуникация|Kommunikation',
  ],

  // ── Level 14: Essen gehen & Mahlzeiten ──
  [
    'завтрак|Frühstück', 'завтракать|frühstücken', 'обед|Mittagessen',
    'обедать|Mittag essen', 'ужин|Abendessen', 'ужинать|Abendbrot essen',
    'пообедать|Mittag essen', 'поужинать|Abendbrot essen', 'столовая|Kantine',
    'пиво|Bier', 'вино|Wein', 'мороженое|Eis (Speiseeis)', 'курица|Huhn',
    'ложка|Der Löffel', 'чашка|Tasse', 'чайник|Teekessel', 'нож|Messer',
    'купить|kaufen', 'покупать|kaufen', 'стоить|kosten',
  ],

  // ── Level 15: Kleidung & Einkaufen ──
  [
    'одежда|Kleidung', 'платье|Kleid', 'костюм|Anzug', 'рубашка|Hemd',
    'пальто|Mantel', 'шарф|Schal', 'обувь|Schuhe', 'очки|Brille',
    'сумка|Tasche', 'размер|Größe', 'цена|Preis', 'дорогой|teuer',
    'дешёвый|billig', 'копейка|Kopeke', 'рубль|Rubel', 'деньги|Geld',
    'номер|Nummer', 'килограмм|Kilogramm', 'грамм|Gramm', 'метр|Meter',
  ],

  // ── Level 16: Weitere Verben (Alltag) ──
  [
    'встречать|treffen', 'гулять|spazieren', 'дарить|schenken', 'подарить|schenken',
    'ждать|warten', 'желать|wünschen', 'лежать|liegen', 'сидеть|sitzen',
    'стоять|stehen', 'смотреть|schauen', 'посмотреть|schauen', 'петь|singen',
    'танцевать|tanzen', 'курить|rauchen', 'отдыхать|sich ausruhen',
    'помнить|sich erinnern', 'повторять|wiederholen', 'продолжать|fortsetzen',
    'спрашивать|fragen', 'находиться|sich befinden',
  ],

  // ── Level 17: Familie erweitert & Beziehungen ──
  [
    'внук|Enkel', 'внучка|Enkelin', 'дядя|Onkel', 'тётя|Tante',
    'мать|Mutter', 'отец|Vater', 'родственник|Verwandter', 'родной|verwandt',
    'рождение|Geburt', 'свидание|Verabredung', 'любовь|Liebe', 'желание|Wunsch',
    'жизнь|Leben', 'смерть|Tod', 'здоровье|Gesundheit', 'здоровый|gesund',
    'больной|krank', 'счастливый|glücklich', 'рад|froh', 'свободный|frei',
  ],

  // ── Level 18: Weitere Adjektive ──
  [
    'активный|aktiv', 'великий|groß', 'городской|städtisch', 'готовый|bereit',
    'детский|kindlich', 'женский|weiblich', 'мужской|Männer-', 'книжный|Buch-',
    'любимый|Lieblings-', 'народный|Volks-', 'научный|wissenschaftlich',
    'нужный|brauchen', 'общий|gemeinsam', 'современный|modern', 'спокойный|ruhig',
    'старший|der ältere', 'младший|der jüngere', 'разный|verschieden',
    'другой|andere', 'правый|(der/die/das) Rechte',
  ],

  // ── Level 19: Kultur & Unterhaltung ──
  [
    'музыка|Musik', 'фильм|Film', 'балет|Ballett', 'концерт|Konzert',
    'комедия|Komödie', 'роман|Roman', 'рассказ|Erzählung', 'литература|Literatur',
    'история|Geschichte', 'программа|Programm', 'гитара|Gitarre', 'спорт|Sport',
    'футбол|Fußball', 'теннис|Tennis', 'бассейн|Schwimmbad', 'цирк|Zirkus',
    'фотография|Foto', 'фотоаппарат|Fotoapparat', 'фотографировать|fotografieren',
    'удовольствие|Vergnügen',
  ],

  // ── Level 20: Wissenschaft & Studium ──
  [
    'биология|Biologie', 'математика|Mathematik', 'физика|Physik',
    'философия|Philosophie', 'медицина|Medizin', 'экономика|Wirtschaft',
    'техника|Technik', 'архитектура|Architektur',
    'образование|Bildung', 'факультет|Fakultät', 'специальность|Fach',
    'качество|Qualität', 'курс|Kurs', 'группа|Gruppe',
    'аудитория|Auditorium', 'кабинет|Zimmer', 'учреждение|(öffentl.) Einrichtung',
    'учёный|gelehrt',
  ],

  // ── Level 21: Staat & Gesellschaft ──
  [
    'Россия|Russland', 'русский|der Russe', 'российский|russisch',
    'английский|Englisch', 'англичанин|Engländer', 'немец|der Deutsche',
    'немецкий|Deutsch', 'французский|Französisch', 'иностранец|Ausländer',
    'иностранный|ausländisch', 'национальность|Nationalität', 'национальный|National-',
    'государственный|staatlich', 'московский|Moskauer', 'язык|Sprache',
    'имя|Name', 'фамилия|Familienname', 'документ|Dokument', 'паспорт|Personalausweis',
    'виза|Visum',
  ],

  // ── Level 22: Erweiterte Verben ──
  [
    'взять|nehmen', 'увидеть|sehen', 'сделать|machen', 'смочь|können',
    'учиться|erlernen', 'становиться|werden (zu)', 'строить|bauen',
    'мечтать|träumen', 'нравиться|gefallen', 'понравиться|gefallen',
    'поступать|behandeln', 'кончать|fertig sein', 'умирать|sterben',
    'уставать|müde sein', 'чувствовать|fühlen', 'здравствовать|leben',
    'подумать|denken',
    'будущий|zukünftig', 'должный|sollen',
  ],

  // ── Level 23: Sonstiges I ──
  [
    'завод|Fabrik', 'фабрика|Fabrik', 'фирма|Firma', 'клуб|Klub',
    'общежитие|Wohnheim', 'милиция|Miliz', 'мир|Welt', 'свет|Licht',
    'река|Fluss', 'море|Meer', 'собака|Hund', 'кошка|Katze',
    'картина|Bild', 'подарок|Geschenk', 'сувенир|Souvenir', 'событие|Ereignis',
    'новость|Neuigkeit', 'передача|Weitergabe (Abgabe', 'век|Jahrhundert',
    'половина|die Hälfte',
  ],

  // ── Level 24: Sonstiges II ──
  [
    'левый|Linke(r', 'южный|südlich', 'северный|nördlich',
    'исторический|historisch', 'экономический|Wirtschafts-', 'студенческий|Studenten-',
    'бытовой|Alltags-', 'разумный|vernünftig', 'талантливый|talentiert',
    'согласный|einverstanden', 'статья|Artikel', 'страница|Seite',
    'число|Zahl', 'часть|Teil / Stück', 'часы|Uhr', 'единица|Einheit',
    'конец|Ende', 'форма|die Form', 'приложение|Anhang',
    'продукт|Produkt',
  ],
];

if (typeof module !== 'undefined') module.exports = SRS_LEVELS;
