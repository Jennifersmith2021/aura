"use client";

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { Share2, Lock, Globe, Copy, Check, Trash2, TrendingUp, Award } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "@/lib/toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface ShareLink {
  id: string;
  type: "outfit" | "progress" | "milestone";
  itemId: string;
  token: string;
  expiresAt: number | null;
  isPublic: boolean;
  views: number;
  createdAt: number;
}

export default function SocialSharing() {
  const { items, measurements } = useStore();
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [selectedType, setSelectedType] = useState<"outfit" | "progress" | "milestone">("outfit");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [expiresIn, setExpiresIn] = useState<number | null>(7); // days
  const [isPublic, setIsPublic] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const generateShareLink = () => {
    if (!selectedItem) {
      toast.error("Please select an item to share");
      return;
    }

    const token = Math.random().toString(36).substring(2, 15);
    const expiresAt = expiresIn ? Date.now() + expiresIn * 24 * 60 * 60 * 1000 : null;

    const newLink: ShareLink = {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedType,
      itemId: selectedItem,
      token,
      expiresAt,
      isPublic,
      views: 0,
      createdAt: Date.now(),
    };

    setShareLinks((prev) => [newLink, ...prev]);
    toast.success("Share link created!");
    setSelectedItem("");
  };

  const copyToClipboard = (link: ShareLink) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/share/${link.token}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(link.id);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const deleteShareLink = (id: string) => {
    setShareLinks((prev) => prev.filter((link) => link.id !== id));
    toast.success("Share link deleted");
    setShowDeleteConfirm(null);
  };

  const getItemName = (itemId: string) => {
    return items.find((i) => i.id === itemId)?.name || "Unknown Item";
  };

  const isLinkExpired = (expiresAt: number | null) => {
    return !!(expiresAt && expiresAt < Date.now());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Social & Sharing</h2>
        <p className="text-sm text-muted-foreground">
          Share your style journey with others
        </p>
      </div>

      {/* Share Type Selector */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
        <h3 className="font-semibold">Create Share Link</h3>

        <div className="grid grid-cols-3 gap-2">
          {(["outfit", "progress", "milestone"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={clsx(
                "px-3 py-2 rounded-lg font-medium text-sm transition-colors capitalize",
                selectedType === type
                  ? "bg-primary text-white"
                  : "bg-white/10 text-muted-foreground hover:bg-white/20"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Item Selection */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Select Item</label>
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
          >
            <option value="">Choose an item...</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Expiration & Privacy */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Expires In</label>
            <select
              value={expiresIn || "never"}
              onChange={(e) => setExpiresIn(e.target.value === "never" ? null : Number(e.target.value))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
            >
              <option value={1}>1 Day</option>
              <option value={7}>1 Week</option>
              <option value={30}>1 Month</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Visibility</label>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={clsx(
                "w-full px-3 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2",
                isPublic
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-white/10 text-muted-foreground hover:bg-white/20"
              )}
            >
              {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isPublic ? "Public" : "Private"}
            </button>
          </div>
        </div>

        <button
          onClick={generateShareLink}
          className="w-full px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Create Share Link
        </button>
      </div>

      {/* Share Links List */}
      <div className="space-y-3">
        <h3 className="font-semibold">Your Share Links</h3>
        {shareLinks.length > 0 ? (
          shareLinks.map((link) => (
            <div
              key={link.id}
              className={clsx(
                "bg-white/5 border rounded-xl p-4 space-y-3",
                isLinkExpired(link.expiresAt)
                  ? "border-red-500/30 opacity-60"
                  : "border-white/10"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-1 bg-primary/20 text-primary rounded capitalize">
                      {link.type}
                    </span>
                    {isLinkExpired(link.expiresAt) && (
                      <span className="text-xs font-medium px-2 py-1 bg-red-500/20 text-red-400 rounded">
                        Expired
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">
                    {getItemName(link.itemId)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {link.isPublic ? "Public" : "Private"} •{" "}
                    {link.views} views
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(link.id)}
                  className="text-muted-foreground hover:text-red-400 transition-colors p-1.5 hover:bg-white/5 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Copy Button */}
              <button
                onClick={() => copyToClipboard(link)}
                disabled={isLinkExpired(link.expiresAt)}
                className={clsx(
                  "w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
                  copiedLink === link.id
                    ? "bg-green-500/20 text-green-400"
                    : "bg-white/10 text-muted-foreground hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {copiedLink === link.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          ))
        ) : (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No share links yet. Create one to get started!
          </p>
        )}
      </div>

      {/* Leaderboard Section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Achievements</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Track your style milestones and progress
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <Award className="w-5 h-5 text-amber-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Closet Curator</p>
              <p className="text-xs text-muted-foreground">50 items in closet</p>
            </div>
            <span className="text-lg">🏆</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg opacity-50">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Progress Maker</p>
              <p className="text-xs text-muted-foreground">5cm waist reduction</p>
            </div>
            <span className="text-lg">🎯</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!showDeleteConfirm}
        title="Delete Share Link?"
        message="This will remove the link and it can no longer be accessed."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={() => {
          if (showDeleteConfirm) {
            deleteShareLink(showDeleteConfirm);
          }
        }}
        onCancel={() => setShowDeleteConfirm(null)}
      />
    </div>
  );
}
