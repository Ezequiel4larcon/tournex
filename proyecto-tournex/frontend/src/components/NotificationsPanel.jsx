import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { X, Bell, Trophy, Users, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { notificationsAPI } from '../api/api';
import { getSocket } from '../utils/socket';

export function NotificationsPanel({ isOpen, onClose, onCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Escuchar nuevas notificaciones en tiempo real
    socket.on('new_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off('new_notification');
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll({ page: 1, limit: 20 });
      setNotifications(response.data.notifications || []);
      
      const countResponse = await notificationsAPI.getUnreadCount();
      const newCount = countResponse.data.unreadCount || 0;
      setUnreadCount(newCount);
      if (onCountChange) {
        onCountChange(newCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'match_reported':
      case 'match_started':
      case 'referee_assigned':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'request_accepted':
      case 'request_rejected':
      case 'member_joined':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'tournament_registration':
      case 'tournament_start':
      case 'tournament_end':
      case 'bracket_generated':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'report_validated':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      // Eliminar la notificación de la lista al marcarla como leída
      setNotifications(notifications.filter((n) => n._id !== notificationId));
      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      if (onCountChange) {
        onCountChange(newCount);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const notification = notifications.find((n) => n._id === notificationId);
      await notificationsAPI.delete(notificationId);
      setNotifications(notifications.filter((n) => n._id !== notificationId));
      
      // Si la notificación no estaba leída, actualizar el contador
      if (notification && !notification.isRead) {
        const newCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newCount);
        if (onCountChange) {
          onCountChange(newCount);
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      // Eliminar todas las notificaciones no leídas de la lista
      setNotifications(notifications.filter((n) => n.isRead));
      setUnreadCount(0);
      if (onCountChange) {
        onCountChange(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
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

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificaciones
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-500 text-white">
                {unreadCount}
              </span>
            )}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-800">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="w-full text-sm text-blue-500 hover:text-blue-600"
            >
              Marcar todas como leídas
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Cargando...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay notificaciones</p>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification._id}
                className={`cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-colors ${
                  !notification.isRead 
                    ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950' 
                    : 'border-gray-200 dark:border-gray-800'
                }`}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
