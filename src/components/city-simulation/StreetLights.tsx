"use client";

import { useRef, useMemo, useLayoutEffect } from "react";
import * as THREE from "three";

interface StreetLightProps {
  cityWidth: number;
  cityDepth: number;
  gridSize: number;
  cellSize: number;
}

export default function StreetLights({ cityWidth, cityDepth, gridSize, cellSize }: StreetLightProps) {
  const polesMeshRef = useRef<THREE.InstancedMesh>(null);
  const lightsMeshRef = useRef<THREE.InstancedMesh>(null);
  
  const lightPositions = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const spacing = cellSize;
    
    // Place lights along vertical streets
    for (let x = 0; x <= gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const posX = x * cellSize - cityWidth / 2;
        const posZ = z * cellSize - cityDepth / 2 + cellSize / 2;
        
        // Lights on both sides of the street
        positions.push(new THREE.Vector3(posX - 5, 0, posZ));
        positions.push(new THREE.Vector3(posX + 5, 0, posZ));
      }
    }
    
    // Place lights along horizontal streets
    for (let z = 0; z <= gridSize; z++) {
      for (let x = 0; x < gridSize; x++) {
        const posZ = z * cellSize - cityDepth / 2;
        const posX = x * cellSize - cityWidth / 2 + cellSize / 2;
        
        // Lights on both sides of the street
        positions.push(new THREE.Vector3(posX, 0, posZ - 5));
        positions.push(new THREE.Vector3(posX, 0, posZ + 5));
      }
    }
    
    return positions;
  }, [cityWidth, cityDepth, gridSize, cellSize]);

  const lightPoolsMeshRef = useRef<THREE.InstancedMesh>(null);

  // Create light pool texture
  const lightPoolTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 235, 59, 0.4)'); // Yellow center, semi-transparent
    gradient.addColorStop(0.5, 'rgba(255, 235, 59, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 235, 59, 0)'); // Transparent edge
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  useLayoutEffect(() => {
    if (!polesMeshRef.current || !lightsMeshRef.current || !lightPoolsMeshRef.current) return;

    const tempObject = new THREE.Object3D();
    const poleHeight = 6;
    const lightHeight = poleHeight - 0.5;

    lightPositions.forEach((pos, i) => {
      // Set pole position
      tempObject.position.set(pos.x, poleHeight / 2, pos.z);
      tempObject.scale.set(0.15, poleHeight, 0.15);
      tempObject.updateMatrix();
      polesMeshRef.current!.setMatrixAt(i, tempObject.matrix);

      // Set light position
      tempObject.position.set(pos.x, lightHeight, pos.z);
      tempObject.scale.set(0.8, 0.3, 0.8);
      tempObject.updateMatrix();
      lightsMeshRef.current!.setMatrixAt(i, tempObject.matrix);

      // Set light pool position (on ground)
      tempObject.position.set(pos.x, 0.05, pos.z); // Slightly above ground/sidewalk
      tempObject.rotation.x = -Math.PI / 2;
      tempObject.scale.set(8, 8, 1); // 8 unit radius light pool
      tempObject.updateMatrix();
      lightPoolsMeshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    polesMeshRef.current.instanceMatrix.needsUpdate = true;
    lightsMeshRef.current.instanceMatrix.needsUpdate = true;
    lightPoolsMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [lightPositions]);

  return (
    <group>
      {/* Poles */}
      <instancedMesh
        ref={polesMeshRef}
        args={[undefined, undefined, lightPositions.length]}
        castShadow
      >
        <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </instancedMesh>

      {/* Light fixtures with emissive glow */}
      <instancedMesh
        ref={lightsMeshRef}
        args={[undefined, undefined, lightPositions.length]}
      >
        <cylinderGeometry args={[0.4, 0.5, 1, 8]} />
        <meshStandardMaterial 
          color="#ffeb3b" 
          emissive="#ffeb3b"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Fake light pools on ground */}
      <instancedMesh
        ref={lightPoolsMeshRef}
        args={[undefined, undefined, lightPositions.length]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial 
          map={lightPoolTexture}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}
