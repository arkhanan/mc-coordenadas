import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { ProjectCategory } from '../types';
import {
  FolderGit2,
  Clock,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

const CATEGORIES: ProjectCategory[] = [
  'Granja',
  'Mega Construcción',
  'Infraestructura',
  'Minijuego',
  'Comunidad',
  'Decoración',
  'Redstone',
  'Otros',
];

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<ProjectCategory>('Mega Construcción');
  const [ubicacion, setUbicacion] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!nombre.trim() || !descripcion.trim() || !ubicacion.trim()) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setSubmitting(true);
      await projectService.create({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoria,
        responsable_id: profile.id,
        ubicacion: ubicacion.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/proyectos');
      }, 1500);
    } catch (err) {
      console.error('Error proposing project:', err);
      alert('Hubo un error al enviar la propuesta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-discord-border/50">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <FolderGit2 className="text-amber-400" />
          <span>Proponer Proyecto Comunitario</span>
        </h1>
        <p className="text-xs text-discord-text-muted mt-1">
          Las mega construcciones y obras comunitarias requieren validación previa del Staff para evitar solapamientos y preservar el rendimiento.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 size={20} className="text-emerald-400" />
          <span className="font-semibold">
            ¡Propuesta enviada con éxito! Estado: <strong>Propuesto</strong>. Redirigiendo a proyectos...
          </span>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-discord-card border border-discord-border/60 rounded-2xl p-6 sm:p-8 space-y-6"
      >
        {/* Info callout */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <Clock size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Flujo de validación:</span>
            <p className="mt-0.5 text-amber-200/90 leading-relaxed">
              1. Creas tu proyecto con estado inicial <strong>Propuesto</strong>.<br />
              2. Los moderadores revisan la zona para asegurar que no interfiera con otros distritos ni rompa reglas.<br />
              3. Una vez aprobado, podrás comenzar la construcción y reclutar colaboradores.
            </p>
          </div>
        </div>

        {/* Nombre del Proyecto */}
        <div>
          <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1.5">
            Nombre del Proyecto *
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Castillo Central, Red de Metro del Nether, Granja de Slimes Masiva..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white placeholder-discord-text-muted text-xs focus:outline-none focus:border-discord-blurple transition-all"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1.5">
            Categoría del Proyecto *
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as ProjectCategory)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white text-xs focus:outline-none focus:border-discord-blurple cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1.5">
            Ubicación Estimada / Coordenadas *
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-discord-text-muted" />
            <input
              type="text"
              required
              placeholder="Ej: Overworld (X: 1200, Y: 64, Z: -850) o Nether Techo (X: 150, Z: -100)"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white placeholder-discord-text-muted text-xs focus:outline-none focus:border-discord-blurple transition-all"
            />
          </div>
          <p className="text-[11px] text-discord-text-muted mt-1">
            Indica la dimensión y el rango aproximado de bloques que ocupará la construcción.
          </p>
        </div>

        {/* Descripción Detallada */}
        <div>
          <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1.5">
            Descripción Detallada & Objetivos *
          </label>
          <textarea
            required
            rows={5}
            placeholder="¿De qué trata el proyecto? ¿Qué materiales se necesitan? ¿Estará abierto a toda la comunidad? ¿Se buscan voluntarios o constructores de redstone?"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white placeholder-discord-text-muted text-xs focus:outline-none focus:border-discord-blurple transition-all leading-relaxed"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-discord-blurple hover:bg-discord-blurple-hover active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-discord-blurple/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <FolderGit2 size={16} />
            <span>{submitting ? 'Enviando propuesta...' : 'Enviar Propuesta a Moderación'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
