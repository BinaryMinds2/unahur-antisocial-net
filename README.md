# UNAHUR - Anti-Social Net (TP2)

Este repositorio contiene el frontend desarrollado en React + TypeScript + Vite para la red anti-social, integrado con la API provista por la cátedra.

**API utilizada:** https://github.com/lucasfigarola/backend-api (corre en `http://localhost:3001`)

---

## 🚀 Guía de Instalación y Ejecución Local

Para levantar el proyecto completo se deben ejecutar el backend y el frontend en paralelo. Requisitos: Node.js 22 o superior y Git.

### 1. Preparar el Backend (solo la primera vez)

Si todavía no clonaste el backend, desde la raíz del proyecto ejecutá:

```bash
cd backend
git clone https://github.com/lucasfigarola/backend-api backend-api
cp ../seed/seed.js backend-api/seed.js
cd backend-api
npm install
cd ../..
npm ci
```

En PowerShell, el paso de copiar el seed es:

```powershell
Copy-Item ..\seed\seed.js backend-api\seed.js -Force
```

Si `backend/backend-api` ya existe, no vuelvas a clonarlo. Copiá el seed solo si todavía no está en `backend/backend-api/seed.js`.

### 2. Iniciar Backend y Frontend

Desde la raíz del proyecto, ejecutá:

```sh
npm run dev:all
```

El comando carga los datos de ejemplo y, si el seed termina correctamente, inicia el backend y el frontend en paralelo. La API queda en `http://localhost:3001` y la app en `http://localhost:5173`. Para detener ambos servidores, presioná `Ctrl+C`.

> ⚠️ El seed **borra y vuelve a crear** la base de datos cada vez que ejecutás `npm run dev:all`.

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
| `npm run dev:all` | Carga el seed y levanta backend y frontend |
| `npm run build` | Compilación de producción |
| `npm run lint` | Chequeo de código |
| `npm run preview` | Vista previa de la compilación |

---

## 👥 Integrantes
