"use client";

import { useState } from "react";
import { Upload, Check, AlertCircle, Loader2, FileText, File } from "lucide-react";
import { parseAmazonCSV } from "@/utils/amazonParser";
import { parsePDFReceipt } from "@/utils/pdfParser";
import { useStore } from "@/hooks/useStore";
import { ConfirmImportModal } from "./ConfirmImportModal";
import { Item } from "@/types";
import { cn } from "@/lib/utils";

type ImportType = "csv" | "pdf";

export function AmazonImport() {
    const { addItem } = useStore();
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [importType, setImportType] = useState<ImportType>("csv");
    const [pendingItems, setPendingItems] = useState<Item[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: ImportType) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setStatus("idle");
        setMessage("");

        try {
            let items;
            
            if (type === "csv") {
                items = await parseAmazonCSV(file);
            } else {
                items = await parsePDFReceipt(file);
            }

            if (items.length === 0) {
                setStatus("error");
                setMessage(`No relevant clothing or makeup items found in this ${type.toUpperCase()}.`);
                setIsUploading(false);
                return;
            }

            // Show confirmation modal
            setPendingItems(items);
            setShowConfirm(true);
            setIsUploading(false);

        } catch (error) {
            console.error("Import failed:", error);
            setStatus("error");
            
            // Get debug logs for error message
            const logger = (window as any).__debugLogs;
            const logs = logger ? logger.getLogs() : [];
            const logsSummary = logs.slice(-10).map(l => `${l.message}`).join('\n');
            
            setMessage(`Failed to parse ${type.toUpperCase()}.\n\nDebug info:\n${logsSummary || 'Check debug panel (bottom right) for details'}`);
            setIsUploading(false);
        } finally {
            // Reset file input
            e.target.value = "";
        }
    };

    const handleConfirmImport = async (items: Item[]) => {
        try {
            console.log('Confirming import of items:', items);
            for (const item of items) {
                await addItem(item);
                console.log('Added item:', item);
            }

            setStatus("success");
            const itemNames = items.map(i => i.name).join(', ');
            setMessage(`✅ Successfully imported ${items.length} item(s): ${itemNames}. Refreshing...`);
            setShowConfirm(false);
            
            // Force page refresh to show new items
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error("Failed to add items:", error);
            setStatus("error");
            setMessage("Failed to add items to inventory.");
            setShowConfirm(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                    <Upload className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">📄 File Upload Import</h3>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
                            CSV or PDF
                        </span>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                        Upload CSV order history or individual PDF receipts from your computer.
                    </p>

                    {/* Import Type Selector */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setImportType("csv")}
                            className={cn(
                                "flex-1 px-4 py-3 rounded-lg text-sm font-bold transition-all border-2 flex items-center justify-center gap-2 shadow-sm",
                                importType === "csv"
                                    ? "bg-blue-600 border-blue-600 text-white scale-105"
                                    : "bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 hover:border-blue-400 text-blue-900 dark:text-blue-100"
                            )}
                        >
                            <File className="w-5 h-5" />
                            CSV File
                        </button>
                        <button
                            onClick={() => setImportType("pdf")}
                            className={cn(
                                "flex-1 px-4 py-3 rounded-lg text-sm font-bold transition-all border-2 flex items-center justify-center gap-2 shadow-sm",
                                importType === "pdf"
                                    ? "bg-blue-600 border-blue-600 text-white scale-105"
                                    : "bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 hover:border-blue-400 text-blue-900 dark:text-blue-100"
                            )}
                        >
                            <FileText className="w-5 h-5" />
                            PDF Receipt
                        </button>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className={cn(
                            "cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all shadow-md",
                            isUploading
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
                        )}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing and finding product images...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Click to Upload {importType === "csv" ? "CSV" : "PDF"} File
                                </>
                            )}
                            <input
                                type="file"
                                accept={importType === "csv" ? ".csv" : ".pdf"}
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, importType)}
                                disabled={isUploading}
                            />
                        </label>

                        {status === "success" && (
                            <div className="flex items-center gap-2 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 p-3 rounded-lg font-medium border border-emerald-300 dark:border-emerald-800">
                                <Check className="w-5 h-5" />
                                {message}
                            </div>
                        )}

                        {status === "error" && (
                            <div className="flex items-center gap-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg font-medium border border-red-300 dark:border-red-800">
                                <AlertCircle className="w-5 h-5" />
                                {message}
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    {importType === "csv" ? (
                        <div className="mt-4 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            <p className="font-medium mb-1">📥 How to get your CSV:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Go to Amazon.com → Returns & Orders</li>
                                <li>Click &quot;Download order reports&quot;</li>
                                <li>Select date range and download CSV</li>
                                <li>Upload the file here</li>
                            </ol>
                        </div>
                    ) : (
                        <div className="mt-4 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            <p className="font-medium mb-1">📄 PDF Receipt Tips:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Works with Amazon order confirmation PDFs</li>
                                <li>Download receipts from your email or Amazon account</li>
                                <li>One receipt at a time for best results</li>
                                <li>Processing may take a few seconds</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmImportModal
                items={pendingItems}
                isOpen={showConfirm}
                onConfirm={handleConfirmImport}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    );
}
