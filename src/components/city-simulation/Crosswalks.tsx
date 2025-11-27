"use client";

import { useRef, useMemo, useLayoutEffect } from "react";
import * as THREE from "three";
import { StreetData } from "@/lib/city-simulation/cityGenerator";

interface CrosswalkProps {
  streets: StreetData[];
  gridSize: number;
  cellSize: number;
  cityWidth: number;
  cityDepth: number;
}

export default function Crosswalks({ streets, gridSize, cellSize, cityWidth, cityDepth }: CrosswalkProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const crosswalkData = useMemo(() => {
    const crosswalks: { position: THREE.Vector3; rotation: number; width: number; length: number }[] = [];
    
    // Add crosswalks at intersections
    for (let x = 0; x <= gridSize; x++) {
      for (let z = 0; z <= gridSize; z++) {
        const posX = x * cellSize - cityWidth / 2;
        const posZ = z * cellSize - cityDepth / 2;
        
        // Horizontal crosswalks (crossing vertical streets)
        if (z < gridSize) {
          crosswalks.push({
            position: new THREE.Vector3(posX, 0.02, posZ + cellSize / 2),
            rotation: 0,
            width: 8,
            length: 4
          });
        }
        
        // Vertical crosswalks (crossing horizontal streets)
        if (x < gridSize) {
          crosswalks.push({
            position: new THREE.Vector3(posX + cellSize / 2, 0.02, posZ),
            rotation: Math.PI / 2,
            width: 8,
            length: 4
          });
        }
      }
    }
    
    return crosswalks;
  }, [gridSize, cellSize, cityWidth, cityDepth]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const tempObject = new THREE.Object3D();

    crosswalkData.forEach((crosswalk, i) => {
      tempObject.position.copy(crosswalk.position);
      tempObject.rotation.y = crosswalk.rotation;
      tempObject.scale.set(crosswalk.width, 1, crosswalk.length);
      tempObject.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [crosswalkData]);

  // Create striped texture for crosswalk
  const crosswalkTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Background (transparent/dark)
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, 256, 256);
    
    // White stripes
    ctx.fillStyle = '#ffffff';
    const stripeCount = 8;
    const stripeWidth = 256 / (stripeCount * 2);
    
    for (let i = 0; i < stripeCount; i++) {
      ctx.fillRect(i * stripeWidth * 2, 0, stripeWidth, 256);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, crosswalkData.length]}
      receiveShadow
    >
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial 
        map={crosswalkTexture}
        transparent={false}
        roughness={0.9}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}
