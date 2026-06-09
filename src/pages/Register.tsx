import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User as UserIcon, ShieldAlert, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"organisateur" | "photographe">(() => {
    const isJoining = sessionStorage.getItem("ika_redirect_join");
    return isJoining ? "photographe" : "organisateur";
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailConfirmRequired, setEmailConfirmRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("Tous les champs sont requis.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          }
        }
      });

      if (authError) {
        throw new Error(authError.message || "Erreur lors de l'enregistrement");
      }

      if (authData.user) {
        if (authData.session) {
          // Email confirmation is disabled, user is immediately logged in
          const { error: insertError } = await supabase.from('users').insert({
            id: authData.user.id,
            name: name,
            email: email,
            role: role
          });
          
          if (insertError) {
            console.warn("Failed to insert user profile.", insertError);
          }

          setSuccess(true);
          setEmailConfirmRequired(false);

          // Save session
          const userProfile = { id: authData.user.id, name, email, role, status: 'active' };
          localStorage.setItem("ika_user", JSON.stringify(userProfile));
          localStorage.setItem("ika_token", authData.session.access_token || "");
          window.dispatchEvent(new Event("storage"));

          setTimeout(() => {
            const searchParams = new URLSearchParams(window.location.search);
            const redirectParam = searchParams.get("redirect");

            const delayedJoinPath = sessionStorage.getItem("ika_redirect_join");
            if (delayedJoinPath) {
              sessionStorage.removeItem("ika_redirect_join");
              navigate(delayedJoinPath);
              return;
            }

            if (redirectParam) {
              navigate(redirectParam);
              return;
            }

            if (role === "organisateur") {
              navigate("/dashboard");
            } else if (role === "photographe") {
              navigate("/photographe");
            } else {
              navigate("/");
            }
          }, 2000);
        } else {
          // Email confirmation is required by Supabase, session is null
          setSuccess(true);
          setEmailConfirmRequired(true);
        }
      }

    } catch (err: any) {
      setError(err.message || "Impossible de compléter l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
            INSCRIPTION PLATEFORME
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-black uppercase">
            Créer un compte IKA
          </h2>
          <div className="w-12 h-0.5 bg-black mx-auto mt-2"></div>
        </div>

        {success ? (
          <div className="p-6 border border-black bg-neutral-50 text-center space-y-4 animate-fade-in">
            <div className="mx-auto w-10 h-10 bg-black text-white flex items-center justify-center rounded-full">
              <CheckCircle size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-black uppercase">Inscription Réussie !</h3>
              {emailConfirmRequired ? (
                <>
                  <p className="text-[11px] font-mono text-neutral-500">
                    Un e-mail de confirmation vous a été envoyé.
                  </p>
                  <p className="text-xs text-neutral-600 font-sans pt-2">
                    Veuillez cliquer sur le lien dans l'e-mail pour valider votre compte, puis connectez-vous.
                  </p>
                  <div className="pt-4">
                    <Link
                      to={`/login${window.location.search}`}
                      className="inline-block bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
                    >
                      Aller à la page de connexion
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-mono text-neutral-500">
                    Votre compte a été créé avec succès.
                  </p>
                  <p className="text-xs text-neutral-600 font-sans pt-1">
                    Redirection automatique vers votre espace...
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-neutral-50 border border-black p-4 flex items-start space-x-2 text-black">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 align-left text-left">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Nom d'utilisateur / Entreprise
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 pointer-events-none">
                    <UserIcon size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Sophie & Marc / Studio Alpha"
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 outline-none focus:border-black rounded-none pl-9 pr-3 py-3"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5 align-left text-left">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Adresse Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 pointer-events-none">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 outline-none focus:border-black rounded-none pl-9 pr-3 py-3"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Role Selection Tabs */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Choisissez votre rôle d'utilisation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("organisateur")}
                    className={`p-3 text-xs font-bold uppercase tracking-wider border transition-all text-center ${
                      role === "organisateur"
                        ? "border-black bg-black text-white"
                        : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-black hover:text-black"
                    }`}
                  >
                    Organisateur
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("photographe")}
                    className={`p-3 text-xs font-bold uppercase tracking-wider border transition-all text-center ${
                      role === "photographe"
                        ? "border-black bg-black text-white"
                        : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-black hover:text-black"
                    }`}
                  >
                    Photographe
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 font-mono mt-1 leading-relaxed">
                  {role === "organisateur"
                    ? "Créez vos galeries, générez des QR Codes uniques et suivez les statistiques de téléchargement."
                    : "Accédez aux événements assignés par les organisateurs et déchargez vos photographies en direct."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 outline-none focus:border-black rounded-none p-3"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Confirmation
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 outline-none focus:border-black rounded-none p-3"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Création du profil...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    <span>S'enregistrer sur IKA</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 text-xs text-neutral-400">
              Déjà inscrit ?{" "}
              <Link to={`/login${window.location.search}`} className="text-black font-semibold uppercase tracking-wider hover:underline ml-1">
                Se connecter
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
