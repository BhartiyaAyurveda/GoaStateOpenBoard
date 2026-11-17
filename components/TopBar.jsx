"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX, CircleHelp } from "lucide-react";

// Text-size control: scales the whole page (the site is built in px, so a
// root font-size change would have no effect). Steps of 10%, 90% – 130%.
const MIN = 90;
const MAX = 130;
const STEP = 10;
const STORAGE_KEY = "gos-text-size";

// Screen reader: reads the page aloud with the browser's built-in speech
// synthesis (no external service). Reads the selected text if there is any,
// otherwise the main content of the page.
const MAX_CHUNK = 180;

function collectText() {
  try {
    const sel = window.getSelection && window.getSelection().toString().trim();
    if (sel) return [sel];
    const root = document.getElementById("main-content") || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const el = node.parentElement;
        if (!el || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (el.closest('[aria-hidden="true"], script, style, noscript, option')) return NodeFilter.FILTER_REJECT;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const parts = [];
    while (walker.nextNode()) parts.push(walker.currentNode.nodeValue.replace(/\s+/g, " ").trim());
    return parts;
  } catch {
    return [];
  }
}

// Long utterances get cut off by some browsers, so split at sentence/word boundaries.
function toChunks(parts) {
  const chunks = [];
  for (const part of parts) {
    if (part.length <= MAX_CHUNK) {
      chunks.push(part);
      continue;
    }
    let buf = "";
    for (const piece of part.split(/(?<=[.!?;:])\s+/)) {
      if ((buf + " " + piece).trim().length > MAX_CHUNK && buf) {
        chunks.push(buf.trim());
        buf = piece;
      } else {
        buf = (buf + " " + piece).trim();
      }
    }
    if (buf) chunks.push(buf.trim());
  }
  return chunks.filter(Boolean);
}

function applyScale(pct) {
  try {
    document.documentElement.style.zoom = pct === 100 ? "" : String(pct / 100);
  } catch {
    /* ignore */
  }
}

export default function TopBar() {
  const [scale, setScale] = useState(100);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [reading, setReading] = useState(false);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window;
    setSpeechSupported(ok);
    // stop speaking when leaving the page / unmounting
    if (!ok) return;
    const stop = () => window.speechSynthesis.cancel();
    window.addEventListener("beforeunload", stop);
    return () => {
      window.removeEventListener("beforeunload", stop);
      stop();
    };
  }, []);

  const toggleReader = () => {
    if (!speechSupported) return;
    const synth = window.speechSynthesis;
    if (reading || synth.speaking) {
      synth.cancel();
      setReading(false);
      return;
    }
    const chunks = toChunks(collectText());
    if (!chunks.length) return;
    synth.cancel();
    chunks.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = document.documentElement.lang === "en" ? "en-IN" : document.documentElement.lang || "en-IN";
      u.rate = 0.95;
      if (i === chunks.length - 1) {
        u.onend = () => setReading(false);
      }
      u.onerror = () => setReading(false);
      synth.speak(u);
    });
    setReading(true);
  };

  // restore the saved size after mount (avoids a hydration mismatch)
  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(STORAGE_KEY) || "", 10);
      if (saved >= MIN && saved <= MAX) {
        setScale(saved);
        applyScale(saved);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  const change = (next) => {
    const pct = Math.min(MAX, Math.max(MIN, next));
    setScale(pct);
    applyScale(pct);
    try {
      localStorage.setItem(STORAGE_KEY, String(pct));
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <div className="print:hidden bg-navy text-[13.5px] font-medium text-white">
      <div className="mx-auto flex h-[36px] max-w-[1320px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <button
            onClick={() => change(scale - STEP)}
            disabled={scale <= MIN}
            className="px-1.5 hover:text-sky disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-white"
            aria-label="Decrease text size"
            title="Decrease text size"
          >
            A-
          </button>
          <button
            onClick={() => change(100)}
            className={`px-2 hover:text-sky ${scale === 100 ? "text-sky" : ""}`}
            aria-label="Normal text size"
            title="Normal text size"
          >
            A
          </button>
          <button
            onClick={() => change(scale + STEP)}
            disabled={scale >= MAX}
            className="px-1.5 hover:text-sky disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-white"
            aria-label="Increase text size"
            title="Increase text size"
          >
            A+
          </button>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={toggleReader}
            disabled={!speechSupported}
            aria-pressed={reading}
            title={
              speechSupported
                ? reading
                  ? "Stop reading"
                  : "Read this page aloud (or the text you have selected)"
                : "Your browser does not support text-to-speech"
            }
            aria-label={reading ? "Stop reading" : "Read this page aloud"}
            className={`flex items-center gap-1.5 hover:text-sky disabled:cursor-not-allowed disabled:opacity-50 ${reading ? "text-sky" : ""}`}
          >
            {reading ? <VolumeX size={17} /> : <Volume2 size={17} />}{" "}
            <span className="hidden md:inline">{reading ? "Stop Reading" : "Screen Reader"}</span>
          </button>
          <a href="/contact" aria-label="Help and Support" className="flex items-center gap-1.5 hover:text-sky">
            <CircleHelp size={17} /> <span className="hidden md:inline">Help &amp; Support</span>
          </a>
        </div>
      </div>
      <div className="h-[2px] bg-[#2f86e6]" />
    </div>
  );
}
