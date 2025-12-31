"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useStore } from "@/hooks/useStore";
import type { Item } from "@/types";

function mergeItems(serverItems: Item[], localItems: Item[]): Item[] {
  const byId = new Map<string, Item>();
  serverItems.forEach((item) => byId.set(item.id, item));
  localItems.forEach((item) => {
    const existing = byId.get(item.id);
    if (!existing) {
      byId.set(item.id, item);
      return;
    }
    const existingDate = existing.dateAdded ?? 0;
    const localDate = item.dateAdded ?? 0;
    if (localDate > existingDate) {
      byId.set(item.id, item);
    }
  });
  return Array.from(byId.values()).sort((a, b) => (b.dateAdded ?? 0) - (a.dateAdded ?? 0));
}

export function SessionSync() {
  const { data: session, status } = useSession();
  const hasSynced = useRef(false);
  const { items, hydrateItems } = useStore();

  useEffect(() => {
    const sync = async () => {
      if (!session?.user?.id || status !== "authenticated" || hasSynced.current) return;
      hasSynced.current = true;

      try {
        const res = await fetch("/api/sync/items", { cache: "no-store" });
        if (!res.ok) throw new Error(`Sync fetch failed: ${res.status}`);
        const data = await res.json();
        const serverItems = (data.items || []) as Item[];
        const merged = mergeItems(serverItems, items);
        if (typeof hydrateItems === "function") {
          hydrateItems(merged);
        }
        await fetch("/api/sync/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: merged }),
        });
      } catch (err) {
        console.error("Session sync failed", err);
      }
    };

    sync();
  }, [session?.user?.id, status, items, hydrateItems]);

  return null;
}
