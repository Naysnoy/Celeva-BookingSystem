import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { loginWithEmail, loginWithGoogle } from '@/services';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const emailError = touched.email && email && !isValidEmail(email) ? 'Please enter a valid email address.' : '';
  const passwordError = touched.password && password.length > 0 && password.length < 6
    ? 'Password must be at least 6 characters.'
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (emailError || passwordError) return;

    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60';
  const inputValid = 'border-border focus:border-ring';
  const inputInvalid = 'border-destructive/60 focus:ring-destructive/40';

  return (
    <div>
      <h2 className="text-[1.75rem] font-bold text-foreground mb-1 tracking-tight">Welcome back</h2>
      <p className="text-sm text-muted-foreground mb-7">Sign in to your BookingHosts account.</p>

      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <span className="mt-0.5 shrink-0 text-base">âš </span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-foreground">Email address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              className={`w-full rounded-xl border bg-background pl-10 pr-4 py-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 placeholder:text-muted-foreground/50 ${
                emailError
                  ? 'border-destructive/50 focus:ring-destructive/30'
                  : 'border-border focus:ring-[#C4A574]/30 focus:border-[#C4A574]'
              }`}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          {emailError && <p className="mt-1.5 text-xs text-destructive">{emailError}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-foreground">Password</label>
            <Link to="/forgot-password" className="text-xs text-[#C4A574] hover:underline font-semibold">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              className={`w-full rounded-xl border bg-background pl-10 pr-10 py-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 placeholder:text-muted-foreground/50 ${
                passwordError
                  ? 'border-destructive/50 focus:ring-destructive/30'
                  : 'border-border focus:ring-[#C4A574]/30 focus:border-[#C4A574]'
              }`}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {passwordError && <p className="mt-1.5 text-xs text-destructive">{passwordError}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full rounded-xl py-3 text-sm"
        >
          {loading ? 'Signing in…' : 'Continue'}
        </button>
      </form>

      <div className="mt-5">
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-3 text-muted-foreground font-medium">or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-muted disabled:opacity-50 transition-all duration-150 flex items-center justify-center gap-2.5"
        >
          <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.8 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.5-3.1-11.3-7.6l-6.6 5.1C9.6 39.5 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.3-4.5 5.7l6.2 5.2C36.8 38 44 33 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to BookingHosts?{' '}
        <Link to="/register" className="text-[#C4A574] hover:underline font-semibold">
          Create an account
        </Link>
      </p>
    </div>
  );
}
