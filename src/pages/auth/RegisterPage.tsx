import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { registerWithEmail, loginWithGoogle } from '@/services';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getPasswordStrength(pwd: string): { label: string; width: string; color: string } {
  if (pwd.length === 0) return { label: '', width: '0%', color: '' };
  if (pwd.length < 6)  return { label: 'Too short', width: '20%',  color: 'hsl(0 72% 58%)' };
  if (pwd.length < 8)  return { label: 'Weak',      width: '40%',  color: 'hsl(30 85% 55%)' };
  const hasUpper  = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
  const score = [hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  if (score === 0) return { label: 'Fair',   width: '55%',  color: 'hsl(45 80% 50%)' };
  if (score === 1) return { label: 'Good',   width: '72%',  color: 'hsl(80 55% 45%)' };
  return             { label: 'Strong',  width: '100%', color: 'hsl(142 60% 38%)' };
}

export function RegisterPage() {
  const [displayName, setDisplayName]     = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [touched, setTouched]             = useState({ name: false, email: false, password: false, confirm: false });
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const navigate = useNavigate();

  const nameError     = touched.name     && displayName.trim().length < 2      ? 'Please enter your full name.' : '';
  const emailError    = touched.email    && email && !isValidEmail(email)       ? 'Please enter a valid email address.' : '';
  const passwordError = touched.password && password.length > 0 && password.length < 6 ? 'Password must be at least 6 characters.' : '';
  const confirmError  = touched.confirm  && confirmPassword && confirmPassword !== password ? 'Passwords do not match.' : '';

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (nameError || emailError || passwordError || confirmError) return;
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setError('');
    setLoading(true);
    try {
      await registerWithEmail(email, password, displayName);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
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

  const inputBase    = 'w-full rounded-xl border bg-background pl-10 pr-4 py-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 placeholder:text-muted-foreground/50';
  const inputValid   = 'border-border focus:ring-[#C4A574]/30 focus:border-[#C4A574]';
  const inputInvalid = 'border-destructive/50 focus:ring-destructive/30';

  return (
    <div>
      <h2 className="text-[1.75rem] font-bold text-foreground mb-1 tracking-tight">Create your account</h2>
      <p className="text-sm text-muted-foreground mb-7">Start managing your properties in minutes.</p>

      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <span className="mt-0.5 shrink-0 text-base">⚠</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full name */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              className={`${inputBase} ${nameError ? inputInvalid : inputValid}`}
              placeholder="Juan Dela Cruz"
              autoComplete="name"
            />
          </div>
          {nameError && <p className="mt-1.5 text-xs text-destructive">{nameError}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              className={`${inputBase} ${emailError ? inputInvalid : inputValid}`}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          {emailError && <p className="mt-1.5 text-xs text-destructive">{emailError}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              className={`${inputBase} pr-10 ${passwordError ? inputInvalid : inputValid}`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Password strength bar */}
          {password.length > 0 && (
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: strength.width, background: strength.color }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
            </div>
          )}
          {passwordError && <p className="mt-1 text-xs text-destructive">{passwordError}</p>}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
              className={`${inputBase} pr-10 ${confirmError ? inputInvalid : inputValid}`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {confirmError && <p className="mt-1.5 text-xs text-destructive">{confirmError}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full rounded-xl py-3 text-sm"
        >
          {loading ? 'Creating account…' : 'Create account'}
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
          <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.8 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.5-3.1-11.3-7.6l-6.6 5.1C9.6 39.5 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.3-4.5 5.7l6.2 5.2C36.8 38 44 33 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-[#C4A574] hover:underline font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}

