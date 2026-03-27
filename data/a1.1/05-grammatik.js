module.exports = {
  typ: `grammatik`,
  titel: `Verneinung & Haben`,
  fragen: [
    {
      q: `Was ist die korrekte Verneinung von „я знаю"?`,
      a: [`я не знаю`, `я без знаю`, `я нет знаю`],
      c: 0,
      m: `Verneinung = не direkt vor dem Verb: я не знаю, он не говорит. нет steht allein als „Nein".`
    },
    {
      q: `Wie sagt man „Ich habe ein Buch"?`,
      a: [`Я имею книгу`, `У меня есть книга`, `Мне есть книга`],
      c: 1,
      m: `Russisch hat kein haben-Verb! у + Genitiv + есть = „bei mir gibt es". У тебя есть? = Hast du?`
    },
    {
      q: `Was bedeutet „У него нет денег"?`,
      a: [`Er hat viel Geld`, `Er hat kein Geld`, `Er braucht Geld`],
      c: 1,
      m: `нет + Genitiv = es gibt kein... Verneinung von есть ist нет. У него нет = er hat kein.`
    },
    {
      q: `Wie sagt man „Hast du ein Visum?"`,
      a: [`Ты имеешь виза?`, `У тебя есть виза?`, `Ты есть виза?`],
      c: 1,
      m: `Haben-Frage: у + Pronomen (Genitiv) + есть + Nominativ. у тебя = bei dir (von ты).`
    },
    {
      q: `„У нас ___ времени." — Wir haben keine Zeit.`,
      a: [`есть`, `нет`, `не`],
      c: 1,
      m: `нет + Genitiv = kein/keine. У нас нет времени = Wir haben keine Zeit. времени = Genitiv von время.`
    },
    {
      q: `Wie verneint man: „Das ist nicht schön"?`,
      a: [`Это нет красивый`, `Это не красивый`, `Это без красивый`],
      c: 1,
      m: `не steht vor allem was verneint wird: Verb, Adjektiv, Nomen. нет steht nur allein = Nein.`
    },
    {
      q: `Was ist der Unterschied: „не" vs „нет"?`,
      a: [`не = kein, нет = nicht`, `не = vor Verb/Adj, нет = allein oder нет + Genitiv`, `beide bedeuten dasselbe`],
      c: 1,
      m: `не direkt vor Verb oder Adjektiv. нет = Nein allein ODER у меня нет + Genitiv = ich habe kein...`
    },
    {
      q: `Wie fragt man „Hat sie Geld?" auf Russisch?`,
      a: [`Она имеет деньги?`, `У неё есть деньги?`, `Есть она деньги?`],
      c: 1,
      m: `у неё = bei ihr (Genitiv von она). Serie: у меня / у тебя / у него / у неё / у нас / у вас / у них.`
    },
    {
      q: `Wie lautet „у + я" (Genitiv von я) in der Haben-Konstruktion?`,
      a: [`у мне`, `у я`, `у меня`],
      c: 2,
      m: `у меня есть = ich habe. меня ist der Genitiv (und Akkusativ) von я.`
    },
    {
      q: `Wie lautet „у + ты" (Genitiv von ты)?`,
      a: [`у тебя`, `у ты`, `у тебе`],
      c: 0,
      m: `у тебя есть = du hast. тебя ist der Genitiv von ты. У тебя есть брат? = Hast du einen Bruder?`
    },
    {
      q: `Wie lautet „у + он" (Genitiv von он)?`,
      a: [`у него`, `у его`, `у ему`],
      c: 0,
      m: `у него есть = er hat. него ist der Genitiv von он (mit н- nach Präposition). Merke: у него, у неё, у них.`
    },
    {
      q: `Wie lautet „у + она" (Genitiv von она)?`,
      a: [`у её`, `у неё`, `у ней`],
      c: 1,
      m: `у неё есть = sie hat. неё ist der Genitiv von она (mit н- nach Präposition у).`
    },
    {
      q: `Wie lautet „у + мы" (Genitiv von мы)?`,
      a: [`у нас`, `у мы`, `у нам`],
      c: 0,
      m: `у нас есть = wir haben. нас ist der Genitiv von мы. У нас есть дом = Wir haben ein Haus.`
    },
    {
      q: `Wie lautet „у + вы" (Genitiv von вы)?`,
      a: [`у вас`, `у вы`, `у вам`],
      c: 0,
      m: `у вас есть = ihr habt / Sie haben. вас ist der Genitiv von вы. У вас есть паспорт? = Haben Sie einen Pass?`
    },
    {
      q: `Wie lautet „у + они" (Genitiv von они)?`,
      a: [`у ихних`, `у их`, `у них`],
      c: 2,
      m: `у них есть = sie haben (Plural). них ist der Genitiv von они (mit н- nach Präposition). У них есть дети.`
    },
    {
      q: `Wie sagt man „Ich habe keine Schwester"?`,
      a: [`У меня нет сестра`, `У меня нет сестры`, `Я не имею сестру`],
      c: 1,
      m: `нет + Genitiv: сестры (Gen. von сестра). У меня нет сестры = Ich habe keine Schwester.`
    },
    {
      q: `Wie sagt man „Du hast keinen Bruder"?`,
      a: [`У тебя нет брата`, `У тебя нет брат`, `Ты не имеешь брат`],
      c: 0,
      m: `нет + Genitiv: брата (Gen. von брат, maskulin -а). У тебя нет брата = Du hast keinen Bruder.`
    },
    {
      q: `Wie sagt man „Er hat kein Auto"?`,
      a: [`У него нет машины`, `У него нет машина`, `Он не имеет машину`],
      c: 0,
      m: `нет + Genitiv: машины (Gen. von машина). У него нет машины = Er hat kein Auto.`
    },
    {
      q: `Wie sagt man „Sie (она) hat keine Zeit"?`,
      a: [`У неё нет времени`, `У неё нет время`, `Она нет времени`],
      c: 0,
      m: `нет + Genitiv: времени (Gen. von время). У неё нет времени = Sie hat keine Zeit.`
    },
    {
      q: `Wie sagt man „Wir haben kein Geld"?`,
      a: [`У нас нет деньги`, `У нас нет денег`, `Мы нет деньги`],
      c: 1,
      m: `нет + Genitiv Plural: денег (Gen. Pl. von деньги). У нас нет денег = Wir haben kein Geld.`
    },
    {
      q: `Wie sagt man „Ihr habt kein Zimmer"?`,
      a: [`У вас нет комнаты`, `У вас нет комната`, `Вы нет комнаты`],
      c: 0,
      m: `нет + Genitiv: комнаты (Gen. von комната). У вас нет комнаты = Ihr habt kein Zimmer.`
    },
    {
      q: `Wie sagt man „Sie (они) haben keinen Hund"?`,
      a: [`У них нет собака`, `У них нет собаки`, `Они нет собаки`],
      c: 1,
      m: `нет + Genitiv: собаки (Gen. von собака). У них нет собаки = Sie haben keinen Hund.`
    },
    {
      q: `Wie verneint man „она читает"?`,
      a: [`она нет читает`, `она читает нет`, `она не читает`],
      c: 2,
      m: `не steht direkt vor dem Verb: она не читает = sie liest nicht. Nie нет vor dem Verb!`
    },
    {
      q: `Was ist korrekt: „Это не мой дом" oder „Это нет мой дом"?`,
      a: [`Это нет мой дом`, `Это не мой дом`, `beide sind korrekt`],
      c: 1,
      m: `не vor Possessivpronomen: Это не мой дом = Das ist nicht mein Haus. нет steht nie direkt vor Adj./Pron.`
    },
    {
      q: `Wie antwortet man auf „У тебя есть ручка?" verneinend?`,
      a: [`Нет, у меня нет ручки`, `Нет, я не имею ручку`, `Нет, у меня не ручка`],
      c: 0,
      m: `У меня нет ручки. ручки = Genitiv von ручка (Stift). нет + Genitiv bei verneintem Besitz.`
    },
  ]
}
