-- ==============================================================================
-- SISTEMA DE BLOQUEO Y BANEO DE USUARIOS
-- ==============================================================================

-- 1. Agregar columnas para bloqueo en profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- 2. Permitir que los administradores puedan eliminar perfiles
DROP POLICY IF EXISTS "Admins pueden eliminar perfiles" ON public.profiles;
CREATE POLICY "Admins pueden eliminar perfiles"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- 3. Actualizar función RPC del mod para que impida que usuarios baneados envíen coordenadas
CREATE OR REPLACE FUNCTION public.crear_coordenada_desde_mod(
    p_nombre TEXT,
    p_descripcion TEXT,
    p_categoria TEXT,
    p_dimension TEXT,
    p_x NUMERIC,
    p_y NUMERIC,
    p_z NUMERIC,
    p_jugador TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_perfil RECORD;
    v_nueva_coord_id UUID;
BEGIN
    -- 1. Buscar si el jugador está vinculado
    SELECT id, username, is_banned, ban_reason INTO v_perfil
    FROM public.profiles 
    WHERE lower(minecraft_username) = lower(p_jugador) 
       OR lower(username) = lower(p_jugador)
    LIMIT 1;

    -- Si el usuario existe y está baneado, RECHAZAR la petición
    IF v_perfil.id IS NOT NULL AND v_perfil.is_banned THEN
        RETURN jsonb_build_object(
            'success', false,
            'mensaje', 'Tu cuenta está baneada: ' || coalesce(v_perfil.ban_reason, 'Acceso revocado por el administrador')
        );
    END IF;

    -- Validar dimensión y categoría
    IF p_dimension NOT IN ('Overworld', 'Nether', 'The End') THEN
        p_dimension := 'Overworld';
    END IF;

    IF p_categoria NOT IN ('Granja', 'Base', 'Portal', 'Comercio', 'Spawner', 'Minería', 'Redstone', 'Otros') THEN
        p_categoria := 'Otros';
    END IF;

    -- Si no existe perfil, buscar al admin
    IF v_perfil.id IS NULL THEN
        SELECT id, username, is_banned INTO v_perfil
        FROM public.profiles 
        WHERE role = 'administrador' 
        ORDER BY created_at ASC 
        LIMIT 1;
    END IF;

    IF v_perfil.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'mensaje', 'No hay usuarios en la plataforma.');
    END IF;

    INSERT INTO public.coordenadas (
        nombre, descripcion, categoria, dimension, x, y, z, usuario_id, estado
    ) VALUES (
        p_nombre, coalesce(p_descripcion, 'Publicado en Minecraft por ' || p_jugador),
        p_categoria, p_dimension, p_x, p_y, p_z, v_perfil.id, 'activa'
    )
    RETURNING id INTO v_nueva_coord_id;

    RETURN jsonb_build_object(
        'success', true,
        'id', v_nueva_coord_id,
        'discord_user', v_perfil.username,
        'mensaje', 'Coordenada registrada con éxito por ' || p_jugador
    );
END;
$$;
