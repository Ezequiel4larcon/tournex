# TourneX - Sistema de Gestión de Torneos

Plataforma de torneos 1v1 con brackets de eliminación simple, gestión en tiempo real y notificaciones vía Socket.IO.

## 📋 Modelo de Negocio

**TourneX** permite a cualquier usuario crear y gestionar torneos competitivos 1v1. El sistema soporta torneos de eliminación simple con generación automática de brackets, validación de resultados y seguimiento en vivo de partidos.

### Roles

- **Player**: Crea torneos (se convierte en owner), se registra en torneos y compite en partidas 1v1
- **Super Admin**: Gestión completa de usuarios, permisos globales sobre todos los torneos

### Flujo de Torneo

1. **Creación**: Usuario crea torneo (capacidad: 2-32 participantes)
2. **Registro**: Período de inscripción abierto por el owner
3. **Brackets**: Generación automática de llaves (maneja participantes impares con sistema BYE)
4. **Partidos**: Owner marca partidos en vivo, reporta resultados con scores
5. **Progresión**: Avance manual de fases por el owner
6. **Finalización**: Torneo completa cuando se determina el ganador

### Características Clave

- Sistema BYE para torneos con participantes impares (pase automático)
- Partidos en vivo con indicadores visuales para todos los usuarios
- Control manual de progresión de fases
- Validaciones de edición (no editar partidos BYE, rondas completadas o torneos finalizados)
- Notificaciones en tiempo real vía Socket.IO
- Panel de administración con CRUD completo de usuarios

## ⚙️ Configuración Backend

Crear archivo `.env` en `/backend`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tournex
JWT_SECRET=tu_secreto_jwt_muy_seguro
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**¡Gracias por usar TourneX!** 🎉
