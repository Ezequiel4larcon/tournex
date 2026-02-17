import Modal from './ui/Modal';
import { Button } from './ui/Button';

export default function DateEditModal({
  isOpen,
  onClose,
  title,
  description,
  dates,
  onChange,
  onSubmit,
  fields,
  submitText = 'Guardar Cambios',
  submitClassName = 'bg-primary hover:bg-primary/90',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description}>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-foreground mb-2">
              {field.label}
            </label>
            <input
              type="datetime-local"
              value={dates[field.name] || ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
            />
          </div>
        ))}
        <div className="flex gap-3 mt-6">
          <Button onClick={onSubmit} className={`flex-1 ${submitClassName}`}>
            {submitText}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
