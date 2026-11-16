# 🧭 MineCoords & Projects - Plataforma Comunitaria de Minecraft

Plataforma web de nivel producción diseñada para comunidades y servidores de Minecraft (Survival, Técnico y RPG). Permite gestionar coordenadas de interés (granjas, bases, portales, spawners) con publicación inmediata y sistema de reportes, además de un flujo completo de propuestas y validación de mega proyectos comunitarios mediante moderación activa.

Inspirada visualmente en el tema oscuro de **Discord** (`#1e1f22`, `#313338`, `#5865F2`) y respaldada por **Supabase (PostgreSQL)** con **Row Level Security (RLS)** y autenticación OAuth con Discord.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TypeScript | Arquitectura de componentes tipada y reactiva |
| **Bundler** | Vite 6 | Compilación ultrarrápida y optimización de chunks |
| **Estilos** | TailwindCSS | Sistema de diseño Discord Dark y paleta Minecraft |
| **Iconografía** | Lucide React | Iconos SVG optimizados y accesibles |
| **Backend / DB** | Supabase (PostgreSQL 15+) | Almacenamiento relacional, Triggers y Políticas RLS |
| **Autenticación** | Discord OAuth v10 (Supabase Auth) | Single Sign-On con perfiles de Discord sincronizados |
| **Hosting** | GitHub Pages + GitHub Actions | Despliegue estático automatizado con cero costes |

---

## 📁 Estructura del Proyecto

```text
D:\ProyectoMC\
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD automatizado para GitHub Pages
├── public/
│   └── 404.html                  # Fallback SPA para rutas en GitHub Pages
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.tsx         # Badges para Dimensiones, Roles y Estados
│   │   │   ├── CoordinateCopyButton.tsx # Copiado de comandos /tp y /execute
│   │   │   └── Modal.tsx         # Diálogo modal accesible estilo Discord
│   │   └── layout/
│   │       ├── Layout.tsx        # Shell principal de la aplicación
│   │       ├── Navbar.tsx        # Barra superior con IP, estado y perfil
│   │       └── Sidebar.tsx       # Navegación lateral estilo canales de Discord
│   ├── context/
│   │   └── AuthContext.tsx       # Estado global de sesión, roles y switcher demo
│   ├── lib/
│   │   ├── mockData.ts           # Mock persistente para previsualización inmediata
│   │   └── supabase.ts           # Cliente Supabase con detección de entorno
│   ├── pages/
│   │   ├── AdminPage.tsx         # Gestión de miembros, roles y configuración
│   │   ├── CoordinatesPage.tsx   # Exploración, filtros y reportes de coordenadas
│   │   ├── CreateCoordinatePage.tsx # Publicación y calculadora Nether 8:1
│   │   ├── CreateProjectPage.tsx # Propuesta de proyectos para validación
│   │   ├── DashboardPage.tsx     # Métricas del servidor, atajos y resumen
│   │   ├── LoginPage.tsx         # Autenticación con Discord OAuth y acceso demo
│   │   ├── ModerationPage.tsx    # Aprobación de proyectos y resolución de reportes
│   │   └── ProjectsPage.tsx      # Listado de proyectos por estado y progreso
│   ├── services/
│   │   ├── adminService.ts       # Operaciones de administración y métricas
│   │   ├── coordinateService.ts  # CRUD de coordenadas y gestión de reportes
│   │   └── projectService.ts     # CRUD de proyectos y aprobaciones
│   ├── types/
│   │   └── index.ts              # Definiciones TypeScript de datos y roles
│   ├── App.tsx                   # Enrutamiento con HashRouter
│   ├── index.css                 # Directivas Tailwind y estilos de scrollbar
│   ├── main.tsx                  # Punto de entrada de React
│   └── vite-env.d.ts             # Tipado para variables de entorno de Vite
├── supabase/
│   └── schema.sql                # Script SQL completo (Tablas, Triggers, RLS)
├── .env.example                  # Plantilla de variables de entorno
├── index.html                    # Documento HTML principal con fuentes
├── package.json                  # Dependencias y scripts
├── postcss.config.js             # Configuración PostCSS
├── tailwind.config.js            # Configuración tema Discord y colores Minecraft
├── tsconfig.json                 # Configuración del compilador TypeScript
└── vite.config.ts                # Configuración de empaquetado para GitHub Pages
```

---

## ⚡ Guía de Instalación y Desarrollo Local

### 1. Clonar o acceder al directorio
```bash
cd D:\ProyectoMC
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno (Opcional para desarrollo)
Copia el archivo `.env.example` a `.env`:
```bash
copy .env.example .env
```
> **Nota:** La aplicación cuenta con un **Modo Demo integrado**. Si no configuras Supabase inicialmente, la plataforma iniciará automáticamente en modo de demostración con almacenamiento local persistente (`localStorage`). Podrás alternar entre los roles de **Administrador**, **Moderador** y **Usuario** directamente desde la barra superior para evaluar todas las funcionalidades.

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre tu navegador en `http://localhost:5173`.

### 5. Compilar para producción
```bash
npm run build
```
Generará los archivos optimizados en la carpeta `dist/`.

---

## 🗄️ Configuración de Supabase (Base de Datos & SQL)

### Paso 1: Crear el proyecto en Supabase
1. Ingresa a [supabase.com](https://supabase.com) e inicia sesión.
2. Crea un nuevo proyecto (ej. `minecraft-comunidad`).
3. Define una contraseña segura para tu base de datos PostgreSQL.

### Paso 2: Ejecutar el Esquema SQL
1. En el panel lateral de Supabase, navega a **SQL Editor**.
2. Haz clic en **New query**.
3. Abre el archivo `D:\ProyectoMC\supabase\schema.sql`, copia todo su contenido y pégalo en el editor.
4. Presiona **Run** (Ctrl + Enter).

Este script crea automáticamente:
* ✅ Tabla `profiles`: Sincronizada con los usuarios de Discord. Asigna automáticamente el rol de `administrador` al primer usuario registrado.
* ✅ Tabla `coordenadas`: Con validaciones de dimensión (`Overworld`, `Nether`, `The End`) y categorías (`Granja`, `Base`, `Portal`, `Comercio`, `Spawner`, `Minería`, `Redstone`, `Otros`).
* ✅ Tabla `reportes_coordenadas`: Vinculada a coordenadas con estados `pendiente`, `resuelto` y `descartado`.
* ✅ Tabla `proyectos`: Con ciclo de estados (`propuesto`, `aprobado`, `en_construccion`, `finalizado`, `rechazado`, `cancelado`).
* ✅ Funciones de seguridad `SECURITY DEFINER` (`is_admin`, `is_moderator_or_admin`) para evitar recursión en RLS.
* ✅ Triggers automáticos:
  - `handle_new_user`: Crea el perfil a partir de los metadatos de Discord.
  - `handle_new_coordinate_report`: Pasa automáticamente la coordenada a estado `reportada` al crearse un reporte.
* ✅ Políticas completas de **Row Level Security (RLS)** que protegen cada tabla.

### Paso 3: Obtener las claves de la API
1. En Supabase, ve a **Project Settings** > **API**.
2. Copia la **Project URL** (`https://xxxxxxxx.supabase.co`).
3. Copia la clave **anon public**.
4. Pégalas en tu archivo `.env`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

---

## 🔑 Configuración de Discord OAuth

### Paso 1: Crear la aplicación en Discord Developer Portal
1. Ve al [Discord Developer Portal](https://discord.com/developers/applications).
2. Haz clic en **New Application** y nómbrala (ej. `MineCoords Community`).
3. En el menú izquierdo, entra en **OAuth2** > **General**.
4. Copia tu **Client ID**.
5. En la sección **Client Secret**, genera un nuevo secreto y cópialo.

### Paso 2: Configurar la URL de Redirección (Redirect URI)
1. En tu panel de Supabase, ve a **Authentication** > **Providers** > **Discord**.
2. Copia la **Callback URL (for OAuth)** que muestra Supabase (tiene la forma `https://<ID-DE-TU-PROYECTO>.supabase.co/auth/v1/callback`).
3. Regresa al Discord Developer Portal en **OAuth2** > **Redirects**.
4. Haz clic en **Add Redirect** y pega la URL de callback de Supabase.
5. Guarda los cambios (**Save Changes**).

### Paso 3: Activar Discord en Supabase
1. En Supabase > **Authentication** > **Providers** > **Discord**:
   - Activa el interruptor **Enable Discord**.
   - Pega el **Client ID** de Discord.
   - Pega el **Client Secret** de Discord.
   - Haz clic en **Save**.
2. En Supabase > **Authentication** > **URL Configuration**:
   - En **Site URL**, coloca la URL donde estará alojada tu web (por ejemplo: `https://tu-usuario.github.io/ProyectoMC/` o `http://localhost:5173/`).
   - En **Redirect URLs**, añade tu URL de GitHub Pages con un comodín: `https://tu-usuario.github.io/**`.

---

## 🚀 Despliegue en GitHub Pages

Este proyecto utiliza **HashRouter** (`/#/coordenadas`) y rutas relativas (`base: './'`), lo que garantiza compatibilidad al 100% con GitHub Pages sin errores de pantalla en blanco ni errores 404 al recargar páginas.

### Opción A: Despliegue Automático con GitHub Actions (Recomendado)

1. Crea un nuevo repositorio en GitHub (público o privado).
2. Vincula tu proyecto local y sube los cambios:
```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git add .
git commit -m "feat: plataforma comunitaria minecraft inicial"
git push -u origin main
```
3. En GitHub, entra a tu repositorio y ve a **Settings** > **Secrets and variables** > **Actions**.
4. Añade los siguientes **Repository Secrets**:
   - `VITE_SUPABASE_URL`: La URL de tu proyecto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: La clave anónima de tu proyecto Supabase.
   - `VITE_MC_SERVER_IP`: La IP de tu servidor de Minecraft (ej. `mc.tudominio.com`).
5. Ve a **Settings** > **Pages**:
   - En **Build and deployment** > **Source**, selecciona **GitHub Actions**.
6. ¡Listo! Cada vez que hagas `git push origin main`, el workflow `.github/workflows/deploy.yml` compilará y desplegará la web automáticamente en `https://TU_USUARIO.github.io/TU_REPOSITORIO/`.

---

### Opción B: Despliegue Manual con el script `deploy`

Si prefieres desplegar directamente desde tu terminal local:
1. En tu archivo `package.json`, ya está incluido el script `"deploy": "gh-pages -d dist"`.
2. Asegúrate de compilar primero:
```bash
npm run build
npm run deploy
```
3. En GitHub > **Settings** > **Pages**, verifica que el origen esté configurado en la rama `gh-pages`.

---

## 🛡️ Matriz de Roles y Permisos (Row Level Security)

| Acción | Usuario | Moderador | Administrador |
| :--- | :---: | :---: | :---: |
| **Iniciar sesión con Discord** | ✅ | ✅ | ✅ |
| **Publicar Coordenada (inmediata)** | ✅ | ✅ | ✅ |
| **Copiar comando /tp y /execute** | ✅ | ✅ | ✅ |
| **Reportar Coordenada** | ✅ | ✅ | ✅ |
| **Editar/Eliminar sus propias coordenadas** | ✅ | ✅ | ✅ |
| **Modificar/Archivar coordenadas reportadas** | ❌ | ✅ | ✅ |
| **Proponer Proyecto (estado: `propuesto`)** | ✅ | ✅ | ✅ |
| **Editar su propio proyecto** | ✅ | ✅ | ✅ |
| **Aprobar / Rechazar Proyectos** | ❌ | ✅ | ✅ |
| **Avanzar proyecto a `en_construccion` / `finalizado`** | ✅ (Dueño) | ✅ | ✅ |
| **Administrar miembros y asignar roles** | ❌ | ❌ | ✅ |
| **Modificar configuración del servidor** | ❌ | ❌ | ✅ |

---

## 🎮 Comandos de Minecraft Generados

La aplicación genera dos formatos de comandos para cada coordenada:
1. **Comando Directo:** `/tp <x> <y> <z>`
2. **Comando Seguro Multidimensión:**
   * **Overworld:** `/execute in minecraft:overworld run tp @s <x> <y> <z>`
   * **Nether:** `/execute in minecraft:the_nether run tp @s <x> <y> <z>`
   * **The End:** `/execute in minecraft:the_end run tp @s <x> <y> <z>`

Además, incluye cálculo dinámico en tiempo real para enlazar portales del Nether (relación 8:1 entre bloques del Overworld y del Nether).

---

## 📄 Licencia

Proyecto de código abierto desarrollado bajo licencia MIT para la comunidad de Minecraft.
