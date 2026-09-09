import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  Folder,
  File,
  AlertCircle,
  HardDrive,
  Sparkles,
  CheckCircle2,
  Trash2,
  Filter,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  DriveNode,
  StorageQuota,
  HeatmapColorMode,
  ScanProgress,
  FileCategory,
} from './types';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/firebase';
import {
  fetchStorageQuota,
  scanDrive,
  trashDriveFile,
  getMockDriveData,
  buildDriveTree,
} from './services/drive';
import { formatBytes } from './utils/format';
import { Header } from './components/Header';
import { StorageOverview } from './components/StorageOverview';
import { TreemapHeatmap } from './components/TreemapHeatmap';
import { FileDetailsDrawer } from './components/FileDetailsDrawer';
import { CleanupAdvisor } from './components/CleanupAdvisor';
import { CleanupModal } from './components/CleanupModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Tree & data state
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [rootNode, setRootNode] = useState<DriveNode | null>(null);
  const [allNodes, setAllNodes] = useState<DriveNode[]>([]);
  const [activeNode, setActiveNode] = useState<DriveNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<DriveNode | null>(null);

  // UI modes
  const [colorMode, setColorMode] = useState<HeatmapColorMode>('size');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'huge' | 'stale' | 'all'>('all');

  // Scanning progress
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    isScanning: false,
    stage: 'idle',
    filesFound: 0,
    message: '',
  });

  // Modal confirmation for deletion
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);
  const [itemsToTrash, setItemsToTrash] = useState<DriveNode[]>([]);
  const [isProcessingCleanup, setIsProcessingCleanup] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // Load demo data
  const loadDemoData = useCallback(() => {
    const demo = getMockDriveData();
    setQuota(demo.quota);
    setRootNode(demo.rootNode);
    setAllNodes(demo.allNodes);
    setActiveNode(demo.rootNode);
    setSelectedNode(null);
    setIsDemoMode(true);
  }, []);

  // Scan real Google Drive
  const loadRealDriveData = useCallback(async (token: string) => {
    setScanProgress({
      isScanning: true,
      stage: 'fetching_quota',
      filesFound: 0,
      message: 'Consultando cuota de almacenamiento...',
    });

    try {
      const q = await fetchStorageQuota(token);
      setQuota(q);

      setScanProgress((prev) => ({
        ...prev,
        stage: 'listing_files',
        message: 'Escaneando archivos y carpetas de Google Drive...',
      }));

      const { rootNode: scannedRoot, allNodes: scannedAll } = await scanDrive(
        token,
        (count, msg) => {
          setScanProgress((prev) => ({
            ...prev,
            filesFound: count,
            message: msg,
          }));
        }
      );

      setRootNode(scannedRoot);
      setAllNodes(scannedAll);
      setActiveNode(scannedRoot);
      setSelectedNode(null);
      setIsDemoMode(false);

      setScanProgress({
        isScanning: false,
        stage: 'complete',
        filesFound: scannedAll.length,
        message: 'Escaneo completado con éxito.',
      });

      showToast(`Se escanearon ${scannedAll.length.toLocaleString()} elementos de tu Google Drive.`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error desconocido al escanear Drive';
      console.error('Error scanning Drive:', err);
      setScanProgress({
        isScanning: false,
        stage: 'error',
        filesFound: 0,
        message: 'Error al escanear Google Drive.',
        error: errMsg,
      });
      showToast(errMsg, 'error');
    }
  }, [showToast]);

  // Auth setup on mount
  useEffect(() => {
    // Initial demo load so interface is immediately interactive
    loadDemoData();

    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        setAccessToken(token);
        if (token) {
          loadRealDriveData(token);
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [loadDemoData, loadRealDriveData]);

  // Login handler
  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        await loadRealDriveData(res.accessToken);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error durante el inicio de sesión';
      console.error('Login error:', err);
      showToast(msg, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
      loadDemoData();
      showToast('Sesión cerrada. Mostrando datos de prueba.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Rescan handler
  const handleRescan = () => {
    if (isDemoMode) {
      loadDemoData();
      showToast('Datos de demostración reiniciados.');
    } else if (accessToken) {
      loadRealDriveData(accessToken);
    } else {
      handleSignIn();
    }
  };

  // Toggle between demo and real account
  const handleToggleDemoMode = () => {
    if (isDemoMode) {
      if (accessToken) {
        loadRealDriveData(accessToken);
      } else {
        handleSignIn();
      }
    } else {
      loadDemoData();
      showToast('Cambiado a Modo Demostración.');
    }
  };

  // Cleanup request (single item)
  const handleRequestTrash = (node: DriveNode) => {
    setItemsToTrash([node]);
    setCleanupModalOpen(true);
  };

  // Cleanup request (bulk)
  const handleRequestBulkTrash = (nodes: DriveNode[]) => {
    if (nodes.length === 0) return;
    setItemsToTrash(nodes);
    setCleanupModalOpen(true);
  };

  // Execute cleanup (MANDATORY explicit confirmation flow)
  const handleConfirmCleanup = async () => {
    setIsProcessingCleanup(true);
    const totalFreed = itemsToTrash.reduce((acc, item) => acc + item.size, 0);

    try {
      const trashedIds = new Set(itemsToTrash.map((i) => i.id));

      if (!isDemoMode && accessToken) {
        // Real Drive API trashing
        for (const item of itemsToTrash) {
          await trashDriveFile(accessToken, item.id);
        }
      }

      // Update local tree
      const removeItemsFromTree = (current: DriveNode): DriveNode => {
        const remainingChildren = current.children
          .filter((c) => !trashedIds.has(c.id))
          .map(removeItemsFromTree);

        const newDirectSize = current.isFolder
          ? remainingChildren.reduce((acc, c) => acc + (c.isFolder ? 0 : c.size), 0)
          : current.size;

        const newTotalSize = current.isFolder
          ? remainingChildren.reduce((acc, c) => acc + c.size, 0)
          : current.size;

        return {
          ...current,
          children: remainingChildren,
          size: newTotalSize,
          directSize: newDirectSize,
          fileCount: remainingChildren.reduce((acc, c) => acc + c.fileCount, 0),
          folderCount: remainingChildren.reduce((acc, c) => acc + c.folderCount + (c.isFolder ? 1 : 0), 0),
        };
      };

      if (rootNode) {
        const updatedRoot = removeItemsFromTree(rootNode);
        setRootNode(updatedRoot);

        // Update active node
        if (activeNode) {
          const findNode = (curr: DriveNode, targetId: string): DriveNode | null => {
            if (curr.id === targetId) return curr;
            for (const child of curr.children) {
              const res = findNode(child, targetId);
              if (res) return res;
            }
            return null;
          };
          const newActive = findNode(updatedRoot, activeNode.id) || updatedRoot;
          setActiveNode(newActive);
        }
      }

      setAllNodes((prev) => prev.filter((n) => !trashedIds.has(n.id)));
      if (selectedNode && trashedIds.has(selectedNode.id)) {
        setSelectedNode(null);
      }

      setCleanupModalOpen(false);
      setItemsToTrash([]);
      showToast(`¡Liberaste ${formatBytes(totalFreed)}! Se movieron a la papelera.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar los archivos';
      console.error('Deletion error:', err);
      showToast(msg, 'error');
    } finally {
      setIsProcessingCleanup(false);
    }
  };

  // Filtered view when user searches or filters by category
  const filteredActiveNode = useMemo((): DriveNode | null => {
    if (!activeNode) return null;

    if (!searchQuery && selectedCategory === 'all') {
      return activeNode;
    }

    const twoYearsAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 365 * 2;
    const lowerQuery = searchQuery.toLowerCase().trim();

    // Check if item matches criteria
    const matchesFilter = (n: DriveNode): boolean => {
      const matchesSearch = !lowerQuery || n.name.toLowerCase().includes(lowerQuery) || n.mimeType.toLowerCase().includes(lowerQuery);
      let matchesCat = true;

      if (selectedCategory === 'huge') {
        matchesCat = n.size >= 500 * 1024 * 1024;
      } else if (selectedCategory === 'stale') {
        matchesCat = Boolean(n.modifiedTime && new Date(n.modifiedTime).getTime() < twoYearsAgo);
      } else if (selectedCategory !== 'all') {
        matchesCat = n.category === selectedCategory;
      }

      return matchesSearch && matchesCat;
    };

    // If searching across all files, construct a dynamic virtual folder
    if (searchQuery) {
      const matchingFiles = allNodes.filter((n) => !n.isFolder && matchesFilter(n));
      return {
        id: 'search-results',
        name: `Resultados: "${searchQuery}"`,
        path: `Búsqueda: ${searchQuery}`,
        isFolder: true,
        mimeType: 'application/vnd.google-apps.folder',
        category: 'folder',
        size: matchingFiles.reduce((acc, f) => acc + f.size, 0),
        directSize: matchingFiles.reduce((acc, f) => acc + f.size, 0),
        fileCount: matchingFiles.length,
        folderCount: 0,
        children: matchingFiles,
      };
    }

    // Otherwise, filter children of the active node
    const filteredChildren = activeNode.children.filter((c) => {
      if (c.isFolder) {
        // Keep folder if it has matching descendants
        return matchesFilter(c) || c.size > 0;
      }
      return matchesFilter(c);
    });

    return {
      ...activeNode,
      children: filteredChildren,
      size: filteredChildren.reduce((acc, c) => acc + c.size, 0),
    };
  }, [activeNode, searchQuery, selectedCategory, allNodes]);

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      {/* Header */}
      <Header
        user={user}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onRescan={handleRescan}
        scanProgress={scanProgress}
        isLoggingIn={isLoggingIn}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner if demo mode is active */}
        {isDemoMode && (
          <div
            id="demo-mode-alert"
            className="p-4 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/30 border border-blue-200 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500 text-white shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-900 dark:text-slate-100 text-sm block">
                  Estás explorando el modo de demostración con datos de prueba
                </strong>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Conecta tu Google Drive para analizar tus archivos y carpetas reales con un solo clic.
                </p>
              </div>
            </div>

            <button
              id="banner-connect-drive-btn"
              type="button"
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl transition-colors shrink-0 shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Conectar mi Google Drive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quota bar & Storage Overview */}
        <StorageOverview
          quota={quota}
          allNodes={allNodes}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Treemap & Heatmap Section */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 w-full min-w-0">
            {rootNode && filteredActiveNode ? (
              <TreemapHeatmap
                rootNode={rootNode}
                activeNode={filteredActiveNode}
                onNavigateToNode={(node) => {
                  setActiveNode(node);
                  setSearchQuery('');
                }}
                onSelectNode={(node) => setSelectedNode(node)}
                onRequestTrash={handleRequestTrash}
                colorMode={colorMode}
                onChangeColorMode={setColorMode}
              />
            ) : (
              <div className="h-96 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-400">
                Cargando mapa de calor de Google Drive...
              </div>
            )}
          </div>

          {/* Details Drawer / Sidebar for selected element */}
          {selectedNode && (
            <FileDetailsDrawer
              selectedNode={selectedNode}
              onClose={() => setSelectedNode(null)}
              onNavigateToNode={(node) => {
                setActiveNode(node);
                setSelectedNode(null);
                setSearchQuery('');
              }}
              onRequestTrash={handleRequestTrash}
            />
          )}
        </div>

        {/* Cleanup Suggestions & Quick Wins */}
        <CleanupAdvisor
          allNodes={allNodes}
          onSelectNode={(node) => setSelectedNode(node)}
          onNavigateToNode={(node) => {
            setActiveNode(node);
            setSearchQuery('');
            window.scrollTo({ top: 180, behavior: 'smooth' });
          }}
          onRequestBulkTrash={handleRequestBulkTrash}
        />
      </main>

      {/* Confirmation Modal for deletion / trashing */}
      <CleanupModal
        isOpen={cleanupModalOpen}
        onClose={() => {
          if (!isProcessingCleanup) {
            setCleanupModalOpen(false);
            setItemsToTrash([]);
          }
        }}
        onConfirm={handleConfirmCleanup}
        items={itemsToTrash}
        isProcessing={isProcessingCleanup}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          id="status-toast"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900'
              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
