import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Eye, Image, Download, Calendar, MapPin, Loader2, ArrowUpRight, LogIn } from "lucide-react";
import { Event, User, GlobalStats } from "../types";
import StatCard from "../components/StatCard";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<GlobalStats>({ totalEvents: 0, totalPhotos: 0, totalDownloads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      // 1. Verify real Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        localStorage.removeItem("ika_user");
        localStorage.removeItem("ika_token");
        navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      const savedUser = localStorage.getItem("ika_user");
      if (!savedUser) {
        navigate("/login");
        return;
      }

      try {
        const user: User = JSON.parse(savedUser);
        if (user.role !== "organisateur" && user.role !== "admin") {
          // Rediriger si visiteur sans autorisation
          navigate("/");
          return;
        }
        setCurrentUser(user);

        Promise.all([
          supabase
            .from('events')
            .select('*, photos(count), visits(count)')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('photos')
            .select('download_count, events!inner(created_by)')
            .eq('events.created_by', user.id)
        ])
          .then(([eventsRes, photosRes]) => {
            if (eventsRes.error) throw eventsRes.error;
            
            const formattedEvents = eventsRes.data?.map((e: any) => ({
              ...e,
              photo_count: e.photos?.[0]?.count || 0,
              visit_count: e.visits?.[0]?.count || 0
            })) || [];
            setEvents(formattedEvents);

            const totalEvents = formattedEvents.length;
            const totalPhotos = photosRes.data?.length || 0;
            const totalDownloads = photosRes.data?.reduce((acc: number, p: any) => acc + (p.download_count || 0), 0) || 0;
            
            setStats({ totalEvents, totalPhotos, totalDownloads });
            setLoading(false);
          })
          .catch((err) => {
            console.error("Dashboard failed to retrieve user data", err);
            setLoading(false);
          });
      } catch {
        navigate("/login");
      }
    };

    checkAuthAndFetch();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="animate-spin text-black" size={32} />
          <span className="text-xs font-mono text-neutral-400">Chargement de votre console organisateur...</span>
        </div>
      </div>
    );
  }

  // Generate public gallery URL based on active window hostname
  const getPublicUrl = (slug: string) => {
    return `${window.location.protocol}//${window.location.host}/galerie/${slug}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in text-left">
      {/* Header Profile Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-200 pb-8 mb-10 gap-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
            Espace Organisateur Officiel
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-black uppercase mt-1">
            Tableau de bord
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Bienvenue, <strong>{currentUser?.name}</strong>. Gérez vos QR Codes uniques et suivez les déchargements en direct.
          </p>
        </div>

        <Link
          to="/dashboard/events/new"
          className="w-full md:w-auto flex items-center justify-center space-x-2 bg-black text-white hover:bg-neutral-800 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <Plus size={16} />
          <span>Créer un événement</span>
        </Link>
      </div>

      {/* Global Performance Statistics Grid */}
      <div className="grid sm:grid-cols-3 gap-6 mb-12">
        <StatCard
          title="Total Événements"
          value={stats.totalEvents}
          description="Nombre de galeries live configurées"
          icon={<Calendar size={18} />}
        />
        <StatCard
          title="Photos En Log"
          value={stats.totalPhotos}
          description="Total des photos chargées en direct"
          icon={<Image size={18} />}
        />
        <StatCard
          title="Téléchargements"
          value={stats.totalDownloads}
          description="Nombre de clics d'enregistrements originaux"
          icon={<Download size={18} />}
        />
      </div>

      {/* Events List Segment */}
      <div className="space-y-6">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
          Vos Événements Actifs ({events.length})
        </h2>

        {events.length === 0 ? (
          <div className="border border-neutral-200 bg-white p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 bg-neutral-100 border border-neutral-300 flex items-center justify-center shrink-0">
              <Calendar size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-black uppercase">Aucun événement configuré</h3>
              <p className="text-xs text-neutral-500 max-w-sm">
                Commencez par créer votre premier événement pour générer une galerie live et un QR Code d'invitation unique.
              </p>
            </div>
            <Link
              to="/dashboard/events/new"
              className="bg-black text-white px-5 py-2 text-xs font-semibold hover:bg-neutral-800 transition-colors uppercase tracking-wider"
            >
              Créer mon premier événement
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-neutral-200 overflow-hidden flex flex-col justify-between hover:border-black transition-all group"
              >
                <div className="p-6">
                  {/* Event Top metadata */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-neutral-400 space-x-1.5 text-[10px] font-mono uppercase flex-wrap">
                        <MapPin size={12} />
                        <span>{event.location || "Non spécifié"}</span>
                        {event.date && (
                          <>
                            <span className="mx-1">&bull;</span>
                            <span>{new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-black uppercase tracking-tight group-hover:underline mt-1">
                        {event.name}
                      </h3>
                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                        {event.description || "Aucune description fournie pour cet événement live."}
                      </p>
                    </div>

                    <div className="w-16 h-16 bg-neutral-100 shrink-0 border border-neutral-200">
                      <img
                        src={event.cover_image}
                        alt="Couverture"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-opacity"
                      />
                    </div>
                  </div>

                  {/* Micro stats banner */}
                  <div className="grid grid-cols-3 gap-2 mt-6 p-3 bg-neutral-50 border border-neutral-100 font-mono text-[10px] text-neutral-600">
                    <div className="text-center border-r border-neutral-200 pr-2">
                      <p className="text-neutral-400 uppercase font-thin">Photos</p>
                      <p className="text-xs font-extrabold text-black mt-0.5">{event.photo_count || 0}</p>
                    </div>
                    <div className="text-center border-r border-neutral-200 pr-2">
                      <p className="text-neutral-400 uppercase font-thin">Visiteurs</p>
                      <p className="text-xs font-extrabold text-black mt-0.5">{event.visit_count || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-neutral-400 uppercase font-thin font-mono leading-none">Code</p>
                      <p className="text-[9px] font-extrabold text-black mt-1 leading-none uppercase select-all truncate">
                        {event.slug.split("-").pop()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dashboard Card Action Controls */}
                <div className="bg-neutral-50/70 border-t border-neutral-150 px-6 py-4 flex flex-wrap gap-2 justify-between items-center">
                  <div className="flex gap-2">
                    <Link
                      to={`/dashboard/events/edit/${event.id}`}
                      className="text-[10px] font-mono tracking-wider font-bold border border-neutral-200 hover:border-black bg-white px-3 py-1.5 uppercase transition-colors"
                    >
                      Édition & QR Code
                    </Link>
                    <Link
                      to={`/photographe/${event.id}`}
                      className="text-[10px] font-mono tracking-wider font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-1.5 uppercase transition-colors"
                    >
                      Espace Photo
                    </Link>
                  </div>
                  <Link
                    to={`/galerie/${event.slug}`}
                    className="text-[11px] font-mono text-black font-extrabold hover:underline flex items-center space-x-1"
                  >
                    <span>Voir Live</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
