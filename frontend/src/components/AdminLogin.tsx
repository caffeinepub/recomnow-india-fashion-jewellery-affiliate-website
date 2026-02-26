import React, { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLoginUser, useRegisterUser } from '../hooks/useBackendAuth';
import { useQueryClient } from '@tanstack/react-query';
import { validatePasswordStrength, validatePasswordMatch } from '../utils/passwordValidation';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import Spinner from './Spinner';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const { login, loginStatus } = useInternetIdentity();
  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'custom' | 'ii'>('custom');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [iiVerifying, setIIVerifying] = useState(false);

  const iiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (iiTimeoutRef.current) clearTimeout(iiTimeoutRef.current);
    };
  }, []);

  const isLoggingInII = loginStatus === 'logging-in';

  const handleIILogin = async () => {
    setError('');
    setIIVerifying(false);

    try {
      await login();

      // Start verifying — set a timeout guard
      setIIVerifying(true);
      iiTimeoutRef.current = setTimeout(() => {
        setIIVerifying(false);
        setError('Unable to verify admin access. Please try again.');
      }, 8000);

      // Invalidate so AdminPage re-checks admin status
      await queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });

      // Clear timeout — verification handed off to AdminPage
      if (iiTimeoutRef.current) {
        clearTimeout(iiTimeoutRef.current);
        iiTimeoutRef.current = null;
      }
      setIIVerifying(false);
      onSuccess();
    } catch (err: unknown) {
      if (iiTimeoutRef.current) {
        clearTimeout(iiTimeoutRef.current);
        iiTimeoutRef.current = null;
      }
      setIIVerifying(false);

      const msg = err instanceof Error ? err.message : String(err);
      if (msg === 'User is already authenticated') {
        await queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
        onSuccess();
      } else {
        setError('Internet Identity login failed. Please try again.');
      }
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      const result = validatePasswordStrength(password);
      if (!result.isValid) {
        setError('Password is too weak. Use at least 8 characters with letters and numbers.');
        return;
      }
      const passwordsMatch = validatePasswordMatch(password, confirmPassword);
      if (!passwordsMatch) {
        setError('Passwords do not match.');
        return;
      }

      try {
        await registerMutation.mutateAsync({ username, password });
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setError('');
      } catch {
        // Error shown via toast in useRegisterUser
      }
      return;
    }

    // Login mode
    try {
      await loginMutation.mutateAsync({ username, password });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      onSuccess();
    } catch {
      setError('Invalid username or password.');
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;
  const isIIBusy = isLoggingInII || iiVerifying;

  return (
    <div className="min-h-screen bg-navy-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-navy-900 px-8 py-6 text-center">
          <div className="text-3xl mb-2">🛡️</div>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-navy-300 text-sm mt-1">Sign in to manage your store</p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-navy-100">
          <button
            onClick={() => { setActiveTab('custom'); setError(''); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'custom'
                ? 'text-gold-600 border-b-2 border-gold-500 bg-gold-50'
                : 'text-navy-500 hover:text-navy-700'
            }`}
          >
            Username &amp; Password
          </button>
          <button
            onClick={() => { setActiveTab('ii'); setError(''); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'ii'
                ? 'text-gold-600 border-b-2 border-gold-500 bg-gold-50'
                : 'text-navy-500 hover:text-navy-700'
            }`}
          >
            Internet Identity
          </button>
        </div>

        <div className="px-8 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
              <button
                onClick={() => setError('')}
                className="ml-2 underline text-red-600 hover:text-red-800 text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Custom auth tab */}
          {activeTab === 'custom' && (
            <div>
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'login' ? 'bg-navy-900 text-white' : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => { setMode('register'); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'register' ? 'bg-navy-900 text-white' : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    disabled={isPending}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 disabled:opacity-60"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={isPending}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 disabled:opacity-60"
                    placeholder="Enter password"
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
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      disabled={isPending}
                      className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 disabled:opacity-60"
                      placeholder="Confirm password"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isPending && <Spinner />}
                  {mode === 'login'
                    ? (isPending ? 'Signing in…' : 'Sign In')
                    : (isPending ? 'Registering…' : 'Create Account')}
                </button>
              </form>
            </div>
          )}

          {/* Internet Identity tab */}
          {activeTab === 'ii' && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🔐</div>
              <h3 className="text-navy-800 font-semibold mb-2">Internet Identity</h3>
              <p className="text-navy-500 text-sm mb-6">
                Use your Internet Identity to securely authenticate as admin.
              </p>

              {iiVerifying && (
                <div className="flex items-center justify-center gap-2 mb-4 text-navy-600 text-sm">
                  <Spinner />
                  <span>Verifying admin access…</span>
                </div>
              )}

              <button
                onClick={handleIILogin}
                disabled={isIIBusy}
                className="w-full py-3 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isIIBusy ? (
                  <>
                    <Spinner />
                    {isLoggingInII ? 'Connecting…' : 'Verifying…'}
                  </>
                ) : (
                  'Sign in with Internet Identity'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
