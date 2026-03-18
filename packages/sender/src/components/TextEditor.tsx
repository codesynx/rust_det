import { useState, useEffect, useRef, useCallback } from "react";

interface TextEditorProps {
  onTextChange: (text: string) => void;
  onClear: () => void;
  disabled: boolean;
}

export function TextEditor({ onTextChange, onClear, disabled }: TextEditorProps) {
  const [text, setText] = useState("");
  const debounceRef = useRef<number>();

  const debouncedSend = useCallback(
    (value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => {
        onTextChange(value);
      }, 300);
    },
    [onTextChange]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    debouncedSend(value);
  };

  const handleClear = () => {
    setText("");
    onClear();
  };

  const handleLoadFile = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const result = await open({
        multiple: false,
        filters: [{ name: "Text Files", extensions: ["txt", "md", "text"] }],
      });
      if (result) {
        const { readTextFile } = await import("@tauri-apps/plugin-fs");
        const content = await readTextFile(result as string);
        setText(content);
        onTextChange(content);
      }
    } catch (err) {
      console.warn("File dialog not available:", err);
    }
  };

  return (
    <div className="panel text-editor-panel">
      <div className="panel-header">
        <h2 className="panel-title">Text Overlay</h2>
        <span className="char-count">{text.length} chars</span>
      </div>

      <textarea
        className="text-area"
        value={text}
        onChange={handleChange}
        placeholder={disabled ? "Connect to start typing..." : "Type text to display on child's screen..."}
        disabled={disabled}
        spellCheck={false}
      />

      <div className="text-actions">
        <button className="btn btn-secondary" onClick={handleClear} disabled={disabled}>
          Clear
        </button>
        <button className="btn btn-secondary" onClick={handleLoadFile} disabled={disabled}>
          Load File
        </button>
      </div>
    </div>
  );
}
