import { useState } from "react";

interface ConnectionBarProps {
  serverUrl: string;
  roomCode: string;
  connected: boolean;
  peerOnline: boolean;
  onServerUrlChange: (url: string) => void;
  onRoomCodeChange: (room: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectionBar({
  serverUrl,
  roomCode,
  connected,
  peerOnline,
  onServerUrlChange,
  onRoomCodeChange,
  onConnect,
  onDisconnect,
}: ConnectionBarProps) {
  const [, setEditing] = useState(!connected);

  const statusText = connected && peerOnline
    ? "Connected — Peer Online"
    : connected
    ? "Connected — Waiting for peer"
    : "Disconnected";

  const handleToggle = () => {
    if (connected) {
      onDisconnect();
      setEditing(true);
    } else {
      onConnect();
      setEditing(false);
    }
  };

  return (
    <div className="connection-bar">
      <div className="connection-inputs">
        <label className="input-group">
          <span className="input-label">Server</span>
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => onServerUrlChange(e.target.value)}
            disabled={connected}
            className="input"
            placeholder="ws://localhost:8765"
          />
        </label>

        <label className="input-group">
          <span className="input-label">Room</span>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => onRoomCodeChange(e.target.value.toUpperCase())}
            disabled={connected}
            className="input input-room"
            placeholder="MYROOM"
          />
        </label>

        <button
          className={`btn ${connected ? "btn-danger" : "btn-primary"}`}
          onClick={handleToggle}
        >
          {connected ? "Disconnect" : "Connect"}
        </button>
      </div>

      <div className="connection-status">
        <span
          className={`status-dot ${connected ? (peerOnline ? "status-green" : "status-yellow") : "status-red"}`}
        />
        <span className="status-text">{statusText}</span>
      </div>
    </div>
  );
}
