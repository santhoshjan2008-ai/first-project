import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useConvertStore } from '../store/convertStore';
import { useSettingsStore } from '../store/settingsStore';
import { useDepthEstimator } from '../hooks/useDepthEstimator';
import { useCoarsePointer } from '../hooks/useCoarsePointer';
import { useToast } from '../components/layout/ToastProvider';
import { buildMesh } from '../lib/meshBuilder';
import { resizeImage, generateThumbnail } from '../lib/imageUtils';
import { saveModel } from '../lib/db';
import { exportGLB, exportOBJ, exportPNG } from '../lib/exporters';

import ImageDropzone from '../components/converter/ImageDropzone';
import ProcessingOverlay from '../components/converter/ProcessingOverlay';
import ModelViewer from '../components/converter/ModelViewer';
import ViewerToolbar from '../components/converter/ViewerToolbar';
import GestureHints from '../components/converter/GestureHints';
import ControlsPanel from '../components/converter/ControlsPanel';
import BottomSheet from '../components/converter/BottomSheet';
import SaveModelDialog from '../components/converter/SaveModelDialog';

export default function Convert() {
  const { addToast } = useToast();
  const isCoarse = useCoarsePointer();
  const { estimate, cancel } = useDepthEstimator();

  const status = useConvertStore((s) => s.status);
  const image = useConvertStore((s) => s.image);
  const depthData = useConvertStore((s) => s.depthData);
  const depthWidth = useConvertStore((s) => s.depthWidth);
  const depthHeight = useConvertStore((s) => s.depthHeight);
  const error = useConvertStore((s) => s.error);
  const setImage = useConvertStore((s) => s.setImage);
  const setDepthResult = useConvertStore((s) => s.setDepthResult);
  const setStatus = useConvertStore((s) => s.setStatus);
  const setError = useConvertStore((s) => s.setError);
  const reset = useConvertStore((s) => s.reset);

  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const viewportRef = useRef(null);
  const canvasRef = useRef(null);

  // Warn before leaving with unsaved work
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (status === 'ready' && !isSaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status, isSaved]);

  // Handle Fullscreen state change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Process user uploaded image
  const handleImageLoaded = useCallback(
    async ({ blob, url, width, height }) => {
      try {
        setIsSaved(false);
        // Create an ImageBitmap to resize if larger than 1024px
        let processedBlob = blob;
        let pWidth = width;
        let pHeight = height;
        let pUrl = url;

        if (width > 1024 || height > 1024) {
          const bitmap = await createImageBitmap(blob);
          const resized = await resizeImage(bitmap, 1024);
          bitmap.close();
          processedBlob = resized.blob;
          pWidth = resized.width;
          pHeight = resized.height;
          pUrl = URL.createObjectURL(processedBlob);
        }

        setImage({
          blob: processedBlob,
          url: pUrl,
          width: pWidth,
          height: pHeight,
        });

        // Run depth estimation
        estimate(processedBlob);
      } catch (err) {
        setError(err.message || 'Failed to prepare image.');
      }
    },
    [setImage, estimate, setError]
  );

  // Instant procedural sample handler (no worker estimation needed)
  const handleSampleLoaded = useCallback(
    (sample) => {
      setIsSaved(false);
      setImage({
        blob: sample.imageBlob,
        url: sample.imageUrl,
        width: sample.width,
        height: sample.height,
      });
      setDepthResult(sample.depthData, sample.width, sample.height);
      addToast('Procedural sample loaded!', 'info');
    },
    [setImage, setDepthResult, addToast]
  );

  // Live mesh construction — pure geometry rebuild on slider change, never re-estimates depth
  const meshGroup = useMemo(() => {
    if (!image?.url || !depthData || depthWidth <= 0 || depthHeight <= 0) {
      return null;
    }

    try {
      return buildMesh({
        imageUrl: image.url,
        depthData,
        depthWidth,
        depthHeight,
        imageWidth: image.width,
        imageHeight: image.height,
        settings,
      });
    } catch (err) {
      console.error('Failed to construct mesh:', err);
      return null;
    }
  }, [
    image?.url,
    image?.width,
    image?.height,
    depthData,
    depthWidth,
    depthHeight,
    settings.depthStrength,
    settings.resolution,
    settings.smoothing,
    settings.invertDepth,
    settings.solidBody,
    settings.thickness,
  ]);

  // Viewer Toolbar actions
  const handleResetView = useCallback(() => {
    setResetTrigger((prev) => prev + 1);
  }, []);

  const handleToggleAutoRotate = useCallback(() => {
    updateSetting('autoRotate', !settings.autoRotate);
  }, [updateSetting, settings.autoRotate]);

  const handleToggleWireframe = useCallback(() => {
    updateSetting('wireframe', !settings.wireframe);
  }, [updateSetting, settings.wireframe]);

  const handleToggleFullscreen = useCallback(async () => {
    if (!viewportRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await viewportRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  }, []);

  const handleSnapshot = useCallback(async () => {
    try {
      const canvas = viewportRef.current?.querySelector('canvas') || canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not found.');
      }
      await exportPNG(canvas);
      addToast('Snapshot saved as PNG', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to capture snapshot.', 'error');
    }
  }, [addToast]);

  // Export handlers
  const handleExportGLB = useCallback(async () => {
    if (!meshGroup) {
      addToast('No 3D model ready for export.', 'error');
      return;
    }
    try {
      await exportGLB(meshGroup);
      addToast('Model exported as GLB', 'success');
    } catch (err) {
      addToast(err.message || 'GLB export failed.', 'error');
    }
  }, [meshGroup, addToast]);

  const handleExportOBJ = useCallback(() => {
    if (!meshGroup) {
      addToast('No 3D model ready for export.', 'error');
      return;
    }
    try {
      exportOBJ(meshGroup);
      addToast('Model exported as OBJ', 'success');
    } catch (err) {
      addToast(err.message || 'OBJ export failed.', 'error');
    }
  }, [meshGroup, addToast]);

  // Save to IndexedDB
  const handleSaveToLibrary = useCallback(
    async (title) => {
      if (!image?.blob || !depthData) {
        addToast('No model data available to save.', 'error');
        return;
      }
      try {
        const thumbnailBlob = await generateThumbnail(image.blob, 320);
        const modelRecord = {
          id: crypto.randomUUID ? crypto.randomUUID() : `model_${Date.now()}`,
          title: title || 'Untitled model',
          createdAt: Date.now(),
          settings: { ...settings },
          imageBlob: image.blob,
          depthData: depthData.buffer.slice(0),
          depthWidth,
          depthHeight,
          thumbnailBlob,
        };
        await saveModel(modelRecord);
        setIsSaved(true);
        setSaveDialogOpen(false);
        addToast(`"${modelRecord.title}" saved to My Models!`, 'success');
      } catch (err) {
        addToast(err.message || 'Failed to save model.', 'error');
      }
    },
    [image, depthData, depthWidth, depthHeight, settings, addToast]
  );

  const handleConvertAnother = useCallback(() => {
    cancel();
    reset();
  }, [cancel, reset]);

  return (
    <div className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto p-3 sm:p-4 md:p-6 pb-20 lg:pb-6">
      {/* Studio Header on Desktop */}
      <div className="hidden lg:flex items-center justify-between mb-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Converter Studio
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Transform any photo into a 3D relief model with interactive depth control.
          </p>
        </div>
        {status === 'ready' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleConvertAnother}
              className="btn-secondary text-xs px-3.5 py-2"
            >
              Convert Another
            </button>
            <button
              onClick={() => setSaveDialogOpen(true)}
              className="btn-primary text-xs px-3.5 py-2"
            >
              Save to Library
            </button>
          </div>
        )}
      </div>

      {/* Main Studio Two-Column / Mobile Stack Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 items-stretch min-h-[600px]">
        {/* Left Column: 3D Viewport (~70% on desktop, top 55vh on mobile) */}
        <div
          ref={viewportRef}
          className="relative flex-1 min-h-[50vh] sm:min-h-[55vh] lg:min-h-[700px] glass-card overflow-hidden flex items-center justify-center border border-[var(--color-border)]"
          style={{
            background:
              settings.background === 'neutral'
                ? '#1e222e'
                : 'radial-gradient(ellipse at center, rgba(30, 35, 52, 0.9) 0%, rgba(13, 16, 24, 0.98) 100%)',
          }}
        >
          {/* STATE 1: Empty / Idle Dropzone */}
          {status === 'idle' && (
            <div className="w-full max-w-xl p-4 sm:p-8">
              <ImageDropzone
                onImageLoaded={handleImageLoaded}
                onSampleLoaded={handleSampleLoaded}
                onError={(msg) => addToast(msg, 'error')}
              />
            </div>
          )}

          {/* STATE 2: Processing Overlay */}
          {status === 'processing' && (
            <>
              {image?.url && (
                <img
                  src={image.url}
                  alt="Original upload"
                  className="absolute inset-0 w-full h-full object-contain opacity-20 blur-md pointer-events-none"
                />
              )}
              <ProcessingOverlay onCancel={cancel} />
            </>
          )}

          {/* STATE 3: Ready — Interactive 3D Model Viewer */}
          {status === 'ready' && meshGroup && (
            <>
              <ModelViewer
                meshGroup={meshGroup}
                wireframe={settings.wireframe}
                autoRotate={settings.autoRotate}
                background={settings.background}
                resetTrigger={resetTrigger}
                onResetView={handleResetView}
                onCanvasRef={(c) => {
                  canvasRef.current = c;
                }}
              />

              {/* Gesture Hint Chips (auto fades after 4s) */}
              <GestureHints isCoarsePointer={isCoarse} />

              {/* Floating Bottom Toolbar */}
              <ViewerToolbar
                onResetView={handleResetView}
                onToggleAutoRotate={handleToggleAutoRotate}
                onToggleWireframe={handleToggleWireframe}
                onToggleFullscreen={handleToggleFullscreen}
                onSnapshot={handleSnapshot}
                autoRotate={settings.autoRotate}
                wireframe={settings.wireframe}
                isFullscreen={isFullscreen}
              />
            </>
          )}

          {/* STATE 4: Inline Error Card */}
          {status === 'error' && (
            <div className="glass-card-elevated p-8 max-w-md mx-4 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--color-danger-light)] flex items-center justify-center text-[var(--color-danger)]">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-2">
                Processing Error
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                {error || 'Unable to estimate depth for this image. Please try another image.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={reset} className="btn-secondary text-sm">
                  Try Another Image
                </button>
                {image?.blob && (
                  <button
                    onClick={() => estimate(image.blob)}
                    className="btn-primary text-sm inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Controls Panel (~30% on desktop) */}
        <div className="hidden lg:block w-[360px] xl:w-[400px] shrink-0">
          <ControlsPanel
            onExportGLB={handleExportGLB}
            onExportOBJ={handleExportOBJ}
            onSave={() => setSaveDialogOpen(true)}
            onConvertAnother={handleConvertAnother}
            onSnapshot={handleSnapshot}
          />
        </div>
      </div>

      {/* Mobile Bottom Sheet Controls (< 1024px) */}
      <div className="lg:hidden">
        <BottomSheet>
          <div className="px-2 pb-6">
            <ControlsPanel
              onExportGLB={handleExportGLB}
              onExportOBJ={handleExportOBJ}
              onSave={() => setSaveDialogOpen(true)}
              onConvertAnother={handleConvertAnother}
              onSnapshot={handleSnapshot}
            />
          </div>
        </BottomSheet>
      </div>

      {/* Save to Library Modal Dialog */}
      <SaveModelDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveToLibrary}
      />
    </div>
  );
}

