// Control message types sent over WebSocket

export interface TextMessage {
  type: "text";
  content: string;
}

export interface ClearMessage {
  type: "clear";
}

export interface SettingsMessage {
  type: "settings";
  settings: TextSettings;
}

export interface TextSettings {
  fontSize: number;      // 8-120
  fontFamily: string;
  fontColor: string;     // hex color
  opacity: number;       // 0.05-1.0
}

export interface JoinMessage {
  type: "join";
  room: string;
  role: "sender" | "receiver";
}

export interface PeerStatusMessage {
  type: "peer_joined" | "peer_left";
  role: "sender" | "receiver";
}

export type ControlMessage = TextMessage | ClearMessage | SettingsMessage;
export type SignalingMessage = JoinMessage | PeerStatusMessage;
export type WSMessage = ControlMessage | SignalingMessage;

// Stream config
export interface StreamConfig {
  serverUrl: string;      // WebSocket server URL
  room: string;           // Room code
  mediaUrl: string;       // MediaMTX SRT URL for publishing/subscribing
}

export const DEFAULT_SETTINGS: TextSettings = {
  fontSize: 32,
  fontFamily: "Arial",
  fontColor: "#ffffff",
  opacity: 0.85,
};
