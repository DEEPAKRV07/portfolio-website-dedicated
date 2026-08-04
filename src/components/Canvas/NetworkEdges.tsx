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
  curve: THREE.QuadraticBezierCurve3;
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

  // Compute curve paths for each edge
  const edgeCurves = useMemo(() => {
    return edges.map(edge => {
      const srcNode = nodeMap.get(edge.source);
      const tgtNode = nodeMap.get(edge.target);
      if (!srcNode || !tgtNode) return null;

      const srcPos = new THREE.Vector3(...srcNode.position);
      const tgtPos = new THREE.Vector3(...tgtNode.position);

      // Slight quadratic arch in 3D for elegant neural wiring
      const midPoint = new THREE.Vector3().addVectors(srcPos, tgtPos).multiplyScalar(0.5);
      const distance = srcPos.distanceTo(tgtPos);
      midPoint.z += (Math.random() - 0.5) * 1.5;

      const curve = new THREE.QuadraticBezierCurve3(srcPos, midPoint, tgtPos);
      const points = curve.getPoints(30);

      return {
        edge,
        srcPos,
        tgtPos,
        curve,
        geometry: new THREE.BufferGeometry().setFromPoints(points),
        color: edge.color || '#00ff88'
      };
    }).filter(Boolean);
  }, [edges, nodeMap]);

  // Activation pulses traveling continuously across edges
  const pulsesRef = useRef<PulseData[]>([]);
  const pulseGroupRef = useRef<THREE.Group>(null!);

  useMemo(() => {
    if (edgeCurves.length === 0) return;
    const initialPulses: PulseData[] = [];

    edgeCurves.forEach(ec => {
      if (!ec) return;
      // 2 pulses per edge staggered
      initialPulses.push({
        edgeId: ec.edge.id,
        source: ec.srcPos,
        target: ec.tgtPos,
        curve: ec.curve,
        progress: Math.random(),
        speed: 0.25 + Math.random() * 0.35,
        color: ec.color,
        size: 0.12 + Math.random() * 0.08
      });
    });

    pulsesRef.current = initialPulses;
  }, [edgeCurves]);

  useFrame((_, delta) => {
    if (!pulseGroupRef.current) return;

    pulsesRef.current.forEach((pulse, idx) => {
      pulse.progress += delta * pulse.speed;
      if (pulse.progress > 1) {
        pulse.progress = 0;
      }

      const point = pulse.curve.getPoint(pulse.progress);
      const mesh = pulseGroupRef.current.children[idx];
      if (mesh) {
        mesh.position.copy(point);
      }
    });
  });

  return (
    <group>
      {/* Edge lines */}
      {edgeCurves.map((ec, i) => {
        if (!ec) return null;
        return (
          <primitive
            key={ec.edge.id || i}
            object={new THREE.Line(
              ec.geometry,
              new THREE.LineBasicMaterial({
                color: new THREE.Color(ec.color),
                transparent: true,
                opacity: 0.35,
                linewidth: 1.5
              })
            )}
          />
        );
      })}

      {/* Traveling energy pulses */}
      <group ref={pulseGroupRef}>
        {pulsesRef.current.map((pulse, i) => (
          <mesh key={i}>
            <sphereGeometry args={[pulse.size, 16, 16]} />
            <meshBasicMaterial
              color={pulse.color}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
