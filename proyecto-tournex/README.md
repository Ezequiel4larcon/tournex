# TOURNEX - Sistema de Foro Full Stack

Sistema de foro completo desarrollado con Node.js, Express, MongoDB en el backend y React, Tailwind CSS en el frontend.

## 🚀 Tecnologías

### Backend
- **Node.js** + **Express** - Servidor web
- **MongoDB** + **Mongoose** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **Multer** - Manejo de archivos
- **express-validator** - Validación de datos

### Frontend
- **React 18** - Librería de UI
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **React Router** - Enrutamiento
- **Context API** - Estado global

## 📁 Estructura del Proyecto

```
proyecto-tournex/
├── backend/              # Servidor Node.js
│   ├── src/
│   │   ├── config/      # Configuración
│   │   ├── models/      # Modelos de Mongoose
│   │   ├── controllers/ # Controladores
│   │   ├── services/    # Lógica de negocio
│   │   ├── routes/      # Rutas de API
│   │   ├── middlewares/ # Middlewares
│   │   ├── utils/       # Utilidades
│   │   ├── app.js       # Aplicación Express
│   │   └── server.js    # Servidor
│   ├── uploads/         # Archivos subidos
│   ├── package.json
│   └── README.md
│
└── frontend/            # Aplicación React
    ├── src/
    │   ├── api/         # Cliente API
    │   ├── components/  # Componentes
    │   ├── context/     # Contextos
    │   ├── hooks/       # Custom hooks
    │   ├── pages/       # Páginas
    │   ├── router/      # Rutas
    │   └── utils/       # Utilidades
    ├── package.json
    └── README.md
```

## 🛠️ Instalación

### Prerrequisitos
- Node.js 18+ instalado
- MongoDB instalado y corriendo
- npm o yarn

### 1. Clonar el repositorio

```bash
cd proyecto-tournex
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus configuraciones
```

**Archivo `.env` del backend:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tournex
JWT_SECRET=tu_secreto_jwt_muy_seguro
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install

# Crear archivo .env (opcional)
cp .env.example .env
```

**Archivo `.env` del frontend:**
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Ejecución

### Iniciar MongoDB

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### Iniciar Backend

```bash
cd backend
npm run dev
```
El backend estará disponible en `http://localhost:5000`

### Iniciar Frontend

```bash
cd frontend
npm run dev
```
El frontend estará disponible en `http://localhost:3000`

## 📚 Características

### Autenticación y Usuarios
- ✅ Registro de usuarios
- ✅ Inicio de sesión (email o username)
- ✅ Autenticación JWT
- ✅ Roles (user, moderator, admin)
- ✅ Actualización de perfil
- ✅ Cambio de contraseña
- ✅ Avatar de usuario

### Sistema de Foro
- ✅ Crear posts/comentarios
- ✅ Editar y eliminar posts
- ✅ Sistema de likes
- ✅ Sistema de respuestas
- ✅ Contador de vistas
- ✅ Fijado de posts (moderadores)
- ✅ Categorías (general, technology, sports, entertainment, education, other)
- ✅ Sistema de tags
- ✅ Búsqueda en títulos
- ✅ Filtros por categoría
- ✅ Ordenamiento (reciente, antiguo, likes, vistas)
- ✅ Paginación

### Gestión de Archivos
- ✅ Subida de archivos individuales
- ✅ Subida múltiple de archivos
- ✅ Tipos permitidos: imágenes (jpg, png, gif, webp) y PDF
- ✅ Límite de tamaño: 5MB
- ✅ Asociación de archivos a posts/usuarios
- ✅ Gestión de permisos

## 🔌 API Endpoints

### Autenticación (`/api/auth`)
```
POST   /register         - Registrar usuario
POST   /login            - Iniciar sesión
GET    /profile          - Obtener perfil (protegido)
PUT    /profile          - Actualizar perfil (protegido)
PUT    /change-password  - Cambiar contraseña (protegido)
POST   /logout           - Cerrar sesión (protegido)
```

### Comentarios (`/api/comments`)
```
GET    /                 - Obtener todos los comentarios
GET    /:id              - Obtener comentario por ID
POST   /                 - Crear comentario (protegido)
PUT    /:id              - Actualizar comentario (protegido)
DELETE /:id              - Eliminar comentario (protegido)
POST   /:id/replies      - Agregar respuesta (protegido)
POST   /:id/like         - Toggle like (protegido)
POST   /:id/pin          - Toggle pin (moderator/admin)
```

### Archivos (`/api/files`)
```
POST   /upload              - Subir archivo (protegido)
POST   /upload-multiple     - Subir múltiples archivos (protegido)
GET    /:id                 - Obtener archivo
GET    /user/my-files       - Obtener mis archivos (protegido)
GET    /related/:model/:id  - Obtener archivos relacionados
DELETE /:id                 - Eliminar archivo (protegido)
GET    /user/stats          - Estadísticas de archivos (protegido)
```

## 🔐 Roles y Permisos

### Usuario (`user`)
- Crear posts
- Editar/eliminar sus propios posts
- Responder a posts
- Dar likes
- Subir archivos

### Moderador (`moderator`)
- Todo lo de usuario +
- Fijar/desfijar posts
- Eliminar cualquier post

### Administrador (`admin`)
- Todo lo de moderador +
- Gestión completa del sistema

## 🎨 Capturas de Pantalla

_(Aquí puedes agregar capturas de pantalla de tu aplicación)_

## 📦 Scripts Disponibles

### Backend
```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
```

### Frontend
```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Linting
```

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 Variables de Entorno

### Backend
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `5000` |
| `MONGODB_URI` | URI de MongoDB | `mongodb://localhost:27017/tournex` |
| `JWT_SECRET` | Secret para JWT | `tu_secreto_seguro` |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `NODE_ENV` | Entorno | `development` o `production` |

### Frontend
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL de la API | `http://localhost:5000/api` |

## 🚢 Despliegue

### Backend (Heroku/Railway)
```bash
# Asegurar variables de entorno en producción
# Configurar MongoDB Atlas o similar
# Push a main branch
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy carpeta dist/
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

- Desarrollado para el proyecto TOURNEX

## 🐛 Reporte de Bugs

Si encuentras algún bug, por favor abre un issue con:
- Descripción del problema
- Pasos para reproducirlo
- Comportamiento esperado
- Screenshots (si aplica)

## 📚 Documentación Adicional

- [Documentación del Backend](./backend/README.md)
- [Documentación del Frontend](./frontend/README.md)

## 🔄 Changelog

### v1.0.0 (2024)
- ✅ Implementación inicial
- ✅ Sistema de autenticación completo
- ✅ CRUD de posts con likes y respuestas
- ✅ Sistema de archivos
- ✅ UI completa con Tailwind CSS

## 📞 Soporte

Para soporte, por favor contacta al equipo de desarrollo o abre un issue en GitHub.

---

**¡Gracias por usar TOURNEX!** 🎉
