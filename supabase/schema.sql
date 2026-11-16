-- ==============================================================================
-- PROYECTO: MineCoords & Projects - Plataforma Comunitaria Minecraft
-- STACK: Supabase (PostgreSQL) + Discord OAuth + RLS Security
-- ==============================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Limpieza previa (opcional si se reinicia)
-- DROP TABLE IF EXISTS reportes_coordenadas CASCADE;
-- DROP TABLE IF EXISTS coordenadas CASCADE;
-- DROP TABLE IF EXISTS proyectos CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ==============================================================================
-- TABLA: PROFILES
-- Sincronizada con auth.users mediante Discord OAuth
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    discord_id TEXT UNIQUE,
    username TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'usuario' CHECK (role IN ('usuario', 'moderador', 'administrador')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- TABLA: COORDENADAS
-- Visibles inmediatamente, no requieren aprobación previa. Pueden ser reportadas.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.coordenadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT NOT NULL CHECK (categoria IN (
        'Granja', 'Base', 'Portal', 'Comercio', 'Spawner', 'Minería', 'Redstone', 'Otros'
    )),
    dimension TEXT NOT NULL CHECK (dimension IN ('Overworld', 'Nether', 'The End')),
    x NUMERIC NOT NULL,
    y NUMERIC NOT NULL,
    z NUMERIC NOT NULL,
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'reportada', 'archivada')),
    fecha TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- TABLA: REPORTES_COORDENADAS
-- Reportes de jugadores sobre coordenadas incorrectas, grieffeadas o erróneas.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reportes_coordenadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coordenada_id UUID NOT NULL REFERENCES public.coordenadas(id) ON DELETE CASCADE,
    reportado_por UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    motivo TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'resuelto', 'descartado')),
    revisado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolucion TEXT,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    fecha_resolucion TIMESTAMPTZ
);

-- ==============================================================================
-- TABLA: PROYECTOS
-- Requieren validación: propuesto -> revisado por moderador -> aprobado/rechazado.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.proyectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN (
        'Granja', 'Mega Construcción', 'Infraestructura', 'Minijuego', 'Comunidad', 'Decoración', 'Redstone', 'Otros'
    )),
    responsable_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ubicacion TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'propuesto' CHECK (estado IN (
        'propuesto', 'aprobado', 'en_construccion', 'finalizado', 'rechazado', 'cancelado'
    )),
    motivo_rechazo TEXT,
    aprobado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    fecha_aprobacion TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- FUNCIONES AUXILIARES DE SEGURIDAD (SECURITY DEFINER)
-- Evitan recursión infinita en las políticas RLS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'administrador'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_moderator_or_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role IN ('moderador', 'administrador')
    );
$$;

-- ==============================================================================
-- TRIGGERS DE SINCRONIZACIÓN Y AUTOMATIZACIÓN
-- ==============================================================================

-- 1. Disparador para crear el perfil automáticamente cuando un usuario se autentica con Discord
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    discord_uid TEXT;
    user_name TEXT;
    avatar TEXT;
    initial_role TEXT := 'usuario';
    user_count INT;
BEGIN
    -- Extraer metadatos de Discord proporcionados por Supabase Auth
    discord_uid := coalesce(
        new.raw_user_meta_data->>'provider_id',
        new.raw_user_meta_data->>'sub',
        new.id::text
    );
    
    user_name := coalesce(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'user_name',
        new.raw_user_meta_data->>'preferred_username',
        'Jugador_' || substring(new.id::text from 1 for 6)
    );
    
    avatar := coalesce(
        new.raw_user_meta_data->>'avatar_url',
        new.raw_user_meta_data->>'picture'
    );

    -- Si es el primer usuario registrado en la base de datos, asignarle rol 'administrador'
    SELECT count(*) INTO user_count FROM public.profiles;
    IF user_count = 0 THEN
        initial_role := 'administrador';
    END IF;

    INSERT INTO public.profiles (id, discord_id, username, avatar_url, role)
    VALUES (new.id, discord_uid, user_name, avatar, initial_role)
    ON CONFLICT (id) DO UPDATE
    SET username = EXCLUDED.username,
        avatar_url = coalesce(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = timezone('utc'::text, now());

    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE OF raw_user_meta_data ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Disparador para marcar automáticamente la coordenada como 'reportada' al recibir un reporte
CREATE OR REPLACE FUNCTION public.handle_new_coordinate_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.coordenadas
    SET estado = 'reportada',
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.coordenada_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_coordinate_report_created ON public.reportes_coordenadas;
CREATE TRIGGER on_coordinate_report_created
    AFTER INSERT ON public.reportes_coordenadas
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_coordinate_report();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordenadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes_coordenadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- POLÍTICAS: PROFILES
-- ------------------------------------------------------------------------------
-- Todos los usuarios autenticados pueden ver los perfiles (para ver creadores de coords y proyectos)
CREATE POLICY "Perfiles visibles para usuarios autenticados"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- Los usuarios pueden actualizar su propio nombre o avatar, pero NO su rol
CREATE POLICY "Usuarios pueden actualizar su propio perfil excepto rol"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    );

-- Solo los administradores pueden cambiar roles de usuarios
CREATE POLICY "Admins pueden actualizar cualquier perfil y roles"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- POLÍTICAS: COORDENADAS
-- Las coordenadas NO requieren aprobación. Visibles inmediatamente.
-- ------------------------------------------------------------------------------
-- Lectura:
-- - Coordenadas activas y reportadas son públicas para todos los autenticados
-- - Coordenadas archivadas solo las ve el dueño o mods/admins
CREATE POLICY "Lectura de coordenadas"
    ON public.coordenadas FOR SELECT
    TO authenticated
    USING (
        estado IN ('activa', 'reportada') OR
        usuario_id = auth.uid() OR
        public.is_moderator_or_admin(auth.uid())
    );

-- Creación: cualquier usuario autenticado puede publicar una coordenada
CREATE POLICY "Usuarios autenticados pueden crear coordenadas"
    ON public.coordenadas FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = usuario_id);

-- Modificación:
-- - El dueño puede editar su coordenada
-- - Moderadores y administradores pueden corregirla o cambiar su estado
CREATE POLICY "Dueño o Staff pueden actualizar coordenadas"
    ON public.coordenadas FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = usuario_id OR
        public.is_moderator_or_admin(auth.uid())
    )
    WITH CHECK (
        auth.uid() = usuario_id OR
        public.is_moderator_or_admin(auth.uid())
    );

-- Eliminación:
-- - El dueño puede eliminar su propia coordenada
-- - Moderadores y administradores pueden eliminar coordenadas
CREATE POLICY "Dueño o Staff pueden eliminar coordenadas"
    ON public.coordenadas FOR DELETE
    TO authenticated
    USING (
        auth.uid() = usuario_id OR
        public.is_moderator_or_admin(auth.uid())
    );

-- ------------------------------------------------------------------------------
-- POLÍTICAS: REPORTES_COORDENADAS
-- ------------------------------------------------------------------------------
-- Creación: cualquier usuario autenticado puede reportar una coordenada
CREATE POLICY "Usuarios pueden reportar coordenadas"
    ON public.reportes_coordenadas FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reportado_por);

-- Lectura:
-- - El que reportó puede ver su reporte
-- - Moderadores y administradores pueden ver todos los reportes
CREATE POLICY "Staff y creador del reporte pueden leer reportes"
    ON public.reportes_coordenadas FOR SELECT
    TO authenticated
    USING (
        auth.uid() = reportado_por OR
        public.is_moderator_or_admin(auth.uid())
    );

-- Modificación:
-- - Solo moderadores y administradores pueden gestionar/resolver reportes
CREATE POLICY "Staff puede gestionar reportes"
    ON public.reportes_coordenadas FOR UPDATE
    TO authenticated
    USING (public.is_moderator_or_admin(auth.uid()))
    WITH CHECK (public.is_moderator_or_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- POLÍTICAS: PROYECTOS
-- Requieren validación de moderación
-- ------------------------------------------------------------------------------
-- Lectura:
-- - Proyectos aprobados, en construcción o finalizados son visibles para todos
-- - Proyectos en estado 'propuesto', 'rechazado' o 'cancelado' solo los ve el dueño o Staff
CREATE POLICY "Lectura de proyectos"
    ON public.proyectos FOR SELECT
    TO authenticated
    USING (
        estado IN ('aprobado', 'en_construccion', 'finalizado') OR
        responsable_id = auth.uid() OR
        public.is_moderator_or_admin(auth.uid())
    );

-- Creación:
-- - Cualquier usuario autenticado puede proponer un proyecto (inicia con estado 'propuesto')
CREATE POLICY "Usuarios autenticados pueden proponer proyectos"
    ON public.proyectos FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = responsable_id AND
        estado = 'propuesto'
    );

-- Modificación:
-- - El creador puede editar detalles de su proyecto si es el dueño
-- - Moderadores y Administradores pueden aprobar, rechazar o cambiar estado
CREATE POLICY "Dueño o Staff pueden actualizar proyectos"
    ON public.proyectos FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = responsable_id OR
        public.is_moderator_or_admin(auth.uid())
    )
    WITH CHECK (
        -- Si es un usuario normal (no staff), no puede cambiarse a sí mismo el estado a 'aprobado'
        (auth.uid() = responsable_id AND (
            public.is_moderator_or_admin(auth.uid()) OR 
            estado IN ('propuesto', 'en_construccion', 'finalizado', 'cancelado')
        )) OR
        public.is_moderator_or_admin(auth.uid())
    );

-- Eliminación:
-- - El creador puede eliminar su proyecto o el Staff
CREATE POLICY "Dueño o Staff pueden eliminar proyectos"
    ON public.proyectos FOR DELETE
    TO authenticated
    USING (
        auth.uid() = responsable_id OR
        public.is_moderator_or_admin(auth.uid())
    );

-- ==============================================================================
-- DATOS SEMILLA (OPCIONALES PARA DESARROLLO / PRUEBAS)
-- ==============================================================================
COMMENT ON TABLE public.profiles IS 'Perfiles de usuarios vinculados a Discord Auth';
COMMENT ON TABLE public.coordenadas IS 'Coordenadas del servidor de Minecraft';
COMMENT ON TABLE public.reportes_coordenadas IS 'Reportes generados por la comunidad sobre coordenadas';
COMMENT ON TABLE public.proyectos IS 'Proyectos comunitarios con flujo de aprobación';
