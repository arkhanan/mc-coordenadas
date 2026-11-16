import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { UserProfile, UserRole } from '../types';
import { RoleBadge } from '../components/common/Badge';
import {
  Settings,
  Shield,
  Users,
  Search,
  CheckCircle2,
  Database,
  Lock,
  RefreshCw,
  Server,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { profile, isAdmin, isSupabaseConnected } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (!isAdmin) {
    return (
      <div className="py-20 text-center">
        <Lock size={48} className="text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Panel de Administración Restringido</h2>
        <p className="text-xs text-discord-text-muted mt-1">
          Solo los administradores del servidor tienen permisos para gestionar usuarios y roles.
        </p>
      </div>
    );
  }

  const handleRoleChange = async (userId: string, newRole: UserRole, username: string) => {
    try {
      setUpdatingId(userId);
      await adminService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setSuccessNotice(`Rol de ${username} actualizado a "${newRole}" con éxito.`);
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Error al actualizar rol de usuario.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.discord_id && u.discord_id.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-discord-border/50">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Settings className="text-rose-400" />
            <span>Administración General & Usuarios</span>
          </h1>
          <p className="text-xs text-discord-text-muted mt-1">
            Gestión centralizada de miembros, asignación de moderadores y estado del sistema.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-discord-card hover:bg-discord-hover border border-discord-border/70 text-xs text-discord-text-normal font-semibold transition-all self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refrescar</span>
        </button>
      </div>

      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-discord-card border border-discord-border/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-discord-text-muted uppercase">Base de Datos</span>
            <Database size={16} className="text-discord-blurple" />
          </div>
          <p className="text-sm font-bold text-white">
            {isSupabaseConnected ? 'PostgreSQL Supabase (RLS Activo)' : 'Almacenamiento Local (Demo)'}
          </p>
          <p className="text-[11px] text-discord-text-muted mt-1">
            {isSupabaseConnected
              ? 'Conexión SSL encriptada'
              : 'Configura las variables de entorno para vincular producción'}
          </p>
        </div>

        <div className="bg-discord-card border border-discord-border/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-discord-text-muted uppercase">Autenticación</span>
            <Shield size={16} className="text-indigo-400" />
          </div>
          <p className="text-sm font-bold text-white">Discord OAuth v10</p>
          <p className="text-[11px] text-discord-text-muted mt-1">
            Sincronización automática de IDs, avatares y roles
          </p>
        </div>

        <div className="bg-discord-card border border-discord-border/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-discord-text-muted uppercase">Servidor MC</span>
            <Server size={16} className="text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-white">
            {import.meta.env.VITE_MC_SERVER_IP || 'play.minecraft-comunidad.net'}
          </p>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">
            En línea • Whitelist activa
          </p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-discord-card border border-discord-border/60 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-discord-border/50">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-discord-blurple" />
            <h3 className="text-base font-bold text-white">Usuarios & Asignación de Roles</h3>
          </div>

          {/* Search Member */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-discord-text-muted" />
            <input
              type="text"
              placeholder="Buscar por usuario o Discord ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-discord-input border border-discord-border/70 text-white placeholder-discord-text-muted text-xs focus:outline-none focus:border-discord-blurple"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-discord-border/50 text-discord-text-muted font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Usuario</th>
                <th className="pb-3 px-3">Discord ID</th>
                <th className="pb-3 px-3">Fecha Registro</th>
                <th className="pb-3 px-3">Rol Actual</th>
                <th className="pb-3 px-3 text-right">Asignar Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-discord-border/30">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-discord-secondary/50 transition-colors">
                  {/* User info */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          user.avatar_url ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`
                        }
                        alt={user.username}
                        className="w-8 h-8 rounded-full border border-discord-border object-cover"
                      />
                      <div>
                        <span className="font-bold text-white block">{user.username}</span>
                        {user.id === profile?.id && (
                          <span className="text-[10px] text-discord-blurple font-semibold">
                            (Tu cuenta)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Discord ID */}
                  <td className="py-3 px-3 font-mono text-discord-text-muted">
                    {user.discord_id || 'Sin vincular'}
                  </td>

                  {/* Registered date */}
                  <td className="py-3 px-3 text-discord-text-muted">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>

                  {/* Current Role badge */}
                  <td className="py-3 px-3">
                    <RoleBadge role={user.role} />
                  </td>

                  {/* Role select action */}
                  <td className="py-3 px-3 text-right">
                    <select
                      value={user.role}
                      disabled={updatingId === user.id}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as UserRole, user.username)
                      }
                      className="bg-discord-secondary hover:bg-discord-hover text-white text-xs rounded-lg px-2.5 py-1.5 border border-discord-border/80 outline-none focus:border-discord-blurple cursor-pointer disabled:opacity-50"
                    >
                      <option value="usuario">Jugador (Usuario)</option>
                      <option value="moderador">Moderador</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
