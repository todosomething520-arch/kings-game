(() => {
  function shuffle(list) {
    const arr = list.slice();
    const rand = (max) => {
      if (crypto?.getRandomValues) {
        const buf = new Uint32Array(1);
        crypto.getRandomValues(buf);
        return buf[0] % max;
      }
      return Math.floor(Math.random() * max);
    };
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = rand(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const Solo = {
    active: false,
    model: null,
    playedFlip: "",

    start() {
      this.active = true;
      this.model = {
        phase: "setup",
        names: ["阿光", "小雨", "豆子"],
        round: 0,
        seats: [],
        cursor: 0,
        command: null,
        draft: Deck.newDraft(),
      };
      this.playedFlip = "";
    },

    stop() {
      this.active = false;
      this.model = null;
    },

    setName(index, value) {
      if (!this.model) return;
      this.model.names[index] = value;
    },

    deal() {
      const names = this.model.names.map((name) => name.trim()).filter(Boolean);
      const unique = [];
      const seen = new Set();
      names.forEach((name, index) => {
        const base = [...name].slice(0, 12).join("") || `玩家${index + 1}`;
        let next = base;
        let n = 2;
        while (seen.has(next)) {
          next = `${[...base].slice(0, 10).join("")}${n}`;
          n += 1;
        }
        seen.add(next);
        unique.push(next);
      });
      while (unique.length < 3) unique.push(`玩家${unique.length + 1}`);
      const cards = shuffle([
        { role: "king" },
        ...Array.from({ length: unique.length - 1 }, (_, i) => ({ role: "number", value: i + 1 })),
      ]);
      this.model.names = unique;
      this.model.seats = unique.map((name, index) => ({ name, card: cards[index] }));
      this.model.cursor = 0;
      this.model.command = null;
      this.model.draft = Deck.newDraft();
      this.model.round += 1;
      this.model.phase = "cover";
      this.playedFlip = "";
    },

    publish(payload) {
      this.model.command = payload;
      this.model.phase = "announced";
    },

    html() {
      const model = this.model;
      if (!model) return "";
      if (model.phase === "setup") return this.setupHtml();
      if (model.phase === "cover") return this.coverHtml();
      if (model.phase === "peek") return this.peekHtml();
      if (model.phase === "kingCover") return this.kingCoverHtml();
      if (model.phase === "command") return this.commandHtml();
      if (model.phase === "announced") return this.announcedHtml();
      return this.revealHtml();
    },

    setupHtml() {
      const names = this.model.names;
      return `<section class="screen" data-testid="solo-setup">
        <p class="eyebrow">單機模式</p>
        <h1>傳一支手機</h1>
        <p class="lede">大家圍著同一支手機。輪到的人自己看牌，看完蓋上，再傳給下一位。</p>
        <div class="name-editor">${names.map((name, index) => `
          <div class="name-row">
            <label class="sr-only" for="solo-name-${index}">玩家 ${index + 1}</label>
            <input id="solo-name-${index}" data-field="solo-name" data-index="${index}" maxlength="12" value="${KG.esc(name)}" />
            ${names.length > 3 ? `<button type="button" class="text-btn danger" data-action="solo-remove" data-index="${index}">刪除</button>` : ""}
          </div>`).join("")}
        </div>
        ${names.length < 12 ? `<button type="button" class="btn btn-ghost" data-action="solo-add">再加一個人</button>` : ""}
        <p class="fine">3 到 12 人。空白的名字會自動變成「玩家 1」這樣的稱呼。</p>
        <div class="dock">
          <button type="button" class="btn btn-primary" data-action="solo-start" data-testid="solo-start">開始發牌</button>
          <button type="button" class="text-btn" data-action="rules">怎麼玩</button>
        </div>
      </section>`;
    },

    coverHtml() {
      const seat = this.model.seats[this.model.cursor];
      const total = this.model.seats.length;
      return `<section class="screen">
        <div class="cover glass">
          <p class="eyebrow">第 ${this.model.round} 回合 · ${this.model.cursor + 1} / ${total}</p>
          <p class="fine">其他人請看別處</p>
          <h1>交給 ${KG.esc(seat.name)}</h1>
          <p class="lede">拿到手機的人再按下面。牌只會出現一下下。</p>
          <button type="button" class="btn btn-primary" data-action="solo-peek" data-testid="solo-peek">我是${KG.esc(seat.name)}，看牌</button>
        </div>
      </section>`;
    },

    peekHtml() {
      const seat = this.model.seats[this.model.cursor];
      const last = this.model.cursor === this.model.seats.length - 1;
      return `<section class="screen">
        <p class="secret-note">${KG.esc(seat.name)} 的牌 · 看完就蓋起來</p>
        ${KG.cardHtml(seat.card, { testId: "solo-card" })}
        <div class="dock">
          <button type="button" class="btn btn-primary" data-action="solo-hide" data-testid="solo-hide">${last ? "看完了，交給國王" : "看完了，傳給下一位"}</button>
        </div>
      </section>`;
    },

    kingCoverHtml() {
      return `<section class="screen">
        <div class="cover glass">
          <p class="eyebrow">第 ${this.model.round} 回合</p>
          ${KG.crown("crown-lg")}
          <h1>交給國王</h1>
          <p class="lede">抽到王冠的人請拿起手機。其他人先別看這支螢幕。</p>
          <button type="button" class="btn btn-primary" data-action="solo-king">我是國王，下命令</button>
        </div>
      </section>`;
    },

    commandHtml() {
      const numberMax = this.model.seats.length - 1;
      return `<section class="screen">
        <p class="eyebrow">第 ${this.model.round} 回合</p>
        <h1>國王下令</h1>
        <p class="fine">只點號碼，不要點人名。旁邊的人請稍微離遠一點。</p>
        ${KG.composerHtml(this.model.draft, numberMax)}
        <div class="dock">
          <button type="button" class="btn btn-primary" data-action="publish" data-testid="publish-command">公布這條命令</button>
        </div>
      </section>`;
    },

    announcedHtml() {
      return `<section class="screen">
        <p class="eyebrow">第 ${this.model.round} 回合</p>
        ${KG.commandBanner(this.model.command)}
        <p class="fine">先讓大家聽清楚。準備好再揭曉是誰拿到那些號碼。</p>
        <div class="dock">
          <button type="button" class="btn btn-primary" data-action="solo-reveal" data-testid="reveal-button">揭曉誰被點到</button>
        </div>
      </section>`;
    },

    revealHtml() {
      const targets = new Set(this.model.command?.targets || []);
      const players = this.model.seats.map((seat) => ({
        id: seat.name,
        nickname: seat.name,
        card: seat.card,
        connected: true,
        left: false,
        targeted: seat.card.role === "number" && targets.has(seat.card.value),
        isKing: seat.card.role === "king",
      }));
      return `<section class="screen">
        <p class="eyebrow">第 ${this.model.round} 回合</p>
        ${KG.commandBanner(this.model.command)}
        ${KG.revealBoard(players)}
        <p class="fine">不想做就說一聲，下一輪換一條就好。</p>
        <div class="dock">
          <button type="button" class="btn btn-primary" data-action="solo-again">再來一回合</button>
          <button type="button" class="btn btn-ghost" data-action="solo-setup">改名單</button>
        </div>
      </section>`;
    },
  };

  window.Solo = Solo;
})();
