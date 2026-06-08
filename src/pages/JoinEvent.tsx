import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Camera, Calendar, MapPin, CheckCircle, AlertTriangle, Loader2, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { User } from "../types";

export default function JoinEvent() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [invitation, setInvitation] = useState<{
    token: string;
    event_id: string;
    event_name: string;
    location: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const cache = localStorage.getItem("ika_user");
    if (cache) {
      try {
        setCurrentUser(JSON.parse(cache));
      } catch {}
    }

    if (!token) {
      setErrorMsg("Jeton d'invitation manquant.");
      setLoading(false);
      return;
    }

    // Fetch invitation details
    fetch(`/api/invitations/${token}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((json) => {
            throw new Error(json.error || "Lien d'invitation invalide ou révoqué.");
          });
        }
        return res.json();
      })
      .then((data) => {
        setInvitation(data);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, [token]);

  const handleJoin = async () => {
    if (!currentUser || !invitation || !token) return;

    if (currentUser.role !== "photographe" && currentUser.role !== "admin") {
      setErrorMsg("Votre rôle actuel (" + currentUser.role + ") ne vous autorise pas à rejoindre un événement en tant que photographe.");
      return;
    }

    setJoining(true);
    try {
      const res = await fetch(`/api/events/${invitation.event_id}/photographers/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photographer_id: currentUser.id,
          token: token,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Échec de l'assignation.");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/photographe/${invitation.event_id}`);
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "Impossible de rejoindre l'événement.");
    } finally {
      setJoining(false);
    }
  };

  // Preserve join context for redirecting after login/register
  const saveRedirectAndNavigate = (targetPath: string) => {
    if (token) {
      sessionStorage.setItem("ika_redirect_join", `/join/${token}`);
    }
    navigate(targetPath);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="animate-spin text-black" size={32} />
          <span className="text-xs font-mono text-neutral-400">Vérification de l'invitation...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !invitation) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 text-center">
        <div className="bg-neutral-50 border border-black p-8 space-y-4">
          <AlertTriangle className="mx-auto text-black" size={36} />
          <h3 className="text-sm font-bold uppercase tracking-wider text-black">Erreur Invitation</h3>
          <p className="text-xs text-neutral-600 leading-relaxed font-sans">{errorMsg || "L'invitation n'a pas pu être validée."}</p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-block bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 1: Visitor anonymous (Not logged in)
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="bg-white border border-neutral-200 p-8 space-y-6 text-left">
          <div className="space-y-1 pb-4 border-b border-neutral-100">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">Invitation reçue</span>
            <h2 className="text-xl font-extrabold tracking-tight text-black uppercase">
              Rejoindre : {invitation.event_name}
            </h2>
            <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400 mt-1">
              <MapPin size={12} />
              <span>{invitation.location}</span>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-2 leading-relaxed">
            <p>
              Un organisateur vous invite à rejoindre cette galerie en tant que <strong>Photographe Officiel</strong>.
            </p>
            <p>
              Pour accepter l'invitation et uploader vos photographies en temps réel, veuillez vous authentifier ou créer un compte professionnel.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => saveRedirectAndNavigate("/login")}
              className="w-full bg-black text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogIn size={14} />
              <span>Se connecter</span>
            </button>
            
            <button
              onClick={() => saveRedirectAndNavigate("/register")}
              className="w-full border border-neutral-300 hover:border-black text-black py-3.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <UserPlus size={14} />
              <span>Créer un compte Photographe</span>
            </button>
          </div>

          <p className="text-[10px] font-mono text-neutral-400 text-center uppercase tracking-widest">
            PLATEFORME D'ÉVÉNEMENTS LIVE — IKA
          </p>
        </div>
      </div>
    );
  }

  // Case 2: Organisateur warning
  if (currentUser.role !== "photographe" && currentUser.role !== "admin") {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="bg-yellow-50/50 border border-black p-8 text-center space-y-4">
          <AlertTriangle className="mx-auto text-black" size={36} />
          <h3 className="text-sm font-bold uppercase tracking-wider text-black">Rôle Incompatible</h3>
          <p className="text-xs text-neutral-700 leading-relaxed font-sans">
            Ce lien de transmission est **réservé exclusivement** aux profils de type <strong>Photographe</strong>.
          </p>
          <div className="bg-white p-3 border border-neutral-200 text-left text-xs text-neutral-500 font-mono space-y-1">
            <div>Profil connecté: <span className="text-black font-semibold">{currentUser.name}</span></div>
            <div>Rôle actuel: <span className="text-black font-semibold capitalize">{currentUser.role}</span></div>
          </div>
          <p className="text-xs text-neutral-500 font-sans">
            Déconnectez-vous et connectez-vous avec votre profil photographe pour accepter cette invitation.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-block border border-black hover:bg-black hover:text-white transition-all text-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
            >
              Accéder au Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Proper photographe profile ready to join
  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white border border-neutral-200 p-8 space-y-6 text-left animate-fade-in">
        <div className="space-y-1 pb-4 border-b border-neutral-100">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFF] bg-black px-2 py-0.5 inline-block mb-2">
            INVITATION RECONNUE
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-black uppercase block">
            {invitation.event_name}
          </h2>
          <div className="flex items-center space-x-1.5 text-xs font-mono text-neutral-400 pt-1">
            <MapPin size={11} className="text-neutral-500" />
            <span>{invitation.location}</span>
          </div>
        </div>

        {success ? (
          <div className="p-6 border border-black bg-neutral-50 text-center space-y-4">
            <div className="mx-auto w-10 h-10 bg-black text-white flex items-center justify-center rounded-full">
              <CheckCircle size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-black uppercase">Invitation Acceptée !</h3>
              <p className="text-xs text-neutral-600 font-sans">
                Vous êtes désormais photographe officiel pour l'événement.
              </p>
              <p className="text-[9px] font-mono text-neutral-400 uppercase pt-2">
                Ouverture de votre pupitre de transmission...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-xs text-neutral-600 space-y-3 leading-relaxed">
              <p>
                Bonjour <strong className="text-black">{currentUser.name}</strong>, vous allez être lié en tant que photographe officiel pour cette galerie d'événement en temps réel.
              </p>
              <p>
                Une fois rejoint, l'événement apparaîtra dans votre espace de travail personnel et vous pourrez y uploader vos clichés.
              </p>
            </div>

            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full bg-black hover:bg-neutral-800 text-white py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              {joining ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Assignation en cours...</span>
                </>
              ) : (
                <>
                  <span>Accepter & Rejoindre la Galerie</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
