import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Trash2, Calendar, Loader2, AlertCircle, CheckCircle, UserCircle, RefreshCw } from "lucide-react";
import { Event, Photo, User } from "../types";
import UploadZone from "../components/UploadZone";

export default function PhotographerDesk() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    // 1. Recover logged user if any
    const savedUser = localStorage.getItem("ika_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        setGuestName(u.name);
      } catch {
        setCurrentUser(null);
      }
    } else {
      // If guest, set defaults
      const cachedGuestName = localStorage.getItem("ika_guest_name");
      if (cachedGuestName) {
        setGuestName(cachedGuestName);
      } else {
        setGuestName("Anonyme");
      }
    }

    // 2. Fetch event metadata and existing uploaded photos
    Promise.all([
      fetch(`/api/events/${eventId}`).then((r) => {
        if (!r.ok) throw new Error("Événement introuvable");
        return r.json();
      }),
      fetch(`/api/events/${eventId}/photos`).then((r) => r.json()),
    ])
      .then(([eventData, photosData]) => {
        setEvent(eventData);
        setPhotos(photosData);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Impossible de charger la console photographe");
        setLoading(false);
      });
  }, [eventId]);

  const handleGuestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuestName(val);
    localStorage.setItem("ika_guest_name", val);
  };

  const handleUploadSuccess = (newPhoto: Photo) => {
    // Add new photo at the top of the local list
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Impossible de supprimer la photo.");
      }

      // Remove from state
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression de la photo.");
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "En direct";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="animate-spin text-black" size={32} />
          <span className="text-xs font-mono text-neutral-400">Ouverture de la console de déchargement...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !event) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="max-w-md bg-white border border-neutral-200 p-8 space-y-4 text-center">
          <AlertCircle className="mx-auto text-black" size={32} />
          <h2 className="text-sm font-bold uppercase tracking-wider">Erreur console</h2>
          <p className="text-xs text-neutral-510">{errorMsg || "Événement d'upload invalide."}</p>
          <Link
            to="/"
            className="inline-block bg-black text-white px-6 py-2 text-xs font-semibold uppercase tracking-wider"
          >
            Sortir
          </Link>
        </div>
      </div>
    );
  }

  // Define if the current viewer can delete photos:
  // - Admin can delete anything
  // - Event Creator (Organisateur) can delete anything in their event
  // - The logged in Photographe can delete their own uploaded photos
  // - Guest can delete their own uploaded photos if matched by user id (or uploader)
  const canUserDeletePhoto = (photo: Photo) => {
    if (!currentUser) {
      // If guest uploaded in the current session, let them delete for safety
      return photo.uploaded_by === "invite";
    }
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "organisateur" && event.created_by === currentUser.id) return true;
    if (photo.uploaded_by === currentUser.id) return true;
    return false;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-left animate-fade-in">
      <div className="mb-6">
        <Link
          to={`/galerie/${event.slug}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-neutral-500 hover:text-black uppercase tracking-wider transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Visiter la galerie Live</span>
        </Link>
      </div>

      {/* Main Grid Header */}
      <div className="border-b border-neutral-200 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
            Espace de Cadrage & Déchargement
          </span>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight mt-1">
            Console d'envoi d'images
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Événement : <strong className="text-black">{event.name}</strong> ({event.location})
          </p>
        </div>

        {/* Input for Guest Signature if they are not logged in */}
        <div className="w-full md:w-auto min-w-[240px]">
          <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
            Signature de la Photo (Crédit)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
              <UserCircle size={14} />
            </span>
            <input
              type="text"
              value={guestName}
              onChange={handleGuestNameChange}
              placeholder="ex: Marie L."
              className="w-full text-xs font-semibold bg-neutral-50 border border-neutral-200 outline-none focus:border-black rounded-none pl-9 pr-3 py-2.5"
              maxLength={22}
            />
          </div>
          <p className="text-[9px] text-neutral-400 font-mono mt-1">
            Visible sur la galerie publique lors du survol.
          </p>
        </div>
      </div>

      {/* Grid: Upload Zone left / Recent uploaded items listing on the right */}
      <div className="grid md:grid-cols-5 gap-8">
        
        {/* Upload Action Sector */}
        <div className="md:col-span-3 space-y-6">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 block">
            DÉPOSEZ VOS SOUVENIRS
          </h2>
          <UploadZone
            eventId={event.id}
            onUploadSuccess={handleUploadSuccess}
            uploadedBy={currentUser?.id}
            uploadedByName={guestName}
          />
        </div>

        {/* Uploads history listing */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-white border-b border-neutral-200 pb-2">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Flux Récents ({photos.length})
            </h2>
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest bg-neutral-100 px-1.5 py-0.5">
              Live Feed active
            </span>
          </div>

          {photos.length === 0 ? (
            <div className="border border-dashed border-neutral-200 p-8 text-center text-neutral-400 bg-neutral-50/50 flex flex-col items-center justify-center min-h-[220px]">
              <Camera size={24} className="text-neutral-300 stroke-[1] mb-1" />
              <p className="text-xs text-neutral-500 font-semibold uppercase">Aucun fichier transmis</p>
              <p className="text-[10px] text-neutral-400 font-sans max-w-[170px] mx-auto mt-1">
                Déchargez des photos à gauche pour les voir apparaître immédiatement ici.
              </p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white border border-neutral-200 p-3 flex items-center justify-between gap-3 hover:border-black transition-all animate-fade-in"
                >
                  <div className="w-12 h-12 bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-150">
                    <img
                      src={photo.image_url}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-bold text-black truncate select-none">
                      {photo.uploaded_by_name}
                    </p>
                    <div className="flex items-center space-x-1.5 text-[9px] font-mono text-neutral-400 uppercase tracking-tight mt-0.5">
                      <Calendar size={10} />
                      <span>Transmis à {formatDate(photo.created_at)}</span>
                    </div>
                  </div>

                  {canUserDeletePhoto(photo) && (
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="text-neutral-400 hover:text-black p-2 hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all"
                      title="Supprimer la photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
