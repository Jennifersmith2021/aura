"use client";

import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/hooks/useStore";
import { Bell, X, Check, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationCenter() {
  const { notifications, removeNotification, markNotificationAsRead, notificationSettings, updateNotificationSettings } = useStore();
  const [showPanel, setShowPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleDismiss = (id: string) => {
    removeNotification(id);
  };

  return (
    <div className="relative">
      {/* Notification Bell Icon */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-12 w-96 max-h-96 bg-slate-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-800">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="p-4 bg-slate-800/50 border-b border-white/10 space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.affirmations}
                    onChange={(e) =>
                      updateNotificationSettings({ affirmations: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Affirmations</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.workouts}
                    onChange={(e) =>
                      updateNotificationSettings({ workouts: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Workouts</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.supplements}
                    onChange={(e) =>
                      updateNotificationSettings({ supplements: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Supplements</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.push}
                    onChange={(e) =>
                      updateNotificationSettings({ push: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Push Notifications</span>
                </label>
              </div>
            )}

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-80 space-y-2 p-2">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      notif.read
                        ? "bg-white/5 border-white/10"
                        : "bg-blue-500/20 border-blue-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {new Date(notif.dateCreated).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-green-400" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDismiss(notif.id)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
