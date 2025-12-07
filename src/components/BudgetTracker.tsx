"use client";

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function BudgetTracker() {
    const { items, addItem } = useStore();
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");
    const [newItemType, setNewItemType] = useState<"clothing" | "makeup">("clothing");

    const handleAddItem = async () => {
        if (!newItemName || !newItemPrice) return;

        await addItem({
            id: crypto.randomUUID(),
            name: newItemName,
            price: parseFloat(newItemPrice),
            type: newItemType,
            category: "other",
            dateAdded: Date.now()
        });

        setNewItemName("");
        setNewItemPrice("");
    };

    const data = [
        { name: "Clothes", value: items.filter(i => i.type === "clothing").reduce((a, b) => a + (b.price || 0), 0) },
        { name: "Makeup", value: items.filter(i => i.type === "makeup").reduce((a, b) => a + (b.price || 0), 0) },
    ];

    const COLORS = ["#e11d48", "#9333ea"];
    const total = data.reduce((a, b) => a + b.value, 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-4">Investment Tracker</h2>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-border flex flex-col items-center">
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-2">
                        <div className="text-3xl font-bold">${total.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Total Value</div>
                    </div>
                    <div className="flex gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-rose-600" /> Clothes
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-purple-600" /> Makeup
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-border">
                <h3 className="font-medium mb-3">Add Manual Expense</h3>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Item Name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Price"
                            value={newItemPrice}
                            onChange={(e) => setNewItemPrice(e.target.value)}
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                        <select
                            value={newItemType}
                            onChange={(e) => setNewItemType(e.target.value as "clothing" | "makeup")}
                            className="px-3 py-2 border rounded-lg text-sm"
                        >
                            <option value="clothing">Clothing</option>
                            <option value="makeup">Makeup</option>
                        </select>
                    </div>
                    <button
                        onClick={handleAddItem}
                        disabled={!newItemName || !newItemPrice}
                        className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
                    >
                        Add Expense
                    </button>
                </div>
            </div>
        </div>
    );
}
