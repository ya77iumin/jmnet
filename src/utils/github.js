// GitHub REST API v3 Integration Client

const API_BASE = 'https://api.github.com';

function getHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'JMNet-Cloud-Hosting'
  };
}

export async function getUserProfile(token) {
  const res = await fetch(`${API_BASE}/user`, {
    headers: getHeaders(token)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch user profile (${res.status})`);
  }
  return res.json();
}

export async function getRateLimits(token) {
  const res = await fetch(`${API_BASE}/rate_limit`, {
    headers: getHeaders(token)
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.rate;
}

export async function listUserRepos(token, page = 1, perPage = 100) {
  const res = await fetch(`${API_BASE}/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner`, {
    headers: getHeaders(token)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to list repositories');
  }
  return res.json();
}

export async function createRepository(token, { name, description, isPrivate = false, autoInit = true }) {
  const res = await fetch(`${API_BASE}/user/repos`, {
    method: 'POST',
    headers: {
      ...getHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      description,
      private: isPrivate,
      auto_init: autoInit
    })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create repository');
  }
  return res.json();
}

export async function deleteRepository(token, owner, repo) {
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}`, {
    method: 'DELETE',
    headers: getHeaders(token)
  });
  if (!res.ok && res.status !== 204) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete repository');
  }
  return true;
}

export async function listRepoContents(token, owner, repo, path = '', branch = 'main') {
  const cleanPath = path ? path.replace(/^\/+|\/+$/g, '') : '';
  const url = `${API_BASE}/repos/${owner}/${repo}/contents/${cleanPath}${branch ? `?ref=${branch}` : ''}`;
  const res = await fetch(url, {
    headers: getHeaders(token)
  });
  if (res.status === 404) {
    return [];
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to list files (${res.status})`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

export async function getFileContent(token, owner, repo, path, branch = 'main') {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const url = `${API_BASE}/repos/${owner}/${repo}/contents/${cleanPath}${branch ? `?ref=${branch}` : ''}`;
  const res = await fetch(url, {
    headers: getHeaders(token)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get file content');
  }
  return res.json();
}

export async function uploadOrUpdateFile(token, owner, repo, path, base64Content, commitMessage = 'Upload via JMNet', sha = null) {
  const cleanPath = path.replace(/^\/+/, '');
  const url = `${API_BASE}/repos/${owner}/${repo}/contents/${cleanPath}`;
  
  const payload = {
    message: commitMessage,
    content: base64Content
  };
  if (sha) {
    payload.sha = sha;
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      ...getHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Upload failed (${res.status})`);
  }
  return res.json();
}

export async function deleteRepoFile(token, owner, repo, path, sha, commitMessage = 'Delete file via JMNet') {
  const cleanPath = path.replace(/^\/+/, '');
  const url = `${API_BASE}/repos/${owner}/${repo}/contents/${cleanPath}`;
  
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...getHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: commitMessage,
      sha
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete file (${res.status})`);
  }
  return res.json();
}

// Generate CDN and raw hosting URLs
export function getHostingUrls(owner, repo, path, branch = 'main') {
  const cleanPath = path ? path.replace(/^\/+/, '') : '';
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${cleanPath}`;
  const jsdelivrUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${cleanPath}`;
  const staticallyUrl = `https://cdn.statically.io/gh/${owner}/${repo}/${branch}/${cleanPath}`;
  
  // Detect extension
  const ext = cleanPath.split('.').pop()?.toLowerCase() || '';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext);
  const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);
  const isAudio = ['mp3', 'wav', 'ogg', 'aac'].includes(ext);

  let htmlEmbed = `<a href="${jsdelivrUrl}" target="_blank">${cleanPath}</a>`;
  let markdownEmbed = `[${cleanPath}](${jsdelivrUrl})`;

  if (isImage) {
    htmlEmbed = `<img src="${jsdelivrUrl}" alt="${cleanPath}" />`;
    markdownEmbed = `![${cleanPath}](${jsdelivrUrl})`;
  } else if (isVideo) {
    htmlEmbed = `<video src="${jsdelivrUrl}" controls></video>`;
  } else if (isAudio) {
    htmlEmbed = `<audio src="${jsdelivrUrl}" controls></audio>`;
  }

  return {
    rawUrl,
    jsdelivrUrl,
    staticallyUrl,
    htmlEmbed,
    markdownEmbed,
    isImage,
    isVideo,
    isAudio,
    fileName: cleanPath.split('/').pop()
  };
}

// Execute arbitrary GitHub API calls for full account administration
export async function executeRawApi(token, method, endpoint, body = null) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  
  const options = {
    method: method.toUpperCase(),
    headers: getHeaders(token)
  };

  if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
    options.headers['Content-Type'] = 'application/json';
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const startTime = performance.now();
  const res = await fetch(url, options);
  const duration = Math.round(performance.now() - startTime);

  let responseData;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    responseData = await res.json();
  } else {
    responseData = await res.text();
  }

  return {
    status: res.status,
    statusText: res.statusText,
    ok: res.ok,
    headers: Object.fromEntries(res.headers.entries()),
    data: responseData,
    duration
  };
}
