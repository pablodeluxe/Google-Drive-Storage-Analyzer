import { DriveNode, StorageQuota, CachedDriveData } from '../types';

const DB_NAME = 'DriveStorageAnalyzerDB';
const DB_VERSION = 1;
const STORE_SCANS = 'scans';
const STORE_SNAPSHOTS = 'snapshots';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está disponible en este entorno.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_SCANS)) {
        db.createObjectStore(STORE_SCANS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
        const snapStore = db.createObjectStore(STORE_SNAPSHOTS, { keyPath: 'id' });
        snapStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Error al abrir IndexedDB'));
    };
  });
}

/**
 * Guarda el escaneo de Drive actual en IndexedDB de forma local
 */
export async function saveScanToIndexedDB(params: {
  userEmail: string;
  quota: StorageQuota;
  rootNode: DriveNode;
  allNodes: DriveNode[];
}): Promise<CachedDriveData> {
  const db = await openDB();

  const cachedData: CachedDriveData = {
    id: params.userEmail || 'current_user',
    userEmail: params.userEmail,
    timestamp: Date.now(),
    quota: params.quota,
    rootNode: params.rootNode,
    allNodes: params.allNodes,
    itemCount: params.allNodes.length,
    totalSize: params.rootNode.size,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_SCANS], 'readwrite');
    const store = tx.objectStore(STORE_SCANS);

    const req = store.put(cachedData);

    req.onsuccess = () => {
      resolve(cachedData);
    };

    req.onerror = () => {
      reject(req.error || new Error('No se pudo guardar el escaneo en IndexedDB.'));
    };
  });
}

/**
 * Obtiene el último escaneo guardado en IndexedDB
 */
export async function getLatestScanFromIndexedDB(
  userEmail?: string
): Promise<CachedDriveData | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_SCANS], 'readonly');
      const store = tx.objectStore(STORE_SCANS);

      const targetId = userEmail || 'current_user';
      const req = store.get(targetId);

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result as CachedDriveData);
          return;
        }

        // If targetId not found, return the first one available
        const allReq = store.getAll();
        allReq.onsuccess = () => {
          const list = allReq.result as CachedDriveData[];
          if (list && list.length > 0) {
            // Sort by timestamp desc
            list.sort((a, b) => b.timestamp - a.timestamp);
            resolve(list[0]);
          } else {
            resolve(null);
          }
        };
        allReq.onerror = () => resolve(null);
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('Error al leer de IndexedDB:', err);
    return null;
  }
}

/**
 * Borra la caché de escaneos de IndexedDB
 */
export async function clearIndexedDBCache(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_SCANS], 'readwrite');
    const store = tx.objectStore(STORE_SCANS);
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Descarga una instantánea del análisis en formato JSON al disco local
 */
export function exportScanAsJSON(data: CachedDriveData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date(data.timestamp).toISOString().slice(0, 10);
  const fileName = `drive-storage-scan-${dateStr}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Carga una instantánea desde un archivo .json local
 */
export function importScanFromJSON(file: File): Promise<CachedDriveData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.rootNode || !parsed.quota) {
          throw new Error('El archivo no contiene una estructura válida de escaneo de Drive.');
        }

        const scanData: CachedDriveData = {
          id: parsed.id || 'imported_scan',
          userEmail: parsed.userEmail || parsed.quota.userEmail || 'importado@local',
          timestamp: parsed.timestamp || Date.now(),
          quota: parsed.quota,
          rootNode: parsed.rootNode,
          allNodes: parsed.allNodes || [],
          itemCount: parsed.itemCount || (parsed.allNodes ? parsed.allNodes.length : 0),
          totalSize: parsed.totalSize || parsed.rootNode.size,
        };

        resolve(scanData);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Formato de archivo inválido';
        reject(new Error(`Error al leer archivo JSON: ${msg}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('No se pudo leer el archivo local.'));
    };

    reader.readAsText(file);
  });
}
