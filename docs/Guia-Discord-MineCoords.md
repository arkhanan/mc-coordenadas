# MineCoords en Discord
## Guía breve para el dueño del servidor

Esta guía describe únicamente la instalación y el uso de la aplicación en Discord.

### ¿Qué hace la aplicación?

MineCoords agrega comandos de coordenadas al menú de comandos slash de Discord. La versión de prueba incluye:

- `/coordenadas listar`: muestra coordenadas activas recientes.
- `/coordenadas agregar`: publica nombre, categoría, dimensión, X, Y y Z; la descripción es opcional.
- `/coordenadas archivar`: archiva una coordenada usando su ID. El autor puede archivar la suya; moderadores y administradores pueden archivar cualquiera.

Las respuestas de estos comandos son privadas para la persona que los ejecuta. Agregar coordenadas requiere que esa persona tenga su perfil de MineCoords vinculado con su cuenta de Discord.

### Permisos que solicita

La instalación se configura para comandos de aplicación (`applications.commands`). La aplicación no necesita permisos de administrador, gestionar mensajes, leer el historial del canal ni conectarse como un bot tradicional. Los miembros podrán usar los comandos en los canales donde Discord permita **Usar comandos de aplicaciones**.

### Qué debe hacer el dueño

1. Abrir el enlace de instalación de MCCoordenadas: `https://discord.com/oauth2/authorize?client_id=1572238890851373208&scope=applications.commands&integration_type=0`.
2. Iniciar sesión en la cuenta correcta de Discord.
3. Elegir el servidor y revisar que la aplicación solicite acceso a comandos de aplicación, sin permisos administrativos.
4. Confirmar **Continuar** y **Autorizar**. Para instalar aplicaciones en el servidor, Discord requiere permiso para administrarlo.
5. Verificar la instalación en **Ajustes del servidor → Integraciones → Bots y aplicaciones**.

### Paso que debe completar quien mantiene la aplicación

Los comandos actuales están registrados para el servidor de prueba. Después de que el dueño autorice MCCoordenadas, quien mantiene la aplicación debe registrar `/coordenadas` también para el nuevo servidor. Para eso necesita el ID del servidor, pero no el token del bot.

El dueño puede copiar el ID así:

1. Discord → **Ajustes de usuario → Avanzado → Modo de desarrollador**: activar.
2. Clic derecho sobre el nombre o icono del servidor → **Copiar ID del servidor**.
3. Enviar ese ID a quien mantiene MineCoords por un canal privado. No enviar tokens ni claves.

Una vez registrado el comando en ese servidor, se puede escribir `/coordenadas` en un canal de texto permitido. Si no aparece, verificar en **Ajustes del servidor → Integraciones → MCCoordenadas → Gestionar** que el comando esté habilitado para el miembro/canal, y que el canal permita **Usar comandos de aplicaciones**.

### Comprobar y quitar la aplicación

Para confirmar que está instalada, abrir **Ajustes del servidor → Integraciones → Bots y aplicaciones** y buscar **MCCoordenadas**. Desde esa misma sección se puede gestionar o quitar la aplicación.

El dueño puede rechazar la instalación o quitar la aplicación cuando quiera. La aplicación no necesita permisos de moderación del servidor para operar los comandos descritos aquí.

### Enlace de instalación

`https://discord.com/oauth2/authorize?client_id=1572238890851373208&scope=applications.commands&integration_type=0`

