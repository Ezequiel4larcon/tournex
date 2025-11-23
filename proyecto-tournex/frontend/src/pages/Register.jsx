import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Gamepad2, ArrowLeft } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Mínimo 3 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        navigate('/dashboard');
      } else {
        // Manejar errores de validación del backend
        const backendErrors = {};
        if (result.error?.errors) {
          result.error.errors.forEach(err => {
            backendErrors[err.field] = err.message;
          });
        }
        setErrors({
          ...backendErrors,
          submit: result.error?.message || 'Error al registrar usuario'
        });
      }
    } catch (error) {
      setErrors({
        submit: error.message || 'Error al registrar usuario'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <Gamepad2 className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">TourneX</h1>
        </div>

        {/* Card */}
        <Card className="bg-card border-border">
          <div className="p-6 space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Crear Cuenta</h2>
            <p className="text-sm text-muted-foreground">Únete a la plataforma de torneos</p>
          </div>
          <div className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error general */}
              {errors.submit && (
                <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded">
                  {errors.submit}
                </div>
              )}

              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Nombre de Usuario
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="tu_usuario"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? "border-destructive" : ""}
                />
                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirmar Contraseña
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 mt-6" 
                disabled={isLoading}
              >
                {isLoading ? "Registrando..." : "Registrarse"}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground mt-4">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </form>
          </div>
        </Card>

        {/* Back Link */}
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mt-6 justify-center">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    </main>
  );
};

export default Register;
