"use client";

import { useEffect, useState } from "react";

// The Secretary's signature image (set by the Board in the dashboard > Signature). "" when none is set.
// Fetched once per page load and shared by every marksheet on the page.
let cached = null;
let pending = null;

function load() {
  if (cached !== null) return Promise.resolve(cached);
  if (!pending) {
    pending = fetch("/api/public/secretary-signature")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (cached = typeof d?.url === "string" ? d.url : ""))
      .catch(() => (cached = ""))
      .finally(() => (pending = null));
  }
  return pending;
}

export default function useSecretarySignature() {
  const [url, setUrl] = useState(cached || "");
  useEffect(() => {
    let alive = true;
    load().then((u) => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, []);
  return url;
}

// call after the Board saves a new signature, so the next marksheet shows it immediately
export function resetSecretarySignatureCache() {
  cached = null;
}
