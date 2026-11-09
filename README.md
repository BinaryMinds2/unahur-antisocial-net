# UNAHUR - Anti-Social Net (TP2)

Este repositorio contiene el frontend desarrollado en React + TypeScript + Vite para la red anti-social, integrado con la API provista por la cátedra.

**API utilizada:** https://github.com/lucasfigarola/backend-api (corre en `http://localhost:3001`)

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
3. Cargar los datos de ejemplo (usuarios, posts, comentarios e imágenes) con el seed del proyecto (`seed/seed.js`).
4. Levantar el backend y el frontend en paralelo.

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

> ℹ️ El repo de la cátedra trae su propio `seed.js`. En el paso de copiar se lo reemplaza por el del proyecto, que tiene más datos e imágenes. Si preferís usar el original, salteá ese paso.

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
