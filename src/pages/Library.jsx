import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Sparkles, Folder } from 'lucide-react';
import { getAllModels, deleteModel, renameModel } from '../lib/db';
import { buildMesh } from '../lib/meshBuilder';
import { exportGLB } from '../lib/exporters';
import { useToast } from '../components/layout/ToastProvider';

import SearchSortBar from '../components/library/SearchSortBar';
import ModelGrid from '../components/library/ModelGrid';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import RenameDialog from '../components/ui/RenameDialog';

export default function Library() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Dialog states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Load models on mount
  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getAllModels();
      setModels(list || []);
    } catch (err) {
      console.error('Failed to load models:', err);
      addToast('Failed to load saved models.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Filter and sort models
  const filteredModels = useMemo(() => {
    let result = [...models];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((m) => (m.title || '').toLowerCase().includes(q));
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return (a.createdAt || 0) - (b.createdAt || 0);
      }
      if (sortBy === 'name-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'name-desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      return 0;
    });

    return result;
  }, [models, searchQuery, sortBy]);

  // Card actions
  const handleOpen = useCallback(
    (model) => {
      navigate(`/model/${model.id}`);
    },
    [navigate]
  );

  const handleStartRename = useCallback((model) => {
    setRenameTarget(model);
  }, []);

  const handleConfirmRename = useCallback(
    async (newTitle) => {
      if (!renameTarget) return;
      try {
        await renameModel(renameTarget.id, newTitle);
        setModels((prev) =>
          prev.map((m) => (m.id === renameTarget.id ? { ...m, title: newTitle } : m))
        );
        addToast('Model renamed successfully.', 'success');
      } catch (err) {
        addToast(err.message || 'Failed to rename model.', 'error');
      } finally {
        setRenameTarget(null);
      }
    },
    [renameTarget, addToast]
  );

  const handleStartDelete = useCallback((model) => {
    setDeleteTarget(model);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteModel(deleteTarget.id);
      setModels((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      addToast('Model deleted from library.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to delete model.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, addToast]);

  const handleExportGLB = useCallback(
    async (model) => {
      if (isExporting) return;
      setIsExporting(true);
      try {
        addToast(`Preparing "${model.title}" for download...`, 'info');
        const imgUrl = URL.createObjectURL(model.imageBlob);
        const floatDepth =
          model.depthData instanceof Float32Array
            ? model.depthData
            : new Float32Array(model.depthData);

        const group = buildMesh({
          imageUrl: imgUrl,
          depthData: floatDepth,
          depthWidth: model.depthWidth,
          depthHeight: model.depthHeight,
          imageWidth: model.depthWidth,
          imageHeight: model.depthHeight,
          settings: model.settings || {},
        });

        await exportGLB(group);
        URL.revokeObjectURL(imgUrl);
        addToast(`"${model.title}" exported as GLB`, 'success');
      } catch (err) {
        addToast(err.message || 'Failed to export GLB.', 'error');
      } finally {
        setIsExporting(false);
      }
    },
    [isExporting, addToast]
  );

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge">
              <Folder className="w-3.5 h-3.5" />
              Local Storage
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)]">
              {models.length} {models.length === 1 ? 'model' : 'models'}
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            My Models
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Browse and manage 3D relief models saved locally in your browser's IndexedDB.
          </p>
        </div>

        <Link
          to="/convert"
          className="btn-primary inline-flex items-center gap-2 text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversion</span>
        </Link>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6">
          <div className="skeleton h-10 w-full sm:w-80 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="glass-card overflow-hidden">
                <div className="skeleton aspect-video w-full" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {models.length > 0 && (
            <SearchSortBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          )}

          <ModelGrid
            models={filteredModels}
            onOpen={handleOpen}
            onRename={handleStartRename}
            onDelete={handleStartDelete}
            onExport={handleExportGLB}
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete 3D Model?"
        message={`Are you sure you want to remove "${deleteTarget?.title || 'Untitled model'}" from your local library? This action cannot be undone.`}
        confirmText="Delete Model"
        variant="danger"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Rename Modal */}
      <RenameDialog
        open={!!renameTarget}
        currentName={renameTarget?.title || ''}
        onClose={() => setRenameTarget(null)}
        onRename={handleConfirmRename}
      />
    </div>
  );
}

