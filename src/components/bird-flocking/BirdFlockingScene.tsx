"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import { useControls, button, Leva } from "leva";

import { Suspense, useEffect, useCallback, useState } from "react";
import { IoOptions, IoChevronDown, IoChevronUp } from "react-icons/io5";
import Flock from "./Flock";
import NatureEnvironment from "./NatureEnvironment";
import CameraController from "./CameraController";
import { useBirdSimStore } from "@/lib/bird-flocking/store";
import { WebGPUCanvas } from "@/lib/webgpu/WebGPUCanvas";
import { FPSMonitor, PerformanceHUD } from "@/lib/webgpu/PerformanceMonitor";
import { useRendererStore } from "@/lib/webgpu/store";
import { GPUCapabilityInfo } from "@/lib/webgpu";

export default function BirdFlockingScene() {
  const { setCameraMode, cameraMode } = useBirdSimStore();
  const { setCapability, forceWebGL, capability } = useRendererStore();
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    console.log('[Camera Mode State] Changed to:', cameraMode);
  }, [cameraMode]);

  // Dynamically adjust max bird count based on renderer capability
  const getMaxBirdCount = () => {
    if (capability?.renderer === 'webgpu') return 2000;
    if (capability?.renderer === 'webgl2') return 1000;
    return 500;
  };

  const config = useControls("Flocking Parameters", {
    count: { value: 200, min: 10, max: getMaxBirdCount(), step: 10 },
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

  const handleRendererInfo = useCallback((info: GPUCapabilityInfo) => {
    setCapability(info);
    console.log('[BirdFlockingScene] Renderer initialized:', info.renderer, info.reason);
  }, [setCapability]);

  return (
    <div className="w-full h-[calc(100vh-64px)] relative bg-black">
      <WebGPUCanvas 
        shadows 
        camera={{ position: [0, 20, 50], fov: 60 }}
        forceWebGL={forceWebGL}
        onRendererInfo={handleRendererInfo}
      >
        <Suspense fallback={null}>
          <NatureEnvironment />
          <Flock count={config.count} config={config} />
          <CameraController />
          
          <EffectComposer>
            {/* Softer Bloom: Higher threshold means only very bright things glow, lower intensity reduces glare */}
            <Bloom luminanceThreshold={1.2} luminanceSmoothing={0.5} height={300} intensity={0.2} />
            <Vignette eskil={false} offset={0.1} darkness={0.4} />
          </EffectComposer>
          
          {/* Performance Monitor */}
          <FPSMonitor />
        </Suspense>
      </WebGPUCanvas>
      
      {/* Performance HUD */}
      <PerformanceHUD position="bottom-right" />
      
      {/* Overlay UI */}
      {/* Overlay UI - Collapsible */}
      <div className={`absolute top-6 left-6 z-10 flex flex-col gap-4 max-h-[calc(100%-3rem)] transition-all duration-300 ease-in-out ${isCollapsed ? 'w-auto' : 'w-72'}`}>
        {/* Header Section */}
        <div className="flex items-center gap-3 select-none group cursor-pointer w-fit" onClick={() => setIsCollapsed(!isCollapsed)}>
          <h1 className="text-4xl font-bold drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-500 hover:scale-105 transition-transform">
            Bird Flocking
          </h1>
          <div className={`p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all ${!isCollapsed ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : ''}`}>
            <IoOptions className={`w-6 h-6 transition-transform duration-500 ${!isCollapsed ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Collapsible Content */}
        <div className={`flex flex-col gap-4 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'max-h-0 opacity-0 scale-95 translate-y-[-10px]' : 'max-h-[80vh] opacity-100 scale-100 translate-y-0'}`}>
          {/* Info Card */}
          <div className="bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl pointer-events-none">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Simulation Stats</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75" />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse delay-150" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-end border-b border-white/5 pb-1 mb-1">
                <span className="text-sm font-mono text-amber-100/70">Count</span>
                <span className="text-lg font-bold text-amber-300 font-mono">{config.count}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm font-mono text-amber-100/70">Mode</span>
                <span className="text-lg font-bold text-blue-300 font-mono uppercase">{cameraMode}</span>
              </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
              <span>Shortcuts</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono border border-white/5">V</span>
            </div>
          </div>

          {/* Leva Controls Container */}
          <div className="pointer-events-auto rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <Leva fill />
          </div>
        </div>
      </div>
    </div>
  );
}
