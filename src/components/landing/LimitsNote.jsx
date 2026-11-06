import { Info } from 'lucide-react';
import { motion } from 'framer-motion';

const limitations = [
  'Depth estimation works best with photos that have clear foreground/background separation.',
  'Very flat images (logos, text, solid colors) may produce minimal depth — try the Invert option.',
  'The first conversion downloads a ~25–50 MB AI model, cached for future use.',
  'Results are relief-style models (2.5D), not full 360° 3D scans.',
];

export default function LimitsNote() {
  return (
    <section className="py-16 md:py-20">
      <motion.div
        className="glass-card p-6 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info size={18} className="text-blue-500" aria-hidden="true" />
          </div>
          <h3 className="font-heading text-lg font-semibold">Good to Know</h3>
        </div>

        <ul className="space-y-2.5 ml-11">
          {limitations.map((item, index) => (
            <li
              key={index}
              className="text-sm leading-relaxed relative pl-4 before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-current before:opacity-30"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {item}
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
