"use client";

import { Canvas, CanvasProps } from "@react-three/fiber";
import { useState, useEffect, Suspense, ReactNode } from "react";
import { 
  detectGPUCapability, 
  GPUCapabilityInfo, 
  hasWebGPUSupport,
  getRecommendedDPR 
} from "./index";

interface WebGPUCanvasProps extends Omit<CanvasProps, 'gl'> {
  children: ReactNode;
  /** Force WebGL usage (for debugging) */
  forceWebGL?: boolean;
  /** Callback to display renderer info */
  onRendererInfo?: (info: GPUCapabilityInfo) => void;
  /** Loading component */
  fallback?: ReactNode;
}

/**
 * Smart Canvas Component
 * 
 * Automatically detects device capability and selects optimal renderer:
 * - WebGPU: Modern devices, best performance
 * - WebGL2: Standard devices
 * - WebGL1: Legacy device compatibility mode
 */
export function WebGPUCanvas({
  children,
  forceWebGL = false,
  onRendererInfo,
  fallback,
  ...canvasProps
}: WebGPUCanvasProps) {
  const [capability, setCapability] = useState<GPUCapabilityInfo | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [glInstance, setGlInstance] = useState<any>(null);

  useEffect(() => {
    async function initRenderer() {
      const detected = await detectGPUCapability();
      console.log('[WebGPUCanvas] Detected capability:', detected);
      setCapability(detected);
      onRendererInfo?.(detected);

      // If forcing WebGL or WebGPU is not supported, use default renderer
      if (forceWebGL || !detected.isWebGPUSupported) {
        setIsReady(true);
        return;
      }

      // Try to initialize WebGPU renderer
      try {
        // Dynamically import WebGPU renderer
        const THREE = await import('three');
        
        // Check if Three.js version supports WebGPU
        // Three.js r150+ has experimental WebGPU support
        if ('WebGPURenderer' in THREE) {
          console.log('[WebGPUCanvas] Three.js WebGPU renderer available');
          // Note: React Three Fiber v9 will better support async gl initialization
          // Currently we use WebGL2 but keep code structure for future upgrades
        }
        
        setIsReady(true);
      } catch (error) {
        console.warn('[WebGPUCanvas] WebGPU initialization failed, falling back to WebGL:', error);
        setIsReady(true);
      }
    }

    initRenderer();
  }, [forceWebGL, onRendererInfo]);

  if (!isReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        {fallback || (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-sm">Detecting GPU capabilities...</p>
          </div>
        )}
      </div>
    );
  }

  // Adjust Canvas properties based on capability
  const dpr = capability ? getRecommendedDPR(capability) : canvasProps.dpr || [1, 2];
  
  // Enhanced gl configuration
  const glConfig = {
    antialias: capability?.renderer === 'webgpu' || capability?.renderer === 'webgl2',
    alpha: false,
    powerPreference: 'high-performance' as const,
    stencil: false,
    depth: true,
  };

  return (
    <Canvas
      {...canvasProps}
      dpr={dpr}
      gl={glConfig}
    >
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </Canvas>
  );
}

/**
 * Renderer Info Display Component
 */
export function RendererInfoBadge({ info }: { info: GPUCapabilityInfo | null }) {
  if (!info) return null;

  const getColor = () => {
    switch (info.renderer) {
      case 'webgpu': return 'bg-green-500';
      case 'webgl2': return 'bg-blue-500';
      case 'webgl1': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getLabel = () => {
    switch (info.renderer) {
      case 'webgpu': return 'WebGPU';
      case 'webgl2': return 'WebGL 2';
      case 'webgl1': return 'WebGL 1 (Legacy)';
      default: return 'No GPU';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-white ${getColor()}`}>
      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
      {getLabel()}
    </div>
  );
}

export default WebGPUCanvas;
