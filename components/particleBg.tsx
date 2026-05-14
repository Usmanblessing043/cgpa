"use client";

import Particles from "react-tsparticles";
import { useCallback } from "react";
import { loadSlim } from "tsparticles-slim";

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="absolute inset-0 -z-10">
      <Particles
        init={particlesInit}
        className="w-full h-full"
       options={{
  fullScreen: { enable: false },
  background: { color: "transparent" },

  fpsLimit: 60,

  particles: {
    number: {
      value: 110, 
      density: {
        enable: true,
        area: 700
      }
    },

    color: {
      value: ["#f97316", "#ffffff", "#ffedd5"]
    },

    shape: {
      type: "circle"
    },

    opacity: {
      value: { min: 0.2, max: 0.7 } 
    },

    size: {
      value: { min: 1, max: 5 } 
    },

   move: {
  enable: true,
  speed: 1.5,
  direction: "none",
  random: true,
  straight: false,
  outModes: { default: "out" }
},

    links: {
      enable: true,
      color: "#f97316",
      opacity: 0.25, // 🔥 stronger connections
      distance: 120,
      width: 1
    }
  },

  interactivity: {
    events: {
      onHover: {
        enable: false,
        mode: "repulse"
      }
    },
    modes: {
      repulse: {
        distance: 120,
        duration: 0.4
      }
    }
  },

  detectRetina: true
}}
      />
    </div>
  );
};

export default ParticlesBackground;