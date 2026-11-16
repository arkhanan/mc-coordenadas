import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coordinateService } from '../services/coordinateService';
import { Coordinate, CoordinateCategory, Dimension } from '../types';
import { DimensionBadge, StatusBadge } from '../components/common/Badge';
import { CoordinateActions } from '../components/common/CoordinateCopyButton';
import { Modal } from '../components/common/Modal';
import {
  MapPin,
  Search,
  PlusCircle,
  AlertTriangle,
  Trash2,
  Edit2,
  Sparkles,
  Info,
} from 'lucide-react';

const CATEGORIES: CoordinateCategory[] = [
  'Granja',
  'Base',
  'Portal',
  'Comercio',
  'Spawner',
  'Minería',
  'Redstone',
  'Otros',
];

const DIMENSIONS: (Dimension | 'Todas')[] = ['Todas', 'Overworld', 'Nether', 'The End'];

export const CoordinatesPage: React.FC = () => {
  const { profile, isMod } = useAuth();
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDimension, setSelectedDimension] = useState<Dimension | 'Todas'>('Todas');
  const [selectedCategory, setSelectedCategory] = useState<CoordinateCategory | 'Todas'>('Todas');

  // Report Modal state
  const [reportingCoord, setReportingCoord] = useState<Coordinate | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Edit Modal state
  const [editingCoord, setEditingCoord] = useState<Coordinate | null>(null);
  const [editForm, setEditForm] = useState<{
    nombre: string;
    descripcion: string;
    categoria: CoordinateCategory;
    dimension: Dimension;
    x: number;
    y: number;
    z: number;
  }>({
    nombre: '',
    descripcion: '',
    categoria: 'Base',
    dimension: 'Overworld',
    x: 0,
    y: 64,
    z: 0,
  });

  const loadCoordinates = async () => {
    try {
      setLoading(true);
      const data = await coordinateService.getAll();
      setCoordinates(data);
    } catch (err) {
      console.error('Error fetching coordinates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoordinates();
  }, []);

  // Filtered List
  const filteredCoordinates = coordinates.filter((coord) => {
    // If not staff, don't show archived unless owner
    if (coord.estado === 'archivada' && !isMod && coord.usuario_id !== profile?.id) {
      return false;
    }

    const matchesSearch =
      coord.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coord.descripcion && coord.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (coord.usuario?.username && coord.usuario.username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDimension =
      selectedDimension === 'Todas' || coord.dimension === selectedDimension;

    const matchesCategory =
      selectedCategory === 'Todas' || coord.categoria === selectedCategory;

    return matchesSearch && matchesDimension && matchesCategory;
  });

  // Handle Report
  const handleOpenReport = (coord: Coordinate) => {
    setReportingCoord(coord);
    setReportReason('');
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingCoord || !profile || !reportReason.trim()) return;

    try {
      setSubmittingReport(true);
      await coordinateService.report(reportingCoord.id, profile.id, reportReason.trim());
      setReportingCoord(null);
      await loadCoordinates();
    } catch (err) {
      console.error('Error reporting coordinate:', err);
      alert('Error al enviar reporte.');
    } finally {
      setSubmittingReport(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la coordenada "${name}"?`)) return;
    try {
      await coordinateService.delete(id);
      setCoordinates((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error deleting coordinate:', err);
      alert('No se pudo eliminar la coordenada.');
    }
  };

  // Handle Edit
  const handleOpenEdit = (coord: Coordinate) => {
    setEditingCoord(coord);
    setEditForm({
      nombre: coord.nombre,
      descripcion: coord.descripcion || '',
      categoria: coord.categoria,
      dimension: coord.dimension,
      x: coord.x,
      y: coord.y,
      z: coord.z,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoord) return;
    try {
      await coordinateService.update(editingCoord.id, {
        nombre: editForm.nombre,
        descripcion: editForm.descripcion,
        categoria: editForm.categoria,
        dimension: editForm.dimension,
        x: Number(editForm.x),
        y: Number(editForm.y),
        z: Number(editForm.z),
      });
      setEditingCoord(null);
      await loadCoordinates();
    } catch (err) {
      console.error('Error updating coordinate:', err);
      alert('No se pudo actualizar la coordenada.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-discord-border/50">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MapPin className="text-emerald-400" />
            <span>Coordenadas del Servidor</span>
          </h1>
          <p className="text-xs text-discord-text-muted mt-1">
            Explora ubicaciones públicas compartidas por la comunidad. No requieren aprobación previa.
          </p>
        </div>

        <Link
          to="/coordenadas/crear"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-discord-blurple hover:bg-discord-blurple-hover text-white text-xs font-bold shadow-md shadow-discord-blurple/25 transition-all"
        >
          <PlusCircle size={16} />
          <span>Publicar Coordenada</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-discord-card border border-discord-border/60 rounded-2xl p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-discord-text-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o jugador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white placeholder-discord-text-muted text-xs focus:outline-none focus:border-discord-blurple transition-all"
          />
        </div>

        {/* Dimension & Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-discord-border/40">
          {/* Dimension Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-discord-text-muted uppercase mr-1">Dimensión:</span>
            {DIMENSIONS.map((dim) => (
              <button
                key={dim}
                onClick={() => setSelectedDimension(dim)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedDimension === dim
                    ? 'bg-discord-blurple text-white font-bold shadow-sm'
                    : 'bg-discord-secondary/80 text-discord-text-muted hover:text-white hover:bg-discord-hover'
                }`}
              >
                {dim}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-discord-text-muted uppercase">Categoría:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CoordinateCategory | 'Todas')}
              className="bg-discord-input text-white text-xs rounded-lg px-3 py-1.5 border border-discord-border/80 outline-none focus:border-discord-blurple cursor-pointer"
            >
              <option value="Todas">Todas las categorías</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Coordinates Grid */}
      {loading ? (
        <div className="py-16 text-center text-discord-text-muted">
          <div className="w-8 h-8 border-2 border-discord-blurple border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Cargando coordenadas del servidor...</p>
        </div>
      ) : filteredCoordinates.length === 0 ? (
        <div className="bg-discord-card border border-discord-border/60 rounded-2xl p-12 text-center">
          <MapPin size={40} className="text-discord-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-white">No se encontraron coordenadas</h3>
          <p className="text-xs text-discord-text-muted mt-1 max-w-sm mx-auto">
            {searchTerm || selectedDimension !== 'Todas' || selectedCategory !== 'Todas'
              ? 'Prueba modificando tus filtros de búsqueda.'
              : 'Aún no hay coordenadas publicadas. ¡Sé el primero en compartir una!'}
          </p>
          <Link
            to="/coordenadas/crear"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-discord-blurple text-white text-xs font-bold"
          >
            <PlusCircle size={15} />
            <span>Publicar Coordenada</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCoordinates.map((coord) => {
            const isOwner = profile?.id === coord.usuario_id;
            const canManage = isOwner || isMod;

            return (
              <div
                key={coord.id}
                className={`bg-discord-card border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-discord-blurple/60 ${
                  coord.estado === 'reportada'
                    ? 'border-rose-500/50 bg-rose-950/10'
                    : 'border-discord-border/60'
                }`}
              >
                <div>
                  {/* Top Bar: Dimension Badge + Category + Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <DimensionBadge dimension={coord.dimension} />
                      <span className="text-[11px] font-semibold text-discord-text-muted bg-discord-darkest/70 px-2 py-0.5 rounded border border-discord-border/40">
                        {coord.categoria}
                      </span>
                    </div>
                    <StatusBadge status={coord.estado} />
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-base text-white leading-snug">{coord.nombre}</h3>
                  {coord.descripcion && (
                    <p className="text-xs text-discord-text-muted mt-2 leading-relaxed">
                      {coord.descripcion}
                    </p>
                  )}

                  {/* Nether/Overworld 8:1 Ratio Hint */}
                  {coord.dimension === 'Nether' && (
                    <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/40 text-[11px] text-rose-300 flex items-center gap-1.5 font-mono">
                      <Sparkles size={12} className="flex-shrink-0 text-rose-400" />
                      <span>Overworld equivalente: X: {coord.x * 8}, Z: {coord.z * 8}</span>
                    </div>
                  )}
                  {coord.dimension === 'Overworld' && (
                    <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-900/40 text-[11px] text-emerald-300 flex items-center gap-1.5 font-mono">
                      <Sparkles size={12} className="flex-shrink-0 text-emerald-400" />
                      <span>Nether equivalente: X: {Math.round(coord.x / 8)}, Z: {Math.round(coord.z / 8)}</span>
                    </div>
                  )}

                  {/* Interactive Coordinate Actions: Copy Raw Coords & Staff /tp Command */}
                  <div className="mt-4">
                    <CoordinateActions
                      x={coord.x}
                      y={coord.y}
                      z={coord.z}
                      dimension={coord.dimension}
                      showTeleportCommand={isMod}
                    />
                  </div>
                </div>

                {/* Footer: User profile, Date & Actions */}
                <div className="mt-5 pt-3 border-t border-discord-border/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={
                        coord.usuario?.avatar_url ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${coord.usuario?.username || 'user'}`
                      }
                      alt={coord.usuario?.username}
                      className="w-6 h-6 rounded-full border border-discord-border/70 object-cover flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-bold text-discord-text-normal truncate leading-none">
                        {coord.usuario?.username || 'Anónimo'}
                      </p>
                      <p className="text-[10px] text-discord-text-muted mt-0.5">
                        {new Date(coord.fecha).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    {/* Report button */}
                    <button
                      onClick={() => handleOpenReport(coord)}
                      title="Reportar coordenada incorrecta o grieffeada"
                      className="p-1.5 rounded-lg text-discord-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <AlertTriangle size={15} />
                    </button>

                    {/* Manage buttons */}
                    {canManage && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(coord)}
                          title="Editar coordenada"
                          className="p-1.5 rounded-lg text-discord-text-muted hover:text-white hover:bg-discord-hover transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(coord.id, coord.nombre)}
                          title="Eliminar coordenada"
                          className="p-1.5 rounded-lg text-discord-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REPORT MODAL */}
      <Modal
        isOpen={Boolean(reportingCoord)}
        onClose={() => setReportingCoord(null)}
        title="Reportar Coordenada"
        subtitle={`Reportando: ${reportingCoord?.nombre}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setReportingCoord(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-discord-text-muted hover:text-white hover:bg-discord-hover transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmitReport}
              disabled={submittingReport || !reportReason.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-all disabled:opacity-50"
            >
              {submittingReport ? 'Enviando...' : 'Confirmar Reporte'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <Info size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              El reporte notificará de inmediato al equipo de moderación y marcará la coordenada como{' '}
              <strong>reportada</strong> hasta su verificación.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1.5">
              Motivo del reporte *
            </label>
            <textarea
              required
              rows={4}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Ej: El portal está destruido, las coordenadas son erróneas, o hay trampas de dinamita activas..."
              className="w-full px-3 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white placeholder-discord-text-muted text-xs focus:outline-none focus:border-discord-blurple transition-all"
            />
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={Boolean(editingCoord)}
        onClose={() => setEditingCoord(null)}
        title="Editar Coordenada"
        subtitle={editingCoord?.nombre}
        maxWidth="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingCoord(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-discord-text-muted hover:text-white hover:bg-discord-hover transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-discord-blurple hover:bg-discord-blurple-hover text-white shadow-md transition-all"
            >
              Guardar Cambios
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1">
              Nombre de la ubicación *
            </label>
            <input
              type="text"
              required
              value={editForm.nombre}
              onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-discord-input border border-discord-border/80 text-white text-xs focus:outline-none focus:border-discord-blurple"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1">
                Dimensión
              </label>
              <select
                value={editForm.dimension}
                onChange={(e) => setEditForm({ ...editForm, dimension: e.target.value as Dimension })}
                className="w-full px-3 py-2 rounded-xl bg-discord-input border border-discord-border/80 text-white text-xs focus:outline-none focus:border-discord-blurple"
              >
                <option value="Overworld">Overworld</option>
                <option value="Nether">Nether</option>
                <option value="The End">The End</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1">
                Categoría
              </label>
              <select
                value={editForm.categoria}
                onChange={(e) =>
                  setEditForm({ ...editForm, categoria: e.target.value as CoordinateCategory })
                }
                className="w-full px-3 py-2 rounded-xl bg-discord-input border border-discord-border/80 text-white text-xs focus:outline-none focus:border-discord-blurple"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1">X *</label>
              <input
                type="number"
                required
                value={editForm.x}
                onChange={(e) => setEditForm({ ...editForm, x: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-discord-input border border-discord-border/80 text-white font-mono text-xs focus:outline-none focus:border-discord-blurple"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1">Y *</label>
              <input
                type="number"
                required
                value={editForm.y}
                onChange={(e) => setEditForm({ ...editForm, y: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-discord-input border border-discord-border/80 text-white font-mono text-xs focus:outline-none focus:border-discord-blurple"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1">Z *</label>
              <input
                type="number"
                required
                value={editForm.z}
                onChange={(e) => setEditForm({ ...editForm, z: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-discord-input border border-discord-border/80 text-white font-mono text-xs focus:outline-none focus:border-discord-blurple"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1">
              Descripción
            </label>
            <textarea
              rows={3}
              value={editForm.descripcion}
              onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-discord-input border border-discord-border/80 text-white text-xs focus:outline-none focus:border-discord-blurple"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
