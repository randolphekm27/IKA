import React from "react";
import { Photo } from "../types";
import { Download, Trash2, Calendar, User } from "lucide-react";

interface PhotoCardProps {
  key?: string | number;
  photo: Photo;
  onClick: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

export default function PhotoCard({ photo, onClick, onDelete, canDelete = false }: PhotoCardProps) {
  // Format dates elegantly
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "En direct";
    }
  };

  return (
    <div className="relative group overflow-hidden bg-black aspect-square cursor-pointer transition-transform duration-500 hover:scale-[1.01] animate-fade-in">
      {/* Actual image */}
      <img
        src={photo.image_url}
        alt={`Photo par ${photo.uploaded_by_name}`}
        referrerPolicy="no-referrer"
        onClick={onClick}
        className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:brightness-105"
        loading="lazy"
      />

      {/* Top action item (e.g., delete badge for photographe/organisateur) */}
      {canDelete && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Voulez-vous vraiment supprimer cette photo ?")) {
              onDelete();
            }
          }}
          className="absolute top-3 right-3 z-10 bg-black/80 hover:bg-black text-white p-2 rounded-none border border-neutral-800 backdrop-blur-sm transition-all hover:scale-105"
          title="Supprimer la photo"
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* Modern gradient / flat overlay */}
      <div 
        onClick={onClick}
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-left"
      >
        <div className="space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center space-x-1.5 text-[11px] font-mono uppercase tracking-widest text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>{photo.uploaded_by_name}</span>
          </div>
          
          <div className="flex justify-between items-center pt-1">
            <span className="text-[10px] font-mono text-neutral-400">
              {formatTime(photo.created_at)}
            </span>
            <div className="flex items-center space-x-1 text-[10px] font-mono text-neutral-400">
              <Download size={10} />
              <span>{photo.download_count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle mobile indicator always visible */}
      <div className="absolute bottom-2 left-2 md:hidden bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[9px] text-white font-mono rounded">
        {formatTime(photo.created_at)}
      </div>
    </div>
  );
}
