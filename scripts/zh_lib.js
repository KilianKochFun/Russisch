// Gemeinsame Helfer für die Mandarin-Seed-Skripte:
// Shinjitai→Traditionell, CC-CEDICT-Loader, Pinyin→Zhuyin.
const fs = require('fs');

// Japanische Vereinfachungen (Shinjitai) → traditionelles Chinesisch
const TRAD = {
  '円':'圓','戸':'戶','広':'廣','万':'萬','写':'寫','気':'氣','氷':'冰','虫':'蟲',
  '内':'內','号':'號','礼':'禮','宝':'寶','体':'體','来':'來','当':'當','図':'圖',
  '毎':'每','会':'會','学':'學','声':'聲','麦':'麥','両':'兩','国':'國','姉':'姊',
  '点':'點','歩':'步','辺':'邊','黒':'黑','画':'畫','黄':'黃','楽':'樂','数':'數',
  '医':'醫','絵':'繪','対':'對','発':'發','県':'縣','乗':'乘','売':'賣','仮':'假',
  '験':'驗','実':'實','顔':'顏','鉄':'鐵','軽':'輕','読':'讀','転':'轉','横':'橫',
  // Radikal-Glyphen
  'ｲ':'亻','ネ':'礻','⻌':'辶',
};
const trad = s => [...s].map(c => TRAD[c] || c).join('');

function loadCedict(pfad) {
  const cedict = new Map();
  for (let line of fs.readFileSync(pfad, 'utf-8').split('\n')) {
    line = line.replace(/\r$/, '');
    if (!line || line[0] === '#') continue;
    const m = line.match(/^(\S+) (\S+) \[([^\]]+)\] \/(.+)\/$/);
    if (!m) continue;
    const [, tr, , py, defs] = m;
    if (!cedict.has(tr)) cedict.set(tr, []);
    cedict.get(tr).push({ py: py.toLowerCase(), defs: defs.split('/').slice(0, 3) });
  }
  return cedict;
}

const INITIALS = [
  ['zh','ㄓ'],['ch','ㄔ'],['sh','ㄕ'],['b','ㄅ'],['p','ㄆ'],['m','ㄇ'],['f','ㄈ'],
  ['d','ㄉ'],['t','ㄊ'],['n','ㄋ'],['l','ㄌ'],['g','ㄍ'],['k','ㄎ'],['h','ㄏ'],
  ['j','ㄐ'],['q','ㄑ'],['x','ㄒ'],['r','ㄖ'],['z','ㄗ'],['c','ㄘ'],['s','ㄙ'],
];
const FINALS = {
  'iong':'ㄩㄥ','iang':'ㄧㄤ','uang':'ㄨㄤ','ueng':'ㄨㄥ',
  'iao':'ㄧㄠ','ian':'ㄧㄢ','ing':'ㄧㄥ','uai':'ㄨㄞ','uan':'ㄨㄢ','ang':'ㄤ','eng':'ㄥ',
  'ia':'ㄧㄚ','ie':'ㄧㄝ','iu':'ㄧㄡ','iou':'ㄧㄡ','in':'ㄧㄣ','io':'ㄧㄛ',
  'ua':'ㄨㄚ','uo':'ㄨㄛ','ui':'ㄨㄟ','uei':'ㄨㄟ','un':'ㄨㄣ','uen':'ㄨㄣ','ue':'ㄩㄝ','ve':'ㄩㄝ',
  'van':'ㄩㄢ','vn':'ㄩㄣ','ong':'ㄨㄥ',
  'ai':'ㄞ','ei':'ㄟ','ao':'ㄠ','ou':'ㄡ','an':'ㄢ','en':'ㄣ','er':'ㄦ',
  'a':'ㄚ','o':'ㄛ','e':'ㄜ','i':'ㄧ','u':'ㄨ','v':'ㄩ',
};
const TONES = { 1:'', 2:'ˊ', 3:'ˇ', 4:'ˋ', 5:'˙' };

function pinyinToZhuyin(py) {
  const m = py.match(/^([a-zü:]+)([1-5])$/);
  if (!m) return null;
  let [, syl, tone] = m;
  syl = syl.replace('u:', 'v').replace('ü', 'v');
  if (syl === 'r') return 'ㄦ' + (tone === '5' ? '' : TONES[tone]); // 兒化 (na3 r5)

  let ini = '', rest = syl;
  for (const [p, z] of INITIALS) {
    if (syl.startsWith(p)) { ini = z; rest = syl.slice(p.length); break; }
  }
  if (ini && rest === 'i' && 'ㄓㄔㄕㄖㄗㄘㄙ'.includes(ini)) rest = '';
  if (!ini) {
    if (rest === 'yi' || rest === 'i') rest = 'i';
    else if (rest === 'wu' || rest === 'u') rest = 'u';
    else if (rest === 'yu' || rest === 'v') rest = 'v';
    else if (rest.startsWith('yu')) rest = 'v' + rest.slice(2);
    else if (rest.startsWith('y')) { rest = rest.slice(1); if (!rest.startsWith('i')) rest = 'i' + rest; }
    else if (rest.startsWith('w')) { rest = rest.slice(1); if (!rest.startsWith('u')) rest = 'u' + rest; }
  }
  // Achtung: includes('') wäre immer true — deshalb ini-Check zuerst!
  if (ini && 'ㄐㄑㄒ'.includes(ini) && rest.startsWith('u')) rest = 'v' + rest.slice(1);

  let fin = '';
  if (rest) {
    fin = FINALS[rest];
    if (fin === undefined) return null;
  }
  const kern = ini + fin;
  return tone === '5' ? TONES[5] + kern : kern + TONES[tone];
}

// Deutsche Bedeutung + Beispielsatz aus HanDeDict (gleiche Datei-Struktur wie CEDICT)
function deutschVon(handedict, zh) {
  const e = (handedict.get(zh) || [])[0];
  if (!e) return {};
  const defs_de = e.defs.slice(0, 2).map(d => d.split('; Bsp.:')[0].trim()).filter(Boolean);
  let beispiel = null;
  for (const d of e.defs) {
    const m = d.match(/Bsp\.: (\S+) \S+ -- ([^;/]+)/);
    if (m) { beispiel = { zh: m[1], de: m[2].trim() }; break; }
  }
  return { de: defs_de[0], defs_de, beispiel_de: beispiel };
}

module.exports = { TRAD, trad, loadCedict, pinyinToZhuyin, deutschVon };
