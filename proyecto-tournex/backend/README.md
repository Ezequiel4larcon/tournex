# TOURNEX Backend

Backend del sistema de foro TOURNEX construido con Node.js, Express, MongoDB y JWT.

## 🚀 Características

- **Autenticación JWT**: Sistema seguro de registro y login
- **Gestión de Comentarios**: CRUD completo con likes, respuestas y pins
- **Upload de Archivos**: Soporte para múltiples archivos con Multer
- **Arquitectura en Capas**: Separación clara entre controladores, servicios y modelos
- **Event-Driven**: Diseño preparado para eventos y escalabilidad
- **Validación de Datos**: Validación robusta con express-validator
- **Manejo de Errores**: Sistema centralizado de manejo de errores

## 📋 Requisitos

- Node.js v16 o superior
- MongoDB v4.4 o superior
- npm o yarn

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno (ver `.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tournex
JWT_SECRET=your_secret_key
```

3. Iniciar el servidor:
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración de DB y variables de entorno
│   ├── controllers/     # Controladores de rutas
│   ├── middlewares/     # Middlewares personalizados
│   ├── models/          # Modelos de MongoDB
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades (JWT, bcrypt, errorHandler)
│   ├── uploads/         # Archivos subidos
│   ├── app.js           # Configuración de Express
│   └── server.js        # Punto de entrada
├── .env
└── package.json
```

## 🔐 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (protegido)
- `PUT /api/auth/profile` - Actualizar perfil (protegido)
- `PUT /api/auth/change-password` - Cambiar contraseña (protegido)

### Comentarios
- `GET /api/comments` - Listar comentarios
- `GET /api/comments/:id` - Obtener comentario por ID
- `POST /api/comments` - Crear comentario (protegido)
- `PUT /api/comments/:id` - Actualizar comentario (protegido)
- `DELETE /api/comments/:id` - Eliminar comentario (protegido)
- `POST /api/comments/:id/replies` - Agregar respuesta (protegido)
- `POST /api/comments/:id/like` - Dar/quitar like (protegido)
- `POST /api/comments/:id/pin` - Pin/unpin comentario (admin/moderador)

### Archivos
- `POST /api/files/upload` - Subir archivo (protegido)
- `POST /api/files/upload-multiple` - Subir múltiples archivos (protegido)
- `GET /api/files/:id` - Obtener información de archivo
- `GET /api/files/user/my-files` - Mis archivos (protegido)
- `GET /api/files/user/stats` - Estadísticas de archivos (protegido)
- `DELETE /api/files/:id` - Eliminar archivo (protegido)

## 🛡️ Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación mediante JWT
- Validación de datos en todas las rutas
- Protección contra archivos maliciosos
- Rate limiting (recomendado para producción)

## 📝 Licencia

ISC
