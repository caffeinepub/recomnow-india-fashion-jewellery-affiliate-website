import React, { useState, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAuth } from '../hooks/useAuth';
import { useLoginUser, useRegisterUser } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { validatePasswordStrength, validatePasswordMatch } from '../utils/passwordValidation';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

type AuthMode = 'login' | 'register';
type AuthTab = 'credentials' | 'ii';

export default function AdminLogin() {
  const { login: iiLogin, loginStatus } = useInternetIdentity();
  const { setSession } = useAuth();
  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();

  const [tab, setTab] = useState<AuthTab>('credentials');
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [iiVerifying, setIiVerifying] = useState(false);
  const iiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      const validation = validatePasswordStrength(password);
      if (!validation.isValid) {
        setError('Password does not meet requirements.');
        return;
      }
      if (!validatePasswordMatch(password, confirmPassword)) {
        setError('Passwords do not match.');
        return;
      }
      try {
        await registerMutation.mutateAsync({ username, password });
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setError('');
      } catch (err: any) {
        setError(err?.message || 'Registration failed.');
      }
      return;
    }

    try {
      const token = await loginMutation.mutateAsync({ username, password });
      if (token) {
        setSession(token, username);
      } else {
        setError('Invalid username or password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
    }
  };

  const handleIILogin = async () => {
    setError('');
    setIiVerifying(true);
    if (iiTimerRef.current) clearTimeout(iiTimerRef.current);
    iiTimerRef.current = setTimeout(() => {
      setIiVerifying(false);
      setError('Verification timed out. Please try again.');
    }, 8000);
    try {
      await iiLogin();
      if (iiTimerRef.current) clearTimeout(iiTimerRef.current);
      setIiVerifying(false);
    } catch (err: any) {
      if (iiTimerRef.current) clearTimeout(iiTimerRef.current);
      setIiVerifying(false);
      setError(err?.message || 'Internet Identity login failed.');
    }
  };

  const isCredentialLoading = loginMutation.isPending || registerMutation.isPending;
  const isIILoading = loginStatus === 'logging-in' || iiVerifying;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <img
            src="/assets/generated/recomnow-logo.dim_200x200.png"
            alt="RecomNow"
            className="w-16 h-16 mx-auto mb-3 rounded-full object-cover"
          />
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to manage your store</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg border border-border overflow-hidden mb-6">
          <button
            onClick={() => setTab('credentials')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'credentials'
                ? 'bg-pink-hot text-white'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            Username &amp; Password
          </button>
          <button
            onClick={() => setTab('ii')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'ii'
                ? 'bg-pink-hot text-white'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            Internet Identity
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
            <button onClick={() => setError('')} className="ml-2 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {tab === 'credentials' ? (
          <form onSubmit={handleCredentialSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="mt-1"
              />
              {mode === 'register' && password && (
                <PasswordStrengthIndicator password={password} />
              )}
            </div>
            {mode === 'register' && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="mt-1"
                />
              </div>
            )}
            <Button
              type="submit"
              disabled={isCredentialLoading}
              className="w-full bg-pink-hot hover:bg-pink-hot-dark text-white"
            >
              {isCredentialLoading
                ? mode === 'register' ? 'Registering...' : 'Signing in...'
                : mode === 'register' ? 'Register' : 'Sign In'}
            </Button>
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="w-full text-sm text-pink-hot hover:text-pink-hot-dark transition-colors"
            >
              {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign In'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Use Internet Identity for secure, passwordless authentication.
            </p>
            <Button
              onClick={handleIILogin}
              disabled={isIILoading}
              className="w-full bg-pink-hot hover:bg-pink-hot-dark text-white"
            >
              {isIILoading ? 'Verifying...' : 'Sign in with Internet Identity'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
