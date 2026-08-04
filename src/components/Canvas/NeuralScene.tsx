import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { NodeData, EdgeData } from '../../types/neural';
import { NetworkNodes } from './NetworkNodes';
import { NetworkEdges } from './NetworkEdges';
import { BackgroundParticles } from './BackgroundParticles';
import { CameraController } from './CameraController';

interface NeuralSceneProps {
  nodes: NodeData[];
  edges: EdgeData[];
  onNodeClick?: (node: NodeData) => void;
  isModalOpen?: boolean;
}

export const NeuralScene: React.FC<NeuralSceneProps> = ({ nodes, edges, onNodeClick, isModalOpen = false }) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  return (
    <div className={`w-full h-full relative bg-[#050505] overflow-hidden transition-all duration-500 ${isModalOpen ? 'brightness-75 blur-[2px]' : 'brightness-100 blur-none'}`}>
      <Canvas
        camera={{ position: [0, 0, 19.5], fov: 48 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        {/* Background color & ambient fog for depth */}
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 18, 50]} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 10]} intensity={0.9} color="#ffffff" />
        <directionalLight position={[-10, -10, -10]} intensity={0.4} color="#00ff88" />

        {/* Floating volumetric particles - 180 calm space dust particles */}
        <BackgroundParticles isModalOpen={isModalOpen} />

        {/* 3D Neural Edges & Activation Pulses */}
        <NetworkEdges nodes={nodes} edges={edges} />

        {/* 3D Neural Nodes */}
        <NetworkNodes
          nodes={nodes}
          hoveredNodeId={hoveredNodeId}
          setHoveredNodeId={setHoveredNodeId}
          onNodeClick={onNodeClick}
          isModalOpen={isModalOpen}
        />

        {/* Orbit Camera Controls */}
        <CameraController />

        {/* Restrained Bloom Glow & Vignette */}
        <EffectComposer enableNormalPass={false}>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.35}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.15} darkness={0.75} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
