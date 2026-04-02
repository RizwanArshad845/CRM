import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/crm';
import { apiFetch } from '../utils/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  staleSession: { name: string; clockInTime: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clockIn: () => Promise<boolean>;
  clockOut: (silent?: boolean) => Promise<boolean>;
  clearStaleSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_KEY = 'crm_clock_session';
const TOKEN_KEY = 'crm_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [staleSession, setStaleSession] = useState<{ name: string; clockInTime: string } | null>(null);

  // Initial load: check for token and get user profile
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
          const res = await apiFetch('/auth/me');
          if (res.success) {
              const u = res.data;
              // Check clock-in status
              const statusRes = await apiFetch('/attendance/status');
              
              setUser({
                  id: u.id,
                  first_name: u.first_name,
                  last_name: u.last_name,
                  name: `${u.first_name} ${u.last_name}`,
                  email: u.email,
                  role_id: u.role_id,
                  role: u.role as any,
                  department: u.department,
                  status: u.status as any,
                  clockedIn: statusRes.success && statusRes.isClockedIn,
                  clockInTime: statusRes.activeSession?.clock_in
              });
          }
      } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem(TOKEN_KEY);
      } finally {
          setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Warn the user before closing the tab if still clocked in
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (user?.clockedIn) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [user?.clockedIn]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
        const res = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (res.success) {
            localStorage.setItem(TOKEN_KEY, res.token);
            const u = res.user;
            
            // Check status for this newly logged in user
            const statusRes = await apiFetch('/attendance/status', {
                headers: { 'Authorization': `Bearer ${res.token}` }
            });

            setUser({
                id: u.id,
                first_name: u.first_name,
                last_name: u.last_name,
                name: `${u.first_name} ${u.last_name}`,
                email: u.email,
                role_id: u.role_id,
                role: u.role as any,
                department: u.department,
                status: u.status as any,
                clockedIn: statusRes.success && statusRes.isClockedIn,
                clockInTime: statusRes.activeSession?.clock_in
            });
            toast.success(`Welcome back, ${u.first_name}!`);
            return true;
        }
        return false;
    } catch (error) {
        toast.error('Invalid credentials');
        return false;
    }
  };

  const logout = async () => {
    if (user?.clockedIn) {
        await clockOut(true);
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    toast.info('Logged out successfully');
  };

  const clockIn = async (): Promise<boolean> => {
    if (!user) return false;
    try {
        const res = await apiFetch('/attendance/clock-in', { method: 'POST' });
        if (res.success) {
            const now = res.data.clock_in; // Correct field name
            localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, name: user.name, clockInTime: now }));
            setUser({ ...user, clockedIn: true, clockInTime: now, clockOutTime: undefined });
            toast.success('Shift started');
            return true;
        }
        return false;
    } catch (error) {
        toast.error('Could not clock in');
        return false;
    }
  };

  const clockOut = async (silent = false): Promise<boolean> => {
    if (!user) return false;
    try {
        const res = await apiFetch('/attendance/clock-out', { method: 'POST' });
        if (res.success) {
            localStorage.removeItem(SESSION_KEY);
            setUser({ ...user, clockedIn: false, clockOutTime: res.data.clock_out });
            if (!silent) toast.success('Shift completed');
            return true;
        }
        return false;
    } catch (error) {
        if (!silent) toast.error('Could not clock out');
        return false;
    }
  };

  const clearStaleSession = () => {
    localStorage.removeItem(SESSION_KEY);
    setStaleSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, staleSession, login, logout, clockIn, clockOut, clearStaleSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}