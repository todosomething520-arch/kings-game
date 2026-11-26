import express from "express";
import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Server } from "socket.io";
import QRCode from "qrcode";
import { createStore, GameError, normalizeCode } from "./lib/game.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CODE_PATTERN = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/;

export function createServerApp() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, { maxHttpBufferSize: 100_000 });
  const store = createStore();
  const graceTimers = new Map();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.get("/health", (_req, res) => {
    res.status(200).type("text/plain").send("ok");
  });

  app.get("/rooms/:code/qr.svg", async (req, res) => {
    const code = normalizeCode(req.params.code);
    if (!CODE_PATTERN.test(code)) {
      res.status(404).type("text/plain").send("找不到");
      return;
    }
    const url = `${req.protocol}://${req.get("host")}/?room=${code}`;
    try {
      const svg = await QRCode.toString(url, {
        type: "svg",
        margin: 1,
        width: 168,
        color: { dark: "#241018", light: "#fff7fb" },
      });
      res.set("Cache-Control", "public, max-age=86400");
      res.type("image/svg+xml").send(svg);
    } catch (err) {
      console.error(err);
      res.status(500).type("text/plain").send("QR 沒做成");
    }
  });

  app.get("/js/deck-core.js", (_req, res) => {
    const source = fs.readFileSync(path.join(__dirname, "lib", "deck.js"), "utf8").replace(/^export /gm, "");
    res.set("Cache-Control", "no-cache");
    res.type("application/javascript").send(`(() => {\n${source}\nwindow.DeckCore = {\n  LEVELS, BUILTIN, defaultCustomDeck, normalizeCustomDeck, canonicalDeck,\n  addEntry, updateEntry, deleteEntry, renameLevel, commandsFor, slotsOf,\n  fillTemplate, rollNumbers, labelFor, levelMeta\n};\n})();\n`);
  });

  const publicDir = path.join(__dirname, "public");
  app.use(
    express.static(publicDir, {
      index: "index.html",
      setHeaders(res, filePath) {
        if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
      },
    }),
  );

  function broadcast(room) {
    if (!room) return;
    for (const player of room.players.values()) {
      if (!player.socketId) continue;
      io.to(player.socketId).emit("state", store.view(room, player.id));
    }
  }

  function clearGrace(code, playerId) {
    const key = `${code}:${playerId}`;
    clearTimeout(graceTimers.get(key));
    graceTimers.delete(key);
  }

  function scheduleGrace(grace) {
    if (!grace) return;
    const key = `${grace.code}:${grace.playerId}`;
    clearTimeout(graceTimers.get(key));
    const timer = setTimeout(() => {
      graceTimers.delete(key);
      const result = store.resolveGrace(grace);
      if (result.changed) broadcast(result.room);
    }, store.GRACE_MS);
    timer.unref?.();
    graceTimers.set(key, timer);
  }

  function replaceSocket(previousSocketId) {
    if (!previousSocketId) return;
    const other = io.sockets.sockets.get(previousSocketId);
    if (!other) return;
    other.data.replaced = true;
    other.disconnect(true);
  }

  function publicSession(session) {
    return {
      code: session.code,
      playerId: session.playerId,
      token: session.token,
      nickname: session.nickname,
    };
  }

  io.on("connection", (socket) => {
    const fail = (ack, error) => {
      if (typeof ack === "function") ack({ ok: false, error });
    };
    const succeed = (ack, extra = {}) => {
      if (typeof ack === "function") ack({ ok: true, ...extra });
    };
    const guard = (ack, fn) => {
      try {
        return fn();
      } catch (err) {
        if (!(err instanceof GameError)) console.error(err);
        fail(ack, err instanceof GameError ? err.message : "發生了一點問題，再試一次");
        return null;
      }
    };

    function actor() {
      const binding = store.bindingFor(socket.id);
      if (!binding) throw new GameError("你不在房間裡");
      return binding;
    }

    function accept(session) {
      const bound = store.bind({
        code: session.code,
        playerId: session.playerId,
        socketId: socket.id,
      });
      clearGrace(session.code, session.playerId);
      replaceSocket(bound.previousSocketId);
      socket.emit("session", publicSession(session));
      broadcast(bound.room);
      return bound.room;
    }

    socket.on("room:create", (payload = {}, ack) => {
      const created = guard(ack, () => store.create({ nickname: payload.nickname }));
      if (!created) return;
      const room = guard(ack, () => accept(created.session));
      if (!room) return;
      succeed(ack, { session: publicSession(created.session) });
    });

    socket.on("room:join", (payload = {}, ack) => {
      const joined = guard(ack, () => store.join({ code: payload.code, nickname: payload.nickname }));
      if (!joined) return;
      const room = guard(ack, () => accept(joined.session));
      if (!room) return;
      succeed(ack, { session: publicSession(joined.session) });
    });

    socket.on("room:reconnect", (payload = {}, ack) => {
      const found = guard(ack, () => store.reconnect(payload));
      if (!found) return;
      const room = guard(ack, () => accept({
        code: found.room.code,
        playerId: found.player.id,
        token: found.player.token,
        nickname: found.player.nickname,
      }));
      if (!room) return;
      succeed(ack, {
        session: publicSession({
          code: found.room.code,
          playerId: found.player.id,
          token: found.player.token,
          nickname: found.player.nickname,
        }),
      });
    });

    socket.on("room:leave", (_payload = {}, ack) => {
      const binding = store.bindingFor(socket.id);
      if (!binding) {
        succeed(ack);
        return;
      }
      clearGrace(binding.code, binding.playerId);
      const result = guard(ack, () => store.leave(binding.code, binding.playerId));
      if (!result) return;
      if (result.room) broadcast(result.room);
      succeed(ack, { closed: result.closed });
    });

    socket.on("room:kick", (payload = {}, ack) => {
      const result = guard(ack, () => {
        const { code, playerId } = actor();
        return store.kick(code, playerId, payload.playerId);
      });
      if (!result) return;
      if (result.kickedSocketId) {
        const target = io.sockets.sockets.get(result.kickedSocketId);
        if (target) {
          target.emit("room:kicked", { message: "你被主持人移出房間了" });
          target.data.replaced = true;
          target.disconnect(true);
        }
      }
      if (result.room) broadcast(result.room);
      succeed(ack);
    });

    function hostAction(method, payload, ack) {
      const room = guard(ack, () => {
        const { code, playerId } = actor();
        return store[method](code, playerId, payload);
      });
      if (!room) return;
      broadcast(room);
      succeed(ack);
    }

    socket.on("game:start", (_payload = {}, ack) => hostAction("start", undefined, ack));
    socket.on("game:command", (payload = {}, ack) => hostAction("submitCommand", payload, ack));
    socket.on("game:reveal", (_payload = {}, ack) => hostAction("reveal", undefined, ack));
    socket.on("game:next", (_payload = {}, ack) => hostAction("nextRound", undefined, ack));
    socket.on("game:redeal", (_payload = {}, ack) => hostAction("redeal", undefined, ack));
    socket.on("deck:update", (payload = {}, ack) => hostAction("setCustomDeck", payload, ack));

    socket.on("disconnect", () => {
      if (socket.data.replaced) return;
      const result = store.markDisconnected(socket.id);
      if (!result) return;
      broadcast(result.room);
      scheduleGrace(result.grace);
    });
  });

  const sweep = setInterval(() => store.sweep(), 60_000);
  sweep.unref?.();

  async function close() {
    clearInterval(sweep);
    for (const timer of graceTimers.values()) clearTimeout(timer);
    graceTimers.clear();
    await new Promise((resolve) => io.close(resolve));
    if (httpServer.listening) {
      await new Promise((resolve) => httpServer.close(resolve));
    }
  }

  return { app, httpServer, io, store, close };
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === entry) {
  const { httpServer } = createServerApp();
  const port = Number(process.env.PORT) || 4721;
  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`國王遊戲 http://0.0.0.0:${port}`);
  });
  const shutdown = () => {
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
