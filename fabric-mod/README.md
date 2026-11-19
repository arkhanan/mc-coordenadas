# 🧭 MineCoords Client Mod (Fabric 26.3 / 1.21.x)

Mod de cliente para Minecraft que conecta el juego con la plataforma web **MineCoords** y la base de datos **Supabase**.

---

## ✨ Características

* **Tecla Rápida `K`**: Abre una interfaz gráfica donde estés parado sin pausar la partida.
* **Auto-detección**:
  * Captura automáticamente tus coordenadas exactas $(X, Y, Z)$.
  * Detecta si estás en el `Overworld`, `Nether` o `The End`.
  * Detecta tu nombre de usuario en Minecraft.
* **Comando en chat**: También puedes usar `/minecoords share <nombre>` o `/minecoords gui`.
* **Conexión directa con Supabase**: Se envía de forma asíncrona mediante HTTP REST sin tirones de lag ni caídas de FPS.
* **Notificaciones en el chat del juego**: Confirmación visual cuando tu coordenada ya está publicada en la web.

---

## ⚙️ Configuración Previa en Supabase

Para que el mod pueda registrar las coordenadas sin pedirle a cada jugador que inicie sesión en Discord dentro del juego:

1. Ve a tu panel de **Supabase** > **SQL Editor**.
2. Copia y ejecuta el contenido del archivo `supabase/mod_rpc_setup.sql`.
3. ¡Listo! La función `crear_coordenada_desde_mod` quedará habilitada para recibir envíos desde el mod.

---

## 🛠️ Cómo compilar el Mod

Requisitos:
* **Java 21 JDK** instalado.

En la terminal (dentro de esta carpeta `D:\ProyectoMC\fabric-mod`):

```bash
# En Windows:
gradlew build
```

El archivo compilado `.jar` quedará generado en:
`build/libs/minecoords-mod-1.0.0.jar`

---

## 🎮 Instalación en el Cliente de los Jugadores

1. Instalar **Fabric Loader** para la versión correspondiente (26.3 / 1.21.x).
2. Colocar el mod **Fabric API** en la carpeta `.minecraft/mods`.
3. Colocar el archivo `minecoords-mod-1.0.0.jar` en la carpeta `.minecraft/mods`.
4. ¡Abrir Minecraft, entrar al servidor `AleeBonett.aternos.me` y presionar la tecla **`K`**!
