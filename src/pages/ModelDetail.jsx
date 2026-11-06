import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Layers,
  Download,
  Camera,
  Pencil,
  Trash2,
  ExternalLink,
  RotateCcw,
  RefreshCw,
  Grid3X3,
  Maximize2,
  Minimize2,
  AlertCircle,
} from 'lucide-react';
import { getModel, deleteModel, renameModel } from '../lib/db';
import { buildMesh } from '../lib/meshBuilder';
import { exportGLB, exportOBJ, exportPNG } from '../lib/exporters';
import { useToast } from '../components/layout/ToastProvider';
import { useConvertStore } from '../store/convertStore';
import { useSettingsStore } from '../store/settingsStore';
import { useCoarsePointer } from '../hooks/useCoarsePointer';

import ModelViewer from '../components/converter/ModelViewer';
import ViewerToolbar from '../components/converter/ViewerToolbar';
import GestureHints from '../components/converter/GestureHints';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import RenameDialog from '../components/ui/RenameDialog';

export default function ModelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isCoarse = useCoarsePointer();

  const setImage = useConvertStore((s) => s.setImage);
  const setDepthResult = useConvertStore((s) => s.setDepthResult);
  const applyPreset = useSettingsStore((s) => s.applyPreset);

  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dialog states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);

  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const objectUrlRef = useRef(null);

  // Load model from IndexedDB
  useEffect(() => {
    let cancelled = false;

    async function fetchModel() {
      try {
        setLoading(true);
        setError(null);
        const data = await getModel(id);
        if (cancelled) return;

        if (!data) {
          setError('Model not found in your local library.');
          return;
        }

        setModel(data);
        if (data.settings?.wireframe !== undefined) {
          setWireframe(data.settings.wireframe);
        }
      } catch (err) {
        console.error('Failed to load model from DB:', err);
        if (!cancelled) {
          setError(err.message || 'Failed to retrieve model.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchModel();

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [id]);

  // Handle Fullscreen state change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Construct 3D Mesh from saved data
  const meshGroup = useMemo(() => {
    if (!model?.imageBlob || !model?.depthData) return null;

    try {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const imgUrl = URL.createObjectURL(model.imageBlob);
      objectUrlRef.current = imgUrl;

      const floatDepth =
        model.depthData instanceof Float32Array
          ? model.depthData
          : new Float32Array(model.depthData);

      return buildMesh({
        imageUrl: imgUrl,
        depthData: floatDepth,
        depthWidth: model.depthWidth,
        depthHeight: model.depthHeight,
        imageWidth: model.depthWidth,
        imageHeight: model.depthHeight,
        settings: model.settings || {},
      });
    } catch (err) {
      console.error('Error rebuilding mesh:', err);
      return null;
    }
  }, [model]);

  // Actions
  const handleResetView = useCallback(() => {
    setResetTrigger((prev) => prev + 1);
  }, []);

  const handleToggleAutoRotate = useCallback(() => {
    setAutoRotate((prev) => !prev);
  }, []);

  const handleToggleWireframe = useCallback(() => {
    setWireframe((prev) => !prev);
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    if (!viewportRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await viewportRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  }, []);

  const handleSnapshot = useCallback(async () => {
    try {
      const canvas = viewportRef.current?.querySelector('canvas') || canvasRef.current;
      if (!canvas) throw new Error('Canvas not found.');
      await exportPNG(canvas);
      addToast('Snapshot saved as PNG', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to capture snapshot.', 'error');
    }
  }, [addToast]);

  const handleExportGLB = useCallback(async () => {
    if (!meshGroup) return;
    try {
      await exportGLB(meshGroup);
      addToast(`"${model?.title}" exported as GLB`, 'success');
    } catch (err) {
      addToast(err.message || 'GLB export failed.', 'error');
    }
  }, [meshGroup, model?.title, addToast]);

  const handleExportOBJ = useCallback(() => {
    if (!meshGroup) return;
    try {
      exportOBJ(meshGroup);
      addToast(`"${model?.title}" exported as OBJ`, 'success');
    } catch (err) {
      addToast(err.message || 'OBJ export failed.', 'error');
    }
  }, [meshGroup, model?.title, addToast]);

  const handleConfirmRename = useCallback(
    async (newTitle) => {
      if (!model) return;
      try {
        await renameModel(model.id, newTitle);
        setModel((prev) => (prev ? { ...prev, title: newTitle } : prev));
        addToast('Model renamed.', 'success');
      } catch (err) {
        addToast(err.message || 'Failed to rename.', 'error');
      } finally {
        setRenameOpen(false);
      }
    },
    [model, addToast]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!model) return;
    try {
      await deleteModel(model.id);
      addToast('Model deleted from library.', 'success');
      navigate('/library');
    } catch (err) {
      addToast(err.message || 'Failed to delete.', 'error');
    } finally {
      setDeleteOpen(false);
    }
  }, [model, navigate, addToast]);

  // Open this saved model in Converter Studio
  const handleOpenInStudio = useCallback(() => {
    if (!model) return;
    const url = URL.createObjectURL(model.imageBlob);
    setImage({
      blob: model.imageBlob,
      url,
      width: model.depthWidth,
      height: model.depthHeight,
    });
    const floatDepth =
      model.depthData instanceof Float32Array
        ? model.depthData
        : new Float32Array(model.depthData);
    setDepthResult(floatDepth, model.depthWidth, model.depthHeight);
    if (model.settings) {
      applyPreset(model.settings);
    }
    navigate('/convert');
  }, [model, setImage, setDepthResult, applyPreset, navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-transparent border-t-[var(--color-primary)] rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)]">Loading model from library...</p>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] p-4">
        <div className="glass-card-elevated p-8 max-w-md text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--color-danger-light)] flex items-center justify-center text-[var(--color-danger)]">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[var(--color-text-primary)] mb-2">
            Model Not Found
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            {error || "The requested 3D model doesn't exist in your local library."}
          </p>
          <Link to="/library" className="btn-primary inline-flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Library</span>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = model.createdAt
    ? new Date(model.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown';

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-4 md:p-6 flex flex-col pb-16">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/library"
            className="btn-icon bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]"
            aria-label="Back to library"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)] truncate max-w-[300px] sm:max-w-md">
                {model.title || 'Untitled model'}
              </h1>
              <button
                onClick={() => setRenameOpen(true)}
                className="btn-icon w-8 h-8 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                aria-label="Rename model"
                title="Rename model"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-tertiary)] mt-0.5">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
              <span>
                {model.depthWidth} × {model.depthHeight} px
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenInStudio}
            className="btn-secondary text-xs px-3 py-2 inline-flex items-center gap-1.5"
            title="Open in Converter Studio to tweak settings"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Studio</span>
          </button>
          <button
            onClick={handleExportGLB}
            className="btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export GLB</span>
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="btn-icon w-9 h-9 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
            aria-label="Delete model"
            title="Delete model"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewport & Info Card */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 items-stretch min-h-[600px]">
        {/* 3D Model Viewport */}
        <div
          ref={viewportRef}
          className="relative flex-1 min-h-[60vh] lg:min-h-[700px] glass-card overflow-hidden flex items-center justify-center"
          style={{
            background:
              model.settings?.background === 'neutral'
                ? '#1e222e'
                : 'radial-gradient(ellipse at center, rgba(30, 35, 52, 0.9) 0%, rgba(13, 16, 24, 0.98) 100%)',
          }}
        >
          {meshGroup && (
            <>
              <ModelViewer
                meshGroup={meshGroup}
                wireframe={wireframe}
                autoRotate={autoRotate}
                background={model.settings?.background || 'gradient'}
                resetTrigger={resetTrigger}
                onResetView={handleResetView}
                onCanvasRef={(c) => {
                  canvasRef.current = c;
                }}
              />

              <GestureHints isCoarsePointer={isCoarse} />

              <ViewerToolbar
                onResetView={handleResetView}
                onToggleAutoRotate={handleToggleAutoRotate}
                onToggleWireframe={handleToggleWireframe}
                onToggleFullscreen={handleToggleFullscreen}
                onSnapshot={handleSnapshot}
                autoRotate={autoRotate}
                wireframe={wireframe}
                isFullscreen={isFullscreen}
              />
            </>
          )}
        </div>

        {/* Sidebar Info Panel */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Model Details
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-tertiary)]">Title</span>
                <span className="font-medium text-[var(--color-text-primary)] truncate max-w-[160px]">
                  {model.title}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-tertiary)]">Created</span>
                <span className="text-[var(--color-text-secondary)]">{formattedDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-tertiary)]">Resolution</span>
                <span className="text-[var(--color-text-secondary)]">
                  {model.settings?.resolution || 256} grid
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-tertiary)]">Depth Strength</span>
                <span className="text-[var(--color-text-secondary)]">
                  {model.settings?.depthStrength ?? 0.35}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-tertiary)]">Smoothing</span>
                <span className="text-[var(--color-text-secondary)]">
                  {model.settings?.smoothing ?? 2}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-tertiary)]">Solid Body</span>
                <span className="text-[var(--color-text-secondary)]">
                  {model.settings?.solidBody ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[var(--color-text-tertiary)]">Thickness</span>
                <span className="text-[var(--color-text-secondary)]">
                  {model.settings?.thickness ?? 0.08}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleExportGLB}
                className="btn-secondary w-full text-xs py-2.5 inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download GLB</span>
              </button>
              <button
                onClick={handleExportOBJ}
                className="btn-secondary w-full text-xs py-2.5 inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download OBJ</span>
              </button>
              <button
                onClick={handleSnapshot}
                className="btn-secondary w-full text-xs py-2.5 inline-flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Snapshot PNG</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      <RenameDialog
        open={renameOpen}
        currentName={model.title || ''}
        onClose={() => setRenameOpen(false)}
        onRename={handleConfirmRename}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Model?"
        message={`Are you sure you want to delete "${model.title}"?`}
        confirmText="Delete"
        variant="danger"
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

