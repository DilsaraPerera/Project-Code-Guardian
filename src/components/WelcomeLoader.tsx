import { useState, useEffect } from "react";
import { Shield, ScanLine, Lock, Eye } from "lucide-react";

interface WelcomeLoaderProps {
  onComplete: () => void;
}

export function WelcomeLoader({ onComplete }: WelcomeLoaderProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 2500),
      setTimeout(() => onComplete(), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: phase >= 1 ? 0.15 : 0,
          background: `radial-gradient(600px circle at 50% 50%, hsl(var(--primary)), transparent 70%)`,
        }}
      />

      <div className="relative flex flex-col items-center gap-8">
        {/* Shield icon with pulse */}
        <div
          className={`relative transition-all duration-700 ease-out ${phase >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
        >
          <div className="relative">
            <Shield className="h-20 w-20 text-scan" strokeWidth={1.5} />
            {/* Scan line sweeping over shield */}
            <div
              className={`absolute inset-0 overflow-hidden transition-opacity duration-500 ${phase >= 2 ? "opacity-100" : "opacity-0"
                }`}
            >
              <div className="animate-scan-sweep absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
          </div>

          {/* Orbiting icons */}
          {[ScanLine, Lock, Eye].map((Icon, i) => (
            <div
              key={i}
              className={`absolute transition-all duration-500 ease-out ${phase >= 2 ? "scale-100 opacity-60" : "scale-0 opacity-0"
                }`}
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${i * 120}deg) translateY(-52px) rotate(-${i * 120}deg)`,
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <Icon className="h-5 w-5 text-scan/70" />
            </div>
          ))}
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1
            className={`text-3xl font-bold tracking-tight text-primary transition-all duration-500 ${phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
          >
            CODE GUARDIAN
          </h1>
          <p
            className={`text-sm font-mono text-primary/80 transition-all duration-500 ${phase >= 2 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
          >
            Security Scanner & Code Quality Checker
          </p>
        </div>

        {/* Loading bar */}
        <div
          className={`w-48 h-0.5 bg-scan/30 rounded-full overflow-hidden transition-opacity duration-300 ${phase >= 3 ? "opacity-100" : "opacity-0"
            }`}
        >
          <div
            className="h-full bg-scan rounded-full transition-all ease-out"
            style={{
              width: phase >= 4 ? "100%" : phase >= 3 ? "60%" : "0%",
              transitionDuration: phase >= 4 ? "600ms" : "800ms",
            }}
          />
        </div>

        {/* Status text */}
        <p
          className={`text-xs font-mono text-primary/60 transition-all duration-300 ${phase >= 3 ? "opacity-100" : "opacity-0"
            }`}
        >
          {phase >= 4 ? "Ready" : "Initializing security modules..."}
        </p>
      </div>
    </div>
  );
}
