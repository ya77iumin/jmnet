import React from 'react';
import { 
  Cloud, 
  FolderGit2, 
  UserCheck, 
  Terminal, 
  ShieldCheck, 
  LogOut, 
  Activity, 
  ExternalLink,
  ChevronDown,
  HardDrive
} from 'lucide-react';

export default function Navbar({ 
  user, 
  activeRepo, 
  setActiveRepo, 
  repos, 
  rateLimit, 
  activeTab, 
  setActiveTab, 
  onLogout 
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Brand & Repo Selector */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white">JMNet</span>
                <span className="rounded-md bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                  Cloud
                </span>
              </div>
              <p className="hidden text-[10px] text-slate-400 sm:block">Hosting Engine</p>
            </div>
          </div>

          {/* Active Target Repo Dropdown */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs text-slate-300 shadow-sm">
              <HardDrive className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-slate-500 hidden md:inline">Storage:</span>
              <select
                value={activeRepo}
                onChange={(e) => setActiveRepo(e.target.value)}
                className="bg-transparent font-medium text-white focus:outline-none cursor-pointer pr-1"
              >
                {repos && repos.length > 0 ? (
                  repos.map((r) => (
                    <option key={r.id} value={r.name} className="bg-slate-900 text-white">
                      {r.name} {r.private ? '(private)' : '(public)'}
                    </option>
                  ))
                ) : (
                  <option value="jmnet" className="bg-slate-900 text-white">jmnet</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'storage'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Cloud className="h-3.5 w-3.5" />
            <span>Files & Hosting</span>
          </button>

          <button
            onClick={() => setActiveTab('repos')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'repos'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="h-3.5 w-3.5" />
            <span>Repositories</span>
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'console'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>API Console</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'account'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Account</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Vault</span>
          </button>
        </nav>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {rateLimit && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-400 border border-slate-800" title="GitHub API Rate Limit Remaining">
              <Activity className="h-3 w-3 text-emerald-400" />
              <span>{rateLimit.remaining}/{rateLimit.limit}</span>
            </div>
          )}

          {user && (
            <a
              href={user.html_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-1 pr-2.5 hover:border-slate-700 transition"
              title="Open GitHub Profile"
            >
              <img
                src={user.avatar_url}
                alt={user.login}
                className="h-6 w-6 rounded-full border border-cyan-500/30"
              />
              <span className="text-xs font-medium text-slate-200 hidden md:inline">
                {user.login}
              </span>
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>
          )}

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition cursor-pointer"
            title="Lock Vault & Log Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>

      </div>

      {/* Mobile Tab Navigation */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-800/80 bg-slate-950/60 px-2 py-1.5 no-scrollbar">
        <button
          onClick={() => setActiveTab('storage')}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${
            activeTab === 'storage' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <Cloud className="h-3.5 w-3.5" /> Files
        </button>
        <button
          onClick={() => setActiveTab('repos')}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${
            activeTab === 'repos' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <FolderGit2 className="h-3.5 w-3.5" /> Repos
        </button>
        <button
          onClick={() => setActiveTab('console')}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${
            activeTab === 'console' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <Terminal className="h-3.5 w-3.5" /> API
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${
            activeTab === 'account' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" /> Account
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${
            activeTab === 'security' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Vault
        </button>
      </div>
    </header>
  );
}
