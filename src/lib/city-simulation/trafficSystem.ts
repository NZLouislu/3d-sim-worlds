import * as THREE from 'three';
import { CityData, StreetData } from './cityGenerator';

export interface Vehicle {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
  speed: number;
  currentLaneIndex: number;
  targetPoint: THREE.Vector3;
  type: 'car' | 'truck' | 'bus';
  color: string;
}

interface Lane {
  start: THREE.Vector3;
  end: THREE.Vector3;
  direction: THREE.Vector3;
  nextLanes: number[]; // Indices of connected lanes
}

export class TrafficSystem {
  vehicles: Vehicle[] = [];
  lanes: Lane[] = [];
  cityData: CityData;
  
  constructor(cityData: CityData, vehicleCount: number) {
    this.cityData = cityData;
    this.initLanes();
    this.initVehicles(vehicleCount);
  }

  initLanes() {
    // Convert streets to lanes
    // Each street has 2 lanes (opposite directions)
    // We need to be careful with coordinates
    
    this.cityData.streets.forEach(street => {
      const isVertical = street.scale[0] < street.scale[2]; // Width < Length
      const halfLen = (isVertical ? street.scale[2] : street.scale[0]) / 2;
      const laneOffset = 2; // Offset from center
      
      const center = new THREE.Vector3(street.position[0], 0.5, street.position[2]);
      
      if (isVertical) {
        // Lane 1: +Z direction (right side)
        this.lanes.push({
          start: new THREE.Vector3(center.x - laneOffset, 0.5, center.z - halfLen),
          end: new THREE.Vector3(center.x - laneOffset, 0.5, center.z + halfLen),
          direction: new THREE.Vector3(0, 0, 1),
          nextLanes: []
        });
        // Lane 2: -Z direction
        this.lanes.push({
          start: new THREE.Vector3(center.x + laneOffset, 0.5, center.z + halfLen),
          end: new THREE.Vector3(center.x + laneOffset, 0.5, center.z - halfLen),
          direction: new THREE.Vector3(0, 0, -1),
          nextLanes: []
        });
      } else {
        // Lane 1: +X direction
        this.lanes.push({
          start: new THREE.Vector3(center.x - halfLen, 0.5, center.z + laneOffset),
          end: new THREE.Vector3(center.x + halfLen, 0.5, center.z + laneOffset),
          direction: new THREE.Vector3(1, 0, 0),
          nextLanes: []
        });
        // Lane 2: -X direction
        this.lanes.push({
          start: new THREE.Vector3(center.x + halfLen, 0.5, center.z - laneOffset),
          end: new THREE.Vector3(center.x - halfLen, 0.5, center.z - laneOffset),
          direction: new THREE.Vector3(-1, 0, 0),
          nextLanes: []
        });
      }
    });

    // Connect lanes (naive O(n^2) connection)
    // If a lane ends near another lane's start, connect them
    const connectionThreshold = 5; 
    for (let i = 0; i < this.lanes.length; i++) {
      for (let j = 0; j < this.lanes.length; j++) {
        if (i === j) continue;
        if (this.lanes[i].end.distanceTo(this.lanes[j].start) < connectionThreshold) {
          this.lanes[i].nextLanes.push(j);
        }
      }
    }
  }

  initVehicles(count: number) {
    for (let i = 0; i < count; i++) {
      const laneIndex = Math.floor(Math.random() * this.lanes.length);
      const lane = this.lanes[laneIndex];
      const t = Math.random(); // Position along lane
      
      const pos = new THREE.Vector3().lerpVectors(lane.start, lane.end, t);
      
      this.vehicles.push({
        id: `veh-${i}`,
        position: pos,
        rotation: new THREE.Euler(0, 0, 0), // Will be set in update
        velocity: new THREE.Vector3(),
        speed: 5 + Math.random() * 5,
        currentLaneIndex: laneIndex,
        targetPoint: lane.end.clone(),
        type: Math.random() > 0.8 ? 'bus' : 'car',
        color: ['#1a1a1a', '#2d6a4f', '#7209b7', '#e63946', '#f1faee'][Math.floor(Math.random() * 5)]
      });
    }
  }

  update(delta: number) {
    for (const vehicle of this.vehicles) {
      // Move towards target
      const dir = new THREE.Vector3().subVectors(vehicle.targetPoint, vehicle.position);
      const dist = dir.length();
      
      if (dist < 1) {
        // Reached end of lane, pick next lane
        const currentLane = this.lanes[vehicle.currentLaneIndex];
        if (currentLane.nextLanes.length > 0) {
          const nextIndex = currentLane.nextLanes[Math.floor(Math.random() * currentLane.nextLanes.length)];
          vehicle.currentLaneIndex = nextIndex;
          vehicle.targetPoint = this.lanes[nextIndex].end.clone();
          // Teleport to start of next lane to avoid gaps (simplified)
          vehicle.position.copy(this.lanes[nextIndex].start);
        } else {
          // Dead end, turn around (or respawn)
          // For now, just respawn at random lane
          const laneIndex = Math.floor(Math.random() * this.lanes.length);
          vehicle.currentLaneIndex = laneIndex;
          vehicle.position.copy(this.lanes[laneIndex].start);
          vehicle.targetPoint = this.lanes[laneIndex].end.clone();
        }
      } else {
        dir.normalize();
        vehicle.velocity = dir.multiplyScalar(vehicle.speed);
        vehicle.position.add(vehicle.velocity.clone().multiplyScalar(delta));
        
        // Update rotation
        vehicle.rotation.y = Math.atan2(vehicle.velocity.x, vehicle.velocity.z);
      }
    }
  }
}
