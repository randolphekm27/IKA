import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight, Camera, HelpCircle, Activity } from "lucide-react";
import { Event } from "../types";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ika_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const savedUser = localStorage.getItem("ika_user");
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {}
        }
      } else {
        setUser(null);
      }
    });

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, photos(count)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4);
        
      if (error) {
        console.error("Failed to load events", error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };
    
    fetchEvents();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const topEventName = events.length > 0 ? events[0].name : "DÉMO LIVE 2026";

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col md:flex-row bg-[#F5F5F5] font-sans antialiased overflow-x-hidden">
      
      {/* LEFT SIDE: Editorial Content Pane */}
      <div className="w-full md:w-[55%] bg-white p-6 sm:p-12 lg:p-16 flex flex-col justify-between border-r border-[#E5E5E5] animate-fade-in text-left">
        <div>
          {/* Logo / Badge */}
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-black uppercase tracking-tighter text-black select-none">
              IKA
            </span>
            <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
          </div>
        </div>

        {/* Hero Section Content */}
        <div className="my-10 md:my-16 space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-black leading-[1.05]">
            Les photos de<br />
            votre événement,<br />
            <span className="text-neutral-500 font-medium">en temps réel.</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-500 max-w-sm sm:max-w-md leading-relaxed">
            Un QR Code unique. Une galerie instantanée. Vos invités accèdent aux clichés de haute qualité dès qu'ils sont capturés par le photographe.
          </p>

          {/* QR & CTA Segment */}
          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-8">
            {/* Visual Artistic QR Block */}
            <div className="shrink-0 w-28 h-28 border-8 border-black p-1.5 bg-white grid grid-cols-4 gap-1 select-none">
              <div className="bg-black"></div><div className="bg-black"></div><div></div><div className="bg-black"></div>
              <div></div><div className="bg-black"></div><div className="bg-black"></div><div></div>
              <div className="bg-black"></div><div></div><div className="bg-black"></div><div className="bg-black"></div>
              <div className="bg-black"></div><div className="bg-black"></div><div></div><div className="bg-black"></div>
            </div>

            <div className="space-y-4 w-full sm:w-auto">
              <Link
                id="cta-create-event-home"
                to={user ? "/dashboard/events/new" : "/login?redirect=/dashboard/events/new"}
                className="inline-block bg-black text-white hover:bg-neutral-800 transition-colors px-6 py-4 text-xs font-bold uppercase tracking-wider text-center"
              >
                Créer un événement
              </Link>
              <div className="block">
                <Link
                  to={user ? "/dashboard" : "/login"}
                  className="text-xs font-extrabold text-[#777] hover:text-black uppercase tracking-wider transition-colors inline-flex items-center space-x-1"
                >
                  <span>Accès Organisateur</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Step Guide List */}
        <div className="border-t border-[#F0F0F0] pt-6 grid grid-cols-3 gap-4 text-[10px] md:text-[11px] uppercase tracking-wider text-neutral-500">
          <div>
            <strong className="text-black block mb-0.5">01. Créer</strong>
            Événement & QR Code
          </div>
          <div>
            <strong className="text-black block mb-0.5">02. Capturer</strong>
            Déchargement photographe
          </div>
          <div>
            <strong className="text-black block mb-0.5">03. Partager</strong>
            Accès public direct
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Live Gallery Pane Preview (Dark Ambient) */}
      <div className="w-full md:w-[45%] bg-black p-6 sm:p-12 flex flex-col justify-between text-left relative min-h-[500px] md:min-h-0">
        
        {/* Gallery Header bar */}
        <div>
          <div className="flex justify-between items-center text-white mb-6">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
              {/* Blinking Live Indicator */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>LIVE NOW</span>
            </div>
            <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest truncate max-w-[200px]">
              {topEventName}
            </div>
          </div>
        </div>

        {/* Centerpiece: Real / Active Galleries showing inside highly stylized grid cells */}
        <div className="my-auto py-4">
          <div className="mb-4">
            <h2 className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              Galeries Actives :
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-neutral-900 border border-neutral-900 animate-pulse"></div>
              ))}
            </div>
          ) : events.length === 0 ? (
            /* Mock placeholder cells matching aesthetic perfectly when zero real events exist */
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-1/2 md:aspect-4/5 bg-[#111] overflow-hidden group flex flex-col justify-end border border-neutral-900">
                <div className="w-full h-full absolute inset-0 bg-linear-to-tr from-neutral-950 to-transparent opacity-80 z-10" />
                <div className="relative z-20 p-4 text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">
                  IMG_4402 &bull; DEGRADE
                </div>
              </div>
              <div className="relative aspect-1/2 md:aspect-4/5 bg-[#111] overflow-hidden group flex flex-col justify-end border border-neutral-900">
                <div className="w-full h-full absolute inset-0 bg-linear-to-tr from-neutral-950 to-transparent opacity-80 z-10" />
                <div className="relative z-20 p-4 text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">
                  MOCKUP_STUDIO
                </div>
              </div>
              <div className="relative aspect-1/2 md:aspect-4/5 bg-[#111] overflow-hidden group flex flex-col justify-end border border-neutral-900">
                <div className="w-full h-full absolute inset-0 bg-linear-to-tr from-neutral-950 to-transparent opacity-80 z-10" />
                <div className="relative z-20 p-4 text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">
                  CAPILLARY_SHOT
                </div>
              </div>
              <div className="relative aspect-1/2 md:aspect-4/5 bg-[#111] overflow-hidden group flex flex-col justify-end border border-neutral-900">
                <div className="w-full h-full absolute inset-0 bg-linear-to-tr from-neutral-950 to-transparent opacity-80 z-10" />
                <div className="relative z-20 p-4 text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">
                  OFFICIEL_PLATEAU
                </div>
              </div>
            </div>
          ) : (
            /* Highly stylized phototastic cards list for existing system events */
            <div className="grid grid-cols-2 gap-3">
              {events.slice(0, 4).map((evt, idx) => (
                <Link
                  key={evt.id}
                  to={`/galerie/${evt.slug}`}
                  className={`group relative ${idx === 0 ? "row-span-2 aspect-1/2 md:aspect-auto" : "aspect-square"} bg-neutral-900 overflow-hidden border border-neutral-800 flex flex-col justify-between`}
                >
                  <img
                    src={evt.cover_image}
                    alt={evt.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                  />
                  {/* Subtle vignette */}
                  <div className="absolute inset-0 bg-linear-to-tr from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Badge */}
                  <div className="relative z-10 p-3 flex justify-between items-start">
                    <span className="text-[8px] font-mono text-white/50 bg-black/60 px-1 py-0.5 tracking-widest uppercase">
                      {evt.photo_count || 0} PICS
                    </span>
                    <ArrowUpRight size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Bottom Text metadata */}
                  <div className="relative z-10 p-3 text-left">
                    <p className="text-[10px] font-black uppercase text-white tracking-tight line-clamp-1 group-hover:underline">
                      {evt.name}
                    </p>
                    <div className="flex items-center text-white/60 space-x-1 mt-0.5 text-[8px] font-mono uppercase tracking-wider">
                      <MapPin size={9} />
                      <span className="truncate">{evt.location || "PARIS"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active counter footer */}
        <div className="text-center pt-4 border-t border-neutral-900">
          <Link
            to="/dashboard/events/new"
            className="text-[10px] text-[#888] hover:text-white transition-colors uppercase tracking-widest font-mono font-bold"
          >
            {events.length > 0 ? `+ ${events.length} GALERIES ACTIVES &bull; VOIR TOUT` : "CRÉER UN ACCÈS RAPIDE"}
          </Link>
        </div>
      </div>

    </div>
  );
}
