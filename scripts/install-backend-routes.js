import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const backendDirectory = resolve(projectRoot, 'backend', 'backend-api')
const backendRoutesDirectory = resolve(backendDirectory, 'routes')
const deletePostsRoute = resolve(backendRoutesDirectory, 'delete-posts.js')
const backendApp = resolve(backendDirectory, 'app.js')

export function installBackendRoutes() {
  if (!existsSync(backendApp) || !existsSync(backendRoutesDirectory)) {
    throw new Error(
      'No se encontró el backend. Clonalo en backend/backend-api antes de instalar sus rutas.',
    )
  }

  copyFileSync(
    resolve(projectRoot, 'scripts', 'backend-routes', 'delete-posts.js'),
    deletePostsRoute,
  )

  const appSource = readFileSync(backendApp, 'utf8')
  const deleteRouteRegistration = "app.use('/posts', require('./routes/delete-posts'));"
  if (appSource.includes(deleteRouteRegistration)) return

  const postsRouteRegistration = "app.use('/posts', postRoutes);"
  if (!appSource.includes(postsRouteRegistration)) {
    throw new Error('No se encontró el registro de rutas /posts en el backend.')
  }

  writeFileSync(
    backendApp,
    appSource.replace(
      postsRouteRegistration,
      `${postsRouteRegistration}\n${deleteRouteRegistration}`,
    ),
  )
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    installBackendRoutes()
    console.log('> Rutas de backend instaladas.')
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
