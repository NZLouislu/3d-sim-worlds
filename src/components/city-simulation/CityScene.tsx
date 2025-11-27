"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Sky } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMemo, Suspense, useState, useEffect } from "react";
import { generateCity, CityData } from "@/lib/city-simulation/cityGenerator";
import { TrafficSystem } from "@/lib/city-simulation/trafficSystem";
import Buildings from "./Buildings";
import Streets from "./Streets";
import Vehicles from "./Vehicles";
import Pedestrians from "./Pedestrians";
import StreetLights from "./StreetLights";
import Crosswalks from "./Crosswalks";
import Parks from "./Parks";

const CITY_CONFIG = {
  gridSize: 8,
  blockSize: 25,
  streetWidth: 8
};

function CitySimulationLoop({ system }: { system: TrafficSystem }) {
  useFrame((state, delta) => {
    system.update(Math.min(delta, 0.1));
  });
  return null;
}

export default function CityScene() {
  const [cityData, setCityData] = useState<CityData | null>(null);

  useEffect(() => {
    setCityData(generateCity(CITY_CONFIG));
  }, []);

  const trafficSystem = useMemo(() => 
    cityData ? new TrafficSystem(cityData, 100) : null, 
    [cityData]
  );

  const cellSize = CITY_CONFIG.blockSize + CITY_CONFIG.streetWidth;

  if (!cityData || !trafficSystem) return null;

  return (
    <div className="w-full h-[calc(100vh-64px)] relative bg-gray-900">
      <Canvas shadows camera={{ position: [50, 50, 50], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <color attach="background" args={['#111']} />
          <fog attach="fog" args={['#111', 50, 200]} />
          
          <ambientLight intensity={0.2} />
          <directionalLight 
            position={[100, 100, 50]} 
            intensity={1} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
          />
          
          <Sky sunPosition={[100, 10, 50]} turbidity={10} rayleigh={0.5} />
          <Environment preset="night" />

          <group position={[0, -5, 0]}>
            <Buildings data={cityData.buildings} />
            <Parks data={cityData.parks} />
            <Streets data={cityData.streets} />
            <Crosswalks 
              streets={cityData.streets}
              gridSize={CITY_CONFIG.gridSize}
              cellSize={cellSize}
              cityWidth={cityData.width}
              cityDepth={cityData.depth}
            />
            <StreetLights 
              cityWidth={cityData.width}
              cityDepth={cityData.depth}
              gridSize={CITY_CONFIG.gridSize}
              cellSize={cellSize}
            />
            <Vehicles vehicles={trafficSystem.vehicles} />
            <Pedestrians count={50} cityWidth={cityData.width} cityDepth={cityData.depth} />
            <CitySimulationLoop system={trafficSystem} />
            
            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
              <planeGeometry args={[500, 500]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </group>

          <OrbitControls maxPolarAngle={Math.PI / 2 - 0.1} />
          
          <EffectComposer>
            <Bloom luminanceThreshold={1.0} intensity={0.4} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      
      <div className="absolute top-6 left-6 text-white pointer-events-none z-10">
        <h1 className="text-4xl font-bold drop-shadow-lg mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          City Simulation
        </h1>
        <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-white/10">
          <p className="text-sm font-mono text-blue-100">
            Buildings: <span className="font-bold">{cityData.buildings.length}</span>
          </p>
          <p className="text-sm font-mono text-blue-100">
            Vehicles: <span className="font-bold">{trafficSystem.vehicles.length}</span>
          </p>
          <p className="text-sm font-mono text-blue-100">
            Pedestrians: <span className="font-bold">50</span>
          </p>
        </div>
      </div>
    </div>
  );
}
