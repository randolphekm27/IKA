import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Camera, MapPin, Download, AlertCircle, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { Event, Photo } from "../types";
import PhotoCard from "../components/PhotoCard";
import PhotoModal from "../components/PhotoModal";
import { supabase } from "../lib/supabase";

export default function LiveGallery() {
  const { slug } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [liveConnected, setLiveConnected] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isAuthorizedUploader, setIsAuthorizedUploader] = useState(false);
  
  // Keep track of eventId for SSE reconnection if needed
  const eventIdRef = useRef<string>("");

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    let subscription: any;

    const fetchEventAndPhotos = async () => {
      try {
        const { data: eventData, error } = await supabase
          .from('events')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !eventData) throw new Error("Événement introuvable ou archivé.");
        
        setEvent(eventData);
        eventIdRef.current = eventData.id;

        // Track unique visitor session visit
        let visitorToken = sessionStorage.getItem("ika_visitor_token");
        if (!visitorToken) {
          visitorToken = "visitor-" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
          sessionStorage.setItem("ika_visitor_token", visitorToken);
        }

        // Fire and forget visit tracking without await/catch issues
        const trackVisit = async () => {
           const { error } = await supabase.from('visits').insert({ event_id: eventData.id, visitor_token: visitorToken });
           if (error) console.warn("Failed tracking visit", error);
        };
        trackVisit();

        // Check if current user is an authorized uploader (admin, owner, or assigned photographer)
        const checkUploaderAuth = async () => {
          const savedUser = localStorage.getItem("ika_user");
          if (!savedUser) {
            setIsAuthorizedUploader(false);
            return;
          }
          try {
            const u = JSON.parse(savedUser);
            if (u.role === "admin") {
              setIsAuthorizedUploader(true);
              return;
            }
            if (u.role === "organisateur" && eventData.created_by === u.id) {
              setIsAuthorizedUploader(true);
              return;
            }
            
            // Check if photographer is assigned
            const { data: assignment, error: assignErr } = await supabase
              .from('event_photographers')
              .select('id')
              .eq('event_id', eventData.id)
              .eq('photographer_id', u.id)
              .eq('revoked', false)
              .maybeSingle();
              
            if (assignment && !assignErr) {
              setIsAuthorizedUploader(true);
            } else {
              setIsAuthorizedUploader(false);
            }
          } catch {
            setIsAuthorizedUploader(false);
          }
        };
        checkUploaderAuth();

        const { data: photosData, error: photosError } = await supabase
          .from('photos')
          .select('*')
          .eq('event_id', eventData.id)
          .order('created_at', { ascending: false });

        if (photosData) setPhotos(photosData);
        setLoading(false);

        const eventId = eventIdRef.current;
        if (!eventId) return;

        console.log(`Connecting Live Stream via Supabase Realtime...`);
        subscription = supabase
          .channel(`public:photos:${eventId}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos', filter: `event_id=eq.${eventId}` }, (payload) => {
            const newPhoto = payload.new as Photo;
            setPhotos((prev) => {
              if (prev.some((p) => p.id === newPhoto.id)) return prev;
              return [newPhoto, ...prev];
            });
          })
          .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'photos', filter: `event_id=eq.${eventId}` }, (payload) => {
            const deletedId = payload.old.id;
            setPhotos((prev) => prev.filter((p) => p.id !== deletedId));
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setLiveConnected(true);
              console.log("IKA Live Connection established.");
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              setLiveConnected(false);
            }
          });
      } catch (err: any) {
        setErrorMsg(err.message || "Erreur de chargement de la galerie");
        setLoading(false);
      }
    };
    fetchEventAndPhotos();

    return () => {
      if (subscription) {
        console.log("Closing SSE Stream connection");
        supabase.removeChannel(subscription);
      }
    };
  }, [slug]);

  // Synchronize modal state statistics if a photo is downloaded inside the modal
  const handleDownloadIncrement = (photoId: string, newCount: number) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, download_count: newCount } : p))
    );
    if (selectedPhoto && selectedPhoto.id === photoId) {
      setSelectedPhoto((prev) => (prev ? { ...prev, download_count: newCount } : null));
    }
  };

  const handleNext = () => {
    if (!selectedPhoto || photos.length <= 1) return;
    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
    if (currentIndex !== -1 && currentIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (!selectedPhoto || photos.length <= 1) return;
    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
    if (currentIndex > 0) {
      setSelectedPhoto(photos[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-white" size={36} />
          <p className="text-xs font-mono tracking-widest uppercase text-neutral-400">
            Connexion au flux live temps réel...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="max-w-md bg-neutral-950 border border-neutral-900 p-8 space-y-4 text-center">
          <AlertCircle className="mx-auto text-neutral-500" size={36} />
          <h2 className="text-sm font-bold uppercase tracking-wider">Erreur Galerie</h2>
          <p className="text-xs text-neutral-450">{errorMsg || "Cette adresse ne correspond à aucune galerie active."}</p>
          <Link
            to="/"
            className="inline-block bg-white text-black px-6 py-2.5 text-xs font-semibold uppercase tracking-wider"
          >
            Retour au portail IKA
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      {/* Event Header Information Deck */}
      <section className="relative w-full overflow-hidden border-b border-neutral-900 bg-neutral-950/20 py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Abstract blur background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img
            src={event.cover_image}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter blur-3xl scale-125 grayscale"
          />
        </div>

        <div className="relative max-w-7xl mx-auto z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
          
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center space-x-1 text-[10px] font-mono text-neutral-400 hover:text-white uppercase transition-colors"
                title="Quitter la galerie"
              >
                <ArrowLeft size={12} />
                <span>Accueil IKA</span>
              </Link>
              
              <span className="text-[10px] text-neutral-600 font-mono">/</span>
              
              <div className="flex items-center space-x-1 text-[10px] uppercase font-mono tracking-widest text-[#FFF]">
                <span className={`w-2 h-2 rounded-full ${liveConnected ? "bg-white animate-pulse" : "bg-neutral-600"}`} />
                <span>{liveConnected ? "LIVE SYNCHRONISÉ" : "CONNEXION SATELLITE OFF"}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tighter text-white uppercase mt-1">
              {event.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400 pt-1">
              {event.location && (
                <div className="flex items-center space-x-1.5">
                  <MapPin size={12} className="text-neutral-500" />
                  <span>{event.location}</span>
                </div>
              )}
              {event.date && (
                <div className="flex items-center space-x-1.5">
                  <span className="text-neutral-500">&bull;</span>
                  <span>{new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
              )}
              <div className="bg-neutral-900/60 px-2.5 py-1 rounded-none border border-neutral-800 text-[10px] text-white">
                {photos.length} PHOTOGRAPHIES LIVE
              </div>
            </div>

            {event.description && (
              <p className="max-w-2xl text-xs text-neutral-400 font-sans leading-relaxed pt-1">
                {event.description}
              </p>
            )}
          </div>

          {/* Quick guest action button to upload their files */}
          {isAuthorizedUploader && (
            <div className="w-full md:w-auto shrink-0">
              <Link
                to={`/photographe/${event.id}`}
                className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 border border-neutral-800 bg-neutral-900 hover:bg-white hover:text-black transition-all cursor-pointer font-semibold text-xs tracking-wider uppercase text-center"
              >
                <Camera size={14} />
                <span>Charger mes photos</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Grid Canvas Block */}
      <main className="flex-1 w-full bg-black">
        {photos.length === 0 ? (
          <div className="max-w-md mx-auto py-24 text-center px-4 space-y-4">
            <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mx-auto animate-pulse">
              <Camera size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-300">En attente de transmission</h3>
              <p className="text-xs text-neutral-500 font-sans">
                La galerie est connectée au flux satellite. Dès que le photographe officiel commencera à transmettre des clichés, ils apparaîtront ici en temps réel.
              </p>
            </div>
            {isAuthorizedUploader && (
              <Link
                to={`/photographe/${event.id}`}
                className="inline-block border border-neutral-800 text-neutral-300 hover:text-white px-4 py-2 text-[10px] font-mono uppercase transition-colors"
              >
                Uploader une photo test
              </Link>
            )}
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-black">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={() => setSelectedPhoto(photo)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Lightbox backdrop Modal overlay */}
      <PhotoModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onDownloadIncrement={handleDownloadIncrement}
        onNext={handleNext}
        onPrev={handlePrev}
      />

      {/* Dark Footer Desk */}
      <footer className="bg-black py-8 px-4 border-t border-neutral-950 text-center text-neutral-600 text-[10px] font-mono uppercase tracking-widest">
        <span>IKA GALERIE LIVE — TEMP-RÉEL DE FLUX</span>
      </footer>
    </div>
  );
}
