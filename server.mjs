import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const httpServer = createServer((req, res) => {
  const parsedUrl = parse(req.url ?? "", true);
  void handle(req, res, parsedUrl);
});

const io = new Server(httpServer, {
  path: "/api/support/socket",
  cors: {
    origin: true,
    credentials: true,
  },
});

globalThis.__ROOTORA_SUPPORT_IO__ = io;

io.on("connection", (socket) => {
  socket.on("support:join", (payload) => {
    if (!payload || typeof payload !== "object") return;
    if (payload.visitorId) socket.join(`visitor:${payload.visitorId}`);
    if (payload.conversationId) {
      socket.join(`conversation:${payload.conversationId}`);
    }
    if (payload.role === "admin") socket.join("admin:support");
  });
});

httpServer.listen(port, () => {
  console.log(`> ROOTORA ready on http://${hostname}:${port}`);
  console.log("> Support WebSocket: /api/support/socket");
});
