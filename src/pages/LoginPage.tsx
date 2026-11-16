import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, ShieldCheck, MapPin, Hammer, Sparkles, AlertCircle } from 'lucide-react';
import { INITIAL_PROFILES } from '../lib/mockData';

export const LoginPage: React.FC = () => {
  const { signInWithDiscord, switchDemoUser, isSupabaseConnected } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDiscordLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInWithDiscord();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con Discord OAuth. Verifica las credenciales de Supabase en el archivo .env'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-discord-bg flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-discord-blurple/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-lg bg-discord-secondary border border-discord-border/80 rounded-2xl shadow-2xl p-8 relative z-10 backdrop-blur-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-discord-blurple to-indigo-600 text-white shadow-xl shadow-discord-blurple/25 mb-4 ring-4 ring-discord-secondary">
            <Compass size={36} className="animate-spin-slow" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            MineCoords & Projects
          </h1>
          <p className="text-sm text-discord-text-muted mt-2">
            Plataforma comunitaria para coordinar bases, granjas y mega proyectos en nuestro servidor de Minecraft.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error al iniciar sesión:</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Feature Pills */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="p-3 rounded-xl bg-discord-card/80 border border-discord-border/50 flex items-center gap-2.5">
            <MapPin size={18} className="text-emerald-400" />
            <span className="text-xs text-discord-text-normal font-medium">
              Coordenadas Inmediatas
            </span>
          </div>
          <div className="p-3 rounded-xl bg-discord-card/80 border border-discord-border/50 flex items-center gap-2.5">
            <Hammer size={18} className="text-yellow-400" />
            <span className="text-xs text-discord-text-normal font-medium">
              Validación de Proyectos
            </span>
          </div>
          <div className="p-3 rounded-xl bg-discord-card/80 border border-discord-border/50 flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-indigo-400" />
            <span className="text-xs text-discord-text-normal font-medium">
              Roles & Moderación RLS
            </span>
          </div>
          <div className="p-3 rounded-xl bg-discord-card/80 border border-discord-border/50 flex items-center gap-2.5">
            <Sparkles size={18} className="text-discord-blurple" />
            <span className="text-xs text-discord-text-normal font-medium">
              Comandos /tp Minecraft
            </span>
          </div>
        </div>

        {/* Discord OAuth Action Button */}
        <button
          onClick={handleDiscordLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-discord-blurple hover:bg-discord-blurple-hover active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-discord-blurple/30 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
        >
          {/* Discord SVG Icon */}
          <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
          </svg>
          <span>{loading ? 'Conectando...' : 'Iniciar Sesión con Discord'}</span>
        </button>

        {/* Demo Roles Quick Preview (Useful when reviewing locally or on GitHub Pages before DB credentials) */}
        <div className="mt-8 pt-6 border-t border-discord-border/60">
          <p className="text-xs font-semibold text-discord-text-muted text-center mb-3">
            O explora la plataforma con un rol de demostración:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => switchDemoUser(INITIAL_PROFILES[0].id)}
              className="px-2.5 py-2 rounded-lg bg-discord-card hover:bg-discord-hover border border-discord-border/70 text-center transition-colors text-xs font-medium text-rose-300"
            >
              👑 Administrador
            </button>
            <button
              onClick={() => switchDemoUser(INITIAL_PROFILES[1].id)}
              className="px-2.5 py-2 rounded-lg bg-discord-card hover:bg-discord-hover border border-discord-border/70 text-center transition-colors text-xs font-medium text-indigo-300"
            >
              🛡️ Moderador
            </button>
            <button
              onClick={() => switchDemoUser(INITIAL_PROFILES[2].id)}
              className="px-2.5 py-2 rounded-lg bg-discord-card hover:bg-discord-hover border border-discord-border/70 text-center transition-colors text-xs font-medium text-emerald-300"
            >
              ⛏️ Jugador
            </button>
          </div>
          <p className="text-[11px] text-discord-text-muted text-center mt-3">
            Estado Supabase: {isSupabaseConnected ? '🟢 Vinculado a Supabase' : '🟡 Modo Vista Previa / Local'}
          </p>
        </div>
      </div>
    </div>
  );
};
