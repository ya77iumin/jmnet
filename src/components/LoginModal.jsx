import React, { useState } from 'react';
import { Shield, Lock, KeyRound, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { decryptToken, getSavedVault, saveCachedPassword, DEFAULT_ENCRYPTED_VAULT } from '../utils/crypto';

export default function LoginModal({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customToken, setCustomToken] = useState('');

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the vault password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const vault = getSavedVault();
      // Attempt AES-256-GCM PBKDF2 decryption
      const decryptedPat = await decryptToken(vault, password.trim());
      
      if (!decryptedPat || !decryptedPat.startsWith('gh')) {
        throw new Error('Decryption resulted in an invalid token format.');
      }

      if (remember) {
        saveCachedPassword(password.trim());
      }

      onLoginSuccess(decryptedPat, password.trim());
    } catch (err) {
      console.error('Vault decryption error:', err);
      setError('Incorrect password or corrupted vault. Default password is: 123as');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectCustomLogin = (e) => {
    e.preventDefault();
    if (!customToken.trim()) {
      setError('Please enter a GitHub Personal Access Token.');
      return;
    }
    onLoginSuccess(customToken.trim(), 'custom');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl transition-all">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 shadow-inner">
            <Shield className="h-8 w-8 animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">JMNet Cloud Portal</h2>
          <p className="mt-2 text-sm text-slate-400">
            Encrypted GitHub Backend & Hosting Engine
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 text-xs font-mono text-cyan-300 border border-slate-700">
            <Lock className="h-3 w-3" /> AES-256-GCM Encrypted Vault
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-left text-sm text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {!showAdvanced ? (
          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Vault Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter vault password (e.g. 123as)"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Remember password (Save to cache)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Decrypting Vault...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Unlock JMNet Console</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowAdvanced(true)}
                className="text-xs text-slate-500 hover:text-slate-400 underline"
              >
                Manual Token Entry / Overrides
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleDirectCustomLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Direct GitHub PAT Override
              </label>
              <input
                type="password"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder="github_pat_..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition"
            >
              Continue with Custom Token
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowAdvanced(false)}
                className="text-xs text-cyan-400 hover:underline"
              >
                Back to Password Unlock
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
