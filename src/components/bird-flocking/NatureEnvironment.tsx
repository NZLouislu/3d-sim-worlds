"use client";

import { Sky, Stars, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

export default function NatureEnvironment() {
  // 1. Generate Terrain with Vertex Colors (Sand vs Grass)
  const terrainGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(300, 300, 100, 100);
    
    const pos = geo.attributes.position;
    const count = pos.count;
    
    const colors = new Float32Array(count * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const deepGrassColor = new THREE.Color("#2d5a27");
    const grassColor = new THREE.Color("#4a8a3b");
    const highGrassColor = new THREE.Color("#6ab05c");
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      
      const frequency = 0.025;
      let height = 
        Math.sin(x * frequency) * Math.cos(y * frequency) * 12 + 
        Math.sin(x * frequency * 2.5) * Math.cos(y * frequency * 2.5) * 4;
      
      let z = Math.max(-3, height);
      
      if (z > -3) {
        z += (Math.random() - 0.5) * 0.3;
      }
      
      pos.setZ(i, z);

      if (z < -1.0) {
        tempColor.copy(deepGrassColor);
      } else if (z < 2.0) {
        tempColor.copy(grassColor);
        const t = (z + 1.0) / 3.0;
        tempColor.lerp(highGrassColor, t * 0.5);
      } else {
        tempColor.copy(highGrassColor);
      }
      
      tempColor.offsetHSL(0, 0, (Math.random() - 0.5) * 0.05);
      
      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);

  const treeData = useMemo(() => {
    const trees = [];
    for (let i = 0; i < 150; i++) {
      const x = (Math.random() - 0.5) * 240;
      const z = (Math.random() - 0.5) * 240;
      
      const frequency = 0.025;
      let rawHeight = 
        Math.sin(x * frequency) * Math.cos(z * frequency) * 12 + 
        Math.sin(x * frequency * 2.5) * Math.cos(z * frequency * 2.5) * 4;
        
      if (rawHeight > 0.5) {
        const scale = 0.8 + Math.random() * 0.6;
        trees.push({ position: [x, -5, z], scale });
      }
    }
    return trees;
  }, []);

  return (
    <group>
      <fog attach="fog" args={['#aaccff', 20, 140]} />

      <ambientLight intensity={0.8} color="#eef6ff" /> {/* Brighter ambient for less contrast */}
      <directionalLight
        position={[60, 80, 50]}
        intensity={1.0} // Reduced from 1.6 to 1.0
        color="#fffce8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
      />

      <Sky
        distance={450000}
        sunPosition={[60, 80, 50]}
        inclination={0.5}
        azimuth={0.25}
        mieCoefficient={0.002} // Reduced haze
        mieDirectionalG={0.8}
        rayleigh={0.5} // Lower rayleigh for a deeper blue sky, less white glare
        turbidity={5} // Clearer air
      />
      
      {/* Terrain with Vertex Colors */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow geometry={terrainGeometry}>
        <meshStandardMaterial 
          vertexColors 
          flatShading 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6.2, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial 
          color="#1a5c85" 
          roughness={0.1} 
          metalness={0.2} 
          opacity={0.85}
          transparent
        />
      </mesh>

      {treeData.map((tree, i) => (
        <group key={i} position={tree.position as [number, number, number]} scale={[tree.scale, tree.scale, tree.scale]}>
          <mesh position={[0, 1.0, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 2, 6]} />
            <meshStandardMaterial color="#6b6b6b" flatShading />
          </mesh>
          <mesh position={[0, 3.5, 0]} castShadow>
            <coneGeometry args={[2.2, 5.5, 16]} />
            <meshStandardMaterial color="#2d7a2f" flatShading roughness={0.8} />
          </mesh>
        </group>
      ))}
      
      <Environment preset="park" />
    </group>
  );
}
