import { useState, useCallback, useRef } from "react";
import { ConnectionBar } from "./components/ConnectionBar";
import { TextEditor } from "./components/TextEditor";
import { StyleControls } from "./components/StyleControls";
import { StreamPanel } from "./components/StreamPanel";
import { useWebSocket } from "./hooks/useWebSocket";
import { DEFAULT_SETTINGS } from "./types";
import type { TextSettings, WSMessage } from "./types";

function App() {
  const [serverUrl, setServerUrl] = useState("ws://localhost:8765");
  const [roomCode, setRoomCode] = useState("MYROOM");
  const [settings, setSettings] = useState<TextSettings>(DEFAULT_SETTINGS);
  const [shouldConnect, setShouldConnect] = useState(false);
  const currentTextRef = useRef("");

  const onMessage = useCallback((msg: WSMessage) => {
    // Sender doesn't typically receive control messages, but log them
    console.log("Received message:", msg);
  }, []);

  const { connected, peerOnline, send } = useWebSocket(
    shouldConnect
      ? { url: serverUrl, room: roomCode, role: "sender", onMessage }
      : { url: "", room: "", role: "sender", onMessage }
  );

  // Workaround: only actually connect when shouldConnect is true
  // The hook auto-connects, so we gate it via the url being empty
  const isConnected = shouldConnect && connected;
  const isPeerOnline = shouldConnect && peerOnline;

  const handleConnect = () => {
    setShouldConnect(true);
  };

  const handleDisconnect = () => {
    setShouldConnect(false);
  };

  const handleTextChange = useCallback(
    (text: string) => {
      currentTextRef.current = text;
      send({ type: "text", content: text });
    },
    [send]
  );

  const handleClear = useCallback(() => {
    currentTextRef.current = "";
    send({ type: "clear" });
  }, [send]);

  const handleSettingsChange = useCallback(
    (newSettings: TextSettings) => {
      setSettings(newSettings);
      send({ type: "settings", settings: newSettings });
    },
    [send]
  );

  return (
    <div className="app">
      <ConnectionBar
        serverUrl={serverUrl}
        roomCode={roomCode}
        connected={isConnected}
        peerOnline={isPeerOnline}
        onServerUrlChange={setServerUrl}
        onRoomCodeChange={setRoomCode}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <div className="main-content">
        <div className="left-column">
          <TextEditor
            onTextChange={handleTextChange}
            onClear={handleClear}
            disabled={!isConnected}
          />
          <StyleControls
            settings={settings}
            onChange={handleSettingsChange}
            sampleText={currentTextRef.current}
            disabled={!isConnected}
          />
        </div>

        <div className="right-column">
          <StreamPanel disabled={!isConnected} />
        </div>
      </div>

      <div className="status-bar">
        <span className="status-bar-item">
          Room: <strong>{roomCode}</strong>
        </span>
        <span className="status-bar-item">
          Font: {settings.fontSize}px {settings.fontFamily}
        </span>
        <span className="status-bar-item">
          Color: {settings.fontColor} @ {Math.round(settings.opacity * 100)}%
        </span>
        <span className="status-bar-item status-bar-right">
          DET Sender v0.1.0
        </span>
      </div>
    </div>
  );
}

export default App;
