import { Project, ProjectCategory, ProjectStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getStoredProjects,
  saveStoredProjects,
  getStoredProfiles,
} from '../lib/mockData';

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

  async create(project: {
    nombre: string;
    descripcion: string;
    categoria: ProjectCategory;
    responsable_id: string;
    ubicacion: string;
  }): Promise<Project> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('proyectos')
        .insert({
          ...project,
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
      estado: 'propuesto',
      fecha_creacion: new Date().toISOString(),
      responsable,
    };

    const updated = [newProject, ...projects];
    saveStoredProjects(updated);
    return newProject;
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
    motivoRechazo?: string
  ): Promise<Project> {
    const isApproved = nuevoEstado === 'aprobado';
    const payload = {
      estado: nuevoEstado,
      aprobado_por: aprobadorId,
      fecha_aprobacion: new Date().toISOString(),
      motivo_rechazo: isApproved ? null : (motivoRechazo || 'Rechazado por moderación'),
      updated_at: new Date().toISOString(),
    };

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
      return data;
    }

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
    return updatedProject;
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
