import { ServerStats, UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getStoredProfiles,
  saveStoredProfiles,
  getStoredCoordinates,
  getStoredProjects,
  getStoredReports,
} from '../lib/mockData';

export const adminService = {
  async getUsers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      return data || [];
    }

    return getStoredProfiles();
  },

  async updateUserRole(userId: string, newRole: UserRole): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const profiles = getStoredProfiles();
    const index = profiles.findIndex((p) => p.id === userId);
    if (index === -1) throw new Error('Usuario no encontrado');

    profiles[index].role = newRole;
    profiles[index].updated_at = new Date().toISOString();
    saveStoredProfiles(profiles);
    return profiles[index];
  },

  async toggleBanUser(userId: string, isBanned: boolean, reason?: string): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_banned: isBanned,
          ban_reason: isBanned ? (reason || 'Bloqueado por un administrador') : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const profiles = getStoredProfiles();
    const index = profiles.findIndex((p) => p.id === userId);
    if (index === -1) throw new Error('Usuario no encontrado');

    profiles[index].is_banned = isBanned;
    profiles[index].ban_reason = isBanned ? (reason || 'Bloqueado por un administrador') : null;
    profiles[index].updated_at = new Date().toISOString();
    saveStoredProfiles(profiles);
    return profiles[index];
  },

  async deleteUser(userId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return true;
    }

    const profiles = getStoredProfiles().filter((p) => p.id !== userId);
    saveStoredProfiles(profiles);
    return true;
  },

  async getServerStats(): Promise<ServerStats> {
    if (isSupabaseConfigured) {
      try {
        const [coordsRes, projectsRes, pendingProjectsRes, reportsRes, profilesRes] =
          await Promise.all([
            supabase.from('coordenadas').select('id', { count: 'exact', head: true }),
            supabase.from('proyectos').select('id', { count: 'exact', head: true }),
            supabase
              .from('proyectos')
              .select('id', { count: 'exact', head: true })
              .eq('estado', 'propuesto'),
            supabase
              .from('reportes_coordenadas')
              .select('id', { count: 'exact', head: true })
              .eq('estado', 'pendiente'),
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
          ]);

        const { count: activeProjectsCount } = await supabase
          .from('proyectos')
          .select('id', { count: 'exact', head: true })
          .in('estado', ['aprobado', 'en_construccion']);

        return {
          totalCoordinates: coordsRes.count || 0,
          totalProjects: projectsRes.count || 0,
          activeProjects: activeProjectsCount || 0,
          pendingApprovals: pendingProjectsRes.count || 0,
          reportedCoordinates: reportsRes.count || 0,
          totalMembers: profilesRes.count || 0,
        };
      } catch (e) {
        console.error('Error fetching server stats from Supabase:', e);
      }
    }

    // Mock stats
    const coords = getStoredCoordinates();
    const projects = getStoredProjects();
    const reports = getStoredReports();
    const profiles = getStoredProfiles();

    return {
      totalCoordinates: coords.length,
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.estado === 'aprobado' || p.estado === 'en_construccion').length,
      pendingApprovals: projects.filter((p) => p.estado === 'propuesto').length,
      reportedCoordinates: reports.filter((r) => r.estado === 'pendiente').length,
      totalMembers: profiles.length,
    };
  },
};
