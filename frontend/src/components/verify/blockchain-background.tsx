"use client";

export function BlockchainBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {/* Soft gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f0f4ff] via-[#f8fafc] to-[#eef2ff]" />

      {/* Animated mesh */}
      <div className="blockchain-mesh absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
      <div className="blockchain-mesh-delay absolute -right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="blockchain-mesh-slow absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-blue-300/10 blur-3xl" />

      {/* Wavy lines */}
      <svg
        className="absolute bottom-0 left-0 w-full opacity-[0.35]"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          className="blockchain-wave"
          fill="none"
          stroke="#1D4ED8"
          strokeWidth="1.5"
          d="M0,160 C240,80 480,240 720,160 C960,80 1200,240 1440,160"
        />
        <path
          className="blockchain-wave-delay"
          fill="none"
          stroke="#93C5FD"
          strokeWidth="1"
          d="M0,200 C360,120 720,280 1080,200 C1260,160 1380,220 1440,200"
        />
      </svg>

      {/* Floating nodes */}
      <svg className="absolute inset-0 h-full w-full opacity-20">
        {[...Array(8)].map((_, i) => (
          <circle
            key={i}
            className="blockchain-node"
            cx={`${10 + i * 12}%`}
            cy={`${15 + (i % 4) * 20}%`}
            r="3"
            fill="#1D4ED8"
            style={{ animationDelay: `${i * 0.7}s` }}
          />
        ))}
      </svg>
    </div>
  );
}
