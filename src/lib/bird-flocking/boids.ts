import * as THREE from 'three';

export interface Boid {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
}

export interface FlockingConfig {
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  maxSpeed: number;
  maxForce: number;
  perceptionRadius: number;
  separationDistance: number;
  boundaryRadius: number;
}

export class FlockingSystem {
  boids: Boid[] = [];
  count: number;
  config: FlockingConfig;

  constructor(count: number, config: FlockingConfig) {
    this.count = count;
    this.config = config;
    this.initBoids();
  }

  initBoids() {
    this.boids = [];
    for (let i = 0; i < this.count; i++) {
      this.boids.push({
        id: i,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 20 + 10, // Keep them somewhat elevated
          (Math.random() - 0.5) * 50
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        acceleration: new THREE.Vector3()
      });
    }
  }

  update(deltaTime: number) {
    // Snapshot of current positions/velocities for calculations
    // In a real high-perf system we might use spatial hashing, but for < 500 boids O(n^2) is acceptable in JS if optimized
    
    for (const boid of this.boids) {
      boid.acceleration.set(0, 0, 0);
      
      const separation = new THREE.Vector3();
      const alignment = new THREE.Vector3();
      const cohesion = new THREE.Vector3();
      
      let total = 0;
      
      for (const other of this.boids) {
        if (other.id === boid.id) continue;
        
        const distance = boid.position.distanceTo(other.position);
        
        if (distance < this.config.perceptionRadius && distance > 0) {
          // Separation
          if (distance < this.config.separationDistance) {
            const diff = new THREE.Vector3().subVectors(boid.position, other.position);
            diff.normalize();
            diff.divideScalar(distance); // Weight by distance
            separation.add(diff);
          }
          
          // Alignment
          alignment.add(other.velocity);
          
          // Cohesion
          cohesion.add(other.position);
          
          total++;
        }
      }
      
      if (total > 0) {
        // Average out
        // Separation
        if (separation.lengthSq() > 0) {
          separation.normalize();
          separation.multiplyScalar(this.config.maxSpeed);
          separation.sub(boid.velocity);
          separation.clampLength(0, this.config.maxForce);
        }
        
        // Alignment
        alignment.divideScalar(total);
        alignment.normalize();
        alignment.multiplyScalar(this.config.maxSpeed);
        alignment.sub(boid.velocity);
        alignment.clampLength(0, this.config.maxForce);
        
        // Cohesion
        cohesion.divideScalar(total);
        cohesion.sub(boid.position); // Vector towards center
        cohesion.normalize();
        cohesion.multiplyScalar(this.config.maxSpeed);
        cohesion.sub(boid.velocity);
        cohesion.clampLength(0, this.config.maxForce);
      }
      
      // Apply weights
      separation.multiplyScalar(this.config.separationWeight);
      alignment.multiplyScalar(this.config.alignmentWeight);
      cohesion.multiplyScalar(this.config.cohesionWeight);
      
      // Boundary avoidance (soft turn back)
      const boundaryForce = this.calculateBoundaryForce(boid);
      
      boid.acceleration.add(separation);
      boid.acceleration.add(alignment);
      boid.acceleration.add(cohesion);
      boid.acceleration.add(boundaryForce);
    }
    
    // Update physics
    for (const boid of this.boids) {
      boid.velocity.add(boid.acceleration);
      boid.velocity.clampLength(0, this.config.maxSpeed);
      boid.position.add(boid.velocity.clone().multiplyScalar(deltaTime));
      
      // Hard floor constraint
      if (boid.position.y < 2) {
        boid.position.y = 2;
        boid.velocity.y *= -0.5;
      }
    }
  }
  
  calculateBoundaryForce(boid: Boid): THREE.Vector3 {
    const center = new THREE.Vector3(0, 15, 0);
    const distance = boid.position.distanceTo(center);
    
    if (distance > this.config.boundaryRadius) {
      const force = new THREE.Vector3().subVectors(center, boid.position);
      force.normalize();
      force.multiplyScalar(this.config.maxSpeed);
      force.sub(boid.velocity);
      force.multiplyScalar(0.1); // Gentle turn back
      return force;
    }
    
    return new THREE.Vector3();
  }
}
