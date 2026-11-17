import { Dimension, CoordinateCategory, Project, ProjectCategory, ProjectStatus, ProjectMaterial } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getStoredProjects,
  saveStoredProjects,
  getStoredProfiles,
} from '../lib/mockData';
import { coordinateService } from './coordinateService';

export const projectService = {
  async getAll(): Promise<Project[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('proyectos')
        .select(`
          *,
          responsable:profiles!responsable_id(*),
          aprobador:profiles!aprobado_por(*)
        `)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error fetching projects from Supabase:', error);
        throw error;
      }
      return data || [];
    }

    return getStoredProjects();
  },

  // Cuenta los proyectos propuestos sin descargar datos (ligero, para badges)
  async countProposed(): Promise<number> {
    if (isSupabaseConfigured) {
      const { count, error } = await supabase
        .from('proyectos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'propuesto');

      if (error) throw error;
      return count ?? 0;
    }

    return getStoredProjects().filter((p) => p.estado === 'propuesto').length;
  },

  async create(project: {
    nombre: string;
    descripcion: string;
    categoria: ProjectCategory;
    responsable_id: string;
    ubicacion: string;
    video_url?: string;
    schematic_url?: string;
    materiales?: ProjectMaterial[];
  }): Promise<Project> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('proyectos')
        .insert({
          ...project,
          video_url: project.video_url || null,
          schematic_url: project.schematic_url || null,
          materiales: project.materiales || [],
          estado: 'propuesto',
          fecha_creacion: new Date().toISOString(),
        })
        .select(`
          *,
          responsable:profiles!responsable_id(*)
        `)
        .single();

      if (error) throw error;
      return data;
    }

    const projects = getStoredProjects();
    const profiles = getStoredProfiles();
    const responsable = profiles.find((p) => p.id === project.responsable_id);

    const newProject: Project = {
      id: 'p-' + Date.now(),
      nombre: project.nombre,
      descripcion: project.descripcion,
      categoria: project.categoria,
      responsable_id: project.responsable_id,
      ubicacion: project.ubicacion,
      video_url: project.video_url || null,
      schematic_url: project.schematic_url || null,
      materiales: project.materiales || [],
      estado: 'propuesto',
      fecha_creacion: new Date().toISOString(),
      responsable,
    };

    const updated = [newProject, ...projects];
    saveStoredProjects(updated);
    return newProject;
  },

  async updateMaterials(id: string, materiales: ProjectMaterial[]): Promise<Project> {
    return this.update(id, { materiales });
  },

  async toggleVote(projectId: string, userId: string): Promise<Project> {
    const projects = await this.getAll();
    const target = projects.find((p) => p.id === projectId);
    if (!target) throw new Error('Proyecto no encontrado');

    const currentVotes: string[] = Array.isArray(target.votos) ? target.votos : [];
    const hasVoted = currentVotes.includes(userId);
    const updatedVotes = hasVoted
      ? currentVotes.filter((id) => id !== userId)
      : [...currentVotes, userId];

    return this.update(projectId, { votos: updatedVotes });
  },

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('proyectos')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          responsable:profiles!responsable_id(*),
          aprobador:profiles!aprobado_por(*)
        `)
        .single();

      if (error) throw error;
      return data;
    }

    const projects = getStoredProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Proyecto no encontrado');

    const updatedProject = {
      ...projects[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    projects[index] = updatedProject;
    saveStoredProjects(projects);
    return updatedProject;
  },

  async review(
    projectId: string,
    aprobadorId: string,
    nuevoEstado: 'aprobado' | 'rechazado',
    motivoRechazo?: string,
    coordenadasFinales?: {
      dimension: Dimension;
      x: number;
      y: number;
      z: number;
      categoria?: CoordinateCategory;
      publicarCoordenada?: boolean;
    }
  ): Promise<Project> {
    const isApproved = nuevoEstado === 'aprobado';
    let ubicacionActualizada: string | undefined = undefined;

    if (isApproved && coordenadasFinales) {
      ubicacionActualizada = `${coordenadasFinales.dimension} (X: ${coordenadasFinales.x}, Y: ${coordenadasFinales.y}, Z: ${coordenadasFinales.z})`;
    }

    const payload: Partial<Project> = {
      estado: nuevoEstado,
      aprobado_por: aprobadorId,
      fecha_aprobacion: new Date().toISOString(),
      motivo_rechazo: isApproved ? null : (motivoRechazo || 'Rechazado por moderación'),
      updated_at: new Date().toISOString(),
      ...(ubicacionActualizada ? { ubicacion: ubicacionActualizada } : {}),
    };

    let resultProject: Project;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('proyectos')
        .update(payload)
        .eq('id', projectId)
        .select(`
          *,
          responsable:profiles!responsable_id(*),
          aprobador:profiles!aprobado_por(*)
        `)
        .single();

      if (error) throw error;
      resultProject = data;
    } else {
      const projects = getStoredProjects();
      const profiles = getStoredProfiles();
      const index = projects.findIndex((p) => p.id === projectId);
      if (index === -1) throw new Error('Proyecto no encontrado');

      const reviewer = profiles.find((p) => p.id === aprobadorId);
      const updatedProject: Project = {
        ...projects[index],
        ...payload,
        aprobador: reviewer,
      };

      projects[index] = updatedProject;
      saveStoredProjects(projects);
      resultProject = updatedProject;
    }

    // Publicar automáticamente en Coordenadas si fue aprobado y se indicaron coordenadas finales
    if (isApproved && coordenadasFinales && coordenadasFinales.publicarCoordenada !== false) {
      try {
        const catMap: Record<string, CoordinateCategory> = {
          Granja: 'Granja',
          'Mega Construcción': 'Base',
          Infraestructura: 'Portal',
          Minijuego: 'Otros',
          Comunidad: 'Comercio',
          Decoración: 'Otros',
          Redstone: 'Redstone',
          Otros: 'Otros',
        };

        const targetCategory =
          coordenadasFinales.categoria || catMap[resultProject.categoria] || 'Otros';

        await coordinateService.create({
          nombre: `[Proyecto] ${resultProject.nombre}`,
          descripcion: `Ubicación oficial del proyecto aprobado. ${resultProject.descripcion}`,
          categoria: targetCategory,
          dimension: coordenadasFinales.dimension,
          x: coordenadasFinales.x,
          y: coordenadasFinales.y,
          z: coordenadasFinales.z,
          usuario_id: resultProject.responsable_id,
        });
      } catch (coordErr) {
        console.error('Error al autogenerar la coordenada del proyecto aprobado:', coordErr);
      }
    }

    return resultProject;
  },

  async updateStatus(id: string, estado: ProjectStatus): Promise<Project> {
    return this.update(id, { estado });
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('proyectos').delete().eq('id', id);
      if (error) throw error;
      return;
    }

    const projects = getStoredProjects();
    saveStoredProjects(projects.filter((p) => p.id !== id));
  },
};