import { Button } from '../ui/button';
import { Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';

interface DashboardHeaderProps {
    title: string;
    bgColor: string; // e.g. "bg-[#27AE60]"
}

export function DashboardHeader({ title, bgColor }: DashboardHeaderProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className={`border-b ${bgColor} text-white`}>
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{title}</h1>
                        <p className="text-sm opacity-90">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="secondary" size="sm" onClick={() => navigate('/clock-in')}>
                            <Clock className="h-4 w-4 mr-2" />
                            Attendance
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
