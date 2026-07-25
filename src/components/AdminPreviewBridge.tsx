"use client";

import { useEffect } from "react";
import {
  ADMIN_PREVIEW_PARAM,
  PREVIEW_DRAFT_MSG,
  PREVIEW_EDIT_MSG,
  PREVIEW_OPEN_POPUP_MSG,
  PREVIEW_READY_MSG,
} from "@/lib/content-paths";

/**
 * Active only inside the admin iframe (?adminPreview=1).
 * Click editable texts → notify parent; accept draft patches from admin.
 */
export function AdminPreviewBridge() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get(ADMIN_PREVIEW_PARAM) !== "1") return;
    if (window.parent === window) return;

    document.documentElement.classList.add("admin-preview-mode");
    window.parent.postMessage(
      { type: PREVIEW_READY_MSG, path: window.location.pathname },
      window.location.origin,
    );

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const node = target.closest<HTMLElement>("[data-content-path]");
      if (!node) {
        const link = target.closest("a");
        if (link) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const path = node.getAttribute("data-content-path");
      if (!path) return;

      document
        .querySelectorAll(".admin-preview-selected")
        .forEach((el) => el.classList.remove("admin-preview-selected"));
      node.classList.add("admin-preview-selected");

      window.parent.postMessage(
        { type: PREVIEW_EDIT_MSG, path },
        window.location.origin,
      );
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as {
        type?: string;
        path?: string;
        value?: string;
      } | null;
      if (!data?.type) return;

      if (data.type === PREVIEW_OPEN_POPUP_MSG) {
        const btn = document.querySelector<HTMLElement>(
          "[data-admin-open-offer]",
        );
        btn?.click();
        return;
      }

      if (data.type !== PREVIEW_DRAFT_MSG || !data.path) return;
      const nodes = document.querySelectorAll<HTMLElement>(
        `[data-content-path="${CSS.escape(data.path)}"]`,
      );
      nodes.forEach((node) => {
        const next = String(data.value ?? "");
        if (node.tagName === "INPUT" || node.tagName === "TEXTAREA") return;
        node.textContent = next || "\u00a0";
      });
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("message", onMessage);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("message", onMessage);
      document.documentElement.classList.remove("admin-preview-mode");
    };
  }, []);

  return null;
}
