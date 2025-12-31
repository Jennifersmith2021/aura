"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Droplets, Plus, Trash2, Edit3, X, Sun, Moon, Calendar, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import type { SkincareProduct } from "@/types";

const MILLIS_IN_DAY = 1000 * 60 * 60 * 24;

function computeExpiration(product: SkincareProduct): { status: "good" | "warning" | "expired" | null; daysLeft: number | null } {
    if (!product.dateOpened || !product.expirationMonths) {
        return { status: null, daysLeft: null };
    }

    const elapsed = Date.now() - product.dateOpened;
    const duration = product.expirationMonths * 30 * MILLIS_IN_DAY;
    const remaining = duration - elapsed;
    const daysLeft = Math.ceil(remaining / MILLIS_IN_DAY);

    const status = remaining < 0 ? "expired" : remaining < 30 * MILLIS_IN_DAY ? "warning" : "good";
    return { status, daysLeft: Math.max(daysLeft, 0) };
}

export default function SkincareRoutine() {
    const { skincareProducts, addSkincareProduct, removeSkincareProduct, updateSkincareProduct } = useStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [viewRoutine, setViewRoutine] = useState<"am" | "pm" | "both">("both");

    // Form state
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [type, setType] = useState<any>("moisturizer");
    const [dateOpened, setDateOpened] = useState("");
    const [expirationMonths, setExpirationMonths] = useState("");
    const [routine, setRoutine] = useState<"am" | "pm" | "both">("pm");
    const [order, setOrder] = useState("");
    const [note, setNote] = useState("");

    const resetForm = () => {
        setName("");
        setBrand("");
        setType("moisturizer");
        setDateOpened("");
        setExpirationMonths("");
        setRoutine("pm");
        setOrder("");
        setNote("");
        setEditingProduct(null);
    };

    const handleAdd = () => {
        const product = {
            id: crypto.randomUUID(),
            name: name.trim(),
            brand: brand.trim() || undefined,
            type,
            dateOpened: dateOpened ? new Date(dateOpened).getTime() : undefined,
            expirationMonths: expirationMonths ? parseInt(expirationMonths) : undefined,
            routine,
            order: order ? parseInt(order) : (skincareProducts.length + 1),
            note: note.trim() || undefined,
        };
        addSkincareProduct(product);
        resetForm();
        setShowAddModal(false);
    };

    const handleEdit = (productId: string) => {
        const product = skincareProducts.find((p) => p.id === productId);
        if (!product) return;

        setName(product.name);
        setBrand(product.brand || "");
        setType(product.type);
        setDateOpened(product.dateOpened ? new Date(product.dateOpened).toISOString().split("T")[0] : "");
        setExpirationMonths(product.expirationMonths?.toString() || "");
        setRoutine(product.routine);
        setOrder(product.order.toString());
        setNote(product.note || "");
        setEditingProduct(productId);
        setShowAddModal(true);
    };

    const handleUpdate = () => {
        if (!editingProduct) return;

        updateSkincareProduct(editingProduct, {
            name: name.trim(),
            brand: brand.trim() || undefined,
            type,
            dateOpened: dateOpened ? new Date(dateOpened).getTime() : undefined,
            expirationMonths: expirationMonths ? parseInt(expirationMonths) : undefined,
            routine,
            order: order ? parseInt(order) : 1,
            note: note.trim() || undefined,
        });
        resetForm();
        setShowAddModal(false);
    };

    // Filter products by routine
    const filteredProducts = skincareProducts.filter((p) => {
        if (viewRoutine === "both") return true;
        return p.routine === viewRoutine || p.routine === "both";
    });

    // Group by routine for display
    const amProducts = skincareProducts.filter((p) => p.routine === "am" || p.routine === "both").sort((a, b) => a.order - b.order);
    const pmProducts = skincareProducts.filter((p) => p.routine === "pm" || p.routine === "both").sort((a, b) => a.order - b.order);

    const productTypes = [
        { value: "cleanser", label: "Cleanser" },
        { value: "toner", label: "Toner" },
        { value: "serum", label: "Serum" },
        { value: "moisturizer", label: "Moisturizer" },
        { value: "sunscreen", label: "Sunscreen" },
        { value: "exfoliant", label: "Exfoliant" },
        { value: "mask", label: "Mask" },
        { value: "eye-cream", label: "Eye Cream" },
        { value: "oil", label: "Oil" },
        { value: "treatment", label: "Treatment" },
        { value: "other", label: "Other" },
    ];

    const ProductCard = ({ product }: { product: SkincareProduct }) => {
        const { status, daysLeft } = computeExpiration(product);

        return (
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-purple-500/50 transition-colors">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-300 font-bold text-sm">
                        {product.order}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm">{product.name}</h4>
                        {product.brand && <p className="text-xs text-white/90 font-medium">{product.brand}</p>}
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-300 capitalize">
                                {product.type.replace("-", " ")}
                            </span>
                            {status && (
                                <span className={clsx(
                                    "px-2 py-0.5 rounded text-xs flex items-center gap-1",
                                    status === "good" && "bg-green-500/20 text-green-300",
                                    status === "warning" && "bg-yellow-500/20 text-yellow-300",
                                    status === "expired" && "bg-red-500/20 text-red-300"
                                )}>
                                    {status === "expired" ? (
                                        <>
                                            <AlertCircle className="w-3 h-3" />
                                            Expired
                                        </>
                                    ) : (
                                        `${daysLeft}d left`
                                    )}
                                </span>
                            )}
                        </div>
                        {product.note && <p className="text-xs text-white/90 font-medium mt-1">{product.note}</p>}
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => handleEdit(product.id)}
                            className="p-1.5 hover:bg-blue-500/20 rounded transition-colors text-blue-400"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => removeSkincareProduct(product.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-red-400"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-400" />
                    Skincare Routine
                </h3>
                <button
                    onClick={() => {
                        resetForm();
                        setShowAddModal(true);
                    }}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {/* Routine Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setViewRoutine("am")}
                    className={clsx(
                        "flex-1 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2",
                        viewRoutine === "am"
                            ? "bg-yellow-500 text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                >
                    <Sun className="w-4 h-4" />
                    AM
                </button>
                <button
                    onClick={() => setViewRoutine("pm")}
                    className={clsx(
                        "flex-1 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2",
                        viewRoutine === "pm"
                            ? "bg-indigo-500 text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                >
                    <Moon className="w-4 h-4" />
                    PM
                </button>
                <button
                    onClick={() => setViewRoutine("both")}
                    className={clsx(
                        "flex-1 py-2 rounded-lg font-medium text-sm transition-colors",
                        viewRoutine === "both"
                            ? "bg-purple-500 text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                >
                    Both
                </button>
            </div>

            {/* Products */}
            {skincareProducts.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                    <Droplets className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/80 font-medium text-sm">No skincare products added yet</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {(viewRoutine === "both" || viewRoutine === "am") && amProducts.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-yellow-400 flex items-center gap-2 mb-3">
                                <Sun className="w-4 h-4" />
                                Morning Routine
                            </h4>
                            <div className="space-y-2">
                                {amProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    )}

                    {(viewRoutine === "both" || viewRoutine === "pm") && pmProducts.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-indigo-400 flex items-center gap-2 mb-3">
                                <Moon className="w-4 h-4" />
                                Evening Routine
                            </h4>
                            <div className="space-y-2">
                                {pmProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowAddModal(false);
                            resetForm();
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Droplets className="w-5 h-5 text-blue-400" />
                                    {editingProduct ? "Edit Product" : "Add Product"}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Hyaluronic Acid Serum"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Brand */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Brand</label>
                                    <input
                                        type="text"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        placeholder="e.g., CeraVe, The Ordinary..."
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Type *</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {productTypes.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Routine */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Routine *</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setRoutine("am")}
                                            className={clsx(
                                                "py-2 rounded-lg text-sm font-medium transition-colors",
                                                routine === "am"
                                                    ? "bg-yellow-500 text-white"
                                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                            )}
                                        >
                                            AM
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRoutine("pm")}
                                            className={clsx(
                                                "py-2 rounded-lg text-sm font-medium transition-colors",
                                                routine === "pm"
                                                    ? "bg-indigo-500 text-white"
                                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                            )}
                                        >
                                            PM
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRoutine("both")}
                                            className={clsx(
                                                "py-2 rounded-lg text-sm font-medium transition-colors",
                                                routine === "both"
                                                    ? "bg-purple-500 text-white"
                                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                            )}
                                        >
                                            Both
                                        </button>
                                    </div>
                                </div>

                                {/* Order */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Step Order</label>
                                    <input
                                        type="number"
                                        value={order}
                                        onChange={(e) => setOrder(e.target.value)}
                                        placeholder="1 for first step, 2 for second..."
                                        min="1"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Date Opened */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Date Opened</label>
                                    <input
                                        type="date"
                                        value={dateOpened}
                                        onChange={(e) => setDateOpened(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Expiration Months */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Expires After (months)</label>
                                    <input
                                        type="number"
                                        value={expirationMonths}
                                        onChange={(e) => setExpirationMonths(e.target.value)}
                                        placeholder="e.g., 6, 12"
                                        min="1"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Note</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Usage notes, patch test results..."
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowAddModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={editingProduct ? handleUpdate : handleAdd}
                                        disabled={!name.trim()}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {editingProduct ? "Update" : "Add"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
