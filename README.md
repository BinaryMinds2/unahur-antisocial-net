# UNAHUR - Anti-Social Net (TP2)

Este repositorio contiene el frontend desarrollado en React + Vite para la red anti-social integrada localmente con la API de Persistencia.

---

## 🚀 Guía de Instalación y Ejecución Local

Para levantar el proyecto completo, se deben ejecutar el backend de Persistencia y el frontend en paralelo.

### 1. Clonar e Iniciar el Backend (Persistencia)

En una terminal ubicada en la raíz del proyecto, ejecutá:

```bash
# Crear la carpeta contenedora e ingresar a ella
mkdir backend
cd backend

# Clonar el repositorio de Persistencia
git clone https://gitea.unahur.edu.ar/Estrategia-de-persistencia-C2-2026/ejercicio-47-grupo-13.git

# Ingresar a la subcarpeta del proyecto clonado
cd ejercicio-47-grupo-13

# Instalar dependencias e iniciar el servidor en modo desarrollo
npm install
npm run dev


2. Iniciar el Frontend (React + Vite)
En una segunda terminal ubicada en la raíz del proyecto principal, ejecutá:

Bash
# Instalar dependencias del frontend
npm install

# Iniciar servidor de desarrollo de Vite
npm run dev