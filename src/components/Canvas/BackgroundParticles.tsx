import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DESIGN_TOKENS } from '../../data/designTokens';

interface BackgroundParticlesProps {
  isModalOpen?: boolean;
}

export const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({ isModalOpen = false }) => {
  // Reduced particle count from 1200 to 180 for calm, noise-free space depth
  const count = 180;
  const meshRef = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const cGreen = new THREE.Color(DESIGN_TOKENS.colors.greenBright);
    const cBlue = new THREE.Color(DESIGN_TOKENS.colors.blueAccent);
    const cPurple = new THREE.Color(DESIGN_TOKENS.colors.purpleAccent);

    const palette = [cGreen, cBlue, cPurple];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 32;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18 - 4;

      const selected = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = selected.r;
      col[i * 3 + 1] = selected.g;
      col[i * 3 + 2] = selected.b;
    }

    return [pos, col];
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Slow, subtle floating movement like floating space dust
      meshRef.current.rotation.y += delta * 0.008;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.02;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        vertexColors
        transparent
        opacity={isModalOpen ? 0.15 : 0.45}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};
