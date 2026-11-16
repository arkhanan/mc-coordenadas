import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { coordinateService } from '../services/coordinateService';
import { Project, CoordinateReport } from '../types';
import { DimensionBadge, StatusBadge } from '../components/common/Badge';
import { CoordinateCopyButton } from '../components/common/CoordinateCopyButton';
import { Modal } from '../components/common/Modal';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  MapPin,
  Archive,
  RefreshCw,
} from 'lucide-react';

export const ModerationPage: React.FC = () => {
  const { profile, isMod } = useAuth();

  const [activeTab, setActiveTab] = useState<'proyectos' | 'reportes'>('proyectos');
  const [loading, setLoading] = useState(true);

  // Data
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<CoordinateReport[]>([]);

  // Project review modal
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Report resolution modal
  const [selectedReport, setSelectedReport] = useState<CoordinateReport | null>(null);
  const [reportResolution, setReportResolution] = useState('');

  const loadModerationData = async () => {
    try {
      setLoading(true);
      const [allProjects, allReports] = await Promise.all([
        projectService.getAll(),
        coordinateService.getReports(),
      ]);

      setPendingProjects(allProjects.filter((p) => p.estado === 'propuesto'));
      setReports(allReports.filter((r) => r.estado === 'pendiente'));
    } catch (err) {
      console.error('Error loading moderation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModerationData();
  }, []);

  if (!isMod) {
    return (
      <div className="py-20 text-center">
        <ShieldCheck size={48} className="text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Acceso Restringido</h2>
        <p className="text-xs text-discord-text-muted mt-1">
          Esta sección está reservada exclusivamente para moderadores y administradores del servidor.
        </p>
      </div>
    );
  }

  // Handle Project Approval
  const handleApproveProject = async (projectId: string) => {
    if (!profile) return;
    try {
      setActionLoading(true);
      await projectService.review(projectId, profile.id, 'aprobado');
      setSelectedProject(null);
      await loadModerationData();
    } catch (err) {
      console.error('Error approving project:', err);
      alert('No se pudo aprobar el proyecto.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Project Rejection
  const handleRejectProject = async (projectId: string) => {
    if (!profile) return;
    try {
      setActionLoading(true);
      await projectService.review(projectId, profile.id, 'rechazado', rejectionReason.trim());
      setSelectedProject(null);
      setRejectionReason('');
      await loadModerationData();
    } catch (err) {
      console.error('Error rejecting project:', err);
      alert('No se pudo rechazar el proyecto.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Report Resolution (Dismiss or Archive Coordinate)
  const handleResolveReport = async (archiveCoordinate: boolean) => {
    if (!profile || !selectedReport) return;
    try {
      setActionLoading(true);
      const newStatus = archiveCoordinate ? 'resuelto' : 'descartado';
      await coordinateService.resolveReport(
        selectedReport.id,
        profile.id,
        newStatus,
        reportResolution.trim() || (archiveCoordinate ? 'Coordenada archivada por infracción' : 'Reporte descartado / Coordenada válida'),
        archiveCoordinate
      );
      setSelectedReport(null);
      setReportResolution('');
      await loadModerationData();
    } catch (err) {
      console.error('Error resolving report:', err);
      alert('No se pudo procesar la resolución del reporte.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-discord-border/50">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-indigo-400" />
            <span>Panel de Moderación</span>
          </h1>
          <p className="text-xs text-discord-text-muted mt-1">
            Revisión de propuestas comunitarias y gestión de coordenadas reportadas por jugadores.
          </p>
        </div>

        <button
          onClick={loadModerationData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-discord-card hover:bg-discord-hover border border-discord-border/70 text-xs text-discord-text-normal font-semibold transition-all self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-discord-border/50 pb-2">
        <button
          onClick={() => setActiveTab('proyectos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'proyectos'
              ? 'bg-discord-blurple text-white shadow-md'
              : 'text-discord-text-muted hover:text-white hover:bg-discord-secondary'
          }`}
        >
          <FolderGit2 size={16} />
          <span>Proyectos Pendientes</span>
          {pendingProjects.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-discord-darkest font-extrabold text-[10px]">
              {pendingProjects.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reportes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reportes'
              ? 'bg-discord-blurple text-white shadow-md'
              : 'text-discord-text-muted hover:text-white hover:bg-discord-secondary'
          }`}
        >
          <AlertTriangle size={16} />
          <span>Coordenadas Reportadas</span>
          {reports.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-extrabold text-[10px] animate-pulse">
              {reports.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Proyectos Pendientes */}
      {activeTab === 'proyectos' && (
        <div className="space-y-4">
          {pendingProjects.length === 0 ? (
            <div className="bg-discord-card border border-discord-border/60 rounded-2xl p-12 text-center">
              <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-white">¡Bandeja al día!</h3>
              <p className="text-xs text-discord-text-muted mt-1">
                No hay proyectos comunitarios pendientes de revisión en este momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-discord-card border border-discord-border/60 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-0.5 rounded-full">
                        {project.categoria}
                      </span>
                      <StatusBadge status="propuesto" />
                    </div>

                    <h3 className="text-base font-bold text-white">{project.nombre}</h3>
                    <p className="text-xs text-discord-text-muted leading-relaxed line-clamp-3">
                      {project.descripcion}
                    </p>

                    <div className="p-2.5 rounded-xl bg-discord-secondary border border-discord-border/50 text-xs flex items-center gap-2">
                      <MapPin size={15} className="text-discord-blurple flex-shrink-0" />
                      <span className="font-mono text-white truncate">{project.ubicacion}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-discord-text-muted pt-1">
                      <span>Solicitado por:</span>
                      <strong className="text-white">{project.responsable?.username || 'Anónimo'}</strong>
                      <span>({new Date(project.fecha_creacion).toLocaleDateString()})</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-discord-border/40 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleApproveProject(project.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      Aprobar Proyecto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Coordenadas Reportadas */}
      {activeTab === 'reportes' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-discord-card border border-discord-border/60 rounded-2xl p-12 text-center">
              <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-white">Sin reportes activos</h3>
              <p className="text-xs text-discord-text-muted mt-1">
                Todas las coordenadas publicadas se encuentran en orden.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-discord-card border border-rose-500/50 bg-rose-950/10 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle size={15} />
                        Reporte Pendiente
                      </span>
                      <span className="text-[10px] text-discord-text-muted">
                        {new Date(report.fecha_creacion).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Coordinate summary */}
                    <div className="p-3 rounded-xl bg-discord-secondary border border-discord-border/60">
                      <div className="flex items-center gap-2 mb-1">
                        <strong className="text-sm text-white">
                          {report.coordenada?.nombre || 'Coordenada'}
                        </strong>
                        {report.coordenada && (
                          <DimensionBadge dimension={report.coordenada.dimension} />
                        )}
                      </div>
                      {report.coordenada && (
                        <div className="mt-2">
                          <CoordinateCopyButton
                            x={report.coordenada.x}
                            y={report.coordenada.y}
                            z={report.coordenada.z}
                            dimension={report.coordenada.dimension}
                            variant="simple"
                          />
                        </div>
                      )}
                    </div>

                    {/* Report Reason */}
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">
                      <p className="font-bold text-rose-300 mb-0.5">
                        Motivo del reporte (por {report.reportador?.username || 'Usuario'}):
                      </p>
                      <p className="leading-relaxed">{report.motivo}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-discord-border/40 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setReportResolution('Reporte revisado y descartado. La coordenada es legítima.');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-discord-hover hover:bg-discord-border text-discord-text-normal text-xs font-bold transition-all"
                    >
                      Descartar Reporte
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setReportResolution('Coordenada archivada debido a daños, trampas o información falsa.');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Archive size={14} />
                      <span>Archivar Coordenada</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RESOLUTION MODAL */}
      <Modal
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        title="Gestionar Reporte de Coordenada"
        subtitle={selectedReport?.coordenada?.nombre}
        footer={
          <>
            <button
              type="button"
              onClick={() => setSelectedReport(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-discord-text-muted hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleResolveReport(false)}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-discord-card hover:bg-discord-hover border border-discord-border text-emerald-300"
            >
              Descartar (Mantener Activa)
            </button>
            <button
              type="button"
              onClick={() => handleResolveReport(true)}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md"
            >
              {actionLoading ? 'Guardando...' : 'Archivar Coordenada'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-discord-text-normal">
            Puedes descartar el reporte si la coordenada sigue en pie, o archivarla si ha sido destruida o es falsa.
          </p>

          <div>
            <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1">
              Nota de resolución interna:
            </label>
            <textarea
              rows={3}
              value={reportResolution}
              onChange={(e) => setReportResolution(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-discord-input border border-discord-border/80 text-white text-xs focus:outline-none focus:border-discord-blurple"
            />
          </div>
        </div>
      </Modal>

      {/* REJECT PROJECT MODAL */}
      <Modal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        title="Rechazar Propuesta de Proyecto"
        subtitle={selectedProject?.nombre}
        footer={
          <>
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-discord-text-muted hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => selectedProject && handleRejectProject(selectedProject.id)}
              disabled={actionLoading || !rejectionReason.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md disabled:opacity-50"
            >
              {actionLoading ? 'Procesando...' : 'Confirmar Rechazo'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-rose-400 uppercase mb-1">
              Motivo del rechazo (visible para el jugador) *
            </label>
            <textarea
              rows={4}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explica qué correcciones se requieren..."
              className="w-full px-3 py-2 rounded-xl bg-discord-input border border-rose-500/40 text-white placeholder-discord-text-muted text-xs focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
