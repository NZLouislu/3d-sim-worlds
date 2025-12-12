"use client";

/// <reference path="./webgpu.d.ts" />

/**
 * WebGPU Renderer Support Module
 * 
 * Provides automatic device capability detection and intelligent switching between WebGPU and WebGL
 * - Modern devices: Use WebGPU for best performance
 * - Legacy devices: Fall back to WebGL for compatibility
 */

export interface GPUCapabilityInfo {
  isWebGPUSupported: boolean;
  isWebGL2Supported: boolean;
  isWebGL1Supported: boolean;
  renderer: 'webgpu' | 'webgl2' | 'webgl1' | 'none';
  gpuInfo: string;
  reason: string;
}

/**
 * Detect the current device's GPU rendering capabilities
 */
export async function detectGPUCapability(): Promise<GPUCapabilityInfo> {
  const info: GPUCapabilityInfo = {
    isWebGPUSupported: false,
    isWebGL2Supported: false,
    isWebGL1Supported: false,
    renderer: 'none',
    gpuInfo: 'Unknown',
    reason: ''
  };

  // 1. Detect WebGPU support
  if (typeof navigator !== 'undefined' && 'gpu' in navigator && navigator.gpu) {
    try {
      // Use 'any' type to handle WebGPU API (avoid type definition conflicts)
      const gpu = (navigator as any).gpu;
      const adapter = await gpu.requestAdapter();
      if (adapter) {
        const adapterInfo = await adapter.requestAdapterInfo();
        info.isWebGPUSupported = true;
        info.gpuInfo = `${adapterInfo.vendor || 'Unknown'} - ${adapterInfo.architecture || 'Unknown'}`;
        info.renderer = 'webgpu';
        info.reason = 'WebGPU available, using highest performance renderer';
        
        // Check device limits
        const device = await adapter.requestDevice();
        if (device) {
          console.log('[WebGPU] Max texture dimension:', device.limits.maxTextureDimension2D);
          device.destroy();
        }
        return info;
      }
    } catch (error) {
      console.warn('[WebGPU] Failed to request adapter:', error);
    }
  }

  // 2. Detect WebGL2 support
  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      info.isWebGL2Supported = true;
      const debugInfo = gl2.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        info.gpuInfo = gl2.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
      info.renderer = 'webgl2';
      info.reason = 'WebGPU unavailable, using WebGL2 renderer';
      return info;
    }
  } catch (error) {
    console.warn('[WebGL2] Detection failed:', error);
  }

  // 3. Detect WebGL1 support (legacy devices)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      info.isWebGL1Supported = true;
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        info.gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
      info.renderer = 'webgl1';
      info.reason = 'WebGL2 unavailable, using WebGL1 renderer (compatibility mode)';
      return info;
    }
  } catch (error) {
    console.warn('[WebGL1] Detection failed:', error);
  }

  info.reason = 'No GPU rendering support detected';
  return info;
}

/**
 * Check if browser supports WebGPU (synchronous quick check)
 */
export function hasWebGPUSupport(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

/**
 * Get recommended DPR (Device Pixel Ratio)
 * Dynamically adjusts based on device capability to balance quality and performance
 */
export function getRecommendedDPR(capability: GPUCapabilityInfo): [number, number] {
  switch (capability.renderer) {
    case 'webgpu':
      // WebGPU: Can use higher DPR
      return [1, Math.min(window.devicePixelRatio, 2)];
    case 'webgl2':
      // WebGL2: Standard DPR
      return [1, Math.min(window.devicePixelRatio, 1.5)];
    case 'webgl1':
      // WebGL1: Lower DPR to ensure performance
      return [1, 1];
    default:
      return [1, 1];
  }
}

/**
 * Create a performance monitor
 */
export function createPerformanceMonitor() {
  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 0;

  return {
    update() {
      frameCount++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
      }
      return fps;
    },
    getFPS() {
      return fps;
    }
  };
}
