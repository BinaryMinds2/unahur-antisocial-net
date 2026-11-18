# UNAHUR - Anti-Social Net (TP2)

Este repositorio contiene el frontend desarrollado en React + TypeScript + Vite para la red anti-social, integrado con la API provista por la cátedra. Toda la interfaz fue diseñada con una estética inmersiva de terminal (Matrix/Cyberpunk).

## 🌐 Demo en línea

- Frontend (Vercel): https://antisocial-unahur.vercel.app/
- Usuarios de prueba: `luna` y `sol`, contraseña `123456`.

**API:** `backend/server` es una copia sin modificar del backend de la cátedra (https://github.com/lucasfigarola/backend-api), que corre en `http://localhost:3001`. Lo único propio es `seed/seed.js` (datos de ejemplo).

---

## 👥 Equipo (Binary Minds) - Integrantes

- Cristian Signorini
- Augusto Morán
- Analía Rossotti
- Diego Goso
- Lucas Sayago

---

### Objetivo

Desarrollar en React el frontend de **UnaHur Anti-Social Net**, conectado a la API provista por la cátedra. La aplicación debe permitir navegar publicaciones, ver sus comentarios, registrarse, iniciar sesión y crear publicaciones. El login es simulado: no se requiere autenticación real ni JWT.

### Funcionalidades requeridas

- **Login simulado:** ingresar con `nickName` y la contraseña fija `123456`. Consultar `GET /users`, validar la contraseña en el frontend y guardar el usuario en un contexto global (`useContext`) y en `localStorage`. Las rutas protegidas solo se muestran con una sesión iniciada.
- **Registro:** validar los campos requeridos y enviar `POST /users`. Mostrar los errores que devuelva la API. Si el registro es exitoso, se puede redirigir al login o iniciar sesión directamente.
- **Inicio / feed:** listar publicaciones recientes mostrando descripción, imágenes (si hay), etiquetas, cantidad de comentarios y un enlace al detalle `/post/:id`. También permite filtrar las publicaciones por etiqueta.
- **Detalle de publicación:** mostrar descripción completa, imágenes, etiquetas y comentarios visibles. Incluir un formulario controlado para agregar comentarios mediante `POST /comments`.
- **Perfil:** vista protegida que muestra el `nickName`, las publicaciones del usuario consultadas por `userId`, las imágenes, la cantidad de comentarios por publicación, enlaces al detalle y un botón `[ /cerrar_sesion ]`. También contempla estados de carga, errores y usuarios sin publicaciones.
- **Crear publicación:** vista protegida con descripción obligatoria, URLs de imágenes opcionales y selección de etiquetas obtenidas desde la API. Enviar `POST /posts` con `description`, `userId` y etiquetas; asociar cada imagen mediante `POST /postimages` con `url` y `postId`.

### Requisitos técnicos

React + TypeScript; `useState`, `useEffect` y `useContext`; navegación y rutas protegidas con `react-router-dom`; formularios controlados; consumo REST con Fetch o Axios; diseño responsive; persistencia de sesión con `localStorage`; validaciones y mensajes de error/éxito inline con `noValidate`.

### Funcionalidades implementadas (Bonus)

Además de los requisitos principales, el proyecto ya cuenta con:

- Estética visual unificada estilo Terminal / Consola.
- Filtro interactivo de publicaciones por etiquetas en el Home.
- Contadores dinámicos de comentarios y caracteres en formularios.
- Vista previa de imágenes antes de publicar.
- Carga de imágenes asociadas a cada publicación.
- Estados visuales de carga (`[ pending ]`), errores y listas vacías.
- Diseño responsive.
- Animaciones de entrada e interacción en el feed y las tarjetas (`motion/react`).
- Prevención de envíos por defecto en todos los formularios (`noValidate` + feedback visual custom).

### API y endpoints de referencia

Repositorio: https://github.com/lucasfigarola/backend-api

| Método | Endpoint | Uso |
|---|---|---|
| GET | `/users` | Listar usuarios |
| GET | `/users/:id` | Obtener un usuario |
| POST | `/users` | Crear usuario |
| GET | `/posts` | Listar publicaciones |
| GET | `/posts/:id` | Obtener una publicación |
| GET | `/posts?userId=xxx` | Listar publicaciones de un usuario |
| POST | `/posts` | Crear publicación |
| GET | `/tags` | Listar etiquetas |
| GET | `/comments/post/:postId` | Listar comentarios visibles de una publicación |
| POST | `/comments` | Crear comentario |
| GET | `/postimages/post/:postId` | Listar imágenes de una publicación |
| POST | `/postimages` | Asociar una imagen a una publicación |

---

## 🚀 Guía de Instalación y Ejecución Local

Requisitos: Node.js 22 o superior y Git.

Se puede levantar el proyecto de dos formas: con un solo comando (opción A) o paso a paso (opción B).

### Opción A: un solo comando (recomendada)

Desde la raíz del proyecto, ejecutá:

```bash
npm ci
npm run dev:all
```

`npm run dev:all` se encarga de:

1. Instalar las dependencias del backend si todavía no están instaladas.
2. Cargar los datos de ejemplo la primera vez (usuarios, posts, comentarios e imágenes) con `seed/seed.js`.
3. Levantar el backend y el frontend en paralelo.

Las siguientes veces **conserva la base de datos** (usuarios y posts que hayas creado). Para volver a los datos de ejemplo originales:

```bash
npm run dev:all -- --seed
```

Para detener ambos servidores, presioná `Ctrl+C`.

### Opción B: paso a paso (manual)

**1. Backend.** Desde la raíz del proyecto:

```bash
cd backend/server
npm install
node seed.js
npm start
```

**2. Frontend.** En otra terminal, desde la raíz del proyecto:

```bash
npm ci
npm run dev
```

> ℹ️ El seed incluido en `backend/server/seed.js` carga los datos de ejemplo del proyecto. Las imágenes están en `public/images/` y la base guarda sus rutas.

> ⚠️ `node seed.js` **borra y vuelve a crear** la base de datos cada vez que se ejecuta.

### Direcciones

- API: `http://localhost:3001`
- App: `http://localhost:5173`

La URL de la API se toma de `VITE_API_URL` (por defecto `http://localhost:3001`). Si el backend corre en otro lado, creá un archivo `.env.local` basado en `.env.example`.

## 🔑 Login simulado

No hay autenticación real. Se inicia sesión con el `nickName` de un usuario existente y la contraseña fija **`123456`**.

Usuarios de prueba: `luna` y `sol` (existen con cualquiera de los dos seeds). El seed del proyecto crea además `nova` y `kai`.

También se puede crear un usuario nuevo desde la pantalla de registro (requiere nickName y email).

---

## ℹ️ Comportamientos simulados y límites

- Los seguidores y seguidos son simulados y se guardan en `localStorage` por usuario.
- **Registro:** el `nickName` requiere al menos 3 caracteres y no puede contener espacios; el email debe tener formato válido. El backend valida que el `nickName` sea único y el frontend muestra el mensaje de error que devuelve.
- **Crear publicación:** la descripción es obligatoria y debe tener entre 10 y 500 caracteres; se permiten hasta 4 imágenes, ingresadas como URL `http(s)` o seleccionando un archivo, que se comprime en el navegador y se guarda como data URL. No se permiten URLs repetidas.
- **Comentarios:** el campo es obligatorio y se requiere una sesión iniciada para comentar.
- **Rutas protegidas:** `/profile`, `/profile/:userId` y `/create-post` solo son accesibles con sesión iniciada. Sin sesión, se redirige a `/login` y, tras iniciar sesión, se vuelve a la ruta original.
- El login es simulado y utiliza la contraseña fija **`123456`**.

## 🧰 Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Solo el frontend (Vite) |
| `npm run dev:all` | Backend + frontend (prepara el backend la primera vez) |
| `npm run dev:all -- --seed` | Igual, pero reinicia la base con los datos de ejemplo |
| `npm run build` | Compilación de producción |
| `npm run lint` | Chequeo de código |
| `npm run preview` | Vista previa de la compilación |
