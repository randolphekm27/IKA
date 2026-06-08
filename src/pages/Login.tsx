import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { User } from "../types";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"organisateur" | "photographe" | "admin">("organisateur");

  const handleSelectRole = (role: "organisateur" | "photographe" | "admin") => {
    setSelectedRole(role);
    if (role === "organisateur") {
      setEmail("jean@ika.fr");
      setPassword("password123");
    } else if (role === "photographe") {
      setEmail("marc@ika.fr");
      setPassword("password123");
    } else {
      setEmail("admin@ika.fr");
      setPassword("password123");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez saisir votre email et votre mot de passe.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Identifiants invalides");
      }

      // Save user session
      localStorage.setItem("ika_user", JSON.stringify(data.user));
      localStorage.setItem("ika_token", data.token);

      // Trigger custom storage event for Navbar update
      window.dispatchEvent(new Event("storage"));

      // 1. Check if we have a delayed redirection token acceptance loop
      const delayedJoinPath = sessionStorage.getItem("ika_redirect_join");
      if (delayedJoinPath) {
        sessionStorage.removeItem("ika_redirect_join");
        navigate(delayedJoinPath);
        return;
      }

      // Redirect depending on user role
      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "organisateur") {
        navigate("/dashboard");
      } else if (data.user.role === "photographe") {
        navigate("/photographe");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Impossible de se connecter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
            ACCÈS ESPACE MEMBRE
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-black uppercase">
            Connexion IKA
          </h2>
          <div className="w-12 h-0.5 bg-black mx-auto mt-2"></div>
        </div>

        {/* Tailored Espace Switcher Tabs */}
        <div className="grid grid-cols-3 border border-neutral-200 text-center">
          <button
            type="button"
            onClick={() => handleSelectRole("organisateur")}
            className={`py-2.5 text-[10px] font-mono tracking-wider uppercase transition-colors font-bold cursor-pointer ${
              selectedRole === "organisateur"
                ? "bg-black text-white"
                : "bg-white text-neutral-400 hover:text-black"
            }`}
          >
            Organisateur
          </button>
          <button
            type="button"
            onClick={() => handleSelectRole("photographe")}
            className={`py-2.5 text-[10px] font-mono tracking-wider uppercase transition-colors font-bold border-x border-neutral-200 cursor-pointer ${
              selectedRole === "photographe"
                ? "bg-black text-white"
                : "bg-white text-neutral-400 hover:text-black"
            }`}
          >
            Photographe
          </button>
          <button
            type="button"
            onClick={() => handleSelectRole("admin")}
            className={`py-2.5 text-[10px] font-mono tracking-wider uppercase transition-colors font-bold cursor-pointer ${
              selectedRole === "admin"
                ? "bg-black text-white"
                : "bg-white text-neutral-400 hover:text-black"
            }`}
          >
            Admin
          </button>
        </div>

        {error && (
          <div className="bg-neutral-50 border border-black p-4 flex items-start space-x-2 text-black">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 align-left text-left">
            <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
              Adresse Email (ex: {selectedRole === "organisateur" ? "jean@ika.fr" : selectedRole === "photographe" ? "marc@ika.fr" : "admin@ika.fr"})
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
                className="w-full text-xs bg-neutral-50 border border-neutral-200 outline-none focus:border-black rounded-none pl-9 pr-3 py-3 font-sans transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5 align-left text-left">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                Mot de passe (facultatif d'essai)
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 pointer-events-none">
                <Lock size={14} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Saisissez votre mot de passe"
                className="w-full text-xs bg-neutral-50 border border-neutral-200 outline-none focus:border-black rounded-none pl-9 pr-3 py-3 font-sans transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-neutral-800 transition-colors py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Identification en cours...</span>
              </>
            ) : (
              <>
                <LogIn size={14} />
                <span>Se connecter</span>
              </>
            )}
          </button>
        </form>

        <div className="flex flex-col space-y-2 text-center pt-2 text-xs">
          <div className="text-neutral-400">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-black font-semibold uppercase tracking-wider hover:underline ml-1">
              Rejoindre IKA
            </Link>
          </div>
          <div>
            <Link to="/forgot-password" className="text-neutral-400 hover:text-black hover:underline uppercase tracking-wider font-semibold text-[10px]">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        {/* Demo instructions */}
        <div className="border border-neutral-100 bg-neutral-50 p-4 text-[11px] font-mono text-neutral-400 leading-relaxed text-left space-y-2">
          <p className="font-bold text-black uppercase tracking-wider">💡 Guide Rapide de Test :</p>
          <p>
            Cliquez sur un rôle ci-dessus pour pré-configurer automatiquement les indentifiants d'essais correspondants. 
            N'importe quel mot de passe d'au moins 1 caractère sera accepté !
          </p>
        </div>
      </div>
    </div>
  );
}
