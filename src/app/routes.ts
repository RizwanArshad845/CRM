import { createBrowserRouter } from 'react-router';
import { Login } from './pages/Login';
import { ClockIn } from './pages/ClockIn';
import { Dashboard } from './pages/Dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
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
