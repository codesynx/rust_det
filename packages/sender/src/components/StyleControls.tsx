import type { TextSettings } from "../types";

const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "monospace",
];

interface StyleControlsProps {
  settings: TextSettings;
  onChange: (settings: TextSettings) => void;
  sampleText: string;
  disabled: boolean;
}

export function StyleControls({ settings, onChange, sampleText, disabled }: StyleControlsProps) {
  const update = (partial: Partial<TextSettings>) => {
    onChange({ ...settings, ...partial });
  };

  const opacityPercent = Math.round(settings.opacity * 100);

  return (
    <div className="panel style-controls-panel">
      <h2 className="panel-title">Text Style</h2>

      <div className="control-group">
        <label className="control-label">
          Font Size
          <span className="control-value">{settings.fontSize}px</span>
        </label>
        <input
          type="range"
          min={8}
          max={120}
          value={settings.fontSize}
          onChange={(e) => update({ fontSize: Number(e.target.value) })}
          className="slider"
          disabled={disabled}
        />
      </div>

      <div className="control-group">
        <label className="control-label">Font Family</label>
        <select
          value={settings.fontFamily}
          onChange={(e) => update({ fontFamily: e.target.value })}
          className="select"
          disabled={disabled}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label className="control-label">Font Color</label>
        <div className="color-input-row">
          <input
            type="color"
            value={settings.fontColor}
            onChange={(e) => update({ fontColor: e.target.value })}
            className="color-picker"
            disabled={disabled}
          />
          <span className="color-hex">{settings.fontColor}</span>
        </div>
      </div>

      <div className="control-group">
        <label className="control-label">
          Opacity
          <span className="control-value">{opacityPercent}%</span>
        </label>
        <input
          type="range"
          min={5}
          max={100}
          value={opacityPercent}
          onChange={(e) => update({ opacity: Number(e.target.value) / 100 })}
          className="slider"
          disabled={disabled}
        />
      </div>

      <div className="preview-section">
        <label className="control-label">Preview</label>
        <div className="preview-box">
          <span
            className="preview-text"
            style={{
              fontSize: `${Math.min(settings.fontSize, 48)}px`,
              fontFamily: settings.fontFamily,
              color: settings.fontColor,
              opacity: settings.opacity,
            }}
          >
            {sampleText || "Sample Text"}
          </span>
        </div>
      </div>
    </div>
  );
}
