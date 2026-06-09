import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Download, Copy, Check } from "lucide-react";

interface QRCodeDisplayProps {
  url: string;
  eventName: string;
  slug: string;
  type?: "visitor" | "photographer";
  disabled?: boolean;
}

export default function QRCodeDisplay({
  url,
  eventName,
  slug,
  type = "visitor",
  disabled = false,
}: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If disabled or url is empty, we still generate a placeholder/empty-target QR or use a fallback
    const targetUrl = url || "https://ika.live/invalid";
    
    QRCode.toDataURL(
      targetUrl,
      {
        width: 600,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      },
      (err, dataUrl) => {
        if (err) {
          console.error("Failed to generate QR Code", err);
          return;
        }
        setQrDataUrl(dataUrl);
      }
    );
  }, [url]);

  const handleCopy = () => {
    if (disabled || !url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    if (!qrDataUrl || disabled) return;
    
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `ika-qr-${type}-${slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Text assets depending on type
  const isPhotographer = type === "photographer";
  const badgeTitle = isPhotographer ? "ACCÈS PHOTOGRAPHE" : "QR CODE GALERIE LIVE";
  const subtitle = isPhotographer 
    ? "Scannez pour transmettre vos clichés" 
    : "Scannez pour voir & télécharger en direct";
  const urlLabel = isPhotographer ? "Lien de transmission (Photographe)" : "Lien de la Galerie publique";

  return (
    <div className="bg-white border border-neutral-200 p-6 flex flex-col md:flex-row items-center gap-6">
      {/* Visual Ticket QR Display */}
      <div className="bg-black text-white p-6 flex flex-col items-center border border-black w-full md:max-w-[280px]">
        <div className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase text-center mb-4">
          {badgeTitle}
        </div>

        {/* Outer White Card Frame */}
        <div className="bg-white p-4 square-box-shadow inline-block relative select-none">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code pour ${eventName}`}
              className={`w-44 h-44 object-contain transition-all duration-300 ${
                disabled ? "opacity-15 grayscale blur-[1.5px]" : ""
              }`}
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center bg-neutral-100 text-neutral-400">
              Génération...
            </div>
          )}

          {disabled && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 p-2 text-center">
              <span className="text-[10px] font-mono font-bold text-red-700 tracking-wider uppercase border border-red-200 bg-red-50 px-2.5 py-1">
                Lien Désactivé
              </span>
            </div>
          )}
        </div>

        <div className="text-center mt-4 w-full">
          <h4 className="text-sm font-extrabold tracking-tight truncate max-w-[200px] mx-auto uppercase" title={eventName}>
            {eventName}
          </h4>
          <p className="text-[9px] font-mono text-neutral-400 mt-1 uppercase tracking-wider">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Controller Area */}
      <div className="flex-1 flex flex-col justify-between self-stretch py-2">
        <div className="space-y-4 text-left">
          {disabled && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs font-semibold flex items-center space-x-2">
              <span className="shrink-0 font-mono">⚠️</span>
              <span>Ce lien d'invitation est temporairement désactivé ou révoqué.</span>
            </div>
          )}

          <div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
              {urlLabel}
            </span>
            <div className="flex items-center space-x-2 mt-1.5">
              <input
                type="text"
                readOnly
                value={disabled ? "Accès désactivé" : url}
                className={`flex-1 text-xs font-mono px-3 py-2 border outline-none select-all ${
                  disabled 
                    ? "bg-neutral-50 border-neutral-200 text-neutral-450 italic cursor-not-allowed" 
                    : "bg-white border-neutral-200 text-neutral-700"
                }`}
              />
              <button
                onClick={handleCopy}
                disabled={disabled || !url}
                className="bg-black text-white px-3 py-2 text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-40 disabled:hover:bg-black disabled:cursor-not-allowed shrink-0"
                title="Copier le lien"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Copié !" : "Copier"}</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-neutral-550 leading-relaxed font-sans">
            {isPhotographer ? (
              <>
                <p>
                  Transmettez ce QR Code ou ce lien exclusivement aux photographes officiels de votre événement.
                </p>
                <p className="mt-1">
                  Une fois connecté ou enregistré, le photographe sera associé à cette galerie et pourra uploader ses photos haute définition en temps réel.
                </p>
              </>
            ) : (
              <>
                <p>
                  Partagez ce QR Code avec vos invités (sur vos invitations, menus, écrans ou tables).
                </p>
                <p className="mt-1">
                  Dès qu'ils le scannent, ils accèdent instantanément à la galerie photo de votre événement pour voir et télécharger les clichés !
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-wrap gap-3">
          <button
            onClick={handleDownloadPNG}
            disabled={!qrDataUrl || disabled}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-40 disabled:hover:bg-black disabled:cursor-not-allowed"
          >
            <Download size={14} />
            <span>Télécharger le QR Code (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
