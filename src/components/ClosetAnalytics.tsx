"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { BarChart3, TrendingUp, DollarSign, Palette, Calendar, Star } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const COLORS = ["#ec4899", "#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function ClosetAnalytics() {
    const { items, looks } = useStore();
    const [computedNow] = useState(() => Date.now());

    // Calculate analytics
    const analytics = useMemo(() => {
        const clothingItems = items.filter((item) => item.type === "clothing");
        const makeupItems = items.filter((item) => item.type === "makeup");

        // Total value
        const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0);

        // Most worn items (placeholder - would need wear tracking)
        const itemsWithWears = items
            .map((item) => ({
                ...item,
                wears: looks.filter((look) => look.items.includes(item.id)).length,
            }))
            .sort((a, b) => b.wears - a.wears)
            .slice(0, 5);

        // Cost per wear
        const itemsWithCPW = itemsWithWears
            .filter((item) => item.price && item.wears > 0)
            .map((item) => ({
                ...item,
                cpw: (item.price || 0) / item.wears,
            }))
            .sort((a, b) => a.cpw - b.cpw)
            .slice(0, 5);

        // Category distribution
        const categoryDist = items.reduce((acc, item) => {
            const cat = item.category || "other";
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const categoryData = Object.entries(categoryDist)
            .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);

        // Color distribution
        const colorDist = items.reduce((acc, item) => {
            if (item.color) {
                const color = item.color.toLowerCase();
                acc[color] = (acc[color] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const colorData = Object.entries(colorDist)
            .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);

        // Monthly additions (last 6 months)
        const sixMonthsAgo = computedNow - 6 * 30 * 24 * 60 * 60 * 1000;
        const recentItems = items.filter((item) => item.dateAdded && item.dateAdded >= sixMonthsAgo);
        const monthlyData: Record<string, number> = {};
        recentItems.forEach((item) => {
            if (item.dateAdded) {
                const month = new Date(item.dateAdded).toLocaleDateString("en-US", { month: "short" });
                monthlyData[month] = (monthlyData[month] || 0) + 1;
            }
        });
        const monthlyChartData = Object.entries(monthlyData).map(([name, value]) => ({ name, value }));

        // Wishlist stats
        const wishlistCount = items.filter((item) => item.wishlist).length;
        const wishlistValue = items.filter((item) => item.wishlist).reduce((sum, item) => sum + (item.price || 0), 0);

        // Average costs
        const avgClothingCost = clothingItems.length > 0
            ? clothingItems.reduce((sum, item) => sum + (item.price || 0), 0) / clothingItems.length
            : 0;
        const avgMakeupCost = makeupItems.length > 0
            ? makeupItems.reduce((sum, item) => sum + (item.price || 0), 0) / makeupItems.length
            : 0;

        return {
            totalItems: items.length,
            totalValue,
            clothingCount: clothingItems.length,
            makeupCount: makeupItems.length,
            wishlistCount,
            wishlistValue,
            avgClothingCost,
            avgMakeupCost,
            mostWorn: itemsWithWears,
            bestValue: itemsWithCPW,
            categoryData,
            colorData,
            monthlyData: monthlyChartData,
        };
    }, [items, computedNow]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Closet Analytics</h3>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl p-4 border border-pink-500/20">
                    <div className="flex items-center gap-2 text-pink-400 mb-1">
                        <Star className="w-4 h-4" />
                        <span className="text-xs font-medium">Total Items</span>
                    </div>
                    <div className="text-2xl font-bold">{analytics.totalItems}</div>
                    <div className="text-xs text-white/70 mt-1">
                        {analytics.clothingCount} clothing, {analytics.makeupCount} makeup
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-medium">Total Value</span>
                    </div>
                    <div className="text-2xl font-bold">${analytics.totalValue.toFixed(0)}</div>
                    <div className="text-xs text-white/50 mt-1">
                        Avg: ${(analytics.totalValue / (analytics.totalItems || 1)).toFixed(0)}/item
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium">Wishlist</span>
                    </div>
                    <div className="text-2xl font-bold">{analytics.wishlistCount}</div>
                    <div className="text-xs text-white/90 font-medium mt-1">${analytics.wishlistValue.toFixed(0)} value</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-medium">Avg Cost</span>
                    </div>
                    <div className="text-xl font-bold">${analytics.avgClothingCost.toFixed(0)}</div>
                    <div className="text-xs text-white/90 font-medium mt-1">Makeup: ${analytics.avgMakeupCost.toFixed(0)}</div>
                </div>
            </div>

            {/* Most Worn Items */}
            {analytics.mostWorn.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Most Worn Items
                    </h4>
                    <div className="space-y-2">
                        {analytics.mostWorn.map((item, idx) => (
                            <div key={item.id} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{item.name}</div>
                                    <div className="text-xs text-white/90 font-medium">{item.category}</div>
                                </div>
                                <div className="text-sm font-medium text-purple-400">{item.wears}x</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Best Value Items (Cost per Wear) */}
            {analytics.bestValue.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        Best Value (Cost per Wear)
                    </h4>
                    <div className="space-y-2">
                        {analytics.bestValue.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{item.name}</div>
                                    <div className="text-xs text-white/70">
                                           ${(item.price || 0).toFixed(0)} ÷ {item.wears} wears
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-green-400">${item.cpw.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Distribution */}
            {analytics.categoryData.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        Category Distribution
                    </h4>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={(entry) => `${entry.name} (${entry.value})`}
                                >
                                    {analytics.categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(0,0,0,0.8)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "8px",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Color Palette */}
            {analytics.colorData.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-pink-400" />
                        Color Palette
                    </h4>
                    <div className="space-y-2">
                        {analytics.colorData.map((color, idx) => (
                            <div key={color.name} className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg border-2 border-white/20 flex-shrink-0"
                                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                />
                                <div className="flex-1">
                                    <div className="text-sm font-medium">{color.name}</div>
                                    <div className="text-xs text-white/90 font-medium">{color.value} items</div>
                                </div>
                                <div className="text-sm font-medium text-white/60">
                                    {Math.round((color.value / analytics.totalItems) * 100)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Monthly Additions */}
            {analytics.monthlyData.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        Recent Additions (Last 6 Months)
                    </h4>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.monthlyData}>
                                <XAxis dataKey="name" stroke="#ffffff40" style={{ fontSize: "12px" }} />
                                <YAxis stroke="#ffffff40" style={{ fontSize: "12px" }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(0,0,0,0.8)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Bar dataKey="value" fill="#a855f7" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
