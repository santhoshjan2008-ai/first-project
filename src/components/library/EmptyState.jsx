import { Link } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <FolderOpen
        size={56}
        strokeWidth={1.2}
        className="mb-5"
        style={{ color: 'var(--color-text-tertiary)' }}
        aria-hidden="true"
      />
      <h3 className="font-heading text-xl font-semibold mb-2">
        No saved models yet
      </h3>
      <p
        className="text-sm mb-6 max-w-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Convert an image to 3D and save it to your library
      </p>
      <Link to="/convert" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium">
        Start Converting
      </Link>
    </motion.div>
  );
}
