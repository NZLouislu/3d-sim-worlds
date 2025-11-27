import { create } from 'zustand';
import * as THREE from 'three';

interface BirdSimState {
  cameraMode: 'free' | 'bird';
  setCameraMode: (mode: 'free' | 'bird') => void;
  targetBirdPosition: THREE.Vector3;
  targetBirdVelocity: THREE.Vector3;
  updateTargetBird: (pos: THREE.Vector3, vel: THREE.Vector3) => void;
}

export const useBirdSimStore = create<BirdSimState>((set) => ({
  cameraMode: 'free',
  setCameraMode: (mode) => set({ cameraMode: mode }),
  targetBirdPosition: new THREE.Vector3(),
  targetBirdVelocity: new THREE.Vector3(),
  updateTargetBird: (pos, vel) => set({ targetBirdPosition: pos, targetBirdVelocity: vel }),
}));
