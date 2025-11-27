"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import { useControls, button } from "leva";
import { Suspense, useEffect } from "react";
import Flock from "./Flock";
import NatureEnvironment from "./NatureEnvironment";
import CameraController from "./CameraController";
import { useBirdSimStore } from "@/lib/bird-flocking/store";

export default function BirdFlockingScene() {
  const { setCameraMode, cameraMode } = useBirdSimStore();

  useEffect(() => {
    console.log('[Camera Mode State] Changed to:', cameraMode);
  }, [cameraMode]);

  const config = useControls("Flocking Parameters", {
    count: { value: 200, min: 10, max: 1000, step: 10 },
    separationWeight: { value: 3.0, min: 0, max: 5 },
    alignmentWeight: { value: 2.0, min: 0, max: 5 },
    cohesionWeight: { value: 1.5, min: 0, max: 5 },
    maxSpeed: { value: 8, min: 1, max: 20 },
    maxForce: { value: 0.2, min: 0.01, max: 1 },
    perceptionRadius: { value: 5, min: 1, max: 20 },
    separationDistance: { value: 4, min: 0.5, max: 10 },
    boundaryRadius: { value: 40, min: 20, max: 100 },
  });

  const cameraControls = useControls("Camera Controls", {
    "Switch View (V)": button(() => {
      const currentMode = useBirdSimStore.getState().cameraMode;
      console.log('[Switch View Button] Clicked! Current mode:', currentMode);
      const newMode = currentMode === 'free' ? 'bird' : 'free';
      console.log('[Switch View Button] Switching to:', newMode);
      setCameraMode(newMode);
    }),
    Mode: {
      value: cameraMode,
      options: ["free", "bird"],
      onChange: (v: string) => {
        console.log('[Mode Dropdown] Changed to:', v);
        if (v !== cameraMode) {
          setCameraMode(v as 'free' | 'bird');
        }
      }
    }
  });

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'v' || e.key === 'V') {
        const currentMode = useBirdSimStore.getState().cameraMode;
        setCameraMode(currentMode === 'free' ? 'bird' : 'free');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCameraMode]);

  return (
    <div className="w-full h-[calc(100vh-64px)] relative bg-black">
      <Canvas shadows camera={{ position: [0, 20, 50], fov: 60 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <NatureEnvironment />
          <Flock count={config.count} config={config} />
          <CameraController />
          
          <EffectComposer>
            {/* Softer Bloom: Higher threshold means only very bright things glow, lower intensity reduces glare */}
            <Bloom luminanceThreshold={1.2} luminanceSmoothing={0.5} height={300} intensity={0.2} />
            <Vignette eskil={false} offset={0.1} darkness={0.4} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      
      {/* Overlay UI */}
      <div className="absolute top-6 left-6 text-white pointer-events-none z-10 select-none">
        <h1 className="text-4xl font-bold drop-shadow-lg mb-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-500">
          Bird Flocking
        </h1>
        <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-white/10">
          <p className="text-sm font-mono text-amber-100">
            Count: <span className="font-bold">{config.count}</span>
          </p>
          <p className="text-sm font-mono text-amber-100">
            Mode: <span className="font-bold uppercase">{cameraMode}</span>
          </p>
          <p className="text-xs text-white/50 mt-2">
            Press &apos;V&apos; to switch view
          </p>
        </div>
      </div>
    </div>
  );
}
