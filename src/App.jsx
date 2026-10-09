import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StorageManager from './components/StorageManager';
import RepoManager from './components/RepoManager';
import ApiConsole from './components/ApiConsole';
import AccountView from './components/AccountView';
import VaultSettings from './components/VaultSettings';
import LoginModal from './components/LoginModal';
import { 
  decryptToken, 
  getSavedVault, 
  getCachedPassword, 
  clearCache,
  isValidGitHubToken 
} from './utils/crypto';
import { 
  getUserProfile, 
  listUserRepos, 
  getRateLimits 
} from './utils/github';

export default function App() {
  const [token, setToken] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // App data
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [activeRepo, setActiveRepo] = useState('jmnet');
  const [rateLimit, setRateLimit] = useState(null);
  const [activeTab, setActiveTab] = useState('storage');
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  // Initial check for cached password
  useEffect(() => {
    async function checkAutoLogin() {
      const cachedPwd = getCachedPassword();
      if (cachedPwd) {
        try {
          const vault = getSavedVault();
          const decryptedPat = await decryptToken(vault, cachedPwd);
          if (isValidGitHubToken(decryptedPat)) {
            setToken(decryptedPat);
            setIsUnlocked(true);
            await fetchAccountData(decryptedPat);
          }
        } catch (err) {
          console.warn('Auto-login decrypt failed:', err);
          clearCache();
        }
      }
      setInitializing(false);
    }

    checkAutoLogin();
  }, []);

  // Fetch account data
  const fetchAccountData = async (pat) => {
    setLoadingData(true);
    setError('');
    try {
      const [userProfile, userRepos, limits] = await Promise.all([
        getUserProfile(pat),
        listUserRepos(pat),
        getRateLimits(pat)
      ]);

      setUser(userProfile);
      setRepos(userRepos);
      setRateLimit(limits);

      // Verify jmnet exists in repos or default to first repo
      const hasJmnet = userRepos.some(r => r.name.toLowerCase() === 'jmnet');
      if (hasJmnet) {
        setActiveRepo('jmnet');
      } else if (userRepos.length > 0) {
        setActiveRepo(userRepos[0].name);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
      setError(err.message || 'Failed to connect to GitHub with this token.');
    } finally {
      setLoadingData(false);
    }
  };

  // Called when login form completes
  const handleLoginSuccess = async (pat) => {
    setToken(pat);
    setIsUnlocked(true);
    await fetchAccountData(pat);
  };

  // Lock and log out
  const handleLogout = () => {
    clearCache();
    setToken(null);
    setIsUnlocked(false);
    setUser(null);
    setRepos([]);
  };

  // Periodic rate limit refresh
  const refreshRateLimit = async () => {
    if (token) {
      const limits = await getRateLimits(token);
      setRateLimit(limits);
    }
  };

  if (initializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="text-xs text-slate-400 font-mono">Initializing JMNet Cloud Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Login Screen Gate */}
      {!isUnlocked && (
        <LoginModal onLoginSuccess={handleLoginSuccess} />
      )}

      {/* Main Authenticated Dashboard */}
      {isUnlocked && (
        <>
          <Navbar
            user={user}
            activeRepo={activeRepo}
            setActiveRepo={setActiveRepo}
            repos={repos}
            rateLimit={rateLimit}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />

          <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
            
            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-300">
                {error}
              </div>
            )}

            {loadingData && !user && (
              <div className="flex justify-center py-16">
                <div className="flex items-center gap-3 text-cyan-400 text-xs">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                  <span>Connecting to GitHub Account & Loading Storage...</span>
                </div>
              </div>
            )}

            {user && (
              <>
                {activeTab === 'storage' && (
                  <StorageManager
                    token={token}
                    owner={user.login}
                    repo={activeRepo}
                  />
                )}

                {activeTab === 'repos' && (
                  <RepoManager
                    token={token}
                    repos={repos}
                    activeRepo={activeRepo}
                    setActiveRepo={setActiveRepo}
                    onRefreshRepos={() => fetchAccountData(token)}
                  />
                )}

                {activeTab === 'console' && (
                  <ApiConsole
                    token={token}
                    owner={user.login}
                    activeRepo={activeRepo}
                  />
                )}

                {activeTab === 'account' && (
                  <AccountView
                    user={user}
                    rateLimit={rateLimit}
                  />
                )}

                {activeTab === 'security' && (
                  <VaultSettings
                    token={token}
                    onLogout={handleLogout}
                    onTokenUpdated={(newToken) => {
                      setToken(newToken);
                      fetchAccountData(newToken);
                    }}
                  />
                )}
              </>
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
            <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-mono text-[11px]">JMNet Cloud Backend • Hosting Application</span>
              <span className="text-[11px] text-slate-600">
                AES-256-GCM Zero-Knowledge Security • Ready for Vercel
              </span>
            </div>
          </footer>
        </>
      )}

    </div>
  );
}
