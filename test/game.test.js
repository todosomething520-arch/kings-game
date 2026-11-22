import test from "node:test";
import assert from "node:assert/strict";
import { createStore, GameError } from "../lib/game.js";

function seat(store, nickname, code) {
  const result = code
    ? store.join({ code, nickname })
    : store.create({ nickname });
  store.bind({
    code: result.session.code,
    playerId: result.session.playerId,
    socketId: result.session.playerId,
  });
  return result.session;
}

test("deals one king and hidden numbers, and hides other cards", () => {
  const store = createStore();
  const host = seat(store, "阿光");
  const rain = seat(store, "小雨", host.code);
  const bean = seat(store, "豆子", host.code);
  const room = store.rooms.get(host.code);

  store.start(host.code, host.playerId);
  assert.equal(room.status, "command");
  assert.equal(room.round, 1);
  assert.equal(room.snapshot.length, 3);
  const kings = room.snapshot.filter((item) => item.card.role === "king");
  assert.equal(kings.length, 1);
  const numbers = room.snapshot
    .filter((item) => item.card.role === "number")
    .map((item) => item.card.value)
    .sort((a, b) => a - b);
  assert.deepEqual(numbers, [1, 2]);

  for (const session of [host, rain, bean]) {
    const view = store.view(room, session.playerId);
    const json = JSON.stringify(view);
    const mine = room.snapshot.find((item) => item.id === session.playerId);
    assert.deepEqual(view.you.card, mine.card);
    assert.equal(view.players.every((player) => !("card" in player)), true);
    if (mine.card.role === "king") {
      assert.equal(json.includes('"role":"number"'), false);
      assert.equal(json.includes('"value"'), false);
    } else {
      assert.equal(json.includes('"role":"king"'), false);
      const values = [...json.matchAll(/"value":(\d+)/g)].map((match) => Number(match[1]));
      assert.deepEqual(values, [mine.card.value]);
    }
    if (session.playerId !== host.playerId) assert.equal("kingOnline" in view, false);
  }

  const king = room.snapshot.find((item) => item.card.role === "king");
  const civilian = room.snapshot.find((item) => item.card.role === "number");
  assert.throws(() => store.submitCommand(host.code, civilian.id, {
    text: "1號 和 2號 擊掌",
    targets: [1, 2],
  }), GameError);
  store.submitCommand(host.code, king.id, {
    text: "1號 和 2號 擊掌三下",
    targets: [1, 2],
    intensity: "chill",
    source: "deck",
  });
  assert.equal(room.status, "announced");
  const hidden = store.view(room, civilian.id);
  assert.equal(hidden.command.text.includes("擊掌"), true);
  assert.equal(JSON.stringify(hidden).includes('"role":"king"'), false);

  const notHost = room.snapshot.find((item) => item.id !== host.playerId);
  assert.throws(() => store.reveal(host.code, notHost.id), /主持人/);
  store.reveal(host.code, host.playerId);
  const revealed = store.view(room, civilian.id);
  const holder1 = revealed.players.find((player) => player.card?.value === 1);
  const holder2 = revealed.players.find((player) => player.card?.value === 2);
  assert.equal(holder1.targeted, true);
  assert.equal(holder2.targeted, true);
  assert.equal(revealed.players.some((player) => player.isKing), true);

  store.nextRound(host.code, host.playerId);
  assert.equal(room.round, 2);
  assert.equal(room.status, "command");
  assert.equal(room.snapshot.length, 3);
});

test("refuses to start below 3 players and rejects bad commands", () => {
  const store = createStore();
  const host = seat(store, "阿光");
  seat(store, "小雨", host.code);
  assert.throws(() => store.start(host.code, host.playerId), /至少要 3|還差/);
  const third = seat(store, "小雨", host.code);
  assert.equal(store.rooms.get(host.code).players.get(third.playerId).nickname, "小雨2");
  store.start(host.code, host.playerId);
  const king = store.rooms.get(host.code).snapshot.find((item) => item.card.role === "king");
  assert.throws(() => store.submitCommand(host.code, king.id, { text: "   ", targets: [] }), GameError);
  assert.throws(() => store.submitCommand(host.code, king.id, {
    text: "9號 跳高",
    targets: [9],
  }), /範圍/);
});

test("leave and kick keep the round fair, and host moves on", () => {
  const store = createStore();
  const host = seat(store, "阿光");
  const rain = seat(store, "小雨", host.code);
  const bean = seat(store, "豆子", host.code);
  const kai = seat(store, "阿凱", host.code);
  store.start(host.code, host.playerId);
  const before = store.rooms.get(host.code).dealId;
  store.leave(host.code, kai.playerId);
  const room = store.rooms.get(host.code);
  assert.equal(room.status, "command");
  assert.equal(room.round, 1);
  assert.notEqual(room.dealId, before);
  assert.equal(room.snapshot.some((item) => item.id === kai.playerId), false);
  assert.equal(room.snapshot.length, 3);

  store.kick(host.code, host.playerId, bean.playerId);
  assert.equal(room.status, "lobby");
  assert.equal(room.round, 0);
  assert.equal(room.players.has(bean.playerId), false);

  store.leave(host.code, host.playerId);
  assert.equal(room.hostId, rain.playerId);
  assert.throws(() => store.reconnect({
    code: host.code,
    playerId: host.playerId,
    token: host.token,
  }), /重新連線/);
});

test("reconnect token and grace period", () => {
  const store = createStore();
  const host = seat(store, "阿光");
  const rain = seat(store, "小雨", host.code);
  seat(store, "豆子", host.code);
  assert.throws(() => store.reconnect({
    code: host.code,
    playerId: rain.playerId,
    token: "nope",
  }), GameError);

  const found = store.reconnect({ code: host.code, playerId: rain.playerId, token: rain.token });
  assert.equal(found.player.nickname, "小雨");

  store.markDisconnected(rain.playerId);
  const room = store.rooms.get(host.code);
  assert.equal(room.players.get(rain.playerId).connected, false);
  const result = store.resolveGrace({ code: host.code, playerId: rain.playerId });
  assert.equal(result.changed, true);
  assert.equal(room.players.has(rain.playerId), false);

  store.markDisconnected(host.playerId);
  const beanId = [...room.players.keys()].find((id) => id !== host.playerId);
  store.markDisconnected(beanId);
  const paused = store.resolveGrace({ code: host.code, playerId: host.playerId });
  assert.equal(paused.changed, false);
  assert.equal(room.players.has(host.playerId), true);
});

test("room codes ignore case and empty rooms expire", () => {
  const store = createStore();
  const host = seat(store, "  阿光  ");
  assert.equal(store.rooms.get(host.code).players.get(host.playerId).nickname, "阿光");
  const joined = store.join({ code: host.code.toLowerCase(), nickname: "小雨" });
  assert.equal(joined.session.code, host.code);
  assert.throws(() => store.join({ code: "NOPE", nickname: "路人" }), /找不到/);

  const room = store.rooms.get(host.code);
  for (const player of room.players.values()) player.connected = false;
  room.updatedAt = Date.now() - 16 * 60 * 1000;
  store.sweep();
  assert.equal(store.rooms.has(host.code), false);
});
