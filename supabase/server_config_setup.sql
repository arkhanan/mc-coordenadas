-- ==============================================================================
-- TABLA DE CONFIGURACIÓN GENERAL DEL SERVIDOR
-- Permite cambiar la IP del servidor y activar Modo Mantenimiento desde la web
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.configuracion_general (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    server_ip TEXT NOT NULL DEFAULT 'play.minecraft-comunidad.net',
    server_name TEXT NOT NULL DEFAULT 'Servidor Comunitario Minecraft',
    server_version TEXT NOT NULL DEFAULT '26.3 Survival',
    maintenance_mode BOOLEAN NOT NULL DEFAULT false,
    maintenance_message TEXT DEFAULT 'La plataforma se encuentra en mantenimiento temporal. Solo el equipo de Staff tiene acceso.',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insertar configuración inicial si no existe
INSERT INTO public.configuracion_general (id, server_ip, server_name, server_version, maintenance_mode)
VALUES (1, 'play.minecraft-comunidad.net', 'Servidor Comunitario Minecraft', '26.3 Survival', false)
ON CONFLICT (id) DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.configuracion_general ENABLE ROW LEVEL SECURITY;

-- 1. Cualquier usuario (autenticado o anónimo) puede leer la IP y estado de mantenimiento
DROP POLICY IF EXISTS "Lectura publica de configuracion" ON public.configuracion_general;
CREATE POLICY "Lectura publica de configuracion"
    ON public.configuracion_general FOR SELECT
    TO anon, authenticated
    USING (true);

-- 2. Solo los administradores pueden modificar la configuración o activar mantenimiento
DROP POLICY IF EXISTS "Solo admins pueden actualizar configuracion" ON public.configuracion_general;
CREATE POLICY "Solo admins pueden actualizar configuracion"
    ON public.configuracion_general FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Solo admins pueden insertar configuracion" ON public.configuracion_general;
CREATE POLICY "Solo admins pueden insertar configuracion"
    ON public.configuracion_general FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));
