import React, { useEffect } from "react";

// Asks the viewer to confirm they are 18 or older before adult ratings are enabled.
function AgeGate({ onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="age-gate-backdrop" onClick={onCancel}>
      <div
        className="age-gate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="age-gate-title">Adult content</h2>
        <p className="muted">
          Erotica and pornographic titles are hidden until you confirm you are 18 or older.
        </p>
        <div className="filter-actions">
          <button type="button" className="ui-btn ui-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={onConfirm}>
            I am 18 or older
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgeGate;
