import { useEscapeKey } from '../../hooks/useEscapeKey';

export default function Modal({ isOpen, onClose, title, description, children, variant = 'default' }) {
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const borderClass = variant === 'destructive' ? 'border-destructive/50' : 'border-border';

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`bg-card/95 backdrop-blur-sm border ${borderClass} rounded-xl max-w-md w-full p-6`}>
          {(title || description) && (
            <div className="mb-6">
              {title && (
                <h3 className={`text-2xl font-bold mb-2 ${variant === 'destructive' ? 'text-destructive' : 'text-foreground'}`}>
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </>
  );
}
