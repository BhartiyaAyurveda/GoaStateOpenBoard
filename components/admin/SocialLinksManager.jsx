"use client";

import { useState, useEffect } from "react";
import SocialIcon from "@/components/icons/SocialIcon";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Share2, Save, RotateCcw, ExternalLink, Sparkles, RefreshCw } from "lucide-react";

const DEFAULT_SOCIALS = [
  {
    id: "twitter",
    name: "Twitter / X",
    handle: "",
    url: "",
    enabled: false,
    followers: "",
    color: "bg-neutral-900 text-white",
  },
  {
    id: "instagram",
    name: "Instagram",
    handle: "",
    url: "",
    enabled: false,
    followers: "",
    color: "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white",
  },
  {
    id: "youtube",
    name: "YouTube Channel",
    handle: "",
    url: "",
    enabled: false,
    followers: "",
    color: "bg-red-600 text-white",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "",
    url: "",
    enabled: false,
    followers: "",
    color: "bg-blue-700 text-white",
  },
  {
    id: "facebook",
    name: "Facebook Page",
    handle: "",
    url: "",
    enabled: false,
    followers: "",
    color: "bg-blue-600 text-white",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Official Channel",
    handle: "",
    url: "",
    enabled: false,
    followers: "",
    color: "bg-emerald-600 text-white",
  },
  {
    id: "telegram",
    name: "Telegram Broadcast",
    handle: "",
    url: "",
    enabled: false,
    followers: "",
    color: "bg-sky-500 text-white",
  },
];

export default function SocialLinksManager({ onShowToast }) {
  const [confirm, confirmDialog] = useConfirm();
  const [socials, setSocials] = useState(DEFAULT_SOCIALS);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/site-settings")
      .then(r => r.json())
      .then(data => {
        if (data.ok && Array.isArray(data.socials) && data.socials.length > 0) setSocials(data.socials);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (id) => {
    setSocials((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
    setIsSaved(false);
  };

  const handleUrlChange = (id, newUrl) => {
    setSocials((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, url: newUrl } : item
      )
    );
    setIsSaved(false);
  };

  const handleHandleChange = (id, newHandle) => {
    setSocials((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, handle: newHandle } : item
      )
    );
    setIsSaved(false);
  };

  const handleSave = async (e) => {
    e?.preventDefault();

    // only https links are allowed (the website ignores anything else)
    for (const item of socials) {
      if (item.url && !/^https:\/\/\S+$/i.test(item.url.trim())) {
        onShowToast?.(`${item.name}: the profile URL must start with https://`, "error");
        return;
      }
      if (item.enabled && !item.url.trim() && (!item.handle.trim() || item.id === "whatsapp")) {
        onShowToast?.(`${item.name}: add the profile URL, or switch it off.`, "error");
        return;
      }
    }

    const clean = socials.map((s) => ({ ...s, url: s.url.trim(), handle: s.handle.trim() }));
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "social_links", value: JSON.stringify(clean) }),
      });
      const data = await res.json();
      if (data.ok) {
        setSocials(clean);
        setIsSaved(true);
        onShowToast?.("Social media links saved. Switched-on profiles are live on the website.", "success");
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        onShowToast?.(data.error || "Save failed", "error");
      }
    } catch {
      onShowToast?.("Network error", "error");
    }
  };

  const handleReset = async () => {
    if (!(await confirm({ title: "Reset social links?", message: "All links go back to the default configuration. Nothing is saved until you press Save.", confirmLabel: "Reset", danger: true }))) return;
    setSocials(DEFAULT_SOCIALS);
    onShowToast?.("Social links restored to defaults.", "info");
  };

  const getIcon = (id) => <SocialIcon id={id} className="w-4 h-4" />;

  if (loading) return <div className="p-10 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#1b57d8]" /></div>;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#d3e1f5] shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-serif text-[#082a63] flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#1b57d8]" />
            Social Media Links &amp; Channels
          </h2>
          <p className="text-[13px] text-[#3d5688] mt-0.5">
            Switched-on profiles appear as icons in the website footer and on the Contact page. Use the full https:// profile link.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-[13px] font-semibold text-[#1245b8] hover:text-[#082a63] hover:bg-[#f4f8fe] rounded-xl border border-[#d3e1f5] transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-[13px] font-bold text-white bg-[#082a63] hover:bg-[#0b3a85] rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4 text-white" />
            <span>{isSaved ? "Saved!" : "Save Social Links"}</span>
          </button>
        </div>
      </div>

      {/* Social Platforms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {socials.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl bg-white border transition-all ${
              item.enabled
                ? "border-[#d3e1f5] shadow-sm hover:shadow-md"
                : "border-neutral-200 opacity-60 bg-neutral-50/70"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${item.color}`}
                >
                  {getIcon(item.id)}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#082a63] flex items-center gap-2">
                    <span>{item.name}</span>
                    {item.enabled ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-bold">
                        Live
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600 text-[12px] font-medium">
                        Hidden
                      </span>
                    )}
                  </h3>
                  <span className="text-[13px] text-[#3d5688]">{item.followers}</span>
                </div>
              </div>

              {/* Enable / Disable Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={() => handleToggle(item.id)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#082a63]"></div>
              </label>
            </div>

            {/* Inputs */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-wider text-[#3d5688] mb-1">
                  Public Handle / ID
                </label>
                <input
                  type="text"
                  value={item.handle}
                  onChange={(e) => handleHandleChange(item.id, e.target.value)}
                  placeholder="@handle"
                  className="w-full px-3 py-1.5 text-[13px] rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b57d8] text-[#082a63]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold uppercase tracking-wider text-[#3d5688] mb-1">
                  Destination Profile URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={item.url}
                    onChange={(e) => handleUrlChange(item.id, e.target.value)}
                    placeholder="https://"
                    className="flex-1 px-3 py-1.5 text-[13px] rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b57d8] text-[#082a63]"
                  />
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#e3edfa] hover:bg-[#d3e1f5] text-[#082a63] transition-colors"
                      title="Test link in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Guidance */}
      <div className="p-4 rounded-2xl bg-[#f4f8fe] border border-[#d3e1f5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] text-[#3d5688]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1b57d8] shrink-0" />
          <span>Active channels appear in the top website bar and footer social cluster.</span>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-[#082a63] hover:bg-[#0b3a85] text-white text-[13px] font-bold rounded-xl shadow-sm self-start sm:self-auto transition-all"
        >
          {isSaved ? "Saved!" : "Save All Changes"}
        </button>
      </div>
      {confirmDialog}
    </div>
  );
}
