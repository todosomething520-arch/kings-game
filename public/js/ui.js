(() => {
  const INTENSITY_LABEL = { chill: "微醺破冰", normal: "親密", bold: "極限" };

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[ch]));
  }

  function crown(className = "icon") {
    return `<svg class="${className}" viewBox="0 0 64 48" aria-hidden="true"><path fill="currentColor" d="M6 40 12 16l12 12L32 6l8 22 12-12 6 24H6Z"/><path fill="currentColor" d="M8 40h48v5a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3v-5Z"/><circle cx="12" cy="14" r="3" fill="currentColor"/><circle cx="32" cy="6" r="3.2" fill="currentColor"/><circle cx="52" cy="14" r="3" fill="currentColor"/></svg>`;
  }

  function speaker(on) {
    if (on) {
      return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 10h4l5-4v12l-5-4H3v-4Z"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>`;
    }
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 10h4l5-4v12l-5-4H3v-4Z"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M16 10l5 5M21 10l-5 5"/></svg>`;
  }

  const PALETTE = [
    ["#ff4d8d", "#ffc14d"],
    ["#3ee0ff", "#5b8cff"],
    ["#c9a6ff", "#ff4d8d"],
    ["#3dffb0", "#3ee0ff"],
    ["#ffc14d", "#ff7a59"],
    ["#ff7ad9", "#8d7bff"],
  ];

  function avatar(name, extra = "") {
    const chars = [...String(name || "?")];
    const letter = chars[0] || "?";
    const index = chars.reduce((sum, ch) => sum + ch.codePointAt(0), 0) % PALETTE.length;
    const [a, b] = PALETTE[index];
    return `<span class="avatar ${extra}" style="--a:${a};--b:${b}">${esc(letter)}</span>`;
  }

  function cardFace(card) {
    if (card?.role === "king") {
      return `<span class="card-kicker">這一回合</span>
        ${crown("crown-lg")}
        <strong class="card-title">國王</strong>
        <span class="card-sub">由你下令，別人看不到你的身分</span>`;
    }
    const value = card?.value ?? "?";
    return `<span class="card-kicker">你的號碼</span>
      <strong class="num">${esc(value)}</strong>
      <span class="num-suffix">號</span>
      <span class="card-sub">先記住，先別說出來</span>`;
  }

  function cardHtml(card, { compact = false, testId = "your-card" } = {}) {
    const role = card?.role === "king" ? "king" : "number";
    return `<article class="hero-card ${compact ? "is-compact" : ""} ${role === "king" ? "is-king" : "is-num"}" data-testid="${testId}" data-role="${role}">
      ${cardFace(card)}
    </article>`;
  }

  function intensityName(id) {
    if (typeof Deck?.label === "function") return Deck.label(id);
    return INTENSITY_LABEL[id] || "懲罰";
  }

  function levelPicker(draft) {
    const buttons = Deck.levels().map((item) => {
      const pressed = draft.intensity === item.id && draft.mode === "deck";
      return `<button type="button" class="level-btn heat-${item.heat} ${pressed ? "is-on" : ""}" data-action="set-intensity" data-intensity="${item.id}" aria-pressed="${pressed}"><b>Lv${item.heat}</b><span>${esc(item.name)}</span></button>`;
    }).join("");
    return `<div class="level-picker" data-testid="level-picker" role="group" aria-label="懲罰等級">${buttons}</div>`;
  }

  function commandBanner(command) {
    if (!command) return "";
    const label = intensityName(command.intensity);
    const heat = String(command.intensity || "lv1").replace(/\D/g, "") || "1";
    return `<section class="command-banner glass heat-${esc(heat)}">
      <div class="banner-top"><span class="pill">${esc(label)}</span><span class="banner-kicker">國王的命令</span></div>
      <p class="command-text" data-testid="public-command">${esc(command.text)}</p>
    </section>`;
  }

  function composerHtml(draft, numberMax, options = {}) {
    Deck.ensure(draft, numberMax);
    const current = Deck.levels().find((item) => item.id === draft.intensity);
    const picker = levelPicker(draft);
    const consent = `<p class="fine consent-note">任何人都可以跳過，也可以喝酒代替。</p>`;
    const edit = options.canEdit
      ? `<button type="button" class="text-btn" data-action="open-editor">編輯自訂 Lv6 / Lv7</button>`
      : "";

    if (draft.mode === "custom") {
      const chips = Array.from({ length: numberMax }, (_, index) => {
        const number = index + 1;
        const on = draft.customTargets.includes(number);
        return `<button type="button" class="num-chip ${on ? "is-on" : ""}" data-action="toggle-target" data-n="${number}" aria-pressed="${on}">${number}</button>`;
      }).join("");
      return `<section class="composer glass">
        ${picker}
        <p class="seg-hint">${esc(current?.hint || "")}。自己寫的時候，也點一下揭曉要標出的號碼。</p>
        ${consent}
        <label class="field-label" for="custom-text">你的命令</label>
        <textarea id="custom-text" maxlength="80" rows="3" placeholder="例如：3號 對 5號 說一句只准今晚說的話">${esc(draft.customText)}</textarea>
        <div class="count-row"><span id="custom-count">${[...draft.customText.trim()].length}/80</span></div>
        <p class="field-label">揭曉時要標出的號碼</p>
        <div class="chip-row">${chips || `<span class="muted">這一輪沒有號碼</span>`}</div>
        <button type="button" class="btn btn-ghost" data-action="back-deck">回到懲罰牌</button>
        ${edit}
      </section>`;
    }

    if (!draft.command) {
      return `<section class="composer glass">
        ${picker}
        <p class="seg-hint">${esc(current?.hint || "")}</p>
        ${consent}
        <p class="empty">這一層還沒有懲罰。主持人可以先編輯自訂層。</p>
        ${edit}
      </section>`;
    }

    const text = Deck.preview(draft);
    const slots = (draft.numbers || []).map((number, index) => (
      `<button type="button" class="slot" data-action="cycle-slot" data-slot="${index}">${number} 號</button>`
    )).join("");
    return `<section class="composer glass">
      ${picker}
      <p class="seg-hint">${esc(current?.hint || "")}</p>
      <blockquote class="cmd-preview" data-testid="command-preview">${esc(text)}</blockquote>
      ${draft.command.slots ? `<div class="chip-row slot-row" aria-label="目標號碼">${slots}<button type="button" class="text-btn" data-action="reroll">換號碼</button></div>` : `<p class="seg-hint">這條沒有指定號碼。</p>`}
      <div class="composer-actions">
        <button type="button" class="btn btn-ghost" data-action="shuffle-cmd">換一條</button>
        <button type="button" class="btn btn-ghost" data-action="tweak">自己改</button>
      </div>
      ${consent}
      ${edit}
    </section>`;
  }

  function revealCard(player, wide) {
    const king = player.isKing;
    const value = king ? "王冠" : `${player.card.value} 號`;
    const badges = [
      player.targeted ? `<span class="badge badge-hit">中招</span>` : "",
      king ? `<span class="badge badge-king">國王</span>` : "",
      player.left ? `<span class="badge">已離開</span>` : "",
      !player.left && player.connected === false ? `<span class="badge">離線</span>` : "",
    ].join("");
    return `<article class="reveal-card ${wide ? "is-wide" : ""} ${player.targeted ? "is-target" : ""} ${king ? "is-king" : ""} ${player.left ? "is-left" : ""}">
      <div class="reveal-top">${avatar(player.nickname)}<div class="roster-copy"><strong>${esc(player.nickname)}</strong><span>${esc(value)}</span></div></div>
      <div class="badge-row">${badges}</div>
    </article>`;
  }

  function revealBoard(players) {
    const targets = players.filter((player) => player.targeted);
    const king = players.find((player) => player.isKing);
    const rest = players.filter((player) => !player.targeted && !player.isKing);
    const summary = targets.length
      ? targets.map((player) => `${player.card.value} 號 ${player.nickname}`).join("、")
      : "這條沒有指定號碼，大家一起完成。";
    return `<section data-testid="reveal-board">
      <h2 class="section-title">${targets.length ? "被點到的人" : "全場命令"}</h2>
      <p class="summary">${esc(summary)}</p>
      <div class="reveal-grid">
        ${targets.map((player) => revealCard(player, true)).join("")}
        ${king ? revealCard(king, true) : ""}
        ${rest.map((player) => revealCard(player, false)).join("")}
      </div>
    </section>`;
  }

  function roster(players, { hostControls = false } = {}) {
    if (!players.length) {
      return `<p class="empty">還沒有其他人。把代碼丟到群組吧。</p>`;
    }
    return `<ul class="roster" data-testid="player-list">${players.map((player) => `
      <li class="roster-item ${player.connected ? "" : "is-off"}">
        ${avatar(player.nickname, player.isHost ? "is-host" : "")}
        <div class="roster-copy">
          <strong>${esc(player.nickname)}${player.isYou ? " · 你" : ""}</strong>
          <span>${player.isHost ? "主持人" : "玩家"}${player.connected ? "" : " · 離線"}</span>
        </div>
        ${hostControls && !player.isYou ? `<button type="button" class="text-btn danger" data-action="kick" data-id="${esc(player.id)}" data-name="${esc(player.nickname)}">移出</button>` : ""}
      </li>`).join("")}</ul>`;
  }

  let toastTimer = 0;
  function toast(message) {
    const root = document.getElementById("toast-root");
    if (!root) return;
    root.innerHTML = `<div class="toast" role="status">${esc(message)}</div>`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      root.innerHTML = "";
    }, 2800);
  }

  function openModal(html) {
    const root = document.getElementById("modal-root");
    root.innerHTML = html;
    root.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeModal(value) {
    const root = document.getElementById("modal-root");
    root.hidden = true;
    root.innerHTML = "";
    document.body.classList.remove("modal-open");
    const resolve = window.KG._resolve;
    window.KG._resolve = null;
    if (resolve) resolve(value);
  }

  function confirm({ title, body, confirmText = "確定", cancelText = "取消", danger = false }) {
    return new Promise((resolve) => {
      window.KG._resolve = resolve;
      openModal(`<div class="modal-back"><div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-testid="confirm-dialog">
        <h2 id="modal-title">${esc(title)}</h2>
        <p>${esc(body)}</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" data-action="confirm-no">${esc(cancelText)}</button>
          <button type="button" class="btn ${danger ? "btn-danger" : "btn-primary"}" data-action="confirm-yes">${esc(confirmText)}</button>
        </div>
      </div></div>`);
    });
  }

  function info({ title, html }) {
    window.KG._resolve = null;
    openModal(`<div class="modal-back"><div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h2 id="modal-title">${esc(title)}</h2>
      <div class="rules">${html}</div>
      <button type="button" class="btn btn-primary" data-action="close-modal">知道了</button>
    </div></div>`);
  }

  function rules() {
    info({
      title: "怎麼玩",
      html: `<ol>
        <li>主持人開一間房，朋友輸入代碼、掃 QR，或開分享連結加入。至少 3 人。</li>
        <li>每一輪秘密發牌。一個人是國王，其他人是 1 號到最後一號。每支手機只看得到自己的牌。</li>
        <li>國王先選等級，再抽一條成人懲罰，或自己寫。等級從微醺到極限，另外兩層由主持人自訂。</li>
        <li>主持人揭曉：被點到的號碼到底是誰。然後開始下一輪。</li>
      </ol>
      <p>這是 18 歲以上、彼此同意的局。任何人都可以跳過，也可以喝酒代替。不願意被碰、被親或脫外套，就直接說。單機模式用同一支手機，自訂層也存在這台裝置。</p>`,
    });
  }

  window.KG = {
    esc,
    crown,
    speaker,
    avatar,
    cardHtml,
    commandBanner,
    composerHtml,
    revealBoard,
    roster,
    toast,
    confirm,
    closeModal,
    rules,
    intensityName,
  };
})();
