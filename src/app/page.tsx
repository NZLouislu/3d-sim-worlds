import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-col">
        <h1 className="text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          3D Sim Worlds
        </h1>
        
        <p className="text-xl mb-16 text-slate-300 text-center max-w-2xl">
          Explore interactive 3D environments powered by Three.js and Next.js.
          Select a simulation below to begin.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <Link 
            href="/bird-flocking"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30 bg-neutral-900/50"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Bird Flocking{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Realistic flocking behavior in a serene nature scene.
            </p>
          </Link>

          <Link 
            href="/city-simulation"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30 bg-neutral-900/50"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              City Simulation{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Procedural city with traffic, pedestrians, and dynamic details.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
