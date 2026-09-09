import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  hierarchy,
  treemap as d3Treemap,
  treemapSquarify,
  HierarchyRectangularNode,
} from 'd3-hierarchy';
import {
  Folder,
  File,
  ChevronRight,
  ArrowUpLeft,
  ExternalLink,
  Trash2,
  Layers,
  Sparkles,
  Flame,
  Info,
  Maximize2,
  Calendar,
  Eye,
  UserCheck,
} from 'lucide-react';
import { DriveNode, HeatmapColorMode } from '../types';
import {
  formatBytes,
  formatDate,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  getHeatmapColorForRatio,
} from '../utils/format';

interface TreemapHeatmapProps {
  rootNode: DriveNode;
  activeNode: DriveNode;
  onNavigateToNode: (node: DriveNode) => void;
  onSelectNode: (node: DriveNode) => void;
  onRequestTrash: (node: DriveNode) => void;
  colorMode: HeatmapColorMode;
  onChangeColorMode: (mode: HeatmapColorMode) => void;
}

interface TileData {
  node: DriveNode;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  width: number;
  height: number;
  value: number;
}

export const TreemapHeatmap: React.FC<TreemapHeatmapProps> = ({
  rootNode,
  activeNode,
  onNavigateToNode,
  onSelectNode,
  onRequestTrash,
  colorMode,
  onChangeColorMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 900,
    height: 520,
  });
  const [hoveredTile, setHoveredTile] = useState<TileData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [heatmapPalette, setHeatmapPalette] = useState<'thermal' | 'fire'>('thermal');

  // Responsive container observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 50 && height > 50) {
          setDimensions({
            width: Math.floor(width),
            height: Math.floor(height),
          });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute breadcrumb path from rootNode to activeNode
  const breadcrumbs = useMemo(() => {
    const path: DriveNode[] = [];
    let curr: DriveNode | undefined = activeNode;

    const findAncestors = (current: DriveNode, targetId: string, acc: DriveNode[]): boolean => {
      acc.push(current);
      if (current.id === targetId) return true;
      for (const child of current.children) {
        if (findAncestors(child, targetId, acc)) return true;
      }
      acc.pop();
      return false;
    };

    const acc: DriveNode[] = [];
    if (findAncestors(rootNode, activeNode.id, acc)) {
      return acc;
    }
    return [activeNode];
  }, [rootNode, activeNode]);

  // Build Treemap layout with d3-hierarchy
  const tiles: TileData[] = useMemo(() => {
    if (!activeNode.children || activeNode.children.length === 0) {
      return [];
    }

    // Filter out 0 byte nodes to prevent layout zero-division
    const validChildren = activeNode.children.filter((c) => c.size > 0);
    if (validChildren.length === 0) return [];

    const treeData = {
      ...activeNode,
      children: validChildren,
    };

    const rootHierarchy = hierarchy<DriveNode>(treeData)
      .sum((d) => (d.children && d.children.length > 0 ? 0 : d.size))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3Treemap<DriveNode>()
      .tile(treemapSquarify.ratio(1.4))
      .size([dimensions.width, dimensions.height])
      .paddingInner(3)
      .paddingOuter(3)
      .round(true);

    treemapLayout(rootHierarchy);

    const leaves = (rootHierarchy as HierarchyRectangularNode<DriveNode>).leaves() as HierarchyRectangularNode<DriveNode>[];
    return leaves.map((leaf) => {
      const x0 = leaf.x0;
      const y0 = leaf.y0;
      const x1 = leaf.x1;
      const y1 = leaf.y1;
      const width = Math.max(0, x1 - x0);
      const height = Math.max(0, y1 - y0);

      return {
        node: leaf.data,
        x0,
        y0,
        x1,
        y1,
        width,
        height,
        value: leaf.value || leaf.data.size,
      };
    });
  }, [activeNode, dimensions]);

  // Min and max value among current tiles to establish a calibrated heatmap range
  const { minTileValue, maxTileValue } = useMemo(() => {
    if (tiles.length === 0) return { minTileValue: 0, maxTileValue: 1 };
    const vals = tiles.map((t) => t.value).filter((v) => v > 0);
    const minVal = vals.length > 0 ? Math.min(...vals) : 1;
    const maxVal = vals.length > 0 ? Math.max(...vals) : 1;
    return { minTileValue: minVal, maxTileValue: maxVal };
  }, [tiles]);

  // Compute color based on mode
  const getTileStyle = (tile: TileData) => {
    const { node, value } = tile;

    if (colorMode === 'category') {
      const catConfig = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.other;
      return {
        backgroundColor: catConfig.hex,
        contrastColor: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        isHot: false,
        ratio: 0,
      };
    }

    if (colorMode === 'age') {
      const now = new Date().getTime();
      const fileDate = node.modifiedTime ? new Date(node.modifiedTime).getTime() : now;
      const ageInYears = (now - fileDate) / (1000 * 60 * 60 * 24 * 365);

      // > 2 years -> hot rose (abandoned, prime for deletion)
      // > 1 year -> amber
      // < 6 months -> fresh emerald / blue
      let ratio = Math.min(1, Math.max(0, ageInYears / 2.5));
      const { hex, contrastText } = getHeatmapColorForRatio(ratio, heatmapPalette);
      return {
        backgroundColor: hex,
        contrastColor: contrastText,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        isHot: ratio >= 0.75,
        ratio,
      };
    }

    // Default: 'size' heatmap ("a mayor tamaño más fuerte el color")
    // Calibrate ratio between minTileValue (cold/light) and maxTileValue (hot/strongest)
    let ratio = 0.5;
    if (maxTileValue > minTileValue && minTileValue > 0) {
      // Relative spread from 0 (coolest/lightest) to 1 (hottest/strongest) within this active folder
      const logMin = Math.log(minTileValue);
      const logMax = Math.log(maxTileValue);
      const logVal = Math.log(Math.max(minTileValue, value));
      const relativeRatio = (logVal - logMin) / (logMax - logMin);

      // Absolute size factor: < 1MB = 0, 10MB = 0.25, 100MB = 0.5, 1GB = 0.75, >= 10GB = 1.0
      const log10Val = Math.log10(Math.max(1, value));
      const absoluteRatio = Math.max(0, Math.min(1, (log10Val - 6) / 4));

      // 70% relative to clearly contrast elements within any folder + 30% absolute for giant files
      ratio = Math.min(1, Math.max(0, relativeRatio * 0.7 + absoluteRatio * 0.3));
    } else if (maxTileValue > 0) {
      const log10Val = Math.log10(Math.max(1, value));
      ratio = Math.max(0, Math.min(1, (log10Val - 6) / 4));
    }

    const { hex, contrastText } = getHeatmapColorForRatio(ratio, heatmapPalette);
    return {
      backgroundColor: hex,
      contrastColor: contrastText,
      border: ratio >= 0.72 ? '1.5px solid rgba(255, 255, 255, 0.45)' : '1px solid rgba(255, 255, 255, 0.2)',
      isHot: ratio >= 0.72,
      ratio,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, tile: TileData) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHoveredTile(tile);
  };

  const parentFolder = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;

  return (
    <div
      id="treemap-heatmap-container"
      className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
    >
      {/* Top Toolbar & Navigation */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full text-xs sm:text-sm">
          {parentFolder && (
            <button
              id="navigate-parent-folder-btn"
              onClick={() => onNavigateToNode(parentFolder)}
              className="mr-1 p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-1 text-xs font-medium"
              title={`Subir a "${parentFolder.name}"`}
            >
              <ArrowUpLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Subir</span>
            </button>
          )}

          <div className="flex items-center gap-1 flex-wrap">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.id}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <button
                    id={`breadcrumb-crumb-${crumb.id}`}
                    onClick={() => onNavigateToNode(crumb)}
                    disabled={isLast}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                      isLast
                        ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold cursor-default'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {crumb.id === 'root' ? (
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span className="truncate max-w-[140px] sm:max-w-[200px]">{crumb.name}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Color Mode Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden md:inline">
            Modo de color:
          </span>
          <div className="inline-flex p-0.5 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700">
            <button
              id="color-mode-size-btn"
              type="button"
              onClick={() => onChangeColorMode('size')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                colorMode === 'size'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tamaño (Calor)
            </button>
            <button
              id="color-mode-category-btn"
              type="button"
              onClick={() => onChangeColorMode('category')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                colorMode === 'category'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tipo de Archivo
            </button>
            <button
              id="color-mode-age-btn"
              type="button"
              onClick={() => onChangeColorMode('age')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                colorMode === 'age'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Antigüedad / Inactivos
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Legend Bar */}
      <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>Vista actual:</span>
          <strong className="text-slate-800 dark:text-slate-200 font-semibold">
            {formatBytes(activeNode.size)}
          </strong>
          <span>en {tiles.length} elementos</span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <UserCheck className="w-2.5 h-2.5" />
            Solo propios
          </span>
        </div>

        {colorMode === 'size' && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Palette sub-toggle */}
            <div className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => setHeatmapPalette('thermal')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  heatmapPalette === 'thermal'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Térmico (Frío a Calor)
              </button>
              <button
                type="button"
                onClick={() => setHeatmapPalette('fire')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  heatmapPalette === 'fire'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Fuego (Ámbar a Rojo)
              </button>
            </div>

            {/* Heat gradient bar */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {formatBytes(minTileValue)} (Ligero)
              </span>
              <div
                className={`w-24 sm:w-32 h-2.5 rounded-full shadow-inner ${
                  heatmapPalette === 'fire'
                    ? 'bg-gradient-to-r from-[#fef08a] via-[#f59e0b] via-[#ea580c] via-[#dc2626] to-[#991b1b]'
                    : 'bg-gradient-to-r from-[#0284c7] via-[#0d9488] via-[#10b981] via-[#eab308] via-[#ea580c] to-[#dc2626]'
                }`}
              />
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                {formatBytes(maxTileValue)} <span title="Mayor consumo">🔥</span>
              </span>
            </div>
          </div>
        )}

        {colorMode === 'age' && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]">Reciente</span>
            <div className="w-20 sm:w-28 h-2 rounded-full bg-gradient-to-r from-[#0284c7] via-[#10b981] via-[#eab308] via-[#ea580c] to-[#dc2626]" />
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              &gt; 2 años sin tocar
            </span>
          </div>
        )}

        {colorMode === 'category' && (
          <div className="hidden lg:flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Videos
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Archivos/ISO
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> Fotos
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Documentos
            </span>
          </div>
        )}
      </div>

      {/* Main Treemap Canvas Stage */}
      <div
        ref={containerRef}
        id="treemap-canvas-stage"
        className="relative flex-1 min-h-[460px] w-full bg-slate-100 dark:bg-slate-950 overflow-hidden cursor-default select-none"
        onMouseLeave={() => setHoveredTile(null)}
      >
        {tiles.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <Folder className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Esta carpeta no contiene archivos directos con tamaño registrado.
            </p>
            {parentFolder && (
              <button
                onClick={() => onNavigateToNode(parentFolder)}
                className="mt-3 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-lg hover:underline"
              >
                Volver a {parentFolder.name}
              </button>
            )}
          </div>
        ) : (
          tiles.map((tile) => {
            const style = getTileStyle(tile);
            const isFolder = tile.node.isFolder;
            const percentage = ((tile.value / (activeNode.size || 1)) * 100).toFixed(1);

            // Hide labels on very small tiles to keep UI clean
            const canShowText = tile.width > 55 && tile.height > 38;
            const canShowDetails = tile.width > 95 && tile.height > 60;
            const canShowActions = tile.width > 120 && tile.height > 85;

            return (
              <div
                key={tile.node.id}
                id={`treemap-tile-${tile.node.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFolder) {
                    onNavigateToNode(tile.node);
                  } else {
                    onSelectNode(tile.node);
                  }
                }}
                onMouseMove={(e) => handleMouseMove(e, tile)}
                style={{
                  position: 'absolute',
                  left: `${tile.x0}px`,
                  top: `${tile.y0}px`,
                  width: `${tile.width}px`,
                  height: `${tile.height}px`,
                  backgroundColor: style.backgroundColor,
                  color: style.contrastColor,
                  border: style.border,
                }}
                className="rounded-lg p-2 overflow-hidden transition-all duration-150 hover:brightness-110 hover:shadow-lg hover:z-20 group cursor-pointer flex flex-col justify-between"
              >
                {canShowText && (
                  <div className="flex items-start justify-between gap-1 leading-tight min-w-0">
                    <div className="flex items-center gap-1 min-w-0">
                      {isFolder ? (
                        <Folder className="w-3.5 h-3.5 shrink-0 opacity-90" />
                      ) : (
                        <File className="w-3.5 h-3.5 shrink-0 opacity-90" />
                      )}
                      <span className="font-semibold text-xs truncate drop-shadow-xs">
                        {tile.node.name}
                      </span>
                    </div>
                    {style.isHot && colorMode === 'size' && tile.width > 95 && (
                      <span
                        className="px-1 py-0.5 rounded bg-black/30 text-[10px] font-bold shrink-0 flex items-center gap-0.5 leading-none"
                        title="Elemento de alto consumo de espacio"
                      >
                        <Flame className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                      </span>
                    )}
                  </div>
                )}

                {canShowDetails && (
                  <div className="mt-auto pt-1 flex items-end justify-between gap-1 text-[11px]">
                    <div className="flex flex-col">
                      <span className="font-mono font-extrabold text-xs leading-none drop-shadow-xs flex items-center gap-1">
                        {formatBytes(tile.value)}
                        {style.isHot && colorMode === 'size' && (
                          <span className="text-[11px]" title="Consumo alto">
                            🔥
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] opacity-85 mt-0.5 font-medium">
                        {percentage}% {isFolder ? `(${tile.node.fileCount} arch.)` : ''}
                      </span>
                    </div>

                    {canShowActions && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectNode(tile.node);
                          }}
                          className="p-1 rounded-md bg-black/25 hover:bg-black/40 text-white transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRequestTrash(tile.node);
                          }}
                          className="p-1 rounded-md bg-rose-950/60 hover:bg-rose-700 text-white transition-colors"
                          title="Mover a papelera para liberar espacio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Hover Floating Tooltip */}
        {hoveredTile && (
          <div
            id="treemap-hover-tooltip"
            style={{
              left: `${Math.min(Math.max(10, tooltipPos.x + 15), dimensions.width - 280)}px`,
              top: `${Math.min(Math.max(10, tooltipPos.y + 15), dimensions.height - 180)}px`,
            }}
            className="pointer-events-none absolute z-50 w-68 bg-slate-900/95 text-white p-3 rounded-xl shadow-2xl border border-slate-700 text-xs backdrop-blur-md space-y-1.5"
          >
            <div className="flex items-center gap-1.5 font-semibold text-slate-100 pb-1 border-b border-slate-700/80">
              {hoveredTile.node.isFolder ? (
                <Folder className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <File className="w-4 h-4 text-blue-400 shrink-0" />
              )}
              <span className="truncate">{hoveredTile.node.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-400 block">Tamaño:</span>
                <strong className="text-white font-mono text-sm">
                  {formatBytes(hoveredTile.value)}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Proporción:</span>
                <strong className="text-white font-mono text-sm">
                  {((hoveredTile.value / (activeNode.size || 1)) * 100).toFixed(1)}%
                </strong>
              </div>
            </div>

            {colorMode === 'size' && (
              <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Intensidad térmica:</span>
                {(() => {
                  const style = getTileStyle(hoveredTile);
                  return (
                    <span className="font-semibold flex items-center gap-1 text-amber-300">
                      {style.isHot
                        ? '🔥 Muy Pesado / Crítico'
                        : style.ratio > 0.45
                        ? '⚡ Moderado'
                        : '❄️ Suave / Ligero'}
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({Math.round(style.ratio * 100)}%)
                      </span>
                    </span>
                  );
                })()}
              </div>
            )}

            <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800 space-y-0.5">
              {hoveredTile.node.isFolder ? (
                <div>
                  Archivos dentro: <strong>{hoveredTile.node.fileCount}</strong>
                </div>
              ) : (
                <div>
                  Categoría: <strong>{CATEGORY_LABELS[hoveredTile.node.category]}</strong>
                </div>
              )}
              {hoveredTile.node.modifiedTime && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>Modificado: {formatDate(hoveredTile.node.modifiedTime)}</span>
                </div>
              )}
            </div>

            <div className="text-[10px] text-amber-300 pt-0.5 font-medium">
              {hoveredTile.node.isFolder
                ? '👉 Clic para abrir y explorar esta carpeta'
                : '👉 Clic para ver opciones de limpieza y detalles'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
