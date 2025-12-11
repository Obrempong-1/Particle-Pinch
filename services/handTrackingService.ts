import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { HandData } from "../types";

const MIN_ALPHA = 0.1; 
const MAX_ALPHA = 0.8;
const VELOCITY_THRESHOLD = 0.5; 

export class HandTrackingService {
  private static instance: HandTrackingService;
  private handLandmarker: HandLandmarker | null = null;
  private video: HTMLVideoElement | null = null;
  private lastVideoTime = -1;
  private requestRef: number | null = null;
  private onResultsCallback: ((data: HandData) => void) | null = null;
  
  
  private prevHandData: HandData = {
    left: { present: false, position: { x: 0, y: 0, z: 0 }, pinchDistance: 1, isOpen: true },
    right: { present: false, position: { x: 0, y: 0, z: 0 }, pinchDistance: 1, isOpen: true },
  };

  private constructor() {}

  public static getInstance(): HandTrackingService {
    if (!HandTrackingService.instance) {
      HandTrackingService.instance = new HandTrackingService();
    }
    return HandTrackingService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.handLandmarker) return;

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  }

  public start(videoElement: HTMLVideoElement, onResults: (data: HandData) => void) {
    this.video = videoElement;
    this.onResultsCallback = onResults;
    this.loop();
  }

  public stop() {
    if (this.requestRef) {
      cancelAnimationFrame(this.requestRef);
      this.requestRef = null;
    }
  }

  private loop = () => {
    if (this.video && this.handLandmarker && this.video.currentTime !== this.lastVideoTime) {
      const startTimeMs = performance.now();
      
      if (this.video.videoWidth > 0 && this.video.videoHeight > 0) {
        const results = this.handLandmarker.detectForVideo(this.video, startTimeMs);
        this.processResults(results);
        this.lastVideoTime = this.video.currentTime;
      }
    }
    this.requestRef = requestAnimationFrame(this.loop);
  };

  private processResults(results: HandLandmarkerResult) {
    if (!this.onResultsCallback) return;

    const rawHandData: HandData = {
      left: { present: false, position: { x: 0, y: 0, z: 0 }, pinchDistance: 0, isOpen: true },
      right: { present: false, position: { x: 0, y: 0, z: 0 }, pinchDistance: 0, isOpen: true },
    };

    if (results.landmarks && results.handedness) {
      for (let i = 0; i < results.landmarks.length; i++) {
        const landmarks = results.landmarks[i];
        const handedness = results.handedness[i][0].categoryName; 
        
        
        const isRight = handedness === "Right";
        const side = isRight ? 'right' : 'left';
        const target = rawHandData[side];

        target.present = true;
        
        
        const pX = (landmarks[0].x + landmarks[9].x) / 2;
        const pY = (landmarks[0].y + landmarks[9].y) / 2;
        
      
        
        target.position = {
          x: (pX - 0.5) * -24, 
          y: -(pY - 0.5) * 16, 
          z: 0 
        };

       
        const t = landmarks[4];
        const idx = landmarks[8];
        const dist = Math.sqrt(Math.pow(t.x - idx.x, 2) + Math.pow(t.y - idx.y, 2));
        
        
        target.pinchDistance = Math.min(Math.max((dist - 0.02) / 0.12, 0), 1);

        
        const wrist = landmarks[0];
        const middleTip = landmarks[12];
        const middleKnuckle = landmarks[9];
        
        const lenFull = Math.sqrt(Math.pow(middleTip.x - wrist.x, 2) + Math.pow(middleTip.y - wrist.y, 2));
        const lenPalm = Math.sqrt(Math.pow(middleKnuckle.x - wrist.x, 2) + Math.pow(middleKnuckle.y - wrist.y, 2));
        
        target.isOpen = (lenFull / lenPalm) > 1.5;
      }
    }

   
    const smooth = (prev: number, curr: number, alpha: number) => prev + (curr - prev) * alpha;
    
    ['left', 'right'].forEach((s) => {
        const side = s as 'left' | 'right';
        const raw = rawHandData[side];
        const prev = this.prevHandData[side];
        
        if (raw.present) {
            
            const dx = raw.position.x - prev.position.x;
            const dy = raw.position.y - prev.position.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            
            let alpha = THREE_Math_mapLinear(dist, 0, VELOCITY_THRESHOLD, MIN_ALPHA, MAX_ALPHA);
            alpha = Math.min(Math.max(alpha, MIN_ALPHA), MAX_ALPHA); 

           
            if (!prev.present) alpha = 1.0;

            prev.present = true;
            prev.position.x = smooth(prev.position.x, raw.position.x, alpha);
            prev.position.y = smooth(prev.position.y, raw.position.y, alpha);
            prev.position.z = smooth(prev.position.z, raw.position.z, alpha);
            
            
            prev.pinchDistance = smooth(prev.pinchDistance, raw.pinchDistance, 0.2);
            
            
            prev.isOpen = raw.isOpen;
        } else {
            prev.present = false;
        }
    });

    this.onResultsCallback(this.prevHandData);
  }
}


function THREE_Math_mapLinear(x: number, a1: number, a2: number, b1: number, b2: number) {
  return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
}
