import Modal from './Modal';
import { Button } from './Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  description,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false,
}) {
  const confirmClass = variant === 'destructive'
    ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
    : 'bg-primary hover:bg-primary/90';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} variant={variant}>
      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          variant === 'destructive'
            ? 'bg-destructive/10 border border-destructive/30'
            : 'bg-muted/30 border border-border'
        }`}>
          {typeof message === 'string' ? (
            <p className="text-sm text-foreground">{message}</p>
          ) : message}
        </div>
      )}
      <div className="flex gap-3">
        <Button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 ${confirmClass}`}
        >
          {loading ? 'Procesando...' : confirmText}
        </Button>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outline"
          className="flex-1"
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
}
