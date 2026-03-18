import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface StreamPanelProps {
  disabled: boolean;
}

export function StreamPanel({ disabled: _disabled }: StreamPanelProps) {
  const [srtUrl, setSrtUrl] = useState(
    "srt://localhost:8890?streamid=read:myroom&latency=200000"
  );
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [error, setError] = useState<string | null>(null);

  const handleStartStop = useCallback(async () => {
    setError(null);
    try {
      if (playing) {
        await invoke("stop_player");
        setPlaying(false);
      } else {
        await invoke("start_player", { srtUrl });
        setPlaying(true);
      }
    } catch (err: any) {
      setError(String(err));
      console.error("Player command failed:", err);
    }
  }, [playing, srtUrl]);

  const handleCheckStatus = useCallback(async () => {
    try {
      const status = await invoke<string>("get_player_status");
      if (status === "playing") {
        setPlaying(true);
      } else {
        setPlaying(false);
      }
    } catch (err) {
      console.warn("Status check failed:", err);
    }
  }, []);

  return (
    <div className="panel stream-panel">
      <h2 className="panel-title">Screen Viewer</h2>

      <div className="control-group">
        <label className="control-label">SRT Stream URL</label>
        <input
          type="text"
          value={srtUrl}
          onChange={(e) => setSrtUrl(e.target.value)}
          className="input"
          placeholder="srt://localhost:8890?streamid=read:myroom"
          disabled={playing}
        />
      </div>

      <div className="stream-actions">
        <button
          className={`btn ${playing ? "btn-danger" : "btn-success"}`}
          onClick={handleStartStop}
        >
          {playing ? "Stop Viewer" : "Start Viewer"}
        </button>
        <button className="btn btn-secondary btn-small" onClick={handleCheckStatus}>
          Refresh Status
        </button>
      </div>

      <div className="stream-status-row">
        <span className={`status-dot ${playing ? "status-green" : "status-red"}`} />
        <span className="status-text">{playing ? "Playing" : "Stopped"}</span>
      </div>

      <div className="control-group">
        <label className="control-label">
          Volume
          <span className="control-value">{volume}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="slider"
        />
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
