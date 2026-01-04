"use client";

import { useState, useEffect } from "react";
import { Settings, Save, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiSettings {
    googleApiKey?: string;
    localRetailerAdapter?: string;
    useLocalAdapter?: boolean;
}

export function SettingsPage() {
    const [settings, setSettings] = useState<ApiSettings>({});
    const [saved, setSaved] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [verifying, setVerifying] = useState(false);
    const [verifyStatus, setVerifyStatus] = useState<"idle" | "ok" | "error">("idle");
    const [verifyMessage, setVerifyMessage] = useState<string>("");

    useEffect(() => {
        // Load settings from localStorage
        const stored = localStorage.getItem('appSettings');
        if (stored) {
            try {
                setSettings(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse settings:', e);
            }
        }
    }, []);

    // Auto-verify API key when it changes (debounced)
    useEffect(() => {
        if (!settings.googleApiKey || settings.googleApiKey.length < 10) {
            setVerifyStatus("idle");
            setVerifyMessage("");
            return;
        }

        const handle = setTimeout(() => {
            verifyApiKey(settings.googleApiKey as string, true);
        }, 600);

        return () => clearTimeout(handle);
    }, [settings.googleApiKey]);

    const handleSave = () => {
        try {
            localStorage.setItem('appSettings', JSON.stringify(settings));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            setErrors({ general: 'Failed to save settings' });
        }
    };

    const handleChange = (key: keyof ApiSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const verifyApiKey = async (key: string, silent = false) => {
        try {
            setVerifying(!silent);
            setVerifyStatus("idle");
            setVerifyMessage("");

            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-google-api-key': key
                },
                body: JSON.stringify({
                    type: 'json',
                    prompt: 'Return {"ok":true}'
                })
            });

            if (!res.ok) {
                const text = await res.text();
                setVerifyStatus("error");
                setVerifyMessage(`API responded with ${res.status}: ${text || 'Unknown error'}`);
                return;
            }

            const data = await res.json();
            if (data && (data.ok === true || data.recommendations || data.result)) {
                setVerifyStatus("ok");
                setVerifyMessage('API key verified successfully.');
            } else {
                setVerifyStatus("error");
                setVerifyMessage('Unexpected response. Please double-check the key.');
            }
        } catch (err: any) {
            setVerifyStatus("error");
            setVerifyMessage(err?.message || 'Verification failed.');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>

            {/* Status Messages */}
            {saved && (
                <div className="flex items-center gap-2 p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle className="w-5 h-5" />
                    Settings saved successfully!
                </div>
            )}

            {errors.general && (
                <div className="flex items-center gap-2 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-300 dark:border-red-800">
                    <AlertCircle className="w-5 h-5" />
                    {errors.general}
                </div>
            )}

            {/* API Configuration Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span>🔑</span>
                    API Configuration
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure API keys for PDF enrichment and product search features.
                </p>

                {/* Google API Key */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">
                        Google Gemini API Key
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Used for intelligent PDF parsing and product identification. Get one at <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ai.google.dev</a>
                    </p>
                    <div className="relative">
                        <input
                            type={showKey ? "text" : "password"}
                            value={settings.googleApiKey || ''}
                            onChange={(e) => handleChange('googleApiKey', e.target.value)}
                            placeholder="Enter your Google API key"
                            className={cn(
                                "w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg",
                                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                                errors.googleApiKey
                                    ? "border-red-300 dark:border-red-700"
                                    : "border-slate-300 dark:border-slate-600"
                            )}
                        />
                        <button
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => settings.googleApiKey && verifyApiKey(settings.googleApiKey)}
                            disabled={!settings.googleApiKey || settings.googleApiKey.length < 10 || verifying}
                            className={cn(
                                "px-3 py-2 text-xs font-semibold rounded border",
                                verifying
                                    ? "bg-gray-200 text-gray-500 border-gray-300 cursor-wait"
                                    : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                            )}
                        >
                            {verifying ? 'Verifying…' : 'Verify Key'}
                        </button>
                        {verifyStatus === 'ok' && (
                            <span className="text-sm text-emerald-600">✅ {verifyMessage || 'Verified'}</span>
                        )}
                        {verifyStatus === 'error' && (
                            <span className="text-sm text-red-600">❌ {verifyMessage || 'Verification failed'}</span>
                        )}
                    </div>
                    {errors.googleApiKey && (
                        <p className="text-xs text-red-600 dark:text-red-400">{errors.googleApiKey}</p>
                    )}
                </div>

                {/* Local Retailer Adapter */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">
                        Local Retailer Adapter URL
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Optional: URL to your local product search adapter (e.g., http://localhost:8001)
                    </p>
                    <input
                        type="text"
                        value={settings.localRetailerAdapter || ''}
                        onChange={(e) => handleChange('localRetailerAdapter', e.target.value)}
                        placeholder="http://localhost:8001"
                        className={cn(
                            "w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500",
                            errors.localRetailerAdapter
                                ? "border-red-300 dark:border-red-700"
                                : "border-slate-300 dark:border-slate-600"
                        )}
                    />
                </div>

                {/* Use Local Adapter */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="useLocal"
                        checked={settings.useLocalAdapter || false}
                        onChange={(e) => handleChange('useLocalAdapter', e.target.checked)}
                        className="w-4 h-4 rounded"
                    />
                    <label htmlFor="useLocal" className="text-sm font-medium cursor-pointer">
                        Prefer local adapter over Gemini API
                    </label>
                </div>
            </div>

            {/* Debug Section */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span>🐛</span>
                    Debug Information
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check the debug panel (bottom right) for detailed logs during PDF upload and processing.
                </p>
                <div className="text-xs bg-slate-900 text-slate-100 p-3 rounded font-mono max-h-40 overflow-y-auto">
                    <div>Current Settings:</div>
                    <div className="text-purple-300">{JSON.stringify(settings, null, 2)}</div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    <Save className="w-5 h-5" />
                    Save Settings
                </button>
            </div>
        </div>
    );
}
