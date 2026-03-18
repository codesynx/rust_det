import { useState, useEffect, useRef } from "react";

interface StatusIndicatorProps {
  connected: boolean;
}

export default function StatusIndicator({ connected }: StatusIndicatorProps) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<number>();

  useEffect(() => {
    // Show the indicator whenever connection status changes
    setVisible(true);

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Fade out after 5 seconds
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [connected]);

  const statusClass = connected
    ? "status-indicator--connected"
    : "status-indicator--disconnected";

  const visibilityClass = visible
    ? "status-indicator--visible"
    : "status-indicator--hidden";

  return (
    <div className={`status-indicator ${statusClass} ${visibilityClass}`} />
  );
}
