import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NodeData, EdgeData } from '../../types/neural';

interface NetworkEdgesProps {
  nodes: NodeData[];
  edges: EdgeData[];
}

interface PulseData {
  edgeId: string;
  source: THREE.Vector3;
  target: THREE.Vector3;
  progress: number;
  speed: number;
  color: string;
  size: number;
}

export const NetworkEdges: React.FC<NetworkEdgesProps> = ({ nodes, edges }) => {
  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeData>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Compute clean straight segment geometries for each edge
  const straightEdges = useMemo(() => {
    return edges.map(edge => {
      const srcNode = nodeMap.get(edge.source);
      const tgtNode = nodeMap.get(edge.target);
      if (!srcNode || !tgtNode) return null;

      const srcPos = new THREE.Vector3(...srcNode.position);
      const tgtPos = new THREE.Vector3(...tgtNode.position);

      // Clean straight segment geometry
      const points = [srcPos, tgtPos];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      return {
        edge,
        srcPos,
        tgtPos,
        geometry,
        color: edge.color || '#00ff88'
      };
    }).filter(Boolean);
  }, [edges, nodeMap]);

  // Calm activation pulses traveling continuously across straight edges
  const pulsesRef = useRef<PulseData[]>([]);
  const pulseGroupRef = useRef<THREE.Group>(null!);

  useMemo(() => {
    if (straightEdges.length === 0) return;
    const initialPulses: PulseData[] = [];

    straightEdges.forEach(se => {
      if (!se) return;
      // Staggered pulses traveling along straight lines (25% slower travel speed)
      initialPulses.push({
        edgeId: se.edge.id,
        source: se.srcPos,
        target: se.tgtPos,
        progress: Math.random(),
        speed: 0.15 + Math.random() * 0.18, // 25% slower speed for calm motion
        color: se.color,
        size: 0.08 + Math.random() * 0.05
      });
    });

    pulsesRef.current = initialPulses;
  }, [straightEdges]);

  useFrame((_, delta) => {
    if (!pulseGroupRef.current) return;

    pulsesRef.current.forEach((pulse, idx) => {
      pulse.progress += delta * pulse.speed;
      if (pulse.progress > 1) {
        pulse.progress = 0;
      }

      // Linear interpolation along straight segment
      const point = new THREE.Vector3().lerpVectors(pulse.source, pulse.target, pulse.progress);
      const mesh = pulseGroupRef.current.children[idx];
      if (mesh) {
        mesh.position.copy(point);
      }
    });
  });

  return (
    <group>
      {/* Clean straight edge lines (45% opacity for crisp non-intrusive support) */}
      {straightEdges.map((se, i) => {
        if (!se) return null;
        return (
          <primitive
            key={se.edge.id || i}
            object={new THREE.Line(
              se.geometry,
              new THREE.LineBasicMaterial({
                color: new THREE.Color(se.color),
                transparent: true,
                opacity: 0.45,
                linewidth: 1.0
              })
            )}
          />
        );
      })}

      {/* Electrical signal activation pulses traveling straight */}
      <group ref={pulseGroupRef}>
        {pulsesRef.current.map((pulse, i) => (
          <mesh key={i}>
            <sphereGeometry args={[pulse.size, 12, 12]} />
            <meshBasicMaterial
              color={pulse.color}
              transparent
              opacity={0.5}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
