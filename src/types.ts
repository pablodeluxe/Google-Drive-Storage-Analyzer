export interface AppUser {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

export interface CachedDriveData {
  id: string;
  userEmail: string;
  timestamp: number;
  quota: StorageQuota;
  rootNode: DriveNode;
  allNodes: DriveNode[];
  itemCount: number;
  totalSize: number;
}

export interface DriveFileRaw {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  quotaBytesUsed?: string;
  parents?: string[];
  modifiedTime?: string;
  createdTime?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  trashed?: boolean;
  ownedByMe?: boolean;
  owners?: Array<{
    displayName?: string;
    emailAddress?: string;
    me?: boolean;
  }>;
}

export type FileCategory =
  | 'video'
  | 'image'
  | 'audio'
  | 'archive'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'code'
  | 'folder'
  | 'other';

export interface DriveNode {
  id: string;
  name: string;
  path: string;
  isFolder: boolean;
  mimeType: string;
  category: FileCategory;
  size: number; // Recursive total bytes for folders, file size for files
  directSize: number; // Only direct files in folder
  fileCount: number; // Total files inside
  folderCount: number; // Total folders inside
  children: DriveNode[];
  parentId?: string;
  modifiedTime?: string;
  createdTime?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  ownedByMe?: boolean;
  ownerName?: string;
}

export interface StorageQuota {
  limit: number; // In bytes (0 if unlimited or not set)
  usage: number; // In bytes
  usageInDrive: number;
  usageInDriveTrash: number;
  userEmail: string;
  userName: string;
  userPhoto?: string;
}

export type HeatmapColorMode = 'size' | 'category' | 'age';

export interface ScanProgress {
  isScanning: boolean;
  stage: 'idle' | 'fetching_quota' | 'listing_files' | 'building_tree' | 'complete' | 'error';
  filesFound: number;
  message: string;
  error?: string;
}
