import React, { useState, useEffect } from "react";
import { Photo } from "../types";
import { X, Download, User, Calendar, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabase";

interface PhotoModalProps {
  photo: Photo | null;
  onClose: () => void;
  onDownloadIncrement?: (photoId: string, newCount: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function PhotoModal({
  photo,
  onClose,
  onDownloadIncrement,
  onNext,
  onPrev,
}: PhotoModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Keyboard navigation listeners
  useEffect(() => {
    if (!photo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && onNext) {
        onNext();
      } else if (e.key === "ArrowLeft" && onPrev) {
        onPrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photo, onNext, onPrev, onClose]);

  if (!photo) return null;

  const handleDownload = async () => {
    if (!photo) return;
    setDownloading(true);

    try {
      // 1. Create an invisible anchor to download the image file
      const link = document.createElement("a");
      link.href = photo.image_url;
      link.download = `IKA_LIVE_${photo.id}.jpg`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Direct download failed, falling back to basic redirect", err);
      const link = document.createElement("a");
      link.href = photo.image_url;
      link.target = "_blank";
      link.download = `ika-photo-${photo.id}.jpg`;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "En direct";
    }
  };

  // Mobile Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50 && onNext) {
      // Swipe left -> Next photo
      onNext();
    } else if (diff < -50 && onPrev) {
      // Swipe right -> Previous photo
      onPrev();
    }
    setTouchStartX(null);
  };

  // Close when clicking outside of the picture frame
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 animate-fade-in text-white select-none backdrop-blur-md"
    >
      {/* Top Header Controls */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-neutral-900 bg-black/40 z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
            Aperçu Haute Définition
          </span>
          <span className="text-xs font-semibold text-neutral-200">
            {photo.uploaded_by_name}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white p-2 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-all rounded-none cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Immersive Photo Display Area with touch listener and side chevrons */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleBackdropClick}
        className="flex-1 relative flex items-center justify-center p-2 md:p-4 max-h-[calc(100vh-140px)] overflow-hidden"
      >
        {/* Left Side Navigation Button (Desktop) */}
        {onPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="hidden md:flex items-center justify-center absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-neutral-800 bg-black/50 hover:bg-white hover:text-black hover:border-white text-neutral-300 cursor-pointer transition-all z-20"
            title="Précédent"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <img
          src={photo.image_url}
          alt={`Photo par ${photo.uploaded_by_name}`}
          referrerPolicy="no-referrer"
          className="max-w-full max-h-full object-contain animate-fade-in shadow-2xl border border-neutral-900 select-none pointer-events-auto z-10"
          onClick={(e) => e.stopPropagation()} // prevent modal closing on photo click
        />

        {/* Right Side Navigation Button (Desktop) */}
        {onNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="hidden md:flex items-center justify-center absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-neutral-800 bg-black/50 hover:bg-white hover:text-black hover:border-white text-neutral-300 cursor-pointer transition-all z-20"
            title="Suivant"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Bottom Information Desk */}
      <div className="p-4 md:p-6 border-t border-neutral-900 bg-black/60 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
        {/* Info badges */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-neutral-400">
          <div className="flex items-center space-x-2 bg-neutral-950 px-3 py-1.5 border border-neutral-900">
            <User size={12} className="text-neutral-500" />
            <span>Chargée par: <strong className="text-white">{photo.uploaded_by_name}</strong></span>
          </div>

          <div className="flex items-center space-x-2 bg-neutral-950 px-3 py-1.5 border border-neutral-900">
            <Calendar size={12} className="text-neutral-500" />
            <span>Date: <span className="text-white">{formatDate(photo.created_at)}</span></span>
          </div>

          <div className="flex items-center space-x-2 bg-neutral-950 px-3 py-1.5 border border-neutral-900">
            <Download size={12} className="text-neutral-500" />
            <span>Téléchargements: <span className="text-white">{photo.download_count || 0}</span></span>
          </div>
        </div>

        {/* Clear Call to Action */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-white text-black font-semibold hover:bg-neutral-200 transition-colors cursor-pointer select-none rounded-none"
        >
          {downloading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>Téléchargement...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Télécharger l'original</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
