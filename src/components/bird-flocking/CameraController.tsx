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

  // Refs for smoothing to create "steady cam" feel
  const currentVelocityRef = useRef(new THREE.Vector3(0, 0, 1));
  const lookAtTargetRef = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (cameraMode === 'bird') {
      // 1. Get raw velocity and position
      const rawVelocity = targetBirdVelocity.clone();
      if (rawVelocity.lengthSq() < 0.1) rawVelocity.set(0, 0, 1);
      
      // 2. Smooth the velocity vector to prevent jittery camera placement
      // This acts as a low-pass filter on the bird's direction changes
      currentVelocityRef.current.lerp(rawVelocity, 0.05);
      const smoothedDirection = currentVelocityRef.current.clone().normalize();

      // 3. Calculate ideal position: behind and above, based on SMOOTHED direction
      const offset = smoothedDirection.clone().multiplyScalar(-10).add(new THREE.Vector3(0, 4, 0));
      const desiredPosition = targetBirdPosition.clone().add(offset);
      
      // 4. Smoothly move camera to desired position
      state.camera.position.lerp(desiredPosition, 0.1);
      
      // 5. Calculate and smooth the "Look At" target
      // Look slightly ahead of the bird to anticipate movement
      const desiredLookAt = targetBirdPosition.clone().add(smoothedDirection.multiplyScalar(10));
      
      // Initialize lookAtRef if it's far off (e.g. first frame)
      if (lookAtTargetRef.current.distanceTo(desiredLookAt) > 100) {
        lookAtTargetRef.current.copy(desiredLookAt);
      }
      
      lookAtTargetRef.current.lerp(desiredLookAt, 0.05);
      state.camera.lookAt(lookAtTargetRef.current);
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
