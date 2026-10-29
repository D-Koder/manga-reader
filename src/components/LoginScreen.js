import React, { useState } from "react";
import { checkCredentials, setSignedIn } from "../data/auth";

function LoginScreen({ onSignedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const ok = await checkCredentials(username, password);
    setBusy(false);
    if (ok) {
      setSignedIn(true);
      onSignedIn();
    } else {
      setPassword("");
      setError("Wrong username or password.");
    }
  };

  return (
    <main className="page login-page">
      <form className="filter-card login-card" onSubmit={submit}>
        <div className="brand login-brand">
          <span className="brand-dot" aria-hidden="true" />
          Manga Reader
        </div>

        <label className="field-label" htmlFor="login-username">Username</label>
        <input
          id="login-username"
          className="field-control"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="field-label" htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          className="field-control"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="inline-error" role="alert">{error}</p>}

        <button type="submit" className="ui-btn ui-btn-primary login-submit" disabled={busy}>
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

export default LoginScreen;
