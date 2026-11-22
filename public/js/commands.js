(() => {
  const COMMANDS = [
    { id: "high-five", intensity: "chill", slots: 2, template: "{a}號 和 {b}號 擊掌三下" },
    { id: "three-tones", intensity: "chill", slots: 1, template: "{a}號 用三種不同語氣說「報告國王」" },
    { id: "nicknames", intensity: "chill", slots: 2, template: "{a}號 和 {b}號 互相取一個今晚限定綽號" },
    { id: "animal", intensity: "chill", slots: 1, template: "{a}號 模仿一種動物，讓大家猜" },
    { id: "ad-voice", intensity: "chill", slots: 1, template: "{a}號 用廣告配音介紹一樣眼前的東西" },
    { id: "stare", intensity: "chill", slots: 2, template: "{a}號 和 {b}號 對看三秒，先笑的人鞠躬" },
    { id: "small-joy", intensity: "chill", slots: 1, template: "從 {a}號 開始，每人說一個今天的小確幸" },
    { id: "intro", intensity: "chill", slots: 2, template: "{a}號 用很誇張的方式向 {b}號 自我介紹" },
    { id: "joke", intensity: "chill", slots: 1, template: "{a}號 講一個冷笑話，要短" },
    { id: "pose", intensity: "chill", slots: 2, template: "{a}號 和 {b}號 一起擺同一個姿勢" },
    { id: "hum", intensity: "chill", slots: 1, template: "{a}號 哼一首歌的前兩句，大家猜歌名" },
    { id: "all-number", intensity: "chill", slots: 0, template: "所有人同時比一個數字，數到三再出手" },
    { id: "snack", intensity: "chill", slots: 1, template: "{a}號 說出自己最想吃的宵夜" },
    { id: "compliment", intensity: "chill", slots: 2, template: "{a}號 和 {b}號 用三個詞互相誇獎" },

    { id: "fruits", intensity: "normal", slots: 1, template: "{a}號 在十秒內說出五種水果" },
    { id: "quiz", intensity: "normal", slots: 2, template: "{a}號 立刻回答 {b}號 出的一個輕鬆題目" },
    { id: "lyric", intensity: "normal", slots: 2, template: "{a}號 要用一句歌詞回答 {b}號 的問題" },
    { id: "talent", intensity: "normal", slots: 1, template: "{a}號 表演五秒才藝，多小都可以" },
    { id: "charades", intensity: "normal", slots: 2, template: "{a}號 和 {b}號 用肢體擺出一個詞，讓大家猜" },
    { id: "three-strengths", intensity: "normal", slots: 1, template: "{a}號 大聲說出自己的三個優點" },
    { id: "honest-q", intensity: "normal", slots: 2, template: "{b}號 問一個不刺探隱私的問題，{a}號 老實回答，或大方跳過" },
    { id: "speech", intensity: "normal", slots: 1, template: "{a}號 用國王的語氣發表十秒演說" },
    { id: "rps", intensity: "normal", slots: 2, template: "{a}號 和 {b}號 猜拳一局，輸的人誇贏的人一句" },
    { id: "spin-point", intensity: "normal", slots: 1, template: "{a}號 閉眼轉一圈，指向自己覺得今晚最像國王的方向" },
    { id: "expression", intensity: "normal", slots: 2, template: "{a}號 指定一種表情，{b}號 維持五秒" },
    { id: "dance-relay", intensity: "normal", slots: 1, template: "從 {a}號 開始，每人接一個舞蹈動作" },
    { id: "dub", intensity: "normal", slots: 2, template: "{a}號 和 {b}號 合作配音一句經典台詞" },
    { id: "slow-leave", intensity: "normal", slots: 1, template: "{a}號 用慢動作演示自己今天出門的樣子" },

    { id: "blink", intensity: "bold", slots: 2, template: "{a}號 和 {b}號 比誰先眨眼，輸的人鞠躬" },
    { id: "no-wo", intensity: "bold", slots: 1, template: "{a}號 在下一回合開始前，都不能說「我」" },
    { id: "drama-enter", intensity: "bold", slots: 1, template: "{a}號 用戲劇腔重演自己進門的那一刻" },
    { id: "title-name", intensity: "bold", slots: 2, template: "{b}號 幫 {a}號 取一個今晚封號，{a}號 要大聲自我介紹" },
    { id: "back-to-back", intensity: "bold", slots: 2, template: "{a}號 和 {b}號 背對背，數到三轉身做動作，不一樣就笑著重來" },
    { id: "three-second", intensity: "bold", slots: 2, template: "{a}號 閉眼，三秒內回答 {b}號 的無厘頭問題" },
    { id: "whisper-cheer", intensity: "bold", slots: 2, template: "{a}號 用耳語對 {b}號 說一句打氣的話，然後兩人一起歡呼" },
    { id: "mini-challenge", intensity: "bold", slots: 2, template: "{b}號 出一個十秒能做完的小挑戰給 {a}號，太過分可以拒絕" },
    { id: "three-praises", intensity: "bold", slots: 2, template: "{a}號 連續說三句不重複的誇讚給 {b}號" },
    { id: "smile-vote", intensity: "bold", slots: 2, template: "大家投票 {a}號 和 {b}號 誰的笑容比較亮，另一人再笑一次" },
    { id: "jackpot", intensity: "bold", slots: 1, template: "{a}號 用慢動作演示「聽到自己中獎」" },
    { id: "animal-pair", intensity: "bold", slots: 2, template: "{a}號 和 {b}號 互相說對方最像哪種動物，並學一聲" },
    { id: "extra-task", intensity: "bold", slots: 1, template: "{a}號 做一個十秒能完成的現場小任務，太勉強就說換一條" },
    { id: "loyalty", intensity: "bold", slots: 0, template: "全場用一句話，向還沒揭曉的國王表忠心，越浮誇越好" },
  ];

  const INTENSITIES = [
    { id: "chill", label: "輕鬆破冰", hint: "好上手，適合剛坐下的時候" },
    { id: "normal", label: "普通", hint: "有來有往的小挑戰" },
    { id: "bold", label: "刺激", hint: "更大膽一點，仍然不越線" },
  ];

  function randomIndex(size) {
    if (size <= 1) return 0;
    if (globalThis.crypto?.getRandomValues) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] % size;
    }
    return Math.floor(Math.random() * size);
  }

  function roll(slots, numberMax) {
    const bag = Array.from({ length: numberMax }, (_, index) => index + 1);
    for (let i = bag.length - 1; i > 0; i -= 1) {
      const j = randomIndex(i + 1);
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag.slice(0, slots);
  }

  function fill(template, numbers) {
    return String(template)
      .replaceAll("{a}", String(numbers[0] ?? "?"))
      .replaceAll("{b}", String(numbers[1] ?? "?"))
      .replaceAll("{c}", String(numbers[2] ?? "?"));
  }

  function poolFor(intensity, numberMax) {
    const fitting = COMMANDS.filter((command) => command.slots <= numberMax);
    const themed = fitting.filter((command) => command.intensity === intensity);
    return themed.length ? themed : fitting;
  }

  function pick(draft, numberMax) {
    const usable = poolFor(draft.intensity, numberMax);
    if (!usable.length) return;
    let index = randomIndex(usable.length);
    if (usable.length > 1 && draft.command && usable[index].id === draft.command.id) {
      index = (index + 1) % usable.length;
    }
    draft.command = usable[index];
    draft.numbers = roll(usable[index].slots, numberMax);
    draft.mode = "deck";
  }

  function newDraft() {
    return {
      intensity: "chill",
      mode: "deck",
      command: null,
      numbers: [],
      customText: "",
      customTargets: [],
      initialized: false,
    };
  }

  function ensure(draft, numberMax) {
    if (draft.mode === "custom") return;
    const valid = draft.command
      && draft.command.slots <= numberMax
      && draft.numbers.length === draft.command.slots;
    if (valid) return;
    if (!draft.initialized) {
      draft.initialized = true;
      const featured = COMMANDS.find((command) => command.id === "high-five" && command.slots <= numberMax);
      if (featured) {
        draft.intensity = "chill";
        draft.command = featured;
        draft.numbers = roll(featured.slots, numberMax);
        draft.mode = "deck";
        return;
      }
    }
    draft.initialized = true;
    pick(draft, numberMax);
  }

  function setIntensity(draft, intensity, numberMax) {
    draft.intensity = intensity;
    draft.mode = "deck";
    draft.initialized = true;
    pick(draft, numberMax);
  }

  function cycle(draft, slotIndex, numberMax) {
    if (!draft.numbers.length || numberMax < 1) return false;
    const current = draft.numbers[slotIndex];
    const others = new Set(draft.numbers.filter((_, index) => index !== slotIndex));
    for (let step = 1; step <= numberMax; step += 1) {
      const next = ((current - 1 + step) % numberMax) + 1;
      if (!others.has(next)) {
        if (next === current) return false;
        draft.numbers[slotIndex] = next;
        return true;
      }
    }
    return false;
  }

  function toggleTarget(draft, number) {
    const index = draft.customTargets.indexOf(number);
    if (index >= 0) {
      draft.customTargets.splice(index, 1);
      return true;
    }
    if (draft.customTargets.length >= 4) return false;
    draft.customTargets.push(number);
    draft.customTargets.sort((a, b) => a - b);
    return true;
  }

  function tweak(draft) {
    if (!draft.command) return;
    draft.mode = "custom";
    draft.customText = fill(draft.command.template, draft.numbers);
    draft.customTargets = [...draft.numbers];
  }

  function preview(draft) {
    if (draft.mode === "custom") return draft.customText.replace(/\s+/g, " ").trim();
    if (!draft.command) return "";
    return fill(draft.command.template, draft.numbers);
  }

  function payload(draft) {
    if (draft.mode === "custom") {
      return {
        text: draft.customText.replace(/\s+/g, " ").trim(),
        targets: [...draft.customTargets],
        intensity: draft.intensity,
        source: "custom",
      };
    }
    return {
      text: preview(draft),
      targets: [...draft.numbers],
      intensity: draft.command?.intensity || draft.intensity,
      source: "deck",
    };
  }

  window.Deck = {
    COMMANDS,
    INTENSITIES,
    newDraft,
    ensure,
    setIntensity,
    pick,
    roll,
    cycle,
    toggleTarget,
    tweak,
    preview,
    payload,
    fill,
  };
})();
