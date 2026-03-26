import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { ManagerTaskProvider } from './context/ManagerTaskContext';
import { CSTManagerTaskProvider } from './context/CSTManagerTaskContext';
import { ClientInboxProvider } from './context/ClientInboxContext';
import { ClientProvider } from './context/ClientContext';
import { AgentTargetProvider } from './context/AgentTargetContext';

export default function App() {
  return (
    <AuthProvider>
      <EmployeeProvider>
        <ManagerTaskProvider>
          <CSTManagerTaskProvider>
            <AgentTargetProvider>
              <ClientProvider>
              <ClientInboxProvider>
                <RouterProvider router={router} />
                <Toaster />
              </ClientInboxProvider>
            </ClientProvider>
            </AgentTargetProvider>
          </CSTManagerTaskProvider>
        </ManagerTaskProvider>
      </EmployeeProvider>
    </AuthProvider>
  );
}
