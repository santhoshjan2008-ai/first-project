import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="font-heading text-8xl font-bold gradient-text mb-4">
          404
        </h1>
        <h2 className="font-heading text-2xl font-semibold mb-2">
          Page not found
        </h2>
        <p
          className="text-sm mb-8 leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium"
          >
            Go Home
          </Link>
          <Link
            to="/convert"
            className="btn-secondary px-6 py-2.5 rounded-xl text-sm font-medium"
          >
            Start Converting
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
