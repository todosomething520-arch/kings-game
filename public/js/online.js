(() => {
  const SESSION_KEY = "kings-game-session";

  const Online = {
    socket: null,
    active: false,
    state: null,
    draft: null,
    draftKey: "",
    playedFlip: "",
    seenNotice: false,
    lastNoticeId: null,
    reconnecting: false,

    init(socket) {
      this.socket = socket;
      socket.on("session", (session) => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        this.active = true;
        this.seenNotice = false;
        this.lastNoticeId = null;
      });
      socket.on("state", (state) => this.onState(state));
      socket.on("room:kicked", (payload) => {
        this.active = false;
        this.state = null;
        localStorage.removeItem(SESSION_KEY);
        KG.toast(payload?.message || "你被主持人移出房間了");
        window.App.showHome({ resetScroll: true, clearUrl: true });
      });
    },

    readSession() {
      try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      } catch {
        return null;
      }
    },

    clearSession() {
      localStorage.removeItem(SESSION_KEY);
    },

    onState(state) {
      if (!this.active) return;
      const prev = this.state;
      const screenChanged = !prev || prev.status !== state.status || prev.round !== state.round || prev.dealId !== state.dealId;
      this.state = state;
      if (state.status === "command" && state.you?.card?.role === "king") {
        const key = `${state.code}:${state.dealId}`;
        if (this.draftKey !== key) {
          this.draft = Deck.newDraft();
          this.draftKey = key;
        }
      }
      if (!this.seenNotice) {
        this.seenNotice = true;
        this.lastNoticeId = state.notice?.id ?? null;
      } else if (state.notice && state.notice.id !== this.lastNoticeId) {
        this.lastNoticeId = state.notice.id;
        KG.toast(state.notice.text);
      }
      this.sound(prev, state);
      this.announce(prev, state);
      window.App.enterOnline(screenChanged);
    },

    sound(prev, state) {
      if (!prev) return;
      if (prev.status !== "command" && state.status === "command" && state.you?.card) window.App.blip(720, 0.09);
      if (prev.status !== "announced" && state.status === "announced") window.App.blip(520, 0.12);
      if (prev.status !== "reveal" && state.status === "reveal") {
        window.App.blip(660, 0.08);
        setTimeout(() => window.App.blip(880, 0.12), 90);
        navigator.vibrate?.([12, 30, 12]);
      }
      if (state.status === "lobby" && state.players.length > (prev.players?.length || 0)) window.App.blip(480, 0.05);
    },

    announce(prev, state) {
      const live = document.getElementById("live");
      if (!live) return;
      if (prev?.status !== state.status && state.status === "announced" && state.command) {
        live.textContent = `國王的命令：${state.command.text}`;
      }
      if (prev?.status !== state.status && state.status === "reveal") {
        const hits = state.players.filter((player) => player.targeted).map((player) => `${player.card.value}號 ${player.nickname}`);
        live.textContent = hits.length ? `揭曉，被點到的是 ${hits.join("、")}` : "揭曉，這條是全場命令";
      }
    },

    leave() {
      this.active = false;
      this.state = null;
      this.clearSession();
      this.socket.emit("room:leave", {});
      window.App.showHome({ resetScroll: true, clearUrl: true });
    },

    emit(event, payload = {}) {
      return new Promise((resolve) => {
        this.socket.emit(event, payload, (res) => resolve(res || { ok: false, error: "沒有回應" }));
      });
    },

    html() {
      const state = this.state;
      if (!state) return "";
      if (state.status === "lobby") return this.lobbyHtml(state);
      if (state.status === "command") return this.commandHtml(state);
      if (state.status === "announced") return this.announcedHtml(state);
      return this.revealHtml(state);
    },

    lobbyHtml(state) {
      const chars = [...state.code];
      const ready = state.connectedCount >= state.minPlayers;
      const lack = Math.max(0, state.minPlayers - state.connectedCount);
      const dots = Array.from({ length: state.minPlayers }, (_, index) => (
        `<i class="${index < Math.min(state.connectedCount, state.minPlayers) ? "on" : ""}"></i>`
      )).join("");
      return `<section class="screen" data-testid="lobby">
        <div class="lobby-head">
          <p class="eyebrow">房間代碼</p>
          <div class="code-row" data-testid="lobby-code" aria-label="房間代碼 ${KG.esc(state.code)}">${chars.map((ch) => `<span>${KG.esc(ch)}</span>`).join("")}</div>
          <p class="fine">${state.round > 0 ? `已經玩了 ${state.round} 回合。` : "把代碼傳給朋友，湊滿 3 人就能開局。"}</p>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-ghost" data-action="copy-code">複製代碼</button>
          <button type="button" class="btn btn-ghost" data-action="share">分享連結</button>
        </div>
        <div class="glass qr-wrap">
          <img id="qr" alt="加入房間的 QR code" width="168" height="168" src="/rooms/${KG.esc(state.code)}/qr.svg" />
          <p class="qr-caption">朋友用手機掃碼，或開你分享的連結</p>
        </div>
        <div class="progress-dots" aria-hidden="true">${dots}</div>
        <p class="fine" style="text-align:center">線上 ${state.connectedCount} 人${lack ? `，還差 ${lack} 人` : "，可以開始了"} · 最多 ${state.maxPlayers} 人</p>
        ${KG.roster(state.players, { hostControls: state.you?.isHost })}
        <div class="dock">
          ${state.you?.isHost
            ? `<button type="button" class="btn btn-primary" data-action="start" data-testid="start-game" ${ready ? "" : "disabled"}>開始遊戲</button>
               ${ready ? "" : `<p>人到齊，按鈕就會亮起來</p>`}`
            : `<p data-testid="waiting-host">等待主持人開局</p>`}
        </div>
      </section>`;
    },

    commandHtml(state) {
      if (!state.you?.inRound) {
        return `<section class="screen">
          <p class="eyebrow">第 ${state.round} 回合</p>
          <div class="glass"><h1 style="font-size:2rem">這一輪已經發牌</h1><p class="lede">你從下一回合開始抽牌。先坐著看這一輪。</p></div>
        </section>`;
      }
      const king = state.you.card?.role === "king";
      if (king) {
        return `<section class="screen" data-testid="king-view">
          <p class="secret-note">第 ${state.round} 回合 · 只有你知道自己是國王</p>
          ${KG.cardHtml(state.you.card, { compact: true })}
          ${KG.composerHtml(this.draft, state.numberMax)}
          <div class="dock">
            <button type="button" class="btn btn-primary" data-action="publish" data-testid="publish-command">公布這條命令</button>
            ${state.kingOnline === false ? `<button type="button" class="btn btn-ghost" data-action="redeal">國王離線了，重新發牌</button><p>如果只是對方在重新整理，先等幾秒。</p>` : ""}
          </div>
        </section>`;
      }
      return `<section class="screen" data-testid="player-view">
        <p class="secret-note">第 ${state.round} 回合 · 這張牌只有你看得到</p>
        ${KG.cardHtml(state.you.card)}
        <div class="glass wait-card">
          <div class="pulse">${KG.crown("icon")}</div>
          <div>
            <strong>國王正在想命令</strong>
            <p class="fine">號碼先藏好。被點到之前，誰也不知道是你。</p>
          </div>
        </div>
        ${state.you.isHost && state.kingOnline === false ? `<div class="dock"><button type="button" class="btn btn-ghost" data-action="redeal">國王離線了，重新發牌</button><p>如果只是重新整理，先等幾秒。</p></div>` : ""}
      </section>`;
    },

    privateHint(state) {
      const card = state.you?.card;
      const command = state.command;
      if (!state.you?.inRound || !card) return "這一輪你沒有牌，下一回合才會抽。";
      if (card.role === "king") return "命令已經送出。等揭曉，看看是誰中招。";
      if (!command?.targets?.length) return "這條是給全場的。";
      if (command.targets.includes(card.value)) return "你被點到了。先別出聲，等揭曉。";
      return "這次好像不是你。先裝鎮定。";
    },

    announcedHtml(state) {
      const chip = state.you?.inRound && state.you.card
        ? `<div class="you-chip"><span class="pill">${state.you.card.role === "king" ? "你是國王" : `你是 ${state.you.card.value} 號`}</span></div>`
        : "";
      return `<section class="screen" data-testid="announced-view">
        <p class="eyebrow">第 ${state.round} 回合</p>
        ${KG.commandBanner(state.command)}
        <p class="hint-private">${KG.esc(this.privateHint(state))}</p>
        ${chip}
        <div class="dock">
          ${state.you?.isHost
            ? `<button type="button" class="btn btn-primary" data-action="reveal" data-testid="reveal-button">揭曉是誰</button>`
            : `<p>等主持人揭曉</p>`}
        </div>
      </section>`;
    },

    revealHtml(state) {
      return `<section class="screen" data-testid="reveal-view">
        <p class="eyebrow">第 ${state.round} 回合 · 揭曉</p>
        ${KG.commandBanner(state.command)}
        ${KG.revealBoard(state.players)}
        <p class="fine">不想做就直接說。沒有懲罰，下一輪換一條就好。</p>
        <div class="dock">
          ${state.you?.isHost
            ? `<button type="button" class="btn btn-primary" data-action="next" data-testid="next-round">下一回合</button>`
            : `<p>等主持人開始下一回合</p>`}
        </div>
      </section>`;
    },

  };

  window.Online = Online;
})();
