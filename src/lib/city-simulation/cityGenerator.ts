import * as THREE from 'three';

export interface CityConfig {
  gridSize: number;        // e.g. 10 means 10x10 blocks
  blockSize: number;       // Size of one block (excluding street)
  streetWidth: number;     // Width of streets
}

export interface BuildingData {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
  type: 'residential' | 'commercial' | 'skyscraper';
  color: string;
  height: number;
}

export interface StreetData {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number]; // Euler angles
  isIntersection: boolean;
}

export interface ParkData {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
}

export interface CityData {
  buildings: BuildingData[];
  streets: StreetData[];
  parks: ParkData[];
  width: number;
  depth: number;
}

export function generateCity(config: CityConfig): CityData {
  const { gridSize, blockSize, streetWidth } = config;
  const buildings: BuildingData[] = [];
  const streets: StreetData[] = [];
  const parks: ParkData[] = [];
  
  const cellSize = blockSize + streetWidth;
  const cityWidth = gridSize * cellSize;
  const cityDepth = gridSize * cellSize;
  const offset = cellSize / 2;

  // Generate Streets
  // Vertical streets
  for (let x = 0; x <= gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      const posX = x * cellSize - cityWidth / 2;
      const posZ = z * cellSize - cityDepth / 2 + cellSize / 2;
      
      streets.push({
        id: `street-v-${x}-${z}`,
        position: [posX, 0, posZ],
        scale: [streetWidth, 0.1, cellSize],
        rotation: [0, 0, 0],
        isIntersection: false
      });
    }
  }

  // Horizontal streets
  for (let z = 0; z <= gridSize; z++) {
    for (let x = 0; x < gridSize; x++) {
      const posZ = z * cellSize - cityDepth / 2;
      const posX = x * cellSize - cityWidth / 2 + cellSize / 2;
      
      streets.push({
        id: `street-h-${z}-${x}`,
        position: [posX, 0.01, posZ], // Slightly higher to avoid z-fighting at intersections
        scale: [cellSize, 0.1, streetWidth],
        rotation: [0, 0, 0],
        isIntersection: false
      });
    }
  }

  // Intersections (optional, for traffic lights)
  // ...

  // Generate Buildings
  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      const posX = x * cellSize - cityWidth / 2 + cellSize / 2;
      const posZ = z * cellSize - cityDepth / 2 + cellSize / 2;
      
      // Determine building type based on distance from center
      const distFromCenter = Math.sqrt(posX * posX + posZ * posZ);
      const maxDist = Math.sqrt((cityWidth/2)**2 + (cityDepth/2)**2);
      const normalizedDist = distFromCenter / maxDist;
      
      let type: BuildingData['type'] = 'residential';
      let height = 5 + Math.random() * 10;
      let color = '#d4a373'; // Beige
      
      if (normalizedDist < 0.3) {
        type = 'skyscraper';
        height = 30 + Math.random() * 50;
        color = '#8ecae6'; // Glass blue
      } else if (normalizedDist < 0.6) {
        type = 'commercial';
        height = 15 + Math.random() * 20;
        color = '#90be6d'; // Greenish
      }
      
      // Randomly skip some blocks for parks (10% chance)
      if (Math.random() < 0.1) {
        parks.push({
          id: `park-${x}-${z}`,
          position: [posX, 0.05, posZ],
          scale: [blockSize, 0.2, blockSize]
        });
        continue; 
      }
      
      // Building footprint
      const width = blockSize * (0.6 + Math.random() * 0.3);
      const depth = blockSize * (0.6 + Math.random() * 0.3);
      
      buildings.push({
        id: `bld-${x}-${z}`,
        position: [posX, height / 2, posZ],
        scale: [width, height, depth],
        type,
        color,
        height
      });
    }
  }

  return { buildings, streets, parks, width: cityWidth, depth: cityDepth };
}
