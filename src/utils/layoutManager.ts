export type LayoutState = 'HOME' | 'SUBNETWORK' | 'DETAIL' | 'MODAL';

export interface HUDLayoutConfig {
  hero: {
    opacity: number;
    translateY: string;
    scale: number;
    pointerEvents: 'auto' | 'none';
  };
  navigationGuide: {
    opacity: number;
    translateY: string;
    pointerEvents: 'auto' | 'none';
  };
  statusBadge: {
    opacity: number;
    translateY: string;
    pointerEvents: 'auto' | 'none';
  };
  backpropagationFab: {
    opacity: number;
    translateY: string;
    pointerEvents: 'auto' | 'none';
  };
  neuronIndicator: {
    opacity: number;
    translateY: string;
    pointerEvents: 'auto' | 'none';
  };
}

export const LAYOUT_STATE_CONFIGS: Record<LayoutState, HUDLayoutConfig> = {
  HOME: {
    hero: { opacity: 1.0, translateY: '0px', scale: 1.0, pointerEvents: 'none' },
    navigationGuide: { opacity: 1.0, translateY: '0px', pointerEvents: 'auto' },
    statusBadge: { opacity: 1.0, translateY: '0px', pointerEvents: 'auto' },
    backpropagationFab: { opacity: 0.0, translateY: '20px', pointerEvents: 'none' },
    neuronIndicator: { opacity: 1.0, translateY: '0px', pointerEvents: 'auto' }
  },
  SUBNETWORK: {
    hero: { opacity: 0.75, translateY: '-12px', scale: 0.9, pointerEvents: 'none' },
    navigationGuide: { opacity: 0.85, translateY: '0px', pointerEvents: 'auto' },
    statusBadge: { opacity: 0.85, translateY: '0px', pointerEvents: 'auto' },
    backpropagationFab: { opacity: 1.0, translateY: '0px', pointerEvents: 'auto' },
    neuronIndicator: { opacity: 1.0, translateY: '0px', pointerEvents: 'auto' }
  },
  DETAIL: {
    hero: { opacity: 0.5, translateY: '-20px', scale: 0.82, pointerEvents: 'none' },
    navigationGuide: { opacity: 0.6, translateY: '0px', pointerEvents: 'auto' },
    statusBadge: { opacity: 0.6, translateY: '0px', pointerEvents: 'auto' },
    backpropagationFab: { opacity: 1.0, translateY: '0px', pointerEvents: 'auto' },
    neuronIndicator: { opacity: 1.0, translateY: '0px', pointerEvents: 'auto' }
  },
  MODAL: {
    hero: { opacity: 0.0, translateY: '-32px', scale: 0.8, pointerEvents: 'none' },
    navigationGuide: { opacity: 0.0, translateY: '16px', pointerEvents: 'none' },
    statusBadge: { opacity: 0.0, translateY: '-16px', pointerEvents: 'none' },
    backpropagationFab: { opacity: 0.0, translateY: '20px', pointerEvents: 'none' },
    neuronIndicator: { opacity: 0.0, translateY: '16px', pointerEvents: 'none' }
  }
};

export const getLayoutState = (
  currentView: 'main' | 'skills' | 'projects' | 'timeline',
  isModalOpen: boolean,
  hasActiveDetail: boolean
): LayoutState => {
  if (isModalOpen) return 'MODAL';
  if (hasActiveDetail) return 'DETAIL';
  if (currentView !== 'main') return 'SUBNETWORK';
  return 'HOME';
};
