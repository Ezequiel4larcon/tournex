# Socket.IO Events - TOURNEX

## Client Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## Events to Emit (Client → Server)

### Room Management
- `join_tournament` - Unirse a sala de torneo
  ```javascript
  socket.emit('join_tournament', tournamentId);
  ```

- `leave_tournament` - Salir de sala de torneo
  ```javascript
  socket.emit('leave_tournament', tournamentId);
  ```

- `join_match` - Unirse a sala de partido
  ```javascript
  socket.emit('join_match', matchId);
  ```

- `leave_match` - Salir de sala de partido
  ```javascript
  socket.emit('leave_match', matchId);
  ```

- `join_team` - Unirse a sala de equipo
  ```javascript
  socket.emit('join_team', teamId);
  ```

- `leave_team` - Salir de sala de equipo
  ```javascript
  socket.emit('leave_team', teamId);
  ```

### Chat Typing Indicators
- `typing` - Usuario está escribiendo
  ```javascript
  socket.emit('typing', { contextType: 'tournament', contextId: tournamentId });
  ```

- `stop_typing` - Usuario dejó de escribir
  ```javascript
  socket.emit('stop_typing', { contextType: 'match', contextId: matchId });
  ```

## Events to Listen (Server → Client)

### Notifications
- `new_notification` - Nueva notificación recibida
  ```javascript
  socket.on('new_notification', (notification) => {
    console.log('New notification:', notification);
    // Update UI, show toast, increment counter, etc.
  });
  ```

### Messages (Chat)
- `new_message` - Nuevo mensaje en chat
  ```javascript
  socket.on('new_message', (message) => {
    console.log('New message:', message);
    // Append to chat
  });
  ```

- `message_deleted` - Mensaje eliminado
  ```javascript
  socket.on('message_deleted', ({ messageId }) => {
    // Remove message from UI
  });
  ```

- `message_edited` - Mensaje editado
  ```javascript
  socket.on('message_edited', (message) => {
    // Update message in UI
  });
  ```

### Chat Typing
- `user_typing` - Usuario escribiendo
  ```javascript
  socket.on('user_typing', ({ username, userId }) => {
    // Show "User is typing..." indicator
  });
  ```

- `user_stop_typing` - Usuario dejó de escribir
  ```javascript
  socket.on('user_stop_typing', ({ username, userId }) => {
    // Hide typing indicator
  });
  ```

### Matches
- `match_reported` - Resultado de partido reportado
  ```javascript
  socket.on('match_reported', (report) => {
    console.log('Match reported:', report);
    // Update match status, show result
  });
  ```

- `match_updated` - Partido actualizado
  ```javascript
  socket.on('match_updated', (update) => {
    // Refresh match data
  });
  ```

### Tournaments
- `tournament_updated` - Torneo actualizado
  ```javascript
  socket.on('tournament_updated', (update) => {
    // Refresh tournament data
  });
  ```

- `tournament_started` - Torneo iniciado
  ```javascript
  socket.on('tournament_started', ({ message }) => {
    // Show notification, update status
  });
  ```

- `tournament_ended` - Torneo finalizado
  ```javascript
  socket.on('tournament_ended', ({ message, winner }) => {
    // Show results, confetti, etc.
  });
  ```

### Teams
- `team_updated` - Equipo actualizado
  ```javascript
  socket.on('team_updated', (update) => {
    // Refresh team data
  });
  ```

- `new_membership_request` - Nueva solicitud de membresía
  ```javascript
  socket.on('new_membership_request', (request) => {
    // Show notification to captain
  });
  ```

## Automatic Rooms

When connected, users are automatically joined to:
- `user:{userId}` - Personal room for notifications
- `team:{teamId}` - Current team room (if user is in a team)

## Usage Examples

### Tournament Page
```javascript
useEffect(() => {
  socket.emit('join_tournament', tournamentId);
  
  socket.on('tournament_updated', handleTournamentUpdate);
  socket.on('match_reported', handleMatchReport);
  socket.on('new_message', handleNewMessage);
  
  return () => {
    socket.emit('leave_tournament', tournamentId);
    socket.off('tournament_updated');
    socket.off('match_reported');
    socket.off('new_message');
  };
}, [tournamentId]);
```

### Match Page (Referee)
```javascript
useEffect(() => {
  socket.emit('join_match', matchId);
  
  socket.on('match_updated', handleMatchUpdate);
  socket.on('new_message', handleChatMessage);
  
  return () => {
    socket.emit('leave_match', matchId);
    socket.off('match_updated');
    socket.off('new_message');
  };
}, [matchId]);
```

### Global Notifications
```javascript
useEffect(() => {
  socket.on('new_notification', (notification) => {
    // Add to notification list
    setNotifications(prev => [notification, ...prev]);
    
    // Show toast
    toast.info(notification.message);
    
    // Increment counter
    setUnreadCount(prev => prev + 1);
  });
  
  return () => {
    socket.off('new_notification');
  };
}, []);
```
