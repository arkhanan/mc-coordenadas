/**
 * Servicio de Notificaciones automáticas hacia canales de Discord mediante Webhooks
 */

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  author?: {
    name: string;
    icon_url?: string;
  };
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
}

interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: DiscordEmbed[];
}

const getWebhookUrl = (): string => {
  return (
    import.meta.env.VITE_DISCORD_WEBHOOK_URL ||
    localStorage.getItem('mc_discord_webhook_url') ||
    ''
  );
};

export const discordWebhookService = {
  isEnabled(): boolean {
    return Boolean(getWebhookUrl().trim());
  },

  getCustomWebhook(): string {
    return localStorage.getItem('mc_discord_webhook_url') || '';
  },

  setCustomWebhook(url: string) {
    if (!url.trim()) {
      localStorage.removeItem('mc_discord_webhook_url');
    } else {
      localStorage.setItem('mc_discord_webhook_url', url.trim());
    }
  },

  async sendPayload(payload: DiscordWebhookPayload): Promise<boolean> {
    const url = getWebhookUrl();
    if (!url) return false;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: payload.username || 'MineCoords Bot',
          avatar_url:
            payload.avatar_url ||
            'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f9ed.png',
          ...payload,
        }),
      });
      return response.ok;
    } catch (err) {
      console.warn('No se pudo enviar notificación al Webhook de Discord:', err);
      return false;
    }
  },

  /**
   * Notificar cuando un jugador publica una nueva coordenada
   */
  async notifyNewCoordinate(coord: {
    nombre: string;
    descripcion?: string | null;
    categoria: string;
    dimension: string;
    x: number;
    y: number;
    z: number;
    autor: string;
  }) {
    if (!this.isEnabled()) return;

    // Colores Discord: Overworld=Verde (0x57F287), Nether=Rojo (0xED4245), The End=Morado (0x9B59B6)
    let color = 0x57f287;
    if (coord.dimension === 'Nether') color = 0xed4245;
    if (coord.dimension === 'The End') color = 0x9b59b6;

    const embed: DiscordEmbed = {
      title: `📍 Nueva Coordenada: ${coord.nombre}`,
      description: coord.descripcion || 'Sin descripción adicional.',
      color,
      fields: [
        { name: '🌍 Dimensión', value: coord.dimension, inline: true },
        { name: '🏷️ Categoría', value: coord.categoria, inline: true },
        {
          name: '🎯 Coordenadas (X Y Z)',
          value: `\`X: ${coord.x} | Y: ${coord.y} | Z: ${coord.z}\``,
          inline: false,
        },
        {
          name: '⚡ Comando /tp Minecraft',
          value: `\`/tp @s ${coord.x} ${coord.y} ${coord.z}\``,
          inline: false,
        },
      ],
      footer: {
        text: `Publicado por ${coord.autor} • MineCoords`,
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendPayload({ embeds: [embed] });
  },

  /**
   * Notificar cuando un jugador propone un proyecto comunitario
   */
  async notifyProjectProposed(project: {
    nombre: string;
    descripcion: string;
    categoria: string;
    ubicacion: string;
    autor: string;
    video_url?: string | null;
    materialesCount?: number;
  }) {
    if (!this.isEnabled()) return;

    const fields: DiscordEmbedField[] = [
      { name: '🏗️ Categoría', value: project.categoria, inline: true },
      { name: '📌 Ubicación Estimada', value: project.ubicacion, inline: true },
      {
        name: '📦 Materiales Registrados',
        value: `${project.materialesCount || 0} ítems requeridos`,
        inline: true,
      },
    ];

    if (project.video_url) {
      fields.push({
        name: '🎬 Tutorial / Referencia en Video',
        value: `[Ver en YouTube](${project.video_url})`,
        inline: false,
      });
    }

    const embed: DiscordEmbed = {
      title: `📝 Nuevo Proyecto Propuesto: ${project.nombre}`,
      description: project.descripcion,
      color: 0xfee75c, // Amarillo / Oro para propuesto
      fields,
      footer: {
        text: `Propuesto por ${project.autor} • Pendiente de revisión del Staff`,
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendPayload({ embeds: [embed] });
  },

  /**
   * Notificar cuando un proyecto es Aprobado oficialmente por el Staff
   */
  async notifyProjectApproved(project: {
    nombre: string;
    moderador: string;
    ubicacionFinal: string;
  }) {
    if (!this.isEnabled()) return;

    const embed: DiscordEmbed = {
      title: `✅ ¡Proyecto Aprobado! ${project.nombre}`,
      description: `El equipo de moderación ha dado luz verde para iniciar la construcción.`,
      color: 0x57f287, // Verde
      fields: [
        {
          name: '📍 Ubicación Oficial Asignada',
          value: `\`${project.ubicacionFinal}\``,
          inline: false,
        },
        {
          name: '🛡️ Aprobado por',
          value: project.moderador,
          inline: true,
        },
      ],
      footer: {
        text: 'MineCoords Projects • ¡Ve a votar y donar materiales!',
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendPayload({ embeds: [embed] });
  },
};
