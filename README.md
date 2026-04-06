#  Kinetic Particles – AI-Driven Interactive Particle Universe

Kinetic Particles is a real-time 3D particle simulation that combines **hand-tracking**, **AI-generated visual themes**, and **React Three Fiber** to create an immersive interactive experience.  
Control thousands of particles with intuitive gestures and instantly restyle the entire system using natural language.

This is a personally customized project — built and designed as your own interactive particle world.

---

##  Features

### AI-Generated Themes
Type creative prompts such as:

- "matrix green rain"  
- "fireflies drifting in the woods"  
- "cosmic nebula explosion"  
- "floating ice crystals"

The AI converts your text into a complete particle configuration, including colors, shapes, speed, noise, and distribution.

###  Hand Tracking Interaction
Powered by MediaPipe Vision:

- **Pinch** → Attract particles  
- **Open Hand** → Push particles away  
- **Swipe/Move** → Create directional trails

All camera processing happens **locally in your browser**.

###  Advanced Particle Physics
- 10,000+ instanced particles  
- Noise fields & turbulence  
- Adjustable size, speed, motion  
- Optimized with React Three Fiber (R3F)

###  Modern UI
- Glassmorphism controls  
- Prompt input with AI button  
- Particle settings panel  
- Mobile + desktop responsive layout

---

##  Tech Stack

- React 18  
- Three.js + React Three Fiber  
- MediaPipe Tasks Vision  
- Google GenAI SDK  
- Tailwind CSS  
- Lucide React

---

##  Getting Started

### 1. Prerequisites
- API key for AI theme generation  
- Webcam for gesture interaction

---

### 2. Installation

Clone the project:

```bash
git clone https://github.com/Obrempong-1/Particle-Pinch.git
cd Particle-Pinch
Install dependencies:

npm install


Create a .env file:

VITE_API_KEY=your_api_key_here


Run the development server:

npm run dev
