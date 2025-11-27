"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { StreetData } from "@/lib/city-simulation/cityGenerator";

export default function Streets({ data }: { data: StreetData[] }) {
  const streetMeshRef = useRef<THREE.InstancedMesh>(null);
  const sidewalkMeshRef = useRef<THREE.InstancedMesh>(null);
  const roadMarkingsRef = useRef<THREE.InstancedMesh>(null);
  
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const streetMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#2a2a2a", 
    roughness: 0.9,
    side: THREE.DoubleSide
  }), []);
  
  const sidewalkMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#4a4a4a", 
    roughness: 0.8,
    side: THREE.DoubleSide
  }), []);

  const roadMarkingsMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#ffffff", 
    roughness: 0.9,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  }), []);

  useLayoutEffect(() => {
    if (!streetMeshRef.current || !sidewalkMeshRef.current || !roadMarkingsRef.current) return;

    const tempObject = new THREE.Object3D();

    // Streets
    data.forEach((street, i) => {
      tempObject.position.set(...street.position);
      tempObject.scale.set(street.scale[0], street.scale[2], 1);
      tempObject.rotation.x = -Math.PI / 2;
      tempObject.updateMatrix();
      
      streetMeshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    // Sidewalks (2 per street, on each side)
    let sidewalkIndex = 0;
    data.forEach((street) => {
      const isVertical = street.scale[2] > street.scale[0];
      const sidewalkWidth = 2;
      
      if (isVertical) {
        // Left sidewalk
        tempObject.position.set(street.position[0] - street.scale[0]/2 - sidewalkWidth/2, street.position[1], street.position[2]);
        tempObject.scale.set(sidewalkWidth, street.scale[2], 1);
        tempObject.rotation.x = -Math.PI / 2;
        tempObject.updateMatrix();
        sidewalkMeshRef.current!.setMatrixAt(sidewalkIndex++, tempObject.matrix);
        
        // Right sidewalk
        tempObject.position.set(street.position[0] + street.scale[0]/2 + sidewalkWidth/2, street.position[1], street.position[2]);
        tempObject.scale.set(sidewalkWidth, street.scale[2], 1);
        tempObject.rotation.x = -Math.PI / 2;
        tempObject.updateMatrix();
        sidewalkMeshRef.current!.setMatrixAt(sidewalkIndex++, tempObject.matrix);
      } else {
        // Top sidewalk
        tempObject.position.set(street.position[0], street.position[1], street.position[2] - street.scale[2]/2 - sidewalkWidth/2);
        tempObject.scale.set(street.scale[0], sidewalkWidth, 1);
        tempObject.rotation.x = -Math.PI / 2;
        tempObject.updateMatrix();
        sidewalkMeshRef.current!.setMatrixAt(sidewalkIndex++, tempObject.matrix);
        
        // Bottom sidewalk
        tempObject.position.set(street.position[0], street.position[1], street.position[2] + street.scale[2]/2 + sidewalkWidth/2);
        tempObject.scale.set(street.scale[0], sidewalkWidth, 1);
        tempObject.rotation.x = -Math.PI / 2;
        tempObject.updateMatrix();
        sidewalkMeshRef.current!.setMatrixAt(sidewalkIndex++, tempObject.matrix);
      }
    });

    // Road center line markings
    data.forEach((street, i) => {
      tempObject.position.set(street.position[0], street.position[1] + 0.02, street.position[2]);
      tempObject.scale.set(street.scale[0] * 0.05, street.scale[2] * 0.8, 1);
      tempObject.rotation.x = -Math.PI / 2;
      tempObject.updateMatrix();
      
      roadMarkingsRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    streetMeshRef.current.instanceMatrix.needsUpdate = true;
    sidewalkMeshRef.current.instanceMatrix.needsUpdate = true;
    roadMarkingsRef.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  return (
    <group>
      {/* Main streets */}
      <instancedMesh
        ref={streetMeshRef}
        args={[geometry, streetMaterial, data.length]}
        receiveShadow
      />
      
      {/* Sidewalks */}
      <instancedMesh
        ref={sidewalkMeshRef}
        args={[geometry, sidewalkMaterial, data.length * 2]}
        receiveShadow
      />
      
      {/* Road markings */}
      <instancedMesh
        ref={roadMarkingsRef}
        args={[geometry, roadMarkingsMaterial, data.length]}
      />
    </group>
  );
}
