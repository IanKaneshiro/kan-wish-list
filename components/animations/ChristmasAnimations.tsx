"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Snowflakes({ disabled = false }: { disabled?: boolean }) {
  const [snowflakes, setSnowflakes] = useState<
    Array<{ id: number; left: number; delay: number; duration: number }>
  >([]);

  useEffect(() => {
    if (disabled) return;

    const flakes = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 10,
    }));
    setSnowflakes(flakes);
  }, [disabled]);

  if (disabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute text-white text-opacity-70"
          style={{ left: `${flake.left}%`, top: -20 }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, Math.random() * 100 - 50],
            rotate: [0, 360],
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          ❄
        </motion.div>
      ))}
    </div>
  );
}

export function Confetti({ trigger = false }: { trigger?: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    }
  }, [trigger]);

  if (!show) return null;

  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: ["#dc2626", "#16a34a", "#2563eb", "#f59e0b"][
      Math.floor(Math.random() * 4)
    ],
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: `${piece.left}%`,
            top: -20,
            backgroundColor: piece.color,
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, Math.random() * 200 - 100],
            rotate: [piece.rotation, piece.rotation + 720],
            opacity: [1, 0],
          }}
          transition={{
            duration: 2 + Math.random(),
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export function SleighAnimation({ trigger = false }: { trigger?: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <motion.div
        className="absolute top-20 text-6xl"
        initial={{ x: "-200px" }}
        animate={{ x: "110vw" }}
        transition={{ duration: 3, ease: "easeInOut" }}
      >
        🎅🛷
      </motion.div>
    </div>
  );
}

export function TwinklingLights({ disabled = false }: { disabled?: boolean }) {
  if (disabled) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-12 pointer-events-none z-10 flex justify-around items-center">
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-full"
          style={{
            backgroundColor: ["#dc2626", "#16a34a", "#f59e0b", "#2563eb"][
              i % 4
            ],
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
