import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";


const timezones = [
  "UTC","America/Chicago","America/New_York","America/Los_Angeles",
  "Europe/London","Europe/Berlin","Asia/Kolkata","Asia/Tokyo",
];

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Use displayName to match backend & context
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [timezone, setTimezone]       = useState(user?.timezone ?? "America/Chicago");
  const [bio, setBio]                 = useState(user?.bio ?? "");
  const [saving, setSaving]           = useState(false);
  const [message, setMessage]         = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Keep form in sync when user loads/changes (fetched from /api/me in context)
  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? "");
    setTimezone(user.timezone ?? "America/Chicago");
    setBio(user.bio ?? "");
  }, [user]);

  const localTime = useMemo(
    () => new Date().toLocaleString("en-US", { timeZone: timezone || "UTC" }),
    [timezone]
  );

  const handleAvatarPick = () => fileInputRef.current?.click();
  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    // Preview only; later we can upload and persist
    updateUser({ picture: url });
  };

  const handleSave: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      // Still mocked locally (no PUT yet). When ready, call your API here.
      // await api("/api/me", { method: "PUT", body: JSON.stringify({ displayName, timezone, bio }) });
      updateUser({ displayName, timezone, bio });
      setMessage("Profile saved successfully.");
    } catch {
      setMessage("Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-wrap" onClick={handleAvatarPick} role="button" aria-label="Change avatar">
            <img
              src={user?.profileImageUrl || user?.picture || "/avatar-fallback.png"}
              alt="Avatar"
              className="avatar"
            />
            <div className="avatar-edit">Change</div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} hidden />
          </div>
          <div className="header-text">
            <h1 className="name">{displayName || user?.email || "Your Name"}</h1>
            <div className="email">{user?.email ?? "—"}</div>
            <div className="tz">Timezone: {timezone || "—"} • Local time: {localTime}</div>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSave}>
          <div className="grid">
            <label className="field">
              <span className="label">Display name</span>
              <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </label>
            <label className="field">
              <span className="label">Email</span>
              <input className="input" value={user?.email ?? ""} disabled />
              <span className="hint">Email comes from OAuth and can’t be edited here.</span>
            </label>
            <label className="field">
              <span className="label">Timezone</span>
              <select className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </label>
            <label className="field field-col">
              <span className="label">Bio</span>
              <textarea className="input textarea" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
            </label>
          </div>

          <div className="actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
          {message && <div className="message">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default Profile;
