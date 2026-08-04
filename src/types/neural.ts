export type LayerType = 'input' | 'hidden' | 'output';

export interface NodeData {
  id: string;
  label: string;
  subLabel?: string;
  layer: LayerType;
  position: [number, number, number];
  color: string;
  glowColor: string;
  size?: number;
  icon?: string;
  description?: string;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  weight?: number;
  color?: string;
}

export interface ActivationPulse {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  progress: number; // 0 to 1
  speed: number;
  color: string;
}
