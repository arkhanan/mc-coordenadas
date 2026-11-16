import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { Project, ProjectStatus, ProjectMaterial, Dimension } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  FolderGit2,
  PlusCircle,
  Search,
  Hammer,
  CheckCircle2,
  MapPin,
  Trash2,
  AlertCircle,
  Video,
  Boxes,
  FileCode,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STATUS_TABS: { label: string; value: ProjectStatus | 'todos' }[] = [
  { label: 'Todos los Proyectos', value: 'todos' },
  { label: 'Propuestos', value: 'propuesto' },
  { label: 'Aprobados', value: 'aprobado' },
  { label: 'En Construcción', value: 'en_construccion' },
  { label: 'Finalizados', value: 'finalizado' },
  { label: 'Rechazados', value: 'rechazado' },
];

export const ProjectsPage: React.FC = () => {
  const { profile, isMod } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | 'todos'>('todos');

  // Review Modal state (for quick review from project list)
  const [reviewingProject, setReviewingProject] = useState<Project | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [useCustomCoords, setUseCustomCoords] = useState(false);
  const [approvalCoords, setApprovalCoords] = useState<{
    dimension: Dimension;
    x: number;
    y: number;
    z: number;
    publicarCoordenada: boolean;
  }>({
    dimension: 'Overworld',
    x: 0,
    y: 64,
    z: 0,
    publicarCoordenada: true,
  });

  // Expansion of materials per project
  const [expandedMaterials, setExpandedMaterials] = useState<Record<string, boolean>>({});

  // Editing materials progress modal
  const [editingMaterialsProject, setEditingMaterialsProject] = useState<Project | null>(null);
  const [tempMaterials, setTempMaterials] = useState<ProjectMaterial[]>([]);
  const [savingMaterials, setSavingMaterials] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const toggleMaterials = (projectId: string) => {
    setExpandedMaterials((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleOpenMaterialsModal = (project: Project) => {
    setEditingMaterialsProject(project);
    setTempMaterials(project.materiales ? JSON.parse(JSON.stringify(project.materiales)) : []);
  };

  const handleSaveMaterialsProgress = async () => {
    if (!editingMaterialsProject) return;
    try {
      setSavingMaterials(true);
      await projectService.updateMaterials(editingMaterialsProject.id, tempMaterials);
      setEditingMaterialsProject(null);
      await loadProjects();
    } catch (err) {
      console.error('Error updating materials progress:', err);
      alert('Error al actualizar el progreso de materiales.');
    } finally {
      setSavingMaterials(false);
    }
  };

  // Filter logic
  const filteredProjects = projects.filter((p) => {
    // Regular users can only see their own proposed or rejected projects, or any approved/en_construccion/finalizado
    if (!isMod && p.responsable_id !== profile?.id) {
      if (p.estado === 'propuesto' || p.estado === 'rechazado' || p.estado === 'cancelado') {
        return false;
      }
    }

    const matchesStatus =
      selectedStatus === 'todos' ? true : p.estado === selectedStatus;

    const matchesSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.responsable?.username && p.responsable.username.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Handle Review
  const handleOpenReview = (project: Project) => {
    let guessedX = 0;
    let guessedY = 64;
    let guessedZ = 0;
    let guessedDim: Dimension = 'Overworld';

    if (project.ubicacion.toLowerCase().includes('nether')) guessedDim = 'Nether';
    if (project.ubicacion.toLowerCase().includes('end')) guessedDim = 'The End';

    const xMatch = project.ubicacion.match(/x\s*[:=]?\s*(-?\d+)/i);
    const yMatch = project.ubicacion.match(/y\s*[:=]?\s*(-?\d+)/i);
    const zMatch = project.ubicacion.match(/z\s*[:=]?\s*(-?\d+)/i);

    if (xMatch) guessedX = parseInt(xMatch[1], 10);
    if (yMatch) guessedY = parseInt(yMatch[1], 10);
    if (zMatch) guessedZ = parseInt(zMatch[1], 10);

    setUseCustomCoords(false);
    setApprovalCoords({
      dimension: guessedDim,
      x: guessedX,
      y: guessedY,
      z: guessedZ,
      publicarCoordenada: true,
    });
    setReviewingProject(project);
    setIsRejecting(false);
    setRejectionReason('');
  };

  const handleApprove = async (projectId: string) => {
    if (!profile) return;
    try {
      setReviewLoading(true);

      const finalCoordsPayload = useCustomCoords
        ? {
            dimension: approvalCoords.dimension,
            x: Number(approvalCoords.x),
            y: Number(approvalCoords.y),
            z: Number(approvalCoords.z),
            publicarCoordenada: approvalCoords.publicarCoordenada,
          }
        : approvalCoords.publicarCoordenada
        ? {
            dimension: approvalCoords.dimension,
            x: Number(approvalCoords.x),
            y: Number(approvalCoords.y),
            z: Number(approvalCoords.z),
            publicarCoordenada: true,
          }
        : undefined;

      await projectService.review(projectId, profile.id, 'aprobado', undefined, finalCoordsPayload);
      setReviewingProject(null);
      await loadProjects();
    } catch (err) {
      console.error('Error approving project:', err);
      alert('Error al aprobar el proyecto.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReject = async (projectId: string) => {
    if (!profile) return;
    try {
      setReviewLoading(true);
      await projectService.review(projectId, profile.id, 'rechazado', rejectionReason.trim());
      setReviewingProject(null);
      setIsRejecting(false);
      setRejectionReason('');
      await loadProjects();
    } catch (err) {
      console.error('Error rejecting project:', err);
      alert('Error al rechazar el proyecto.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Status progression by owner (e.g. from 'aprobado' to 'en_construccion' to 'finalizado')
  const handleAdvanceStatus = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      await projectService.updateStatus(projectId, newStatus);
      await loadProjects();
    } catch (err) {
      console.error('Error advancing project status:', err);
      alert('No se pudo actualizar el estado del proyecto.');
    }
  };

  // Delete project
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el proyecto "${name}"?`)) return;
    try {
      await projectService.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('No se pudo eliminar el proyecto.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-discord-border/50">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="text-cyan-400" />
            <span>Proyectos Comunitarios</span>
          </h1>
          <p className="text-xs text-discord-text-muted mt-1">
            Plataforma para organizar y validar mega proyectos, distritos comunitarios y granjas masivas.
          </p>
        </div>

        <Link
          to="/proyectos/crear"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-discord-blurple hover:bg-discord-blurple-hover text-white text-xs font-bold shadow-md shadow-discord-blurple/25 transition-all"
        >
          <PlusCircle size={16} />
          <span>Proponer Proyecto</span>
        </Link>
      </div>

      {/* Search and Status Pills */}
      <div className="bg-discord-card border border-discord-border/60 rounded-2xl p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-discord-text-muted" />
          <input
            type="text"
            placeholder="Buscar proyectos por nombre, descripción o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white placeholder-discord-text-muted text-xs focus:outline-none focus:border-discord-blurple transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-discord-border/40 scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedStatus === tab.value
                  ? 'bg-discord-blurple text-white font-bold shadow-sm'
                  : 'bg-discord-secondary/70 text-discord-text-muted hover:text-white hover:bg-discord-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="py-16 text-center text-discord-text-muted">
          <div className="w-8 h-8 border-2 border-discord-blurple border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Cargando proyectos comunitarios...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-discord-card border border-discord-border/60 rounded-2xl p-12 text-center">
          <FolderGit2 size={40} className="text-discord-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-white">No hay proyectos en esta categoría</h3>
          <p className="text-xs text-discord-text-muted mt-1 max-w-sm mx-auto">
            Sé el primero en proponer una granja masiva o monumento comunitario para el servidor.
          </p>
          <Link
            to="/proyectos/crear"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-discord-blurple text-white text-xs font-bold"
          >
            <PlusCircle size={15} />
            <span>Proponer Proyecto</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((project) => {
            const isOwner = profile?.id === project.responsable_id;
            const canManage = isOwner || isMod;
            const hasMaterials = project.materiales && project.materiales.length > 0;
            const isExpanded = Boolean(expandedMaterials[project.id]);

            // Calculate overall material percentage
            let totalRequired = 0;
            let totalGathered = 0;
            if (hasMaterials) {
              project.materiales!.forEach((m) => {
                totalRequired += m.cantidad_requerida;
                totalGathered += Math.min(m.cantidad_reunida, m.cantidad_requerida);
              });
            }
            const overallProgress = totalRequired > 0 ? Math.round((totalGathered / totalRequired) * 100) : 0;

            return (
              <div
                key={project.id}
                className="bg-discord-card border border-discord-border/60 hover:border-discord-blurple/50 rounded-2xl p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Top Bar: Category Pill & Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-800/40 px-2.5 py-0.5 rounded-full">
                      {project.categoria}
                    </span>
                    <StatusBadge status={project.estado} />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-white leading-snug">{project.nombre}</h3>
                  <p className="text-xs text-discord-text-muted mt-2 leading-relaxed">
                    {project.descripcion}
                  </p>

                  {/* Location Banner */}
                  <div className="mt-3.5 p-2.5 rounded-xl bg-discord-secondary/80 border border-discord-border/60 flex items-center gap-2 text-xs">
                    <MapPin size={15} className="text-discord-blurple flex-shrink-0" />
                    <span className="text-discord-text-muted">Ubicación:</span>
                    <span className="font-mono text-white font-medium truncate">
                      {project.ubicacion}
                    </span>
                  </div>

                  {/* Video & Schematic Links */}
                  {(project.video_url || project.schematic_url) && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {project.video_url && (
                        <a
                          href={project.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-[11px] font-bold text-rose-300 transition-all"
                        >
                          <Video size={13} className="text-rose-400" />
                          <span>Ver Tutorial (YouTube)</span>
                          <ExternalLink size={10} className="opacity-70" />
                        </a>
                      )}
                      {project.schematic_url && (
                        <a
                          href={project.schematic_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-[11px] font-bold text-purple-300 transition-all"
                        >
                          <FileCode size={13} className="text-purple-400" />
                          <span>Descargar Schematic (.litematic)</span>
                          <ExternalLink size={10} className="opacity-70" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Materials Checklist Section */}
                  {hasMaterials && (
                    <div className="mt-3.5 p-3 rounded-xl bg-discord-darkest/70 border border-discord-border/60 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => toggleMaterials(project.id)}
                          className="font-bold text-discord-text-normal hover:text-white flex items-center gap-1.5 transition-colors"
                        >
                          <Boxes size={14} className="text-cyan-400" />
                          <span>Materiales ({project.materiales!.length})</span>
                          <span className="text-[11px] font-mono text-cyan-300">
                            ({overallProgress}%)
                          </span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleOpenMaterialsModal(project)}
                            className="text-[11px] font-bold text-discord-blurple hover:underline"
                          >
                            Actualizar donaciones
                          </button>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-discord-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-discord-blurple to-emerald-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${overallProgress}%` }}
                        />
                      </div>

                      {/* Expandable list */}
                      {isExpanded && (
                        <div className="pt-2 space-y-1.5 border-t border-discord-border/40 max-h-48 overflow-y-auto pr-1">
                          {project.materiales!.map((mat) => {
                            const percent = mat.cantidad_requerida > 0
                              ? Math.min(100, Math.round((mat.cantidad_reunida / mat.cantidad_requerida) * 100))
                              : 0;
                            const isDone = mat.cantidad_reunida >= mat.cantidad_requerida;

                            return (
                              <div
                                key={mat.id}
                                className="flex items-center justify-between text-[11px] p-1.5 rounded bg-discord-secondary/50 font-mono"
                              >
                                <span className={`truncate ${isDone ? 'line-through text-discord-text-muted' : 'text-discord-text-normal'}`}>
                                  {mat.nombre}
                                </span>
                                <span className={`font-semibold ml-2 flex-shrink-0 ${isDone ? 'text-emerald-400' : 'text-amber-300'}`}>
                                  {mat.cantidad_reunida} / {mat.cantidad_requerida} {mat.unidad || ''} ({percent}%)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rejection notice if state is 'rechazado' */}
                  {project.estado === 'rechazado' && project.motivo_rechazo && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block">Motivo del rechazo:</strong>
                        <span>{project.motivo_rechazo}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer and Progression Controls */}
                <div className="mt-5 pt-3 border-t border-discord-border/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    {/* Responsable User */}
                    <div className="flex items-center gap-2 truncate">
                      <img
                        src={
                          project.responsable?.avatar_url ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${project.responsable?.username || 'user'}`
                        }
                        alt={project.responsable?.username}
                        className="w-6 h-6 rounded-full border border-discord-border object-cover flex-shrink-0"
                      />
                      <div className="truncate">
                        <span className="font-bold text-discord-text-normal truncate leading-none">
                          {project.responsable?.username || 'Anónimo'}
                        </span>
                        <span className="text-[10px] text-discord-text-muted ml-1.5">
                          {new Date(project.fecha_creacion).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Delete button if authorized */}
                    {canManage && (
                      <button
                        onClick={() => handleDelete(project.id, project.nombre)}
                        title="Eliminar proyecto"
                        className="p-1.5 rounded-lg text-discord-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {/* State Progression or Review Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    {/* Moderator Review shortcut for proposed projects */}
                    {isMod && project.estado === 'propuesto' && (
                      <button
                        onClick={() => handleOpenReview(project)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all"
                      >
                        Revisar Propuesta
                      </button>
                    )}

                    {/* Owner status progression */}
                    {isOwner && project.estado === 'aprobado' && (
                      <button
                        onClick={() => handleAdvanceStatus(project.id, 'en_construccion')}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Hammer size={14} />
                        <span>Iniciar Construcción</span>
                      </button>
                    )}

                    {isOwner && project.estado === 'en_construccion' && (
                      <button
                        onClick={() => handleAdvanceStatus(project.id, 'finalizado')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={14} />
                        <span>Marcar como Finalizado</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL ACTUALIZAR PROGRESO DE MATERIALES */}
      <Modal
        isOpen={Boolean(editingMaterialsProject)}
        onClose={() => setEditingMaterialsProject(null)}
        title="Actualizar Donaciones y Materiales"
        subtitle={editingMaterialsProject?.nombre}
        maxWidth="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingMaterialsProject(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-discord-text-muted hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveMaterialsProgress}
              disabled={savingMaterials}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-discord-blurple hover:bg-discord-blurple-hover text-white shadow-md disabled:opacity-50 transition-all"
            >
              {savingMaterials ? 'Guardando...' : 'Guardar Progreso'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-discord-text-muted">
            Ingresa la cantidad reunida o donada hasta el momento para cada material del proyecto.
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {tempMaterials.map((mat, idx) => (
              <div
                key={mat.id}
                className="p-3 rounded-xl bg-discord-secondary/70 border border-discord-border/60 flex items-center justify-between gap-3"
              >
                <div className="truncate flex-1">
                  <span className="font-bold text-white text-xs block truncate">{mat.nombre}</span>
                  <span className="text-[11px] text-discord-text-muted">
                    Meta: {mat.cantidad_requerida} {mat.unidad || 'bloques'}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-discord-text-muted font-mono">Reunido:</span>
                  <input
                    type="number"
                    min="0"
                    value={mat.cantidad_reunida}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      const updated = [...tempMaterials];
                      updated[idx] = { ...updated[idx], cantidad_reunida: val };
                      setTempMaterials(updated);
                    }}
                    className="w-24 px-2.5 py-1.5 rounded-lg bg-discord-input border border-discord-border/80 text-white font-mono text-xs focus:outline-none focus:border-discord-blurple"
                  />
                  <span className="text-xs text-discord-text-muted">{mat.unidad || ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* REVIEW MODAL */}
      <Modal
        isOpen={Boolean(reviewingProject)}
        onClose={() => setReviewingProject(null)}
        title="Revisar Proyecto Propuesto"
        subtitle={reviewingProject?.nombre}
        footer={
          !isRejecting ? (
            <>
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => reviewingProject && handleApprove(reviewingProject.id)}
                disabled={reviewLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all disabled:opacity-50"
              >
                {reviewLoading ? 'Aprobando...' : 'Aprobar Proyecto'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsRejecting(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-discord-text-muted hover:text-white transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => reviewingProject && handleReject(reviewingProject.id)}
                disabled={reviewLoading || !rejectionReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all disabled:opacity-50"
              >
                {reviewLoading ? 'Procesando...' : 'Confirmar Rechazo'}
              </button>
            </>
          )
        }
      >
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-bold text-discord-text-muted uppercase">
              Descripción del solicitante:
            </span>
            <p className="text-xs text-white mt-1 p-3 rounded-xl bg-discord-input border border-discord-border/70">
              {reviewingProject?.descripcion}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-bold text-discord-text-muted uppercase">
              Ubicación propuesta:
            </span>
            <p className="text-xs font-mono text-cyan-300 mt-1">
              {reviewingProject?.ubicacion}
            </p>
          </div>

          {/* Opciones de coordenadas para el moderador */}
          {!isRejecting && (
            <div className="space-y-3 pt-2 border-t border-discord-border/50">
              <label className="block text-xs font-bold text-discord-text-muted uppercase">
                Gestión de Coordenadas al Aprobar:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUseCustomCoords(false)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    !useCustomCoords
                      ? 'bg-discord-blurple/20 border-discord-blurple text-white font-bold'
                      : 'bg-discord-secondary/60 border-discord-border/60 text-discord-text-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${!useCustomCoords ? 'border-discord-blurple bg-discord-blurple' : 'border-discord-border'}`}>
                      {!useCustomCoords && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span>Dejar propuesta</span>
                  </div>
                  <p className="text-[10px] text-discord-text-muted font-normal pl-5">
                    Conserva la descripción original.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUseCustomCoords(true)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    useCustomCoords
                      ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                      : 'bg-discord-secondary/60 border-discord-border/60 text-discord-text-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${useCustomCoords ? 'border-emerald-500 bg-emerald-500' : 'border-discord-border'}`}>
                      {useCustomCoords && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span>Establecer coordenadas reales</span>
                  </div>
                  <p className="text-[10px] text-discord-text-muted font-normal pl-5">
                    Fijar X, Y, Z exactas del proyecto.
                  </p>
                </button>
              </div>

              {useCustomCoords && (
                <div className="p-3 rounded-xl bg-discord-card border border-emerald-500/40 space-y-2.5">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase block">
                    Coordenadas Finales Oficiales
                  </span>
                  <div>
                    <label className="block text-[11px] font-bold text-discord-text-muted uppercase mb-1">
                      Dimensión
                    </label>
                    <select
                      value={approvalCoords.dimension}
                      onChange={(e) =>
                        setApprovalCoords({ ...approvalCoords, dimension: e.target.value as Dimension })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-discord-input border border-discord-border/80 text-white text-xs"
                    >
                      <option value="Overworld">Overworld</option>
                      <option value="Nether">Nether</option>
                      <option value="The End">The End</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-discord-text-muted uppercase mb-0.5">X</label>
                      <input
                        type="number"
                        value={approvalCoords.x}
                        onChange={(e) => setApprovalCoords({ ...approvalCoords, x: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded bg-discord-input border border-discord-border/80 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-discord-text-muted uppercase mb-0.5">Y</label>
                      <input
                        type="number"
                        value={approvalCoords.y}
                        onChange={(e) => setApprovalCoords({ ...approvalCoords, y: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded bg-discord-input border border-discord-border/80 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-discord-text-muted uppercase mb-0.5">Z</label>
                      <input
                        type="number"
                        value={approvalCoords.z}
                        onChange={(e) => setApprovalCoords({ ...approvalCoords, z: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded bg-discord-input border border-discord-border/80 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer text-xs text-discord-text-normal pt-1">
                <input
                  type="checkbox"
                  checked={approvalCoords.publicarCoordenada}
                  onChange={(e) => setApprovalCoords({ ...approvalCoords, publicarCoordenada: e.target.checked })}
                  className="rounded text-discord-blurple"
                />
                <span>Publicar automáticamente en la lista de Coordenadas del servidor</span>
              </label>
            </div>
          )}

          {reviewingProject?.video_url && (
            <div>
              <span className="text-[11px] font-bold text-discord-text-muted uppercase">
                Video Tutorial:
              </span>
              <a
                href={reviewingProject.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-rose-400 hover:underline flex items-center gap-1.5 mt-1"
              >
                <Video size={14} />
                <span>{reviewingProject.video_url}</span>
              </a>
            </div>
          )}

          {isRejecting && (
            <div className="space-y-2 pt-2 border-t border-discord-border/50">
              <label className="block text-xs font-bold text-rose-400 uppercase">
                Motivo del rechazo para el creador *
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explica qué correcciones se requieren o por qué entra en conflicto con otras construcciones..."
                className="w-full px-3 py-2 rounded-xl bg-discord-input border border-rose-500/40 text-white placeholder-discord-text-muted text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
