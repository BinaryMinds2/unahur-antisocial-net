import { spawn } from 'node:child_process'
import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import concurrently from 'concurrently'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const backendFolder = resolve(projectRoot, 'backend')
const backendDirectory = resolve(backendFolder, 'backend-api')
const seededMarker = resolve(backendDirectory, '.seeded')
const forceSeed = process.argv.includes('--seed')

function run(command, cwd) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, { cwd, stdio: 'inherit', shell: true })

    child.on('error', rejectRun)
    child.on('close', (code) => {
      if (code === 0) {
        resolveRun()
      } else {
        rejectRun(new Error(`"${command}" terminó con código ${code ?? 'desconocido'}.`))
      }
    })
  })
}

try {
  if (!existsSync(backendDirectory)) {
    console.log('> Clonando el backend del profesor...')
    await run(
      'git clone https://github.com/lucasfigarola/backend-api backend-api',
      backendFolder,
    )
  }

  if (!existsSync(resolve(backendDirectory, 'node_modules'))) {
    console.log('> Instalando dependencias del backend...')
    await run('npm install', backendDirectory)
  }

  // Siempre usamos el seed del proyecto (con más datos e imágenes de ejemplo).
  copyFileSync(
    resolve(projectRoot, 'seed', 'seed.js'),
    resolve(backendDirectory, 'seed.js'),
  )

  // El seed borra la base: solo se ejecuta la primera vez o si se pide con --seed.
  if (forceSeed || !existsSync(seededMarker)) {
    console.log('> Cargando datos de ejemplo (se borra y recrea la base)...')
    await run('node seed.js', backendDirectory)
    writeFileSync(seededMarker, new Date().toISOString())
  }

  const { result } = concurrently(
    [
      { command: 'npm run dev', name: 'backend', cwd: backendDirectory },
      { command: 'npm run dev', name: 'frontend', cwd: projectRoot },
    ],
    { prefix: 'name', killOthersOn: ['success', 'failure'] },
  )

  await result
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}