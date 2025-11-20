# Frontend TOURNEX

Frontend del sistema de foro TOURNEX desarrollado con React, Vite y Tailwind CSS.

## 🚀 Tecnologías

- **React 18** - Librería de UI
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS
- **React Router v6** - Enrutamiento
- **Context API** - Gestión de estado global
- **Fetch API** - Cliente HTTP

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── api/               # Cliente API
│   │   └── forumApi.js
│   ├── components/        # Componentes reutilizables
│   │   ├── Navbar.jsx
│   │   ├── CommentCard.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/          # Contextos de React
│   │   ├── AuthContext.jsx
│   │   └── ForumContext.jsx
│   ├── hooks/            # Custom hooks
│   │   ├── useAuth.js
│   │   └── useComments.js
│   ├── pages/            # Páginas de la aplicación
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── NewPost.jsx
│   │   └── CommentDetail.jsx
│   ├── router/           # Configuración de rutas
│   │   └── AppRouter.jsx
│   ├── utils/            # Utilidades
│   │   ├── constants.js
│   │   └── validators.js
│   ├── App.jsx           # Componente principal
│   ├── main.jsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Crear archivo .env (opcional)
cp .env.example .env
```

### Variables de Entorno (Opcional)

```env
VITE_API_URL=http://localhost:5000/api
```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo en http://localhost:3000

# Producción
npm run build        # Crea build de producción en /dist
npm run preview      # Preview del build de producción

# Linting
npm run lint         # Ejecuta ESLint
```

## 🎨 Características

### Autenticación
- Registro de usuarios con validación
- Inicio de sesión (email o username)
- Protección de rutas privadas
- Persistencia de sesión con localStorage
- Cierre de sesión

### Foro
- Lista de comentarios con filtros y búsqueda
- Crear nuevos posts
- Ver detalle de posts
- Sistema de likes
- Sistema de respuestas
- Paginación
- Fijado de posts (moderadores)
- Categorías y tags

### UI/UX
- Diseño responsive
- Interfaz moderna con Tailwind CSS
- Validación de formularios en tiempo real
- Mensajes de error descriptivos
- Loading states
- Navegación intuitiva

## 🔌 API Endpoints

El frontend se conecta al backend en `http://localhost:5000/api` (configurable).

### Autenticación
- `POST /auth/register` - Registro
- `POST /auth/login` - Login
- `GET /auth/profile` - Perfil del usuario
- `PUT /auth/profile` - Actualizar perfil
- `PUT /auth/change-password` - Cambiar contraseña
- `POST /auth/logout` - Cerrar sesión

### Comentarios
- `GET /comments` - Lista de comentarios
- `GET /comments/:id` - Detalle de comentario
- `POST /comments` - Crear comentario
- `PUT /comments/:id` - Actualizar comentario
- `DELETE /comments/:id` - Eliminar comentario
- `POST /comments/:id/replies` - Agregar respuesta
- `POST /comments/:id/like` - Toggle like
- `POST /comments/:id/pin` - Toggle pin

### Archivos
- `POST /files/upload` - Subir archivo
- `POST /files/upload-multiple` - Subir múltiples archivos
- `GET /files/:id` - Obtener archivo
- `DELETE /files/:id` - Eliminar archivo

## 🎯 Contextos

### AuthContext
Proporciona:
- `user` - Usuario autenticado
- `loading` - Estado de carga
- `error` - Errores de autenticación
- `register(userData)` - Registrar usuario
- `login(credentials)` - Iniciar sesión
- `logout()` - Cerrar sesión
- `updateProfile(userData)` - Actualizar perfil
- `changePassword(passwords)` - Cambiar contraseña
- `isAuthenticated` - Boolean de autenticación
- `isModerator` - Boolean si es moderador
- `isAdmin` - Boolean si es admin

### ForumContext
Proporciona:
- `comments` - Lista de comentarios
- `currentComment` - Comentario actual
- `loading` - Estado de carga
- `error` - Errores
- `pagination` - Info de paginación
- `fetchComments(params)` - Obtener comentarios
- `fetchCommentById(id)` - Obtener comentario por ID
- `createComment(data)` - Crear comentario
- `updateComment(id, data)` - Actualizar comentario
- `deleteComment(id)` - Eliminar comentario
- `addReply(id, data)` - Agregar respuesta
- `toggleLike(id)` - Toggle like
- `togglePin(id)` - Toggle pin
- `uploadFile(file, model, id)` - Subir archivo

## 🔐 Rutas Protegidas

Rutas que requieren autenticación:
- `/new-post` - Crear nuevo post

Las rutas protegidas redirigen a `/login` si el usuario no está autenticado.

## 📱 Páginas

### Home (/)
- Lista de todos los posts
- Filtros por categoría, búsqueda y ordenamiento
- Paginación

### Login (/login)
- Formulario de inicio de sesión
- Validación de campos
- Redirección a home tras login exitoso

### Register (/register)
- Formulario de registro
- Validación de campos
- Confirmación de contraseña

### New Post (/new-post)
- Formulario para crear post
- Título, contenido, categoría y tags
- Validación en tiempo real

### Comment Detail (/comment/:id)
- Vista detallada del post
- Sistema de likes
- Lista de respuestas
- Formulario para responder

## 🎨 Tailwind CSS

Configuración personalizada con:
- Paleta de colores primary
- Fuente Inter
- Utilidades personalizadas
- Responsive design

## 📄 Validaciones

Todas las validaciones en `src/utils/validators.js`:
- Email válido
- Contraseña mínimo 6 caracteres
- Username 3-30 caracteres
- Título 3-200 caracteres
- Contenido 10-5000 caracteres
- Tamaño y tipo de archivos

## 🚦 Manejo de Errores

- Errores de red capturados
- Mensajes descriptivos al usuario
- Redirección automática en 401 (no autorizado)
- Validación de formularios con feedback visual

## 👥 Roles de Usuario

- **user** - Usuario normal
- **moderator** - Puede fijar/desfijar posts
- **admin** - Acceso completo

## 🔄 Estado de Autenticación

El estado de autenticación se persiste en:
- `localStorage.token` - JWT token
- `localStorage.user` - Datos del usuario

Se refresca automáticamente al cargar la aplicación.

## 🌐 Proxy de Desarrollo

Vite está configurado para hacer proxy de `/api` al backend:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  }
}
```

## 📚 Recursos

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)

## 🤝 Contribución

Este es el frontend del proyecto TOURNEX. Para contribuir:
1. Sigue las convenciones de código establecidas
2. Usa componentes funcionales con hooks
3. Mantén los componentes pequeños y reutilizables
4. Documenta funciones complejas

## 📞 Soporte

Para problemas o preguntas sobre el frontend, consulta la documentación del backend o contacta al equipo de desarrollo.
