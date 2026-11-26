export const LEVELS = [
  { id: "lv1", name: "微醺破冰", hint: "對看、小口酒、輕輕靠近", heat: 1 },
  { id: "lv2", name: "曖昧", hint: "耳語、牽手、短坐腿", heat: 2 },
  { id: "lv3", name: "親密", hint: "臉頰吻、貼近、餵酒", heat: 3 },
  { id: "lv4", name: "火辣", hint: "頸吻、慢舞、鎖骨小酒", heat: 4 },
  { id: "lv5", name: "極限", hint: "最辣的一檔，仍可隨時停", heat: 5 },
  { id: "lv6", name: "自訂一", hint: "主持人自己寫的這一層", heat: 6, custom: true },
  { id: "lv7", name: "自訂二", hint: "第二層自訂，名稱可以改", heat: 7, custom: true },
];

export const BUILTIN = [
  ["lv1", "gaze-praise", "{a}號 看著 {b}號 的眼睛，說一句今晚的讚美"],
  ["lv1", "stare-sip", "{a}號 和 {b}號 對看十秒，先笑的人喝一小口"],
  ["lv1", "whisper-nick", "{a}號 用氣音給 {b}號 取一個今晚的綽號"],
  ["lv1", "feed-sip", "{a}號 用杯子餵 {b}號 喝一小口"],
  ["lv1", "wrist-touch", "{a}號 輕碰 {b}號 的手腕，停三秒"],
  ["lv1", "air-kiss", "{a}號 對 {b}號 比一個飛吻"],
  ["lv1", "compliment-spot", "{a}號 誇 {b}號 今晚最好看的地方，說笑容或聲音就好"],
  ["lv1", "cheers-sip", "{a}號 和 {b}號 乾杯，只喝一小口"],
  ["lv1", "choose-praise", "{a}號 讓 {b}號 選：被誇一句，或喝一小口"],
  ["lv1", "three-names", "{a}號 用三種語氣叫 {b}號 的名字"],
  ["lv1", "shoulder", "{a}號 坐到 {b}號 旁邊，肩膀靠一下"],
  ["lv1", "soft-question", "{a}號 問 {b}號 一個很輕的曖昧問題，可以不答"],
  ["lv1", "wink", "{a}號 和 {b}號 一起對大家眨眼"],
  ["lv1", "hand-five", "{a}號 把手放在 {b}號 的手背上，數到五"],
  ["lv1", "habit-sip", "{a}號 說一個自己的小癖好，說完喝一小口"],
  ["lv1", "fix-collar", "{a}號 幫 {b}號 整理一下衣領或袖口"],
  ["lv1", "toast-touch", "{a}號 和 {b}號 碰杯，看著對方喝一小口"],
  ["lv1", "group-toast", "大家跟著 {a}號 說一句乾杯詞，喝不喝自己決定"],
  ["lv1", "ad-intro", "{a}號 用一句廣告詞介紹 {b}號"],
  ["lv1", "rps-sip", "{a}號 和 {b}號 猜拳，輸的人喝一小口或做個鬼臉"],
  ["lv1", "mood-line", "{a}號 對 {b}號 用一句話說出自己今晚的心情"],
  ["lv1", "dangerous-line", "{a}號 看著 {b}號 說「你今晚有點危險」，然後笑開"],

  ["lv2", "ear-secret", "{a}號 在 {b}號 耳邊說一句只給對方聽的話"],
  ["lv2", "fingers", "{a}號 和 {b}號 十指交扣，對看五秒"],
  ["lv2", "palm-draw", "{a}號 用指尖從 {b}號 的手腕畫到掌心"],
  ["lv2", "lap-ten", "{a}號 坐到 {b}號 腿上十秒，衣服整齊，時間到就起來"],
  ["lv2", "hand-kiss", "{a}號 輕吻 {b}號 的手背"],
  ["lv2", "tonight-name", "{a}號 問 {b}號：今晚最想被怎麼稱呼"],
  ["lv2", "forehead-gap", "{a}號 和 {b}號 額頭相距一個拳頭，停五秒"],
  ["lv2", "hair-tuck", "{a}號 幫 {b}號 把頭髮撥到耳後，或不碰頭髮就碰一下耳朵"],
  ["lv2", "spark-tell", "{a}號 說一種會讓自己心動的小動作，眼睛看著 {b}號"],
  ["lv2", "be-fed", "{a}號 讓 {b}號 餵自己喝一小口"],
  ["lv2", "slow-toast", "{a}號 和 {b}號 慢慢碰杯，眼睛不要移開"],
  ["lv2", "neck-breath", "{a}號 在 {b}號 頸側附近吹一口氣，先不要親"],
  ["lv2", "crush-or-drink", "{a}號 問 {b}號 上次心動是什麼感覺，可以改喝一小口"],
  ["lv2", "secret-pair", "{a}號 和 {b}號 背對大家，互講一個無害的小秘密"],
  ["lv2", "breath-name", "{a}號 用氣音把 {b}號 的名字念三遍"],
  ["lv2", "hum-love", "{a}號 讓 {b}號 點一首情歌，自己哼一句"],
  ["lv2", "waist-three", "{a}號 把手放在 {b}號 的腰側，隔著衣服停三秒"],
  ["lv2", "share-sip", "{a}號 和 {b}號 分同一杯的一小口"],
  ["lv2", "blackout-line", "{a}號 對 {b}號 說一句「如果現在停電」的想像，點到為止"],
  ["lv2", "earlobe", "{a}號 輕輕捏一下 {b}號 的耳垂"],
  ["lv2", "voice-praise", "{a}號 看著 {b}號，誇對方的聲音或眼神"],
  ["lv2", "truth-light", "{b}號 問 {a}號 一個曖昧小問題，太過就可以跳過"],

  ["lv3", "cheek-kiss", "{a}號 親一下 {b}號 的臉頰，對方側臉就改親手背"],
  ["lv3", "lap-arms", "{a}號 坐在 {b}號 腿上，手臂環住對方肩膀，十秒後起來"],
  ["lv3", "palm-kiss", "{a}號 吻一下 {b}號 的手心"],
  ["lv3", "slow-dance", "{a}號 和 {b}號 慢舞十秒，身體可以靠近"],
  ["lv3", "scent", "{a}號 在 {b}號 耳邊說一種自己喜歡的香味"],
  ["lv3", "feed-lip", "{a}號 讓 {b}號 把酒送到自己嘴邊，喝一小口"],
  ["lv3", "temple-kiss", "{a}號 輕吻 {b}號 的太陽穴或髮際"],
  ["lv3", "close-question", "{a}號 問 {b}號 最受不了哪一種靠近，聽完喝一小口"],
  ["lv3", "forehead-touch", "{a}號 和 {b}號 額頭輕輕碰上，數到三"],
  ["lv3", "arm-trace", "{a}號 用指腹沿著 {b}號 的手臂外側滑下去"],
  ["lv3", "hand-on-waist", "{a}號 把 {b}號 的手放到自己腰上，隔著衣服停五秒"],
  ["lv3", "tonight-only", "{a}號 對 {b}號 說一句只准今晚說的話"],
  ["lv3", "collars", "{a}號 和 {b}號 互相整理領口，可以靠得很近"],
  ["lv3", "hug-back", "{a}號 從背後環住 {b}號 的肩膀，輕聲說一句"],
  ["lv3", "choose-kiss", "{a}號 讓 {b}號 選：親臉頰，或一起喝一小口"],
  ["lv3", "look-lips", "{a}號 看 {b}號 的嘴唇三秒，不親，除非對方點頭"],
  ["lv3", "trade-item", "{a}號 和 {b}號 交換一個杯子或小飾品，手要交疊"],
  ["lv3", "legs-touch", "{a}號 坐在 {b}號 旁邊，腿靠著腿，直到下一輪"],
  ["lv3", "where-kiss", "{a}號 問 {b}號 想被親臉頰、手還是頭髮，只做對方點頭的那一下"],
  ["lv3", "close-pose", "{a}號 和 {b}號 擺一個很靠近的合照姿勢給大家看"],
  ["lv3", "glass-hand", "{a}號 把酒杯抵在 {b}號 的手背，喝一小口"],
  ["lv3", "fantasy-start", "{a}號 對 {b}號 低聲說一個很曖昧的開頭，點到為止"],

  ["lv4", "neck-kiss", "{a}號 親一下 {b}號 的頸側，對方可以轉頭拒絕"],
  ["lv4", "dance-for", "{a}號 看著 {b}號 跳十秒慢舞"],
  ["lv4", "collarbone-shot", "{b}號 把一小杯酒靠在自己鎖骨外的衣服上，{a}號 喝掉"],
  ["lv4", "outer-layer", "{a}號 脱掉最外層的外套、圍巾或帽子；沒有就摘一條飾品"],
  ["lv4", "lap-tease", "{a}號 坐在 {b}號 腿上，耳邊說一句挑逗的話，十五秒內起來"],
  ["lv4", "ear-bite", "{a}號 輕咬一下 {b}號 的耳垂，或改親耳下"],
  ["lv4", "close-dance", "{a}號 和 {b}號 貼著跳舞十秒，手放在對方腰上"],
  ["lv4", "spicy-truth", "{a}號 問 {b}號 最近一次心癢是什麼場面，可以喝酒代替回答"],
  ["lv4", "jaw-brush", "{a}號 用嘴唇輕輕擦過 {b}號 的下顎，不往下"],
  ["lv4", "one-button", "{a}號 幫 {b}號 拿掉一條項鍊，或解開不影響內衣的一顆扣，要先點頭"],
  ["lv4", "nape-hand", "{a}號 讓 {b}號 用手扶著自己的後頸，對看五秒"],
  ["lv4", "sip-eyes", "{a}號 含一小口酒再喝下，眼睛看著 {b}號"],
  ["lv4", "if-alone", "{a}號 和 {b}號 各說半句「如果現在只剩我們」，點到為止"],
  ["lv4", "collarbone-kiss", "{a}號 在 {b}號 鎖骨外側親一下，不往下解衣服"],
  ["lv4", "lap-or-carry", "{a}號 讓 {b}號 坐上自己的腿，或做一個公主抱的起手式"],
  ["lv4", "heartbeat", "{a}號 把 {b}號 的手放在自己心跳的位置，隔著衣服"],
  ["lv4", "hip-sway", "{a}號 對 {b}號 擺十秒腰，見好就收"],
  ["lv4", "neck-or-toast", "{b}號 選：讓 {a}號 親一下脖子，或兩人一起乾杯"],
  ["lv4", "hold-jewelry", "{a}號 摘下一隻耳環、手錶或眼鏡，交給 {b}號 保管到下一輪"],
  ["lv4", "ask-neck", "{a}號 先問 {b}號 想不想被親脖子，點頭才親，搖頭就喝一小口"],
  ["lv4", "waist-count", "{a}號 站到 {b}號 身後，手環在腰上，輕聲數到五"],
  ["lv4", "chin-lift", "{a}號 用指尖抬起 {b}號 的下巴，靠近到幾乎碰到就停住"],

  ["lv5", "neck-slow", "{a}號 慢慢親一下 {b}號 的脖子，對方說停就停"],
  ["lv5", "face-to-face", "{a}號 面對面坐在 {b}號 腿上，額頭相貼，十五秒"],
  ["lv5", "outer-shirt", "{a}號 脫一件外套或外衫，停在內衣之前；不願意就摘兩樣飾品並喝一口"],
  ["lv5", "dance-twenty", "{a}號 為 {b}號 跳二十秒貼身慢舞，手不伸進衣服"],
  ["lv5", "collarbone-drink", "{a}號 在 {b}號 鎖骨上親一下，再把自己的那杯喝掉"],
  ["lv5", "adult-q", "{a}號 問 {b}號 最容易被點燃的是聲音、眼神還是靠近，問完喝一口"],
  ["lv5", "shoulder-shot", "{a}號 把酒杯靠在自己肩頸，讓 {b}號 喝掉"],
  ["lv5", "mutual-neck", "{a}號 和 {b}號 互親脖子一下，任一方搖頭就改成一起乾杯"],
  ["lv5", "almost-words", "{a}號 低聲對 {b}號 說一句想靠近的話，只說到接吻為止"],
  ["lv5", "straddle", "{a}號 跨坐在 {b}號 腿上，衣服整齊，雙手環住對方脖子十秒"],
  ["lv5", "shoulder-slip", "{a}號 把外套肩線拉下一點再拉上，不露出內衣"],
  ["lv5", "nose-touch", "{a}號 和 {b}號 鼻尖相碰，誰先退開誰喝一杯"],
  ["lv5", "ear-to-neck", "{a}號 從 {b}號 的耳後親到頸側，一次就好"],
  ["lv5", "pick-spot", "{b}號 指定手心、臉頰、脖子或鎖骨，{a}號 照做一下"],
  ["lv5", "eight-beats", "{a}號 把 {b}號 拉進懷裡慢數八拍，手只放在背上"],
  ["lv5", "adult-habit", "{a}號 說一個成人向的小癖好，不描述性行為，說完看 {b}號 一眼"],
  ["lv5", "shared-glass", "{a}號 扶著杯子，{b}號 喝一小口，中間要對視"],
  ["lv5", "shoulder-kiss", "{a}號 隔著衣服，在 {b}號 的肩上親一下"],
  ["lv5", "dim-lights", "{a}號 讓 {b}號 點頭一個靠近動作：貼額、環腰，或親臉頰"],
  ["lv5", "jewelry-teeth", "{a}號 用牙齒咬住自己的一項小飾品，交到 {b}號 手上"],
  ["lv5", "mouth-corner", "{a}號 和 {b}號 貼身搖擺八拍，結束時親一下嘴角，側臉也算完成"],
  ["lv5", "bounded-dare", "{b}號 出一個十五秒懲罰，只限親脖子、坐腿、喝酒或脫外套，超過就拒絕"],
];

function newId() {
  return `c${Math.random().toString(36).slice(2, 10)}`;
}

function cleanName(value, fallback) {
  const text = String(value ?? "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  const chars = [...text].slice(0, 8);
  return chars.length ? chars.join("") : fallback;
}

function cleanTemplate(value) {
  const text = String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text || /[<>]/.test(text)) return "";
  return [...text].slice(0, 80).join("");
}

function cleanId(value) {
  return String(value ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24);
}

export function slotsOf(template) {
  const text = String(template);
  const hasA = text.includes("{a}");
  const hasB = text.includes("{b}");
  if (hasA && hasB) return 2;
  if (hasA || hasB) return 1;
  return 0;
}

export function fillTemplate(template, numbers) {
  let text = String(template);
  if (text.includes("{a}")) {
    text = text.replaceAll("{a}", String(numbers[0] ?? "?")).replaceAll("{b}", String(numbers[1] ?? "?"));
  } else {
    text = text.replaceAll("{b}", String(numbers[0] ?? "?"));
  }
  return text;
}

export function rollNumbers(slots, numberMax) {
  const bag = Array.from({ length: Math.max(0, numberMax) }, (_, index) => index + 1);
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag.slice(0, slots);
}

export function defaultCustomDeck() {
  return {
    levels: [
      {
        id: "lv6",
        name: "自訂一",
        entries: [
          { id: "s6a", template: "{a}號 對 {b}號 說一句只屬於這桌的暗號" },
          { id: "s6b", template: "{a}號 和 {b}號 自創一個乾杯動作，做完喝一小口" },
          { id: "s6c", template: "{a}號 讓 {b}號 指定一個只限這一輪的家規" },
        ],
      },
      {
        id: "lv7",
        name: "自訂二",
        entries: [
          { id: "s7a", template: "{a}號 和 {b}號 交換杯子，各喝一小口" },
          { id: "s7b", template: "{a}號 對 {b}號 做一個事先約好的懲罰，沒約就擊掌" },
          { id: "s7c", template: "全場聽 {a}號 出一個新規則，只限這一輪" },
        ],
      },
    ],
  };
}

export function normalizeCustomDeck(input) {
  const source = input && Array.isArray(input.levels) ? input : defaultCustomDeck();
  const fallbacks = { lv6: "自訂一", lv7: "自訂二" };
  const levels = ["lv6", "lv7"].map((id) => {
    const raw = source.levels.find((level) => level?.id === id) || {};
    const entries = [];
    const seen = new Set();
    for (const entry of Array.isArray(raw.entries) ? raw.entries : []) {
      if (entries.length >= 30) break;
      const template = cleanTemplate(entry?.template);
      if (!template) continue;
      let entryId = cleanId(entry?.id);
      if (!entryId || seen.has(entryId)) entryId = newId();
      seen.add(entryId);
      entries.push({ id: entryId, template });
    }
    return { id, name: cleanName(raw.name, fallbacks[id]), entries };
  });
  return { levels };
}

export function canonicalDeck(deck) {
  return JSON.stringify(normalizeCustomDeck(deck));
}

function mapLevel(deck, levelId, mapper) {
  const clean = normalizeCustomDeck(deck);
  if (!clean.levels.some((level) => level.id === levelId)) throw new Error("沒有這一層");
  return { levels: clean.levels.map((level) => (level.id === levelId ? mapper(level) : level)) };
}

export function addEntry(deck, levelId, template) {
  const text = cleanTemplate(template);
  if (!text) throw new Error("先寫一條懲罰");
  return mapLevel(deck, levelId, (level) => {
    if (level.entries.length >= 30) throw new Error("這一層最多 30 條");
    return { ...level, entries: [...level.entries, { id: newId(), template: text }] };
  });
}

export function updateEntry(deck, levelId, entryId, template) {
  const text = cleanTemplate(template);
  if (!text) throw new Error("懲罰不能是空的");
  return mapLevel(deck, levelId, (level) => ({
    ...level,
    entries: level.entries.map((entry) => (entry.id === entryId ? { ...entry, template: text } : entry)),
  }));
}

export function deleteEntry(deck, levelId, entryId) {
  return mapLevel(deck, levelId, (level) => ({
    ...level,
    entries: level.entries.filter((entry) => entry.id !== entryId),
  }));
}

export function renameLevel(deck, levelId, name) {
  return mapLevel(deck, levelId, (level) => ({ ...level, name: cleanName(name, level.name) }));
}

export function commandsFor(levelId, customDeck) {
  if (levelId === "lv6" || levelId === "lv7") {
    const level = normalizeCustomDeck(customDeck).levels.find((item) => item.id === levelId);
    return (level?.entries || []).map((entry) => ({
      id: entry.id,
      level: levelId,
      template: entry.template,
      slots: slotsOf(entry.template),
    }));
  }
  return BUILTIN.filter((item) => item[0] === levelId).map(([level, id, template]) => ({
    id,
    level,
    template,
    slots: slotsOf(template),
  }));
}

export function labelFor(levelId, customDeck) {
  if (levelId === "lv6" || levelId === "lv7") {
    return normalizeCustomDeck(customDeck).levels.find((level) => level.id === levelId)?.name || "自訂";
  }
  return LEVELS.find((level) => level.id === levelId)?.name || "懲罰";
}

export function levelMeta(customDeck) {
  const custom = normalizeCustomDeck(customDeck);
  return LEVELS.map((level) => ({
    id: level.id,
    name: level.custom ? labelFor(level.id, custom) : level.name,
    hint: level.hint,
    heat: level.heat,
    custom: Boolean(level.custom),
  }));
}
