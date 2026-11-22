(() => {
  const app = {
    mode: "boot",
    joinCode: "",
    booted: false,
    soundOn: localStorage.getItem("kg-sound") !== "off",
    busy: false,
  };

  const socket = io({ transports: ["websocket", "polling"] });
  Online.init(socket);

  function $(id) { return document.getElementById(id); }

  function roomLink(code) {
    const url = new URL(location.origin + location.pathname);
    url.searchParams.set("room", code);
    return url.toString();
  }

  function urlRoom() {
    return new URLSearchParams(location.search).get("room")?.toUpperCase().replace(/[^A-Z0-9]/g, "") || "";
  }

  function setRoomUrl(code) {
    const url = new URL(location.href);
    if (url.searchParams.get("room") === code) return;
    url.searchParams.set("room", code);
    history.replaceState({ room: code }, "", url);
  }

  function clearRoomUrl() {
    const url = new URL(location.href);
    if (!url.searchParams.has("room")) return;
    url.searchParams.delete("room");
    history.replaceState({}, "", url.pathname);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch { /* fall through */ }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }

  let audioCtx = null;
  function blip(freq = 660, dur = 0.08) {
    if (!app.soundOn) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.035;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.stop(audioCtx.currentTime + dur);
  }

  function updateChrome() {
    const pill = $("round-pill");
    const leave = $("leave-btn");
    const sound = $("sound-btn");
    let round = 0;
    let showLeave = false;
    if (app.mode === "online" && Online.state?.round) round = Online.state.round;
    if (app.mode === "solo" && Solo.model?.round) round = Solo.model.round;
    if (app.mode === "online" || app.mode === "solo") showLeave = true;
    pill.hidden = !(round > 0);
    pill.textContent = round > 0 ? `第 ${round} 回合` : "";
    leave.hidden = !showLeave;
    leave.textContent = app.mode === "solo" ? "結束" : "離開";
    sound.innerHTML = KG.speaker(app.soundOn);
    sound.setAttribute("aria-pressed", app.soundOn ? "true" : "false");
    sound.setAttribute("aria-label", app.soundOn ? "關閉音效" : "開啟音效");
    document.body.dataset.mode = app.mode;
    $("net-banner").hidden = !(app.mode === "online" && Online.reconnecting);
  }

  function render() {
    if (app.mode === "online") return Online.html();
    if (app.mode === "solo") return Solo.html();
    if (app.mode === "create") return createHtml();
    if (app.mode === "join") return joinHtml();
    if (app.mode === "boot") {
      return `<section class="screen boot"><p class="eyebrow">手機開局</p><h1>正在連上牌桌…</h1><p class="lede">如果網路不穩，單機模式還是可以玩。</p>
        <button type="button" class="btn btn-ghost" data-action="go-solo">先玩單機</button></section>`;
    }
    return homeHtml();
  }

  function homeHtml() {
    return `<section class="screen" data-testid="home">
      <p class="eyebrow">手機開局 · 不用下載</p>
      <h1>誰是國王</h1>
      <p class="lede">每人秘密抽一張牌。國王只對號碼下令，揭曉之前，沒人知道中招的是誰。</p>
      <div class="stack">
        <button type="button" class="btn btn-primary" data-action="go-create">開一間房</button>
        <button type="button" class="btn btn-ghost" data-action="go-join">我有房間代碼</button>
        <button type="button" class="btn btn-ghost" data-action="go-solo">單機傳手機</button>
      </div>
      <ol class="steps">
        <li><b>1</b><span>開一間房，把代碼或 QR 傳給朋友。</span></li>
        <li><b>2</b><span>各自在自己的手機上抽牌，只有自己看得到。</span></li>
        <li><b>3</b><span>國王下令，主持人再揭曉被點到的號碼是誰。</span></li>
      </ol>
      <button type="button" class="text-btn" data-action="rules">怎麼玩、什麼不能做</button>
    </section>`;
  }

  function createHtml() {
    return `<section class="screen">
      <p class="eyebrow">開房間</p>
      <h1>先取一個暱稱</h1>
      <p class="lede">朋友會看到這個名字。牌發下來之後，只有你看得到自己的那張。</p>
      <form data-action="create-room" class="stack">
        <label class="field"><span class="field-label">暱稱</span>
          <input id="nick-input" name="nickname" maxlength="12" required placeholder="例如 小雨" autocomplete="nickname" enterkeyhint="done" />
        </label>
        <button type="submit" class="btn btn-primary" data-testid="create-room">建立房間</button>
      </form>
      <button type="button" class="btn btn-ghost" data-action="go-home">返回</button>
    </section>`;
  }

  function joinHtml() {
    const invited = Boolean(app.joinCode);
    return `<section class="screen">
      <p class="eyebrow">${invited ? "你被邀請了" : "加入房間"}</p>
      <h1>${invited ? "進這一局" : "輸入代碼"}</h1>
      <p class="lede">${invited ? "取個暱稱就能坐下。人到齊，主持人就會發牌。" : "跟主持人要 4 碼房間代碼。"}</p>
      <form data-action="join-room" class="stack">
        <label class="field"><span class="field-label">房間代碼</span>
          <input id="code-input" class="code-input" name="code" maxlength="6" required value="${KG.esc(app.joinCode)}" placeholder="K7MQ" autocapitalize="characters" autocomplete="off" enterkeyhint="next" />
        </label>
        <label class="field"><span class="field-label">暱稱</span>
          <input id="nick-input" name="nickname" maxlength="12" required placeholder="例如 豆子" autocomplete="nickname" enterkeyhint="done" />
        </label>
        <button type="submit" class="btn btn-primary" data-testid="join-room">加入房間</button>
      </form>
      <button type="button" class="btn btn-ghost" data-action="go-home">返回</button>
    </section>`;
  }

  function paint({ resetScroll = false } = {}) {
    const view = $("view");
    const active = document.activeElement;
    const focusId = active?.id;
    const selStart = active?.selectionStart;
    const selEnd = active?.selectionEnd;
    const scrollY = window.scrollY;
    view.innerHTML = render();
    updateChrome();
    if (focusId) {
      const next = document.getElementById(focusId);
      if (next) {
        next.focus();
        if (typeof selStart === "number" && next.setSelectionRange) {
          try { next.setSelectionRange(selStart, selEnd); } catch { /* ignore */ }
        }
      }
    }
    if (resetScroll) window.scrollTo(0, 0);
    else window.scrollTo(0, scrollY);
  }

  function showHome({ resetScroll = true, clearUrl = false } = {}) {
    if (app.mode === "solo") Solo.stop();
    app.mode = "home";
    if (clearUrl) clearRoomUrl();
    paint({ resetScroll });
  }

  function showCreate() {
    app.mode = "create";
    paint({ resetScroll: true });
    $("nick-input")?.focus();
  }

  function showJoin(code = "") {
    app.mode = "join";
    app.joinCode = code || "";
    paint({ resetScroll: true });
    const field = code ? $("nick-input") : $("code-input");
    field?.focus();
  }

  function showSolo() {
    Online.active = false;
    Solo.start();
    app.mode = "solo";
    paint({ resetScroll: true });
  }

  function enterOnline(resetScroll) {
    app.mode = "online";
    Online.reconnecting = false;
    if (Online.state?.code) setRoomUrl(Online.state.code);
    paint({ resetScroll });
  }

  function draftContext() {
    if (app.mode === "online" && Online.state?.status === "command" && Online.state.you?.card?.role === "king") {
      return { draft: Online.draft, numberMax: Online.state.numberMax };
    }
    if (app.mode === "solo" && Solo.model?.phase === "command") {
      return { draft: Solo.model.draft, numberMax: Solo.model.seats.length - 1 };
    }
    return null;
  }

  async function publish() {
    const ctx = draftContext();
    if (!ctx) return;
    const payload = Deck.payload(ctx.draft);
    if (!payload.text) {
      KG.toast("先寫一條命令");
      return;
    }
    if ([...payload.text].length > 80) {
      KG.toast("命令太長了，80 字以內就好");
      return;
    }
    if (app.mode === "solo") {
      Solo.publish(payload);
      paint({ resetScroll: true });
      blip(520, 0.12);
      return;
    }
    const res = await Online.emit("game:command", payload);
    if (!res.ok) KG.toast(res.error || "命令沒送出去");
  }

  async function route(action, el) {
    if (action === "confirm-yes") return KG.closeModal(true);
    if (action === "confirm-no" || action === "close-modal") return KG.closeModal(false);
    if (action === "go-home") return showHome({ clearUrl: false });
    if (action === "go-create") return showCreate();
    if (action === "go-join") return showJoin(urlRoom());
    if (action === "go-solo") return showSolo();
    if (action === "rules") return KG.rules();
    if (action === "toggle-sound") {
      app.soundOn = !app.soundOn;
      localStorage.setItem("kg-sound", app.soundOn ? "on" : "off");
      if (app.soundOn) blip(660, 0.07);
      updateChrome();
      return;
    }
    if (action === "leave") return onLeave();
    if (action === "create-room") return submitCreate(el);
    if (action === "join-room") return submitJoin(el);
    if (action === "copy-code") {
      const ok = await copyText(Online.state?.code || "");
      KG.toast(ok ? "代碼已複製" : "複製失敗，請手動選取");
      return;
    }
    if (action === "share") return shareRoom();
    if (action === "kick") return kick(el.dataset.id, el.dataset.name);
    if (action === "start") return act("game:start");
    if (action === "reveal") return act("game:reveal");
    if (action === "next") return act("game:next");
    if (action === "redeal") return act("game:redeal");
    if (action === "publish") return publish();
    if (action === "set-intensity") return mutateDraft((draft, numberMax) => Deck.setIntensity(draft, el.dataset.intensity, numberMax));
    if (action === "shuffle-cmd") return mutateDraft((draft, numberMax) => Deck.pick(draft, numberMax));
    if (action === "reroll") {
      return mutateDraft((draft, numberMax) => {
        if (!draft.command?.slots) return;
        const before = draft.numbers.join();
        draft.numbers = Deck.roll(draft.command.slots, numberMax);
        if (draft.numbers.join() === before && numberMax <= draft.command.slots) KG.toast("這一輪就這幾個號碼");
      });
    }
    if (action === "cycle-slot") {
      return mutateDraft((draft, numberMax) => {
        const changed = Deck.cycle(draft, Number(el.dataset.slot), numberMax);
        if (!changed) KG.toast("沒有別的號碼可以換了");
      });
    }
    if (action === "tweak") return mutateDraft((draft) => Deck.tweak(draft));
    if (action === "back-deck") return mutateDraft((draft) => { draft.mode = "deck"; });
    if (action === "toggle-target") {
      return mutateDraft((draft) => {
        const ok = Deck.toggleTarget(draft, Number(el.dataset.n));
        if (!ok) KG.toast("一次最多點 4 個號碼");
      });
    }
    if (action === "solo-add") {
      if (Solo.model.names.length >= 12) return;
      Solo.model.names.push(`玩家${Solo.model.names.length + 1}`);
      paint();
      return;
    }
    if (action === "solo-remove") {
      Solo.model.names.splice(Number(el.dataset.index), 1);
      paint();
      return;
    }
    if (action === "solo-start" || action === "solo-again") {
      const filled = Solo.model.names.map((name) => name.trim()).filter(Boolean);
      if (filled.length < 3 && action === "solo-start") {
        KG.toast("至少要 3 個人");
        return;
      }
      Solo.deal();
      paint({ resetScroll: true });
      return;
    }
    if (action === "solo-peek") {
      Solo.model.phase = "peek";
      paint({ resetScroll: true });
      blip(720, 0.08);
      return;
    }
    if (action === "solo-hide") {
      Solo.model.cursor += 1;
      Solo.model.phase = Solo.model.cursor >= Solo.model.seats.length ? "kingCover" : "cover";
      paint({ resetScroll: true });
      return;
    }
    if (action === "solo-king") {
      Solo.model.phase = "command";
      paint({ resetScroll: true });
      return;
    }
    if (action === "solo-reveal") {
      Solo.model.phase = "reveal";
      paint({ resetScroll: true });
      blip(880, 0.1);
      return;
    }
    if (action === "solo-setup") {
      Solo.model.phase = "setup";
      paint({ resetScroll: true });
    }
  }

  function mutateDraft(fn) {
    const ctx = draftContext();
    if (!ctx?.draft) return;
    fn(ctx.draft, ctx.numberMax);
    paint();
  }

  async function act(event) {
    const res = await Online.emit(event, {});
    if (!res.ok) KG.toast(res.error || "現在還不能做這個");
  }

  async function submitCreate(form) {
    if (app.busy) return;
    const nickname = new FormData(form).get("nickname");
    app.busy = true;
    const button = form.querySelector("button[type=submit]");
    if (button) button.disabled = true;
    const res = await Online.emit("room:create", { nickname });
    app.busy = false;
    if (!res.ok) {
      if (button) button.disabled = false;
      KG.toast(res.error || "沒能建立房間");
    }
  }

  async function submitJoin(form) {
    if (app.busy) return;
    const data = new FormData(form);
    const nickname = data.get("nickname");
    const code = String(data.get("code") || "");
    app.busy = true;
    const button = form.querySelector("button[type=submit]");
    if (button) button.disabled = true;
    const res = await Online.emit("room:join", { nickname, code });
    app.busy = false;
    if (!res.ok) {
      if (button) button.disabled = false;
      KG.toast(res.error || "沒能加入房間");
      return;
    }
    if (res.session?.nickname && res.session.nickname !== String(nickname).trim()) {
      KG.toast(`暱稱跟別人撞了，你現在是 ${res.session.nickname}`);
    }
  }

  async function shareRoom() {
    const code = Online.state?.code;
    if (!code) return;
    const url = roomLink(code);
    const text = `來玩國王遊戲！房間代碼 ${code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "國王遊戲", text, url });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }
    const ok = await copyText(`${text}\n${url}`);
    KG.toast(ok ? "連結已複製" : "沒辦法分享，請複製代碼");
  }

  async function kick(id, name) {
    if (!id) return;
    const midCommand = Online.state?.status === "command";
    const ok = await KG.confirm({
      title: `移出 ${name}？`,
      body: midCommand
        ? "這個人會離開房間。這一輪還沒公布命令，所以會重新發牌。"
        : "這個人會離開房間。進行中的這一輪，揭曉時仍會看到他的牌。",
      confirmText: "移出",
      cancelText: "取消",
      danger: true,
    });
    if (!ok) return;
    const res = await Online.emit("room:kick", { playerId: id });
    if (!res.ok) KG.toast(res.error || "沒能移出");
  }

  async function onLeave() {
    if (app.mode === "solo") {
      if (Solo.model?.phase && Solo.model.phase !== "setup") {
        const ok = await KG.confirm({
          title: "結束單機？",
          body: "這一輪的牌會清掉，名單也會回到一開始。",
          confirmText: "結束",
          cancelText: "再玩一下",
          danger: true,
        });
        if (!ok) return;
      }
      Solo.stop();
      showHome({ resetScroll: true });
      return;
    }
    if (app.mode !== "online") return showHome({ resetScroll: true });
    const mid = Online.state && Online.state.status !== "lobby";
    if (mid) {
      const ok = await KG.confirm({
        title: "要離開這一局嗎？",
        body: "離開後不會再收到這一房的更新。如果這一輪已經發牌，你的牌會留到揭曉，大家會看到你已離開。",
        confirmText: "確定離開",
        cancelText: "留下",
        danger: true,
      });
      if (!ok) return;
    }
    Online.leave();
  }

  document.addEventListener("click", (event) => {
    const el = event.target.closest("[data-action]");
    if (!el || el.disabled) return;
    if (el.tagName === "BUTTON" && el.type === "submit") return;
    void route(el.dataset.action, el);
  });

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.dataset.action) return;
    event.preventDefault();
    void route(form.dataset.action, form);
  });

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (target?.id === "custom-text") {
      const ctx = draftContext();
      if (!ctx) return;
      ctx.draft.customText = target.value;
      const count = document.getElementById("custom-count");
      if (count) count.textContent = `${[...target.value.trim()].length}/80`;
      return;
    }
    if (target?.dataset.field === "solo-name") {
      Solo.setName(Number(target.dataset.index), target.value);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && ! $("modal-root").hidden) KG.closeModal(false);
  });

  $("modal-root").addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-back")) KG.closeModal(false);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && app.mode === "solo" && Solo.model?.phase === "peek") {
      Solo.model.phase = "cover";
      paint({ resetScroll: true });
    }
  });

  socket.on("connect", () => {
    Online.reconnecting = false;
    if (app.mode === "solo") {
      app.booted = true;
      return;
    }
    const session = Online.readSession();
    const invited = urlRoom();
    if (session && (!invited || invited === session.code)) {
      socket.emit("room:reconnect", session, (res) => {
        if (res?.ok) return;
        Online.clearSession();
        Online.active = false;
        KG.toast(res?.error || "上一場已經結束，請重新加入");
        if (invited) showJoin(invited);
        else if (app.mode === "boot" || app.mode === "online") showHome();
      });
      app.booted = true;
      return;
    }
    if (session && invited && invited !== session.code) {
      Online.active = false;
      socket.emit("room:leave", {}, () => {
        Online.clearSession();
        showJoin(invited);
      });
      app.booted = true;
      return;
    }
    if (!app.booted) {
      app.booted = true;
      if (app.mode === "boot") {
        if (invited) showJoin(invited);
        else showHome();
      }
    } else if (app.mode === "online") {
      paint();
    }
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      if (app.mode === "online" && Online.active) {
        Online.active = false;
        Online.state = null;
        KG.toast("連線已改由另一個分頁接手");
        showHome();
      }
      return;
    }
    if (app.mode === "online") {
      Online.reconnecting = true;
      updateChrome();
    }
  });

  window.App = { showHome, enterOnline, roomLink, blip };
  updateChrome();
})();
