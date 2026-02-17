const Spinner = ({ text = 'Cargando...', size = 'default' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    default: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div
        className={`${sizeClasses[size]} rounded-full border-muted border-t-primary animate-spin`}
      />
      {text && <p className="text-muted-foreground text-sm">{text}</p>}
    </div>
  );
};

export default Spinner;
