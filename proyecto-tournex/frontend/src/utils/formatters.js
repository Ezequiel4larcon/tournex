/**
 * Utilidades de formato para torneos
 */

/**
 * Obtener etiqueta legible del estado de un torneo
 */
export const getStatusLabel = (status) => {
  const statusMap = {
    pending: 'Próximamente',
    registration_open: 'Inscripciones Abiertas',
    registration_closed: 'Inscripciones Cerradas',
    in_progress: 'En Progreso',
    completed: 'Finalizado',
    cancelled: 'Cancelado',
  };
  return statusMap[status] || status;
};

/**
 * Obtener clases CSS para el badge del estado de un torneo
 */
export const getStatusClass = (status) => {
  const classMap = {
    pending: 'bg-secondary/20 text-secondary',
    registration_open: 'bg-accent/20 text-accent',
    registration_closed: 'bg-yellow-500/20 text-yellow-500',
    in_progress: 'bg-accent/20 text-accent',
    completed: 'bg-muted text-muted-foreground',
    cancelled: 'bg-destructive/20 text-destructive',
  };
  return classMap[status] || 'bg-muted text-muted-foreground';
};

/**
 * Formatear una fecha ISO a formato datetime-local para inputs HTML
 */
export const formatDateTimeLocal = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const offset = d.getTimezoneOffset() * 60000;
  const localDate = new Date(d.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

/**
 * Formatear una fecha a formato legible en español
 */
export const formatDateES = (date) => {
  if (!date) return 'No definido';
  return new Date(date).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatear timestamp relativo (ej: "Hace 5m", "Hace 2h")
 */
export const formatRelativeTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes}m`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  return date.toLocaleDateString('es-ES');
};
