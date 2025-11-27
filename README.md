# 3D Sim Worlds

A collection of interactive 3D simulation worlds built with Next.js and Three.js.

![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black)
![Three.js](https://img.shields.io/badge/Three.js-0.164.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Project Overview

This project contains two visually stunning 3D interactive simulation worlds:

### 🐦 Bird Flocking Simulation

A realistic simulation of bird flocking behavior based on the classic Boids algorithm, set in a serene natural environment.

**Features**:

- ✨ Realistic flocking behavior (Separation, Alignment, Cohesion)
- 🎮 Dual camera system (Free Camera + Follow Camera)
- 🎛️ Real-time parameter adjustment (Leva GUI)
- 🌳 Beautiful natural environment (Sky, Trees, Water)
- ⚡ High-performance rendering (Supports 10-1000 birds)

### 🏙️ City Simulation

A procedurally generated city featuring buildings, traffic, and pedestrian systems.

**Features**:

- 🏗️ Procedural city generation (8x8 blocks)
- 🚗 Intelligent traffic system (100 vehicles)
- 🚶 Pedestrian system (50 pedestrians)
- 🌆 Zoned buildings (Skyscrapers, Commercial, Residential)
- 🎨 Post-processing effects (Bloom)

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the project.

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
3d-sim-worlds/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── bird-flocking/     # Bird flocking simulation page
│   │   └── city-simulation/   # City simulation page
│   ├── components/            # React Components
│   │   ├── bird-flocking/    # Bird flocking related components
│   │   └── city-simulation/  # City simulation related components
│   └── lib/                   # Core Logic
│       ├── bird-flocking/    # Boids algorithm
│       └── city-simulation/  # City generation and traffic system
├── tasks/                 # Documentation and tasks
└── ...
```

## 🎮 User Guide

### Bird Flocking Simulation

1. Visit `/bird-flocking` page
2. Use the GUI panel on the right to adjust parameters:
   - **Count**: Number of birds
   - **Separation Weight**: Weight for separation rule
   - **Alignment Weight**: Weight for alignment rule
   - **Cohesion Weight**: Weight for cohesion rule
   - **Max Speed**: Maximum speed
3. Press **V** to toggle camera view (Free/Follow)
4. In Free Camera mode:
   - Left click drag: Rotate view
   - Mouse wheel: Zoom
   - Right click drag: Pan

### City Simulation

1. Visit `/city-simulation` page
2. Observe:
   - Vehicles driving along streets
   - Pedestrians walking in the city
   - Different types of buildings
3. Control camera with mouse:
   - Left click drag: Rotate
   - Mouse wheel: Zoom
   - Right click drag: Pan

## 🛠️ Tech Stack

### Core Framework

- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling

### 3D Rendering

- **Three.js** - 3D Engine
- **React Three Fiber** - React Renderer
- **React Three Drei** - Helper Components
- **React Three Postprocessing** - Post-processing Effects

### Helper Libraries

- **Leva** - GUI Control Panel
- **Zustand** - State Management

## ⚡ Performance Optimization

- **InstancedMesh**: Use instanced rendering for all repetitive objects
- **Frame Rate Control**: Delta time limiting to prevent frame skipping
- **Memory Optimization**: useMemo to cache geometries and materials
- **Efficient Algorithms**: Optimized neighbor search for Boids algorithm

## 📚 Documentation

- [Implementation Plan](./tasks/3d-sim-worlds-implementation.md) - Detailed technical implementation document
- [Completion Report](./tasks/PROJECT_COMPLETION_REPORT.md) - Project completion summary
- [Setup Instructions](./docs/setup.md) - Original requirements document

## 🎯 Core Algorithms

### Boids Algorithm (Bird Flocking)

Based on Craig Reynolds' classic algorithm, simulating complex group behavior through three simple rules:

1. **Separation**: Avoid collisions with nearby neighbors
2. **Alignment**: Steer towards the average heading of neighbors
3. **Cohesion**: Steer to move towards the average position of neighbors

### Procedural Generation (City Simulation)

- **Grid System**: Regular street grid
- **Zoning**: Distance-based building type distribution
- **Traffic System**: Lane connections and path planning

## 🔮 Future Improvements

- [ ] Traffic light system
- [ ] Vehicle obstacle avoidance logic
- [ ] Building details (windows, textures)
- [ ] Day/Night cycle
- [ ] Weather system
- [ ] Performance monitoring panel
- [ ] VR support

## 📝 License

MIT License

## 👨‍💻 Developer

Developed by AI Assistant (Antigravity)

---

**Enjoy exploring these 3D worlds!** 🚀
