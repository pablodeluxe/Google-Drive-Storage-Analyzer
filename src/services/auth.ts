import { AppUser } from '../types';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env;

const GOOGLE_CLIENT_ID =
  metaEnv?.VITE_GOOGLE_CLIENT_ID ||
  '551833648030-6p2tirvdraafu2ba9k4ehhss0at32hlu.apps.googleusercontent.com';

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

let cachedToken: string | null = null;
let currentUser: AppUser | null = null;

export function clearAuthSession(): void {
  cachedToken = null;
  currentUser = null;
  try {
    sessionStorage.removeItem('drive_access_token');
    sessionStorage.removeItem('drive_token_expires_at');
    sessionStorage.removeItem('drive_user_profile');
  } catch {
    // ignore
  }
}

export function isTokenExpired(): boolean {
  if (!cachedToken) return true;
  try {
    const expiresAtStr = sessionStorage.getItem('drive_token_expires_at');
    if (!expiresAtStr) return false;
    const expiresAt = parseInt(expiresAtStr, 10);
    return !isNaN(expiresAt) && Date.now() >= expiresAt;
  } catch {
    return false;
  }
}

// Ensure GSI script is loaded
function loadGsiScript(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existing = document.getElementById('google-gsi-script');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      console.warn('No se pudo cargar el script de Google Identity Services.');
      resolve();
    };
    document.head.appendChild(script);
  });
}

// Fetch user profile using the access token
async function fetchUserProfile(token: string): Promise<AppUser> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        id: data.sub || data.email,
        displayName: data.name || data.given_name || data.email,
        email: data.email,
        photoURL: data.picture,
      };
    }
  } catch (err) {
    console.warn('No se pudo obtener el perfil de usuario desde Google:', err);
  }

  return {
    id: 'user',
    displayName: 'Usuario de Google',
    email: 'usuario@gmail.com',
  };
}

/**
 * Inicializa la sesión y recupera sesión activa en memoria o sessionStorage
 */
export function initAuth(
  onAuthSuccess?: (user: AppUser, token: string) => void,
  onAuthFailure?: () => void
): () => void {
  // Preload GSI
  loadGsiScript();

  // Check saved session in sessionStorage
  try {
    const savedToken = sessionStorage.getItem('drive_access_token');
    const savedUserJson = sessionStorage.getItem('drive_user_profile');
    const expiresAtStr = sessionStorage.getItem('drive_token_expires_at');

    if (savedToken && savedUserJson) {
      // Validate expiration
      if (expiresAtStr) {
        const expiresAt = parseInt(expiresAtStr, 10);
        if (!isNaN(expiresAt) && Date.now() >= expiresAt) {
          // Token is already expired! Clean up and do not trigger onAuthSuccess
          clearAuthSession();
          if (onAuthFailure) onAuthFailure();
          return () => {};
        }
      }

      cachedToken = savedToken;
      currentUser = JSON.parse(savedUserJson);
      if (currentUser && onAuthSuccess) {
        onAuthSuccess(currentUser, savedToken);
      }
      return () => {};
    }
  } catch {
    // sessionStorage could be restricted
  }

  if (onAuthFailure) onAuthFailure();
  return () => {};
}

/**
 * Inicia sesión utilizando Google Identity Services (ventana emergente nativa de Google OAuth2)
 */
export async function googleSignIn(): Promise<{ user: AppUser; accessToken: string }> {
  await loadGsiScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error(
      'Google Identity Services no está disponible. Verifica tu conexión o bloqueadores de anuncios.'
    );
  }

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (response: {
          access_token?: string;
          error?: string;
          expires_in?: number | string;
        }) => {
          if (response.error || !response.access_token) {
            reject(new Error(response.error || 'No se obtuvo el token de acceso de Google.'));
            return;
          }

          const token = response.access_token;
          cachedToken = token;

          try {
            sessionStorage.setItem('drive_access_token', token);
            // Default to 3600 seconds minus 120s buffer if expires_in not specified
            const expiresInSec = Number(response.expires_in) || 3599;
            const expiresAt = Date.now() + Math.max(expiresInSec - 120, 60) * 1000;
            sessionStorage.setItem('drive_token_expires_at', expiresAt.toString());
          } catch {
            // ignore
          }

          const user = await fetchUserProfile(token);
          currentUser = user;

          try {
            sessionStorage.setItem('drive_user_profile', JSON.stringify(user));
          } catch {
            // ignore
          }

          resolve({ user, accessToken: token });
        },
        error_callback: (err: { message?: string; type?: string }) => {
          reject(new Error(err.message || 'Error en la autorización de Google.'));
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al inicializar OAuth2';
      reject(new Error(msg));
    }
  });
}

export function getAccessToken(): string | null {
  return cachedToken;
}

export function getCurrentUser(): AppUser | null {
  return currentUser;
}

export function logout(): Promise<void> {
  return new Promise((resolve) => {
    if (cachedToken && window.google?.accounts?.oauth2) {
      try {
        window.google.accounts.oauth2.revoke(cachedToken, () => {
          // revoked
        });
      } catch {
        // ignore
      }
    }

    clearAuthSession();
    resolve();
  });
}

// Extend global window typing for GSI
declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (err: { message?: string; type?: string }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
          revoke: (token: string, done: () => void) => void;
        };
      };
    };
  }
}
