import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import ParticleField from './components/ParticleField';
import Interface from './components/Interface';
import { HandTrackingService } from './services/handTrackingService';
import { HandData, ParticleConfig } from './types';
import { DEFAULT_CONFIG } from './constants';

const ResponsiveCamera = () => {
    const { camera, size } = useThree();
    
    useEffect(() => {
        const aspect = size.width / size.height;
        const baseDistance = 12;
        
        if (aspect < 1) {
            camera.position.z = Math.max(baseDistance, 14 / aspect);
        } else {
            camera.position.z = baseDistance;
        }
        camera.updateProjectionMatrix();
    }, [size, camera]);

    return null;
};

const App: React.FC = () => {
  const [config, setConfig] = useState<ParticleConfig>(DEFAULT_CONFIG);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handDataRef = useRef<HandData>({
    left: { present: false, position: { x: 0, y: 0, z: 0 }, pinchDistance: 0, isOpen: true },
    right: { present: false, position: { x: 0, y: 0, z: 0 }, pinchDistance: 0, isOpen: true },
  });

  useEffect(() => {
    const initTracking = async () => {
      if (!videoRef.current) return;
      
      const trackingService = HandTrackingService.getInstance();
      await trackingService.initialize();

      try {
        const constraints = { 
            video: { 
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadeddata = () => {
                videoRef.current?.play();
                setVideoReady(true);
                trackingService.start(videoRef.current!, (data) => {
                    handDataRef.current = data;
                });
            };
        }
      } catch (e) {
        console.error("Camera access denied or failed", e);
      }
    };

    initTracking();

    return () => {
        HandTrackingService.getInstance().stop();
    };
  }, []);

  const getApiKey = () => {
    
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
    
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.API_KEY) return process.env.API_KEY;
      if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
    }
    return null;
  };

  const hasKey = !!getApiKey();

 
  useEffect(() => {
    const key = getApiKey();
    if (key && typeof process !== 'undefined') {
        if (!process.env) process.env = {};
        process.env.API_KEY = key;
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden" style={{ touchAction: 'none' }}>
        <video 
            ref={videoRef} 
            className="absolute opacity-0 pointer-events-none w-px h-px" 
            playsInline 
            muted 
        />

        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
                <ResponsiveCamera />
                <color attach="background" args={['#050505']} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} color={config.color} intensity={2} />
                
                <ParticleField config={config} handData={handDataRef} />
                
                <OrbitControls 
                    makeDefault
                    enableZoom={true} 
                    enablePan={false} 
                    enableRotate={true}
                    zoomSpeed={0.5}
                    rotateSpeed={0.5}
                    minDistance={2}
                    maxDistance={100}
                />
                
                <Environment preset="city" />
            </Canvas>
        </div>

        <div className="absolute inset-0 z-10 pointer-events-none">
            <Interface 
                currentConfig={config}
                onConfigChange={setConfig}
                hasApiKey={hasKey}
                onSetApiKey={() => {}} 
            />
        </div>

        {!videoReady && (
             <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
                <div className="text-center text-white p-4">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm">Initializing Vision...</p>
                    <p className="text-xs text-gray-500 mt-2">Please allow camera access</p>
                </div>
             </div>
        )}
    </div>
  );
};

export default App;