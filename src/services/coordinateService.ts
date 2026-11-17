import { Coordinate, CoordinateCategory, CoordinateReport, Dimension, ReportStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { discordWebhookService } from './discordWebhookService';
import {
  getStoredCoordinates,
  saveStoredCoordinates,
  getStoredReports,
  saveStoredReports,
  getStoredProfiles,
} from '../lib/mockData';

export const coordinateService = {
  async getAll(): Promise<Coordinate[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('coordenadas')
        .select(`
          *,
          usuario:profiles(*)
        `)
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error fetching coordinates from Supabase:', error);
        throw error;
      }
      return data || [];
    }

    // Fallback Mock data
    return getStoredCoordinates();
  },

  async create(coordinate: {
    nombre: string;
    descripcion?: string;
    categoria: CoordinateCategory;
    dimension: Dimension;
    x: number;
    y: number;
    z: number;
    usuario_id: string;
  }): Promise<Coordinate> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('coordenadas')
        .insert({
          ...coordinate,
          estado: 'activa',
          fecha: new Date().toISOString(),
        })
        .select(`
          *,
          usuario:profiles(*)
        `)
        .single();

      if (error) {
        console.error('Error creating coordinate:', error);
        throw error;
      }

      // Notificar a Discord
      discordWebhookService.notifyNewCoordinate({
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoria: data.categoria,
        dimension: data.dimension,
        x: data.x,
        y: data.y,
        z: data.z,
        autor: data.usuario?.username || 'Un jugador',
      });

      return data;
    }

    // Mock implementation
    const coords = getStoredCoordinates();
    const profiles = getStoredProfiles();
    const userProfile = profiles.find((p) => p.id === coordinate.usuario_id);

    const newCoord: Coordinate = {
      id: 'c-' + Date.now(),
      nombre: coordinate.nombre,
      descripcion: coordinate.descripcion || null,
      categoria: coordinate.categoria,
      dimension: coordinate.dimension,
      x: Number(coordinate.x),
      y: Number(coordinate.y),
      z: Number(coordinate.z),
      usuario_id: coordinate.usuario_id,
      estado: 'activa',
      fecha: new Date().toISOString(),
      usuario: userProfile,
    };

    const updated = [newCoord, ...coords];
    saveStoredCoordinates(updated);

    // Notificar a Discord (Modo local/demo)
    discordWebhookService.notifyNewCoordinate({
      nombre: newCoord.nombre,
      descripcion: newCoord.descripcion,
      categoria: newCoord.categoria,
      dimension: newCoord.dimension,
      x: newCoord.x,
      y: newCoord.y,
      z: newCoord.z,
      autor: userProfile?.username || 'Un jugador',
    });

    return newCoord;
  },

  async update(id: string, updates: Partial<Coordinate>): Promise<Coordinate> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('coordenadas')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          usuario:profiles(*)
        `)
        .single();

      if (error) throw error;
      return data;
    }

    const coords = getStoredCoordinates();
    const index = coords.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Coordenada no encontrada');

    const updatedCoord = {
      ...coords[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    coords[index] = updatedCoord;
    saveStoredCoordinates(coords);
    return updatedCoord;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('coordenadas').delete().eq('id', id);
      if (error) throw error;
      return;
    }

    const coords = getStoredCoordinates();
    saveStoredCoordinates(coords.filter((c) => c.id !== id));
  },

  async report(coordenada_id: string, reportado_por: string, motivo: string): Promise<CoordinateReport> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reportes_coordenadas')
        .insert({
          coordenada_id,
          reportado_por,
          motivo,
          estado: 'pendiente',
        })
        .select(`
          *,
          coordenada:coordenadas(*),
          reportador:profiles!reportado_por(*)
        `)
        .single();

      if (error) throw error;
      return data;
    }

    // Mock report
    const reports = getStoredReports();
    const coords = getStoredCoordinates();
    const profiles = getStoredProfiles();

    const targetCoord = coords.find((c) => c.id === coordenada_id);
    const reporter = profiles.find((p) => p.id === reportado_por);

    if (targetCoord) {
      targetCoord.estado = 'reportada';
      saveStoredCoordinates([...coords]);
    }

    const newReport: CoordinateReport = {
      id: 'r-' + Date.now(),
      coordenada_id,
      reportado_por,
      motivo,
      estado: 'pendiente',
      fecha_creacion: new Date().toISOString(),
      coordenada: targetCoord,
      reportador: reporter,
    };

    saveStoredReports([newReport, ...reports]);
    return newReport;
  },

  async getReports(): Promise<CoordinateReport[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reportes_coordenadas')
        .select(`
          *,
          coordenada:coordenadas(*),
          reportador:profiles!reportado_por(*),
          revisor:profiles!revisado_por(*)
        `)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    return getStoredReports();
  },

  // Cuenta los reportes pendientes sin descargar datos (ligero, para badges)
  async countPendingReports(): Promise<number> {
    if (isSupabaseConfigured) {
      const { count, error } = await supabase
        .from('reportes_coordenadas')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente');

      if (error) throw error;
      return count ?? 0;
    }

    return getStoredReports().filter((r) => r.estado === 'pendiente').length;
  },

  async resolveReport(
    reportId: string,
    revisado_por: string,
    estado: ReportStatus,
    resolucion: string,
    archiveCoordinate = false
  ): Promise<void> {
    if (isSupabaseConfigured) {
      const { data: report, error: repError } = await supabase
        .from('reportes_coordenadas')
        .update({
          estado,
          revisado_por,
          resolucion,
          fecha_resolucion: new Date().toISOString(),
        })
        .eq('id', reportId)
        .select()
        .single();

      if (repError) throw repError;

      if (archiveCoordinate && report) {
        await supabase
          .from('coordenadas')
          .update({ estado: 'archivada' })
          .eq('id', report.coordenada_id);
      } else if (estado === 'descartado' && report) {
        await supabase
          .from('coordenadas')
          .update({ estado: 'activa' })
          .eq('id', report.coordenada_id);
      }
      return;
    }

    // Mock resolve
    const reports = getStoredReports();
    const coords = getStoredCoordinates();
    const profiles = getStoredProfiles();
    const reviewer = profiles.find((p) => p.id === revisado_por);

    const reportIndex = reports.findIndex((r) => r.id === reportId);
    if (reportIndex !== -1) {
      const rep = reports[reportIndex];
      rep.estado = estado;
      rep.revisado_por = revisado_por;
      rep.resolucion = resolucion;
      rep.revisor = reviewer;
      rep.fecha_resolucion = new Date().toISOString();

      const coord = coords.find((c) => c.id === rep.coordenada_id);
      if (coord) {
        coord.estado = archiveCoordinate ? 'archivada' : 'activa';
        saveStoredCoordinates(coords);
      }

      saveStoredReports(reports);
    }
  },
};