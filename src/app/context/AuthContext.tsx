import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/crm';

interface AuthContextType {
  user: User | null;
  staleSession: { name: string; clockInTime: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  clockIn: () => void;
  clockOut: () => void;
  clearStaleSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_KEY = 'crm_clock_session';

// Mock users for demonstration
const mockUsers: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@company.com', role: 'admin', department: 'admin', clockedIn: false },
  { id: 2, name: 'John Smith', email: 'john@company.com', role: 'sales', department: 'sales', clockedIn: false },
  { id: 3, name: 'Robert Wilson', email: 'robert@company.com', role: 'finance', department: 'finance', clockedIn: false },
  { id: 4, name: 'Emily Davis', email: 'emily@company.com', role: 'cst', department: 'cst', clockedIn: false },
  { id: 5, name: 'Sarah Martinez', email: 'sarah@company.com', role: 'qa', department: 'qa', clockedIn: false },
  { id: 6, name: 'Ahmed Khan', email: 'ahmed@company.com', role: 'sales_manager', department: 'sales', clockedIn: false },
  { id: 7, name: 'Olivia Park', email: 'olivia@company.com', role: 'cst_manager', department: 'cst', clockedIn: false },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [staleSession, setStaleSession] = useState<{ name: string; clockInTime: string } | null>(null);

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

  const login = (email: string, password: string): boolean => {
    const foundUser = mockUsers.find(u => u.email === email);
    if (!foundUser) return false;

    // Check if this user has a stale (never clocked-out) session in localStorage
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as { userId: number; name: string; clockInTime: string };
      if (saved.userId === foundUser.id) {
        setStaleSession({ name: saved.name, clockInTime: saved.clockInTime });
      }
    }

    setUser({ ...foundUser });
    return true;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const clockIn = () => {
    if (!user) return;
    const now = new Date().toISOString();
    // Persist to localStorage so we can detect missed clock-outs
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, name: user.name, clockInTime: now }));
    setUser({ ...user, clockedIn: true, clockInTime: now, clockOutTime: undefined });
  };

  const clockOut = () => {
    if (!user) return;
    // Clear the persisted session — they clocked out properly
    localStorage.removeItem(SESSION_KEY);
    setUser({ ...user, clockedIn: false, clockOutTime: new Date().toISOString() });
  };

  const clearStaleSession = () => {
    localStorage.removeItem(SESSION_KEY);
    setStaleSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, staleSession, login, logout, clockIn, clockOut, clearStaleSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}