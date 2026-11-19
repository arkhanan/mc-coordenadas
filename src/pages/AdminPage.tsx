import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { useServerConfig } from '../context/ServerConfigContext';
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
  ShieldAlert,
  Save,
  Globe,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { profile, isAdmin, isSupabaseConnected } = useAuth();
  const { config, updateConfig } = useServerConfig();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Formulario de configuración de servidor
  const [formServerIp, setFormServerIp] = useState(config.server_ip);
  const [formServerName, setFormServerName] = useState(config.server_name);
  const [formServerVersion, setFormServerVersion] = useState(config.server_version);
  const [formMaintenance, setFormMaintenance] = useState(config.maintenance_mode);
  const [formMaintenanceMsg, setFormMaintenanceMsg] = useState(config.maintenance_message);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);

  // Sincronizar formulario si cambia la config externa
  useEffect(() => {
    setFormServerIp(config.server_ip);
    setFormServerName(config.server_name);
    setFormServerVersion(config.server_version);
    setFormMaintenance(config.maintenance_mode);
    setFormMaintenanceMsg(config.maintenance_message);
  }, [config]);

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
          Solo los administradores del servidor tienen permisos para gestionar la plataforma y los roles.
        </p>
      </div>
    );
  }

  const handleSaveServerConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingConfig(true);
      await updateConfig({
        server_ip: formServerIp.trim(),
        server_name: formServerName.trim(),
        server_version: formServerVersion.trim(),
        maintenance_mode: formMaintenance,
        maintenance_message: formMaintenanceMsg.trim(),
      });
      setConfigSuccess('¡Configuración del servidor y permisos de acceso guardados con éxito!');
      setTimeout(() => setConfigSuccess(null), 4000);
    } catch (err) {
      console.error('Error guardando configuración:', err);
      alert('Error al guardar la configuración.');
    } finally {
      setIsSavingConfig(false);
    }
  };

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
    (u.discord_id && u.discord_id.includes(searchTerm)) ||
    (u.minecraft_username && u.minecraft_username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-discord-border/50">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Settings className="text-rose-400" />
            <span>Administración General & Servidor</span>
          </h1>
          <p className="text-xs text-discord-text-muted mt-1">
            Gestión de servidor Minecraft, control de acceso de usuarios y asignación de rangos.
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

      {/* SECCIÓN NUEVA: CONTROL DE SERVIDOR & ACCESO (SOLO ADMINS) */}
      <div className="bg-discord-card border border-discord-border/70 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-discord-border/50">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Server size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Configuración del Servidor & Control de Acceso
              <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                Solo Administrador
              </span>
            </h2>
            <p className="text-xs text-discord-text-muted">
              Cambia la IP oficial del servidor y controla si los usuarios normales pueden entrar a la web.
            </p>
          </div>
        </div>

        {configSuccess && (
          <div className="p-3.5 mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{configSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSaveServerConfig} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* IP del Servidor */}
            <div>
              <label className="block text-xs font-bold text-discord-text-header mb-1.5 flex items-center gap-1.5">
                <Globe size={13} className="text-discord-blurple" />
                IP o Dominio del Servidor
              </label>
              <input
                type="text"
                required
                value={formServerIp}
                onChange={(e) => setFormServerIp(e.target.value)}
                placeholder="ej: play.miservidor.net o AleeBonett.aternos.me"
                className="w-full px-3 py-2 rounded-xl bg-discord-input border border-discord-border/80 text-white text-xs font-mono focus:outline-none focus:border-discord-blurple"
              />
              <p className="text-[10px] text-discord-text-muted mt-1">
                Aparecerá en el Navbar y Dashboard para todos los usuarios.
              </p>
            </div>

            {/* Nombre de la Comunidad */}
            <div>
              <label className="block text-xs font-bold text-discord-text-header mb-1.5">
                Nombre de la Comunidad
              </label>
              <input
                type="text"
                value={formServerName}
                onChange={(e) => setFormServerName(e.target.value)}
                placeholder="ej: MineCoords Community"
                className="w-full px-3 py-2 rounded-xl bg-discord-input border border-discord-border/80 text-white text-xs focus:outline-none focus:border-discord-blurple"
              />
            </div>

            {/* Versión de Minecraft */}
            <div>
              <label className="block text-xs font-bold text-discord-text-header mb-1.5">
                Versión de Minecraft
              </label>
              <input
                type="text"
                value={formServerVersion}
                onChange={(e) => setFormServerVersion(e.target.value)}
                placeholder="ej: 26.3 Survival o 1.21.4"
                className="w-full px-3 py-2 rounded-xl bg-discord-input border border-discord-border/80 text-white text-xs focus:outline-none focus:border-discord-blurple"
              />
            </div>
          </div>

          {/* Opción de Bloqueo / Mantenimiento de Usuarios */}
          <div className={`p-4 rounded-xl border transition-all ${
            formMaintenance
              ? 'bg-amber-500/10 border-amber-500/40'
              : 'bg-discord-secondary/30 border-discord-border/60'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg mt-0.5 ${
                  formMaintenance ? 'bg-amber-500/20 text-amber-400' : 'bg-discord-secondary text-discord-text-muted'
                }`}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Bloquear acceso a usuarios normales (Modo Mantenimiento / Privado)
                    {formMaintenance && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                        Bloqueo Activo
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-discord-text-muted mt-0.5">
                    Si está activado, los jugadores comunes no podrán ver ni usar la web. Solo Administradores y Moderadores tendrán acceso.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer self-start sm:self-center">
                <input
                  type="checkbox"
                  checked={formMaintenance}
                  onChange={(e) => setFormMaintenance(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-discord-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Mensaje de mantenimiento personalizado */}
            {formMaintenance && (
              <div className="mt-3 pt-3 border-t border-amber-500/20 animate-fade-in">
                <label className="block text-xs font-semibold text-amber-200 mb-1">
                  Mensaje visible para los usuarios bloqueados:
                </label>
                <input
                  type="text"
                  value={formMaintenanceMsg}
                  onChange={(e) => setFormMaintenanceMsg(e.target.value)}
                  placeholder="La plataforma está en mantenimiento temporal..."
                  className="w-full px-3 py-1.5 rounded-lg bg-discord-darkest border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingConfig}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-discord-blurple hover:bg-discord-blurple-hover disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-discord-blurple/25"
            >
              <Save size={15} />
              <span>{isSavingConfig ? 'Guardando cambios...' : 'Guardar Configuración del Servidor'}</span>
            </button>
          </div>
        </form>
      </div>

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
              : 'Modo demostración activo'}
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
            <span className="text-xs font-bold text-discord-text-muted uppercase">Servidor Actual</span>
            <Server size={16} className="text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-white font-mono">
            {config.server_ip}
          </p>
          <p className="text-[11px] text-discord-text-muted mt-1">
            {config.server_version} • {config.maintenance_mode ? '🔒 Privado (Solo Staff)' : 'Abierto a todos'}
          </p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-discord-card border border-discord-border/70 rounded-2xl p-6 shadow-xl space-y-4">
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
                <th className="pb-3 px-3">Usuario Discord</th>
                <th className="pb-3 px-3">Minecraft Vinculado</th>
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

                  {/* Minecraft Linked */}
                  <td className="py-3 px-3">
                    {user.minecraft_username ? (
                      <span className="inline-flex items-center gap-1 font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        🎮 {user.minecraft_username}
                      </span>
                    ) : (
                      <span className="text-discord-text-muted italic">No vinculado</span>
                    )}
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
