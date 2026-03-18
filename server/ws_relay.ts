// WebSocket relay server for DET control messages
// Run with: bun run server/ws_relay.ts

interface Client {
  ws: any; // Bun ServerWebSocket
  role: "sender" | "receiver";
  room: string;
}

const rooms = new Map<string, Map<string, Client>>();

function getRoom(room: string): Map<string, Client> {
  if (!rooms.has(room)) {
    rooms.set(room, new Map());
  }
  return rooms.get(room)!;
}

function notifyPeer(room: Map<string, Client>, senderRole: string, msg: object) {
  const peerRole = senderRole === "sender" ? "receiver" : "sender";
  const peer = room.get(peerRole);
  if (peer) {
    peer.ws.send(JSON.stringify(msg));
  }
}

const server = Bun.serve({
  port: parseInt(process.env.WS_PORT || "8765"),
  fetch(req, server) {
    if (server.upgrade(req)) return undefined;
    return new Response("DET WebSocket Relay Server", { status: 200 });
  },
  websocket: {
    open(ws) {
      (ws as any).data = { role: null, room: null };
    },
    message(ws, message) {
      try {
        const msg = JSON.parse(String(message));

        if (msg.type === "join") {
          const { room: roomCode, role } = msg;
          if (!roomCode || !role) return;

          const data = (ws as any).data;
          data.role = role;
          data.room = roomCode;

          const room = getRoom(roomCode);

          // Kick existing client with same role
          const existing = room.get(role);
          if (existing) {
            existing.ws.close(1000, "Replaced by new connection");
          }

          room.set(role, { ws, role, room: roomCode });
          console.log(`[${roomCode}] ${role} joined`);

          // Notify peer
          notifyPeer(room, role, { type: "peer_joined", role });

          // Notify joiner if peer exists
          const peerRole = role === "sender" ? "receiver" : "sender";
          if (room.has(peerRole)) {
            ws.send(JSON.stringify({ type: "peer_joined", role: peerRole }));
          }
          return;
        }

        // Relay all other messages to peer
        const data = (ws as any).data;
        if (data.room && data.role) {
          const room = getRoom(data.room);
          notifyPeer(room, data.role, msg);
        }
      } catch (e) {
        console.error("Message parse error:", e);
      }
    },
    close(ws) {
      const data = (ws as any).data;
      if (data.room && data.role) {
        const room = getRoom(data.room);
        room.delete(data.role);
        console.log(`[${data.room}] ${data.role} left`);

        // Notify peer
        notifyPeer(room, data.role, { type: "peer_left", role: data.role });

        // Cleanup empty rooms
        if (room.size === 0) {
          rooms.delete(data.room);
        }
      }
    },
  },
});

console.log(`DET WebSocket Relay running on ws://localhost:${server.port}`);
