"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo, useLayoutEffect } from "react";
import * as THREE from "three";
import { Vehicle } from "@/lib/city-simulation/trafficSystem";

export default function Vehicles({ vehicles }: { vehicles: Vehicle[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const headlightsRef = useRef<THREE.InstancedMesh>(null);
  const taillightsRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const tempColor = new THREE.Color();
    
    vehicles.forEach((vehicle, i) => {
      tempColor.set(vehicle.color);
      meshRef.current!.setColorAt(i, tempColor);
    });
    
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [vehicles]);

  useFrame(() => {
    if (!meshRef.current || !headlightsRef.current || !taillightsRef.current) return;

    vehicles.forEach((vehicle, i) => {
      // Main vehicle body
      dummy.position.copy(vehicle.position);
      dummy.rotation.copy(vehicle.rotation);
      
      if (vehicle.type === 'bus') {
        dummy.scale.set(1.2, 1.2, 2);
      } else {
        dummy.scale.set(1, 1, 1);
      }
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // Headlights (front, white)
      const frontOffset = new THREE.Vector3(0, 0, 2);
      frontOffset.applyEuler(vehicle.rotation);
      dummy.position.copy(vehicle.position).add(frontOffset);
      dummy.position.y += 0.3;
      dummy.rotation.copy(vehicle.rotation);
      dummy.scale.set(0.3, 0.3, 0.1);
      dummy.updateMatrix();
      headlightsRef.current!.setMatrixAt(i, dummy.matrix);

      // Taillights (rear, red)
      const rearOffset = new THREE.Vector3(0, 0, -2);
      rearOffset.applyEuler(vehicle.rotation);
      dummy.position.copy(vehicle.position).add(rearOffset);
      dummy.position.y += 0.3;
      dummy.rotation.copy(vehicle.rotation);
      dummy.scale.set(0.3, 0.3, 0.1);
      dummy.updateMatrix();
      taillightsRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    headlightsRef.current.instanceMatrix.needsUpdate = true;
    taillightsRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Vehicle bodies */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, vehicles.length]} castShadow>
        <boxGeometry args={[1.8, 1.2, 3.5]} />
        <meshStandardMaterial roughness={0.5} metalness={0.7} />
      </instancedMesh>

      {/* Headlights */}
      <instancedMesh ref={headlightsRef} args={[undefined, undefined, vehicles.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Taillights */}
      <instancedMesh ref={taillightsRef} args={[undefined, undefined, vehicles.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={4}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
