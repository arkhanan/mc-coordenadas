-- ==============================================================================
-- SISTEMA DE VINCULACIÓN DISCORD <-> MINECRAFT & MOD RPC
-- Ejecuta este script en Supabase > SQL Editor
-- ==============================================================================

-- 1. Agregar columnas para vinculación de Minecraft en la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS minecraft_username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS link_code TEXT,
ADD COLUMN IF NOT EXISTS link_code_expires_at TIMESTAMPTZ;

-- 2. Función llamada desde la Web para generar código temporal (ej: MC-8492)
CREATE OR REPLACE FUNCTION public.generar_codigo_vinculacion_minecraft()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión con Discord en la web para vincular';
    END IF;

    -- Generar código aleatorio de 4 caracteres alfanuméricos
    v_code := 'MC-' || upper(substring(md5(random()::text) from 1 for 4));

    UPDATE public.profiles
    SET link_code = v_code,
        link_code_expires_at = timezone('utc'::text, now()) + interval '15 minutes',
        updated_at = timezone('utc'::text, now())
    WHERE id = auth.uid();

    RETURN v_code;
END;
$$;

-- 3. Función llamada desde el Mod de Minecraft (/minecoords link MC-XXXX)
CREATE OR REPLACE FUNCTION public.vincular_cuenta_minecraft(
    p_codigo TEXT,
    p_jugador TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_perfil RECORD;
BEGIN
    -- Limpiar espacios y pasar a mayúsculas
    p_codigo := upper(trim(p_codigo));

    -- Buscar perfil con el código no expirado
    SELECT id, username, role INTO v_perfil
    FROM public.profiles
    WHERE link_code = p_codigo
      AND link_code_expires_at > timezone('utc'::text, now())
    LIMIT 1;

    IF v_perfil.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'mensaje', 'Código inválido o expirado. Genera uno nuevo en la web de MineCoords.'
        );
    END IF;

    -- Si este jugador ya estaba vinculado a otra cuenta, desvincularla primero
    UPDATE public.profiles
    SET minecraft_username = NULL
    WHERE lower(minecraft_username) = lower(p_jugador);

    -- Vincular este usuario al perfil actual
    UPDATE public.profiles
    SET minecraft_username = p_jugador,
        link_code = NULL,
        link_code_expires_at = NULL,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_perfil.id;

    RETURN jsonb_build_object(
        'success', true,
        'discord_username', v_perfil.username,
        'role', v_perfil.role,
        'mensaje', '¡Cuenta vinculada con éxito a ' || v_perfil.username || ' (' || v_perfil.role || ')!'
    );
END;
$$;

-- 4. Función para que el Mod de Minecraft publique coordenadas
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
    v_perfil_id UUID;
    v_discord_user TEXT;
    v_nueva_coord_id UUID;
BEGIN
    -- Validar dimensión
    IF p_dimension NOT IN ('Overworld', 'Nether', 'The End') THEN
        p_dimension := 'Overworld';
    END IF;

    -- Validar categoría
    IF p_categoria NOT IN ('Granja', 'Base', 'Portal', 'Comercio', 'Spawner', 'Minería', 'Redstone', 'Otros') THEN
        p_categoria := 'Otros';
    END IF;

    -- 1. Prioridad: Buscar usuario vinculado por su nombre de Minecraft
    SELECT id, username INTO v_perfil_id, v_discord_user
    FROM public.profiles 
    WHERE lower(minecraft_username) = lower(p_jugador) 
    LIMIT 1;

    -- 2. Si no tiene cuenta vinculada por código, buscar por coincidencia exacta de username
    IF v_perfil_id IS NULL THEN
        SELECT id, username INTO v_perfil_id, v_discord_user
        FROM public.profiles 
        WHERE lower(username) = lower(p_jugador) 
        LIMIT 1;
    END IF;

    -- 3. Si aún no existe, vincular al admin del servidor
    IF v_perfil_id IS NULL THEN
        SELECT id, username INTO v_perfil_id, v_discord_user
        FROM public.profiles 
        WHERE role = 'administrador' 
        ORDER BY created_at ASC 
        LIMIT 1;

        IF v_perfil_id IS NULL THEN
            SELECT id, username INTO v_perfil_id, v_discord_user FROM public.profiles LIMIT 1;
        END IF;
    END IF;

    IF v_perfil_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'mensaje', 'No hay usuarios registrados en la web. Inicia sesión en la web primero.'
        );
    END IF;

    -- Insertar la coordenada asociada al perfil oficial de Discord
    INSERT INTO public.coordenadas (
        nombre,
        descripcion,
        categoria,
        dimension,
        x,
        y,
        z,
        usuario_id,
        estado
    ) VALUES (
        p_nombre,
        coalesce(p_descripcion, 'Publicado en Minecraft por ' || p_jugador),
        p_categoria,
        p_dimension,
        p_x,
        p_y,
        p_z,
        v_perfil_id,
        'activa'
    )
    RETURNING id INTO v_nueva_coord_id;

    RETURN jsonb_build_object(
        'success', true,
        'id', v_nueva_coord_id,
        'discord_user', v_discord_user,
        'mensaje', 'Coordenada registrada en MineCoords por ' || p_jugador || ' (Discord: ' || coalesce(v_discord_user, 'Comunidad') || ')'
    );
END;
$$;

-- Permisos de ejecución
GRANT EXECUTE ON FUNCTION public.generar_codigo_vinculacion_minecraft TO authenticated;
GRANT EXECUTE ON FUNCTION public.vincular_cuenta_minecraft TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crear_coordenada_desde_mod TO anon, authenticated;
