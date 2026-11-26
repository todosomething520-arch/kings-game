import test from "node:test";
import assert from "node:assert/strict";
import {
  BUILTIN,
  LEVELS,
  addEntry,
  canonicalDeck,
  commandsFor,
  defaultCustomDeck,
  deleteEntry,
  labelFor,
  levelMeta,
  normalizeCustomDeck,
  renameLevel,
  slotsOf,
  updateEntry,
} from "../lib/deck.js";
import { createStore, GameError } from "../lib/game.js";

test("builtin levels run from mild to extreme and each has a full pool", () => {
  assert.deepEqual(LEVELS.map((level) => level.name), [
    "微醺破冰",
    "曖昧",
    "親密",
    "火辣",
    "極限",
    "自訂一",
    "自訂二",
  ]);
  for (const levelId of ["lv1", "lv2", "lv3", "lv4", "lv5"]) {
    const pool = commandsFor(levelId);
    assert.ok(pool.length >= 20, `${levelId} only has ${pool.length}`);
    for (const command of pool) {
      assert.ok(command.template.length > 0);
      assert.ok([...command.template].length <= 80);
      assert.equal(command.slots, slotsOf(command.template));
      assert.equal(/[<>]/.test(command.template), false);
    }
  }
  assert.equal(BUILTIN.length, 110);
  const joined = (id) => commandsFor(id).map((command) => command.template).join("\n");
  assert.match(joined("lv3"), /脖子/);
  assert.match(joined("lv3"), /慢舞/);
  assert.match(joined("lv4"), /接吻/);
  assert.match(joined("lv4"), /冰塊/);
  assert.match(joined("lv4"), /蒙上眼|蒙眼/);
  assert.match(joined("lv5"), /內衣褲/);
  assert.match(joined("lv5"), /小腹/);
  assert.match(joined("lv5"), /一分鐘/);
});

test("custom levels can be renamed, edited, and still target numbers", () => {
  let deck = defaultCustomDeck();
  assert.equal(deck.levels[0].entries.length, 3);
  deck = renameLevel(deck, "lv6", "今晚加辣");
  deck = addEntry(deck, "lv6", "{a}號 對 {b}號 說一句只准今晚說的話");
  const added = deck.levels[0].entries.at(-1);
  deck = updateEntry(deck, "lv6", added.id, "  {a}號 餵 {b}號 喝一小口  ");
  deck = deleteEntry(deck, "lv6", "s6a");
  assert.equal(labelFor("lv6", deck), "今晚加辣");
  assert.equal(deck.levels[0].entries.some((entry) => entry.id === "s6a"), false);
  const commands = commandsFor("lv6", deck);
  assert.equal(commands.at(-1).template, "{a}號 餵 {b}號 喝一小口");
  assert.equal(commands.at(-1).slots, 2);
  assert.equal(levelMeta(deck).find((level) => level.id === "lv6").name, "今晚加辣");
  assert.throws(() => addEntry(deck, "lv6", "   "), /先寫一條懲罰/);
  const cleaned = normalizeCustomDeck({
    levels: [{ id: "lv6", name: "<壞>", entries: [{ template: "<script>壞</script>" }, { template: "{a}號 乾杯" }] }],
  });
  assert.equal(cleaned.levels[0].name, "壞");
  assert.equal(normalizeCustomDeck({ levels: [{ id: "lv6", name: "<>", entries: [] }] }).levels[0].name, "自訂一");
  assert.deepEqual(cleaned.levels[0].entries.map((entry) => entry.template), ["{a}號 乾杯"]);
  assert.equal(canonicalDeck(cleaned), canonicalDeck(cleaned));
});

test("only the host can replace the room's custom deck", () => {
  const store = createStore();
  const host = store.create({ nickname: "阿光" });
  const guest = store.join({ code: host.session.code, nickname: "小雨" });
  store.bind({ code: host.session.code, playerId: host.session.playerId, socketId: "h" });
  store.bind({ code: guest.session.code, playerId: guest.session.playerId, socketId: "g" });
  const room = store.rooms.get(host.session.code);
  assert.equal(store.view(room, guest.session.playerId).customDeck.levels[0].name, "自訂一");
  assert.throws(() => store.setCustomDeck(host.session.code, guest.session.playerId, defaultCustomDeck()), GameError);
  store.setCustomDeck(host.session.code, host.session.playerId, renameLevel(defaultCustomDeck(), "lv7", "桌規"));
  const view = store.view(room, guest.session.playerId);
  assert.equal(view.customDeck.levels[1].name, "桌規");
  assert.equal(view.players.every((player) => !("card" in player)), true);
});
