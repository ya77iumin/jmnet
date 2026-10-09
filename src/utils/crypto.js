// Web Crypto AES-256-GCM + PBKDF2 encryption utility

// Pre-encrypted vault containing ya77iumin GitHub PAT, encrypted with password '123as'
export const DEFAULT_ENCRYPTED_VAULT = {
  salt: "e0206ed93d9a11022122660f957d4d59",
  iv: "052a98bde2cf64946748ff1b",
  ciphertext: "zAoXtn/9ykIHyVZOJE13u2bgE6eyWhNLYVCMBPXvTzXpCvVuGyeDYY+dxcQThJMULe+hODYbuKqF+47vO4Xt8gQCkMNd9adjFR0axbeSy5t7Af+RAhpul+tGi7M41+NXsE7CbZcdg/usuznBOw=="
};

const STORAGE_KEYS = {
  VAULT: 'jmnet_encrypted_vault',
  CACHED_PWD: 'jmnet_cached_password',
  AUTO_LOGIN: 'jmnet_auto_login'
};

// Convert hex string to Uint8Array
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// Convert Uint8Array to hex string
function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Derive AES-GCM 256 key from password and salt using PBKDF2 (100k rounds, SHA-256)
async function deriveKey(password, saltBytes, keyUsages) {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    keyUsages
  );
}

// Encrypt plaintext with password
export async function encryptToken(plaintext, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aesKey = await deriveKey(password, salt, ['encrypt']);

  const enc = new TextEncoder();
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    aesKey,
    enc.encode(plaintext)
  );

  // Convert buffer to Base64
  const bytes = new Uint8Array(encryptedBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const ciphertextBase64 = btoa(binary);

  return {
    salt: bytesToHex(salt),
    iv: bytesToHex(iv),
    ciphertext: ciphertextBase64
  };
}

// Decrypt vault data with password
export async function decryptToken(vaultData, password) {
  try {
    const salt = hexToBytes(vaultData.salt);
    const iv = hexToBytes(vaultData.iv);

    // Convert Base64 to Uint8Array
    const binary = atob(vaultData.ciphertext);
    const ciphertextBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      ciphertextBytes[i] = binary.charCodeAt(i);
    }

    const aesKey = await deriveKey(password, salt, ['decrypt']);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      aesKey,
      ciphertextBytes
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    throw new Error('Invalid password or corrupted vault payload.');
  }
}

// Local storage session helpers
export function getSavedVault() {
  const stored = localStorage.getItem(STORAGE_KEYS.VAULT);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fallback
    }
  }
  return DEFAULT_ENCRYPTED_VAULT;
}

export function saveVault(vault) {
  localStorage.setItem(STORAGE_KEYS.VAULT, JSON.stringify(vault));
}

export function getCachedPassword() {
  return localStorage.getItem(STORAGE_KEYS.CACHED_PWD) || '';
}

export function saveCachedPassword(password) {
  localStorage.setItem(STORAGE_KEYS.CACHED_PWD, password);
  localStorage.setItem(STORAGE_KEYS.AUTO_LOGIN, 'true');
}

export function clearCache() {
  localStorage.removeItem(STORAGE_KEYS.CACHED_PWD);
  localStorage.removeItem(STORAGE_KEYS.AUTO_LOGIN);
}
