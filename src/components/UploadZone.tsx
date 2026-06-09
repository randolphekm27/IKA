import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import imageCompression from "browser-image-compression";
import { supabase } from "../lib/supabase";

interface UploadZoneProps {
  eventId: string;
  onUploadSuccess: (newPhoto: any) => void;
  uploadedBy?: string;
  uploadedByName?: string;
}

// Client-side image compression using browser-image-compression
const compressImage = async (file: File): Promise<File> => {
  if (!file.type.startsWith("image/")) {
    return file;
  }
  
  const options = {
    maxSizeMB: 1, // Compress to max 1MB
    maxWidthOrHeight: 1920, // Resize if exceeds 1920px
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch (err) {
    console.warn("browser-image-compression failed, using original file", err);
    return file;
  }
};

export default function UploadZone({ eventId, onUploadSuccess, uploadedBy, uploadedByName }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processAndUploadFiles = async (files: FileList) => {
    if (files.length === 0) return;
    setUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const totalFiles = files.length;
    let successCount = 0;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      
      try {
        setProgress(`Compression du fichier ${i + 1}/${totalFiles}...`);
        
        // 1. Compress the image client-side to keep hosting lightweight
        const compressedFile = await compressImage(file);
        
        const sizeDiffPercentage = Math.round(((file.size - compressedFile.size) / file.size) * 100);
        const originalSizeMb = (file.size / (1024 * 1024)).toFixed(2);
        const compressedSizeMb = (compressedFile.size / (1024 * 1024)).toFixed(2);
        
        setProgress(
          `Upload en cours d'envoi (${i + 1}/${totalFiles}): ${compressedSizeMb}MB (Optimisé de ${sizeDiffPercentage}%)`
        );

        let imageUrl = "";
        
        // Try uploading to Supabase storage bucket "photos"
        const fileName = `${eventId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { error: uploadErr } = await supabase.storage.from('photos').upload(fileName, compressedFile);
        
        if (uploadErr) {
          console.warn("Storage upload failed, falling back to Base64 data URL", uploadErr);
          const reader = new FileReader();
          imageUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(compressedFile);
          });
        } else {
          const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(fileName);
          imageUrl = publicUrlData.publicUrl;
        }

        const newPhotoData = {
          event_id: eventId,
          image_url: imageUrl,
          uploaded_by: uploadedBy || null,
          uploaded_by_name: uploadedByName || 'Invité',
          download_count: 0
        };

        const { data: newPhoto, error } = await supabase.from('photos').insert(newPhotoData).select().single();

        if (error) {
          throw new Error("Erreur d'insertion dans la base de données");
        }

        onUploadSuccess(newPhoto);
        successCount++;
      } catch (err: any) {
        console.error("Upload error: ", err);
        setErrorMessage(
          `Échec du fichier "${file.name}": ${err.message || "Impossible de charger la photo"}`
        );
      }
    }

    setUploading(false);
    setProgress("");
    if (successCount > 0) {
      setSuccessMessage(`${successCount} photo(s) chargée(s) avec succès ! En direct sur la galerie.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processAndUploadFiles(e.dataTransfer.files);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processAndUploadFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`w-full min-h-[220px] p-8 border-2 border-dashed flex flex-col justify-center items-center text-center cursor-pointer select-none transition-all ${
          dragActive
            ? "border-black bg-neutral-50 scale-[0.99]"
            : "border-neutral-300 bg-white hover:border-black"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 text-neutral-800 animate-spin" />
            <p className="text-sm font-medium text-black">{progress}</p>
            <p className="text-xs text-neutral-400 font-mono">Ne fermez pas cette page</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-neutral-100 flex items-center justify-center rounded-none text-neutral-800">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-black">
                Glissez-déposez vos photos ici, ou <span className="underline">parcourez</span>
              </p>
              <p className="text-xs text-neutral-400 mt-2">
                Images JPEG ou PNG. Les fichiers sont compressés intelligemment côté client avant l'envoi.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="mt-4 p-4 border border-black bg-neutral-50 flex items-start space-x-3 text-black">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span className="text-xs font-semibold">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-4 border border-neutral-200 bg-white flex items-start space-x-3 text-neutral-800">
          <CheckCircle2 className="h-5 w-5 text-black shrink-0 mt-0.5" />
          <span className="text-xs font-semibold">{successMessage}</span>
        </div>
      )}
    </div>
  );
}
