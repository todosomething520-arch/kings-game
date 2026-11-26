import crypto from "node:crypto";
import { defaultCustomDeck, normalizeCustomDeck } from "./deck.js";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;
const EMPTY_ROOM_MS = 15 * 60 * 1000;
export const GRACE_MS = 45 * 1000;

export class GameError extends Error {
  constructor(message) {
    super(message);
    this.name = "GameError";
  }
}

export function cleanNickname(input) {
  const stripped = String(input ?? "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const chars = [...stripped];
  if (chars.length === 0) throw new GameError("先取一個暱稱");
  if (chars.length > 12) throw new GameError("暱稱最多 12 個字");
  return chars.join("");
}

export function normalizeCode(input) {
  return String(input ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function cleanCommand(payload, numberMax) {
  const text = String(payload?.text ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const length = [...text].length;
  if (!text) throw new GameError("命令還是空的");
  if (length > 80) throw new GameError("命令太長了，80 字以內就好");
  if (/[<>]/.test(text)) throw new GameError("命令裡不要放奇怪的符號");

  const rawTargets = Array.isArray(payload?.targets) ? payload.targets : [];
  const targets = rawTargets.map((value) => Number(value));
  if (targets.length > 4) throw new GameError("一次最多點 4 個號碼");
  if (targets.some((n) => !Number.isInteger(n) || n < 1 || n > numberMax)) {
    throw new GameError("號碼超出這一輪的範圍");
  }
  if (new Set(targets).size !== targets.length) throw new GameError("號碼不要重複");

  const intensity = /^(lv[1-7]|chill|normal|bold)$/.test(payload?.intensity)
    ? payload.intensity
    : "lv1";
  const source = payload?.source === "custom" ? "custom" : "deck";
  return { text, targets, intensity, source };
}

function shuffle(list) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function tokensMatch(a, b) {
  const left = Buffer.from(String(a ?? ""));
  const right = Buffer.from(String(b ?? ""));
  if (left.length === 0 || left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function byJoin(a, b) {
  return a.joinedAt - b.joinedAt;
}

export function createStore() {
  const rooms = new Map();
  const socketIndex = new Map();

  function touch(room) {
    room.updatedAt = Date.now();
  }

  function setNotice(room, text) {
    room.noticeSeq += 1;
    room.notice = { id: room.noticeSeq, text };
  }

  function connectedPlayers(room) {
    return [...room.players.values()].filter((player) => player.connected).sort(byJoin);
  }

  function connectedCount(room) {
    return connectedPlayers(room).length;
  }

  function kingEntry(room) {
    return room.snapshot?.find((seat) => seat.card.role === "king") ?? null;
  }

  function kingIsOnline(room) {
    const king = kingEntry(room);
    if (!king) return false;
    const player = room.players.get(king.id);
    return Boolean(player?.connected);
  }

  function makeCode() {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      let code = "";
      for (let i = 0; i < 4; i += 1) code += ALPHABET[crypto.randomInt(ALPHABET.length)];
      if (!rooms.has(code)) return code;
    }
    throw new GameError("現在房間有點多，稍後再試");
  }

  function uniqueNick(room, base) {
    const taken = new Set([...room.players.values()].map((player) => player.nickname));
    if (!taken.has(base)) return base;
    const stem = [...base].slice(0, 10).join("");
    for (let i = 2; i < 100; i += 1) {
      const candidate = `${stem}${i}`;
      if (!taken.has(candidate)) return candidate;
    }
    throw new GameError("這個暱稱太擠了，換一個吧");
  }

  function makePlayer(nickname) {
    return {
      id: crypto.randomBytes(8).toString("hex"),
      nickname,
      token: crypto.randomBytes(18).toString("base64url"),
      socketId: null,
      connected: false,
      joinedAt: Date.now(),
      disconnectedAt: null,
    };
  }

  function sessionOf(room, player) {
    return {
      code: room.code,
      playerId: player.id,
      token: player.token,
      nickname: player.nickname,
    };
  }

  function getRoom(code) {
    const room = rooms.get(normalizeCode(code));
    if (!room) throw new GameError("找不到這間房間，再對一下代碼");
    return room;
  }

  function assertHost(room, actorId) {
    if (room.hostId !== actorId) throw new GameError("只有主持人可以做這個");
  }

  function pickHost(room) {
    const list = [...room.players.values()].sort(byJoin);
    const next = list.find((player) => player.connected) || list[0];
    if (!next) return null;
    room.hostId = next.id;
    return next;
  }

  function returnToLobby(room, text, { undoRound = false } = {}) {
    if (undoRound && room.status === "command" && room.round > 0) room.round -= 1;
    room.status = "lobby";
    room.snapshot = null;
    room.command = null;
    setNotice(room, text);
  }

  function deal(room, { advance = true } = {}) {
    const members = connectedPlayers(room);
    if (members.length < MIN_PLAYERS) throw new GameError("至少要 3 個人在線上才能發牌");
    if (members.length > MAX_PLAYERS) throw new GameError("人數太多了");
    const cards = shuffle([
      { role: "king" },
      ...Array.from({ length: members.length - 1 }, (_, index) => ({
        role: "number",
        value: index + 1,
      })),
    ]);
    room.snapshot = members.map((player, index) => ({
      id: player.id,
      nickname: player.nickname,
      card: cards[index],
    }));
    room.status = "command";
    room.command = null;
    room.dealId += 1;
    if (advance) room.round += 1;
    touch(room);
  }

  function afterRemove(room, playerId, nickname, reason) {
    if (room.players.size === 0) {
      rooms.delete(room.code);
      return true;
    }

    const inSnapshot = room.snapshot?.some((seat) => seat.id === playerId) ?? false;
    const verb = reason === "kick" ? `${nickname} 被移出房間` : `${nickname} 離開了`;
    let hostNote = "";
    if (!room.players.has(room.hostId)) {
      const next = pickHost(room);
      if (next) hostNote = `主持人換成 ${next.nickname}`;
    }

    if (room.status === "command" && inSnapshot) {
      if (connectedCount(room) >= MIN_PLAYERS) {
        deal(room, { advance: false });
        setNotice(room, [hostNote, `${verb}，這一輪重新發牌`].filter(Boolean).join("。"));
      } else {
        returnToLobby(room, [hostNote, "人數不足 3 人，回到等待室"].filter(Boolean).join("。"), {
          undoRound: true,
        });
      }
    } else if (hostNote) {
      setNotice(room, `${verb}。${hostNote}`);
    } else {
      setNotice(room, verb);
    }
    touch(room);
    return false;
  }

  function detach(player) {
    if (player?.socketId) socketIndex.delete(player.socketId);
  }

  return {
    rooms,
    GRACE_MS,

    create({ nickname }) {
      const name = cleanNickname(nickname);
      const room = {
        code: makeCode(),
        hostId: null,
        status: "lobby",
        round: 0,
        dealId: 0,
        players: new Map(),
        snapshot: null,
        command: null,
        notice: null,
        noticeSeq: 0,
        customDeck: defaultCustomDeck(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const player = makePlayer(name);
      room.hostId = player.id;
      room.players.set(player.id, player);
      rooms.set(room.code, room);
      return { session: sessionOf(room, player), room };
    },

    join({ code, nickname }) {
      const room = getRoom(code);
      if (room.players.size >= MAX_PLAYERS) throw new GameError("這個房間滿了（最多 12 人）");
      const cleaned = cleanNickname(nickname);
      const name = uniqueNick(room, cleaned);
      const player = makePlayer(name);
      room.players.set(player.id, player);
      touch(room);
      if (room.status === "lobby") setNotice(room, `${name} 加入了房間`);
      else setNotice(room, `${name} 進來了，下一回合才會抽牌`);
      return { session: sessionOf(room, player), room };
    },

    reconnect({ code, playerId, token }) {
      const room = getRoom(code);
      const player = room.players.get(playerId);
      if (!player || !tokensMatch(player.token, token)) {
        throw new GameError("重新連線失敗，請再加入一次");
      }
      return { room, player };
    },

    bind({ code, playerId, socketId }) {
      const room = getRoom(code);
      const player = room.players.get(playerId);
      if (!player) throw new GameError("重新連線失敗，請再加入一次");
      const previousSocketId = player.socketId && player.socketId !== socketId ? player.socketId : null;
      if (player.socketId) socketIndex.delete(player.socketId);
      player.socketId = socketId;
      player.connected = true;
      player.disconnectedAt = null;
      socketIndex.set(socketId, { code: room.code, playerId });
      touch(room);
      return { room, previousSocketId };
    },

    bindingFor(socketId) {
      return socketIndex.get(socketId) ?? null;
    },

    markDisconnected(socketId) {
      const binding = socketIndex.get(socketId);
      if (!binding) return null;
      socketIndex.delete(socketId);
      const room = rooms.get(binding.code);
      const player = room?.players.get(binding.playerId);
      if (!player || player.socketId !== socketId) return null;
      player.connected = false;
      player.socketId = null;
      player.disconnectedAt = Date.now();
      touch(room);
      return {
        room,
        grace: { code: room.code, playerId: player.id },
      };
    },

    resolveGrace({ code, playerId }) {
      const room = rooms.get(normalizeCode(code));
      if (!room) return { changed: false, room: null };
      const player = room.players.get(playerId);
      if (!player || player.connected) return { changed: false, room };
      const someoneElse = [...room.players.values()].some((candidate) => candidate.connected);
      if (!someoneElse) return { changed: false, room };

      if (room.status === "lobby") {
        const nickname = player.nickname;
        detach(player);
        room.players.delete(playerId);
        if (room.players.size === 0) {
          rooms.delete(room.code);
          return { changed: true, room: null };
        }
        let note = `${nickname} 離線太久，已先離開`;
        if (!room.players.has(room.hostId)) {
          const next = pickHost(room);
          if (next) note += `。主持人換成 ${next.nickname}`;
        }
        setNotice(room, note);
        touch(room);
        return { changed: true, room };
      }

      if (room.hostId === playerId) {
        const next = [...room.players.values()].sort(byJoin).find((candidate) => candidate.connected);
        if (next && next.id !== room.hostId) {
          room.hostId = next.id;
          setNotice(room, `主持人暫時換成 ${next.nickname}`);
          touch(room);
          return { changed: true, room };
        }
      }
      return { changed: false, room };
    },

    leave(code, playerId) {
      const room = rooms.get(normalizeCode(code));
      if (!room) return { room: null, closed: true };
      const player = room.players.get(playerId);
      if (!player) return { room, closed: false };
      detach(player);
      room.players.delete(playerId);
      const closed = afterRemove(room, playerId, player.nickname, "leave");
      return { room: closed ? null : rooms.get(room.code) ?? null, closed };
    },

    kick(code, actorId, targetId) {
      const room = getRoom(code);
      assertHost(room, actorId);
      if (actorId === targetId) throw new GameError("不能把自己移出房間");
      const target = room.players.get(targetId);
      if (!target) throw new GameError("找不到這位玩家");
      const kickedSocketId = target.socketId;
      detach(target);
      room.players.delete(targetId);
      const closed = afterRemove(room, targetId, target.nickname, "kick");
      return {
        room: closed ? null : rooms.get(room.code) ?? null,
        closed,
        kickedSocketId,
      };
    },

    start(code, actorId) {
      const room = getRoom(code);
      assertHost(room, actorId);
      if (room.status !== "lobby") throw new GameError("這一輪已經開始了");
      const online = connectedCount(room);
      if (online < MIN_PLAYERS) {
        throw new GameError(`還差 ${MIN_PLAYERS - online} 人在線上才能開始`);
      }
      deal(room);
      return room;
    },

    submitCommand(code, actorId, payload) {
      const room = getRoom(code);
      if (room.status !== "command" || !room.snapshot) throw new GameError("現在不能下命令");
      const king = kingEntry(room);
      if (!king || king.id !== actorId) throw new GameError("只有國王能下命令");
      const actor = room.players.get(actorId);
      if (!actor?.connected) throw new GameError("你現在是離線狀態");
      room.command = cleanCommand(payload, room.snapshot.length - 1);
      room.status = "announced";
      touch(room);
      return room;
    },

    reveal(code, actorId) {
      const room = getRoom(code);
      assertHost(room, actorId);
      if (room.status !== "announced" || !room.command) throw new GameError("國王還沒下命令");
      room.status = "reveal";
      touch(room);
      return room;
    },

    setCustomDeck(code, actorId, payload) {
      const room = getRoom(code);
      assertHost(room, actorId);
      room.customDeck = normalizeCustomDeck(payload);
      touch(room);
      return room;
    },

    nextRound(code, actorId) {
      const room = getRoom(code);
      assertHost(room, actorId);
      if (room.status !== "reveal") throw new GameError("先揭曉這一輪再繼續");
      if (connectedCount(room) < MIN_PLAYERS) {
        returnToLobby(room, "人數不足 3 人，回到等待室");
        return room;
      }
      deal(room);
      return room;
    },

    redeal(code, actorId) {
      const room = getRoom(code);
      assertHost(room, actorId);
      if (room.status !== "command") throw new GameError("這一輪不能重發");
      if (kingIsOnline(room)) throw new GameError("國王還在線上，等一下命令就好");
      if (connectedCount(room) < MIN_PLAYERS) {
        returnToLobby(room, "人數不足 3 人，回到等待室", { undoRound: true });
        return room;
      }
      deal(room, { advance: false });
      setNotice(room, "國王離線，已重新發牌");
      return room;
    },

    view(room, viewerId) {
      const viewer = room.players.get(viewerId) ?? null;
      const revealed = room.status === "reveal";
      const targets = new Set(room.command?.targets ?? []);
      const mine = room.snapshot?.find((seat) => seat.id === viewerId) ?? null;

      const players = revealed && room.snapshot
        ? room.snapshot.map((seat) => {
            const live = room.players.get(seat.id);
            return {
              id: seat.id,
              nickname: live?.nickname || seat.nickname,
              isHost: room.hostId === seat.id,
              connected: Boolean(live?.connected),
              left: !live,
              isYou: seat.id === viewerId,
              card: seat.card,
              targeted: seat.card.role === "number" && targets.has(seat.card.value),
              isKing: seat.card.role === "king",
            };
          })
        : [...room.players.values()].sort(byJoin).map((player) => ({
            id: player.id,
            nickname: player.nickname,
            isHost: room.hostId === player.id,
            connected: player.connected,
            left: false,
            isYou: player.id === viewerId,
          }));

      const state = {
        code: room.code,
        status: room.status,
        round: room.round,
        dealId: room.dealId,
        minPlayers: MIN_PLAYERS,
        maxPlayers: MAX_PLAYERS,
        playerCount: room.players.size,
        connectedCount: connectedCount(room),
        you: viewer
          ? {
              id: viewer.id,
              nickname: viewer.nickname,
              isHost: room.hostId === viewer.id,
              inRound: Boolean(mine),
              card: mine ? mine.card : null,
            }
          : null,
        players,
        command: room.status === "announced" || room.status === "reveal" ? room.command : null,
        notice: room.notice,
        customDeck: room.customDeck || defaultCustomDeck(),
        numberMax: room.snapshot ? room.snapshot.length - 1 : Math.max(0, connectedCount(room) - 1),
      };

      if (viewer && room.hostId === viewer.id && room.status === "command") {
        state.kingOnline = kingIsOnline(room);
      }
      return state;
    },

    sweep(now = Date.now()) {
      for (const room of [...rooms.values()]) {
        const anyone = [...room.players.values()].some((player) => player.connected);
        if (!anyone && now - room.updatedAt > EMPTY_ROOM_MS) rooms.delete(room.code);
      }
    },
  };
}
