"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { ParkData } from "@/lib/city-simulation/cityGenerator";

export default function Parks({ data }: { data: ParkData[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#4ade80", // Green
    roughness: 0.8,
    metalness: 0.1
  }), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const tempObject = new THREE.Object3D();

    data.forEach((park, i) => {
      tempObject.position.set(...park.position);
      tempObject.scale.set(...park.scale);
      tempObject.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, data.length]}
      receiveShadow
    />
  );
}
