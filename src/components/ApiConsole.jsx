import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Code, 
  Clock, 
  Send, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { executeRawApi } from '../utils/github';

export default function ApiConsole({ token, owner, activeRepo }) {
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/user');
  const [requestBody, setRequestBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [copied, setCopied] = useState(false);

  const presets = [
    { label: 'Get User Profile', method: 'GET', endpoint: '/user', body: '' },
    { label: 'List All Repositories', method: 'GET', endpoint: '/user/repos?per_page=20', body: '' },
    { label: 'Get API Rate Limits', method: 'GET', endpoint: '/rate_limit', body: '' },
    { label: 'List User Emails', method: 'GET', endpoint: '/user/emails', body: '' },
    { label: 'List SSH Public Keys', method: 'GET', endpoint: '/user/keys', body: '' },
    { label: 'List User Gists', method: 'GET', endpoint: '/gists', body: '' },
    { label: 'List Starred Repos', method: 'GET', endpoint: '/user/starred', body: '' },
    { label: 'List Repo Workflows', method: 'GET', endpoint: `/repos/${owner}/${activeRepo}/actions/workflows`, body: '' },
    { label: 'List Repo Commits', method: 'GET', endpoint: `/repos/${owner}/${activeRepo}/commits?per_page=10`, body: '' },
    { label: 'Create Gist (Test)', method: 'POST', endpoint: '/gists', body: JSON.stringify({
      description: "Created via JMNet",
      public: false,
      files: { "test.txt": { content: "Hello from JMNet Cloud" } }
    }, null, 2) },
  ];

  const handleApplyPreset = (preset) => {
    setMethod(preset.method);
    setEndpoint(preset.endpoint);
    setRequestBody(preset.body || '');
  };

  const handleExecute = async (e) => {
    e.preventDefault();
    if (!endpoint.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      let parsedBody = null;
      if (requestBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
        try {
          parsedBody = JSON.parse(requestBody);
        } catch {
          parsedBody = requestBody;
        }
      }

      const result = await executeRawApi(token, method, endpoint.trim(), parsedBody);
      setResponse(result);
    } catch (err) {
      setResponse({
        status: 'Error',
        ok: false,
        duration: 0,
        data: { error: err.message }
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">REST API Console & Controller</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute arbitrary requests with full account token permissions against GitHub API v3.
            </p>
          </div>
        </div>

        {/* Quick presets */}
        <div className="mt-4 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Request Form */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
        <form onSubmit={handleExecute} className="space-y-4">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* HTTP Method */}
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-cyan-400 focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            {/* URL / Endpoint */}
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">
                https://api.github.com
              </span>
              <input
                type="text"
                required
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/user or /repos/{owner}/{repo}"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-48 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Execute</span>
                </>
              )}
            </button>
          </div>

          {/* JSON Body editor for POST/PUT/PATCH */}
          {['POST', 'PUT', 'PATCH'].includes(method) && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                JSON Request Body
              </label>
              <textarea
                rows={6}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder="{\n  &quot;key&quot;: &quot;value&quot;\n}"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          )}

        </form>
      </div>

      {/* Response Display Card */}
      {response && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                response.ok 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {response.status} {response.statusText}
              </span>

              <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                <Clock className="h-3 w-3" />
                {response.duration}ms
              </span>
            </div>

            <button
              onClick={copyResponse}
              className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="max-h-[500px] overflow-y-auto p-5 font-mono text-xs text-cyan-200 bg-slate-950/90 whitespace-pre-wrap">
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
}
