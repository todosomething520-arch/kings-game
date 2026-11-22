import test from "node:test";
import assert from "node:assert/strict";
import { createServerApp } from "../server.js";
import { io as ioClient } from "socket.io-client";

function connect(url) {
  return new Promise((resolve, reject) => {
    const socket = ioClient(url, { transports: ["websocket"], forceNew: true });
    const bag = { socket, state: null, session: null, kicked: null };
    socket.on("state", (state) => {
      bag.state = state;
    });
    socket.on("session", (session) => {
      bag.session = session;
    });
    socket.on("room:kicked", (payload) => {
      bag.kicked = payload;
    });
    socket.on("connect", () => resolve(bag));
    socket.on("connect_error", reject);
  });
}

function emit(bag, event, payload = {}) {
  return new Promise((resolve) => {
    bag.socket.emit(event, payload, (res) => resolve(res));
  });
}

function waitFor(bag, predicate, timeout = 3000) {
  if (bag.state && predicate(bag.state)) return Promise.resolve(bag.state);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      bag.socket.off("state", onState);
      reject(new Error(`狀態等太久：${JSON.stringify(bag.state)}`));
    }, timeout);
    const onState = (state) => {
      if (!predicate(state)) return;
      clearTimeout(timer);
      bag.socket.off("state", onState);
      resolve(state);
    };
    bag.socket.on("state", onState);
  });
}

function hiddenCards(state) {
  const json = JSON.stringify(state);
  if (state.you?.card?.role === "king") {
    assert.equal(json.includes('"role":"number"'), false);
  } else if (state.you?.card?.role === "number") {
    assert.equal(json.includes('"role":"king"'), false);
    const values = [...json.matchAll(/"value":(\d+)/g)].map((match) => Number(match[1]));
    assert.deepEqual(values, [state.you.card.value]);
  }
  assert.equal(state.players.every((player) => !("card" in player)), true);
}

test("three clients play a full round and can reconnect", async () => {
  const runtime = createServerApp();
  const bags = [];
  try {
    await new Promise((resolve) => runtime.httpServer.listen(0, "127.0.0.1", resolve));
    const { port } = runtime.httpServer.address();
    const health = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(health.status, 200);
    assert.equal(await health.text(), "ok");
    const page = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /國王遊戲/);

    const url = `http://127.0.0.1:${port}`;
    const host = await connect(url);
    const rain = await connect(url);
    const bean = await connect(url);
    bags.push(host, rain, bean);

    const created = await emit(host, "room:create", { nickname: "阿光" });
    assert.equal(created.ok, true);
    const qr = await fetch(`http://127.0.0.1:${port}/rooms/${created.session.code}/qr.svg`);
    assert.equal(qr.status, 200);
    assert.match(qr.headers.get("content-type") || "", /svg/);
    assert.match(await qr.text(), /<svg/);
    await waitFor(host, (state) => state.status === "lobby" && state.you.nickname === "阿光");

    for (const [bag, nickname] of [[rain, "小雨"], [bean, "豆子"]]) {
      const joined = await emit(bag, "room:join", { code: created.session.code.toLowerCase(), nickname });
      assert.equal(joined.ok, true);
    }
    await waitFor(host, (state) => state.connectedCount === 3);

    const tooSoon = await emit(bean, "game:start", {});
    assert.equal(tooSoon.ok, false);

    const started = await emit(host, "game:start", {});
    assert.equal(started.ok, true);
    await Promise.all(bags.map((bag) => waitFor(bag, (state) => state.status === "command" && state.you.card)));
    bags.forEach((bag) => hiddenCards(bag.state));

    const king = bags.find((bag) => bag.state.you.card.role === "king");
    const civilian = bags.find((bag) => bag.state.you.card.role === "number");
    assert.ok(king);
    assert.ok(civilian);

    const rejected = await emit(civilian, "game:command", {
      text: "1號 和 2號 擊掌",
      targets: [1, 2],
      intensity: "chill",
      source: "deck",
    });
    assert.equal(rejected.ok, false);

    const told = await emit(king, "game:command", {
      text: "1號 和 2號 擊掌三下",
      targets: [1, 2],
      intensity: "chill",
      source: "deck",
    });
    assert.equal(told.ok, true);
    await Promise.all(bags.map((bag) => waitFor(bag, (state) => state.status === "announced")));
    bags.forEach((bag) => hiddenCards(bag.state));
    assert.match(civilian.state.command.text, /擊掌/);

    const revealed = await emit(host, "game:reveal", {});
    assert.equal(revealed.ok, true);
    await Promise.all(bags.map((bag) => waitFor(bag, (state) => state.status === "reveal")));
    const holders = host.state.players.filter((player) => player.targeted).map((player) => player.nickname);
    assert.equal(holders.length, 2);
    assert.equal(host.state.players.some((player) => player.isKing), true);

    const kingSession = { ...king.session };
    const previousCard = king.state.you.card;
    const kingWasHost = king.state.you.isHost;
    king.socket.disconnect();
    const returned = await connect(url);
    bags.push(returned);
    const again = await emit(returned, "room:reconnect", kingSession);
    assert.equal(again.ok, true);
    await waitFor(returned, (state) => state.status === "reveal" && state.you?.card);
    assert.deepEqual(returned.state.you.card, previousCard);

    const starter = kingWasHost ? returned : host;
    const next = await emit(starter, "game:next", {});
    assert.equal(next.ok, true);
    await waitFor(starter, (state) => state.round === 2 && state.status === "command");
    hiddenCards(starter.state);
  } finally {
    bags.forEach((bag) => bag.socket.disconnect());
    await runtime.close();
  }
});
