import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
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
  const IconComponent = node.icon ? ICON_MAP[node.icon] : null;

  return (
    <group position={node.position}>
      {/* 3D Premium Node Capsule Chip (Title belongs inside node button) */}
      {!isModalOpen && (
        <Html center distanceFactor={14} style={{ pointerEvents: 'auto', userSelect: 'none' }}>
          <div
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
            className="cursor-pointer transition-all duration-200 ease-out transform"
            style={{
              transitionDuration: `${DESIGN_TOKENS.hover.durationMs}ms`
            }}
          >
            {/* Apple / HUD Style Premium Capsule Node Chip */}
            <div
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2.5 border backdrop-blur-xl shadow-lg transition-all duration-200 ${
                isHovered
                  ? 'bg-[#0d0d0d]/95 border-opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.8)]'
                  : 'bg-[#050505]/85 border-opacity-40 shadow-md'
              }`}
              style={{
                borderColor: isHovered ? node.glowColor : node.color,
                boxShadow: isHovered
                  ? `0 0 12px ${node.glowColor}33, inset 0 0 8px ${node.glowColor}22`
                  : '0 4px 12px rgba(0,0,0,0.5)'
              }}
            >
              {/* Colored Indicator Orb & Icon */}
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: node.color,
                  boxShadow: isHovered ? `0 0 6px ${node.glowColor}` : 'none'
                }}
              />

              {IconComponent && (
                <IconComponent
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: node.color }}
                />
              )}

              {/* Title & SubLabel INSIDE Node Capsule */}
              <div className="flex flex-col text-left font-sans">
                <span className="text-xs font-bold text-[#f0f0f0] tracking-wide leading-none">
                  {node.label}
                </span>
                {node.subLabel && (
                  <span
                    className="text-[9.5px] font-mono mt-0.5 tracking-tight font-medium opacity-85 leading-none"
                    style={{ color: node.color }}
                  >
                    {node.subLabel}
                  </span>
                )}
              </div>
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
