import { UserProfile, Coordinate, CoordinateReport, Project } from '../types';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'u-admin-01',
    discord_id: '123456789012345678',
    username: 'Steve_Admin',
    avatar_url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=128&h=128&fit=crop&crop=face',
    role: 'administrador',
    created_at: '2026-01-10T12:00:00Z',
  },
  {
    id: 'u-mod-02',
    discord_id: '234567890123456789',
    username: 'Alex_Moderator',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face',
    role: 'moderador',
    created_at: '2026-01-15T15:30:00Z',
  },
  {
    id: 'u-user-03',
    discord_id: '345678901234567890',
    username: 'CreeperHunter99',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
    role: 'usuario',
    created_at: '2026-02-01T09:15:00Z',
  },
  {
    id: 'u-user-04',
    discord_id: '456789012345678901',
    username: 'DiamondMiner_Pro',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=128&h=128&fit=crop&crop=face',
    role: 'usuario',
    created_at: '2026-02-10T18:45:00Z',
  },
];

export const INITIAL_COORDINATES: Coordinate[] = [
  {
    id: 'c-101',
    nombre: 'Spawn Comunitario & Centro Comercial',
    descripcion: 'Punto de encuentro principal del servidor. Incluye tiendas con aldeanos, cofres comunitarios y mesa de encantamientos nivel 30.',
    categoria: 'Comercio',
    dimension: 'Overworld',
    x: 0,
    y: 72,
    z: 0,
    usuario_id: 'u-admin-01',
    estado: 'activa',
    fecha: '2026-01-11T10:00:00Z',
    usuario: INITIAL_PROFILES[0],
  },
  {
    id: 'c-102',
    nombre: 'Granja Cuádruple de Hierro Eficiente',
    descripcion: 'Genera aproximadamente 1400 lingotes de hierro por hora. Respetar las zonas delimitadas para evitar romper los golems.',
    categoria: 'Granja',
    dimension: 'Overworld',
    x: 450,
    y: 110,
    z: -320,
    usuario_id: 'u-mod-02',
    estado: 'activa',
    fecha: '2026-01-18T14:20:00Z',
    usuario: INITIAL_PROFILES[1],
  },
  {
    id: 'c-103',
    nombre: 'Hub de Portales en el Techo del Nether',
    descripcion: 'Conecta todas las bases principales a través de hielo azul. Por favor usar barcas y mantener la vía limpia.',
    categoria: 'Portal',
    dimension: 'Nether',
    x: 56,
    y: 128,
    z: -40,
    usuario_id: 'u-admin-01',
    estado: 'activa',
    fecha: '2026-01-20T19:00:00Z',
    usuario: INITIAL_PROFILES[0],
  },
  {
    id: 'c-104',
    nombre: 'Granja de Oro y Experiencia en el Nether',
    descripcion: 'Plataforma en anillo sobre el techo del Nether. Nivel 30 en menos de un minuto. Llevar armadura de oro.',
    categoria: 'Granja',
    dimension: 'Nether',
    x: -1280,
    y: 195,
    z: 640,
    usuario_id: 'u-user-03',
    estado: 'activa',
    fecha: '2026-02-02T11:45:00Z',
    usuario: INITIAL_PROFILES[2],
  },
  {
    id: 'c-105',
    nombre: 'End Gateway Principal & Granja de Endermans',
    descripcion: 'Fácil acceso para recargar perlas de ender y experiencia rápida antes de explorar las End Cities.',
    categoria: 'Spawner',
    dimension: 'The End',
    x: 100,
    y: 50,
    z: 0,
    usuario_id: 'u-mod-02',
    estado: 'activa',
    fecha: '2026-02-05T16:10:00Z',
    usuario: INITIAL_PROFILES[1],
  },
  {
    id: 'c-106',
    nombre: 'Base Subterránea Abandonada (Coordenada sospechosa)',
    descripcion: 'Se reporta que el portal de entrada fue destruido y hay trampas activadas cerca del spawn.',
    categoria: 'Base',
    dimension: 'Overworld',
    x: 820,
    y: -45,
    z: 1100,
    usuario_id: 'u-user-04',
    estado: 'reportada',
    fecha: '2026-02-12T08:30:00Z',
    usuario: INITIAL_PROFILES[3],
  },
];

export const INITIAL_REPORTS: CoordinateReport[] = [
  {
    id: 'r-201',
    coordenada_id: 'c-106',
    reportado_por: 'u-user-03',
    motivo: 'El portal fue roto con lava y hay trampas con dinamita que matan a jugadores nuevos.',
    estado: 'pendiente',
    fecha_creacion: '2026-02-14T09:20:00Z',
    coordenada: INITIAL_COORDINATES[5],
    reportador: INITIAL_PROFILES[2],
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p-301',
    nombre: 'Red Ferroviaria Comunitaria del Nether',
    descripcion: 'Construcción de túneles de 3x3 de hielo azul y pistones para conectar todas las bases en menos de 30 segundos.',
    categoria: 'Infraestructura',
    responsable_id: 'u-user-03',
    ubicacion: 'Nether (Y: 130, Conexiones a X: 0, X: 1000, Z: -1000)',
    estado: 'propuesto',
    fecha_creacion: '2026-02-12T17:00:00Z',
    responsable: INITIAL_PROFILES[2],
  },
  {
    id: 'p-302',
    nombre: 'Drenado y Mega Granja de Monumento Oceánico',
    descripcion: 'Drenado completo con arena y esponjas de un monumento oceánico para convertirlo en granja masiva de prismarina y linternas del mar.',
    categoria: 'Mega Construcción',
    responsable_id: 'u-mod-02',
    ubicacion: 'Overworld (X: -2400, Y: 62, Z: 1850)',
    estado: 'aprobado',
    fecha_creacion: '2026-01-25T14:00:00Z',
    fecha_aprobacion: '2026-01-26T10:15:00Z',
    aprobado_por: 'u-admin-01',
    responsable: INITIAL_PROFILES[1],
    aprobador: INITIAL_PROFILES[0],
  },
  {
    id: 'p-303',
    nombre: 'Coliseo PvP y Torneo de Elytras',
    descripcion: 'Estructura circular de estilo romano con gradas, foso de combate y circuito de túneles con fuego artificial para carreras de elytras.',
    categoria: 'Minijuego',
    responsable_id: 'u-user-04',
    ubicacion: 'Overworld (X: 120, Y: 70, Z: -850)',
    estado: 'en_construccion',
    fecha_creacion: '2026-01-30T19:30:00Z',
    fecha_aprobacion: '2026-02-01T12:00:00Z',
    aprobado_por: 'u-mod-02',
    responsable: INITIAL_PROFILES[3],
    aprobador: INITIAL_PROFILES[1],
  },
  {
    id: 'p-304',
    nombre: 'Fábrica Automatizada de Cohetes de Fuegos Artificiales',
    descripcion: 'Sistema de caña de azúcar y granja de pólvora unificadas con autocrafter de la 1.21.',
    categoria: 'Redstone',
    responsable_id: 'u-admin-01',
    ubicacion: 'Overworld (X: -450, Y: 64, Z: -300)',
    estado: 'finalizado',
    fecha_creacion: '2026-01-12T10:00:00Z',
    fecha_aprobacion: '2026-01-13T09:00:00Z',
    aprobado_por: 'u-admin-01',
    responsable: INITIAL_PROFILES[0],
    aprobador: INITIAL_PROFILES[0],
  },
  {
    id: 'p-305',
    nombre: 'Granja de Withers en el End',
    descripcion: 'Diseño arriesgado que requiere encerrar un Wither bajo el portal de salida del End.',
    categoria: 'Granja',
    responsable_id: 'u-user-04',
    ubicacion: 'The End (X: 0, Y: 60, Z: 0)',
    estado: 'rechazado',
    motivo_rechazo: 'Riesgo elevado de destruir el portal de salida del End si falla la jaula de bedrock. Se requiere rediseño seguro.',
    fecha_creacion: '2026-02-08T15:20:00Z',
    fecha_aprobacion: '2026-02-09T11:00:00Z',
    aprobado_por: 'u-admin-01',
    responsable: INITIAL_PROFILES[3],
    aprobador: INITIAL_PROFILES[0],
  },
];

// LocalStorage helpers for mock/demo mode
const STORAGE_KEYS = {
  PROFILES: 'mc_profiles_data',
  COORDINATES: 'mc_coordinates_data',
  REPORTS: 'mc_reports_data',
  PROJECTS: 'mc_projects_data',
  CURRENT_USER_ID: 'mc_current_user_id',
};

export const getStoredProfiles = (): UserProfile[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
    return INITIAL_PROFILES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PROFILES;
  }
};

export const saveStoredProfiles = (profiles: UserProfile[]) => {
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
};

export const getStoredCoordinates = (): Coordinate[] => {
  const data = localStorage.getItem(STORAGE_KEYS.COORDINATES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.COORDINATES, JSON.stringify(INITIAL_COORDINATES));
    return INITIAL_COORDINATES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_COORDINATES;
  }
};

export const saveStoredCoordinates = (coords: Coordinate[]) => {
  localStorage.setItem(STORAGE_KEYS.COORDINATES, JSON.stringify(coords));
};

export const getStoredReports = (): CoordinateReport[] => {
  const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
    return INITIAL_REPORTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_REPORTS;
  }
};

export const saveStoredReports = (reports: CoordinateReport[]) => {
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
};

export const getStoredProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
    return INITIAL_PROJECTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PROJECTS;
  }
};

export const saveStoredProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const getActiveUserId = (): string => {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || INITIAL_PROFILES[0].id;
};

export const setActiveUserId = (id: string) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
};
