import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Save, ChevronLeft, Image as ImageIcon, QrCode, AlertCircle, CheckCircle, Trash2, Loader2, MapPin, Copy, Check, User, UserPlus, UserMinus, Plus, Camera } from "lucide-react";
import { Event, User as UserType } from "../types";
import { supabase } from "../lib/supabase";
import QRCodeDisplay from "../components/QRCodeDisplay";

export default function EventEditor() {
  const navigate = useNavigate();
  const { id } = useParams(); // present if EDIT mode
  const isEditMode = !!id;

  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string>("");
  const [slug, setSlug] = useState("");
  const [eventId, setEventId] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Photographer & Member list states
  const [photographers, setPhotographers] = useState<any[]>([]);
  const [inviteToken, setInviteToken] = useState<string>("");
  const [isInviteRevoked, setIsInviteRevoked] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [togglingInvite, setTogglingInvite] = useState(false);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      // 1. Check Session Authentication
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
      
      let userObj: UserType;
      try {
        userObj = JSON.parse(savedUser);
        if (userObj.role !== "organisateur" && userObj.role !== "admin") {
          navigate("/");
          return;
        }
        setCurrentUser(userObj);
      } catch {
        navigate("/login");
        return;
      }

      // 2. If edit mode, retrieve existing details
      if (isEditMode && id) {
        setFetchingEvent(true);
        try {
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error || !data) throw new Error("Événement introuvable");
          
          // Verify owner (unless admin)
          if (data.created_by !== userObj.id && userObj.role !== "admin") {
            throw new Error("Vous n'êtes pas l'organisateur de cet événement.");
          }

          setEventId(data.id);
          setName(data.name);
          setDescription(data.description || "");
          setLocation(data.location || "");
          setDate(data.date || "");
          setExistingCoverUrl(data.cover_image || "");
          setSlug(data.slug);
          
           // Fetch linked photographers
          const { data: photogList, error: pError } = await supabase
            .from('event_photographers')
            .select('*, users:photographer_id(name, email)')
            .eq('event_id', data.id);
            
          if (!pError && photogList) {
            const mapped = photogList.map((p: any) => ({
              ...p,
              name: p.users?.name,
              email: p.users?.email
            }));
            setPhotographers(mapped);
          }

          // Fetch existing invitation token if any
          const { data: tokenData, error: tError } = await supabase
            .from('invitation_tokens')
            .select('*')
            .eq('event_id', data.id)
            .maybeSingle();
            
          if (!tError && tokenData) {
            setInviteToken(tokenData.token);
            setIsInviteRevoked(tokenData.revoked || false);
          } else {
            // Auto-generate if not existing (so the organizer doesn't have to click a button to create one)
            const firstToken = Math.random().toString(36).substring(2, 12);
            const { data: newToken } = await supabase
              .from('invitation_tokens')
              .insert({ event_id: data.id, token: firstToken })
              .select()
              .maybeSingle() as any;
            if (newToken) {
              setInviteToken(newToken.token);
              setIsInviteRevoked(false);
            }
          }
        } catch (err: any) {
          setErrorMessage(err.message || "Erreur de chargement");
        } finally {
          setFetchingEvent(false);
        }
      }
    };

    checkAuthAndFetch();
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setErrorMessage("Le nom de l'événement est requis.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      let coverUrl = existingCoverUrl;
      
      // Upload cover image to Supabase Storage bucket 'photos'
      if (coverImageFile) {
        const fileExt = coverImageFile.name.split('.').pop() || 'jpg';
        const fileName = `covers/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage.from('photos').upload(fileName, coverImageFile);
        
        if (uploadErr) {
          console.warn("Storage upload failed, falling back to Base64 data URL", uploadErr);
          const reader = new FileReader();
          coverUrl = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(coverImageFile);
          });
        } else {
          const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(fileName);
          coverUrl = publicUrlData.publicUrl;
        }
      }

      const generatedSlug = isEditMode ? slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

      const eventData = {
        name,
        description,
        location,
        date: date || null,
        cover_image: coverUrl,
        slug: generatedSlug,
        created_by: currentUser?.id,
      };

      let finalId = id;
      if (isEditMode) {
        const { error } = await supabase.from('events').update(eventData).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('events').insert([eventData]).select().single();
        if (error) throw error;
        finalId = data.id;
      }

      setSuccessMessage(
        isEditMode
          ? "Événement mis à jour avec succès !"
          : "Événement créé avec succès ! Votre QR Code est actif."
      );
      
      setEventId(finalId || "");
      setSlug(generatedSlug);
      setExistingCoverUrl(coverUrl);
      
      if (!isEditMode) {
        // Stay on page to show the QR Code
        setCoverImageFile(null);
        setTimeout(() => {
          navigate(`/dashboard/events/edit/${finalId}`);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur de communication.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !id) return;
    if (!confirm("Voulez-vous définitivement supprimer cet événement et TOUTES ses photos ? Cette action est irréversible.")) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);

      if (error) {
        throw new Error("Échec suppression");
      }

      navigate("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de la suppression.");
      setLoading(false);
    }
  };

  const getPublicGalleryUrl = () => {
    if (!slug) return "";
    return `${window.location.protocol}//${window.location.host}/galerie/${slug}`;
  };

  const getPhotographerInviteUrl = () => {
    if (!inviteToken) return "";
    return `${window.location.protocol}//${window.location.host}/join/${inviteToken}`;
  };

  const handleCopyInviteToken = () => {
    if (!inviteToken) return;
    navigator.clipboard.writeText(getPhotographerInviteUrl());
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleToggleInviteLink = async () => {
    if (!eventId) return;
    setTogglingInvite(true);
    setErrorMessage(null);
    try {
      const { data: existing } = await supabase.from('invitation_tokens').select('*').eq('event_id', eventId).single();
      
      if (existing) {
        const { data, error } = await supabase.from('invitation_tokens').update({ revoked: !existing.revoked }).eq('id', existing.id).select().single();
        if (error) throw error;
        setInviteToken(data.token);
        setIsInviteRevoked(data.revoked || false);
        setSuccessMessage(data.revoked ? "Lien d'invitation photographe désactivé avec succès." : "Lien d'invitation photographe activé avec succès !");
      } else {
        const tokenStr = Math.random().toString(36).substring(2, 12);
        const { data, error } = await supabase.from('invitation_tokens').insert({ event_id: eventId, token: tokenStr }).select().single();
        if (error) throw error;
        setInviteToken(data.token);
        setIsInviteRevoked(data.revoked || false);
        setSuccessMessage("Lien d'invitation photographe activé avec succès !");
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors du traitement du lien d'accès.");
    } finally {
      setTogglingInvite(false);
    }
  };

  const handleRevokePhotographer = async (photographerId: string) => {
    if (!eventId) return;
    setErrorMessage(null);
    try {
      const { data: existing } = await supabase.from('event_photographers').select('*').eq('photographer_id', photographerId).eq('event_id', eventId).single();
      if (!existing) throw new Error("Photographe introuvable.");

      const { data: updated, error } = await supabase.from('event_photographers').update({ revoked: !existing.revoked }).eq('id', existing.id).select().single();
      
      if (error) throw error;
      
      setPhotographers((prev) =>
        prev.map((p) => (p.photographer_id === photographerId ? { ...p, revoked: updated.revoked } : p))
      );
      setSuccessMessage(updated.revoked ? "Accès du photographe suspendu avec succès." : "Accès du photographe activé avec succès !");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Impossible de changer l'accès pour ce photographe.");
    }
  };

  const handleRegenerateInviteLink = async () => {
    if (!eventId) return;
    setTogglingInvite(true);
    setErrorMessage(null);
    try {
      const newTokenStr = Math.random().toString(36).substring(2, 12);
      const { data: existing } = await supabase
        .from('invitation_tokens')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('invitation_tokens')
          .update({ token: newTokenStr, revoked: false })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        setInviteToken(data.token);
        setIsInviteRevoked(false);
        setSuccessMessage("Un nouveau lien et QR code d'invitation photographe ont été générés !");
      } else {
        const { data, error } = await supabase
          .from('invitation_tokens')
          .insert({ event_id: eventId, token: newTokenStr })
          .select()
          .single();
        if (error) throw error;
        setInviteToken(data.token);
        setIsInviteRevoked(false);
        setSuccessMessage("Lien d'invitation photographe activé !");
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage("Erreur lors de la régénération du lien : " + err.message);
    } finally {
      setTogglingInvite(false);
    }
  };

  if (fetchingEvent) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="animate-spin text-black" size={32} />
          <span className="text-xs font-mono text-neutral-400">Récupération des paramètres de l'événement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-left animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <Link
          to="/dashboard"
          className="flex items-center space-x-1 text-xs font-semibold text-neutral-500 hover:text-black uppercase tracking-wider transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Retour au dashboard</span>
        </Link>

        {isEditMode && (
          <button
            onClick={handleDelete}
            className="flex items-center space-x-1.5 text-xs text-neutral-500 hover:text-black border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50 transition-colors uppercase font-mono cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Supprimer l'événement</span>
          </button>
        )}
      </div>

      <div className="border-b border-neutral-200 pb-6 mb-8">
        <h1 className="text-2xl font-black text-black uppercase tracking-tight">
          {isEditMode ? "Éditer l'Événement" : "Créer un Événement Live"}
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          {isEditMode
            ? "Mettez à jour les informations et gérez vos photographes rattachés."
            : "Remplissez le formulaire de cadrage pour déployer une galerie live temps réel."}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 border border-black bg-neutral-50 flex items-start space-x-2 text-black">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="text-xs font-semibold">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 border border-neutral-200 bg-white flex items-start space-x-2 text-neutral-800">
          <CheckCircle size={16} className="text-black shrink-0 mt-0.5" />
          <span className="text-xs font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-8">
        {/* Left Side: Form */}
        <div className="md:col-span-3 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-neutral-200 p-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                Nom de l'événement (Requis)
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Festival de Jazz / Mariage de Julie & Marc"
                className="w-full text-xs font-semibold bg-neutral-50 border border-neutral-200 outline-none focus:border-black rounded-none p-3"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.55">
              <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                Date de l'événement (Requis)
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-semibold bg-neutral-50 border border-neutral-200 outline-none focus:border-black rounded-none p-3"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                Lieu physique de l'événement
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-450">
                  <MapPin size={12} />
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ex: Nice / Paris / Château de Bellevue"
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 outline-none focus:border-black rounded-none pl-9 pr-3 py-3"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                Description et Tagline explicatif
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Flashez le QR Code pour visualiser ou décharger des photos instantanément !"
                rows={4}
                className="w-full text-xs bg-neutral-50 border border-neutral-200 outline-none focus:border-black rounded-none p-3"
                disabled={loading}
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                Photo de couverture / affiche
              </label>
              <div className="flex items-center gap-4">
                {(coverImageFile || existingCoverUrl) && (
                  <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center shrink-0">
                    <img
                      src={coverImageFile ? URL.createObjectURL(coverImageFile) : existingCoverUrl}
                      alt="Aperçu couverture"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCoverImageFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:border file:border-neutral-250 file:rounded-none file:text-xs file:font-semibold file:bg-neutral-100 file:text-black hover:file:bg-neutral-200 cursor-pointer"
                    disabled={loading}
                  />
                  <p className="text-[9px] text-neutral-400 font-mono mt-1">
                    Optionnel. Si vide, un placeholder d'architecte premium est configuré.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-black text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>{isEditMode ? "Mettre à jour l'événement" : "Générer la galerie IKA"}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: QR Code download desk (Only visible once id is present) */}
        <div className="md:col-span-2 space-y-6">
          {eventId && slug ? (
            <div className="space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 block">
                Outils de Diffusion Live
              </h2>
              <QRCodeDisplay
                url={getPublicGalleryUrl()}
                eventName={name}
                slug={slug}
              />
              <div className="bg-neutral-50 border border-neutral-200 p-4 font-mono text-[10px] space-y-2 uppercase text-neutral-500">
                <p className="font-bold text-black text-xs">🛠️ ACTIONS POLICIES :</p>
                <div className="h-px bg-neutral-200"></div>
                <div className="flex justify-between">
                  <span>Région d'accès :</span>
                  <span className="text-black font-semibold">France</span>
                </div>
                <div className="flex justify-between">
                  <span>Accès invité :</span>
                  <span className="text-black font-semibold">Lecture (Public)</span>
                </div>
                <div className="flex justify-between">
                  <span>Terminal de décharge :</span>
                  <Link to={`/photographe/${eventId}`} className="text-black font-extrabold underline hover:text-neutral-800">
                    Ouvrir l'Espace Upload
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-neutral-300 p-8 text-center text-neutral-400 bg-white flex flex-col items-center justify-center min-h-[300px]">
              <Camera size={24} className="text-neutral-300 mb-1" />
              <p className="text-xs font-semibold uppercase text-black">Génération inactive</p>
              <p className="text-[11px] text-neutral-400 max-w-[200px] mx-auto mt-2 font-sans">
                Remplissez et enregistrez le formulaire de gauche à droite pour obtenir le QR Code live téléchargeable.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* NEW PANEL: Members & Photographers Management (Only shown on edit mode when event exists) */}
      {isEditMode && eventId && (
        <div className="mt-12 pt-8 border-t border-neutral-200 space-y-8">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-black">
              👤 Gestion des Membres & Accès Photographes
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Pilotez l'équipe de prise de vue. Partagez le lien ou le QR code spécial ci-dessous avec vos photographes pour qu'ils puissent s'associer et uploader en direct.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Column A: Photographer Invitation via QR Code */}
            <div className="md:col-span-3 space-y-6">
              {inviteToken ? (
                <div className="space-y-4">
                  <QRCodeDisplay
                    type="photographer"
                    url={isInviteRevoked ? "" : getPhotographerInviteUrl()}
                    eventName={`${name}`}
                    slug={`${slug}-photographe`}
                    disabled={isInviteRevoked}
                  />
                  <div className="bg-neutral-50 border border-neutral-200 p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                          Statut de l'invitation
                        </span>
                        <p className="text-xs text-neutral-550 font-sans mt-0.5">
                          {isInviteRevoked 
                            ? "Le lien et le QR code sont désactivés. Personne ne peut s'associer." 
                            : "Le lien et le QR code sont actifs. Les photographes peuvent s'associer."}
                        </p>
                      </div>
                      <span className={`inline-block text-[9px] font-mono px-2.5 py-1 uppercase tracking-widest text-center shrink-0 border ${
                        isInviteRevoked 
                          ? "bg-red-55 border-red-200 text-red-700" 
                          : "bg-black text-white border-black"
                      }`}>
                        {isInviteRevoked ? "DÉSACTIVÉ" : "ACTIF"}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-neutral-200 flex flex-wrap gap-4 items-center justify-between">
                      <button
                        type="button"
                        onClick={handleToggleInviteLink}
                        disabled={togglingInvite}
                        className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-black border-b border-black hover:text-neutral-500 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {togglingInvite ? "Traitement..." : isInviteRevoked ? "Réactiver le lien" : "Désactiver le lien"}
                      </button>

                      <button
                        type="button"
                        onClick={handleRegenerateInviteLink}
                        disabled={togglingInvite}
                        className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-black border-b border-black hover:text-neutral-500 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Générer un autre lien / QR Code
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-neutral-300 p-8 text-center text-neutral-400 bg-white flex flex-col items-center justify-center min-h-[250px]">
                  <Loader2 className="animate-spin text-neutral-300 mb-2" size={20} />
                  <p className="text-xs font-semibold uppercase text-black">Initialisation de l'accès photographe...</p>
                </div>
              )}
            </div>

            {/* Column B: Active Photographers Directory */}
            <div className="md:col-span-2 space-y-4">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                Photographes autorisés ({photographers.length})
              </span>

              {photographers.length === 0 ? (
                <div className="border border-dashed border-neutral-300 p-8 text-center text-neutral-400 bg-white font-sans text-xs">
                  Aucun photographe rattaché pour le moment. Partagez le QR code d'accès ou le lien d'invitation.
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {photographers.map((p) => (
                    <div
                      key={p.photographer_id}
                      className="bg-white border border-neutral-200 p-4 space-y-2 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-black uppercase tracking-tight">
                            {p.name}
                          </h4>
                          <p className="text-[10px] font-mono text-neutral-400">
                            {p.email}
                          </p>
                        </div>
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 uppercase tracking-wider ${p.revoked ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                          {p.revoked ? "Accès suspendu" : "Accès autorisé"}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-neutral-100 flex justify-between items-center">
                        <span className="text-[9px] font-mono text-neutral-400 uppercase">
                          Rejoint le: {p.joined_at ? new Date(p.joined_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "Rattaché"}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRevokePhotographer(p.photographer_id)}
                          className="text-[9px] font-mono font-black uppercase tracking-wider hover:underline text-black cursor-pointer"
                        >
                          {p.revoked ? "Rétablir l'accès" : "Révoquer l'accès"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
