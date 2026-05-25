"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import { User, Key, Lock, Cpu, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

type Tab = "profile" | "apikey" | "password" | "aimode";

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState<Tab>("profile");

  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [subject, setSubject] = useState(user?.subject || "");
  const [school, setSchool] = useState(user?.school || "");
  const [location, setLocation] = useState(user?.location || "");
  const [className, setClassName] = useState(user?.className || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // API Key state
  const [apiKey, setApiKey] = useState(user?.apiKey || "");
  const [apiSaving, setApiSaving] = useState(false);
  const [apiSaved, setApiSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  // AI Mode state
  const [mockMode, setMockMode] = useState(user?.mockMode ?? true);
  const [modeSaving, setModeSaving] = useState(false);
  const [modeSaved, setModeSaved] = useState(false);

  // LLM Config state
  const [llmBaseUrl, setLlmBaseUrl] = useState(user?.llmBaseUrl || "");
  const [llmModel, setLlmModel] = useState(user?.llmModel || "");
  const [llmSaving, setLlmSaving] = useState(false);
  const [llmSaved, setLlmSaved] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await api.updateProfile({ name, subject, school, location, className });
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const handleSaveApiKey = async () => {
    setApiSaving(true);
    updateUser({ apiKey });
    try {
      await api.updateApiKey(apiKey);
    } catch {}
    setApiSaved(true);
    setTimeout(() => setApiSaved(false), 2000);
    setApiSaving(false);
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (newPw.length < 6) { setPwError("New password must be at least 6 characters"); return; }
    setPwSaving(true);
    try {
      await api.updatePassword(currentPw, newPw);
      setPwSaved(true);
      setCurrentPw("");
      setNewPw("");
      setTimeout(() => setPwSaved(false), 2000);
    } catch (err: any) {
      setPwError(err.message);
    }
    setPwSaving(false);
  };

  const handleMockMode = async () => {
    setModeSaving(true);
    const newMode = !mockMode;
    setMockMode(newMode);
    updateUser({ mockMode: newMode });
    try {
      await api.updateMockMode(newMode);
    } catch {}
    setModeSaved(true);
    setTimeout(() => setModeSaved(false), 2000);
    setModeSaving(false);
  };

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "apikey", label: "API Key", icon: Key },
    { id: "password", label: "Password", icon: Lock },
    { id: "aimode", label: "AI Mode", icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] p-3 flex gap-3">
      <Sidebar />
      <main className="flex-1 bg-[var(--card)] rounded-2xl flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto px-7 pt-6 pb-16" style={{ background: "linear-gradient(to bottom, var(--muted), var(--card))" }}>
          <div className="flex items-start gap-3 mb-6">
            <span className="mt-2 h-3 w-3 rounded-full bg-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage your account settings.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                    active
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--hover)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {tab === "profile" && (
            <div className="max-w-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)]">Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)]">Subject</label>
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)]">School</label>
                  <input value={school} onChange={(e) => setSchool(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)]">Location</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Class</label>
                <input value={className} onChange={(e) => setClassName(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30" />
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold px-6 py-2.5 hover:opacity-90 transition cursor-pointer disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saved ? "Saved!" : "Save Changes"}
                {saved && <CheckCircle className="h-4 w-4 text-emerald-400" />}
              </button>
            </div>
          )}

          {tab === "apikey" && (
            <div className="max-w-lg space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">LLM API Key</label>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">Your key is stored securely and used for generating question papers. Works with OpenAI (sk-...), Groq (gsk_...), and other OpenAI-compatible APIs.</p>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full h-11 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30"
                  />
                  <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] cursor-pointer">
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button onClick={handleSaveApiKey} disabled={apiSaving} className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold px-6 py-2.5 hover:opacity-90 transition cursor-pointer disabled:opacity-50">
                {apiSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {apiSaved ? "Saved!" : "Save API Key"}
                {apiSaved && <CheckCircle className="h-4 w-4 text-emerald-400" />}
              </button>
            </div>
          )}

          {tab === "password" && (
            <div className="max-w-lg space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Current Password</label>
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30" />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">New Password</label>
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30" />
              </div>
              {pwError && <p className="text-sm text-red-500">{pwError}</p>}
              <button onClick={handleChangePassword} disabled={pwSaving} className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold px-6 py-2.5 hover:opacity-90 transition cursor-pointer disabled:opacity-50">
                {pwSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {pwSaved ? "Changed!" : "Change Password"}
                {pwSaved && <CheckCircle className="h-4 w-4 text-emerald-400" />}
              </button>
            </div>
          )}

          {tab === "aimode" && (
            <div className="max-w-lg space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">AI Generation Mode</label>
                <p className="text-xs text-[var(--muted-foreground)] mb-4">
                  When mock mode is on, questions are generated locally for testing (no API key needed).
                  Turn it off to use your API key for real AI-generated questions.
                </p>
                <div className="flex items-center justify-between bg-[var(--muted)] rounded-xl p-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {mockMode ? "Mock Mode (Testing)" : "Live Mode"}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {mockMode
                        ? "Questions are generated locally without an API key"
                        : "Questions are generated using the configured LLM"}
                    </p>
                  </div>
                  <button
                    onClick={handleMockMode}
                    disabled={modeSaving}
                    className={`relative h-7 w-12 rounded-full transition cursor-pointer ${
                      mockMode ? "bg-[var(--brand)]" : "bg-[var(--muted-foreground)]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        mockMode ? "translate-x-[22px]" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                {modeSaved && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Mode updated
                  </p>
                )}
              </div>

              <div className="border-t border-[var(--border)] pt-4">
                <label className="text-sm font-medium text-[var(--foreground)]">LLM Provider Config</label>
                <p className="text-xs text-[var(--muted-foreground)] mb-4">
                  Leave blank for OpenAI defaults. For Groq: set Base URL to <code className="text-[var(--brand)]">https://api.groq.com/openai/v1</code> and Model to <code className="text-[var(--brand)]">llama3-70b-8192</code>.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--muted-foreground)]">Base URL</label>
                    <input
                      value={llmBaseUrl}
                      onChange={(e) => setLlmBaseUrl(e.target.value)}
                      placeholder="https://api.openai.com/v1 (or Groq/other)"
                      className="mt-1 w-full h-11 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted-foreground)]">Model</label>
                    <input
                      value={llmModel}
                      onChange={(e) => setLlmModel(e.target.value)}
                      placeholder="gpt-4o-mini (or llama3-70b-8192, etc.)"
                      className="mt-1 w-full h-11 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      setLlmSaving(true);
                      updateUser({ llmBaseUrl, llmModel });
                      try {
                        await api.updateLlmConfig(llmBaseUrl, llmModel);
                      } catch {}
                      setLlmSaved(true);
                      setTimeout(() => setLlmSaved(false), 2000);
                      setLlmSaving(false);
                    }}
                    disabled={llmSaving}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold px-6 py-2.5 hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                  >
                    {llmSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {llmSaved ? "Saved!" : "Save Config"}
                    {llmSaved && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
