import { useState, useCallback, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useWebSocket } from "./hooks/useWebSocket";
import TextOverlay from "./components/TextOverlay";
import StatusIndicator from "./components/StatusIndicator";
import { DEFAULT_SETTINGS } from "./types";
import type { TextSettings, WSMessage, ControlMessage } from "./types";

const WS_URL = "ws://localhost:8765";
const ROOM = "MYROOM";
const SRT_URL = "srt://localhost:8890?streamid=publish:myroom&pkt_size=1316";

function App() {
  const [text, setText] = useState("");
  const [settings, setSettings] = useState<TextSettings>(DEFAULT_SETTINGS);
  const captureStarted = useRef(false);

  const handleMessage = useCallback((msg: WSMessage) => {
    const ctrl = msg as ControlMessage;
    switch (ctrl.type) {
      case "text":
        setText(ctrl.content);
        break;
      case "settings":
        setSettings(ctrl.settings);
        break;
      case "clear":
        setText("");
        break;
    }
  }, []);

  const startCapture = useCallback(async () => {
    if (captureStarted.current) return;
    try {
      await invoke("start_capture", { srtUrl: SRT_URL });
      captureStarted.current = true;
      console.log("Screen capture started");
    } catch (err) {
      console.error("Failed to start capture:", err);
    }
  }, []);

  const stopCapture = useCallback(async () => {
    if (!captureStarted.current) return;
    try {
      await invoke("stop_capture");
      captureStarted.current = false;
      console.log("Screen capture stopped");
    } catch (err) {
      console.error("Failed to stop capture:", err);
    }
  }, []);

  const { connected } = useWebSocket({
    url: WS_URL,
    room: ROOM,
    role: "receiver",
    onMessage: handleMessage,
  });

  // Start/stop FFmpeg capture based on connection status
  useEffect(() => {
    if (connected) {
      startCapture();
    } else {
      stopCapture();
    }
  }, [connected, startCapture, stopCapture]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return (
    <>
      <TextOverlay text={text} settings={settings} />
      <StatusIndicator connected={connected} />
    </>
  );
}

export default App;
