import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Clock, CheckCircle, LogOut, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function ClockIn() {
  const { user, staleSession, clockIn, clockOut, logout, clearStaleSession } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoursWorked, setHoursWorked] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());

      if (user.clockedIn && user.clockInTime) {
        const clockInDate = new Date(user.clockInTime);
        const diff = (new Date().getTime() - clockInDate.getTime()) / 1000 / 60 / 60;
        setHoursWorked(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleClockIn = () => {
    clockIn();
    toast.success('Clocked in successfully!');
  };

  const handleClockOut = () => {
    if (confirm('Are you sure you want to clock out?')) {
      clockOut();
      toast.success('Clocked out successfully!');
    }
  };

  const handleAccessPortal = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor(((hours - h) * 60 - m) * 60);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-full">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground capitalize">{user.role} • {user.department}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Main Clock Card */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${user.clockedIn ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <Clock className={`h-12 w-12 ${user.clockedIn ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
              </div>
            </div>
            <CardTitle className="text-3xl">{formatTime(currentTime)}</CardTitle>
            <CardDescription className="text-base">{formatDate(currentTime)}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status */}
            <div className="text-center p-4 bg-muted rounded-lg">
              {user.clockedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Clocked In</span>
                  </div>
                  {user.clockInTime && (
                    <p className="text-sm text-muted-foreground">
                      Started at {new Date(user.clockInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Hours Worked</p>
                    <p className="text-2xl font-bold">{formatHours(hoursWorked)}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">Not Clocked In</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You must clock in to access your portal
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {!user.clockedIn ? (
                <Button
                  onClick={handleClockIn}
                  className="w-full h-14 text-lg"
                  size="lg"
                >
                  <Clock className="h-5 w-5 mr-2" />
                  Clock In
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleAccessPortal}
                    className="w-full h-14 text-lg"
                    size="lg"
                  >
                    Access Portal
                  </Button>
                  <Button
                    onClick={handleClockOut}
                    variant="outline"
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Clock Out
                  </Button>
                </>
              )}
            </div>

            {/* Portal Access Warning */}
            {!user.clockedIn && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                  ⚠️ Portal access is locked until you clock in
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stale session warning */}
        {staleSession && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Missed Clock-Out Detected</p>
                <p className="text-amber-700 dark:text-amber-300 text-xs mt-0.5">
                  You closed the app without clocking out during your last session.<br />
                  Last clock-in: <span className="font-mono font-bold">{new Date(staleSession.clockInTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </p>
              </div>
              <button onClick={clearStaleSession} className="text-amber-600 hover:text-amber-800 text-xs underline shrink-0">Dismiss</button>
            </div>
          </div>
        )}

        {/* Daily Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {user.clockInTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clock In:</span>
                  <span className="font-medium">
                    {new Date(user.clockInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              {user.clockOutTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clock Out:</span>
                  <span className="font-medium">
                    {new Date(user.clockOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              {!user.clockInTime && (
                <p className="text-center text-muted-foreground py-2">
                  No attendance recorded today
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
