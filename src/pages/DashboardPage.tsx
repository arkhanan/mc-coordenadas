import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coordinateService } from '../services/coordinateService';
import { projectService } from '../services/projectService';
import { adminService } from '../services/adminService';
import { Coordinate, Project, ServerStats } from '../types';
import { DimensionBadge, StatusBadge } from '../components/common/Badge';
import { CoordinateCopyButton } from '../components/common/CoordinateCopyButton';
import {
  MapPin,
  FolderGit2,
  Users,
  Clock,
  PlusCircle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Server,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { profile, isMod } = useAuth();
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [recentCoords, setRecentCoords] = useState<Coordinate[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [serverStats, coords, projects] = await Promise.all([
          adminService.getServerStats(),
          coordinateService.getAll(),
          projectService.getAll(),
        ]);
        setStats(serverStats);
        setRecentCoords(coords.slice(0, 4));
        setActiveProjects(
          projects
            .filter((p) => p.estado === 'aprobado' || p.estado === 'en_construccion' || p.estado === 'propuesto')
            .slice(0, 3)
        );
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-discord-card via-discord-secondary to-discord-darkest border border-discord-border/60 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-discord-blurple/20 border border-discord-blurple/30 text-discord-blurple text-xs font-bold mb-3">
              <Compass size={14} />
              <span>Servidor Comunitario Minecraft 1.21</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ¡Bienvenido, {profile?.username || 'Explorador'}!
            </h2>
            <p className="text-sm text-discord-text-muted mt-2 leading-relaxed">
              Registra tus granjas, bases y portales sin tiempos de espera. Si planeas una mega construcción comunitaria, propón el proyecto para que el equipo de moderación lo valide.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <Link
                to="/coordenadas/crear"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-discord-blurple hover:bg-discord-blurple-hover text-white text-xs font-bold shadow-md shadow-discord-blurple/25 transition-all"
              >
                <PlusCircle size={15} />
                <span>Publicar Coordenada</span>
              </Link>
              <Link
                to="/proyectos/crear"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-discord-hover hover:bg-discord-border border border-discord-border/70 text-discord-text-header text-xs font-bold transition-all"
              >
                <PlusCircle size={15} className="text-amber-400" />
                <span>Proponer Proyecto</span>
              </Link>
              {isMod && (
                <Link
                  to="/moderacion"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all"
                >
                  <ShieldCheck size={15} />
                  <span>Panel Moderación</span>
                </Link>
              )}
            </div>
          </div>

          {/* Server Info Card */}
          <div className="bg-discord-darkest/80 border border-discord-border/70 rounded-xl p-4 min-w-[240px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-discord-text-muted flex items-center gap-1.5">
                <Server size={14} className="text-discord-green" />
                ESTADO SERVIDOR
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                ONLINE
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs text-discord-text-normal">
              <p className="flex justify-between">
                <span className="text-discord-text-muted">Dificultad:</span>
                <span className="text-white font-semibold">Difícil (Hard)</span>
              </p>
              <p className="flex justify-between">
                <span className="text-discord-text-muted">Whitelist:</span>
                <span className="text-emerald-400 font-semibold">Activada</span>
              </p>
              <p className="flex justify-between">
                <span className="text-discord-text-muted">PvP:</span>
                <span className="text-amber-400 font-semibold">En arenas</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-discord-card border border-discord-border/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-discord-text-muted uppercase tracking-wider">
              Coordenadas
            </p>
            <p className="text-2xl font-black text-white mt-1">
              {loading ? '...' : stats?.totalCoordinates ?? 0}
            </p>
            <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Disponibles al instante</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MapPin size={24} />
          </div>
        </div>

        <div className="bg-discord-card border border-discord-border/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-discord-text-muted uppercase tracking-wider">
              Proyectos Totales
            </p>
            <p className="text-2xl font-black text-white mt-1">
              {loading ? '...' : stats?.totalProjects ?? 0}
            </p>
            <p className="text-[11px] text-cyan-400 font-medium mt-0.5">
              {stats?.activeProjects ?? 0} en marcha
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <FolderGit2 size={24} />
          </div>
        </div>

        <div className="bg-discord-card border border-discord-border/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-discord-text-muted uppercase tracking-wider">
              En Revisión
            </p>
            <p className="text-2xl font-black text-white mt-1">
              {loading ? '...' : stats?.pendingApprovals ?? 0}
            </p>
            <p className="text-[11px] text-amber-400 font-medium mt-0.5">Esperando moderación</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-discord-card border border-discord-border/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-discord-text-muted uppercase tracking-wider">
              Comunidad
            </p>
            <p className="text-2xl font-black text-white mt-1">
              {loading ? '...' : stats?.totalMembers ?? 0}
            </p>
            <p className="text-[11px] text-discord-blurple font-medium mt-0.5">Jugadores verificados</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-discord-blurple/10 border border-discord-blurple/20 flex items-center justify-center text-discord-blurple">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Coordinates & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Coordinates */}
        <div className="bg-discord-card border border-discord-border/60 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-discord-border/50 mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white">Últimas Coordenadas</h3>
              </div>
              <Link
                to="/coordenadas"
                className="text-xs font-semibold text-discord-blurple hover:underline flex items-center gap-1"
              >
                <span>Ver todas</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="space-y-3">
              {recentCoords.map((coord) => (
                <div
                  key={coord.id}
                  className="p-3 rounded-xl bg-discord-secondary/70 hover:bg-discord-secondary border border-discord-border/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{coord.nombre}</span>
                        <DimensionBadge dimension={coord.dimension} />
                        <span className="text-[11px] text-discord-text-muted bg-discord-darkest px-2 py-0.5 rounded">
                          {coord.categoria}
                        </span>
                      </div>
                      {coord.descripcion && (
                        <p className="text-xs text-discord-text-muted mt-1 line-clamp-1">
                          {coord.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-discord-border/40 flex items-center justify-between">
                    <CoordinateCopyButton
                      x={coord.x}
                      y={coord.y}
                      z={coord.z}
                      dimension={coord.dimension}
                      variant="simple"
                    />
                    <span className="text-[11px] text-discord-text-muted">
                      Por: <strong className="text-discord-text-normal">{coord.usuario?.username || 'Comunidad'}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-discord-border/40 text-center">
            <Link
              to="/coordenadas/crear"
              className="text-xs font-semibold text-discord-text-muted hover:text-white transition-colors"
            >
              + ¿Descubriste un nuevo punto de interés? Publica su coordenada aquí.
            </Link>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-discord-card border border-discord-border/60 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-discord-border/50 mb-4">
              <div className="flex items-center gap-2">
                <FolderGit2 size={18} className="text-cyan-400" />
                <h3 className="text-base font-bold text-white">Proyectos Comunitarios</h3>
              </div>
              <Link
                to="/proyectos"
                className="text-xs font-semibold text-discord-blurple hover:underline flex items-center gap-1"
              >
                <span>Explorar proyectos</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="space-y-3">
              {activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-3.5 rounded-xl bg-discord-secondary/70 hover:bg-discord-secondary border border-discord-border/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-white truncate">{project.nombre}</h4>
                    <StatusBadge status={project.estado} />
                  </div>
                  <p className="text-xs text-discord-text-muted mt-1 line-clamp-2">
                    {project.descripcion}
                  </p>
                  <div className="mt-2 pt-2 border-t border-discord-border/40 flex items-center justify-between text-xs text-discord-text-muted">
                    <span className="truncate max-w-[200px]">📍 {project.ubicacion}</span>
                    <span>
                      Líder: <strong className="text-white">{project.responsable?.username || 'Anónimo'}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-discord-border/40 text-center">
            <Link
              to="/proyectos/crear"
              className="text-xs font-semibold text-discord-text-muted hover:text-white transition-colors"
            >
              + ¿Tienes una idea para el servidor? Envía tu propuesta a revisión.
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
