import { createClient } from 'npm:@supabase/supabase-js@2';

const encoder = new TextEncoder();
const hexToBytes = (hex: string) => new Uint8Array(hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []);

async function verifyDiscordRequest(request: Request, rawBody: string, publicKey: string) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  if (!signature || !timestamp) return false;

  try {
    const key = await crypto.subtle.importKey('raw', hexToBytes(publicKey), { name: 'Ed25519' }, false, ['verify']);
    return await crypto.subtle.verify('Ed25519', key, hexToBytes(signature), encoder.encode(timestamp + rawBody));
  } catch {
    return false;
  }
}

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

const input = (customId: string, label: string, style = 1, required = true, placeholder = '') => ({
  type: 4,
  custom_id: customId,
  label,
  style,
  required,
  ...(placeholder ? { placeholder } : {}),
});

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const rawBody = await request.text();
  const publicKey = Deno.env.get('DISCORD_PUBLIC_KEY');
  if (!publicKey || !(await verifyDiscordRequest(request, rawBody, publicKey))) {
    return new Response('Invalid Discord signature', { status: 401 });
  }

  let interaction: Record<string, any>;
  try {
    interaction = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Discord endpoint verification (PING).
  if (interaction.type === 1) return json({ type: 1 });

  const allowedGuildId = Deno.env.get('DISCORD_GUILD_ID');
  if (allowedGuildId && interaction.guild_id !== allowedGuildId) {
    return json({ type: 4, data: { content: 'Esta aplicación no está habilitada en este servidor.', flags: 64 } });
  }

  // /coordenada opens a modal. Five text inputs is Discord's modal limit.
  if (interaction.type === 2 && interaction.data?.name === 'coordenada') {
    return json({
      type: 9,
      data: {
        custom_id: 'create_coordinate',
        title: 'Publicar coordenada',
        components: [
          { type: 1, components: [input('nombre', 'Nombre de la ubicación')] },
          { type: 1, components: [input('dimension', 'Dimensión: Overworld, Nether o The End', 1, true, 'Overworld')] },
          { type: 1, components: [input('xyz', 'Coordenadas X Y Z', 1, true, 'Ejemplo: 120 64 -250')] },
          { type: 1, components: [input('categoria', 'Categoría', 1, true, 'Granja, Base, Portal, Comercio, Spawner, Minería, Redstone u Otros')] },
          { type: 1, components: [input('descripcion', 'Descripción (opcional)', 2, false, 'Cómo llegar, avisos...')] },
        ],
      },
    });
  }

  if (interaction.type === 5 && interaction.data?.custom_id === 'create_coordinate') {
    const values: Record<string, string> = {};
    for (const row of interaction.data.components ?? []) {
      for (const component of row.components ?? []) values[component.custom_id] = component.value?.trim() ?? '';
    }

    const dimensions = ['Overworld', 'Nether', 'The End'];
    const categories = ['Granja', 'Base', 'Portal', 'Comercio', 'Spawner', 'Minería', 'Redstone', 'Otros'];
    const xyz = values.xyz?.split(/[\s,;]+/).map(Number);
    if (!values.nombre || !dimensions.includes(values.dimension) || !categories.includes(values.categoria) ||
      !xyz || xyz.length !== 3 || xyz.some((n) => !Number.isFinite(n))) {
      return json({ type: 4, data: { content: 'Revisa el formulario: dimensión/categoría inválida o coordenadas con formato incorrecto. Usa X Y Z.', flags: 64 } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ type: 4, data: { content: 'La función aún no tiene configuradas las credenciales de Supabase.', flags: 64 } });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const discordUserId = interaction.member?.user?.id ?? interaction.user?.id;
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('discord_id', discordUserId)
      .maybeSingle();

    if (profileError || !profile) {
      return json({ type: 4, data: { content: 'Primero inicia sesión en la web con Discord para vincular tu perfil y vuelve a intentarlo.', flags: 64 } });
    }

    const { error } = await supabase.from('coordenadas').insert({
      nombre: values.nombre,
      descripcion: values.descripcion || null,
      categoria: values.categoria,
      dimension: values.dimension,
      x: xyz[0], y: xyz[1], z: xyz[2],
      usuario_id: profile.id,
      estado: 'activa',
    });

    if (error) {
      console.error('Coordinate insert failed:', error);
      return json({ type: 4, data: { content: 'No se pudo guardar la coordenada. Revisa la configuración de Supabase.', flags: 64 } });
    }

    return json({ type: 4, data: { content: `✅ Coordenada **${values.nombre}** guardada (${values.dimension}: ${xyz.join(', ')}).`, flags: 64 } });
  }

  return json({ type: 4, data: { content: 'Interacción no reconocida.', flags: 64 } });
});
