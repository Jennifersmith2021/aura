import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type KeyboardHandler = (e: KeyboardEvent) => void;

const shortcuts: Record<string, { key: string; description: string }> = {
  home: { key: "h", description: "Go to Home" },
  closet: { key: "c", description: "Go to Closet" },
  shopping: { key: "s", description: "Go to Shopping" },
  vanity: { key: "v", description: "Go to Vanity" },
  studio: { key: "t", description: "Go to Studio" },
  quickAdd: { key: "q", description: "Quick Add Item" },
  search: { key: "/", description: "Search" },
  help: { key: "?", description: "Show Help" },
};

export function useKeyboardShortcuts() {
  const router = useRouter();

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      const key = e.key.toLowerCase();

      // Check if user is holding modifier keys (Ctrl/Cmd)
      const hasModifier = e.ctrlKey || e.metaKey;

      switch (key) {
        case shortcuts.home.key:
          if (!hasModifier) {
            e.preventDefault();
            router.push("/");
          }
          break;
        case shortcuts.closet.key:
          if (!hasModifier) {
            e.preventDefault();
            router.push("/closet");
          }
          break;
        case shortcuts.shopping.key:
          if (!hasModifier) {
            e.preventDefault();
            router.push("/shopping");
          }
          break;
        case shortcuts.vanity.key:
          if (!hasModifier) {
            e.preventDefault();
            router.push("/vanity");
          }
          break;
        case shortcuts.studio.key:
          if (!hasModifier) {
            e.preventDefault();
            router.push("/studio");
          }
          break;
        case shortcuts.search.key:
          if (!hasModifier && key === "/") {
            e.preventDefault();
            // Dispatch custom event that components can listen for
            window.dispatchEvent(new CustomEvent("keyboard-search", { detail: {} }));
          }
          break;
        case shortcuts.quickAdd.key:
          if (!hasModifier) {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("keyboard-quick-add", { detail: {} }));
          }
          break;
        case shortcuts.help.key:
          if (!hasModifier && key === "?") {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("keyboard-help", { detail: {} }));
          }
          break;
        case "escape":
          // Close modals/panels on Escape
          window.dispatchEvent(new CustomEvent("keyboard-escape", { detail: {} }));
          break;
      }
    },
    [router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  return shortcuts;
}

export function getKeyboardShortcuts() {
  return shortcuts;
}
