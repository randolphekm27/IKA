import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message || "Impossible de traiter la demande.");
      }

      setSuccess(true);
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
            RÉCUPÉRATION DU COMPTE
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-black uppercase">
            Mot de passe oublié
          </h2>
          <div className="w-12 h-0.5 bg-black mx-auto mt-2"></div>
        </div>

        {success ? (
          <div className="p-6 border border-black bg-neutral-50 text-center space-y-4 animate-fade-in">
            <div className="mx-auto w-10 h-10 bg-black text-white flex items-center justify-center rounded-full">
              <CheckCircle size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-black uppercase">Demande Enregistrée</h3>
              <p className="text-xs text-neutral-600 font-sans">
                Un email contenant le lien de réinitialisation a été transmis si cet email est enregistré sur la plateforme.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-black uppercase tracking-wider hover:underline"
                >
                  <ArrowLeft size={12} />
                  <span>Se connecter</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-neutral-50 border border-black p-4 flex items-start space-x-2 text-black">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">{error}</span>
              </div>
            )}

            <p className="text-xs text-neutral-500 text-center leading-relaxed font-sans">
              Saisissez l'adresse email de votre compte pour recevoir un lien de réinitialisation unique de mot de passe.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <span>Demander un lien</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-black ml-1 transition-colors"
              >
                <ArrowLeft size={12} />
                <span>Retour à la connexion</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
