"use client";

import { create } from 'zustand';
import { GPUCapabilityInfo } from './index';

interface RendererState {
  capability: GPUCapabilityInfo | null;
  fps: number;
  frameTime: number;
  isLoading: boolean;
  forceWebGL: boolean;
  
  // Actions
  setCapability: (capability: GPUCapabilityInfo) => void;
  setFPS: (fps: number) => void;
  setFrameTime: (frameTime: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setForceWebGL: (forceWebGL: boolean) => void;
}

export const useRendererStore = create<RendererState>((set) => ({
  capability: null,
  fps: 0,
  frameTime: 0,
  isLoading: true,
  forceWebGL: false,
  
  setCapability: (capability) => set({ capability, isLoading: false }),
  setFPS: (fps) => set({ fps }),
  setFrameTime: (frameTime) => set({ frameTime }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setForceWebGL: (forceWebGL) => set({ forceWebGL }),
}));
