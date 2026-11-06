import { motion } from 'framer-motion';
import { ShieldCheck, Lightbulb, Cpu, Github } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function About() {
  return (
    <main className="py-12 md:py-20">
      <motion.div
        className="glass-card-elevated max-w-4xl mx-auto p-6 md:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title */}
        <motion.div variants={sectionVariants} className="mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
            About <span className="gradient-text">DepthForge</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Learn how DepthForge transforms flat images into interactive 3D
            relief models using AI — entirely in your browser.
          </p>
        </motion.div>

        {/* Section 1 – How Depth-Based Relief Works */}
        <motion.section variants={sectionVariants} className="mb-10">
          <h2 className="font-heading text-xl font-semibold mb-3 flex items-center gap-2">
            <Cpu size={20} className="text-df-primary" aria-hidden="true" />
            How Depth-Based Relief Works
          </h2>
          <div
            className="space-y-3 text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <p>
              DepthForge uses a monocular depth estimation AI model called{' '}
              <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Depth Anything
              </strong>{' '}
              to predict per-pixel depth values from a single 2D image. Each
              pixel gets a depth value representing how far it is from the
              camera.
            </p>
            <p>
              This depth map is then used as a displacement map to deform a flat
              grid mesh in 3D space. Pixels with higher depth values are pushed
              further from the surface, creating a{' '}
              <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                relief sculpture
              </strong>{' '}
              — similar to a bas-relief carving. The original image is applied as
              a texture on top.
            </p>
            <p>
              The result is a 2.5D model: it has depth and shape when viewed
              from the front and at angles, but it&apos;s not a full 360°
              reconstruction. Think of it like a pop-up card or a topographic
              map of your photo.
            </p>
          </div>
        </motion.section>

        <div className="divider my-8" />

        {/* Section 2 – Tips for Best Results */}
        <motion.section variants={sectionVariants} className="mb-10">
          <h2 className="font-heading text-xl font-semibold mb-3 flex items-center gap-2">
            <Lightbulb size={20} className="text-amber-500" aria-hidden="true" />
            Tips for Best Results
          </h2>
          <ul
            className="space-y-2 text-sm leading-relaxed list-disc list-inside"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <li>
              Use photos with clear foreground/background separation — subjects
              standing in front of a distinct background work best.
            </li>
            <li>
              Avoid flat graphics, logos, text-heavy images, or solid-color
              illustrations — the AI needs visual depth cues.
            </li>
            <li>
              Good lighting helps. Well-lit photos with natural shadows provide
              better depth cues for the model.
            </li>
            <li>
              Portraits and landscape photos tend to produce the most impressive
              results.
            </li>
          </ul>
        </motion.section>

        <div className="divider my-8" />

        {/* Section 3 – Your Privacy */}
        <motion.section variants={sectionVariants} className="mb-10">
          <h2 className="font-heading text-xl font-semibold mb-3 flex items-center gap-2">
            <ShieldCheck
              size={20}
              className="text-emerald-500"
              aria-hidden="true"
            />
            Your Privacy
          </h2>
          <div
            className="text-sm leading-relaxed space-y-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <p>
              DepthForge runs <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>100% in your browser</strong>. Your images are
              never uploaded to any server. Depth estimation uses a local AI
              model that is downloaded once and cached. Saved models are stored
              in your browser&apos;s IndexedDB — they stay on your device and are
              never shared.
            </p>
            <p>
              There are no analytics, tracking cookies, or third-party services
              involved in image processing.
            </p>
          </div>
        </motion.section>

        <div className="divider my-8" />

        {/* Section 4 – Technical Details */}
        <motion.section variants={sectionVariants} className="mb-10">
          <h2 className="font-heading text-xl font-semibold mb-3 flex items-center gap-2">
            <Cpu size={20} className="text-df-cyan" aria-hidden="true" />
            Technical Details
          </h2>
          <ul
            className="space-y-2 text-sm leading-relaxed list-disc list-inside"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <li>
              <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>AI Model:</strong> Depth Anything (small variant) via
              Hugging Face Transformers.js, running in a Web Worker.
            </li>
            <li>
              <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>3D Rendering:</strong> Three.js with @react-three/fiber and
              @react-three/drei for declarative WebGL rendering.
            </li>
            <li>
              <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>State Management:</strong> Zustand for lightweight, performant
              global state.
            </li>
            <li>
              <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Storage:</strong> IndexedDB via the idb library for saving models
              locally.
            </li>
            <li>
              <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Exports:</strong> GLB (glTF Binary) and OBJ formats using Three.js
              exporters.
            </li>
          </ul>
        </motion.section>

        <div className="divider my-8" />

        {/* Section 5 – Open Source */}
        <motion.section variants={sectionVariants}>
          <h2 className="font-heading text-xl font-semibold mb-3 flex items-center gap-2">
            <Github size={20} aria-hidden="true" />
            Open Source
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            DepthForge is built with modern open-source technologies: React 18,
            Tailwind CSS, Three.js, Zustand, Framer Motion, and Hugging Face
            Transformers.js. The entire pipeline — from depth estimation to 3D
            mesh generation — runs client-side with zero server dependencies.
          </p>
        </motion.section>
      </motion.div>
    </main>
  );
}
