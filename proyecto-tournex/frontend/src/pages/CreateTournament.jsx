import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import { tournamentsAPI } from '../api/api';

export default function CreateTournament() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    description: '',
    maxPlayers: '32',
    format: 'elimination',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const games = ['Valorant', 'CS2', 'League of Legends', 'Dota 2', 'Overwatch 2', 'Street Fighter 6'];
  const formats = [
    { value: 'elimination', label: 'Eliminación Simple' },
    { value: 'double_elimination', label: 'Doble Eliminación' },
    { value: 'round_robin', label: 'Round Robin' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (formData.name.length < 3) newErrors.name = 'Mínimo 3 caracteres';

    if (!formData.game) newErrors.game = 'Selecciona un juego';
    if (!formData.maxPlayers) newErrors.maxPlayers = 'La capacidad es requerida';
    if (parseInt(formData.maxPlayers) < 2) newErrors.maxPlayers = 'Mínimo 2 jugadores';

    if (!formData.startDate) newErrors.startDate = 'Fecha de inicio requerida';
    if (!formData.endDate) newErrors.endDate = 'Fecha de fin requerida';

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const tournamentData = {
        name: formData.name,
        game: formData.game,
        description: formData.description,
        maxPlayers: parseInt(formData.maxPlayers),
        format: formData.format,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      };

      const newTournament = await tournamentsAPI.create(tournamentData);
      alert('¡Torneo creado exitosamente!');
      navigate(`/tournaments/${newTournament._id}`);
    } catch (err) {
      alert(`Error al crear el torneo: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">TourneX</h1>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/tournaments"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a torneos
        </Link>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Crear Nuevo Torneo</CardTitle>
            <CardDescription>Configura los detalles de tu torneo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Nombre del Torneo
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="ej: Valorant Championship 2024"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              {/* Juego */}
              <div className="space-y-2">
                <label htmlFor="game" className="text-sm font-medium text-foreground">
                  Juego
                </label>
                <Select
                  id="game"
                  name="game"
                  value={formData.game}
                  onChange={handleChange}
                  className={errors.game ? 'border-destructive' : ''}
                >
                  <option value="">Selecciona un juego</option>
                  {games.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </Select>
                {errors.game && <p className="text-sm text-destructive">{errors.game}</p>}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Descripción
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe los detalles del torneo"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              {/* Formato */}
              <div className="space-y-2">
                <label htmlFor="format" className="text-sm font-medium text-foreground">
                  Formato del Torneo
                </label>
                <Select id="format" name="format" value={formData.format} onChange={handleChange}>
                  {formats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Max Players */}
              <div className="space-y-2">
                <label htmlFor="maxPlayers" className="text-sm font-medium text-foreground">
                  Capacidad Máxima
                </label>
                <Input
                  id="maxPlayers"
                  name="maxPlayers"
                  type="number"
                  min="2"
                  max="1000"
                  value={formData.maxPlayers}
                  onChange={handleChange}
                  className={errors.maxPlayers ? 'border-destructive' : ''}
                />
                {errors.maxPlayers && <p className="text-sm text-destructive">{errors.maxPlayers}</p>}
              </div>

              {/* Fechas */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="startDate" className="text-sm font-medium text-foreground">
                    Fecha de Inicio
                  </label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={errors.startDate ? 'border-destructive' : ''}
                  />
                  {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="endDate" className="text-sm font-medium text-foreground">
                    Fecha de Fin
                  </label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={errors.endDate ? 'border-destructive' : ''}
                  />
                  {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Creando torneo...' : 'Crear Torneo'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
