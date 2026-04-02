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
import { FinanceProvider } from './context/FinanceContext';
import { RecordingProvider } from './context/RecordingContext';
import { CSTScheduleProvider } from './context/CSTScheduleContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { PerformanceProvider } from './context/PerformanceContext';

export default function App() {
  return (
    <AuthProvider>
      <EmployeeProvider>
        <ManagerTaskProvider>
          <CSTManagerTaskProvider>
            <AgentTargetProvider>
              <FinanceProvider>
                <RecordingProvider>
                  <CSTScheduleProvider>
                    <PerformanceProvider>
                      <AttendanceProvider>
                        <ClientProvider>
                          <ClientInboxProvider>
                            <RouterProvider router={router} />
                            <Toaster />
                          </ClientInboxProvider>
                        </ClientProvider>
                      </AttendanceProvider>
                    </PerformanceProvider>
                  </CSTScheduleProvider>
                </RecordingProvider>
              </FinanceProvider>
            </AgentTargetProvider>
          </CSTManagerTaskProvider>
        </ManagerTaskProvider>
      </EmployeeProvider>
    </AuthProvider>
  );
}
