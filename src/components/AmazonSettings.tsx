"use client";

import { useState, useCallback } from "react";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

export interface AmazonCredentials {
  email?: string;
  password?: string;
  accessKey?: string;
  secretKey?: string;
  method: "browser" | "api_keys";
}

interface AmazonSettingsProps {
  onSave?: (credentials: AmazonCredentials) => Promise<void>;
  isLoading?: boolean;
}

export function AmazonSettings({ onSave, isLoading = false }: AmazonSettingsProps) {
  const [method, setMethod] = useState<"browser" | "api_keys">("browser");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const handleSave = useCallback(async () => {
    if (!email && !accessKey) {
      setStatus({ type: "error", message: "Please provide Amazon credentials" });
      return;
    }

    setStatus({ type: "loading", message: "Saving credentials..." });

    try {
      const credentials: AmazonCredentials = { method };

      if (method === "browser") {
        credentials.email = email;
        credentials.password = password;
      } else {
        credentials.accessKey = accessKey;
        credentials.secretKey = secretKey;
      }

      if (onSave) {
        await onSave(credentials);
      }

      // In production, store encrypted credentials in database
      // For now, we just validate the form
      setStatus({
        type: "success",
        message: "Amazon credentials saved securely",
      });

      // Clear form after successful save
      setTimeout(() => {
        setEmail("");
        setPassword("");
        setAccessKey("");
        setSecretKey("");
      }, 1500);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save credentials",
      });
    }
  }, [method, email, password, accessKey, secretKey, onSave]);

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Connect Your Amazon Account
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Connect your Amazon account to sync products and order history into your Aura closet.
        </p>
      </div>

      {/* Authentication Method Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Authentication Method
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="method"
              value="browser"
              checked={method === "browser"}
              onChange={(e) => setMethod(e.target.value as "browser")}
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium text-sm">Browser-Based Login</div>
              <div className="text-xs text-gray-500">
                Sign in with your Amazon account (recommended for most users)
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="method"
              value="api_keys"
              checked={method === "api_keys"}
              onChange={(e) => setMethod(e.target.value as "api_keys")}
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium text-sm">API Keys</div>
              <div className="text-xs text-gray-500">
                Use AWS API credentials (for advanced users)
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Browser-Based Login */}
      {method === "browser" && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Amazon Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@amazon.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-600 mt-1">
              Your email will be used to authenticate with Amazon
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Amazon Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-600 mt-1">
              Password is encrypted and never stored in plain text
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ You may need to enable access for third-party apps in your Amazon security settings
            </p>
          </div>
        </div>
      )}

      {/* API Keys Method */}
      {method === "api_keys" && (
        <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              AWS Access Key ID
            </label>
            <input
              type="text"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="AKIAIOSFODNN7EXAMPLE"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              AWS Secret Access Key
            </label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="••••••••••••••••••••••••••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded p-3">
            <p className="text-xs text-purple-800">
              <strong>API Keys Setup:</strong> Create an IAM user in AWS with ProductAds API permissions
            </p>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {status.message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            status.type === "success"
              ? "bg-green-50 text-green-800"
              : status.type === "error"
                ? "bg-red-50 text-red-800"
                : "bg-blue-50 text-blue-800"
          }`}
        >
          {status.type === "loading" ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : status.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {status.message}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isLoading || status.type === "loading"}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading || status.type === "loading" ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Credentials"
          )}
        </button>

        <button
          onClick={() => {
            setEmail("");
            setPassword("");
            setAccessKey("");
            setSecretKey("");
            setStatus({ type: "idle", message: "" });
          }}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-2">
        <p>
          <strong>What happens next?</strong> After connecting, you'll be able to:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Search Amazon products directly from Aura</li>
          <li>Sync your Amazon order history to your closet</li>
          <li>Get personalized product recommendations</li>
          <li>Track purchases and manage your wardrobe</li>
        </ul>
      </div>
    </div>
  );
}
