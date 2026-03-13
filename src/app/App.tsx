import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { EmployeeProvider } from './context/EmployeeContext';

export default function App() {
  return (
    <AuthProvider>
      <EmployeeProvider>
        <RouterProvider router={router} />
        <Toaster />
      </EmployeeProvider>
    </AuthProvider>
  );
}
