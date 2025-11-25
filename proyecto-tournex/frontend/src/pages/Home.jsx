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
                    <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto transform hover:scale-105 transition-transform">
                      Ir al Dashboard
                    </Button>
                  </Link>
                  <Link to="/tournaments" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto transform hover:scale-105 transition-transform">
                      Ver Torneos
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto transform hover:scale-105 transition-transform">
                      Comenzar Ahora
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto transform hover:scale-105 transition-transform">
                      Iniciar Sesión
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative animate-slide-in-right">
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-6 sm:p-8 border border-primary/30 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
              <div className="aspect-square bg-gradient-to-br from-primary/40 to-accent/40 rounded-lg flex items-center justify-center">
                <Trophy className="w-24 h-24 sm:w-32 sm:h-32 text-primary opacity-60 animate-pulse-slow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 border-t border-border">
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Características</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Todo lo que necesitas para organizar torneos profesionales
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/10 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <feature.icon className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 border-t border-border">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 hover:border-primary/50 transition-all duration-300 animate-fade-in">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl sm:text-3xl">¿Listo para competir?</CardTitle>
            <CardDescription className="text-base sm:text-lg mt-2 px-4">
              Únete a la comunidad de gamers y organizadores
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-6">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto transform hover:scale-105 transition-transform">
                Crear Cuenta
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto transform hover:scale-105 transition-transform">
                Inicia Sesión
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Home;
