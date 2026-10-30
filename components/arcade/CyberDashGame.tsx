"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Zap, Trophy, Volume2, VolumeX } from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";

export function CyberDashGame({ locale }: { locale: Locale }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const stateRef = useRef({
    playerY: 260,
    playerVy: 0,
    isJumping: false,
    jumpCount: 0,
    obstacles: [] as { x: number; w: number; h: number; type: string }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[],
    speed: 6,
    score: 0,
    frame: 0,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("myso_cyber_high_score");
      if (saved) setHighScore(Number(saved));
    } catch {}
  }, []);

  const playSynthBeep = (freq: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  const jump = () => {
    const s = stateRef.current;
    if (s.jumpCount < 2) {
      s.playerVy = -11;
      s.isJumping = true;
      s.jumpCount += 1;
      playSynthBeep(440 + s.jumpCount * 120, 0.1);
    }
  };

  const startGame = () => {
    const s = stateRef.current;
    s.playerY = 260;
    s.playerVy = 0;
    s.isJumping = false;
    s.jumpCount = 0;
    s.obstacles = [];
    s.particles = [];
    s.speed = 6;
    s.score = 0;
    s.frame = 0;
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    playSynthBeep(587, 0.15);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const s = stateRef.current;
      s.frame += 1;
      s.score += 1;
      setScore(s.score);

      // Increase speed gradually
      if (s.frame % 300 === 0 && s.speed < 14) {
        s.speed += 0.5;
      }

      // Physics
      s.playerVy += 0.6; // gravity
      s.playerY += s.playerVy;
      if (s.playerY >= 260) {
        s.playerY = 260;
        s.playerVy = 0;
        s.isJumping = false;
        s.jumpCount = 0;
      }

      // Spawn obstacles
      if (s.frame % Math.max(45, 90 - Math.floor(s.speed * 3)) === 0) {
        s.obstacles.push({
          x: canvas.width + 20,
          w: 22,
          h: 30 + Math.random() * 25,
          type: "glitch",
        });
      }

      // Clear Canvas
      ctx.fillStyle = "#040914";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Neon Grid lines
      ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
      ctx.lineWidth = 1;
      for (let y = 100; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Ground
      ctx.fillStyle = "#0A1628";
      ctx.fillRect(0, 290, canvas.width, canvas.height - 290);
      ctx.strokeStyle = "#00F0FF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 290);
      ctx.lineTo(canvas.width, 290);
      ctx.stroke();

      // Update & Draw Obstacles
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const obs = s.obstacles[i];
        obs.x -= s.speed;

        // Draw neon obstacle
        ctx.fillStyle = "#FF0055";
        ctx.shadowColor = "#FF0055";
        ctx.shadowBlur = 10;
        ctx.fillRect(obs.x, 290 - obs.h, obs.w, obs.h);
        ctx.shadowBlur = 0;

        // Collision check
        const playerX = 80;
        const playerW = 24;
        const playerH = 30;
        const playerBoxY = s.playerY - playerH;

        if (
          playerX + playerW > obs.x &&
          playerX < obs.x + obs.w &&
          s.playerY > 290 - obs.h
        ) {
          // Game Over!
          playSynthBeep(180, 0.3);
          setIsPlaying(false);
          setGameOver(true);
          if (s.score > highScore) {
            setHighScore(s.score);
            try {
              localStorage.setItem("myso_cyber_high_score", String(s.score));
            } catch {}
          }
          return;
        }

        if (obs.x < -30) {
          s.obstacles.splice(i, 1);
        }
      }

      // Draw Player (Neon Runner)
      ctx.fillStyle = "#00F0FF";
      ctx.shadowColor = "#00F0FF";
      ctx.shadowBlur = 12;
      ctx.fillRect(80, s.playerY - 30, 24, 30);
      // Eye visor
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(94, s.playerY - 24, 8, 5);
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, soundEnabled, highScore]);

  return (
    <div className="card overflow-hidden border border-teal/40 bg-[#030712] shadow-2xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-3.5 bg-black/40">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-teal animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-teal">
            MYSO CYBER DASH · RETRO ARCADE
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-white/60">
            Điểm: <strong className="text-white">{score}</strong>
          </span>
          <span className="text-accent flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5" />
            Kỷ lục: <strong>{highScore}</strong>
          </span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white/60 hover:text-white transition"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={700}
          height={320}
          onClick={jump}
          className="w-full h-auto cursor-pointer block"
        />

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-6 text-center">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide">
              MYSO CYBER DASH
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-white/70 max-w-sm">
              Nhấn phím Space hoặc chạm vào màn hình để nhảy. Nhấn 2 lần để Double-Jump vượt qua bẫy điện tử!
            </p>
            <button
              onClick={startGame}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal to-accent px-6 py-3 text-sm font-semibold text-black hover:opacity-95 transition shadow-lg shadow-teal/20"
            >
              <Play className="h-4 w-4 fill-current" />
              Bắt Đầu Chơi
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center animate-fade-in">
            <span className="font-mono text-xs text-red-400 uppercase tracking-widest font-bold">
              GLITCH OVER
            </span>
            <h3 className="mt-1 font-display text-3xl font-bold text-white">Điểm: {score}</h3>
            {score >= highScore && score > 0 && (
              <span className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-accent font-semibold">
                <Trophy className="h-3.5 w-3.5" /> Kỷ lục mới!
              </span>
            )}
            <button
              onClick={startGame}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-3 text-sm font-semibold text-black hover:bg-teal/90 transition shadow-lg"
            >
              <RotateCcw className="h-4 w-4" />
              Chơi Lại Ngay
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-white/10 px-6 py-3 bg-black/60 flex items-center justify-between text-xs font-mono text-white/50">
        <span>Điều khiển: Nhấn chuột / chạm màn hình / Space để nhảy (Hỗ trợ 2 lần nhảy)</span>
        <button
          onClick={jump}
          disabled={!isPlaying}
          className="rounded-lg bg-teal/20 border border-teal/40 px-4 py-1 text-teal font-semibold text-xs hover:bg-teal hover:text-black transition disabled:opacity-30"
        >
          NHẢY (JUMP)
        </button>
      </div>
    </div>
  );
}
