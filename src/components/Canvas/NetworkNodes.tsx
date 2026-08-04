import React from 'react';
import { Html } from '@react-three/drei';
import { NodeData } from '../../types/neural';
import { DESIGN_TOKENS } from '../../data/designTokens';

interface NetworkNodesProps {
  nodes: NodeData[];
  onNodeClick?: (node: NodeData) => void;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  isModalOpen?: boolean;
}

interface SingleNodeProps {
  node: NodeData;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick?: () => void;
  isModalOpen?: boolean;
}

const SingleNode: React.FC<SingleNodeProps> = ({ node, isHovered, onHover, onClick, isModalOpen }) => {
  return (
    <group position={node.position}>
      {/* 3D True Neural Circular Node Cell (Title centered INSIDE circle) */}
      {!isModalOpen && (
        <Html center distanceFactor={14} style={{ pointerEvents: 'auto', userSelect: 'none' }}>
          <div
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
            className="cursor-pointer transition-all duration-200 ease-out select-none"
          >
            {/* Perfect Circle Neural Node Cell (84px equal diameter) */}
            <div
              className={`w-20 h-20 md:w-22 md:h-22 rounded-full flex flex-col items-center justify-center p-2 text-center transition-all duration-200 border-2 backdrop-blur-xl shadow-lg ${
                isHovered
                  ? 'bg-[#0d0d0d] border-opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.9)]'
                  : 'bg-[#0a0a0a]/90 border-opacity-60 shadow-md'
              }`}
              style={{
                borderColor: isHovered ? node.glowColor : node.color,
                boxShadow: isHovered
                  ? `0 0 12px ${node.glowColor}40, inset 0 0 10px ${node.glowColor}20`
                  : '0 4px 12px rgba(0,0,0,0.6)'
              }}
            >
              {/* Centered Node Label (Title Only, Uppercase, No Subtitle, No Icons, No Leading Dots) */}
              <span className="text-[11px] md:text-xs font-extrabold text-[#f0f0f0] tracking-wider uppercase font-sans leading-tight">
                {node.label}
              </span>
            </div>
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
