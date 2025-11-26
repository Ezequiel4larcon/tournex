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
    maxParticipants: '8',
    format: 'single_elimination',
    registrationStartDate: '',
    registrationEndDate: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const games = ['CS2', 'VALORANT', 'OVERWATCH 2', 'FIFA'];
  const participantOptions = [2, 4, 8, 16, 32];

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
    if (!formData.maxParticipants) newErrors.maxParticipants = 'La capacidad es requerida';
    const validParticipants = [2, 4, 8, 16, 32];
    if (!validParticipants.includes(parseInt(formData.maxParticipants))) {
      newErrors.maxParticipants = 'Debe ser 2, 4, 8, 16 o 32 jugadores';
    }

    if (!formData.registrationStartDate) newErrors.registrationStartDate = 'Fecha de inicio de inscripciones requerida';
    if (!formData.registrationEndDate) newErrors.registrationEndDate = 'Fecha de fin de inscripciones requerida';
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
        maxParticipants: parseInt(formData.maxParticipants),
        format: formData.format,
        registrationStartDate: formData.registrationStartDate,
        registrationEndDate: formData.registrationEndDate,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      const response = await tournamentsAPI.create(tournamentData);
      const newTournament = response.data.data;
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
                <label className="text-sm font-medium text-foreground">
                  Formato del Torneo
                </label>
                <div className="px-4 py-3 bg-muted/50 rounded-md border border-border">
                  <p className="text-sm text-foreground">Eliminación Simple</p>
                  <p className="text-xs text-muted-foreground mt-1">Los jugadores son eliminados tras una derrota</p>
                </div>
              </div>

              {/* Max Participants */}
              <div className="space-y-2">
                <label htmlFor="maxParticipants" className="text-sm font-medium text-foreground">
                  Cantidad de Jugadores
                </label>
                <Select
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  className={errors.maxParticipants ? 'border-destructive' : ''}
                >
                  {participantOptions.map((num) => (
                    <option key={num} value={num}>
                      {num} jugadores
                    </option>
                  ))}
                </Select>
                {errors.maxParticipants && <p className="text-sm text-destructive">{errors.maxParticipants}</p>}
              </div>

              {/* Fechas de Inscripción */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="registrationStartDate" className="text-sm font-medium text-foreground">
                    Inicio de Inscripciones
                  </label>
                  <Input
                    id="registrationStartDate"
                    name="registrationStartDate"
                    type="datetime-local"
                    value={formData.registrationStartDate}
                    onChange={handleChange}
                    className={errors.registrationStartDate ? 'border-destructive' : ''}
                  />
                  {errors.registrationStartDate && <p className="text-sm text-destructive">{errors.registrationStartDate}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="registrationEndDate" className="text-sm font-medium text-foreground">
                    Fin de Inscripciones
                  </label>
                  <Input
                    id="registrationEndDate"
                    name="registrationEndDate"
                    type="datetime-local"
                    value={formData.registrationEndDate}
                    onChange={handleChange}
                    className={errors.registrationEndDate ? 'border-destructive' : ''}
                  />
                  {errors.registrationEndDate && <p className="text-sm text-destructive">{errors.registrationEndDate}</p>}
                </div>
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
