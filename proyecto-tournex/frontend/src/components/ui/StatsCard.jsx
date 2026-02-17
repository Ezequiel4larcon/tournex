export default function StatsCard({ icon: Icon, label, value, colorClass = 'text-primary', hoverBorderClass = 'hover:border-primary' }) {
  return (
    <div className={`bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 ${hoverBorderClass} transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <div className={`p-2 ${colorClass.replace('text-', 'bg-')}/20 rounded-lg`}>
            <Icon className={`w-5 h-5 ${colorClass}`} />
          </div>
        )}
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p className={`text-3xl font-bold ${colorClass === 'text-foreground' ? 'text-foreground' : colorClass}`}>{value}</p>
    </div>
  );
}
