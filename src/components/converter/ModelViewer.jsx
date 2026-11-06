import { useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import DepthMesh from './DepthMesh';
import { useWebGLSupport } from '../../hooks/useWebGLSupport';
import { AlertTriangle } from 'lucide-react';

function SceneSetup({ meshGroup, autoRotate, background, resetTrigger }) {
  const { camera, scene } = useThree();
  const controlsRef = useRef();

  const resetCamera = useCallback(() => {
    if (!meshGroup) return;

    const box = new THREE.Box3().setFromObject(meshGroup);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z, 0.5);
    const fov = camera.fov * (Math.PI / 180);
    let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
    cameraDistance *= 1.6;

    camera.position.set(
      center.x + cameraDistance * 0.4,
      center.y + cameraDistance * 0.35,
      center.z + cameraDistance
    );
    camera.near = cameraDistance * 0.01;
    camera.far = cameraDistance * 20;
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.copy(center);
      controlsRef.current.minDistance = cameraDistance * 0.2;
      controlsRef.current.maxDistance = cameraDistance * 6;
      controlsRef.current.update();
    }
  }, [meshGroup, camera]);

  // Frame to model when mesh or resetTrigger changes
  useEffect(() => {
    resetCamera();
  }, [meshGroup, resetTrigger, resetCamera]);

  useEffect(() => {
    if (background === 'gradient') {
      scene.background = new THREE.Color('#141722');
      scene.fog = new THREE.Fog('#141722', 20, 80);
    } else if (background === 'neutral') {
      scene.background = new THREE.Color('#222530');
      scene.fog = null;
    } else {
      scene.background = null;
      scene.fog = null;
    }

    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [background, scene]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      autoRotate={autoRotate}
      autoRotateSpeed={1.5}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
      makeDefault
    />
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 6, 5]} intensity={0.85} castShadow />
      <directionalLight position={[-4, 2, -2]} intensity={0.35} />
      <pointLight position={[0, -2, 2]} intensity={0.15} />
    </>
  );
}

function FloorGrid() {
  return (
    <Grid
      args={[20, 20]}
      position={[0, -0.6, 0]}
      cellSize={0.5}
      cellThickness={0.5}
      cellColor="#3b4261"
      sectionSize={2}
      sectionThickness={1}
      sectionColor="#5a638c"
      fadeDistance={25}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid
    />
  );
}

export default function ModelViewer({
  meshGroup,
  wireframe,
  autoRotate,
  background = 'gradient',
  resetTrigger = 0,
  onResetView,
  onCanvasRef,
}) {
  const webGLSupported = useWebGLSupport();
  const lastTapRef = useRef(0);

  const handleTouchEnd = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      onResetView?.();
    }
    lastTapRef.current = now;
  }, [onResetView]);

  if (!webGLSupported) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[300px]">
        <div className="glass-card p-8 text-center max-w-sm mx-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-danger-light)]">
            <AlertTriangle className="h-7 w-7 text-[var(--color-danger)]" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            WebGL Not Available
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Your browser or device doesn't support WebGL, which is required for 3D rendering.
            Try updating your browser or enabling hardware acceleration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      onDoubleClick={onResetView}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      <Canvas
        ref={onCanvasRef}
        style={{ touchAction: 'none', width: '100%', height: '100%' }}
        aria-label="3D model viewer — drag to rotate, pinch or scroll to zoom, right-drag or two fingers to pan"
        gl={{
          alpha: background === 'transparent',
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        }}
        camera={{ fov: 48, near: 0.1, far: 1000, position: [0, 1, 5] }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <SceneSetup
            meshGroup={meshGroup}
            autoRotate={autoRotate}
            background={background}
            resetTrigger={resetTrigger}
          />
          <Lights />
          {meshGroup && (
            <DepthMesh meshGroup={meshGroup} wireframe={wireframe} />
          )}
          <FloorGrid />
        </Suspense>
      </Canvas>
    </div>
  );
}
