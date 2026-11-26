(() => {
  const STORAGE_KEY = "kings-game-custom-deck";

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!raw) return DeckCore.defaultCustomDeck();
      return DeckCore.normalizeCustomDeck(raw);
    } catch {
      return DeckCore.defaultCustomDeck();
    }
  }

  function save(deck) {
    const clean = DeckCore.normalizeCustomDeck(deck);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    return clean;
  }

  function activeCustom() {
    if (typeof Deck.getCustom === "function") return Deck.getCustom();
    return load();
  }

  function poolFor(levelId, numberMax) {
    return DeckCore.commandsFor(levelId, activeCustom()).filter((command) => command.slots <= numberMax);
  }

  function roll(slots, numberMax) {
    return DeckCore.rollNumbers(slots, numberMax);
  }

  function fill(template, numbers) {
    return DeckCore.fillTemplate(template, numbers);
  }

  function pick(draft, numberMax) {
    const usable = poolFor(draft.intensity, numberMax);
    draft.mode = "deck";
    if (!usable.length) {
      draft.command = null;
      draft.numbers = [];
      return;
    }
    let index = Math.floor(Math.random() * usable.length);
    if (usable.length > 1 && draft.command && usable[index].id === draft.command.id) {
      index = (index + 1) % usable.length;
    }
    draft.command = usable[index];
    draft.numbers = roll(usable[index].slots, numberMax);
  }

  function newDraft() {
    return {
      intensity: "lv1",
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
      && draft.command.level === draft.intensity
      && draft.command.slots <= numberMax
      && draft.numbers.length === draft.command.slots;
    if (valid) return;
    if (!draft.initialized) {
      draft.initialized = true;
      draft.intensity = draft.intensity || "lv1";
      const pool = poolFor(draft.intensity, numberMax);
      if (pool[0]) {
        draft.command = pool[0];
        draft.numbers = roll(pool[0].slots, numberMax);
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
      intensity: draft.command?.level || draft.intensity,
      source: "deck",
    };
  }

  window.DeckStore = { load, save, STORAGE_KEY };
  window.Deck = {
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
    levels: () => DeckCore.levelMeta(activeCustom()),
    label: (id) => DeckCore.labelFor(id, activeCustom()),
  };
})();
