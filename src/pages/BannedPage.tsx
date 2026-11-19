import React from 'react';
import { Ban, LogOut, ShieldX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BannedPage: React.FC = () => {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-discord-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Red ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-discord-card border border-rose-500/40 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative z-10 text-center animate-fade-in">
        {/* Ban Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500 mx-auto mb-5 shadow-lg shadow-rose-500/20 animate-pulse">
          <Ban size={36} />
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldX size={14} />
          <span>Acceso Denegado Permanentemente</span>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight mb-3">
          Cuenta Bloqueada / Baneada
        </h1>

        <p className="text-sm text-discord-text-muted leading-relaxed mb-6">
          Tu cuenta ha sido bloqueada por la administración del servidor de Minecraft. No tienes permiso para ver coordenadas, proponer proyectos ni acceder a los servicios de la plataforma.
        </p>

        {/* Reason Box */}
        <div className="bg-discord-darkest/90 border border-rose-500/30 rounded-xl p-4 mb-6 text-left">
          <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1">
            Motivo del bloqueo:
          </p>
          <p className="text-xs text-discord-text-normal font-mono">
            {profile?.ban_reason || 'Infracción de normas del servidor o decisión de la administración.'}
          </p>
        </div>

        {/* User Card */}
        <div className="bg-discord-secondary/40 rounded-xl p-3 mb-6 flex items-center justify-between border border-discord-border/40 text-xs">
          <div className="flex items-center gap-2.5 text-left">
            <img
              src={
                profile?.avatar_url ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'player'}`
              }
              alt={profile?.username}
              className="w-8 h-8 rounded-full border border-rose-500/50 grayscale"
            />
            <div>
              <p className="font-bold text-white line-through">{profile?.username}</p>
              <p className="text-[10px] text-discord-text-muted">
                {profile?.discord_id ? `Discord #${profile.discord_id.slice(-4)}` : 'Usuario'}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            BANEADO
          </span>
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-discord-secondary hover:bg-discord-hover border border-discord-border/70 text-xs font-semibold text-white transition-all w-full"
        >
          <LogOut size={14} />
          <span>Cerrar sesión de Discord</span>
        </button>
      </div>
    </div>
  );
};
