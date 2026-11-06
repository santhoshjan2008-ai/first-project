import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function DepthMesh({ meshGroup, wireframe }) {
  const groupRef = useRef();

  useEffect(() => {
    const container = groupRef.current;
    if (!container) return;

    // Clear previous children
    while (container.children.length > 0) {
      const child = container.children[0];
      container.remove(child);
    }

    if (meshGroup) {
      container.add(meshGroup.clone());
    }

    return () => {
      while (container.children.length > 0) {
        const child = container.children[0];
        container.remove(child);
      }
    };
  }, [meshGroup]);

  useEffect(() => {
    const container = groupRef.current;
    if (!container) return;

    container.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            mat.wireframe = wireframe;
          });
        } else {
          child.material.wireframe = wireframe;
        }
      }
    });
  }, [wireframe, meshGroup]);

  return <group ref={groupRef} />;
}
