import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users, Calendar, Shield, Trash2, ArrowUpRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { User, Event } from "../types";
import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Authenticate check: Must be admin role
    const savedUser = localStorage.getItem("ika_user");
    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const userObj: User = JSON.parse(savedUser);
      if (userObj.role !== "admin") {
        // Rediriger si non-admin
        navigate("/dashboard");
        return;
      }
      setCurrentUser(userObj);

      // 2. Fetch all system directory data
      Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*, photos(count), visits(count)').order('created_at', { ascending: false }),
      ])
        .then(([usersRes, eventsRes]) => {
          if (usersRes.error) throw usersRes.error;
          if (eventsRes.error) throw eventsRes.error;
          
          setUsers(usersRes.data || []);
          
          const formattedEvents = eventsRes.data?.map((e: any) => ({
            ...e,
            photo_count: e.photos?.[0]?.count || 0,
            visit_count: e.visits?.[0]?.count || 0
          })) || [];
          setEvents(formattedEvents);
          
          setLoading(false);
        })
        .catch((err) => {
          console.error("Admin dashboard failed to load catalogs", err);
          setErrorMessage("Impossible de joindre le catalogue d'administration.");
          setLoading(false);
        });
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const handleRoleChange = async (userId: string, newRole: "admin" | "organisateur" | "photographe" | "invite") => {
    setUpdatingUserId(userId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || "Échec changement de rôle");
      }

      // Update state
      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
      setSuccessMessage(`Rôle de ${updatedUser.name} mis à jour avec succès en: ${newRole}`);
      setTimeout(() => setSuccessMessage(null), 3000);

      // If updating yourself, update cached user info as well
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem("ika_user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur de mise à jour");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Voulez-vous supprimer définitivement cet événement en tant qu'administrateur ?")) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        throw new Error("Échec suppression.");
      }

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setSuccessMessage("Événement supprimé avec succès.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de la suppression.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="animate-spin text-black" size={32} />
          <span className="text-xs font-mono text-neutral-400">Ouverture de l'Espace Supervision Réseau...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left animate-fade-in">
      <div className="border-b border-neutral-200 pb-6 mb-8 flex items-center space-x-2.5">
        <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
          <Shield size={20} />
        </div>
        <div>
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
            Console Administrateur Réseau (IKA)
          </span>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight mt-0.5">
            Administration Globale
          </h1>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 border border-neutral-200 bg-white flex items-center space-x-2 text-neutral-800">
          <CheckCircle size={15} className="text-black shrink-0" />
          <span className="text-xs font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 border border-black bg-neutral-50 flex items-center space-x-2 text-black">
          <AlertCircle size={15} className="shrink-0" />
          <span className="text-xs font-semibold">{errorMessage}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Users Management Grid Section */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center space-x-2 border-b border-neutral-200 pb-2">
            <Users size={16} className="text-neutral-500" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Annuaire Utilisateurs ({users.length})
            </h2>
          </div>

          <div className="bg-white border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF9F9] border-b border-neutral-200 font-mono text-[9px] uppercase text-neutral-400 tracking-wider">
                  <tr>
                    <th className="p-4 font-semibold">Nom / Profil</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Attribution rôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/50 transition-all">
                      <td className="p-4 font-semibold text-black">{u.name}</td>
                      <td className="p-4 font-mono select-all text-neutral-500">{u.email}</td>
                      <td className="p-4">
                        {updatingUserId === u.id ? (
                          <div className="flex items-center space-x-1 text-[10px] font-mono text-neutral-400">
                            <Loader2 size={10} className="animate-spin" />
                            <span>Sauvegarde...</span>
                          </div>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleRoleChange(
                                u.id,
                                e.target.value as "admin" | "organisateur" | "photographe" | "invite"
                              )
                            }
                            className="bg-neutral-50 border border-neutral-200 text-xs p-1 outline-none font-mono focus:border-black rounded-none capitalize"
                          >
                            <option value="invite">invite</option>
                            <option value="photographe">photographe</option>
                            <option value="organisateur">organisateur</option>
                            <option value="admin">admin</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Global Events Oversight */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-neutral-200 pb-2">
            <Calendar size={16} className="text-neutral-500" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Surveillance Galeries ({events.length})
            </h2>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {events.map((e) => (
              <div
                key={e.id}
                className="bg-white border border-neutral-200 p-4 space-y-3 hover:border-black transition-all group"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-black uppercase tracking-tight group-hover:underline">
                      {e.name}
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      SLUG: <span className="text-neutral-600 font-bold select-all">{e.slug}</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-neutral-100 border border-neutral-300 flex items-center justify-center shrink-0">
                    <img
                      src={e.cover_image}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                </div>

                <div className="bg-neutral-50 p-2 font-mono text-[9px] flex justify-between text-neutral-500 uppercase">
                  <span>Photos: <strong className="text-black">{e.photo_count || 0}</strong></span>
                  <span>Visites: <strong className="text-black">{e.visit_count || 0}</strong></span>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex justify-between items-center">
                  <Link
                    to={`/galerie/${e.slug}`}
                    className="text-[10px] font-bold text-black uppercase tracking-wider hover:underline flex items-center space-x-1"
                  >
                    <span>Voir Galerie</span>
                    <ArrowUpRight size={11} />
                  </Link>

                  <button
                    onClick={() => handleDeleteEvent(e.id)}
                    className="text-neutral-400 hover:text-black p-1.5 transition-colors"
                    title="Supprimer la galerie de force d'admin"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
