import React from 'react';
import { Dimension, CoordinateStatus, ProjectStatus, UserRole } from '../../types';

export const DimensionBadge: React.FC<{ dimension: Dimension; className?: string }> = ({
  dimension,
  className = '',
}) => {
  const styles = {
    Overworld: 'bg-emerald-950/80 text-emerald-400 border-emerald-600/50 hover:bg-emerald-900/80',
    Nether: 'bg-rose-950/80 text-rose-400 border-rose-600/50 hover:bg-rose-900/80',
    'The End': 'bg-purple-950/80 text-purple-300 border-purple-600/50 hover:bg-purple-900/80',
  }[dimension];

  const icons = {
    Overworld: '🌿',
    Nether: '🔥',
    'The End': '👁️',
  }[dimension];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} ${className} transition-colors`}
    >
      <span>{icons}</span>
      <span>{dimension}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{
  status: CoordinateStatus | ProjectStatus | 'pendiente' | 'resuelto' | 'descartado';
  className?: string;
}> = ({ status, className = '' }) => {
  const config: Record<string, { label: string; style: string; icon: string }> = {
    // Coordinate Statuses
    activa: { label: 'Activa', style: 'bg-green-500/10 text-green-400 border-green-500/30', icon: '●' },
    reportada: { label: 'Reportada', style: 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse', icon: '⚠' },
    archivada: { label: 'Archivada', style: 'bg-gray-500/10 text-gray-400 border-gray-500/30', icon: '📦' },

    // Project Statuses
    propuesto: { label: 'Propuesto', style: 'bg-amber-500/15 text-amber-300 border-amber-500/40', icon: '⏳' },
    aprobado: { label: 'Aprobado', style: 'bg-blue-500/15 text-blue-300 border-blue-500/40', icon: '✓' },
    en_construccion: { label: 'En Construcción', style: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40', icon: '⛏' },
    finalizado: { label: 'Finalizado', style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40', icon: '🏆' },
    rechazado: { label: 'Rechazado', style: 'bg-rose-500/15 text-rose-300 border-rose-500/40', icon: '✕' },
    cancelado: { label: 'Cancelado', style: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/40', icon: '⊘' },

    // Report Statuses
    pendiente: { label: 'Pendiente', style: 'bg-amber-500/15 text-amber-300 border-amber-500/40', icon: '⏳' },
    resuelto: { label: 'Resuelto', style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40', icon: '✓' },
    descartado: { label: 'Descartado', style: 'bg-gray-500/15 text-gray-400 border-gray-500/40', icon: '✕' },
  };

  const item = config[status] || { label: status, style: 'bg-gray-500/10 text-gray-300 border-gray-500/30', icon: '•' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${item.style} ${className}`}
    >
      <span className="text-[10px]">{item.icon}</span>
      <span>{item.label}</span>
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole; className?: string }> = ({
  role,
  className = '',
}) => {
  const styles = {
    administrador: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
    moderador: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40',
    usuario: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  }[role];

  const labels = {
    administrador: 'Admin',
    moderador: 'Mod',
    usuario: 'Jugador',
  }[role];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${styles} ${className}`}
    >
      {labels}
    </span>
  );
};
