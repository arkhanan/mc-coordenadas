import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';
import {
  LogOut,
  Server,
  Copy,
  Check,
  Database,
  Users,
  Gamepad2,
} from 'lucide-react';
import { INITIAL_PROFILES } from '../../lib/mockData';
import { checkMinecraftServerStatus, MinecraftServerStatus } from '../../services/minecraftServerService';
import { LinkMinecraftModal } from '../common/LinkMinecraftModal';
import { useServerConfig } from '../../context/ServerConfigContext';

export const Navbar: React.FC = () => {
  const { profile, role, signOut, isSupabaseConnected, switchDemoUser } = useAuth();
  const { config } = useServerConfig();
  const [copiedIp, setCopiedIp] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const serverIp = config.server_ip || 'play.minecraft-comunidad.net';
  const [serverStatus, setServerStatus] = useState<MinecraftServerStatus | null>(null);

  useEffect(() => {
    checkMinecraftServerStatus(serverIp).then(setServerStatus);
    const interval = setInterval(() => {
      checkMinecraftServerStatus(serverIp).then(setServerStatus);
    }, 45000); // Consulta cada 45 segundos
    return () => clearInterval(interval);
  }, [serverIp]);

  const handleCopyIp = () => {
    navigator.clipboard.writeText(serverIp);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const isOnline = serverStatus ? serverStatus.online : true;

  return (
    <header className="h-14 bg-discord-card border-b border-discord-border/50 px-4 flex items-center justify-between flex-shrink-0 z-20">
      {/* Left: Server IP copy banner */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopyIp}
          title="Click para copiar la IP del servidor"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-discord-secondary/80 hover:bg-discord-secondary border border-discord-border/60 text-xs font-medium text-discord-text-normal hover:text-white transition-all group"
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <Server size={14} className={isOnline ? 'text-discord-green' : 'text-rose-400'} />
          <span className="font-mono text-white/90">{serverIp}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-semibold ${
            isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            {isOnline ? `${serverStatus?.playersOnline ?? 0} online` : 'Apagado'}
          </span>
          {copiedIp ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold ml-1">
              <Check size={12} /> ¡Copiada!
            </span>
          ) : (
            <Copy size={12} className="text-discord-text-muted group-hover:text-white ml-1 opacity-70" />
          )}
        </button>

        {/* Database status pill */}
        <div
          title={
            isSupabaseConnected
              ? 'Conectado a PostgreSQL (Supabase Auth & RLS)'
              : 'Modo Demostración / Offline Activo (LocalStorage persistente)'
          }
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-discord-darkest/70 border border-discord-border/60"
        >
          <Database
            size={12}
            className={isSupabaseConnected ? 'text-emerald-400' : 'text-amber-400'}
          />
          <span className={isSupabaseConnected ? 'text-emerald-300' : 'text-amber-300'}>
            {isSupabaseConnected ? 'Supabase Live' : 'Modo Demo Activo'}
          </span>
        </div>

        {/* Maintenance active indicator for Staff */}
        {config.maintenance_mode && (
          <div
            title="El acceso a usuarios normales está bloqueado. Solo el Staff puede entrar."
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300 animate-pulse"
          >
            <span>🔒 Modo Mantenimiento</span>
          </div>
        )}
      </div>

      {/* Right: User card, Role Switcher for Demo testing & Sign Out */}
      <div className="flex items-center gap-3">
        {/* Fast Role Switcher in Demo Mode */}
        {!isSupabaseConnected && (
          <div className="hidden lg:flex items-center gap-1.5 bg-discord-darkest/80 px-2.5 py-1 rounded-lg border border-discord-border/50 text-xs">
            <Users size={13} className="text-discord-blurple" />
            <span className="text-discord-text-muted text-[11px] mr-1">Probar rol:</span>
            <select
              value={profile?.id || INITIAL_PROFILES[0].id}
              onChange={(e) => switchDemoUser(e.target.value)}
              className="bg-discord-card text-white text-xs rounded px-2 py-0.5 border border-discord-border/80 outline-none focus:border-discord-blurple cursor-pointer"
            >
              <option value="u-admin-01">👑 Steve (Administrador)</option>
              <option value="u-mod-02">🛡️ Alex (Moderador)</option>
              <option value="u-user-03">⛏️ CreeperHunter (Usuario)</option>
              <option value="u-user-04">💎 DiamondMiner (Usuario)</option>
            </select>
          </div>
        )}

        {/* Link Minecraft Account Button */}
        <button
          onClick={() => setIsLinkModalOpen(true)}
          title="Vincular tu cuenta de Minecraft con Discord"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-discord-blurple/15 hover:bg-discord-blurple/25 border border-discord-blurple/30 text-xs font-semibold text-discord-blurple transition-all group"
        >
          <Gamepad2 size={14} className="group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">
            {profile?.minecraft_username ? `🎮 ${profile.minecraft_username}` : 'Vincular MC'}
          </span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="relative">
            <img
              src={
                profile?.avatar_url ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'player'}`
              }
              alt={profile?.username}
              className="w-8 h-8 rounded-full border border-discord-border/80 object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-discord-green border-2 border-discord-card" />
          </div>

          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-discord-text-header">
                {profile?.username || 'Jugador'}
              </span>
              <RoleBadge role={role} />
            </div>
            <p className="text-[10px] text-discord-text-muted font-mono truncate max-w-[120px]">
              {profile?.discord_id ? `#${profile.discord_id.slice(-4)}` : 'Discord Auth'}
            </p>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={signOut}
            title="Cerrar sesión"
            className="p-1.5 ml-1 text-discord-text-muted hover:text-rose-400 hover:bg-discord-hover rounded-lg transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <LinkMinecraftModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
      />
    </header>
  );
};
