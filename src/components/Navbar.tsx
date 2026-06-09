import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User } from "../types";
import { UserCircle, LogOut, Menu, X, Shield, Camera, LayoutDashboard } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      const saved = localStorage.getItem("ika_user");
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Subscribe to auth state changes in Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const saved = localStorage.getItem("ika_user");
        const parsedSaved = saved ? JSON.parse(saved) : null;
        
        if (!parsedSaved || parsedSaved.id !== session.user.id) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();
            
          if (profile) {
            localStorage.setItem("ika_user", JSON.stringify(profile));
            localStorage.setItem("ika_token", session.access_token);
            setUser(profile);
          }
        }
      } else {
        localStorage.removeItem("ika_user");
        localStorage.removeItem("ika_token");
        setUser(null);
      }
    });

    window.addEventListener("storage", checkUser);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("ika_user");
    localStorage.removeItem("ika_token");
    setUser(null);
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo IKA */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-sans text-2xl font-extrabold tracking-tighter text-black select-none">
              IKA
            </span>
          </Link>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === "/" ? "text-black" : "text-neutral-500 hover:text-black"
              }`}
            >
              Accueil
            </Link>

            {user && (user.role === "organisateur" || user.role === "admin") && (
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                  location.pathname.startsWith("/dashboard") ? "text-black" : "text-neutral-500 hover:text-black"
                }`}
              >
                <LayoutDashboard size={16} />
                <span>Organisateur</span>
              </Link>
            )}

            {user && user.role === "admin" && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                  location.pathname === "/admin" ? "text-black" : "text-neutral-500 hover:text-black"
                }`}
              >
                <Shield size={16} />
                <span>Admin</span>
              </Link>
            )}

            {user && user.role === "photographe" && (
              <Link
                to="/photographe"
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                  location.pathname === "/photographe" ? "text-black" : "text-neutral-500 hover:text-black"
                }`}
              >
                <Camera size={16} />
                <span>Photographe</span>
              </Link>
            )}
          </nav>

          {/* User Session Handler - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-xs font-semibold text-black leading-none">{user.name}</p>
                  <p className="text-[10px] font-mono text-neutral-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 text-xs text-neutral-500 hover:text-black hover:bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200 transition-all font-medium"
                >
                  <LogOut size={13} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-neutral-500 hover:text-black px-3 py-2 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/login?redirect=/dashboard/events/new"
                  className="text-xs font-semibold bg-black text-white hover:bg-neutral-800 px-4 py-2 border border-black transition-colors rounded-none"
                >
                  Créer un événement
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-neutral-500 hover:text-black focus:outline-none p-1"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-4 pt-2 pb-4 space-y-2 animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-black hover:bg-neutral-50"
          >
            Accueil
          </Link>

          {user && (user.role === "organisateur" || user.role === "admin") && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-black hover:bg-neutral-50"
            >
              Tableau de bord Organisateur
            </Link>
          )}

          {user && user.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-black hover:bg-neutral-50"
            >
              Administration
            </Link>
          )}

          {user && user.role === "photographe" && (
            <Link
              to="/photographe"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-black hover:bg-neutral-50"
            >
              Espace Photographe
            </Link>
          )}

          <div className="border-t border-neutral-100 pt-4 pb-2">
            {user ? (
              <div className="space-y-3">
                <div className="px-3">
                  <p className="text-sm font-semibold text-black">{user.name}</p>
                  <p className="text-xs text-neutral-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 bg-neutral-100 text-black py-2 text-sm font-medium"
                >
                  <LogOut size={16} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm font-semibold text-neutral-600 hover:text-black py-2 rounded-md border border-neutral-200"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm font-semibold bg-black text-white py-2"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
