import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
    role: 'project_manager',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await signUp(form.email, form.password, {
          name: form.name,
          organization: form.organization,
          role: form.role,
        });
        toast.success('Account created! You can now sign in.');
      }
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none fixed inset-0" style={{ background: 'var(--gradient-glow)' }} />
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-bg">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-heading text-2xl font-bold gradient-text">ProjectPredict AI</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="mb-1 font-heading text-xl font-semibold text-foreground">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            {isLogin ? 'Sign in to your account' : 'Get started with ProjectPredict AI'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="John Doe" required />
                </div>
                <div>
                  <Label htmlFor="organization">Organization</Label>
                  <Input id="organization" value={form.organization} onChange={e => update('organization', e.target.value)} placeholder="Acme Corp" required />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={form.role}
                    onChange={e => update('role', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="project_manager">Project Manager</option>
                    <option value="analyst">Analyst</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
