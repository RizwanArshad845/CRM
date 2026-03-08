import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from './admin/AdminDashboard';
import { SalesDashboard } from './sales/SalesDashboard';
import { FinanceDashboard } from './finance/FinanceDashboard';
import { CSTDashboard } from './cst/CSTDashboard';
import { QADashboard } from './qa/QADashboard';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!user.clockedIn) {
      navigate('/clock-in');
      return;
    }
  }, [user, navigate]);

  if (!user || !user.clockedIn) {
    return null;
  }

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'sales':
      return <SalesDashboard />;
    case 'finance':
      return <FinanceDashboard />;
    case 'cst':
      return <CSTDashboard />;
    default:
      return <div>Unknown role</div>;
  }
}