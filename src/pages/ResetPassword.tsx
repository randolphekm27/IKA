import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Le jeton de réinitialisation est absent ou invalide.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Jeton invalide.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur de réinitialisation.");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
            SÉCURISATION COMPTE
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-black uppercase">
            Nouveau mot de passe
          </h2>
          <div className="w-12 h-0.5 bg-black mx-auto mt-2"></div>
        </div>

        {success ? (
          <div className="p-6 border border-black bg-neutral-50 text-center space-y-4 animate-fade-in">
            <div className="mx-auto w-10 h-10 bg-black text-white flex items-center justify-center rounded-full">
              <CheckCircle size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-black uppercase">Changement Réussi !</h3>
              <p className="text-xs text-neutral-600 font-sans">
                Votre mot de passe a bien été mis à jour.
              </p>
              <p className="text-[9px] font-mono text-neutral-400 uppercase pt-2">
                Redirection automatique vers l'authentification...
              </p>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-neutral-50 border border-black p-4 flex items-start space-x-2 text-black text-left">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Nouveau mot de passe (min 8 caractères)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 outline-none focus:border-black rounded-none pl-9 pr-3 py-3"
                    disabled={loading || !token}
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 outline-none focus:border-black rounded-none pl-9 pr-3 py-3"
                    disabled={loading || !token}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-black text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <span>Enregistrer le mot de passe</span>
                )}
              </button>
            </form>

            <div className="text-center">
              <Link to="/login" className="text-xs text-neutral-400 hover:text-black hover:underline uppercase tracking-wider font-semibold">
                Retour
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
