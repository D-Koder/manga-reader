import React, { useState } from "react";
import { useContentSettings } from "../context/content";
import AgeGate from "./AgeGate";

// Navbar button. Show 18+ asks for confirmation once, then reveals the rating filter.
function AdultToggle({ className = "ui-btn ui-btn-ghost" }) {
  const { adultMode, setAdultMode, adultConfirmed, confirmAdult } = useContentSettings();
  const [askingAge, setAskingAge] = useState(false);

  const toggle = () => {
    if (adultMode) {
      setAdultMode(false);
    } else if (adultConfirmed) {
      setAdultMode(true);
    } else {
      setAskingAge(true);
    }
  };

  const confirm = () => {
    confirmAdult();
    setAdultMode(true);
    setAskingAge(false);
  };

  return (
    <>
      <button
        type="button"
        className={className}
        title={adultMode ? "Hide adult (18+) titles" : "Show adult (18+) titles"}
        onClick={toggle}
      >
        {adultMode ? "Hide 18+" : "Show 18+"}
      </button>
      {askingAge && <AgeGate onConfirm={confirm} onCancel={() => setAskingAge(false)} />}
    </>
  );
}

export default AdultToggle;
