"use client";

import { useState } from "react";
import { Ruler, Search } from "lucide-react";
import clsx from "clsx";

// Size conversion data
const dressSizes = {
    us: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
    uk: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26],
    eu: [32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54],
};

const shoeSizes = {
    us: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12],
    uk: [2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5],
    eu: [35, 35.5, 36, 37, 37.5, 38, 38.5, 39, 40, 40.5, 41, 42, 42.5, 43, 44],
};

const braSizes = {
    us: ["32A", "32B", "32C", "32D", "34A", "34B", "34C", "34D", "34DD", "36A", "36B", "36C", "36D", "36DD", "38A", "38B", "38C", "38D", "38DD"],
    uk: ["32A", "32B", "32C", "32D", "34A", "34B", "34C", "34D", "34E", "36A", "36B", "36C", "36D", "36E", "38A", "38B", "38C", "38D", "38E"],
    eu: ["70A", "70B", "70C", "70D", "75A", "75B", "75C", "75D", "75E", "80A", "80B", "80C", "80D", "80E", "85A", "85B", "85C", "85D", "85E"],
};

const ringSize = {
    us: [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    uk: ["F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
    eu: [44, 45, 46, 47, 49, 50, 51, 52, 54, 55, 57, 58, 59, 60, 62],
    diameter: [14.1, 14.5, 14.9, 15.3, 15.7, 16.1, 16.5, 16.9, 17.3, 17.7, 18.2, 18.6, 19.0, 19.4, 19.8],
};

type Category = "dress" | "shoe" | "bra" | "ring";

export default function SizeConversionChart() {
    const [activeCategory, setActiveCategory] = useState<Category>("dress");
    const [searchSize, setSearchSize] = useState("");
    const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

    const handleSearch = () => {
        if (!searchSize.trim()) {
            setHighlightIndex(null);
            return;
        }

        const search = searchSize.toLowerCase().trim();
        let foundIndex: number | null = null;

        switch (activeCategory) {
            case "dress":
                foundIndex = dressSizes.us.findIndex((s) => s.toString() === search);
                if (foundIndex === -1) foundIndex = dressSizes.uk.findIndex((s) => s.toString() === search);
                if (foundIndex === -1) foundIndex = dressSizes.eu.findIndex((s) => s.toString() === search);
                break;
            case "shoe":
                foundIndex = shoeSizes.us.findIndex((s) => s.toString() === search);
                if (foundIndex === -1) foundIndex = shoeSizes.uk.findIndex((s) => s.toString() === search);
                if (foundIndex === -1) foundIndex = shoeSizes.eu.findIndex((s) => s.toString() === search);
                break;
            case "bra":
                foundIndex = braSizes.us.findIndex((s) => s.toLowerCase() === search);
                if (foundIndex === -1) foundIndex = braSizes.uk.findIndex((s) => s.toLowerCase() === search);
                if (foundIndex === -1) foundIndex = braSizes.eu.findIndex((s) => s.toLowerCase() === search);
                break;
            case "ring":
                foundIndex = ringSize.us.findIndex((s) => s.toString() === search);
                if (foundIndex === -1) foundIndex = ringSize.uk.findIndex((s) => s.toLowerCase() === search);
                if (foundIndex === -1) foundIndex = ringSize.eu.findIndex((s) => s.toString() === search);
                break;
        }

        setHighlightIndex(foundIndex !== -1 ? foundIndex : null);
    };

    const renderTable = () => {
        switch (activeCategory) {
            case "dress":
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-3 py-2 text-left text-xs font-medium text-white/60">US</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-white/60">UK</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-white/60">EU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dressSizes.us.map((_, index) => (
                                    <tr
                                        key={index}
                                        className={clsx(
                                            "border-b border-white/5 hover:bg-white/5 transition-colors",
                                            highlightIndex === index && "bg-pink-500/20"
                                        )}
                                    >
                                        <td className="px-3 py-2 text-white/90">{dressSizes.us[index]}</td>
                                        <td className="px-3 py-2 text-white/90">{dressSizes.uk[index]}</td>
                                        <td className="px-3 py-2 text-white/90">{dressSizes.eu[index]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case "shoe":
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-3 py-2 text-left text-xs font-medium text-white/60">US</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-white/60">UK</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-white/60">EU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shoeSizes.us.map((_, index) => (
                                    <tr
                                        key={index}
                                        className={clsx(
                                            "border-b border-white/5 hover:bg-white/5 transition-colors",
                                            highlightIndex === index && "bg-pink-500/20"
                                        )}
                                    >
                                        <td className="px-3 py-2">{shoeSizes.us[index]}</td>
                                        <td className="px-3 py-2">{shoeSizes.uk[index]}</td>
                                        <td className="px-3 py-2">{shoeSizes.eu[index]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case "bra":
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-3 py-2 text-left text-xs font-medium text-white/60">US</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-white/60">UK</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-white/60">EU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {braSizes.us.map((_, index) => (
                                    <tr
                                        key={index}
                                        className={clsx(
                                            "border-b border-white/5 hover:bg-white/5 transition-colors",
                                            highlightIndex === index && "bg-pink-500/20"
                                        )}
                                    >
                                        <td className="px-3 py-2">{braSizes.us[index]}</td>
                                        <td className="px-3 py-2">{braSizes.uk[index]}</td>
                                        <td className="px-3 py-2">{braSizes.eu[index]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case "ring":
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-3 py-2 text-left text-xs font-medium text-white/60">US</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-white/60">UK</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-white/60">EU</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-white/60">Diameter (mm)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ringSize.us.map((_, index) => (
                                    <tr
                                        key={index}
                                        className={clsx(
                                            "border-b border-white/5 hover:bg-white/5 transition-colors",
                                            highlightIndex === index && "bg-pink-500/20"
                                        )}
                                    >
                                        <td className="px-3 py-2">{ringSize.us[index]}</td>
                                        <td className="px-3 py-2">{ringSize.uk[index]}</td>
                                        <td className="px-3 py-2">{ringSize.eu[index]}</td>
                                        <td className="px-3 py-2">{ringSize.diameter[index]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-blue-400" />
                    Size Conversion Chart
                </h3>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                    onClick={() => {
                        setActiveCategory("dress");
                        setSearchSize("");
                        setHighlightIndex(null);
                    }}
                    className={clsx(
                        "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                        activeCategory === "dress"
                            ? "bg-blue-500 text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                >
                    👗 Dress
                </button>
                <button
                    onClick={() => {
                        setActiveCategory("shoe");
                        setSearchSize("");
                        setHighlightIndex(null);
                    }}
                    className={clsx(
                        "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                        activeCategory === "shoe"
                            ? "bg-blue-500 text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                >
                    👠 Shoes
                </button>
                <button
                    onClick={() => {
                        setActiveCategory("bra");
                        setSearchSize("");
                        setHighlightIndex(null);
                    }}
                    className={clsx(
                        "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                        activeCategory === "bra"
                            ? "bg-blue-500 text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                >
                    👙 Bra
                </button>
                <button
                    onClick={() => {
                        setActiveCategory("ring");
                        setSearchSize("");
                        setHighlightIndex(null);
                    }}
                    className={clsx(
                        "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                        activeCategory === "ring"
                            ? "bg-blue-500 text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                >
                    💍 Ring
                </button>
            </div>

            {/* Search */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={searchSize}
                        onChange={(e) => setSearchSize(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder={`Search ${activeCategory} size...`}
                        className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                    Find
                </button>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-xs text-blue-300">
                    {activeCategory === "dress" && "Women's dress sizes. Enter any size to find equivalents across regions."}
                    {activeCategory === "shoe" && "Women's shoe sizes. Note: sizing can vary by brand and style."}
                    {activeCategory === "bra" && "Bra sizes. Band size (number) + Cup size (letter). UK uses E instead of DD."}
                    {activeCategory === "ring" && "Ring sizes with inner diameter. Use a ring sizer for accuracy."}
                </p>
            </div>

            {/* Table */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                {renderTable()}
            </div>

            {highlightIndex !== null && (
                <div className="bg-pink-500/20 border border-pink-500/30 rounded-lg p-3 text-center">
                    <p className="text-sm text-pink-300">✨ Size highlighted in table above</p>
                </div>
            )}
        </div>
    );
}
