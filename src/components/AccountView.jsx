import React from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Users, 
  BookOpen, 
  Key, 
  ShieldCheck, 
  ExternalLink,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';

export default function AccountView({ user, rateLimit }) {
  if (!user) return null;

  const permissions = {
    account: [
      'blocking', 'codespaces_user_secrets', 'copilot_editor_context', 'copilot_messages',
      'copilot_requests', 'emails', 'followers', 'gists', 'gpg_keys', 'interaction_limits',
      'keys', 'knowledge_bases', 'plan', 'private_repository_invitations', 'profile',
      'git_signing_ssh_public_keys', 'starring', 'user_events', 'user_models', 'watching'
    ],
    repository: [
      'actions', 'administration', 'artifact_metadata', 'attestations', 'code_quality',
      'codespaces', 'codespaces_lifecycle_admin', 'codespaces_metadata', 'codespaces_secrets',
      'contents', 'dependabot_secrets', 'deployments', 'discussions', 'environments',
      'issues', 'merge_queues', 'metadata', 'pages', 'pull_requests', 'repository_advisories',
      'repository_custom_properties', 'repository_hooks', 'secret_scanning_alerts', 'secrets',
      'security_events', 'statuses', 'vulnerability_alerts', 'workflows', 'actions_variables'
    ],
    organization: [
      'members', 'organization_administration', 'organization_announcement_banners',
      'organization_api_insights', 'organization_campaigns', 'organization_code_scanning_dismissal_requests',
      'organization_codespaces', 'organization_codespaces_secrets', 'organization_codespaces_settings',
      'organization_copilot_seat_management', 'organization_custom_org_roles', 'organization_custom_properties',
      'organization_custom_roles', 'organization_dependabot_secrets', 'organization_events',
      'organization_hooks', 'organization_knowledge_bases', 'organization_models',
      'organization_network_configurations', 'organization_plan', 'organization_private_registries',
      'organization_projects', 'organization_secrets', 'organization_self_hosted_runners',
      'organization_user_blocking', 'team_discussions'
    ],
    copilot: [
      'copilot_messages (Account Chat)',
      'copilot_editor_context (Account)',
      'copilot_requests (Write)',
      'organization_copilot_seat_management'
    ]
  };

  return (
    <div className="space-y-6">
      
      {/* Profile Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="h-24 w-24 rounded-2xl border-2 border-cyan-500/40 shadow-xl"
          />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name || user.login}</h2>
                <p className="text-sm text-cyan-400 font-mono">@{user.login}</p>
              </div>

              <a
                href={user.html_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-750 transition"
              >
                <span>View GitHub Profile</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {user.bio && (
              <p className="mt-2 text-xs text-slate-300 max-w-2xl">{user.bio}</p>
            )}

            {/* Quick Metadata badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span>{user.email}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                <span className="block text-lg font-bold text-white">{user.public_repos}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Public Repos</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                <span className="block text-lg font-bold text-white">{user.total_private_repos ?? 'Active'}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Private Repos</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                <span className="block text-lg font-bold text-white">{user.followers}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Followers</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                <span className="block text-lg font-bold text-white">{user.following}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Active Token Permission Scopes</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            This Personal Access Token provides full programmatic access to manage the account.
          </p>
        </div>

        {/* Repositories permissions */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Repository Permissions ({permissions.repository.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {permissions.repository.map((perm) => (
              <span
                key={perm}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1 text-[11px] font-mono text-slate-300"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                {perm}
              </span>
            ))}
          </div>
        </div>

        {/* Account permissions */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Account Permissions ({permissions.account.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {permissions.account.map((perm) => (
              <span
                key={perm}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1 text-[11px] font-mono text-slate-300"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                {perm}
              </span>
            ))}
          </div>
        </div>

        {/* Organization permissions */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            Organization Permissions ({permissions.organization.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {permissions.organization.map((perm) => (
              <span
                key={perm}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1 text-[11px] font-mono text-slate-300"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                {perm}
              </span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
