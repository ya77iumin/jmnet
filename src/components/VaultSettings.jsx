import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  RotateCcw, 
  Trash2, 
  Check, 
  AlertCircle, 
  Layers, 
  ExternalLink 
} from 'lucide-react';
import { 
  encryptToken, 
  saveVault, 
  clearCache, 
  saveCachedPassword,
  getSavedVault 
} from '../utils/crypto';

export default function VaultSettings({ token, onLogout, onTokenUpdated }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState({ text: '', type: '' });

  const [newToken, setNewToken] = useState('');
  const [tokenMessage, setTokenMessage] = useState({ text: '', type: '' });

  // Handle changing vault password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setPwdMessage({ text: 'New password must be at least 4 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    try {
      // Re-encrypt current token with new password
      const newVault = await encryptToken(token, newPassword);
      saveVault(newVault);
      saveCachedPassword(newPassword);
      setPwdMessage({ text: 'Vault re-encrypted and saved with new password!', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdMessage({ text: 'Failed to re-encrypt vault: ' + err.message, type: 'error' });
    }
  };

  // Handle updating PAT
  const handleUpdateToken = async (e) => {
    e.preventDefault();
    if (!newToken.trim()) return;

    try {
      const pwd = prompt('Enter your vault password to encrypt the new token:');
      if (!pwd) return;

      const newVault = await encryptToken(newToken.trim(), pwd);
      saveVault(newVault);
      saveCachedPassword(pwd);
      setTokenMessage({ text: 'New token encrypted and stored successfully!', type: 'success' });
      onTokenUpdated(newToken.trim());
      setNewToken('');
    } catch (err) {
      setTokenMessage({ text: 'Error updating token: ' + err.message, type: 'error' });
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Clear cached password? You will need to enter your password on next visit.')) {
      clearCache();
      alert('Password cache cleared.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Security & Encryption Vault</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero-knowledge client-side encryption powered by Web Crypto API (AES-256-GCM + PBKDF2).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Change Password Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Change Vault Password</h3>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Re-encrypt your stored GitHub PAT with a new password. The cache will be updated automatically.
          </p>

          {pwdMessage.text && (
            <div className={`mb-4 rounded-xl p-3 text-xs flex items-center gap-2 border ${
              pwdMessage.type === 'success' 
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
                : 'bg-red-950/30 border-red-500/30 text-red-300'
            }`}>
              {pwdMessage.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{pwdMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition cursor-pointer"
            >
              Update Vault Password
            </button>
          </form>
        </div>

        {/* Update Token Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Rotate GitHub PAT</h3>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Provide a new GitHub Personal Access Token to re-encrypt and store in your local vault.
          </p>

          {tokenMessage.text && (
            <div className={`mb-4 rounded-xl p-3 text-xs flex items-center gap-2 border ${
              tokenMessage.type === 'success' 
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
                : 'bg-red-950/30 border-red-500/30 text-red-300'
            }`}>
              {tokenMessage.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{tokenMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateToken} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">New GitHub Token</label>
              <input
                type="password"
                required
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                placeholder="github_pat_..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition cursor-pointer"
            >
              Encrypt & Save New Token
            </button>
          </form>

          {/* Cache Management */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Clear cached password from browser:</span>
            <button
              onClick={handleClearCache}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear Cache</span>
            </button>
          </div>
        </div>

      </div>

      {/* Vercel Deployment Instructions */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Deploying to Vercel</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-400">
          <p>
            This application is ready to deploy directly to <strong className="text-white">Vercel</strong> with 1-click zero configuration:
          </p>

          <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-300">
            <li>Push this repository code to GitHub or import <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded font-mono">ya77iumin/jmnet</code> in Vercel.</li>
            <li>Vercel automatically detects the Vite framework and runs <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded font-mono">npm run build</code>.</li>
            <li>The API token is securely encrypted inside the vault. The site is protected by password <strong className="text-white">123as</strong>.</li>
            <li>Once you enter the password, it is cached in your browser so you will not need to re-enter it repeatedly!</li>
          </ol>
        </div>
      </div>

    </div>
  );
}
