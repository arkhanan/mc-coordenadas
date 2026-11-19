import React from 'react';
import { ShieldAlert, LogOut, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useServerConfig } from '../context/ServerConfigContext';

export const MaintenancePage: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { config } = useServerConfig();

  return (
    <div className="min-h-screen bg-discord-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-discord-card border border-amber-500/30 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative z-10 text-center animate-fade-in">
        {/* Maintenance Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-5 shadow-lg shadow-amber-500/10">
          <ShieldAlert size={36} />
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
          <span>Acceso Restringido</span>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight mb-3">
          Modo Mantenimiento Activo
        </h1>

        <p className="text-sm text-discord-text-muted leading-relaxed mb-6">
          {config.maintenance_message ||
            'La administración ha activado el modo mantenimiento. El acceso para jugadores normales está temporalmente bloqueado mientras se realizan mejoras o cambios en el servidor.'}
        </p>

        {/* Server Info Pill */}
        <div className="bg-discord-darkest/80 border border-discord-border/60 rounded-xl p-3.5 mb-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-discord-text-normal">
            <Server size={16} className="text-discord-blurple" />
            <span className="font-mono text-white font-semibold">{config.server_ip}</span>
          </div>
          <span className="text-[11px] font-semibold text-discord-text-muted">
            {config.server_version}
          </span>
        </div>

        {/* User Card */}
        <div className="bg-discord-secondary/40 rounded-xl p-3 mb-6 flex items-center justify-between border border-discord-border/40 text-xs">
          <div className="flex items-center gap-2 text-left">
            <img
              src={
                profile?.avatar_url ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'player'}`
              }
              alt={profile?.username}
              className="w-7 h-7 rounded-full border border-discord-border"
            />
            <div>
              <p className="font-bold text-white leading-tight">{profile?.username}</p>
              <p className="text-[10px] text-discord-text-muted">Rol: Usuario</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
            Sin acceso Staff
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

      <p className="text-xs text-discord-text-muted/60 mt-6 font-mono">
        Solo moderadores y administradores autorizados pueden acceder.
      </p>
    </div>
  );
};
