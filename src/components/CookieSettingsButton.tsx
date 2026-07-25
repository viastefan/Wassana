"use client";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="hover:text-[color:var(--red)]"
      onClick={() => {
        window.dispatchEvent(new Event("wassana-open-consent"));
      }}
      aria-haspopup="dialog"
    >
      Cookies
    </button>
  );
}
