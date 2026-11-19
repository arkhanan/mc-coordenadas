export type UserRole = 'usuario' | 'moderador' | 'administrador';

export type Dimension = 'Overworld' | 'Nether' | 'The End';

export type CoordinateCategory =
  | 'Granja'
  | 'Base'
  | 'Portal'
  | 'Comercio'
  | 'Spawner'
  | 'Minería'
  | 'Redstone'
  | 'Otros';

export type CoordinateStatus = 'activa' | 'reportada' | 'archivada';

export type ProjectCategory =
  | 'Granja'
  | 'Mega Construcción'
  | 'Infraestructura'
  | 'Minijuego'
  | 'Comunidad'
  | 'Decoración'
  | 'Redstone'
  | 'Otros';

export type ProjectStatus =
  | 'propuesto'
  | 'aprobado'
  | 'en_construccion'
  | 'finalizado'
  | 'rechazado'
  | 'cancelado';

export type ReportStatus = 'pendiente' | 'resuelto' | 'descartado';

export interface UserProfile {
  id: string;
  discord_id: string;
  username: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at?: string;
  minecraft_username?: string | null;
  is_banned?: boolean;
  ban_reason?: string | null;
}

export interface Coordinate {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: CoordinateCategory;
  dimension: Dimension;
  x: number;
  y: number;
  z: number;
  usuario_id: string;
  estado: CoordinateStatus;
  fecha: string;
  updated_at?: string;
  // Joins
  usuario?: UserProfile;
}

export interface CoordinateReport {
  id: string;
  coordenada_id: string;
  reportado_por: string;
  motivo: string;
  estado: ReportStatus;
  revisado_por?: string | null;
  resolucion?: string | null;
  fecha_creacion: string;
  fecha_resolucion?: string | null;
  // Joins
  coordenada?: Coordinate;
  reportador?: UserProfile;
  revisor?: UserProfile;
}

export interface ProjectMaterial {
  id: string;
  nombre: string;
  cantidad_requerida: number;
  cantidad_reunida: number;
  unidad?: string; // 'bloques', 'stacks', 'cofres'
}

export interface Project {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: ProjectCategory;
  responsable_id: string;
  ubicacion: string;
  estado: ProjectStatus;
  video_url?: string | null;
  schematic_url?: string | null;
  materiales?: ProjectMaterial[];
  votos?: string[]; // Array de IDs de usuarios que apoyaron el proyecto
  motivo_rechazo?: string | null;
  aprobado_por?: string | null;
  fecha_creacion: string;
  fecha_aprobacion?: string | null;
  updated_at?: string;
  // Joins
  responsable?: UserProfile;
  aprobador?: UserProfile;
}

export interface ServerStats {
  totalCoordinates: number;
  totalProjects: number;
  activeProjects: number;
  pendingApprovals: number;
  reportedCoordinates: number;
  totalMembers: number;
}
