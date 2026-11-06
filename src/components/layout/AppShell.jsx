import { useEffect } from 'react';
import useThemeStore from '../../store/themeStore';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppShell({ children }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: 'var(--color-bg-gradient)' }}>
      {/* Decorative background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {/* Top-right pink/rose blob */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-pink-300/20 dark:bg-pink-500/5 blur-3xl" />
        {/* Left-center violet blob */}
        <div className="absolute top-1/2 -left-32 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-300/15 dark:bg-violet-500/5 blur-3xl" />
        {/* Bottom-right cyan blob */}
        <div className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full bg-cyan-300/15 dark:bg-cyan-500/5 blur-3xl" />
      </div>

      <Navbar />

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <Footer />
    </div>
  );
}
