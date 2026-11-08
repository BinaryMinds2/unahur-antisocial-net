# UNAHUR - Anti-Social Net (TP2)

Este repositorio contiene el frontend desarrollado en React + TypeScript + Vite para la red anti-social, integrado con la API provista por la cátedra.

**API utilizada:** https://github.com/lucasfigarola/backend-api (corre en `http://localhost:3001`)

---

## 🚀 Guía de Instalación y Ejecución Local

Para levantar el proyecto completo se deben ejecutar el backend y el frontend en paralelo. Requisitos: Node.js 22 o superior y Git.

### 1. Clonar e Iniciar el Backend

En una terminal ubicada en la raíz del proyecto, ejecutá:

```bash
# Entrar a la carpeta contenedora (ya existe en el repositorio)
cd backend

# Clonar el repositorio de la API de la cátedra
git clone https://github.com/lucasfigarola/backend-api backend-api

# Usar el seed del proyecto (con más datos e imágenes de ejemplo)
cp ../seed/seed.js backend-api/seed.js

# Instalar dependencias, cargar datos de ejemplo e iniciar el servidor
cd backend-api
npm install
node seed.js
npm start
```

En PowerShell, el paso de copiar el seed es:

```powershell
Copy-Item ..\seed\seed.js backend-api\seed.js -Force
```

> ⚠️ `node seed.js` **borra y vuelve a crear** la base de datos cada vez que se ejecuta.

Dejá esa terminal abierta. Verificá que responda en `http://localhost:3001/users`.

### 2. Iniciar el Frontend (React + Vite)

En una segunda terminal ubicada en la raíz del proyecto, ejecutá:

```bash
# Instalar dependencias del frontend
npm ci

# Iniciar servidor de desarrollo de Vite
npm run dev
```

La app queda en `http://localhost:5173`.

La URL de la API se toma de `VITE_API_URL` (por defecto `http://localhost:3001`). Si el backend corre en otro lado, creá un archivo `.env.local` basado en `.env.example`.

---

## 🔑 Login simulado

No hay autenticación real. Se inicia sesión con el `nickName` de un usuario existente y la contraseña fija **`123456`**.

Usuarios de prueba (creados por el seed): `luna`, `sol`, `nova` y `kai`.

También se puede crear un usuario nuevo desde la pantalla de registro (requiere nickName y email).

---

## 🧰 Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run lint` | Chequeo de código |
| `npm run preview` | Vista previa de la compilación |

---

## 👥 Integrantes

