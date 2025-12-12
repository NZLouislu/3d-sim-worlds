"use client";

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRendererStore } from './store';
import { GPUCapabilityInfo } from './index';

/**
 * FPS Monitor Component (use inside Canvas)
 */
export function FPSMonitor() {
  const frameRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const setFPS = useRendererStore((s) => s.setFPS);
  const setFrameTime = useRendererStore((s) => s.setFrameTime);

  useFrame(() => {
    frameRef.current++;
    const now = performance.now();
    const elapsed = now - lastTimeRef.current;
    
    if (elapsed >= 1000) {
      setFPS(Math.round(frameRef.current * (1000 / elapsed)));
      setFrameTime(elapsed / frameRef.current);
      frameRef.current = 0;
      lastTimeRef.current = now;
    }
  });

  return null;
}

/**
 * Performance Info Panel (use outside Canvas)
 */
export function PerformancePanel({ 
  className = '',
  showGPUInfo = true 
}: { 
  className?: string;
  showGPUInfo?: boolean;
}) {
  const { capability, fps, frameTime } = useRendererStore();

  const getFPSColor = () => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRendererBadge = () => {
    if (!capability) return null;
    
    const colors = {
      webgpu: 'bg-gradient-to-r from-green-500 to-emerald-600',
      webgl2: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      webgl1: 'bg-gradient-to-r from-yellow-500 to-orange-600',
      none: 'bg-gradient-to-r from-red-500 to-rose-600',
    };
    
    const labels = {
      webgpu: '⚡ WebGPU',
      webgl2: '🔷 WebGL 2',
      webgl1: '⚠️ WebGL 1',
      none: '❌ No GPU',
    };

    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${colors[capability.renderer]}`}>
        {labels[capability.renderer]}
      </span>
    );
  };

  return (
    <div className={`font-mono text-xs ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        {getRendererBadge()}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className="text-white/60">FPS:</span>
        <span className={`font-bold ${getFPSColor()}`}>{fps}</span>
        
        <span className="text-white/60">Frame:</span>
        <span className="text-white/80">{frameTime.toFixed(2)}ms</span>
        
        {showGPUInfo && capability && (
          <>
            <span className="text-white/60">GPU:</span>
            <span className="text-white/80 truncate max-w-[120px]" title={capability.gpuInfo}>
              {capability.gpuInfo.split(' - ')[0] || 'Unknown'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Renderer Toggle Button
 */
export function RendererToggle({ onToggle }: { onToggle?: () => void }) {
  const { capability, forceWebGL, setForceWebGL } = useRendererStore();

  const handleToggle = () => {
    setForceWebGL(!forceWebGL);
    onToggle?.();
  };

  // Only show toggle button when WebGPU is available
  if (!capability?.isWebGPUSupported) return null;

  return (
    <button
      onClick={handleToggle}
      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                 bg-white/10 hover:bg-white/20 text-white border border-white/20"
    >
      {forceWebGL ? 'Switch to WebGPU' : 'Switch to WebGL'}
    </button>
  );
}

/**
 * Complete Performance HUD
 */
export function PerformanceHUD({ 
  position = 'bottom-right' 
}: { 
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { capability, fps } = useRendererStore();

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`absolute ${positionClasses[position]} z-20`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-black/60 backdrop-blur-md rounded-lg border border-white/10 
                   px-3 py-2 text-white transition-all hover:bg-black/70"
      >
        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold ${fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
            {fps} FPS
          </span>
          <span className="text-white/40">|</span>
          <span className="text-xs">
            {capability?.renderer?.toUpperCase() || 'Loading...'}
          </span>
        </div>
      </button>
      
      {isExpanded && (
        <div className="mt-2 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 p-4 min-w-[200px]">
          <PerformancePanel showGPUInfo />
          <div className="mt-3 pt-3 border-t border-white/10">
            <RendererToggle />
          </div>
        </div>
      )}
    </div>
  );
}

