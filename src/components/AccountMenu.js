import React, { useEffect, useRef, useState } from "react";
import { currentUsername } from "../data/auth";
import { useContentSettings } from "../context/content";
import AdultToggle from "./AdultToggle";

// Navbar account button. Opens a panel with user details, the 18+ setting and sign-out.
function AccountMenu({ onSignOut }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const { adultMode } = useContentSettings();
  const username = currentUsername();

  // Close on Escape or a click outside the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div className="account-wrap" ref={wrapRef}>
      <button
        type="button"
        className="ui-btn ui-btn-ghost account-button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="account-avatar" aria-hidden="true">
          {(username || "?").charAt(0).toUpperCase()}
        </span>
        <span className="account-name">{username}</span>
      </button>

      {open && (
        <div className="account-menu" role="dialog" aria-label="Account">
          <div className="account-row">
            <span className="muted">Signed in as</span>
            <strong>{username}</strong>
          </div>
          <div className="account-row">
            <span className="muted">Adult content (18+)</span>
            <strong>{adultMode ? "Shown" : "Hidden"}</strong>
          </div>
          <AdultToggle className="ui-btn ui-btn-ghost account-action" />
          <button
            type="button"
            className="ui-btn ui-btn-ghost account-action"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountMenu;
