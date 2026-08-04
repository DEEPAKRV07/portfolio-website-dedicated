import React, { useRef } from 'react';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls } from '@react-three/drei';

interface CameraControllerProps {
  enableOrbit?: boolean;
}

export const CameraController: React.FC<CameraControllerProps> = ({ enableOrbit = true }) => {
  const controlsRef = useRef<OrbitControlsImpl>(null!);

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={enableOrbit}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      zoomSpeed={0.9}
      rotateSpeed={0.6}
      panSpeed={0.6}
      minDistance={4}
      maxDistance={35}
      dampingFactor={0.08}
      makeDefault
    />
  );
};
