import { DriveFileRaw, DriveNode, StorageQuota } from '../types';
import { getFileCategory } from '../utils/format';
import { clearAuthSession } from './auth';

export class DriveAuthExpiredError extends Error {
  readonly isAuthExpired = true;
  readonly statusCode = 401;

  constructor(message?: string) {
    super(
      message ||
        'Tu sesión de Google Drive ha caducado o las credenciales no son válidas. Por favor vuelve a iniciar sesión.'
    );
    this.name = 'DriveAuthExpiredError';
  }
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

export async function fetchStorageQuota(accessToken: string): Promise<StorageQuota> {
  const res = await fetch(`${DRIVE_API_BASE}/about?fields=user,storageQuota`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401) {
      clearAuthSession();
      throw new DriveAuthExpiredError(
        'Tu sesión de Google Drive ha caducado o las credenciales no son válidas. Por favor vuelve a conectar tu cuenta.'
      );
    }
    throw new Error(`Error al consultar almacenamiento de Google Drive (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const quota = data.storageQuota || {};
  const user = data.user || {};

  return {
    limit: parseInt(quota.limit || '0', 10),
    usage: parseInt(quota.usage || '0', 10),
    usageInDrive: parseInt(quota.usageInDrive || '0', 10),
    usageInDriveTrash: parseInt(quota.usageInDriveTrash || '0', 10),
    userEmail: user.emailAddress || '',
    userName: user.displayName || 'Usuario de Google',
    userPhoto: user.photoLink || '',
  };
}

export async function scanDrive(
  accessToken: string,
  onProgress: (scannedCount: number, message: string) => void
): Promise<{ rootNode: DriveNode; allNodes: DriveNode[]; rawFiles: DriveFileRaw[] }> {
  const allFiles: DriveFileRaw[] = [];
  let pageToken: string | null = null;
  let pageCount = 0;

  onProgress(0, 'Iniciando escaneo de archivos en Google Drive...');

  do {
    pageCount++;
    const params = new URLSearchParams({
      pageSize: '1000',
      fields:
        'nextPageToken,files(id,name,mimeType,size,quotaBytesUsed,parents,modifiedTime,createdTime,webViewLink,iconLink,thumbnailLink,trashed,ownedByMe,owners)',
      // Strictly exclude files that are not owned by the authenticated user
      q: "trashed = false and 'me' in owners",
      orderBy: 'quotaBytesUsed desc',
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    const res = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 401) {
        clearAuthSession();
        throw new DriveAuthExpiredError(
          'Tu sesión de Google Drive ha caducado durante el escaneo. Por favor vuelve a conectar tu cuenta.'
        );
      }
      throw new Error(`Error al listar archivos (${res.status}): ${errText}`);
    }

    const data = await res.json();
    // Double check that every file is owned by the current user
    const files: DriveFileRaw[] = (data.files || []).filter((f: DriveFileRaw) => {
      if (f.ownedByMe !== undefined && !f.ownedByMe) return false;
      if (f.owners && f.owners.length > 0 && !f.owners.some((o) => o.me)) return false;
      return true;
    });
    allFiles.push(...files);

    pageToken = data.nextPageToken || null;
    onProgress(
      allFiles.length,
      `Escaneados ${allFiles.length.toLocaleString()} elementos propios (página ${pageCount})...`
    );
  } while (pageToken);

  onProgress(allFiles.length, 'Construyendo jerarquía de carpetas y mapa de calor...');

  const { rootNode, allNodes } = buildDriveTree(allFiles);
  return { rootNode, allNodes, rawFiles: allFiles };
}

export function buildDriveTree(files: DriveFileRaw[]): {
  rootNode: DriveNode;
  allNodes: DriveNode[];
} {
  const nodeMap = new Map<string, DriveNode>();

  // 1. Initialize all nodes - strictly include only owned files
  for (const f of files) {
    if (f.ownedByMe !== undefined && !f.ownedByMe) {
      continue;
    }
    if (f.owners && f.owners.length > 0 && !f.owners.some((o) => o.me)) {
      continue;
    }

    const isFolder = f.mimeType === 'application/vnd.google-apps.folder';
    const fileSize = parseInt(f.size || f.quotaBytesUsed || '0', 10);
    const category = getFileCategory(f.mimeType, f.name);
    const ownerName = f.owners && f.owners.length > 0 ? f.owners[0].displayName : 'Tú';

    const node: DriveNode = {
      id: f.id,
      name: f.name || 'Sin título',
      path: f.name || '',
      isFolder,
      mimeType: f.mimeType,
      category,
      size: fileSize,
      directSize: fileSize,
      fileCount: isFolder ? 0 : 1,
      folderCount: isFolder ? 1 : 0,
      children: [],
      parentId: f.parents && f.parents.length > 0 ? f.parents[0] : undefined,
      modifiedTime: f.modifiedTime,
      createdTime: f.createdTime,
      webViewLink: f.webViewLink,
      iconLink: f.iconLink,
      thumbnailLink: f.thumbnailLink,
      ownedByMe: true,
      ownerName,
    };

    nodeMap.set(f.id, node);
  }

  // 2. Link parent/child relationships
  const rootChildren: DriveNode[] = [];

  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!;
      parent.children.push(node);
    } else {
      rootChildren.push(node);
    }
  }

  // 3. Compute recursive sizes, file counts, and paths
  function aggregate(node: DriveNode, currentPath: string) {
    node.path = currentPath ? `${currentPath} / ${node.name}` : node.name;

    if (node.isFolder) {
      let totalSize = 0;
      let totalFiles = 0;
      let totalFolders = 0;

      for (const child of node.children) {
        aggregate(child, node.path);
        totalSize += child.size;
        totalFiles += child.fileCount;
        totalFolders += child.folderCount + (child.isFolder ? 1 : 0);
      }

      node.size = totalSize;
      node.fileCount = totalFiles;
      node.folderCount = totalFolders;

      // Sort children by size descending for optimal layout
      node.children.sort((a, b) => b.size - a.size);
    }
  }

  const rootNode: DriveNode = {
    id: 'root',
    name: 'Mi Unidad (Google Drive)',
    path: 'Mi Unidad',
    isFolder: true,
    mimeType: 'application/vnd.google-apps.folder',
    category: 'folder',
    size: 0,
    directSize: 0,
    fileCount: 0,
    folderCount: 0,
    children: rootChildren,
  };

  aggregate(rootNode, '');

  const allNodes = Array.from(nodeMap.values());
  allNodes.push(rootNode);

  return { rootNode, allNodes };
}

export async function trashDriveFile(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trashed: true }),
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401) {
      clearAuthSession();
      throw new DriveAuthExpiredError(
        'Tu sesión de Google Drive ha expirado. Por favor vuelve a conectar tu cuenta para mover archivos a la papelera.'
      );
    }
    throw new Error(`Error al mover a la papelera (${res.status}): ${errText}`);
  }
}

export async function deleteDriveFilePermanently(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401) {
      clearAuthSession();
      throw new DriveAuthExpiredError(
        'Tu sesión de Google Drive ha expirado. Por favor vuelve a conectar tu cuenta para eliminar archivos.'
      );
    }
    throw new Error(`Error al eliminar permanentemente (${res.status}): ${errText}`);
  }
}

/**
 * High quality mock Google Drive dataset for instant preview and testing
 */
export function getMockDriveData(): {
  quota: StorageQuota;
  rootNode: DriveNode;
  allNodes: DriveNode[];
  rawFiles: DriveFileRaw[];
} {
  const GB = 1024 * 1024 * 1024;
  const MB = 1024 * 1024;

  const rawFiles: DriveFileRaw[] = [
    // Folder 1: Videos y Producciones
    {
      id: 'f_vid',
      name: 'Videos y Producción Audiovisual',
      mimeType: 'application/vnd.google-apps.folder',
      modifiedTime: '2026-02-15T10:00:00Z',
    },
    {
      id: 'v_1',
      name: 'Entrevista_Documental_4K_Export_Master.mov',
      mimeType: 'video/quicktime',
      size: `${Math.round(14.8 * GB)}`,
      quotaBytesUsed: `${Math.round(14.8 * GB)}`,
      parents: ['f_vid'],
      modifiedTime: '2025-11-20T14:22:00Z',
      webViewLink: 'https://drive.google.com',
    },
    {
      id: 'v_2',
      name: 'Tomas_Aereas_Drone_Bariloche_Raw.mp4',
      mimeType: 'video/mp4',
      size: `${Math.round(8.6 * GB)}`,
      quotaBytesUsed: `${Math.round(8.6 * GB)}`,
      parents: ['f_vid'],
      modifiedTime: '2025-10-05T09:12:00Z',
      webViewLink: 'https://drive.google.com',
    },
    {
      id: 'v_3',
      name: 'Grabacion_Podcast_Episodio_14_multitrack.mov',
      mimeType: 'video/quicktime',
      size: `${Math.round(5.4 * GB)}`,
      quotaBytesUsed: `${Math.round(5.4 * GB)}`,
      parents: ['f_vid'],
      modifiedTime: '2026-01-12T16:45:00Z',
      webViewLink: 'https://drive.google.com',
    },
    {
      id: 'f_broll',
      name: 'Tomas Secundarias (B-Roll)',
      mimeType: 'application/vnd.google-apps.folder',
      parents: ['f_vid'],
      modifiedTime: '2025-12-01T12:00:00Z',
    },
    {
      id: 'v_broll1',
      name: 'Camara_Lenta_60fps_Playa.mp4',
      mimeType: 'video/mp4',
      size: `${Math.round(3.2 * GB)}`,
      quotaBytesUsed: `${Math.round(3.2 * GB)}`,
      parents: ['f_broll'],
      modifiedTime: '2025-08-14T11:00:00Z',
      webViewLink: 'https://drive.google.com',
    },
    {
      id: 'v_broll2',
      name: 'TimeLapse_Atardecer_ProRes.mov',
      mimeType: 'video/quicktime',
      size: `${Math.round(2.9 * GB)}`,
      quotaBytesUsed: `${Math.round(2.9 * GB)}`,
      parents: ['f_broll'],
      modifiedTime: '2025-08-15T18:30:00Z',
      webViewLink: 'https://drive.google.com',
    },

    // Folder 2: Backups y Maquinas Virtuales
    {
      id: 'f_backups',
      name: 'Backups y Archivos Históricos',
      mimeType: 'application/vnd.google-apps.folder',
      modifiedTime: '2025-12-28T08:00:00Z',
    },
    {
      id: 'b_1',
      name: 'Backup_MacBook_Pro_TimeMachine_2024.dmg',
      mimeType: 'application/x-apple-diskimage',
      size: `${Math.round(19.4 * GB)}`,
      quotaBytesUsed: `${Math.round(19.4 * GB)}`,
      parents: ['f_backups'],
      modifiedTime: '2024-06-10T12:00:00Z',
      webViewLink: 'https://drive.google.com',
    },
    {
      id: 'b_2',
      name: 'Snapshot_Ubuntu_Server_VM.ova',
      mimeType: 'application/octet-stream',
      size: `${Math.round(7.2 * GB)}`,
      quotaBytesUsed: `${Math.round(7.2 * GB)}`,
      parents: ['f_backups'],
      modifiedTime: '2024-11-03T17:20:00Z',
      webViewLink: 'https://drive.google.com',
    },
    {
      id: 'b_3',
      name: 'Dump_Base_Datos_Postgres_Prod_2024.sql.gz',
      mimeType: 'application/gzip',
      size: `${Math.round(4.8 * GB)}`,
      quotaBytesUsed: `${Math.round(4.8 * GB)}`,
      parents: ['f_backups'],
      modifiedTime: '2024-12-31T23:59:00Z',
      webViewLink: 'https://drive.google.com',
    },
    {
      id: 'b_4',
      name: 'Descarga_Archivos_Viejos_Dropbox.zip',
      mimeType: 'application/zip',
      size: `${Math.round(3.6 * GB)}`,
      quotaBytesUsed: `${Math.round(3.6 * GB)}`,
      parents: ['f_backups'],
      modifiedTime: '2023-04-18T10:15:00Z',
      webViewLink: 'https://drive.google.com',
    },

    // Folder 3: Fotografía y Diseño
    {
      id: 'f_photo',
      name: 'Fotografía RAW y Catálogos',
      mimeType: 'application/vnd.google-apps.folder',
      modifiedTime: '2026-01-20T19:00:00Z',
    },
    {
      id: 'p_1',
      name: 'Catalogo_Lightroom_Previews_Smart.lrdata.zip',
      mimeType: 'application/zip',
      size: `${Math.round(6.8 * GB)}`,
      quotaBytesUsed: `${Math.round(6.8 * GB)}`,
      parents: ['f_photo'],
      modifiedTime: '2025-09-12T14:00:00Z',
      webViewLink: 'https://drive.google.com',
    },
    {
      id: 'p_2',
      name: 'Sesion_Fotografica_Boda_Marzo_RAW.zip',
      mimeType: 'application/zip',
      size: `${Math.round(5.7 * GB)}`,
      quotaBytesUsed: `${Math.round(5.7 * GB)}`,
      parents: ['f_photo'],
      modifiedTime: '2025-03-25T11:45:00Z',
      webViewLink: 'https://drive.google.com',
    },
    {
      id: 'p_3',
      name: 'Coleccion_Texturas_4K_HDR_PBR.rar',
      mimeType: 'application/x-rar-compressed',
      size: `${Math.round(3.9 * GB)}`,
      quotaBytesUsed: `${Math.round(3.9 * GB)}`,
      parents: ['f_photo'],
      modifiedTime: '2024-08-09T15:20:00Z',
      webViewLink: 'https://drive.google.com',
    },

    // Folder 4: Proyectos 3D y Modelado
    {
      id: 'f_3d',
      name: 'Render 3D y Modelado Blender',
      mimeType: 'application/vnd.google-apps.folder',
      modifiedTime: '2026-02-01T15:00:00Z',
    },
    {
      id: 'd_1',
      name: 'Escenario_Ciudad_Futurista_Cycles.blend',
      mimeType: 'application/x-blender',
      size: `${Math.round(4.4 * GB)}`,
      quotaBytesUsed: `${Math.round(4.4 * GB)}`,
      parents: ['f_3d'],
      modifiedTime: '2026-01-18T19:30:00Z',
      webViewLink: 'https://drive.google.com',
    },
    {
      id: 'd_2',
      name: 'Simulacion_Fluidos_Houdini_Bake.bgeo.sc.zip',
      mimeType: 'application/zip',
      size: `${Math.round(3.8 * GB)}`,
      quotaBytesUsed: `${Math.round(3.8 * GB)}`,
      parents: ['f_3d'],
      modifiedTime: '2025-11-10T16:00:00Z',
      webViewLink: 'https://drive.google.com',
    },

    // Folder 5: Documentos y Reportes de Empresa
    {
      id: 'f_docs',
      name: 'Documentación y Finanzas',
      mimeType: 'application/vnd.google-apps.folder',
      modifiedTime: '2026-03-01T09:00:00Z',
    },
    {
      id: 'doc_1',
      name: 'Auditoria_Financiera_Completa_Scanned_Archival.pdf',
      mimeType: 'application/pdf',
      size: `${Math.round(980 * MB)}`,
      quotaBytesUsed: `${Math.round(980 * MB)}`,
      parents: ['f_docs'],
      modifiedTime: '2025-07-20T10:00:00Z',
      webViewLink: 'https://drive.google.com',
    },
    {
      id: 'doc_2',
      name: 'Dataset_Clientes_BigData_Export_2025.csv',
      mimeType: 'text/csv',
      size: `${Math.round(620 * MB)}`,
      quotaBytesUsed: `${Math.round(620 * MB)}`,
      parents: ['f_docs'],
      modifiedTime: '2025-12-05T14:10:00Z',
      webViewLink: 'https://drive.google.com',
    },
    {
      id: 'doc_3',
      name: 'Catalogo_Productos_Print_CMYK_300dpi.pdf',
      mimeType: 'application/pdf',
      size: `${Math.round(450 * MB)}`,
      quotaBytesUsed: `${Math.round(450 * MB)}`,
      parents: ['f_docs'],
      modifiedTime: '2026-02-10T11:30:00Z',
      webViewLink: 'https://drive.google.com',
    },
    {
      id: 'doc_4',
      name: 'Presentacion_Inversores_Serie_A_con_Videos.pptx',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      size: `${Math.round(380 * MB)}`,
      quotaBytesUsed: `${Math.round(380 * MB)}`,
      parents: ['f_docs'],
      modifiedTime: '2026-02-28T16:00:00Z',
      webViewLink: 'https://drive.google.com',
    },

    // Root standalone files
    {
      id: 'root_f1',
      name: 'ISO_Instalador_MacOS_Sequoia_Installer.iso',
      mimeType: 'application/x-iso9660-image',
      size: `${Math.round(13.5 * GB)}`,
      quotaBytesUsed: `${Math.round(13.5 * GB)}`,
      modifiedTime: '2025-01-15T18:00:00Z',
      webViewLink: 'https://drive.google.com',
    },
    {
      id: 'root_f2',
      name: 'Dataset_Machine_Learning_Weights_v4.tar',
      mimeType: 'application/x-tar',
      size: `${Math.round(6.1 * GB)}`,
      quotaBytesUsed: `${Math.round(6.1 * GB)}`,
      modifiedTime: '2025-06-22T13:40:00Z',
      webViewLink: 'https://drive.google.com',
    },
  ];

  const quota: StorageQuota = {
    limit: 100 * GB,
    usage: 104.8 * GB,
    usageInDrive: 104.8 * GB,
    usageInDriveTrash: 6.2 * GB,
    userEmail: 'demo.usuario@gmail.com',
    userName: 'Usuario Demo (Google Drive)',
    userPhoto: '',
  };

  const { rootNode, allNodes } = buildDriveTree(rawFiles);
  return { quota, rootNode, allNodes, rawFiles };
}
