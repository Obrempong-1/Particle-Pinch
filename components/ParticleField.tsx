import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DistributionType, HandData, ParticleConfig, ParticleShape } from '../types';

interface ParticleFieldProps {
  config: ParticleConfig;
  handData: React.MutableRefObject<HandData>;
}


const MAX_COUNT = 10000;

const ParticleField: React.FC<ParticleFieldProps> = ({ config, handData }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
 
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < MAX_COUNT; i++) {
      data.push({
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
        life: Math.random(),
        baseX: 0, baseY: 0, baseZ: 0,
      });
    }
    return data;
  }, []);

 
  const prevHands = useRef<{
    left: { x: number, y: number, z: number },
    right: { x: number, y: number, z: number }
  }>({
    left: { x: 0, y: 0, z: 0 },
    right: { x: 0, y: 0, z: 0 }
  });

  
  const Geometry = useMemo(() => {
    switch (config.shape) {
      case ParticleShape.CUBE: return <boxGeometry args={[1, 1, 1]} />;
      case ParticleShape.STAR: return <dodecahedronGeometry args={[0.5, 0]} />; 
      case ParticleShape.TETRAHEDRON: return <tetrahedronGeometry args={[0.6, 0]} />;
      case ParticleShape.ICOSAHEDRON: return <icosahedronGeometry args={[0.5, 0]} />;
      default: return <sphereGeometry args={[0.5, 8, 8]} />;
    }
  }, [config.shape]);

  
  const prevCount = useRef(0);
  const prevDist = useRef(config.distribution);

  
  useEffect(() => {
    const count = Math.min(config.count, MAX_COUNT);
    const isDistChange = prevDist.current !== config.distribution;
    
    let startIndex = isDistChange ? 0 : prevCount.current;
    if (startIndex < 0) startIndex = 0;
    
    if (isDistChange || count > prevCount.current) {
        for (let i = startIndex; i < count; i++) {
            let x = 0, y = 0, z = 0;
            
            switch (config.distribution) {
                case DistributionType.RING:
                const theta = Math.random() * Math.PI * 2;
                const r = 3 + Math.random() * 2;
                x = Math.cos(theta) * r;
                y = (Math.random() - 0.5) * 1;
                z = Math.sin(theta) * r;
                break;
                case DistributionType.HEART:
                    let t = Math.random() * Math.PI * 2;
                    const scale = 0.2;
                    x = 16 * Math.pow(Math.sin(t), 3) * scale;
                    y = (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * scale;
                    z = (Math.random() - 0.5) * 2;
                    break;
                case DistributionType.FLOWER:
                    const ft = Math.random() * Math.PI * 2;
                    const fr = Math.sin(ft * 5) + 3; 
                    x = Math.cos(ft) * fr * Math.random();
                    y = Math.sin(ft) * fr * Math.random();
                    z = (Math.random() - 0.5) * 2;
                    break;
                case DistributionType.EXPLOSION:
                const u = Math.random();
                const v = Math.random();
                const thetaExp = 2 * Math.PI * u;
                const phiExp = Math.acos(2 * v - 1);
                const rExp = Math.cbrt(Math.random()) * 5;
                x = rExp * Math.sin(phiExp) * Math.cos(thetaExp);
                y = rExp * Math.sin(phiExp) * Math.sin(thetaExp);
                z = rExp * Math.cos(phiExp);
                break;
                default: 
                const uS = Math.random();
                const vS = Math.random();
                const thetaS = 2 * Math.PI * uS;
                const phiS = Math.acos(2 * vS - 1);
                const rS = Math.cbrt(Math.random()) * 5;
                x = rS * Math.sin(phiS) * Math.cos(thetaS);
                y = rS * Math.sin(phiS) * Math.sin(thetaS);
                z = rS * Math.cos(phiS);
            }
            
            particles[i].baseX = x;
            particles[i].baseY = y;
            particles[i].baseZ = z;
            particles[i].x = x;
            particles[i].y = y;
            particles[i].z = z;
            particles[i].vx = 0;
            particles[i].vy = 0;
            particles[i].vz = 0;
        }
    }

    prevCount.current = count;
    prevDist.current = config.distribution;
  }, [config.count, config.distribution, particles]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const count = Math.min(config.count, MAX_COUNT);
    const hands = handData.current;
    
    meshRef.current.count = count;

    
    const handVelocities: Record<string, THREE.Vector3> = {};
    ['left', 'right'].forEach(side => {
        const s = side as 'left' | 'right';
        if (hands[s].present) {
            const vx = (hands[s].position.x - prevHands.current[s].x) * 5; 
            const vy = (hands[s].position.y - prevHands.current[s].y) * 5;
            const vz = (hands[s].position.z - prevHands.current[s].z) * 5;
            handVelocities[s] = new THREE.Vector3(vx, vy, vz);

           
            prevHands.current[s].x = hands[s].position.x;
            prevHands.current[s].y = hands[s].position.y;
            prevHands.current[s].z = hands[s].position.z;
        } else {
            handVelocities[s] = new THREE.Vector3(0,0,0);
        }
    });

    const activeHands = [hands.left, hands.right].filter(h => h.present);
    const handSide = [hands.left.present ? 'left' : '', hands.right.present ? 'right' : ''];

    for (let i = 0; i < count; i++) {
      const p = particles[i];

     
      const noise = config.noiseStrength * 0.02;
      p.x += Math.sin(time * config.speed + p.y * 0.5) * noise;
      p.y += Math.cos(time * config.speed + p.x * 0.5) * noise;
      p.z += Math.sin(time * config.speed + p.z * 0.5) * noise;

      
      const returnForce = 0.03;
      p.vx += (p.baseX - p.x) * returnForce;
      p.vy += (p.baseY - p.y) * returnForce;
      p.vz += (p.baseZ - p.z) * returnForce;

      p.vx *= 0.9;
      p.vy *= 0.9;
      p.vz *= 0.9;

      
      let scale = config.size;
      
      activeHands.forEach((hand, idx) => {
          const sideName = handSide[hands.left.present ? idx : 1]; 
          const vel = handVelocities[sideName === 'left' ? 'left' : 'right'] || new THREE.Vector3();

          const dx = p.x - hand.position.x;
          const dy = p.y - hand.position.y;
          const dz = p.z - hand.position.z; 
          const distSq = dx*dx + dy*dy + dz*dz;
          const dist = Math.sqrt(distSq);

          
          const radius = 5.0;

          if (dist < radius) {
             const tension = hand.pinchDistance; 
             const forceDir = (tension - 0.4) * 2.5; 
             const influence = (1 - dist / radius); 
             
             
             p.vx += (dx / dist) * forceDir * influence * 0.8;
             p.vy += (dy / dist) * forceDir * influence * 0.8;
             p.vz += (dz / dist) * forceDir * influence * 0.8;

             
             p.vx += vel.x * influence * 0.15;
             p.vy += vel.y * influence * 0.15;
             p.vz += vel.z * influence * 0.15;

             
             scale += influence * (0.05 + tension * 0.05);
          }
      });

      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(time * 0.2 + p.x, time * 0.2 + p.y, 0);
      dummy.scale.set(scale, scale, scale);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_COUNT]}>
      {Geometry}
      <meshStandardMaterial 
        color={config.color} 
        emissive={config.color}
        emissiveIntensity={0.6}
        roughness={0.2}
        metalness={0.8}
        toneMapped={false}
      />
    </instancedMesh>
  );
};

export default ParticleField;