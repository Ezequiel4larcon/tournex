# Funcionalidad de Baneo de Participantes

## Descripción
Esta funcionalidad permite a los moderadores (dueños) de torneos banear participantes de sus torneos, siempre que se cumplan ciertas condiciones.

## Restricciones

### Estados del Torneo
Solo se puede banear participantes cuando el torneo está en:
- `registration_open` - Inscripciones abiertas
- `in_progress` - Torneo en progreso

**No se puede banear cuando el torneo está:**
- `pending` - Pendiente de apertura
- `registration_closed` - Inscripciones cerradas
- `completed` - Finalizado
- `cancelled` - Cancelado

### Restricciones Adicionales
1. **Autorización**: Solo el dueño del torneo o un super admin puede banear participantes
2. **Matches Activos**: No se puede banear un participante que tenga matches en estado `pending` o `in_progress`
3. **Ya Baneado**: No se puede banear un participante que ya está en estado `banned`
4. **Pertenencia**: El participante debe pertenecer al torneo

## API Endpoint

### Banear Participante
```
POST /api/tournaments/:id/ban/:participantId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Parámetros:**
- `id` - ID del torneo
- `participantId` - ID del participante a banear

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Participant banned successfully",
  "data": {
    "_id": "participant_id",
    "tournament": "tournament_id",
    "player": {
      "_id": "player_id",
      "username": "player_name",
      "email": "player@email.com"
    },
    "status": "banned",
    "seed": 1,
    "wins": 0,
    "losses": 0
  }
}
```

**Errores Posibles:**
- `404` - Tournament not found
- `404` - Participant not found
- `403` - Only tournament owner can ban participants
- `400` - Can only ban participants when tournament is in registration or in progress
- `400` - Participant does not belong to this tournament
- `400` - Participant is already banned
- `400` - Cannot ban participant with active or pending matches

## Efectos del Baneo

1. **Estado del Participante**: Cambia a `banned`
2. **Contador de Participantes**: Se decrementa `currentParticipants` si el torneo está en `registration_open`
3. **Evento de Socket**: Se emite `participant_banned` a todos los usuarios conectados a la sala del torneo

## Evento de Socket.IO

### participant_banned
```javascript
{
  tournamentId: "tournament_id",
  participant: {
    _id: "participant_id",
    player: {
      _id: "player_id",
      username: "player_name",
      email: "player@email.com"
    },
    status: "banned"
  }
}
```

## Frontend

### UI
- Botón de "Banear" visible solo para el dueño del torneo
- Solo aparece cuando el torneo está en `registration_open` o `in_progress`
- No aparece para participantes ya baneados
- Modal de confirmación antes de ejecutar el baneo

### Indicadores Visuales
- Participantes baneados se muestran con:
  - Fondo rojo claro (`bg-destructive/10`)
  - Borde rojo (`border-destructive/30`)
  - Texto tachado
  - Badge "Baneado"
  - Icono y colores diferentes

### Actualización en Tiempo Real
El componente escucha el evento `participant_banned` y actualiza automáticamente la lista de participantes sin necesidad de recargar la página.

## Ejemplo de Uso

1. Usuario crea un torneo
2. Participantes se inscriben
3. Un participante se comporta inapropiadamente
4. Dueño del torneo hace clic en "Banear" junto al participante
5. Aparece modal de confirmación
6. Dueño confirma el baneo
7. Sistema valida que no haya matches activos
8. Participante es marcado como `banned`
9. Todos los usuarios conectados ven la actualización en tiempo real

## Consideraciones Técnicas

### Backend
- Servicio: `tournament.service.js` - `banParticipant()`
- Controlador: `tournament.controller.js` - `banParticipant()`
- Ruta: `tournament.routes.js` - `POST /:id/ban/:participantId`
- Middleware: `protect`, `isTournamentOwnerOrSuperAdmin`

### Frontend
- Componente: `TournamentDetail.jsx`
- API: `api.js` - `tournamentsAPI.banParticipant()`
- Socket: Listener para `participant_banned`
- Estados: `showBanModal`, `participantToBan`, `banning`

## Testing

Para probar la funcionalidad:
1. Crear un torneo
2. Abrir inscripciones
3. Inscribir al menos 2 participantes
4. Como dueño, intentar banear un participante
5. Verificar que el participante aparece como baneado
6. Intentar banear cuando hay matches activos (debería fallar)
7. Verificar actualizaciones en tiempo real en otra ventana/usuario
