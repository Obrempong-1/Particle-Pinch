import { DistributionType, ParticleConfig, ParticleShape } from './types';

export const DEFAULT_CONFIG: ParticleConfig = {
  color: '#00ffff',
  count: 3000,
  size: 0.05,
  speed: 0.5,
  distribution: DistributionType.SPHERE,
  noiseStrength: 0.2,
  shape: ParticleShape.SPHERE,
};

export const TEMPLATES: Record<string, ParticleConfig> = {
  HEARTS: {
    color: '#ff0055',
    count: 4000,
    size: 0.04,
    speed: 0.3,
    distribution: DistributionType.HEART,
    noiseStrength: 0.1,
    shape: ParticleShape.SPHERE,
  },
  SATURN: {
    color: '#E0B0FF',
    count: 5000,
    size: 0.03,
    speed: 1.2,
    distribution: DistributionType.RING,
    noiseStrength: 0.05,
    shape: ParticleShape.STAR,
  },
  FIREWORKS: {
    color: '#ffd700',
    count: 2500,
    size: 0.08,
    speed: 2.0,
    distribution: DistributionType.EXPLOSION,
    noiseStrength: 0.8,
    shape: ParticleShape.CUBE,
  },
  FLOWERS: {
    color: '#ff69b4',
    count: 3500,
    size: 0.06,
    speed: 0.4,
    distribution: DistributionType.FLOWER,
    noiseStrength: 0.15,
    shape: ParticleShape.SPHERE,
  }
};
