import AppRouter from './router/AppRouter';
import { ToastProvider } from './context/ToastContext';
import './index.css';

function App() {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
}

export default App;
