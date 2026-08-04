import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { NodeData } from '../../types/neural';

interface CameraControllerProps {
  nodes: NodeData[];
  enableOrbit?: boolean;
}

export const CameraController: React.FC<CameraControllerProps> = ({ nodes, enableOrbit = true }) => {
  const controlsRef = useRef<OrbitControlsImpl>(null!);
  const { camera } = useThree();

  // Dynamic Camera Bounding Box & Target calculation
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 19.5));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    // Compute 3D bounding box for active node positions
    const bbox = new THREE.Box3();
    nodes.forEach(node => {
      bbox.expandByPoint(new THREE.Vector3(...node.position));
    });

    const center = new THREE.Vector3();
    bbox.getCenter(center);

    const size = new THREE.Vector3();
    bbox.getSize(size);

    // Calculate optimal Z camera distance with comfortable margins
    const maxDim = Math.max(size.x, size.y);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    let cameraZ = Math.abs((maxDim / 2) / Math.tan(fov / 2)) * 1.35;
    cameraZ = Math.max(16.0, Math.min(cameraZ, 26.0));

    targetCamPos.current.set(center.x, center.y, cameraZ);
    targetLookAt.current.set(center.x, center.y, 0);
  }, [nodes, camera]);

  useFrame((_, delta) => {
    // Smooth Lerp Camera transition to auto-fit active graph
    camera.position.lerp(targetCamPos.current, delta * 3.5);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, delta * 3.5);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={enableOrbit}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      zoomSpeed={0.8}
      rotateSpeed={0.5}
      panSpeed={0.5}
      minDistance={6}
      maxDistance={35}
      dampingFactor={0.08}
      makeDefault
    />
  );
};
