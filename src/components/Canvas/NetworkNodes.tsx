import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NodeData } from '../../types/neural';
import { DESIGN_TOKENS } from '../../data/designTokens';
import { User, FileText, Briefcase, Mail, Cpu, Code, Clock, Sparkles } from 'lucide-react';

interface NetworkNodesProps {
  nodes: NodeData[];
  onNodeClick?: (node: NodeData) => void;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  isModalOpen?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  user: User,
  'file-text': FileText,
  briefcase: Briefcase,
  mail: Mail,
  cpu: Cpu,
  code: Code,
  clock: Clock,
  sparkles: Sparkles
};

interface SingleNodeProps {
  node: NodeData;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick?: () => void;
  isModalOpen?: boolean;
}

const SingleNode: React.FC<SingleNodeProps> = ({ node, isHovered, onHover, onClick, isModalOpen }) => {
  const meshRef = useRef<THREE.Group>(null!);
  const innerCoreRef = useRef<THREE.Mesh>(null!);
  const auraRef = useRef<THREE.Mesh>(null!);

  const baseSize = node.size || 0.85;
  // Apple / Nothing style subtle hover scale (1.00 -> 1.04)
  const targetScale = isHovered && !isModalOpen ? DESIGN_TOKENS.hover.maxScale : 1.0;

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y += delta * 0.3;
      innerCoreRef.current.rotation.x += delta * 0.15;
    }
    if (auraRef.current) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 1.5 + node.position[0]) * 0.03 + 1.0;
      auraRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const IconComponent = node.icon ? ICON_MAP[node.icon] : null;

  return (
    <group
      position={node.position}
      ref={meshRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!isModalOpen) onHover(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        if (!isModalOpen) onHover(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isModalOpen && onClick) onClick();
      }}
    >
      {/* Dynamic Point Light */}
      <pointLight
        color={node.glowColor}
        intensity={isHovered ? 1.6 : 1.2}
        distance={3.5}
      />

      {/* Subtle Outer Aura Glow */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[baseSize * 1.2, 32, 32]} />
        <meshBasicMaterial
          color={node.glowColor}
          transparent
          opacity={isHovered ? 0.12 : 0.06}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Thin Colored Outer Ring (Apple / Figma visual design) */}
      <mesh>
        <torusGeometry args={[baseSize * 1.04, 0.02, 16, 64]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={isHovered ? 0.95 : 0.75}
        />
      </mesh>

      {/* Dark Matte Inner Sphere */}
      <mesh>
        <sphereGeometry args={[baseSize * 0.95, 32, 32]} />
        <meshStandardMaterial
          color="#080808"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Small Glowing Core Orb */}
      <mesh ref={innerCoreRef}>
        <icosahedronGeometry args={[baseSize * 0.5, 2]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.glowColor}
          emissiveIntensity={isHovered ? DESIGN_TOKENS.hover.hoverEmissive : DESIGN_TOKENS.hover.baseEmissive}
          roughness={0.3}
        />
      </mesh>

      {/* HTML Label Overlay - Automatically hidden when a modal is open to prevent text overlap */}
      {!isModalOpen && (
        <Html
          position={[0, baseSize * 1.35, 0]}
          center
          distanceFactor={15}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            className={`flex flex-col items-center justify-center transition-all duration-300 transform pointer-events-none ${
              isHovered ? 'scale-102' : 'scale-100'
            }`}
          >
            {/* Label Card */}
            <div
              className="px-3 py-1 rounded-lg flex items-center gap-2 border transition-all duration-300 shadow-sm whitespace-nowrap backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(5, 5, 5, 0.92)',
                borderColor: isHovered ? node.glowColor : 'rgba(255, 255, 255, 0.12)',
                boxShadow: isHovered ? `0 0 8px ${node.glowColor}33` : 'none'
              }}
            >
              {IconComponent && (
                <IconComponent
                  className="w-3.5 h-3.5"
                  style={{ color: node.color }}
                />
              )}
              <span className="text-xs font-semibold tracking-wide font-sans text-[#f0f0f0]">
                {node.label}
              </span>
            </div>

            {/* SubLabel */}
            {node.subLabel && (
              <span
                className="text-[10px] font-mono mt-0.5 tracking-tight font-medium opacity-80"
                style={{ color: node.color }}
              >
                {node.subLabel}
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

export const NetworkNodes: React.FC<NetworkNodesProps> = ({
  nodes,
  onNodeClick,
  hoveredNodeId,
  setHoveredNodeId,
  isModalOpen = false
}) => {
  return (
    <group>
      {nodes.map(node => (
        <SingleNode
          key={node.id}
          node={node}
          isHovered={hoveredNodeId === node.id}
          onHover={(hovered) => setHoveredNodeId(hovered ? node.id : null)}
          onClick={() => onNodeClick && onNodeClick(node)}
          isModalOpen={isModalOpen}
        />
      ))}
    </group>
  );
};
