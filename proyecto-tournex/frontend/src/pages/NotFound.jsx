import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Gamepad2, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Gamepad2 className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-3">Página no encontrada</h2>
        <p className="text-muted-foreground mb-8">
          La página que buscas no existe o ha sido movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
          <Link to="/tournaments">
            <Button variant="outline" className="w-full sm:w-auto hover:border-primary transition-colors">
              Ver Torneos
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
