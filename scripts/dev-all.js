import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import concurrently from 'concurrently'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const backendDirectory = resolve(projectRoot, 'backend', 'backend-api')

function runSeed() {
  return new Promise((resolveSeed, rejectSeed) => {
    const seedProcess = spawn(process.execPath, ['seed.js'], {
      cwd: backendDirectory,
      stdio: 'inherit',
    })

    seedProcess.on('error', rejectSeed)
    seedProcess.on('close', (code) => {
      if (code === 0) {
        resolveSeed()
      } else {
        rejectSeed(new Error(`El seed terminó con código ${code ?? 'desconocido'}.`))
      }
    })
  })
}

try {
  await runSeed()

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
