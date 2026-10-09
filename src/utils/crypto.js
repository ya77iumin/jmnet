import CryptoJS from 'crypto-js';

// Pre-encrypted vault containing ya77iumin GitHub PAT, encrypted with password '123as' using AES-256
export const DEFAULT_ENCRYPTED_VAULT = 'U2FsdGVkX1+6hrkAxIh1jl4PcHG0zqSBP4Uhd6Jcb+VhVOXqkMaC53hdpDHiaExTlIHWez2eVTVKF6DPyy0JzCBrZ/xySQO7pjIRFk3tLxVFVZAB02bq37ALDJ8mb5u77P5ahcyxlBX8oLbeOBMKpQ==';

const STORAGE_KEYS = {
  VAULT: 'jmnet_encrypted_vault',
  CACHED_PWD: 'jmnet_cached_password',
  AUTO_LOGIN: 'jmnet_auto_login'
};

// Encrypt plaintext with password using AES-256
export function encryptToken(plaintext, password) {
  return CryptoJS.AES.encrypt(plaintext, password.trim()).toString();
}

// Decrypt vault data with password
export function decryptToken(vaultCiphertext, password) {
  const cleanPwd = (password || '').trim();
  if (!cleanPwd) {
    throw new Error('Password cannot be empty.');
  }

  // Ensure we use a valid AES ciphertext string
  const targetVault = (typeof vaultCiphertext === 'string' && vaultCiphertext.startsWith('U2FsdGVkX1'))
    ? vaultCiphertext
    : DEFAULT_ENCRYPTED_VAULT;

  try {
    const bytes = CryptoJS.AES.decrypt(targetVault, cleanPwd);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (decrypted && decrypted.startsWith('gh')) {
      return decrypted;
    }
  } catch (err) {
    // Decryption error
  }

  // Fallback verification for default master password '123as'
  if (cleanPwd === '123as') {
    try {
      const bytes = CryptoJS.AES.decrypt(DEFAULT_ENCRYPTED_VAULT, '123as');
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (decrypted && decrypted.startsWith('gh')) {
        return decrypted;
      }
    } catch {
      // Fallback
    }
  }

  throw new Error('Incorrect password. Default vault password is: 123as');
}

// Local storage session helpers
export function getSavedVault() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VAULT);
    if (stored && typeof stored === 'string' && stored.startsWith('U2FsdGVkX1')) {
      return stored;
    }
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_ENCRYPTED_VAULT;
}

export function saveVault(vault) {
  try {
    localStorage.setItem(STORAGE_KEYS.VAULT, vault);
  } catch {
    // Ignore
  }
}

export function getCachedPassword() {
  try {
    return localStorage.getItem(STORAGE_KEYS.CACHED_PWD) || '';
  } catch {
    return '';
  }
}

export function saveCachedPassword(password) {
  try {
    localStorage.setItem(STORAGE_KEYS.CACHED_PWD, password.trim());
    localStorage.setItem(STORAGE_KEYS.AUTO_LOGIN, 'true');
  } catch {
    // Ignore
  }
}

export function clearCache() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CACHED_PWD);
    localStorage.removeItem(STORAGE_KEYS.AUTO_LOGIN);
    localStorage.removeItem(STORAGE_KEYS.VAULT);
  } catch {
    // Ignore
  }
}
