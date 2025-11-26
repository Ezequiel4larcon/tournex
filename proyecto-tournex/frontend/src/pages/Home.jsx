import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Trophy, Users, Zap, Gamepad2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { user } = useAuth();
  
  const features = [
    {
      icon: Trophy,
      title: 'Gestión de Torneos',
      description: 'Crea y gestiona torneos con bracket automático',
    },
    {
      icon: Zap,
      title: 'Resultados en Tiempo Real',
      description: 'Reporta y valida resultados instantáneamente',
    },
    {
      icon: Gamepad2,
      title: 'Dashboard',
      description: 'Estadísticas y monitoreo completo del torneo',
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 md:space-y-8 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
              La plataforma completa para gestionar torneos
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Organiza, gestiona y participa en torneos de esports con herramientas profesionales. 
              Desde registración hasta resultados finales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto transition-colors">
                      Ir al Dashboard
                    </Button>
                  </Link>
                  <Link to="/tournaments" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto transition-colors">
                      Ver Torneos
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto transition-colors">
                      Comenzar Ahora
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto transition-colors">
                      Iniciar Sesión
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 sm:p-8 border border-border transition-colors hover:border-primary/30">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-24 h-24 sm:w-32 sm:h-32 text-primary opacity-40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Características</h3>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas para organizar torneos profesionales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 hover:border-primary transition-all duration-300 group"
            >
              <div className="mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h4>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary rounded-2xl p-8 sm:p-12 text-center transition-all duration-300">
          <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">¿Listo para competir?</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Únete a la comunidad de gamers y organizadores
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto px-8 transition-colors">
                Crear Cuenta
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 transition-colors">
                Inicia Sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
