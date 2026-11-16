import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coordinateService } from '../services/coordinateService';
import { CoordinateCategory, Dimension } from '../types';
import { DimensionBadge } from '../components/common/Badge';
import {
  MapPin,
  Sparkles,
  Info,
  CheckCircle2,
  Compass,
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

export const CreateCoordinatePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<CoordinateCategory>('Granja');
  const [dimension, setDimension] = useState<Dimension>('Overworld');
  const [x, setX] = useState<number | ''>(0);
  const [y, setY] = useState<number | ''>(64);
  const [z, setZ] = useState<number | ''>(0);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (x === '' || y === '' || z === '') {
      alert('Por favor ingresa coordenadas válidas para X, Y y Z.');
      return;
    }

    try {
      setSubmitting(true);
      await coordinateService.create({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        categoria,
        dimension,
        x: Number(x),
        y: Number(y),
        z: Number(z),
        usuario_id: profile.id,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/coordenadas');
      }, 1500);
    } catch (err) {
      console.error('Error creating coordinate:', err);
      alert('Hubo un error al registrar la coordenada.');
    } finally {
      setSubmitting(false);
    }
  };

  const getEquivalentCoords = () => {
    const numX = Number(x) || 0;
    const numZ = Number(z) || 0;
    if (dimension === 'Nether') {
      return {
        target: 'Overworld',
        x: numX * 8,
        z: numZ * 8,
      };
    } else if (dimension === 'Overworld') {
      return {
        target: 'Nether',
        x: Math.round(numX / 8),
        z: Math.round(numZ / 8),
      };
    }
    return null;
  };

  const equivalent = getEquivalentCoords();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-discord-border/50">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <MapPin className="text-discord-blurple" />
          <span>Publicar Nueva Coordenada</span>
        </h1>
        <p className="text-xs text-discord-text-muted mt-1">
          Las coordenadas no requieren aprobación previa y estarán disponibles de inmediato para toda la comunidad.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 size={20} className="text-emerald-400" />
          <span className="font-semibold">
            ¡Coordenada publicada con éxito! Redirigiendo al mapa...
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-discord-card border border-discord-border/60 rounded-2xl p-6 space-y-5"
          >
            {/* Notice */}
            <div className="p-3.5 rounded-xl bg-discord-blurple/10 border border-discord-blurple/30 text-discord-text-normal text-xs flex items-start gap-3">
              <Info size={18} className="text-discord-blurple flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Publicación instantánea:</span> Todos los miembros verán esta ubicación inmediatamente. En caso de error o que sea destruida, los jugadores pueden reportarla para su revisión.
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1.5">
                Nombre de la Ubicación *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Granja de Brujas Cuádruple, Base en Isla Nevada..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white placeholder-discord-text-muted text-xs focus:outline-none focus:border-discord-blurple transition-all"
              />
            </div>

            {/* Dimension Selection */}
            <div>
              <label className="block text-xs font-bold text-discord-text-muted uppercase mb-2">
                Dimensión *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Overworld', 'Nether', 'The End'] as Dimension[]).map((dim) => {
                  const isSelected = dimension === dim;
                  return (
                    <button
                      key={dim}
                      type="button"
                      onClick={() => setDimension(dim)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-discord-blurple bg-discord-blurple/15 ring-2 ring-discord-blurple/40 shadow-sm'
                          : 'border-discord-border/60 bg-discord-secondary/60 hover:bg-discord-hover'
                      }`}
                    >
                      <div className="text-xl mb-1">
                        {dim === 'Overworld' ? '🌿' : dim === 'Nether' ? '🔥' : '👁️'}
                      </div>
                      <span className="text-xs font-bold text-white">{dim}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coordinates XYZ */}
            <div>
              <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1.5">
                Coordenadas Minecraft (F3) *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-discord-blurple">
                      X:
                    </span>
                    <input
                      type="number"
                      required
                      placeholder="0"
                      value={x}
                      onChange={(e) => setX(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white font-mono text-xs focus:outline-none focus:border-discord-blurple"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-emerald-400">
                      Y:
                    </span>
                    <input
                      type="number"
                      required
                      placeholder="64"
                      value={y}
                      onChange={(e) => setY(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white font-mono text-xs focus:outline-none focus:border-discord-blurple"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-amber-400">
                      Z:
                    </span>
                    <input
                      type="number"
                      required
                      placeholder="0"
                      value={z}
                      onChange={(e) => setZ(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white font-mono text-xs focus:outline-none focus:border-discord-blurple"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1.5">
                Categoría *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CoordinateCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white text-xs focus:outline-none focus:border-discord-blurple cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1.5">
                Descripción / Instrucciones (Opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Cómo acceder, qué objetos llevar, advertencias o reglas del lugar..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white placeholder-discord-text-muted text-xs focus:outline-none focus:border-discord-blurple transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-discord-blurple hover:bg-discord-blurple-hover active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-discord-blurple/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Compass size={16} />
                <span>{submitting ? 'Publicando...' : 'Publicar Coordenada Ahora'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview & Portal Calculator Sidebar */}
        <div className="space-y-4">
          {/* Live Preview Card */}
          <div className="bg-discord-card border border-discord-border/60 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-discord-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-discord-blurple" />
              <span>Vista Previa en Vivo</span>
            </h3>

            <div className="p-4 rounded-xl bg-discord-secondary border border-discord-border/70 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <DimensionBadge dimension={dimension} />
                <span className="text-[11px] font-semibold text-discord-text-muted bg-discord-darkest px-2 py-0.5 rounded">
                  {categoria}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">
                {nombre.trim() || 'Nombre de la coordenada'}
              </h4>
              <p className="text-xs text-discord-text-muted line-clamp-2">
                {descripcion.trim() || 'Aquí aparecerá la descripción detallada de tu ubicación.'}
              </p>
              <div className="pt-2 font-mono text-xs text-discord-text-normal bg-discord-darkest/70 p-2 rounded-lg border border-discord-border/40">
                <span className="text-discord-blurple font-bold">XYZ: </span>
                <span>{x === '' ? 0 : x} {y === '' ? 64 : y} {z === '' ? 0 : z}</span>
              </div>
            </div>
          </div>

          {/* Nether 8:1 Calculator */}
          {equivalent && (
            <div className="bg-discord-card border border-discord-border/60 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-discord-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>Calculadora de Portales (8:1)</span>
              </h3>
              <p className="text-xs text-discord-text-muted mb-3">
                Enlace exacto para conectar tu portal en el <strong>{equivalent.target}</strong>:
              </p>
              <div className="p-3 rounded-xl bg-discord-secondary border border-discord-border/60 font-mono text-xs text-white flex items-center justify-between">
                <div>
                  <span className="text-discord-text-muted">{equivalent.target}: </span>
                  <span className="font-bold text-emerald-400">
                    X: {equivalent.x}, Z: {equivalent.z}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
