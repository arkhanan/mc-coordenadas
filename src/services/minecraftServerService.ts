export interface MinecraftServerStatus {
  online: boolean;
  playersOnline: number;
  playersMax: number;
  version: string;
  motd: string;
  loading: boolean;
}

export const checkMinecraftServerStatus = async (
  serverAddress: string
): Promise<MinecraftServerStatus> => {
  if (
    !serverAddress ||
    serverAddress.includes('placeholder') ||
    serverAddress.includes('tudominio.com') ||
    serverAddress.includes('ejemplo.com')
  ) {
    // Valores de ejemplo cuando aún no se ha configurado una IP real
    return {
      online: true,
      playersOnline: 4,
      playersMax: 20,
      version: '1.21.4 (Demo)',
      motd: 'Servidor Comunitario Minecraft',
      loading: false,
    };
  }

  try {
    // Consulta en tiempo real a la API pública mcstatus.io (sin claves, soporte CORS nativo)
    const response = await fetch(
      `https://api.mcstatus.io/v2/status/java/${encodeURIComponent(serverAddress)}`
    );
    if (!response.ok) {
      throw new Error('Error al consultar estado');
    }
    const data = await response.json();

    if (data.online) {
      return {
        online: true,
        playersOnline: data.players?.online || 0,
        playersMax: data.players?.max || 20,
        version: data.version?.name_clean || '1.21.x',
        motd: data.motd?.clean || 'Servidor activo',
        loading: false,
      };
    } else {
      return {
        online: false,
        playersOnline: 0,
        playersMax: 0,
        version: 'Offline',
        motd: 'Servidor apagado en el hosting',
        loading: false,
      };
    }
  } catch (error) {
    console.warn('No se pudo verificar el estado en vivo de Minecraft:', error);
    return {
      online: false,
      playersOnline: 0,
      playersMax: 0,
      version: 'No disponible',
      motd: 'Sin conexión',
      loading: false,
    };
  }
};
