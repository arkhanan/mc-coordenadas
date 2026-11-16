import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { ProjectCategory, ProjectMaterial } from '../types';
import { parseLitematicaMaterialList } from '../utils/litematicaParser';
import { Modal } from '../components/common/Modal';
import {
  FolderGit2,
  Clock,
  CheckCircle2,
  MapPin,
  Video,
  Plus,
  Trash2,
  Boxes,
  FileCode,
  ClipboardPaste,
  HelpCircle,
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
  const [videoUrl, setVideoUrl] = useState('');
  const [schematicUrl, setSchematicUrl] = useState('');

  // Materiales tentativos
  const [materiales, setMateriales] = useState<
    { id: string; nombre: string; cantidad: number; unidad: string }[]
  >([]);

  // Modal para importar de Litematica
  const [showLitematicaModal, setShowLitematicaModal] = useState(false);
  const [litematicaRawText, setLitematicaRawText] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddMaterial = () => {
    setMateriales([
      ...materiales,
      {
        id: 'mat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        nombre: '',
        cantidad: 64,
        unidad: 'bloques',
      },
    ]);
  };

  const handleRemoveMaterial = (id: string) => {
    setMateriales(materiales.filter((m) => m.id !== id));
  };

  const handleUpdateMaterial = (
    id: string,
    field: 'nombre' | 'cantidad' | 'unidad',
    value: string | number
  ) => {
    setMateriales(
      materiales.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleImportLitematica = () => {
    if (!litematicaRawText.trim()) return;
    const parsed = parseLitematicaMaterialList(litematicaRawText);
    if (parsed.length === 0) {
      alert('No se pudieron detectar materiales en el texto ingresado. Asegúrate de pegar la lista exportada de Litematica (formato CSV o texto con cantidades).');
      return;
    }

    const newItems = parsed.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      cantidad: p.cantidad_requerida,
      unidad: p.unidad || 'bloques',
    }));

    setMateriales((prev) => [...prev, ...newItems]);
    setLitematicaRawText('');
    setShowLitematicaModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!nombre.trim() || !descripcion.trim() || !ubicacion.trim()) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    const cleanedMaterials: ProjectMaterial[] = materiales
      .filter((m) => m.nombre.trim().length > 0)
      .map((m) => ({
        id: m.id,
        nombre: m.nombre.trim(),
        cantidad_requerida: Number(m.cantidad) || 1,
        cantidad_reunida: 0,
        unidad: m.unidad || 'bloques',
      }));

    try {
      setSubmitting(true);
      await projectService.create({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoria,
        responsable_id: profile.id,
        ubicacion: ubicacion.trim(),
        video_url: videoUrl.trim() || undefined,
        schematic_url: schematicUrl.trim() || undefined,
        materiales: cleanedMaterials,
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
              2. Los moderadores revisan la zona y el tutorial de referencia para asegurar que sea viable.<br />
              3. Al aprobarlo, el moderador asignará las <strong>coordenadas oficiales</strong> que se publicarán automáticamente en la sección de Coordenadas de la comunidad.
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

        {/* Ubicación Tentativa */}
        <div>
          <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1.5">
            Ubicación Estimada / Zona Tentativa *
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
            Al ser aprobado, el moderador confirmará las coordenadas exactas de la obra.
          </p>
        </div>

        {/* Enlace de Video de YouTube (Tutorial / Referencia) */}
        <div>
          <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1.5">
            Enlace de Tutorial o Referencia en Video (YouTube)
          </label>
          <div className="relative">
            <Video size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400" />
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white placeholder-discord-text-muted text-xs focus:outline-none focus:border-discord-blurple transition-all"
            />
          </div>
          <p className="text-[11px] text-discord-text-muted mt-1">
            Permite a los moderadores y colaboradores ver el video tutorial de cómo se construye y funciona.
          </p>
        </div>

        {/* Enlace de Schematics / Archivo Litematica (.litematic) */}
        <div>
          <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1.5 flex items-center gap-1.5">
            <FileCode size={15} className="text-purple-400" />
            <span>Enlace de Esquema / Schematic (Litematica / WorldEdit)</span>
          </label>
          <input
            type="url"
            placeholder="https://... o enlace a Google Drive / CurseForge / Mediafire con el archivo .litematic"
            value={schematicUrl}
            onChange={(e) => setSchematicUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white placeholder-discord-text-muted text-xs focus:outline-none focus:border-discord-blurple transition-all"
          />
          <p className="text-[11px] text-discord-text-muted mt-1">
            Opcional. Permite que los constructores descarguen el archivo .litematic para construir con el mod Litematica.
          </p>
        </div>

        {/* Descripción Detallada */}
        <div>
          <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1.5">
            Descripción Detallada & Objetivos *
          </label>
          <textarea
            required
            rows={4}
            placeholder="¿De qué trata el proyecto? ¿Qué objetivos tiene? ¿Estará abierto a toda la comunidad?"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white placeholder-discord-text-muted text-xs focus:outline-none focus:border-discord-blurple transition-all leading-relaxed"
          />
        </div>

        {/* Lista de Materiales Tentativos + Importar de Litematica */}
        <div className="pt-2 border-t border-discord-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <label className="text-xs font-bold text-discord-text-muted uppercase flex items-center gap-1.5">
                <Boxes size={15} className="text-cyan-400" />
                <span>Lista de Materiales Tentativos</span>
              </label>
              <p className="text-[11px] text-discord-text-muted">
                Registra los materiales necesarios para que la comunidad done y reporte avance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLitematicaModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-xs font-bold text-purple-300 hover:text-white transition-all"
              >
                <ClipboardPaste size={14} className="text-purple-400" />
                <span>Importar de Litematica</span>
              </button>
              <button
                type="button"
                onClick={handleAddMaterial}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-discord-secondary hover:bg-discord-hover border border-discord-border/70 text-xs font-bold text-discord-text-normal hover:text-white transition-all"
              >
                <Plus size={14} className="text-emerald-400" />
                <span>Añadir</span>
              </button>
            </div>
          </div>

          {materiales.length === 0 ? (
            <div className="p-4 rounded-xl bg-discord-secondary/40 border border-dashed border-discord-border/60 text-center text-xs text-discord-text-muted">
              No has añadido materiales aún. Puedes agregarlos a mano o usar <strong>"Importar de Litematica"</strong> pegando el Material List exportado desde el mod.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {materiales.map((mat) => (
                <div
                  key={mat.id}
                  className="p-2.5 rounded-xl bg-discord-secondary/70 border border-discord-border/60 flex items-center gap-2.5"
                >
                  <input
                    type="text"
                    required
                    placeholder="Ej: Hielo Azul, Tolvas, Cristales..."
                    value={mat.nombre}
                    onChange={(e) => handleUpdateMaterial(mat.id, 'nombre', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-discord-input border border-discord-border/70 text-white text-xs focus:outline-none focus:border-discord-blurple"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Cantidad"
                    value={mat.cantidad}
                    onChange={(e) => handleUpdateMaterial(mat.id, 'cantidad', Number(e.target.value))}
                    className="w-24 px-3 py-1.5 rounded-lg bg-discord-input border border-discord-border/70 text-white font-mono text-xs focus:outline-none focus:border-discord-blurple"
                  />
                  <select
                    value={mat.unidad}
                    onChange={(e) => handleUpdateMaterial(mat.id, 'unidad', e.target.value)}
                    className="w-28 px-2 py-1.5 rounded-lg bg-discord-input border border-discord-border/70 text-white text-xs focus:outline-none focus:border-discord-blurple cursor-pointer"
                  >
                    <option value="bloques">bloques</option>
                    <option value="stacks">stacks</option>
                    <option value="cofres">cofres</option>
                    <option value="unidades">unidades</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(mat.id)}
                    className="p-1.5 text-discord-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
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

      {/* MODAL IMPORTAR DESDE LITEMATICA */}
      <Modal
        isOpen={showLitematicaModal}
        onClose={() => setShowLitematicaModal(false)}
        title="Importar Materiales desde Litematica"
        subtitle="Pega el reporte de materiales exportado del mod Litematica (CurseForge)"
        maxWidth="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowLitematicaModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-discord-text-muted hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleImportLitematica}
              disabled={!litematicaRawText.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md disabled:opacity-50 transition-all"
            >
              Procesar e Importar
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-200 text-xs flex items-start gap-2.5">
            <HelpCircle size={18} className="text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block text-purple-300">¿Cómo exportar desde Litematica?</strong>
              En Minecraft con el mod Litematica instalado: abre el menú <em>Schematic Placements → Material List</em>, haz clic en <em>"Save to file"</em> o copia el texto CSV generado, y pégalo abajo.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-discord-text-muted uppercase mb-1.5">
              Pega aquí el contenido (CSV o texto copiado):
            </label>
            <textarea
              rows={8}
              value={litematicaRawText}
              onChange={(e) => setLitematicaRawText(e.target.value)}
              placeholder={"Ejemplo de formato soportado:\nItem,Total,Missing,Available\nminecraft:blue_ice,512,512,0\nminecraft:oak_boat,16,16,0\n\nO también:\n64x Stone\n128x Redstone Dust"}
              className="w-full px-3.5 py-2.5 rounded-xl bg-discord-input border border-discord-border/80 text-white font-mono placeholder-discord-text-muted text-xs focus:outline-none focus:border-discord-blurple leading-relaxed"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
