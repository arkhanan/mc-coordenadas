import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ServerConfig {
  server_ip: string;
  server_name: string;
  server_version: string;
  maintenance_mode: boolean;
  maintenance_message: string;
}

const DEFAULT_CONFIG: ServerConfig = {
  server_ip: import.meta.env.VITE_MC_SERVER_IP || 'play.minecraft-comunidad.net',
  server_name: import.meta.env.VITE_APP_NAME || 'MineCoords Community',
  server_version: import.meta.env.VITE_MC_SERVER_VERSION || '26.3 Survival',
  maintenance_mode: false,
  maintenance_message: 'La plataforma se encuentra en mantenimiento temporal. Solo el equipo de Staff tiene acceso en este momento.',
};

const STORAGE_KEY = 'minecoords_server_config';

export const serverConfigService = {
  async getConfig(): Promise<ServerConfig> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('configuracion_general')
          .select('server_ip, server_name, server_version, maintenance_mode, maintenance_message')
          .eq('id', 1)
          .maybeSingle();

        if (data && !error) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          return data as ServerConfig;
        }
      } catch (e) {
        console.warn('Usando configuración local de respaldo:', e);
      }
    }

    // Fallback a localStorage o valores por defecto
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(local) };
      } catch {
        // Ignorar error de parsing
      }
    }
    return DEFAULT_CONFIG;
  },

  async updateConfig(newConfig: Partial<ServerConfig>): Promise<ServerConfig> {
    const current = await this.getConfig();
    const merged: ServerConfig = { ...current, ...newConfig };

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('configuracion_general')
        .upsert({
          id: 1,
          ...merged,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error actualizando configuración en Supabase:', error);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  },
};
