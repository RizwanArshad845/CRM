import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Building2, Lock, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      toast.success('Login successful!');
      navigate('/clock-in');
    } else {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #7c3aed 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">CRM Pro</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Manage your business<br />
            <span className="text-blue-200">smarter, faster.</span>
          </h1>
          <p className="text-blue-100 text-base leading-relaxed max-w-sm">
            A centralised platform for sales, finance, and customer success teams to collaborate and grow.
          </p>
          <div className="flex gap-6 pt-2">
            {[['500+', 'Clients'], ['98%', 'Uptime'], ['24/7', 'Support']].map(([val, lbl]) => (
              <div key={lbl}>
                <p className="text-2xl font-bold">{val}</p>
                <p className="text-blue-200 text-sm">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-200 text-sm">© 2025 CRM Pro. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">CRM Pro</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Remember me
                </label>
              </div>
              <Button variant="link" type="button" className="px-0 text-sm text-blue-600">
                Forgot password?
              </Button>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold gap-2">
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-y-1.5 text-xs text-gray-600 dark:text-gray-300">
              <span>admin@company.com</span><span className="text-gray-400">Admin</span>
              <span>john@company.com</span><span className="text-gray-400">Sales Agent</span>
              <span>ahmed@company.com</span><span className="text-gray-400">Sales Manager</span>
              <span>robert@company.com</span><span className="text-gray-400">Finance</span>
              <span>emily@company.com</span><span className="text-gray-400">CST Agent</span>
              <span>olivia@company.com</span><span className="text-gray-400">CST Manager</span>
            </div>
            <p className="mt-2.5 text-xs text-gray-400 italic">Password: any</p>
          </div>
        </div>
      </div>
    </div>
  );
}