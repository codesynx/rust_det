import { useState, useEffect, useRef, useCallback } from "react";
import type { WSMessage } from "../types";

interface UseWebSocketOptions {
  url: string;
  room: string;
  role: "sender" | "receiver";
  onMessage?: (msg: WSMessage) => void;
  onPeerJoined?: () => void;
  onPeerLeft?: () => void;
}

export function useWebSocket({ url, room, role, onMessage, onPeerJoined, onPeerLeft }: UseWebSocketOptions) {
  const [connected, setConnected] = useState(false);
  const [peerOnline, setPeerOnline] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "join", room, role }));
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        if (msg.type === "peer_joined") {
          setPeerOnline(true);
          onPeerJoined?.();
        } else if (msg.type === "peer_left") {
          setPeerOnline(false);
          onPeerLeft?.();
        } else {
          onMessage?.(msg);
        }
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setPeerOnline(false);
      wsRef.current = null;
      reconnectTimer.current = window.setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, [url, room, role, onMessage, onPeerJoined, onPeerLeft]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((msg: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { connected, peerOnline, send };
}
