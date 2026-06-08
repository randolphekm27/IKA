import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, MapPin, Calendar, Image as ImageIcon, Loader2, ArrowRight } from "lucide-react";
import { User, Event } from "../types";

export default function PhotographerDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("ika_user");
    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const userObj: User = JSON.parse(savedUser);
      if (userObj.role !== "photographe" && userObj.role !== "admin") {
        navigate("/dashboard");
        return;
      }
      setCurrentUser(userObj);

      // Fetch assigned events list
      fetch(`/api/photographe/${userObj.id}/events`)
        .then((res) => res.json())
        .then((data) => {
          setEvents(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load assigned events", err);
          setLoading(false);
        });
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="animate-spin text-black" size={32} />
          <span className="text-xs font-mono text-neutral-400">Ouverture de l'Espace Photographe...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left animate-fade-in">
      <div className="border-b border-neutral-200 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
            Espace Professionnel Photographe
          </span>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight mt-0.5">
            Mes Transmissions Live
          </h1>
        </div>
        
        {currentUser && (
          <div className="bg-neutral-50 px-3 py-1.5 border border-neutral-200 text-xs font-mono text-neutral-500">
            COMPTE: <strong className="text-black">{currentUser.name}</strong>
          </div>
        )}
      </div>

      {events.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 border border-neutral-200 bg-neutral-50 p-8 space-y-4">
          <Camera size={36} className="mx-auto text-neutral-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-black">Aucun Événement Assigné</h3>
          <p className="text-xs text-neutral-500 font-sans leading-relaxed">
            Vous n'êtes actuellement rattaché à aucune galerie live active. Scannez un QR Code d'invitation ou utilisez le lien photographe fourni par l'organisateur pour rejoindre un événement.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e) => (
            <div
              key={e.id}
              className="bg-white border border-neutral-200 hover:border-black transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Photo Header block */}
                <div className="relative aspect-video w-full bg-neutral-150 overflow-hidden border-b border-neutral-200">
                  <img
                    src={e.cover_image}
                    alt={e.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-350 transform group-hover:scale-102"
                  />
                  <div className="absolute top-3 right-3 bg-black text-white text-[9px] font-mono px-2 py-1 uppercase tracking-widest">
                    {(e as any).photo_count || 0} CLICHÉS LIVE
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-base font-extrabold text-black uppercase tracking-tight group-hover:underline">
                    {e.name}
                  </h3>

                  <div className="flex flex-col space-y-1.5 text-xs font-mono text-neutral-400">
                    {e.location && (
                      <div className="flex items-center space-x-1.5">
                        <MapPin size={12} className="text-neutral-400" />
                        <span>{e.location}</span>
                      </div>
                    )}
                    {e.date && (
                      <div className="flex items-center space-x-1.5">
                        <Calendar size={12} className="text-neutral-400" />
                        <span>{new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                    )}
                  </div>

                  {e.description && (
                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 pt-1 font-sans">
                      {e.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to={`/photographe/${e.id}`}
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs tracking-wider uppercase transition-colors"
                >
                  <Camera size={14} />
                  <span>Ouvrir l'Upload Zone</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
