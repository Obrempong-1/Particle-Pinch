export enum ParticleShape {
  SPHERE = 'SPHERE',
  CUBE = 'CUBE',
  STAR = 'STAR',
  TETRAHEDRON = 'TETRAHEDRON',
  ICOSAHEDRON = 'ICOSAHEDRON',
}

export enum DistributionType {
  SPHERE = 'SPHERE',
  CUBE = 'CUBE',
  RING = 'RING',
  EXPLOSION = 'EXPLOSION',
  HEART = 'HEART',
  FLOWER = 'FLOWER'
}

export interface ParticleConfig {
  color: string;
  count: number;
  size: number;
  speed: number;
  distribution: DistributionType;
  noiseStrength: number;
  shape: ParticleShape;
}

export interface HandData {
  left: {
    present: boolean;
    position: { x: number; y: number; z: number };
    pinchDistance: number; // 0 to 1
    isOpen: boolean;
  };
  right: {
    present: boolean;
    position: { x: number; y: number; z: number };
    pinchDistance: number;
    isOpen: boolean;
  };
}

export interface GeminiResponse {
  config: ParticleConfig;
  description: string;
}