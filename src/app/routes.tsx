import { createHashRouter } from 'react-router';
import { Login } from './pages/Login';
import { ClockIn } from './pages/ClockIn';
import { Dashboard } from './pages/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

export const router = createHashRouter([
  {
    path: '/',
    Component: Login,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/clock-in',
    Component: ClockIn,
  },
  {
    path: '/dashboard',
    Component: Dashboard,
  },
]);
