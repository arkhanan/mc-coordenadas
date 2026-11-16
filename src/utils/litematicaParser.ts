import { ProjectMaterial } from '../types';

/**
 * Parsea listas de materiales exportadas desde el mod Litematica (CurseForge)
 * Soporta formatos CSV, TSV y texto copiado desde el portapapeles.
 */
export const parseLitematicaMaterialList = (rawText: string): ProjectMaterial[] => {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const materials: ProjectMaterial[] = [];

  for (const line of lines) {
    // Ignorar encabezados comunes de Litematica
    const lower = line.toLowerCase();
    if (
      lower.startsWith('item,') ||
      lower.startsWith('item;') ||
      lower.startsWith('item\t') ||
      lower.startsWith('item |') ||
      lower.includes('material list') ||
      lower.startsWith('#')
    ) {
      continue;
    }

    let name = '';
    let quantity = 0;

    // Caso 1: CSV delimitado por comas o punto y coma (Formato nativo de exportación de Litematica)
    // Ej: "Obsidian,128,128,0" o "minecraft:chest,64,20,44"
    if (line.includes(',') || line.includes(';') || line.includes('\t') || line.includes('|')) {
      const parts = line.split(/[,;\t|]/).map((p) => p.trim());
      if (parts.length >= 2) {
        name = parts[0];
        // Intentar parsear el número de la segunda columna (Total)
        const parsedQty = parseInt(parts[1].replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsedQty) && parsedQty > 0) {
          quantity = parsedQty;
        }
      }
    }

    // Caso 2: Formatos de texto tipo "64x Stone" o "Stone x64" o "Stone: 64"
    if (!name || quantity === 0) {
      const matchPrefix = line.match(/^(\d+)\s*[xX*:]\s*(.+)$/);
      if (matchPrefix) {
        quantity = parseInt(matchPrefix[1], 10);
        name = matchPrefix[2];
      } else {
        const matchSuffix = line.match(/^(.+?)\s*[xX*:]\s*(\d+)$/);
        if (matchSuffix) {
          name = matchSuffix[1];
          quantity = parseInt(matchSuffix[2], 10);
        }
      }
    }

    // Si encontramos nombre y cantidad válida
    if (name && quantity > 0) {
      // Limpiar prefijo 'minecraft:' si existe (ej. 'minecraft:blue_ice' -> 'Blue Ice')
      let cleanName = name.replace(/^minecraft:/i, '').replace(/_/g, ' ');
      // Capitalizar palabras
      cleanName = cleanName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
        .trim();

      materials.push({
        id: 'mat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        nombre: cleanName,
        cantidad_requerida: quantity,
        cantidad_reunida: 0,
        unidad: quantity >= 64 ? 'bloques' : 'unidades',
      });
    }
  }

  return materials;
};
