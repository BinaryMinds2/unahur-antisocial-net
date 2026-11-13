# UNAHUR - Anti-Social Net (TP2)

Este repositorio contiene el frontend desarrollado en React + TypeScript + Vite para la red anti-social, integrado con la API provista por la cátedra.

**API utilizada:** https://github.com/lucasfigarola/backend-api (corre en `http://localhost:3001`)

---

## 📄 Enunciado del trabajo

<details>
<summary>Ver objetivo y requisitos</summary>

### Objetivo

Desarrollar en React el frontend de **UnaHur Anti-Social Net**, conectado a la API provista por la cátedra. La aplicación debe permitir navegar publicaciones, ver sus comentarios, registrarse, iniciar sesión y crear publicaciones. El login es simulado: no se requiere autenticación real ni JWT.

### Funcionalidades requeridas

- **Login simulado:** ingresar con `nickName` y la contraseña fija `123456`. Consultar `GET /users`, validar la contraseña en el frontend y guardar el usuario en un contexto global (`useContext`) y en `localStorage`. Las rutas protegidas solo se muestran con una sesión iniciada.
- **Registro:** validar los campos requeridos y enviar `POST /users`. Mostrar los errores que devuelva la API. Si el registro es exitoso, se puede redirigir al login o iniciar sesión directamente.
- **Inicio / feed:** listar publicaciones recientes mostrando descripción, imágenes (si hay), etiquetas, cantidad de comentarios y un enlace al detalle `/post/:id`. También permite filtrar las publicaciones por etiqueta.
- **Detalle de publicación:** mostrar descripción completa, imágenes, etiquetas y comentarios visibles. Incluir un formulario controlado para agregar comentarios mediante `POST /comments`.
- **Perfil:** vista protegida que muestra el `nickName`, las publicaciones del usuario consultadas por `userId`, las imágenes, la cantidad de comentarios por publicación, enlaces al detalle y una opción para cerrar sesión. También contempla estados de carga, errores y usuarios sin publicaciones.
- **Crear publicación:** vista protegida con descripción obligatoria, URLs de imágenes opcionales y selección de etiquetas obtenidas desde la API. Enviar `POST /posts` con `description`, `userId` y etiquetas; asociar cada imagen mediante `POST /postimages` con `url` y `postId`.

### Requisitos técnicos

React + TypeScript; `useState`, `useEffect` y `useContext`; navegación y rutas protegidas con `react-router-dom`; formularios controlados; consumo REST con Fetch o Axios; diseño responsive; persistencia de sesión con `localStorage`; validaciones y mensajes de error/éxito.

### Funcionalidades implementadas

Además de los requisitos principales, el proyecto ya cuenta con:

- Filtro de publicaciones por etiquetas en Home.
- Contadores de comentarios en las tarjetas de publicaciones.
- Carga de imágenes asociadas a cada publicación.
- Estados visuales de carga, errores y listas vacías.
- Diseño responsive con menú de navegación móvil.
- Animaciones de entrada e interacción en el feed y las tarjetas.
- Rutas protegidas para perfil y creación de publicaciones.

Como próximos extras opcionales se pueden agregar publicaciones destacadas o aleatorias, scroll infinito o paginación y alertas visuales. La contraseña dinámica con validación en el servidor es opcional únicamente para quienes cursan Estrategia de Persistencia.

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

### Entrega

Publicar el repositorio frontend en GitHub y enviar el enlace público a `lucas.figarola@unahur.edu.ar`, junto con los datos de las personas integrantes. Si se utiliza un backend propio de Estrategia de Persistencia, incluir también el enlace a ese repositorio.

</details>

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

La primera vez, `npm run dev:all` se encarga de:

1. Clonar el backend de la cátedra dentro de `backend/backend-api`.
2. Instalar sus dependencias.
3. Instalar en el backend la ruta que permite borrar publicaciones propias.
4. Cargar los datos de ejemplo (usuarios, posts, comentarios e imágenes) con el seed del proyecto (`seed/seed.js`).
5. Levantar el backend y el frontend en paralelo.

Las siguientes veces **conserva la base de datos** (usuarios y posts que hayas creado). Para volver a los datos de ejemplo originales:

```bash
npm run dev:all -- --seed
```

Para detener ambos servidores, presioná `Ctrl+C`.

### Opción B: paso a paso (manual)

**1. Backend.** Desde la raíz del proyecto:

```bash
cd backend
git clone https://github.com/lucasfigarola/backend-api backend-api
cp ../seed/seed.js backend-api/seed.js
node ../scripts/install-backend-routes.js
cd backend-api
npm install
node seed.js
npm start
```

En PowerShell, el paso de copiar el seed es:

```powershell
Copy-Item ..\seed\seed.js backend-api\seed.js -Force
```

Dejá esa terminal abierta. Si `backend/backend-api` ya existe, salteá el `git clone`.

**2. Frontend.** En otra terminal, desde la raíz del proyecto:

```bash
npm ci
npm run dev
```

> ℹ️ El repo de la cátedra trae su propio `seed.js`. En el paso de copiar se lo reemplaza por el del proyecto, que tiene más datos e imágenes. Las imágenes locales están en `public/images/` y la base guarda sus rutas. Si preferís usar el seed original, salteá ese paso.

> ⚠️ `node seed.js` **borra y vuelve a crear** la base de datos cada vez que se ejecuta.

### Direcciones

- API: `http://localhost:3001`
- App: `http://localhost:5173`

La URL de la API se toma de `VITE_API_URL` (por defecto `http://localhost:3001`). Si el backend corre en otro lado, creá un archivo `.env.local` basado en `.env.example`.

---

## 🔑 Login simulado

No hay autenticación real. Se inicia sesión con el `nickName` de un usuario existente y la contraseña fija **`123456`**.

Usuarios de prueba: `luna` y `sol` (existen con cualquiera de los dos seeds). El seed del proyecto crea además `nova` y `kai`.

También se puede crear un usuario nuevo desde la pantalla de registro (requiere nickName y email).

---

## 🧰 Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Solo el frontend (Vite) |
| `npm run dev:all` | Backend + frontend (prepara el backend la primera vez) |
| `npm run dev:all -- --seed` | Igual, pero reinicia la base con los datos de ejemplo |
| `npm run build` | Compilación de producción |
| `npm run lint` | Chequeo de código |
| `npm run preview` | Vista previa de la compilación |

---

## 👥 Integrantes

- Cristian Signorini
- Augusto Morán
- Analía Rossotti
- Diego Goso
- Lucas Sayago
