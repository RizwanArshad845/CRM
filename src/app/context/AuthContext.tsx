import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types/crm';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  clockIn: () => void;
  clockOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin', department: 'admin', clockedIn: false },
  { id: '2', name: 'John Smith', email: 'john@company.com', role: 'sales', department: 'sales', clockedIn: false },
  { id: '3', name: 'Robert Wilson', email: 'robert@company.com', role: 'finance', department: 'finance', clockedIn: false },
  { id: '4', name: 'Emily Davis', email: 'emily@company.com', role: 'cst', department: 'cst', clockedIn: false },
  { id: '5', name: 'Sarah Martinez', email: 'sarah@company.com', role: 'qa', department: 'qa', clockedIn: false },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    // Simple mock authentication
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser({ ...foundUser });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const clockIn = () => {
    if (user) {
      const now = new Date().toISOString();
      setUser({
        ...user,
        clockedIn: true,
        clockInTime: now,
        clockOutTime: undefined,
      });
    }
  };

  const clockOut = () => {
    if (user) {
      const now = new Date().toISOString();
      setUser({
        ...user,
        clockedIn: false,
        clockOutTime: now,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, clockIn, clockOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}