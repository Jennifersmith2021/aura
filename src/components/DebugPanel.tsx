"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Trash2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
    timestamp: number;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    data?: any;
}

export function DebugPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all');

    useEffect(() => {
        // Listen for debug log events
        const handleLogEvent = (event: any) => {
            setLogs(event.detail.logs);
        };

        window.addEventListener('debug-log', handleLogEvent);
        return () => window.removeEventListener('debug-log', handleLogEvent);
    }, []);

    const filteredLogs = filter === 'all' 
        ? logs 
        : logs.filter(log => log.level === filter);

    const clearLogs = () => {
        const logger = (window as any).__debugLogs;
        if (logger) {
            logger.clear();
            setLogs([]);
        }
    };

    const copyLogs = () => {
        const logger = (window as any).__debugLogs;
        if (logger) {
            const formatted = logger.getFormattedLogs();
            navigator.clipboard.writeText(formatted);
            alert('Logs copied to clipboard!');
        }
    };

    const getLevelColor = (level: LogEntry['level']) => {
        switch (level) {
            case 'error': return 'text-red-600 dark:text-red-400';
            case 'warn': return 'text-yellow-600 dark:text-yellow-400';
            case 'info': return 'text-blue-600 dark:text-blue-400';
            case 'debug': return 'text-purple-600 dark:text-purple-400';
        }
    };

    const getLevelBg = (level: LogEntry['level']) => {
        switch (level) {
            case 'error': return 'bg-red-50 dark:bg-red-900/20';
            case 'warn': return 'bg-yellow-50 dark:bg-yellow-900/20';
            case 'info': return 'bg-blue-50 dark:bg-blue-900/20';
            case 'debug': return 'bg-purple-50 dark:bg-purple-900/20';
        }
    };

    return (
        <div className="fixed bottom-0 right-0 m-4 max-w-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-t-lg hover:bg-slate-700 transition-colors"
            >
                <span>🐛 Debug Logs ({logs.length})</span>
                <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {isOpen && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-b-lg shadow-lg max-h-96 overflow-y-auto">
                    {/* Filter buttons */}
                    <div className="sticky top-0 bg-slate-100 dark:bg-slate-800 p-2 flex gap-1 border-b border-slate-200 dark:border-slate-700 flex-wrap">
                        {(['all', 'info', 'warn', 'error', 'debug'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-2 py-1 text-xs font-medium rounded transition-colors",
                                    filter === f
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-400"
                                )}
                            >
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Logs */}
                    <div className="p-2 space-y-1 font-mono text-xs">
                        {filteredLogs.length === 0 ? (
                            <div className="text-gray-500 p-2">No logs yet...</div>
                        ) : (
                            filteredLogs.map((log, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "p-2 rounded border-l-2",
                                        getLevelBg(log.level),
                                        getLevelColor(log.level)
                                    )}
                                >
                                    <div className="font-semibold">
                                        {new Date(log.timestamp).toLocaleTimeString()} - {log.message}
                                    </div>
                                    {log.data && (
                                        <div className="text-xs mt-1 opacity-75 overflow-auto max-h-20">
                                            {typeof log.data === 'string'
                                                ? log.data
                                                : JSON.stringify(log.data, null, 2)}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Action buttons */}
                    {logs.length > 0 && (
                        <div className="flex gap-2 p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            <button
                                onClick={copyLogs}
                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            >
                                <Copy className="w-3 h-3" />
                                Copy
                            </button>
                            <button
                                onClick={clearLogs}
                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            >
                                <Trash2 className="w-3 h-3" />
                                Clear
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
