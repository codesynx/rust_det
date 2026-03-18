import type { TextSettings } from "../types";

interface TextOverlayProps {
  text: string;
  settings: TextSettings;
}

export default function TextOverlay({ text, settings }: TextOverlayProps) {
  if (!text) return null;

  return (
    <div className="text-overlay">
      <div
        className="text-overlay__content"
        style={{
          fontSize: `${settings.fontSize}px`,
          fontFamily: settings.fontFamily,
          color: settings.fontColor,
          opacity: settings.opacity,
        }}
      >
        {text}
      </div>
    </div>
  );
}
