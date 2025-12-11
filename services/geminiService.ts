import { GoogleGenAI, Type } from "@google/genai";
import { ParticleConfig, DistributionType, ParticleShape } from "../types";

const SYSTEM_INSTRUCTION = `
You are a creative coder expert in Three.js particle systems. 
Your task is to translate a user's natural language description (e.g., "a blizzard", "toxic rain", "matrix code") into a JSON configuration object for a particle system.

The particle system has these properties:
- color: Hex string (e.g., "#ffffff")
- count: Number of particles (500 to 10000)
- size: Particle size (0.01 to 0.5)
- speed: Animation speed multiplier (0.1 to 5.0)
- distribution: The spawn shape logic. Enum: 'SPHERE', 'CUBE', 'RING', 'EXPLOSION', 'HEART', 'FLOWER'.
- noiseStrength: How much random turbulence affects movement (0.0 to 2.0).
- shape: The geometry of the individual particle. Enum: 'SPHERE', 'CUBE', 'STAR', 'TETRAHEDRON', 'ICOSAHEDRON'.

Shape Selection Guide:
- Use 'CUBE' for: digital, matrix, tech, pixels, blocks, rigid structures.
- Use 'STAR' for: magic, cosmic, sparkles, fireworks, fantasy, energy.
- Use 'SPHERE' for: fluid, bubbles, rain, snow, organic, soft, planets.
- Use 'TETRAHEDRON' for: shards, crystals, ice, jagged, aggressive, triangles.
- Use 'ICOSAHEDRON' for: gems, complex tech, viruses, abstract low-poly.

Be creative and strictly follow the JSON schema.
`;

const getApiKey = (): string | undefined => {
  // 1. Check Vite standard (import.meta.env)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
    // @ts-ignore
    if (import.meta.env.API_KEY) return import.meta.env.API_KEY;
  }

  // 2. Check process.env (Standard/Shim)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.API_KEY) return process.env.API_KEY;
    if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
  }

  // 3. Check global window object fallback
  // @ts-ignore
  if (typeof window !== 'undefined' && window.VITE_API_KEY) return window.VITE_API_KEY;

  return undefined;
};

export const generateParticleConfig = async (prompt: string): Promise<ParticleConfig> => {
  const apiKey = getApiKey();
  
  console.log("[GeminiService] Environment Check:", {
    hasKey: !!apiKey,
    keyLength: apiKey ? apiKey.length : 0,
    viteEnv: typeof import.meta !== 'undefined'
  });

  if (!apiKey) {
    console.error("[GeminiService] Missing API Key. Please add VITE_API_KEY to your .env file or Vercel settings.");
    throw new Error("API Key not found. Please configure VITE_API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    console.log("[GeminiService] Sending prompt to Gemini:", prompt);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            color: { type: Type.STRING },
            count: { type: Type.INTEGER },
            size: { type: Type.NUMBER },
            speed: { type: Type.NUMBER },
            distribution: { type: Type.STRING, enum: Object.values(DistributionType) },
            noiseStrength: { type: Type.NUMBER },
            shape: { type: Type.STRING, enum: Object.values(ParticleShape) },
          },
          required: ["color", "count", "size", "speed", "distribution", "noiseStrength", "shape"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    const parsed = JSON.parse(text) as ParticleConfig;
    console.log("[GeminiService] Received config:", parsed);
    return parsed;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};