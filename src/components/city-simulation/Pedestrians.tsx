"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo, useLayoutEffect } from "react";
import * as THREE from "three";

interface Pedestrian {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  speed: number;
  rotation: number;
  color: THREE.Color;
}

interface PedestriansProps {
  count: number;
  cityWidth: number;
  cityDepth: number;
}

export default function Pedestrians({ count, cityWidth, cityDepth }: PedestriansProps) {
  const bodyMeshRef = useRef<THREE.InstancedMesh>(null);
  const headMeshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Initialize pedestrians
  const pedestrians = useMemo(() => {
    const peds: Pedestrian[] = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * cityWidth * 0.8;
      const z = (Math.random() - 0.5) * cityDepth * 0.8;
      
      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.6, 0.5);

      peds.push({
        id: `ped-${i}`,
        position: new THREE.Vector3(x, 0.5, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          0,
          (Math.random() - 0.5) * 0.5
        ),
        speed: 0.5 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2,
        color
      });
    }
    return peds;
  }, [count, cityWidth, cityDepth]);

  useLayoutEffect(() => {
    if (!bodyMeshRef.current || !headMeshRef.current) return;
    
    pedestrians.forEach((ped, i) => {
      bodyMeshRef.current!.setColorAt(i, ped.color);
      headMeshRef.current!.setColorAt(i, new THREE.Color("#ffdbac")); // Skin tone
    });
    
    if (bodyMeshRef.current.instanceColor) bodyMeshRef.current.instanceColor.needsUpdate = true;
    if (headMeshRef.current.instanceColor) headMeshRef.current.instanceColor.needsUpdate = true;
  }, [pedestrians]);

  useFrame((state, delta) => {
    if (!bodyMeshRef.current || !headMeshRef.current) return;

    pedestrians.forEach((ped, i) => {
      // Simple random walk
      ped.position.add(ped.velocity.clone().multiplyScalar(delta * ped.speed));
      
      // Boundary check - turn around if out of bounds
      const halfWidth = cityWidth * 0.4;
      const halfDepth = cityDepth * 0.4;
      
      if (Math.abs(ped.position.x) > halfWidth) {
        ped.velocity.x *= -1;
      }
      if (Math.abs(ped.position.z) > halfDepth) {
        ped.velocity.z *= -1;
      }
      
      // Update rotation based on velocity
      if (ped.velocity.lengthSq() > 0.01) {
        ped.rotation = Math.atan2(ped.velocity.x, ped.velocity.z);
      }
      
      // Occasionally change direction
      if (Math.random() < 0.01) {
        ped.velocity.x = (Math.random() - 0.5) * 0.5;
        ped.velocity.z = (Math.random() - 0.5) * 0.5;
      }
      
      // Update Body
      dummy.position.copy(ped.position);
      dummy.position.y = 0.6; // Body height center
      dummy.rotation.y = ped.rotation;
      dummy.scale.set(0.5, 0.8, 0.3);
      dummy.updateMatrix();
      bodyMeshRef.current!.setMatrixAt(i, dummy.matrix);

      // Update Head
      dummy.position.copy(ped.position);
      dummy.position.y = 1.3; // Head height center
      dummy.rotation.y = ped.rotation;
      dummy.scale.set(0.3, 0.3, 0.3);
      dummy.updateMatrix();
      headMeshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    bodyMeshRef.current.instanceMatrix.needsUpdate = true;
    headMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Bodies */}
      <instancedMesh ref={bodyMeshRef} args={[undefined, undefined, count]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.8} metalness={0.1} />
      </instancedMesh>

      {/* Heads */}
      <instancedMesh ref={headMeshRef} args={[undefined, undefined, count]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.5} metalness={0.1} />
      </instancedMesh>
    </group>
  );
}
