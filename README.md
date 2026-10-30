# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

## Conexión con el backend

El frontend consume la API configurada en `VITE_API_URL`. La URL debe incluir el
prefijo `/api`, porque todas las rutas de negocio del backend se publican bajo
ese prefijo.

Para desarrollo local:

```powershell
Copy-Item .env.example .env.local
```

El archivo `.env.local` debe contener:

```env
VITE_API_URL=http://localhost:3000/api
```

El backend debe estar iniciado en `http://localhost:3000` y tener configurado
`FRONTEND_URLS=http://localhost:5173`.

Para producción, configurar `VITE_API_URL` en el panel del proveedor del
frontend, sin subir un archivo `.env.local` al repositorio:

```env
VITE_API_URL=https://<dominio-del-backend>/api
```

Al mismo tiempo, configurar en el backend:

```env
FRONTEND_URLS=https://<dominio-del-frontend>
```

Se pueden indicar varios orígenes separados por comas. Nunca se deben subir
credenciales ni archivos `.env` al repositorio.

## Puesta en marcha local

En una terminal, iniciar el backend:

```powershell
cd "<ruta>\trabajo-practico-grupal-persistire"
npm install
npm run dev
```

En otra terminal, iniciar el frontend:

```powershell
cd "<ruta>\unahur-antisocial-net"
npm install
npm run dev
```

Verificar:

- Backend: `http://localhost:3000/health`
- Usuarios: `http://localhost:3000/api/users`
- Frontend: `http://localhost:5173`

Las funciones de acceso a la API están centralizadas en
`src/services/api.ts`. Las imágenes se consultan mediante
`/api/posts/:postId/images`; no existe un endpoint general `/postimages`.
