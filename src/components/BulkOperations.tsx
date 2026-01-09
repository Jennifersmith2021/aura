"use client";

import { useStore } from "@/hooks/useStore";
import { useState, useCallback } from "react";
import { Trash2, Copy, Tag, Heart, HeartOff } from "lucide-react";
import { clsx } from "clsx";
import { v4 as uuidv4 } from "uuid";
import type { Item } from "@/types";

export default function BulkOperations() {
  const { items, removeItem, addItem, addTag, updateItem } = useStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionMode, setActionMode] = useState<
    "tag" | "wishlist" | "wishlist-remove" | "duplicate" | "delete" | null
  >(null);
  const [tagInput, setTagInput] = useState("");
  const colorPalette = ["#60a5fa", "#f472b6", "#34d399", "#f59e0b", "#a78bfa"];

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }, [items, selectedIds.size]);

  const executeAction = useCallback(
    (action: typeof actionMode) => {
      const selectedItems = items.filter((i) => selectedIds.has(i.id));
      if (selectedItems.length === 0) return;

      switch (action) {
        case "delete":
          if (window.confirm(`Delete ${selectedItems.length} items?`)) {
            selectedItems.forEach((item) => removeItem(item.id));
            setSelectedIds(new Set());
            setActionMode(null);
          }
          break;

        case "duplicate":
          selectedItems.forEach((item) => {
            const duplicate: Item = {
              ...item,
              id: uuidv4(),
              dateAdded: Date.now(),
            };
            addItem(duplicate);
          });
          setSelectedIds(new Set());
          setActionMode(null);
          break;

        case "tag":
          if (tagInput.trim()) {
            addTag({
              name: tagInput.trim(),
              color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
              dateCreated: Date.now(),
            });
            setTagInput("");
            setSelectedIds(new Set());
            setActionMode(null);
          }
          break;

        case "wishlist":
          selectedItems.forEach((item) => {
            updateItem({ ...item, wishlist: true });
          });
          setSelectedIds(new Set());
          setActionMode(null);
          break;

        case "wishlist-remove":
          selectedItems.forEach((item) => {
            updateItem({ ...item, wishlist: false });
          });
          setSelectedIds(new Set());
          setActionMode(null);
          break;
      }
    },
    [items, selectedIds, tagInput, colorPalette, removeItem, addItem, addTag, updateItem]
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No items to manage</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.size === items.length && items.length > 0}
              onChange={selectAll}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-sm font-medium text-muted-foreground">
              {selectedIds.size} selected
            </span>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => setActionMode("tag")}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
              >
                <Tag className="w-4 h-4" />
                Tag
              </button>
              <button
                onClick={() => executeAction("duplicate")}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button
                onClick={() => executeAction("wishlist")}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg transition-colors"
              >
                <Heart className="w-4 h-4" />
                Add to wishlist
              </button>
              <button
                onClick={() => executeAction("wishlist-remove")}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors"
              >
                <HeartOff className="w-4 h-4" />
                Remove wishlist
              </button>
              <button
                onClick={() => setActionMode("delete")}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Tag Input */}
        {actionMode === "tag" && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter tag name..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
            />
            <button
              onClick={() => executeAction("tag")}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-sm font-medium"
            >
              Apply
            </button>
            <button
              onClick={() => {
                setActionMode(null);
                setTagInput("");
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Confirmation */}
        {actionMode === "delete" && (
          <div className="flex gap-2">
            <button
              onClick={() => executeAction(actionMode)}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-sm font-medium"
            >
              Confirm delete
            </button>
            <button
              onClick={() => setActionMode(null)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={clsx(
              "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
              selectedIds.has(item.id)
                ? "bg-primary/20 border-primary"
                : "bg-white/5 border-white/10 hover:border-white/20"
            )}
            onClick={() => toggleSelection(item.id)}
          >
            <input
              type="checkbox"
              checked={selectedIds.has(item.id)}
              onClick={(e) => {
                e.stopPropagation();
                toggleSelection(item.id);
              }}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.type} • {item.category || "uncategorized"}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
