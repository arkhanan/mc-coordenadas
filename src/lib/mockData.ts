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

export const INITIAL_COORDINATES: Coordinate[] = [];

export const INITIAL_REPORTS: CoordinateReport[] = [];

export const INITIAL_PROJECTS: Project[] = [];

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
