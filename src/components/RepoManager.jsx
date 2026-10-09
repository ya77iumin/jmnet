import React, { useState } from 'react';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Trash2, 
  ExternalLink, 
  Lock, 
  Globe, 
  Star, 
  GitFork, 
  CheckCircle2, 
  AlertTriangle,
  HardDrive
} from 'lucide-react';
import { createRepository, deleteRepository } from '../utils/github';

export default function RepoManager({ 
  token, 
  repos, 
  activeRepo, 
  setActiveRepo, 
  onRefreshRepos 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Delete repo modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);

  const filtered = (repos || []).filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRepoName.trim()) return;
    setCreating(true);
    try {
      await createRepository(token, {
        name: newRepoName.trim(),
        description: newRepoDesc.trim(),
        isPrivate: isPrivate,
        autoInit: true
      });
      setShowCreateModal(false);
      setNewRepoName('');
      setNewRepoDesc('');
      await onRefreshRepos();
    } catch (err) {
      alert('Error creating repository: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!deleteTarget || confirmName !== deleteTarget.name) return;
    setDeleting(true);
    try {
      await deleteRepository(token, deleteTarget.owner.login, deleteTarget.name);
      setDeleteTarget(null);
      setConfirmName('');
      await onRefreshRepos();
    } catch (err) {
      alert('Error deleting repository: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Repository Controller</h2>
          <p className="mt-1 text-xs text-slate-400">
            Manage, create, and configure repositories across your GitHub account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Repository</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search repositories by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {/* Repos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((repo) => {
          const isActive = activeRepo === repo.name;

          return (
            <div
              key={repo.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-md ${
                isActive
                  ? 'border-cyan-500/50 bg-slate-900/90 ring-1 ring-cyan-500/30'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <h3 className="font-semibold text-sm text-white truncate max-w-[180px]">
                      {repo.name}
                    </h3>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                    repo.private 
                      ? 'border-amber-500/20 bg-amber-500/10 text-amber-300' 
                      : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                  }`}>
                    {repo.private ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
                    <span>{repo.private ? 'Private' : 'Public'}</span>
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                  {repo.description || 'No description provided.'}
                </p>

                {/* Metrics */}
                <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-500">
                  {repo.language && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-cyan-400" />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    {repo.forks_count}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveRepo(repo.name)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
                  }`}
                >
                  <HardDrive className="h-3 w-3" />
                  <span>{isActive ? 'Active Storage' : 'Set Active'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="View on GitHub"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <button
                    onClick={() => {
                      setDeleteTarget(repo);
                      setConfirmName('');
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                    title="Delete repository"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Repo Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Create New Repository</h3>
            <p className="text-xs text-slate-400 mt-1">
              Create a new Git repository directly under your GitHub account.
            </p>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Repository Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. project-assets"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Short description"
                  value={newRepoDesc}
                  onChange={(e) => setNewRepoDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="privRepo"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500"
                />
                <label htmlFor="privRepo" className="text-xs text-slate-300 cursor-pointer">
                  Make repository private
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 cursor-pointer"
                >
                  {creating ? 'Creating...' : 'Create Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Repo Safeguard Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-base font-semibold text-white">Delete Repository</h3>
            </div>
            
            <p className="text-xs text-slate-300 mt-2">
              This action <strong className="text-red-400">CANNOT</strong> be undone. It will permanently delete the repository <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-300">{deleteTarget.name}</code>, all its code, issues, and hosting links.
            </p>

            <form onSubmit={handleDelete} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Type <strong className="text-white">{deleteTarget.name}</strong> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={deleteTarget.name}
                  className="w-full rounded-xl border border-red-500/40 bg-slate-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting || confirmName !== deleteTarget.name}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
