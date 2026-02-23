import { useState } from 'react';
import { X, Lock, User, Loader2, UserPlus } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useRegisterUser, useAuthenticateUser } from '../hooks/useBackendAuth';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { validatePasswordStrength, validatePasswordMatch } from '../utils/passwordValidation';

interface AdminLoginProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLogin({ onClose, onSuccess }: AdminLoginProps) {
  const { login: iiLogin, loginStatus } = useInternetIdentity();
  const registerMutation = useRegisterUser();
  const authenticateMutation = useAuthenticateUser();
  
  const [mode, setMode] = useState<'login' | 'register'>('register'); // Default to register for first-time setup
  const [authMethod, setAuthMethod] = useState<'custom' | 'ii'>('custom');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }

    try {
      await authenticateMutation.mutateAsync({ username, password });
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.message || 'Invalid credentials';
      setError(errorMsg);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate username
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    // Validate password strength
    const validation = validatePasswordStrength(password);
    if (!validation.isValid) {
      setError('Password must be at least 8 characters and contain both letters and numbers');
      return;
    }

    // Validate password match
    if (!validatePasswordMatch(password, confirmPassword)) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Register the user
      await registerMutation.mutateAsync({ username, password });
      
      // Automatically log in after successful registration
      await authenticateMutation.mutateAsync({ username, password });
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
    }
  };

  const handleInternetIdentityLogin = async () => {
    setError(null);
    try {
      await iiLogin();
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.message || 'Internet Identity login failed';
      setError(errorMsg);
    }
  };

  const isLoading = 
    registerMutation.isPending || 
    authenticateMutation.isPending || 
    loginStatus === 'logging-in';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-rainbow">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Admin Login' : 'Create Admin Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Auth Method Toggle */}
        <div className="p-6 pb-0">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setAuthMethod('custom');
                setError(null);
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                authMethod === 'custom'
                  ? 'bg-gradient-rainbow text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Username/Password
            </button>
            <button
              onClick={() => {
                setAuthMethod('ii');
                setError(null);
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                authMethod === 'ii'
                  ? 'bg-gradient-rainbow text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Internet Identity
            </button>
          </div>
        </div>

        {/* Form */}
        {authMethod === 'custom' ? (
          <form 
            onSubmit={mode === 'login' ? handleCustomLogin : handleRegister} 
            className="p-6 pt-0 space-y-6"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-rainbow mb-4">
                {mode === 'login' ? (
                  <Lock className="h-8 w-8 text-white" />
                ) : (
                  <UserPlus className="h-8 w-8 text-white" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {mode === 'login' 
                  ? 'Enter your credentials to access the admin panel'
                  : 'Create your admin account to get started'
                }
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                    placeholder="Enter username"
                    required
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                    placeholder="Enter password"
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    disabled={isLoading}
                  />
                </div>
                {mode === 'register' && password && (
                  <div className="mt-3">
                    <PasswordStrengthIndicator password={password} />
                  </div>
                )}
              </div>

              {mode === 'register' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                      placeholder="Confirm password"
                      required
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                  </div>
                  {confirmPassword && !validatePasswordMatch(password, confirmPassword) && (
                    <p className="mt-2 text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-rainbow font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-blue-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-blue-600">{mode === 'login' ? 'Logging in...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <span className="text-blue-600">{mode === 'login' ? 'Log In' : 'Register'}</span>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                  setPassword('');
                  setConfirmPassword('');
                }}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                {mode === 'login' 
                  ? "Don't have an account? Register" 
                  : 'Already have an account? Log In'
                }
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-50 text-blue-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 pt-0 space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-rainbow mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">
                Use Internet Identity to securely access the admin panel
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleInternetIdentityLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-rainbow font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-blue-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-blue-600">Connecting...</span>
                  </>
                ) : (
                  <span className="text-blue-600">Login with Internet Identity</span>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-50 text-blue-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
