"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { BuildingData } from "@/lib/city-simulation/cityGenerator";

export default function Buildings({ data }: { data: BuildingData[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  
  // Create window texture
  const windowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Building facade color
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, 512, 512);
    
    // Draw windows
    const windowRows = 12;
    const windowCols = 8;
    const windowWidth = 40;
    const windowHeight = 30;
    const spacingX = 512 / windowCols;
    const spacingY = 512 / windowRows;
    
    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowCols; col++) {
        const x = col * spacingX + (spacingX - windowWidth) / 2;
        const y = row * spacingY + (spacingY - windowHeight) / 2;
        
        // Random window light
        const isLit = Math.random() > 0.3;
        ctx.fillStyle = isLit ? '#ffe680' : '#1a1a1a';
        ctx.fillRect(x, y, windowWidth, windowHeight);
        
        // Window frame
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, windowWidth, windowHeight);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);
  
  const material = useMemo(() => new THREE.MeshStandardMaterial({ 
    map: windowTexture,
    roughness: 0.7, 
    metalness: 0.3 
  }), [windowTexture]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();

    data.forEach((building, i) => {
      tempObject.position.set(...building.position);
      tempObject.scale.set(...building.scale);
      tempObject.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
      
      // Add some variation to color
      tempColor.set(building.color);
      // Random slight variation
      tempColor.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
      
      meshRef.current!.setColorAt(i, tempColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [data]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, data.length]}
      castShadow
      receiveShadow
    />
  );
}
