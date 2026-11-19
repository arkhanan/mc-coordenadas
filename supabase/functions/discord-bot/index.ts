const headersJson = { "Content-Type": "application/json" };
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: headersJson }); }
function text(body: string, status: number) { return new Response(body, { status }); }
function ephemeral(content: string) { return json({ type: 4, data: { content: content.slice(0, 1900), flags: 64 } }); }
function ephemeralEmbed(embed: Record<string, unknown>) { return json({ type: 4, data: { embeds: [embed], flags: 64 } }); }
function dimensionColor(dimension: string): number {
  if (dimension === "Nether") return 0xed4245;
  if (dimension === "The End") return 0x9b59b6;
  return 0x57f287;
}
function coordinateEmbedField(row: Record<string, any>) {
  const description = typeof row.descripcion === "string" && row.descripcion.trim()
    ? `\n${row.descripcion.trim().slice(0, 240)}`
    : "";
  const value = `**${row.categoria} · ${row.dimension}**\n📌 \`X ${row.x}  Y ${row.y}  Z ${row.z}\`${description}\nID: \`${row.id}\``;
  return { name: `📍 ${String(row.nombre ?? "Ubicación").slice(0, 245)}`, value: value.slice(0, 1024), inline: false };
}
function coordinateResultsEmbed(rows: any[], title: string) {
  return ephemeralEmbed({
    title,
    description: `${rows.length} resultado${rows.length === 1 ? "" : "s"}.`,
    color: 0x5865f2,
    fields: rows.slice(0, 10).map((row) => coordinateEmbedField(row)),
    footer: { text: "MineCoords · Coordenadas activas" },
    timestamp: new Date().toISOString(),
  });
}
function hexBytes(hex: string): Uint8Array { if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2) throw new Error("Invalid hex"); const out = new Uint8Array(hex.length / 2); for (let i = 0; i < out.length; i++) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16); return out; }
async function verifyDiscord(body: string, signature: string, timestamp: string, publicKey: string): Promise<boolean> {
  if (!/^\d{10,}$/.test(timestamp) || !/^[0-9a-fA-F]{128}$/.test(signature) || !/^[0-9a-fA-F]{64}$/.test(publicKey)) return false;
  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 300_000) return false;
  try { const key = await crypto.subtle.importKey("raw", hexBytes(publicKey), { name: "Ed25519" }, false, ["verify"]); return await crypto.subtle.verify("Ed25519", key, hexBytes(signature), new TextEncoder().encode(timestamp + body)); } catch (error) { console.error("Discord signature verification failed", error); return false; }
}
function supabaseConfig() {
  const url = Deno.env.get("SUPABASE_URL"); const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!url) throw new Error("SUPABASE_URL is required"); if (!raw) throw new Error("SUPABASE_SECRET_KEYS is required");
  let keys: Record<string, string>; try { keys = JSON.parse(raw); } catch { throw new Error("SUPABASE_SECRET_KEYS must be valid JSON"); }
  const key = keys.default; if (!key) throw new Error("Supabase secret key named default is required");
  return { url: url.replace(/\/$/, ""), key };
}
async function db(path: string, method = "GET", payload?: unknown): Promise<Response> {
  const { url, key } = supabaseConfig(); const headers = new Headers({ apikey: key, Accept: "application/json" });
  if (payload !== undefined) headers.set("Content-Type", "application/json");
  if (method === "POST" || method === "PATCH") headers.set("Prefer", "return=representation");
  return fetch(`${url}/rest/v1/${path}`, { method, headers, body: payload === undefined ? undefined : JSON.stringify(payload) });
}
async function profileFor(discordId: string): Promise<{ id: string; role: string } | null> {
  const q = new URLSearchParams({ select: "id,role", discord_id: `eq.${discordId}`, limit: "1" }); const r = await db(`profiles?${q}`);
  if (!r.ok) throw new Error(`Profile lookup failed (${r.status})`); const rows = await r.json(); return Array.isArray(rows) && rows.length ? rows[0] : null;
}
const categories = ["Granja", "Base", "Portal", "Comercio", "Spawner", "Minería", "Redstone", "Otros"];
const dimensions = ["Overworld", "Nether", "The End"];
function opt(options: Array<{ name: string; value?: unknown }>, name: string) { return options.find((x) => x.name === name)?.value; }
function strOpt(options: Array<{ name: string; value?: unknown }>, name: string): string | null { const v = opt(options, name); return typeof v === "string" ? v : null; }
function numOpt(options: Array<{ name: string; value?: unknown }>, name: string): number | null { const v = opt(options, name); return typeof v === "number" && Number.isFinite(v) ? v : null; }
async function command(interaction: Record<string, any>, guildId: string): Promise<Response> {
  if (interaction.guild_id !== guildId) return ephemeral("Este bot solo está habilitado en el servidor configurado.");
  if (interaction.data?.name !== "coordenadas") return ephemeral("Comando no reconocido.");
  const sub = interaction.data.options?.find((x: { type: number }) => x.type === 1); if (!sub) return ephemeral("Usa listar, buscar, mias, agregar, copiar o archivar.");
  const options = Array.isArray(sub.options) ? sub.options : []; const discordId = interaction.member?.user?.id ?? interaction.user?.id;
  if (typeof discordId !== "string") return ephemeral("No pude identificar tu usuario de Discord.");
  let profile: { id: string; role: string } | null; try { profile = await profileFor(discordId); } catch (e) { console.error("Profile lookup error", e); return ephemeral("No se pudo consultar tu perfil. Inténtalo más tarde."); }
  if (!profile) return ephemeral("Tu Discord no está vinculado a un perfil. Vincúlalo primero con la aplicación.");
  if (sub.name === "listar") {
    const query = new URLSearchParams({ select: "id,nombre,descripcion,categoria,dimension,x,y,z", estado: "eq.activa", order: "fecha.desc", limit: "10" });
    const categoria = strOpt(options, "categoria");
    const dimension = strOpt(options, "dimension");
    if (categoria && categories.includes(categoria)) query.set("categoria", `eq.${categoria}`);
    if (dimension && dimensions.includes(dimension)) query.set("dimension", `eq.${dimension}`);
    const r = await db(`coordenadas?${query.toString()}`);
    if (!r.ok) { console.error("Coordinate list failed", r.status); return ephemeral("No se pudieron consultar las coordenadas."); }
    const rows = await r.json(); if (!Array.isArray(rows) || !rows.length) return ephemeral("No hay coordenadas activas.");
    const content = rows.slice(0, 10).map((row: any) => {
      const name = String(row.nombre ?? "Ubicacion").slice(0, 100);
      return `\u{1F4CD} **${name}** | ${row.categoria} | ${row.dimension}\nXYZ (copia este bloque):\n\`\`\`\n${row.x} ${row.y} ${row.z}\n\`\`\`\nID: \`${row.id}\``;
    }).join("\n\n");
    return ephemeral(content);
  }
  if (sub.name === "buscar") {
    const nombre = strOpt(options, "nombre")?.trim();
    if (!nombre || nombre.length < 2 || nombre.length > 80) return ephemeral("Escribe al menos 2 caracteres y como máximo 80 para buscar.");
    const safeName = nombre.replace(/[,*()%_\\]/g, " ").replace(/\s+/g, " ").trim();
    if (safeName.length < 2) return ephemeral("El texto de búsqueda no contiene caracteres válidos.");
    const query = new URLSearchParams({ select: "id,nombre,descripcion,categoria,dimension,x,y,z", estado: "eq.activa", nombre: `ilike.*${safeName}*`, order: "fecha.desc", limit: "10" });
    const r = await db(`coordenadas?${query.toString()}`);
    if (!r.ok) { console.error("Coordinate search failed", r.status); return ephemeral("No se pudo realizar la búsqueda."); }
    const rows = await r.json();
    if (!Array.isArray(rows) || !rows.length) return ephemeral(`No encontré coordenadas activas que coincidan con “${nombre}”.`);
    return coordinateResultsEmbed(rows, "🔎 Resultados de búsqueda");
  }
  if (sub.name === "mias") {
    const query = new URLSearchParams({ select: "id,nombre,descripcion,categoria,dimension,x,y,z", estado: "eq.activa", usuario_id: `eq.${profile.id}`, order: "fecha.desc", limit: "10" });
    const r = await db(`coordenadas?${query.toString()}`);
    if (!r.ok) { console.error("Own coordinates lookup failed", r.status); return ephemeral("No se pudieron consultar tus coordenadas."); }
    const rows = await r.json();
    if (!Array.isArray(rows) || !rows.length) return ephemeral("Todavía no tienes coordenadas activas publicadas.");
    return coordinateResultsEmbed(rows, "🧭 Tus coordenadas");
  }
  if (sub.name === "copiar") {
    const id = strOpt(options, "id")?.trim();
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return ephemeral("Indica el ID UUID de una coordenada activa.");
    const query = new URLSearchParams({ select: "id,nombre,dimension,x,y,z", id: `eq.${id}`, estado: "eq.activa", limit: "1" });
    const r = await db(`coordenadas?${query.toString()}`);
    if (!r.ok) { console.error("Coordinate copy lookup failed", r.status); return ephemeral("No se pudo consultar esa coordenada."); }
    const rows = await r.json();
    if (!Array.isArray(rows) || !rows.length) return ephemeral("No encontré una coordenada activa con ese ID.");
    const coordinate = rows[0];
    const dimensionId = coordinate.dimension === "Nether" ? "the_nether" : coordinate.dimension === "The End" ? "the_end" : "overworld";
    const teleportCommand = `/execute in minecraft:${dimensionId} run tp @s ${coordinate.x} ${coordinate.y} ${coordinate.z}`;
    return ephemeral(`📋 **${coordinate.nombre}**\nCoordenadas XYZ:\n\`\`\`\n${coordinate.x} ${coordinate.y} ${coordinate.z}\n\`\`\`\nComando de teletransporte:\n\`\`\`\n${teleportCommand}\n\`\`\``);
  }
  if (sub.name === "agregar") {
    const nombre = strOpt(options, "nombre")?.trim(); const categoria = strOpt(options, "categoria"); const dimension = strOpt(options, "dimension");
    const x = numOpt(options, "x"); const y = numOpt(options, "y"); const z = numOpt(options, "z"); const descripcion = strOpt(options, "descripcion")?.trim() ?? null;
    if (!nombre || nombre.length > 100 || !categoria || !categories.includes(categoria) || !dimension || !dimensions.includes(dimension) || x === null || y === null || z === null || (descripcion !== null && descripcion.length > 500)) return ephemeral("Datos inválidos. Revisa nombre (máx. 100), categoría, dimensión, coordenadas y descripción (máx. 500).");
    const r = await db("coordenadas", "POST", { nombre, descripcion, categoria, dimension, x, y, z, usuario_id: profile.id, estado: "activa" });
    if (!r.ok) { console.error("Coordinate insert failed", r.status, await r.text()); return ephemeral("No se pudo guardar la coordenada. Revisa los datos e inténtalo de nuevo."); }
    const rows = await r.json(); const id = Array.isArray(rows) ? rows[0]?.id : null;
    return ephemeralEmbed({
      title: "✅ Coordenada publicada",
      description: `**${nombre}** ya está disponible para la comunidad.`,
      color: dimensionColor(dimension),
      fields: [
        { name: "Categoría", value: categoria, inline: true },
        { name: "Dimensión", value: dimension, inline: true },
        { name: "Coordenadas", value: `\`X ${x}  Y ${y}  Z ${z}\``, inline: false },
        ...(descripcion ? [{ name: "Descripción", value: descripcion.slice(0, 1024), inline: false }] : []),
        ...(id ? [{ name: "ID para archivar", value: `\`${id}\``, inline: false }] : []),
      ],
      footer: { text: "MineCoords · Publicación inmediata" },
      timestamp: new Date().toISOString(),
    });
  }
  if (sub.name === "archivar") {
    const id = strOpt(options, "id")?.trim(); if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return ephemeral("Indica un ID de coordenada válido.");
    const privileged = ["moderador", "administrador"].includes(profile.role);
    const q = new URLSearchParams({ id: `eq.${id}`, estado: "eq.activa", ...(privileged ? {} : { usuario_id: `eq.${profile.id}` }), select: "id" });
    const r = await db(`coordenadas?${q}`, "PATCH", { estado: "archivada" });
    if (!r.ok) { console.error("Coordinate archive failed", r.status); return ephemeral("No se pudo archivar la coordenada."); }
    const rows = await r.json(); if (!Array.isArray(rows) || !rows.length) return ephemeral("No se encontró una coordenada activa que puedas archivar.");
    return ephemeralEmbed({
      title: "📦 Coordenada archivada",
      description: `La coordenada \`${id}\` ya no aparece entre las ubicaciones activas.`,
      color: 0x747f8d,
      footer: { text: "MineCoords · Acción completada" },
      timestamp: new Date().toISOString(),
    });
  }
  return ephemeral("Subcomando no reconocido. Usa listar, agregar o archivar.");
}
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return text("Method not allowed", 405);
  const publicKey = Deno.env.get("DISCORD_PUBLIC_KEY"); const guildId = Deno.env.get("DISCORD_GUILD_ID");
  if (!publicKey) return text("Missing DISCORD_PUBLIC_KEY", 500); if (!guildId) return text("Missing DISCORD_GUILD_ID", 500);
  const signature = req.headers.get("x-signature-ed25519") ?? ""; const timestamp = req.headers.get("x-signature-timestamp") ?? ""; const body = await req.text();
  if (!await verifyDiscord(body, signature, timestamp, publicKey)) return text("Invalid request signature", 401);
  let interaction: Record<string, any>; try { interaction = JSON.parse(body); } catch { return text("Invalid JSON", 400); }
  if (interaction.type === 1) return json({ type: 1 }); if (interaction.type !== 2) return text("Unsupported interaction", 400);
  try { return await command(interaction, guildId); } catch (e) { console.error("Discord interaction error", e); return ephemeral("Ocurrió un error inesperado. Inténtalo de nuevo más tarde."); }
});
