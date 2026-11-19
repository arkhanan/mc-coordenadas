import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface LinkResult {
  code: string;
  expiresInMinutes: number;
}

export const minecraftLinkService = {
  /**
   * Genera un código de vinculación de 6 caracteres para ingresar en Minecraft
   */
  async generateCode(): Promise<string> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('generar_codigo_vinculacion_minecraft');
      if (error) {
        console.error('Error generando código de vinculación en Supabase:', error);
        throw new Error(error.message);
      }
      return data as string;
    }

    // Fallback Modo Demo
    const mockCode = 'MC-' + Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem('demo_minecraft_link_code', mockCode);
    return mockCode;
  },

  /**
   * Desvincula la cuenta de Minecraft del perfil actual
   */
  async unlinkMinecraft(userId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .update({ minecraft_username: null })
        .eq('id', userId);

      if (error) {
        console.error('Error desvinculando cuenta:', error);
        return false;
      }
      return true;
    }

    // Modo Demo
    localStorage.removeItem('demo_minecraft_linked_user');
    return true;
  }
};
