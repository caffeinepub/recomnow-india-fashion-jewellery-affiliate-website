import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLoginUser, useRegisterUser } from '../hooks/useBackendAuth';
import { validatePasswordStrength, validatePasswordMatch } from '../utils/passwordValidation';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface AdminLoginProps {
  onSuccess: () => void;
}

type LoginMode = 'login' | 'register';
type AuthMethod = 'custom' | 'ii';

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('custom');
  const [mode, setMode] = useState<LoginMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const { login: iiLogin, loginStatus } = useInternetIdentity();
  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();

  const isLoggingIn = loginStatus === 'logging-in';

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (mode === 'register') {
      const validation = validatePasswordStrength(password);
      if (!validation.isValid) {
        setError('Password does not meet requirements (min 8 chars, letters and numbers)');
        return;
      }
      if (!validatePasswordMatch(password, confirmPassword)) {
        setError('Passwords do not match');
        return;
      }

      try {
        await registerMutation.mutateAsync({ username, password });
        setMode('login');
        setError('');
        setPassword('');
        setConfirmPassword('');
      } catch {
        // Error handled by mutation's onError
      }
      return;
    }

    // Login mode
    try {
      await loginMutation.mutateAsync({ username, password });
      onSuccess();
    } catch {
      setError('Invalid username or password');
    }
  };

  const handleIILogin = async () => {
    setError('');
    try {
      await iiLogin();
      onSuccess();
    } catch {
      setError('Internet Identity login failed. Please try again.');
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👑</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Admin Panel</h1>
          <p className="text-navy-600 mt-1 text-sm">Sign in to manage your store</p>
        </div>

        {/* Auth Method Tabs */}
        <div className="flex rounded-lg bg-navy-50 p-1 mb-6">
          <button
            type="button"
            onClick={() => { setAuthMethod('custom'); setError(''); }}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              authMethod === 'custom'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            Username & Password
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod('ii'); setError(''); }}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              authMethod === 'ii'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            Internet Identity
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {authMethod === 'custom' && (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900"
                placeholder="Enter username"
                autoComplete="username"
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900"
                placeholder="Enter password"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                disabled={isPending}
              />
              {mode === 'register' && password && (
                <PasswordStrengthIndicator password={password} />
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  disabled={isPending}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 px-4 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {mode === 'login'
                ? (isPending ? 'Signing in...' : 'Sign In')
                : (isPending ? 'Registering...' : 'Register')}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
                disabled={isPending}
              >
                {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign In'}
              </button>
            </div>
          </form>
        )}

        {authMethod === 'ii' && (
          <div className="space-y-4">
            <p className="text-sm text-navy-600 text-center">
              Use Internet Identity to authenticate securely on the Internet Computer.
            </p>
            <button
              type="button"
              onClick={handleIILogin}
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isLoggingIn ? 'Connecting...' : 'Login with Internet Identity'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
