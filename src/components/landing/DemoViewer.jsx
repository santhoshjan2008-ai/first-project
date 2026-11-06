import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import { buildMesh } from '../../lib/meshBuilder';
import { generateProceduralSample } from '../../lib/proceduralSample';

function SceneContent({ meshGroup }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.9} />
      <directionalLight position={[-3, 2, -4]} intensity={0.3} />
      <pointLight position={[0, 3, 0]} intensity={0.2} />
      {meshGroup && <primitive object={meshGroup} />}
    </>
  );
}

export default function DemoViewer() {
  const prefersReducedMotion = useReducedMotion();
  const [meshGroup, setMeshGroup] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const sample = await generateProceduralSample();
        const group = buildMesh({
          imageUrl: sample.imageUrl,
          depthData: sample.depthData,
          depthWidth: sample.width,
          depthHeight: sample.height,
          imageWidth: sample.width,
          imageHeight: sample.height,
          settings: {
            depthStrength: 0.35,
            resolution: 128,
            smoothing: 2,
            invertDepth: false,
            solidBody: true,
            thickness: 0.08,
          },
        });
        if (!cancelled) {
          setMeshGroup(group);
        }
      } catch (err) {
        console.error('DemoViewer init error:', err);
        if (!cancelled) setError(true);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return null;
  }

  return (
    <div
      className={`glass-card-elevated rounded-2xl overflow-hidden aspect-video ${
        !prefersReducedMotion ? 'animate-float' : ''
      }`}
    >
      <Canvas
        style={{ touchAction: 'none' }}
        camera={{ position: [0, 0.4, 1.8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <SceneContent meshGroup={meshGroup} />
        </Suspense>
        <OrbitControls
          autoRotate={!prefersReducedMotion}
          autoRotateSpeed={1.2}
          enableDamping
          dampingFactor={0.08}
          minDistance={0.8}
          maxDistance={4}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}
