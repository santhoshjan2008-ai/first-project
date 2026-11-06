import { useState, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Upload, Sparkles } from 'lucide-react';
import { loadImage } from '../../lib/imageUtils';
import { generateProceduralSample } from '../../lib/proceduralSample';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageDropzone({ onImageLoaded, onError, onSampleLoaded }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const fileInputRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const validateAndLoad = useCallback(
    async (file) => {
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        onError('Unsupported file type. Please use JPG, PNG, or WebP.');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        onError('File is too large. Maximum size is 10 MB.');
        return;
      }

      try {
        const result = await loadImage(file);
        onImageLoaded({
          blob: file,
          url: result.url,
          width: result.width,
          height: result.height,
        });
      } catch (err) {
        onError(err.message || 'Failed to load image.');
      }
    },
    [onImageLoaded, onError]
  );

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer?.files?.[0];
      if (file) {
        validateAndLoad(file);
      }
    },
    [validateAndLoad]
  );

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        validateAndLoad(file);
      }
      e.target.value = '';
    },
    [validateAndLoad]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const handleTrySample = useCallback(async () => {
    setIsLoadingSample(true);
    try {
      const sample = await generateProceduralSample();
      if (onSampleLoaded) {
        onSampleLoaded(sample);
      } else {
        onImageLoaded({
          blob: sample.imageBlob,
          url: sample.imageUrl,
          width: sample.width,
          height: sample.height,
        });
      }
    } catch (err) {
      onError(err.message || 'Failed to generate sample image.');
    } finally {
      setIsLoadingSample(false);
    }
  }, [onSampleLoaded, onImageLoaded, onError]);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex items-center justify-center w-full"
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload an image by dropping or clicking"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative w-full max-w-xl rounded-2xl border-2 border-dashed
          transition-all duration-200 cursor-pointer
          flex flex-col items-center justify-center
          px-6 py-16 sm:py-20 text-center
          ${
            isDragOver
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
              : 'border-[var(--color-border-strong)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        <motion.div
          animate={
            isDragOver && !shouldReduceMotion
              ? { scale: 1.1, y: -4 }
              : { scale: 1, y: 0 }
          }
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div
            className={`
              mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl
              ${isDragOver ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}
              transition-colors duration-200
            `}
          >
            <Upload className="h-7 w-7" strokeWidth={1.5} />
          </div>
        </motion.div>

        <h3 className="font-heading text-lg font-semibold text-[var(--color-text-primary)] mb-1.5">
          {isDragOver ? 'Drop your image here' : 'Drop an image or click to upload'}
        </h3>
        <p className="text-sm text-[var(--color-text-tertiary)] mb-6">
          JPG, PNG, WebP · Max 10 MB
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleTrySample();
          }}
          onKeyDown={(e) => e.stopPropagation()}
          disabled={isLoadingSample}
          className="btn-secondary inline-flex items-center gap-2 text-sm"
          aria-label="Try a procedural sample image"
        >
          <Sparkles className="h-4 w-4" />
          {isLoadingSample ? 'Generating…' : 'Try a sample'}
        </button>
      </div>
    </motion.div>
  );
}
