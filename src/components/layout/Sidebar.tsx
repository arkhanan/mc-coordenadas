import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  MapPin,
  PlusCircle,
  FolderGit2,
  Hammer,
  ShieldCheck,
  Settings,
  LayoutDashboard,
  Mic,
  Headphones,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { coordinateService } from '../../services/coordinateService';
import { projectService } from '../../services/projectService';

export const Sidebar: React.FC = () => {
  const { profile, isMod, isAdmin } = useAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [reportCount, setReportCount] = useState<number>(0);

  // Poll or refresh badges for moderation
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [projects, reports] = await Promise.all([
          projectService.getAll(),
          coordinateService.getReports(),
        ]);
        setPendingCount(projects.filter((p) => p.estado === 'propuesto').length);
        setReportCount(reports.filter((r) => r.estado === 'pendiente').length);
      } catch (err) {
        console.error('Error fetching sidebar badges:', err);
      }
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 8000);
    return () => clearInterval(interval);
  }, []);

  const totalModAlerts = pendingCount + reportCount;

  return (
    <aside className="w-64 bg-discord-secondary flex flex-col flex-shrink-0 border-r border-discord-border/50 select-none">
      {/* Server Header */}
      <div className="h-14 px-4 border-b border-discord-border/50 flex items-center justify-between shadow-sm bg-discord-card/50">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-discord-blurple to-indigo-700 flex items-center justify-center text-white shadow-md font-bold">
            <Compass size={18} className="animate-spin-slow" />
          </div>
          <div className="truncate">
            <h1 className="text-sm font-extrabold text-white tracking-tight truncate flex items-center gap-1.5">
              MineCoords
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-discord-blurple/30 text-discord-blurple">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-discord-text-muted flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              Servidor Activo
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Channels */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {/* Category: EXPLORACIÓN */}
        <div>
          <div className="px-2 mb-1.5 text-[11px] font-bold tracking-wider text-discord-text-muted uppercase flex items-center justify-between">
            <span>Exploración</span>
            <Sparkles size={11} className="text-discord-text-muted" />
          </div>
          <nav className="space-y-0.5">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-discord-card text-white'
                    : 'text-discord-text-muted hover:bg-discord-hover hover:text-discord-text-normal'
                }`
              }
            >
              <LayoutDashboard size={18} className="text-discord-text-muted" />
              <span>dashboard</span>
            </NavLink>

            <NavLink
              to="/coordenadas"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-discord-card text-white'
                    : 'text-discord-text-muted hover:bg-discord-hover hover:text-discord-text-normal'
                }`
              }
            >
              <MapPin size={18} className="text-emerald-400" />
              <span>coordenadas</span>
            </NavLink>

            <NavLink
              to="/coordenadas/crear"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-discord-card text-white'
                    : 'text-discord-text-muted hover:bg-discord-hover hover:text-discord-text-normal'
                }`
              }
            >
              <PlusCircle size={18} className="text-discord-blurple" />
              <span>publicar-coordenada</span>
            </NavLink>
          </nav>
        </div>

        {/* Category: PROYECTOS */}
        <div>
          <div className="px-2 mb-1.5 text-[11px] font-bold tracking-wider text-discord-text-muted uppercase flex items-center justify-between">
            <span>Comunidad</span>
            <Hammer size={11} className="text-discord-text-muted" />
          </div>
          <nav className="space-y-0.5">
            <NavLink
              to="/proyectos"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-discord-card text-white'
                    : 'text-discord-text-muted hover:bg-discord-hover hover:text-discord-text-normal'
                }`
              }
            >
              <FolderGit2 size={18} className="text-cyan-400" />
              <span>proyectos-comunitarios</span>
            </NavLink>

            <NavLink
              to="/proyectos/crear"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-discord-card text-white'
                    : 'text-discord-text-muted hover:bg-discord-hover hover:text-discord-text-normal'
                }`
              }
            >
              <PlusCircle size={18} className="text-yellow-400" />
              <span>proponer-proyecto</span>
            </NavLink>
          </nav>
        </div>

        {/* Category: STAFF & GESTIÓN (Visible if Mod or Admin) */}
        {isMod && (
          <div>
            <div className="px-2 mb-1.5 text-[11px] font-bold tracking-wider text-rose-400/90 uppercase flex items-center justify-between">
              <span>Staff & Moderación</span>
              <ShieldCheck size={12} className="text-rose-400" />
            </div>
            <nav className="space-y-0.5">
              <NavLink
                to="/moderacion"
                className={({ isActive }) =>
                  `flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-discord-card text-white'
                      : 'text-discord-text-muted hover:bg-discord-hover hover:text-discord-text-normal'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-indigo-400" />
                  <span>panel-moderación</span>
                </div>
                {totalModAlerts > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                    {totalModAlerts}
                  </span>
                )}
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/administracion"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-discord-card text-white'
                        : 'text-discord-text-muted hover:bg-discord-hover hover:text-discord-text-normal'
                    }`
                  }
                >
                  <Settings size={18} className="text-rose-400" />
                  <span>administración</span>
                </NavLink>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Bottom User Voice-style Footer */}
      <div className="h-14 bg-discord-darkest/90 px-3 flex items-center justify-between border-t border-discord-border/40">
        <div className="flex items-center gap-2 truncate">
          <img
            src={
              profile?.avatar_url ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'player'}`
            }
            alt={profile?.username}
            className="w-8 h-8 rounded-full border border-discord-border object-cover flex-shrink-0"
          />
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate leading-none">
              {profile?.username || 'Invitado'}
            </p>
            <p className="text-[10px] text-discord-text-muted font-mono truncate leading-tight mt-0.5 capitalize">
              {profile?.role || 'usuario'}
            </p>
          </div>
        </div>

        <div className="flex items-center text-discord-text-muted">
          <button
            title="Micrófono"
            className="p-1.5 hover:text-white hover:bg-discord-card rounded transition-colors"
          >
            <Mic size={15} />
          </button>
          <button
            title="Auriculares"
            className="p-1.5 hover:text-white hover:bg-discord-card rounded transition-colors"
          >
            <Headphones size={15} />
          </button>
          <button
            title="Ajustes de audio"
            className="p-1.5 hover:text-white hover:bg-discord-card rounded transition-colors"
          >
            <Sliders size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};
