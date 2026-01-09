"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "@/lib/toast";

interface Image {
  id: string;
  url: string;
  title: string;
  date: number;
}

interface AdvancedPolishState {
  images: Image[];
  selectedImage: Image | null;
  viewMode: "grid" | "list";
}

export default function AdvancedPolish() {
  const [state, setState] = useState<AdvancedPolishState>({
    images: Array.from({ length: 12 }, (_, i) => ({
      id: `img-${i}`,
      url: `https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=400&h=400&fit=crop`,
      title: `Sample Photo ${i + 1}`,
      date: Date.now() - i * 86400000,
    })),
    selectedImage: null,
    viewMode: "grid",
  });

  const toggleViewMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      viewMode: prev.viewMode === "grid" ? "list" : "grid",
    }));
    toast.info(
      state.viewMode === "grid" ? "Switched to list view" : "Switched to grid view"
    );
  }, [state.viewMode]);

  const selectImage = useCallback((image: Image) => {
    setState((prev) => ({
      ...prev,
      selectedImage: image,
    }));
  }, []);

  const closeGallery = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedImage: null,
    }));
  }, []);

  const navigateImage = useCallback((direction: "prev" | "next") => {
    setState((prev) => {
      if (!prev.selectedImage) return prev;

      const currentIndex = prev.images.findIndex(
        (img) => img.id === prev.selectedImage?.id
      );
      let newIndex = currentIndex + (direction === "next" ? 1 : -1);

      if (newIndex < 0) newIndex = prev.images.length - 1;
      if (newIndex >= prev.images.length) newIndex = 0;

      return {
        ...prev,
        selectedImage: prev.images[newIndex],
      };
    });
  }, []);

  const deleteImage = useCallback((id: string) => {
    setState((prev) => {
      const newImages = prev.images.filter((img) => img.id !== id);
      return {
        ...prev,
        images: newImages,
        selectedImage:
          prev.selectedImage?.id === id ? null : prev.selectedImage,
      };
    });
    toast.success("Image deleted");
  }, []);

  const downloadImage = useCallback((image: Image) => {
    toast.info("Downloading image...");
    // In a real app, this would trigger an actual download
    toast.success(`Downloaded ${image.title}`);
  }, []);

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h2 className="text-2xl font-bold">Advanced Polish</h2>
        <p className="text-sm text-muted-foreground">
          Enhanced UI features and animations
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 border border-white/10 rounded-xl p-2 bg-white/5 w-fit">
        <button
          onClick={toggleViewMode}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            state.viewMode === "grid"
              ? "bg-primary text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Grid view"
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button
          onClick={toggleViewMode}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            state.viewMode === "list"
              ? "bg-primary text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="List view"
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* Image Gallery - Grid View */}
      {state.viewMode === "grid" && (
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          <AnimatePresence>
            {state.images.map((image, index) => (
              <motion.div
                key={image.id}
                layoutId={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-xl bg-white/5 aspect-square cursor-pointer"
                onClick={() => selectImage(image)}
              >
                <motion.img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteImage(image.id);
                    }}
                    className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    title="Delete image"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Image Gallery - List View */}
      {state.viewMode === "list" && (
        <motion.div layout className="space-y-2">
          <AnimatePresence>
            {state.images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer flex gap-3"
                onClick={() => selectImage(image)}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {image.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(image.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(image);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteImage(image.id);
                    }}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Fullscreen Gallery */}
      <AnimatePresence>
        {state.selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={closeGallery}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl"
            >
              <motion.img
                layoutId={state.selectedImage.id}
                src={state.selectedImage.url}
                alt={state.selectedImage.title}
                className="w-full rounded-xl"
              />

              {/* Navigation */}
              <button
                onClick={() => navigateImage("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                title="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={() => navigateImage("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                title="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Close Button */}
              <button
                onClick={closeGallery}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                title="Close gallery"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Info */}
              <div className="mt-4 text-center">
                <p className="text-white font-semibold">
                  {state.selectedImage.title}
                </p>
                <p className="text-white/60 text-sm">
                  {state.images.findIndex(
                    (img) => img.id === state.selectedImage?.id
                  ) + 1}{" "}
                  of {state.images.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2"
        >
          <h3 className="font-semibold">Smooth Animations</h3>
          <p className="text-xs text-muted-foreground">
            Framer Motion powers fluid transitions and interactive elements
            throughout the app.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2"
        >
          <h3 className="font-semibold">Image Gallery</h3>
          <p className="text-xs text-muted-foreground">
            Toggle between grid and list views with fullscreen preview and
            navigation controls.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2"
        >
          <h3 className="font-semibold">Loading Skeletons</h3>
          <p className="text-xs text-muted-foreground">
            Placeholder components provide better perceived performance during
            data loading.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2"
        >
          <h3 className="font-semibold">Responsive Design</h3>
          <p className="text-xs text-muted-foreground">
            All components adapt gracefully to mobile, tablet, and desktop
            viewports.
          </p>
        </motion.div>
      </div>

      {/* Animation Showcase */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold">Animation Showcase</h3>
        <div className="flex gap-4 flex-wrap">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
              }}
              className="w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-lg flex items-center justify-center"
            >
              <span className="text-2xl font-bold">✨</span>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Animated elements catch attention and guide user focus throughout
          the interface.
        </p>
      </div>
    </div>
  );
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
