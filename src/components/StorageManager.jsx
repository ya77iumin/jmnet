import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  File, 
  Folder, 
  FolderPlus, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Eye, 
  Edit3, 
  RefreshCw, 
  Sparkles, 
  ArrowLeft,
  FileCode,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  Link2,
  Code2
} from 'lucide-react';
import { 
  listRepoContents, 
  uploadOrUpdateFile, 
  deleteRepoFile, 
  getFileContent, 
  getHostingUrls 
} from '../utils/github';

export default function StorageManager({ token, owner, repo }) {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState('uploads');
  const [recentUpload, setRecentUpload] = useState(null);
  
  // File Preview & Editor Modal
  const [previewFile, setPreviewFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [savingFile, setSavingFile] = useState(false);
  
  // New File Modal
  const [newFileModal, setNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileText, setNewFileText] = useState('');

  const fileInputRef = useRef(null);

  // Load files
  const loadContents = async (path = currentPath) => {
    if (!owner || !repo) return;
    setLoading(true);
    setError('');
    try {
      const data = await listRepoContents(token, owner, repo, path);
      // Sort folders first, then files alphabetically
      const sorted = [...data].sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'dir' ? -1 : 1;
      });
      setItems(sorted);
      setCurrentPath(path);
    } catch (err) {
      setError(err.message || 'Failed to load files');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContents('');
  }, [owner, repo]);

  // Copy to clipboard helper
  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  // Handle file uploads
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await fileToBase64(file);
        
        // Target path: e.g. "uploads/image.png"
        const prefix = uploadFolder ? uploadFolder.replace(/^\/+|\/+$/g, '') + '/' : '';
        const targetPath = `${prefix}${file.name}`;
        
        await uploadOrUpdateFile(
          token, 
          owner, 
          repo, 
          targetPath, 
          base64, 
          `Host file: ${file.name} via JMNet Cloud`
        );

        const hosting = getHostingUrls(owner, repo, targetPath);
        setRecentUpload({
          name: file.name,
          path: targetPath,
          size: file.size,
          ...hosting
        });
      }

      await loadContents(currentPath);
    } catch (err) {
      setError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Convert File object to raw base64 string
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result;
        // Strip data:mime/type;base64, header
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Delete file
  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}" from ${repo}?`)) {
      return;
    }
    setLoading(true);
    try {
      await deleteRepoFile(token, owner, repo, item.path, item.sha);
      await loadContents(currentPath);
    } catch (err) {
      setError(err.message || 'Failed to delete file');
    } finally {
      setLoading(false);
    }
  };

  // Preview / Edit file
  const handleOpenPreview = async (item) => {
    setPreviewFile(item);
    setLoadingContent(true);
    setEditingContent(false);
    
    const ext = item.name.split('.').pop()?.toLowerCase();
    const isText = ['txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'yml', 'yaml', 'env', 'sh', 'xml'].includes(ext);

    if (isText) {
      try {
        const fileData = await getFileContent(token, owner, repo, item.path);
        // GitHub API returns Base64 content
        const raw = atob(fileData.content.replace(/\s/g, ''));
        setFileContent(raw);
      } catch (err) {
        setFileContent('Error loading text content: ' + err.message);
      }
    } else {
      setFileContent('');
    }
    setLoadingContent(false);
  };

  // Save edited text file
  const handleSaveEdit = async () => {
    if (!previewFile) return;
    setSavingFile(true);
    try {
      const base64 = btoa(fileContent);
      await uploadOrUpdateFile(
        token, 
        owner, 
        repo, 
        previewFile.path, 
        base64, 
        `Update ${previewFile.name} via JMNet Editor`, 
        previewFile.sha
      );
      setEditingContent(false);
      await loadContents(currentPath);
      setPreviewFile(null);
    } catch (err) {
      alert('Failed to save file: ' + err.message);
    } finally {
      setSavingFile(false);
    }
  };

  // Create new text file
  const handleCreateFile = async (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    setLoading(true);
    try {
      const targetPath = currentPath ? `${currentPath}/${newFileName.trim()}` : newFileName.trim();
      const base64 = btoa(newFileText);
      await uploadOrUpdateFile(
        token,
        owner,
        repo,
        targetPath,
        base64,
        `Create ${newFileName.trim()} via JMNet`
      );
      setNewFileModal(false);
      setNewFileName('');
      setNewFileText('');
      await loadContents(currentPath);
    } catch (err) {
      alert('Failed to create file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get File Icon
  const getFileIcon = (item) => {
    if (item.type === 'dir') return <Folder className="h-5 w-5 text-amber-400" />;
    const ext = item.name.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) {
      return <FileImage className="h-5 w-5 text-emerald-400" />;
    }
    if (['mp4', 'webm', 'mov'].includes(ext)) {
      return <FileVideo className="h-5 w-5 text-purple-400" />;
    }
    if (['mp3', 'wav', 'ogg'].includes(ext)) {
      return <FileAudio className="h-5 w-5 text-pink-400" />;
    }
    if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) {
      return <FileArchive className="h-5 w-5 text-yellow-400" />;
    }
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(ext)) {
      return <FileCode className="h-5 w-5 text-cyan-400" />;
    }
    if (['md', 'txt', 'rtf', 'pdf', 'doc', 'docx'].includes(ext)) {
      return <FileText className="h-5 w-5 text-blue-400" />;
    }
    return <File className="h-5 w-5 text-slate-400" />;
  };

  // Breadcrumbs navigation
  const pathParts = currentPath ? currentPath.split('/').filter(Boolean) : [];

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Cloud Storage & CDN Hosting</h1>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
              {owner}/{repo}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Host images, media, assets & files backed by GitHub. Fast global delivery via jsDelivr CDN.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setNewFileModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
          >
            <FolderPlus className="h-4 w-4 text-cyan-400" />
            <span>New File</span>
          </button>
          
          <button
            onClick={() => loadContents(currentPath)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
            title="Refresh files"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Upload Drop Zone Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Upload New Files</h3>
          </div>
          
          {/* Target Folder selection */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Destination folder:</span>
            <input
              type="text"
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              placeholder="e.g. uploads or assets"
              className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/40 p-8 text-center hover:border-cyan-500/50 hover:bg-cyan-950/10 transition-all cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
            <Upload className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-200">
            Click to upload or drag and drop files here
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Supports all formats (Images, Video, Audio, ZIP, Code, Docs) up to 100MB
          </p>

          {uploading && (
            <div className="mt-4 flex items-center gap-2 text-xs text-cyan-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              <span>Uploading & committing to GitHub...</span>
            </div>
          )}
        </div>

        {/* Recent Upload CDN Generator Card */}
        {recentUpload && (
          <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-300">File Uploaded Successfully!</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{recentUpload.name}</span>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-slate-950/80 p-2.5 border border-slate-800">
                <div className="truncate mr-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">jsDelivr Global CDN</span>
                  <span className="text-slate-200 font-mono truncate">{recentUpload.jsdelivrUrl}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(recentUpload.jsdelivrUrl, 'rec-cdn')}
                  className="shrink-0 flex items-center gap-1 rounded bg-cyan-500/20 px-2 py-1 text-cyan-300 hover:bg-cyan-500/30 cursor-pointer"
                >
                  {copiedKey === 'rec-cdn' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedKey === 'rec-cdn' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-950/80 p-2.5 border border-slate-800">
                <div className="truncate mr-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">GitHub Raw Link</span>
                  <span className="text-slate-200 font-mono truncate">{recentUpload.rawUrl}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(recentUpload.rawUrl, 'rec-raw')}
                  className="shrink-0 flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  {copiedKey === 'rec-raw' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedKey === 'rec-raw' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explorer / File List Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
        
        {/* Navigation Breadcrumbs Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-3 text-xs">
          <div className="flex items-center gap-1 text-slate-400 flex-wrap">
            <button
              onClick={() => loadContents('')}
              className={`hover:text-cyan-400 cursor-pointer ${currentPath === '' ? 'text-white font-semibold' : ''}`}
            >
              root
            </button>
            {pathParts.map((part, index) => {
              const subPath = pathParts.slice(0, index + 1).join('/');
              return (
                <React.Fragment key={subPath}>
                  <span className="text-slate-600">/</span>
                  <button
                    onClick={() => loadContents(subPath)}
                    className={`hover:text-cyan-400 cursor-pointer ${index === pathParts.length - 1 ? 'text-white font-semibold' : ''}`}
                  >
                    {part}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {pathParts.length > 0 && (
            <button
              onClick={() => {
                const parent = pathParts.slice(0, -1).join('/');
                loadContents(parent);
              }}
              className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 text-xs text-red-400 bg-red-950/30 border-b border-red-500/20">
            {error}
          </div>
        )}

        {/* File Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/30 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Size</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Type</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    This directory is empty. Upload a file above to begin hosting!
                  </td>
                </tr>
              )}

              {items.map((item) => {
                const hosting = getHostingUrls(owner, repo, item.path);
                const isDir = item.type === 'dir';

                return (
                  <tr key={item.sha || item.path} className="hover:bg-slate-800/30 transition-colors">
                    {/* File Name & Icon */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {getFileIcon(item)}
                        {isDir ? (
                          <button
                            onClick={() => loadContents(item.path)}
                            className="font-medium text-slate-200 hover:text-cyan-400 cursor-pointer text-left truncate max-w-[200px] sm:max-w-xs"
                          >
                            {item.name}
                          </button>
                        ) : (
                          <span className="font-mono text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                            {item.name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-4 py-3 text-slate-400 hidden sm:table-cell font-mono">
                      {isDir ? '—' : formatFileSize(item.size)}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                      {isDir ? 'Directory' : item.name.split('.').pop()?.toUpperCase() || 'File'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      {!isDir ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy jsDelivr CDN */}
                          <button
                            onClick={() => copyToClipboard(hosting.jsdelivrUrl, item.path + '-cdn')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition cursor-pointer"
                            title="Copy jsDelivr CDN Link"
                          >
                            {copiedKey === item.path + '-cdn' ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Link2 className="h-4 w-4" />
                            )}
                          </button>

                          {/* Preview / View */}
                          <button
                            onClick={() => handleOpenPreview(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition cursor-pointer"
                            title="Preview / Edit"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Open in GitHub Raw */}
                          <a
                            href={hosting.rawUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                            title="View Raw on GitHub"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                            title="Delete file"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => loadContents(item.path)}
                          className="text-xs text-cyan-400 hover:underline"
                        >
                          Open folder
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Preview & Editor Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
              <div className="flex items-center gap-2">
                {getFileIcon(previewFile)}
                <span className="font-mono text-sm font-semibold text-white truncate max-w-sm">
                  {previewFile.name}
                </span>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Media viewer */}
              {getHostingUrls(owner, repo, previewFile.path).isImage && (
                <div className="flex justify-center bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <img
                    src={getHostingUrls(owner, repo, previewFile.path).jsdelivrUrl}
                    alt={previewFile.name}
                    className="max-h-80 object-contain rounded-lg"
                  />
                </div>
              )}

              {getHostingUrls(owner, repo, previewFile.path).isVideo && (
                <div className="flex justify-center bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <video
                    controls
                    src={getHostingUrls(owner, repo, previewFile.path).jsdelivrUrl}
                    className="max-h-80 rounded-lg"
                  />
                </div>
              )}

              {getHostingUrls(owner, repo, previewFile.path).isAudio && (
                <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">
                  <audio
                    controls
                    src={getHostingUrls(owner, repo, previewFile.path).jsdelivrUrl}
                    className="w-full"
                  />
                </div>
              )}

              {/* Text / Code Editor */}
              {fileContent !== '' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>File Content</span>
                    {!editingContent ? (
                      <button
                        onClick={() => setEditingContent(true)}
                        className="flex items-center gap-1 text-cyan-400 hover:underline cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit File</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingContent(false)}
                        className="text-slate-400 hover:underline cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  {editingContent ? (
                    <textarea
                      value={fileContent}
                      onChange={(e) => setFileContent(e.target.value)}
                      rows={14}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  ) : (
                    <pre className="max-h-80 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap">
                      {fileContent}
                    </pre>
                  )}
                </div>
              )}

              {/* Hosting Links Box */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Direct CDN & Hosting Links
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">jsDelivr CDN (Fast Global Delivery)</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <input
                        type="text"
                        readOnly
                        value={getHostingUrls(owner, repo, previewFile.path).jsdelivrUrl}
                        className="w-full rounded bg-slate-900 border border-slate-800 px-2 py-1 text-slate-300 font-mono text-xs"
                      />
                      <button
                        onClick={() => copyToClipboard(getHostingUrls(owner, repo, previewFile.path).jsdelivrUrl, 'm-cdn')}
                        className="rounded bg-cyan-500/20 px-2.5 py-1 text-cyan-300 hover:bg-cyan-500/30"
                      >
                        {copiedKey === 'm-cdn' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">GitHub Raw Link</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <input
                        type="text"
                        readOnly
                        value={getHostingUrls(owner, repo, previewFile.path).rawUrl}
                        className="w-full rounded bg-slate-900 border border-slate-800 px-2 py-1 text-slate-300 font-mono text-xs"
                      />
                      <button
                        onClick={() => copyToClipboard(getHostingUrls(owner, repo, previewFile.path).rawUrl, 'm-raw')}
                        className="rounded bg-slate-800 px-2.5 py-1 text-slate-300 hover:bg-slate-700"
                      >
                        {copiedKey === 'm-raw' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">HTML Embed Code</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <input
                        type="text"
                        readOnly
                        value={getHostingUrls(owner, repo, previewFile.path).htmlEmbed}
                        className="w-full rounded bg-slate-900 border border-slate-800 px-2 py-1 text-slate-300 font-mono text-xs"
                      />
                      <button
                        onClick={() => copyToClipboard(getHostingUrls(owner, repo, previewFile.path).htmlEmbed, 'm-html')}
                        className="rounded bg-slate-800 px-2.5 py-1 text-slate-300 hover:bg-slate-700"
                      >
                        {copiedKey === 'm-html' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-950/60">
              <a
                href={getHostingUrls(owner, repo, previewFile.path).jsdelivrUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download File</span>
              </a>

              {editingContent ? (
                <button
                  onClick={handleSaveEdit}
                  disabled={savingFile}
                  className="rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
                >
                  {savingFile ? 'Saving Changes...' : 'Commit & Save'}
                </button>
              ) : (
                <button
                  onClick={() => setPreviewFile(null)}
                  className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Close
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* New File Creation Modal */}
      {newFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Create New File</h3>
            <p className="text-xs text-slate-400 mt-1">
              Create and commit a new text, markdown, HTML, or code file directly to {repo}.
            </p>

            <form onSubmit={handleCreateFile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. index.html, notes.txt, api.json"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">File Content</label>
                <textarea
                  rows={6}
                  placeholder="Write initial content..."
                  value={newFileText}
                  onChange={(e) => setNewFileText(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewFileModal(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 cursor-pointer"
                >
                  Create & Commit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper: Format bytes
function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
