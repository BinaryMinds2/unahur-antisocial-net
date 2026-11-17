# UNAHUR Anti-Social Net - API Backend

API Express incluida en este repositorio para el frontend de UNAHUR Anti-Social Net. Usa SQLite y carga datos de demostración desde `seed.js`.

---

## 🚀 Requisitos

- Node.js instalado (versión recomendada: 16 o superior)
- Git (opcional, si se descarga desde un repositorio)

---

## 📂 Instalación

Desde la raíz del repositorio, entrá a `backend/server` e instalá las dependencias:

```bash
cd backend/server
npm install
```

Crear o restablecer la base de datos de ejemplo (este comando borra los datos existentes):

```bash
node seed.js
```

Iniciar la API:

```bash
npm start
```

---

## 🌐 API disponible

Una vez iniciado, el servidor quedará disponible por defecto en:

```
http://localhost:3001
```

---

## 🔁 Endpoints disponibles

### Usuarios
- `GET /users`: devuelve todos los usuarios
- `GET /users/:id`: devuelve un usuario por ID
- `POST /users`: crea un nuevo usuario (con `nickName` y `email`)
  **Body JSON requerido:**
  ```json
  {
    "nickName": "luna",
    "email": "luna@example.com"
  }

### Publicaciones
- `GET /posts`: lista todas las publicaciones
- `GET /posts/:id`: detalle de una publicación
- `POST /posts`: crear nueva publicación
- `DELETE /posts/:id?userId=<id>`: elimina una publicación del usuario indicado
  **Body JSON requerido:**
  ```json
  {
    "description": "Hoy reflexioné sobre el diseño UX",
    "userId": 1,
    "tagIds": [1, 2]
  }
  
> Nota: el campo **tagIds** es opcional. Si no se incluye, la publicación se crea sin etiquetas. 

### Comentarios
- `GET /comments/post/:postId`: comentarios visibles recientes para un post
- `POST /comments`: crear comentario
  **Body JSON requerido:**
  ```json
  {
    "content": "Muy buena reflexión sobre diseño!",
    "userId": 2,
    "postId": 1
  }

### Etiquetas
- `GET /tags`: lista todas las etiquetas

### Imágenes
- `GET /postimages/post/:postId`: devuelve todas las imágenes asociadas a un post
- `POST /postimages`: crea una nueva imagen para un post  
  **Body JSON requerido:**
  ```json
  {
    "url": "https://via.placeholder.com/300x200.png?text=Ejemplo",
    "postId": 1
  }

---

## ℹ️ Notas

- El proyecto utiliza una base de datos SQLite local (`database.sqlite`), creada al ejecutar `node seed.js`.
- Se incluye el paquete `cors` habilitado, para permitir llamadas desde React.
