"use client";

import { useState } from "react";
import { clsx } from "clsx";
import type { Item } from "@/types";

interface ImportConfirmationModalProps {
  isOpen: boolean;
  items: Item[];
  onConfirm: (confirmedItems: Item[]) => void;
  onCancel: () => void;
}

export function ImportConfirmationModal({
  isOpen,
  items,
  onConfirm,
  onCancel,
}: ImportConfirmationModalProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(items.map((i) => i.id))
  );
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };

  const handleConfirm = () => {
    const confirmed = items.filter((i) => selectedItems.has(i.id));
    onConfirm(confirmed);
  };

  const updateEditingItem = (updates: Partial<Item>) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, ...updates });
    }
  };

  const saveEditingItem = () => {
    if (editingItem) {
      // Create a callback to update the parent via onConfirm later (don't mutate props)
      // In practice, the parent component should handle updates
      setEditingItem(null);
    }
  };

  const confirmedCount = selectedItems.size;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Confirm CSV Import</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Review and select items to import ({confirmedCount}/{items.length} selected)
        </p>

        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div
              key={item.id}
              className={clsx(
                "border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition",
                selectedItems.has(item.id)
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-slate-600"
              )}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.type} • {item.category}
                  </p>
                  {item.brand && (
                    <p className="text-sm text-gray-500">{item.brand}</p>
                  )}
                  {item.price && (
                    <p className="text-sm font-medium text-green-600">${item.price.toFixed(2)}</p>
                  )}
                  {item.importMeta?.confidence !== undefined && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">
                        Confidence: {Math.round(item.importMeta.confidence * 100)}%
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{
                            width: `${item.importMeta.confidence * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setEditingItem(item)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-bold mb-4">Edit Item</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => updateEditingItem({ name: e.target.value })}
                    className="w-full border rounded px-3 py-2 dark:bg-slate-800 dark:border-slate-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={editingItem.type}
                      onChange={(e) =>
                        updateEditingItem({
                          type: e.target.value as "clothing" | "makeup",
                        })
                      }
                      className="w-full border rounded px-3 py-2 dark:bg-slate-800 dark:border-slate-600"
                    >
                      <option>clothing</option>
                      <option>makeup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={editingItem.category}
                      onChange={(e) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        updateEditingItem({ category: e.target.value as any });
                      }}
                      className="w-full border rounded px-3 py-2 dark:bg-slate-800 dark:border-slate-600"
                    >
                      <option>top</option>
                      <option>bottom</option>
                      <option>dress</option>
                      <option>shoe</option>
                      <option>outerwear</option>
                      <option>accessory</option>
                      <option>face</option>
                      <option>eye</option>
                      <option>lip</option>
                      <option>cheek</option>
                      <option>tool</option>
                      <option>other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Brand</label>
                  <input
                    type="text"
                    value={editingItem.brand || ""}
                    onChange={(e) => updateEditingItem({ brand: e.target.value })}
                    className="w-full border rounded px-3 py-2 dark:bg-slate-800 dark:border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    value={editingItem.price || ""}
                    onChange={(e) =>
                      updateEditingItem({ price: parseFloat(e.target.value) })
                    }
                    className="w-full border rounded px-3 py-2 dark:bg-slate-800 dark:border-slate-600"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditingItem}
                  className="flex-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmedCount === 0}
            className={clsx(
              "px-4 py-2 rounded text-white font-medium",
              confirmedCount === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            Import {confirmedCount} items
          </button>
        </div>
      </div>
    </div>
  );
}
