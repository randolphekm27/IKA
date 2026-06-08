import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Download, Share2, Copy, Check, QrCode } from "lucide-react";

interface QRCodeDisplayProps {
  url: string;
  eventName: string;
  slug: string;
}

export default function QRCodeDisplay({ url, eventName, slug }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Generate QR Code as DataURL
    QRCode.toDataURL(
      url,
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
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    
    // Create download link
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `ika-qr-${slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-neutral-200 p-6 flex flex-col md:flex-row items-center gap-6">
      {/* Visual Ticket QR Display */}
      <div className="bg-black text-white p-6 flex flex-col items-center border border-black max-w-[280px]">
        <div className="font-sans text-[10px] font-mono tracking-widest text-neutral-400 uppercase text-center mb-4">
          QR CODE GALERIE LIVE
        </div>

        {/* Outer White Card Frame */}
        <div className="bg-white p-4 square-box-shadow inline-block">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code pour ${eventName}`}
              className="w-44 h-44 object-contain selection-none"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center bg-neutral-100 text-neutral-400">
              Génération...
            </div>
          )}
        </div>

        <div className="text-center mt-4">
          <h4 className="text-sm font-extrabold tracking-tight truncate max-w-[200px]" title={eventName}>
            {eventName}
          </h4>
          <p className="text-[9px] font-mono text-neutral-400 mt-1 uppercase tracking-wider">
            Scannez pour uploader & voir en direct
          </p>
        </div>
      </div>

      {/* Controller Area */}
      <div className="flex-1 flex flex-col justify-between self-stretch py-2">
        <div className="space-y-4 text-left">
          <div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
              Lien de la Galerie publique
            </span>
            <div className="flex items-center space-x-2 mt-1.5">
              <input
                type="text"
                readOnly
                value={url}
                className="flex-1 text-xs font-mono bg-neutral-50 px-3 py-2 border border-neutral-200 outline-none select-all text-neutral-700"
              />
              <button
                onClick={handleCopy}
                className="bg-black text-white px-3 py-2 text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center space-x-1"
                title="Copier le lien"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Copié !" : "Copier"}</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-neutral-500 leading-relaxed font-sans">
            <p>
              Partagez ce QR Code avec vos invités (sur vos invitations, menus, écrans ou tables).
            </p>
            <p className="mt-1">
              Dès qu'ils le scannent, ils accèdent instantanément à la galerie photo de votre événement, sans besoin d'installer une application !
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-wrap gap-3">
          <button
            onClick={handleDownloadPNG}
            disabled={!qrDataUrl}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            <Download size={14} />
            <span>Télécharger PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
