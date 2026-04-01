module.exports = {
  typ: `hoeren`,
  titel: `Kurz-Hörtext 1: Am Telefon`,
  tts: true,
  text: `— Алло, Дима? Это Саша.
— Привет, Саша! Как дела?
— Всё хорошо, спасибо. Слушай, ты свободен в субботу?
— Да, у меня нет планов. А что?
— Мои родители приезжают из Киева. Я хочу показать им город. Ты не мог бы помочь?
— Конечно! Я с удовольствием. Во сколько?
— В десять утра, у метро Арбатская.
— Отлично. До субботы!`,
  fragen: [
    {
      q: `Woher kommen Sashas Eltern?`,
      a: [`Aus Moskau`, `Aus Kiew`, `Aus Sankt Petersburg`],
      c: 1,
      m: `„Мои родители приезжают из Киева." — из + Genitiv = aus. Киев → Киева (Genitiv).`
    },
    {
      q: `Wo wollen sie sich treffen?`,
      a: [`Vor dem Café`, `Am Bahnhof`, `Bei der Metro-Station Arbatskaja`],
      c: 2,
      m: `„...у метро Арбатская." — у + Genitiv = bei/an. Арба́тская ist eine Moskauer Metro-Station.`
    },
    {
      q: `„У меня нет планов." — Was bedeutet нет планов hier?`,
      a: [`Ich habe Pläne`, `Ich habe keine Pläne (нет + Genitiv Plural)`, `Meine Pläne sind gut`],
      c: 1,
      m: `нет + Genitiv: план → плано́в (Genitiv Plural). У меня нет планов = Ich habe keine Pläne.`
    },
  ]
}
