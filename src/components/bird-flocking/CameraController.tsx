"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useBirdSimStore } from "@/lib/bird-flocking/store";
import * as THREE from "three";

export default function CameraController() {
  const { cameraMode, targetBirdPosition, targetBirdVelocity } = useBirdSimStore();
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Reset camera when switching to free mode
  useEffect(() => {
    if (cameraMode === 'free' && controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [cameraMode]);

  useFrame((state, delta) => {
    if (cameraMode === 'bird') {
      // Calculate ideal position: behind and slightly above the bird
      // We need a stable "behind" vector. Using velocity is good but can be jittery if velocity changes direction fast.
      // For smoothing, we use lerp.
      
      const velocity = targetBirdVelocity.clone();
      if (velocity.lengthSq() < 0.1) velocity.set(0, 0, 1); // Fallback
      
      const direction = velocity.normalize();
      const offset = direction.clone().multiplyScalar(-8).add(new THREE.Vector3(0, 3, 0));
      const desiredPosition = targetBirdPosition.clone().add(offset);
      
      // Smoothly move camera
      state.camera.position.lerp(desiredPosition, 0.05);
      
      // Look at the bird (or slightly ahead)
      const lookAtTarget = targetBirdPosition.clone().add(direction.multiplyScalar(5));
      state.camera.lookAt(lookAtTarget);
    }
  });

  return (
    <>
      {cameraMode === 'free' && (
        <OrbitControls 
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      )}
    </>
  );
}
