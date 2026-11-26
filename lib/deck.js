export const LEVELS = [
  { id: "lv1", name: "微醺破冰", hint: "曖昧的摸、臉紅的誇獎", heat: 1 },
  { id: "lv2", name: "曖昧", hint: "擁抱、坐腿、只說給一個人聽", heat: 2 },
  { id: "lv3", name: "親密", hint: "臉頰、脖子、手的吻，貼身慢舞和餵酒", heat: 3 },
  { id: "lv4", name: "火辣", hint: "唇吻、冰塊、蒙眼、跨坐、脫掉外層", heat: 4 },
  { id: "lv5", name: "極限", hint: "長吻、脫到內衣為止、腹上酒、獨處一分鐘", heat: 5 },
  { id: "lv6", name: "自訂一", hint: "主持人自己寫的這一層", heat: 6, custom: true },
  { id: "lv7", name: "自訂二", hint: "第二層自訂，名稱可以改", heat: 7, custom: true },
];

export const BUILTIN = [
  ["lv1", "blush-praise", "{a}號 看著 {b}號 的眼睛，說一句會讓人臉紅的讚美"],
  ["lv1", "arm-trace", "{a}號 用指尖沿著 {b}號 的手臂慢慢滑到手腕"],
  ["lv1", "body-praise", "{a}號 誇 {b}號 的嘴唇、鎖骨或腰線，只准挑一個"],
  ["lv1", "waist-five", "{a}號 把手放在 {b}號 的腰側，隔著衣服停五秒"],
  ["lv1", "love-line", "{a}號 對 {b}號 說一句會讓自己也臉紅的情話"],
  ["lv1", "fingers", "{a}號 和 {b}號 十指交扣，對看到有人先笑"],
  ["lv1", "whisper-like", "{a}號 用氣音告訴 {b}號 自己最喜歡哪種靠近"],
  ["lv1", "nape", "{a}號 輕撫 {b}號 的後頸一下，然後退開"],
  ["lv1", "thigh", "{a}號 坐到 {b}號 旁邊，腿貼著腿，說一句曖昧的話"],
  ["lv1", "ear-hair", "{a}號 幫 {b}號 把頭髮撥到耳後，手指在耳際多停一下"],
  ["lv1", "look-mouth", "{a}號 看著 {b}號 的嘴三秒，然後問想不想被親"],
  ["lv1", "choice-touch", "{a}號 讓 {b}號 選：被摸一下腰，或聽一句情話"],
  ["lv1", "back-waist", "{a}號 從背後把手環在 {b}號 腰上，輕聲說一句"],
  ["lv1", "collar-draw", "{a}號 用指腹畫過 {b}號 的鎖骨外側，隔著衣服也算"],
  ["lv1", "touch-tell", "{a}號 告訴 {b}號 自己今晚最容易心動的觸碰"],
  ["lv1", "forehead", "{a}號 和 {b}號 額頭靠近到快碰上，誰先退誰喝一口"],
  ["lv1", "earlobe", "{a}號 捏一下 {b}號 的耳垂，再誇對方的聲音"],
  ["lv1", "heartbeat", "{a}號 把 {b}號 的手拉到自己心跳上，隔著衣服"],
  ["lv1", "closer", "{a}號 低聲對 {b}號 說「我想靠得更近」，然後真的靠近"],
  ["lv1", "bite-lip", "{a}號 輕咬自己的下唇看著 {b}號，再送一個飛吻"],
  ["lv1", "where-touch", "{a}號 問 {b}號 最想被摸哪裡，只准答脖子、腰或手臂"],
  ["lv1", "toast-eyes", "{a}號 和 {b}號 碰杯喝一小口，眼睛不能移開"],

  ["lv2", "tight-hug", "{a}號 把 {b}號 緊緊抱進懷裡，胸口相貼十秒"],
  ["lv2", "sit-lap", "{a}號 坐上 {b}號 的腿，雙手環住對方脖子，十秒"],
  ["lv2", "ear-secret", "{a}號 在 {b}號 耳邊說一句只准對方聽見的情話"],
  ["lv2", "back-hug", "{a}號 從背後抱住 {b}號，臉貼在肩上，輕聲數到五"],
  ["lv2", "host-lap", "{a}號 讓 {b}號 坐在自己腿上，手扶著對方的腰"],
  ["lv2", "ear-breath", "{a}號 把嘴湊到 {b}號 耳邊，只呼吸不說話，三秒"],
  ["lv2", "chest-hug", "{a}號 和 {b}號 相擁到胸口相貼，直到有人先笑"],
  ["lv2", "straddle-still", "{a}號 跨坐在 {b}號 腿上，衣服整齊，額頭相貼五秒"],
  ["lv2", "first-wish", "{a}號 抱著 {b}號 的腰，耳邊說今晚想先靠近什麼，先不要做"],
  ["lv2", "cradle", "{a}號 讓 {b}號 坐進自己懷裡，像一支慢舞的結束"],
  ["lv2", "nose-close", "{a}號 把 {b}號 拉近到鼻尖幾乎碰到，低聲說一句"],
  ["lv2", "rock", "{a}號 坐在 {b}號 腿上輕輕晃一下，然後下來"],
  ["lv2", "stomach-hold", "{a}號 從背後環住 {b}號，手停在小腹外面的衣服上"],
  ["lv2", "name-ear", "{a}號 抱著 {b}號，在對方耳邊把名字叫一次"],
  ["lv2", "choose-hold", "{a}號 讓 {b}號 選：被抱十秒，或坐上 {a}號 的腿"],
  ["lv2", "neck-smell", "{a}號 把臉埋進 {b}號 的頸側，只靠近不親，三秒"],
  ["lv2", "eight-hug", "{a}號 抱著 {b}號 慢數八拍，手只放在背和腰"],
  ["lv2", "wish-kiss", "{a}號 坐上 {b}號 的腿，耳邊說一個想被親的位置，先不親"],
  ["lv2", "face-hug", "{a}號 和 {b}號 面對面抱住，一隻手要放在對方後腰"],
  ["lv2", "private-line", "{a}號 把 {b}號 拉到身旁緊貼，低聲講一句不敢當眾說的話"],
  ["lv2", "lap-collar", "{a}號 讓 {b}號 坐在自己大腿上，順手整理對方的領口"],
  ["lv2", "collar-breath", "{a}號 抱住 {b}號，在鎖骨附近吹氣，然後一起喝一小口"],

  ["lv3", "cheek-stay", "{a}號 親 {b}號 的臉頰，親完在原地多停一秒"],
  ["lv3", "neck-kiss", "{a}號 親一下 {b}號 的脖子，對方說停就立刻停"],
  ["lv3", "palm-kiss", "{a}號 吻 {b}號 的手心，眼睛看著對方"],
  ["lv3", "close-dance", "{a}號 和 {b}號 貼身慢舞二十秒，手可以放在腰上"],
  ["lv3", "feed-sip", "{a}號 餵 {b}號 喝一小口，杯緣碰到嘴唇就好"],
  ["lv3", "ear-to-neck", "{a}號 從 {b}號 的耳後親到頸側，只做一次"],
  ["lv3", "be-fed", "{a}號 讓 {b}號 把酒送到自己嘴邊，喝的時候要對視"],
  ["lv3", "collar-kiss", "{a}號 親 {b}號 的鎖骨外側一下，不往下解衣服"],
  ["lv3", "shoulder-bury", "{a}號 和 {b}號 慢舞時，把臉埋進對方的肩頸"],
  ["lv3", "earlobe", "{a}號 輕咬一下 {b}號 的耳垂，或改親耳下"],
  ["lv3", "lap-cheek", "{a}號 坐在 {b}號 腿上，親一下對方的臉頰"],
  ["lv3", "finger-feed", "{a}號 用手指餵 {b}號 一小口酒或一口小零食"],
  ["lv3", "dance-hand", "{a}號 和 {b}號 貼著跳舞，結束時親一下手背"],
  ["lv3", "choose-spot", "{a}號 問 {b}號 想被親臉頰、手還是脖子，然後照做"],
  ["lv3", "back-kiss", "{a}號 從背後抱住 {b}號，在頸側親一下"],
  ["lv3", "lip-feed", "{a}號 讓 {b}號 餵自己，對方的手指可以碰到嘴唇"],
  ["lv3", "temple", "{a}號 和 {b}號 額頭相貼慢舞十秒，再親一下太陽穴"],
  ["lv3", "jaw", "{a}號 沿著 {b}號 的下顎親到耳下，這次不親嘴"],
  ["lv3", "waist-dance", "{a}號 把 {b}號 拉進懷裡跳舞，手停在後腰"],
  ["lv3", "shoulder-kiss", "{a}號 親一下 {b}號 的肩膀，隔著衣服也算完成"],
  ["lv3", "share-sip", "{a}號 先喝一小口，再餵 {b}號 喝下一小口"],
  ["lv3", "want-kiss", "{a}號 看著 {b}號 的嘴唇說想親，然後只親脖子"],

  ["lv4", "lip-kiss", "{a}號 和 {b}號 接吻五秒，對方側過臉就改親嘴角"],
  ["lv4", "neck-slow", "{a}號 慢慢親 {b}號 的脖子，手可以扶在後腰"],
  ["lv4", "ear-kiss", "{a}號 含住 {b}號 的耳垂輕吻一下"],
  ["lv4", "collar-shot", "{b}號 把一小杯酒靠在鎖骨，{a}號 低頭喝掉"],
  ["lv4", "outer-layer", "{a}號 脫掉最外面一件外套或上衣，內衣必須留著"],
  ["lv4", "lap-dance", "{a}號 跨坐在 {b}號 腿上，貼著對方跳十五秒"],
  ["lv4", "ice-neck", "{a}號 拿冰塊沿著 {b}號 的脖子滑到鎖骨"],
  ["lv4", "blind-guess", "{b}號 蒙上眼，隔著衣服猜 {a}號 摸的是手臂、腰還是背"],
  ["lv4", "kiss-breath", "{a}號 吻 {b}號 的唇，只到需要換氣，手不往下"],
  ["lv4", "ear-neck", "{a}號 從 {b}號 耳後親到頸側，再在鎖骨停一下"],
  ["lv4", "shoulder-shot", "{a}號 讓 {b}號 從自己的肩頸把那口酒喝掉"],
  ["lv4", "another-layer", "{a}號 再脫一件外套，或摘一條飾品交給 {b}號"],
  ["lv4", "straddle-hug", "{a}號 跨坐抱住 {b}號 的脖子，貼近後就停"],
  ["lv4", "ice-ear", "{a}號 用冰塊點一下 {b}號 的耳後，再用嘴唇捂熱"],
  ["lv4", "blind-count", "{a}號 蒙眼，讓 {b}號 隔著衣服從肩摸到腰，猜第幾下"],
  ["lv4", "kiss-neck-hands", "{a}號 吻住 {b}號，手只准放在臉側或後頸"],
  ["lv4", "trade-neck", "{a}號 和 {b}號 互親脖子一下，先笑的人再被親耳朵"],
  ["lv4", "chest-shot", "{a}號 把酒杯放在 {b}號 胸口外的衣服上，自己喝掉"],
  ["lv4", "inner-top", "{a}號 脫到內層上衣為止，不脫內衣，然後坐上 {b}號 的腿"],
  ["lv4", "blind-shoulder", "{a}號 蒙上 {b}號 的眼，隔著衣服親一下肩，讓對方猜左右"],
  ["lv4", "nuzzle", "{a}號 跨坐慢舞時，把臉埋進 {b}號 的頸窩親一下"],
  ["lv4", "lip-or-neck", "{a}號 問 {b}號 要唇吻還是頸吻，選完就做五秒"],

  ["lv5", "long-kiss", "{a}號 和 {b}號 接吻，直到其中一人需要換氣"],
  ["lv5", "lap-dance", "{a}號 跨坐在 {b}號 腿上貼身慢舞三十秒，手不伸進衣服"],
  ["lv5", "down-layer", "{a}號 再脫一件，最多脫到內衣褲，不准脫掉它們"],
  ["lv5", "stomach-shot", "{a}號 把一小杯酒放在 {b}號 的小腹上，俯身喝掉"],
  ["lv5", "massage", "{a}號 隔著衣服，從 {b}號 的肩膀慢慢按摩到腰"],
  ["lv5", "closet", "{a}號 和 {b}號 進衣櫃或門後獨處一分鐘，可以親也可以只抱"],
  ["lv5", "memory", "{a}號 問 {b}號 最難忘的一次親密經驗，可以喝酒代替細說"],
  ["lv5", "kiss-hold", "{a}號 長吻 {b}號，手只能放在後頸和腰外側"],
  ["lv5", "dance-kiss", "{a}號 跨坐為 {b}號 跳一段，結束時親一下嘴唇"],
  ["lv5", "underwear-stop", "{a}號 再脫一層，停在內衣褲外面，讓 {b}號 看三秒"],
  ["lv5", "belly-kiss", "{a}號 喝完 {b}號 腹上那口酒，再隔著衣服親一下肚子旁邊"],
  ["lv5", "thigh-massage", "{a}號 隔著衣服按摩 {b}號 的腰和大腿外側，不要往內"],
  ["lv5", "closet-kiss", "{a}號 和 {b}號 在小空間裡可以接吻和擁抱，手停在衣服外"],
  ["lv5", "how-far", "{a}號 問 {b}號 上一次心動做到哪一步，答到接吻就可以停"],
  ["lv5", "keep-underwear", "{a}號 把 {b}號 拉進懷裡長吻，不准解對方的內衣"],
  ["lv5", "sit-after", "{a}號 再脫一件後坐上 {b}號 的腿十秒，內衣褲必須留著"],
  ["lv5", "front-massage", "{a}號 隔著衣服從 {b}號 的胸口外側按摩到小腹，手不探進去"],
  ["lv5", "door-kiss", "{a}號 和 {b}號 到門後接吻，出來時至少留著內衣褲"],
  ["lv5", "how-kiss", "{a}號 問 {b}號 最想被怎麼親，然後親嘴唇或脖子"],
  ["lv5", "belly-drink", "{b}號 坐好或躺好，{a}號 從對方小腹上的杯子把酒喝完"],
  ["lv5", "dance-rule", "{a}號 跨坐慢舞十五秒，兩邊都必須留著內衣褲"],
  ["lv5", "adult-story", "{a}號 問 {b}號 一件成人經驗，聽完一起喝一口，細節可以跳過"],
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
