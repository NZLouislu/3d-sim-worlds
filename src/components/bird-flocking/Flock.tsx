"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FlockingSystem, FlockingConfig } from "@/lib/bird-flocking/boids";
import { useBirdSimStore } from "@/lib/bird-flocking/store";

interface FlockProps {
  count: number;
  config: FlockingConfig;
}

export default function Flock({ count, config }: FlockProps) {
  const bodyMeshRef = useRef<THREE.InstancedMesh>(null);
  const tipMeshRef = useRef<THREE.InstancedMesh>(null);
  const leftWingMeshRef = useRef<THREE.InstancedMesh>(null);
  const rightWingMeshRef = useRef<THREE.InstancedMesh>(null);
  
  const system = useMemo(() => new FlockingSystem(count, config), [count, config]);

  // Update system config when props change
  useEffect(() => {
    system.config = config;
  }, [config, system]);

  const bodyGeometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.2, 1.0, 12);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  const tipGeometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.08, 0.2, 8);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, -0.6);
    return geo;
  }, []);

  const leftWingGeometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.9, 0.03, 0.25);
    geo.translate(-0.45, 0, 0.1);
    return geo;
  }, []);

  const rightWingGeometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.9, 0.03, 0.25);
    geo.translate(0.45, 0, 0.1);
    return geo;
  }, []);

  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#999999",
    roughness: 0.6,
    metalness: 0.2,
    flatShading: true
  }), []);

  const tipMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ff9933",
    roughness: 0.5,
    metalness: 0.1,
    emissive: "#ff6600",
    emissiveIntensity: 0.3,
    flatShading: true
  }), []);

  const wingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#f0f0f0",
    roughness: 0.4,
    metalness: 0.1,
    flatShading: true
  }), []);

  // Re-init system
  useEffect(() => {
    if (system.count !== count) {
      system.count = count;
      system.initBoids();
    }
  }, [count, system]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const wingDummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!bodyMeshRef.current || !tipMeshRef.current || !leftWingMeshRef.current || !rightWingMeshRef.current) return;

    const dt = Math.min(delta, 0.1);
    const time = state.clock.elapsedTime;
    system.update(dt);

    // Update store
    if (system.boids.length > 0) {
      const target = system.boids[0];
      useBirdSimStore.setState({
        targetBirdPosition: target.position.clone(),
        targetBirdVelocity: target.velocity.clone()
      });
    }

    // Update instances
    for (let i = 0; i < system.boids.length; i++) {
      const boid = system.boids[i];
      
      dummy.position.copy(boid.position);
      const target = boid.position.clone().add(boid.velocity);
      dummy.lookAt(target);
      dummy.rotateY(Math.PI);
      dummy.updateMatrix();
      
      bodyMeshRef.current.setMatrixAt(i, dummy.matrix);
      tipMeshRef.current.setMatrixAt(i, dummy.matrix);

      // 2. Flapping Animation
      // Flap speed depends on speed? Or just constant? Let's make it slightly random but synchronized
      const flapSpeed = 12 + Math.random() * 2; 
      const flapPhase = i * 0.1; // Slight offset so they don't flap perfectly in unison (robotic)
      const flapAngle = Math.sin(time * flapSpeed + flapPhase) * 0.35; // +/- 0.35 radians

      // Left Wing
      wingDummy.copy(dummy); // Start with body transform
      wingDummy.rotateZ(flapAngle); // Flap up/down
      wingDummy.updateMatrix();
      leftWingMeshRef.current.setMatrixAt(i, wingDummy.matrix);

      // Right Wing
      wingDummy.copy(dummy); // Reset to body transform
      wingDummy.rotateZ(-flapAngle); // Flap opposite way
      wingDummy.updateMatrix();
      rightWingMeshRef.current.setMatrixAt(i, wingDummy.matrix);
    }
    
    bodyMeshRef.current.instanceMatrix.needsUpdate = true;
    tipMeshRef.current.instanceMatrix.needsUpdate = true;
    leftWingMeshRef.current.instanceMatrix.needsUpdate = true;
    rightWingMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={bodyMeshRef} args={[bodyGeometry, bodyMaterial, count]} castShadow receiveShadow />
      <instancedMesh ref={tipMeshRef} args={[tipGeometry, tipMaterial, count]} castShadow receiveShadow />
      <instancedMesh ref={leftWingMeshRef} args={[leftWingGeometry, wingMaterial, count]} castShadow receiveShadow />
      <instancedMesh ref={rightWingMeshRef} args={[rightWingGeometry, wingMaterial, count]} castShadow receiveShadow />
    </group>
  );
}

