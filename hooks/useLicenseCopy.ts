"use client";

import { useState } from "react";

function copyWithSelection(value: string) {
  const textarea = document.createElement("textarea");
  const previouslyFocused = document.activeElement;
  textarea.value = value;
  textarea.readOnly = true;
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  textarea.style.userSelect = "text";
  document.body.appendChild(textarea);

  try {
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, value.length);
    return document.execCommand("copy");
  } finally {
    textarea.remove();
    if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
      try {
        previouslyFocused.focus({ preventScroll: true });
      } catch {
        // Focus restoration must not mask a successful copy.
      }
    }
  }
}

export function useLicenseCopy() {
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const copy = async (licenseNumber: string) => {
    setCopyError(null);
    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(licenseNumber);
        copied = true;
      }
    } catch {
      // Older WebViews can expose writeText but deny write permission.
    }

    if (!copied) {
      try {
        copied = copyWithSelection(licenseNumber);
      } catch {
        copied = false;
      }
    }

    setIsCopied(copied);
    if (copied) {
      window.setTimeout(() => setIsCopied(false), 1_500);
    } else {
      setCopyError("ไม่สามารถคัดลอกเลขใบอนุญาตได้ใน WebView นี้");
    }
  };

  return { copy, copyError, isCopied };
}
