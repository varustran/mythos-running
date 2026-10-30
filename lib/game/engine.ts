import { gameAudio } from "./audio";

export interface RunnerState {
  x: number;
  y: number;
  vy: number;
  isGrounded: boolean;
  speedMode: "jog" | "run" | "sprint";
  stamina: number;
  heartRate: number;
  distance: number;
  cadence: number;
}

export interface CollectibleItem {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  size: number;
}

export interface ObstacleItem {
  x: number;
  y: number;
  w: number;
  h: number;
  type: "stone" | "puddle" | "barrier";
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number = 0;
  private lastTime: number = 0;
  private running: boolean = false;

  public state: RunnerState = {
    x: 120,
    y: 0,
    vy: 0,
    isGrounded: true,
    speedMode: "run",
    stamina: 100,
    heartRate: 145,
    distance: 0,
    cadence: 174,
  };

  public targetDistance: number = 500;
  public collectibles: CollectibleItem[] = [];
  public obstacles: ObstacleItem[] = [];
  public onCollectShard?: () => void;
  public onChapterComplete?: () => void;
  public onHeartRateAlert?: () => void;

  private rainParticles: { x: number; y: number; speed: number; len: number }[] = [];
  private groundY: number = 0;
  private cameraX: number = 0;
  private legCycle: number = 0;
  private stepAccumulator: number = 0;

  constructor(canvas: HTMLCanvasElement, targetDistance: number = 500) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D context not available");
    this.ctx = context;
    this.targetDistance = targetDistance;
    this.initWorld();
  }

  private initWorld() {
    this.groundY = this.canvas.height - 120;
    this.state.y = this.groundY;

    // Generate rain particles
    this.rainParticles = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      speed: 12 + Math.random() * 8,
      len: 12 + Math.random() * 10,
    }));

    // Spawn collectibles and obstacles along target distance
    this.collectibles = [];
    this.obstacles = [];
    for (let d = 80; d < this.targetDistance; d += 90 + Math.random() * 60) {
      this.collectibles.push({
        id: `shard_${d}`,
        x: d * 18,
        y: this.groundY - 40 - (Math.random() > 0.4 ? 45 : 0),
        collected: false,
        size: 16,
      });
      // Obstacle every 150m
      if (d % 150 < 40 && d > 120) {
        this.obstacles.push({
          x: d * 18 + 70,
          y: this.groundY - 24,
          w: 32,
          h: 24,
          type: "stone",
        });
      }
    }
  }

  public setSpeedMode(mode: "jog" | "run" | "sprint") {
    this.state.speedMode = mode;
  }

  public jump() {
    if (this.state.isGrounded && this.state.stamina >= 8) {
      this.state.vy = -14.5;
      this.state.isGrounded = false;
      this.state.stamina = Math.max(0, this.state.stamina - 6);
    }
  }

  public start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    this.running = false;
    cancelAnimationFrame(this.animationId);
  }

  private loop = (now: number) => {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.update(dt);
    this.render();

    this.animationId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    let speedPixels = 240; // run mode
    let targetHR = 150;
    let targetCadence = 176;

    if (this.state.speedMode === "jog") {
      speedPixels = 160;
      targetHR = 128;
      targetCadence = 162;
      this.state.stamina = Math.min(100, this.state.stamina + 12 * dt);
    } else if (this.state.speedMode === "sprint") {
      if (this.state.stamina > 4) {
        speedPixels = 380;
        targetHR = 178;
        targetCadence = 194;
        this.state.stamina = Math.max(0, this.state.stamina - 18 * dt);
      } else {
        this.state.speedMode = "run";
      }
    } else {
      // Normal run
      this.state.stamina = Math.max(0, this.state.stamina - 3 * dt);
    }

    // Low stamina heartbeat alert
    if (this.state.stamina < 18) {
      if (Math.random() < 0.04) gameAudio.playHeartbeat();
    }

    // Smooth HR & Cadence adjustments
    this.state.heartRate += (targetHR - this.state.heartRate) * 0.8 * dt;
    this.state.cadence += (targetCadence - this.state.cadence) * 1.5 * dt;

    // Advance position
    const distanceGain = (speedPixels * dt) / 18;
    this.state.distance += distanceGain;
    this.state.x += speedPixels * dt;
    this.cameraX = this.state.x - 140;

    // Footstep audio cadence sync
    this.legCycle += dt * (this.state.cadence / 60) * Math.PI * 2;
    this.stepAccumulator += dt * (this.state.cadence / 60);
    if (this.stepAccumulator >= 1.0) {
      this.stepAccumulator -= 1.0;
      if (this.state.isGrounded) gameAudio.playFootstep();
    }

    // Jump gravity physics
    if (!this.state.isGrounded) {
      this.state.vy += 38 * dt;
      this.state.y += this.state.vy;
      if (this.state.y >= this.groundY) {
        this.state.y = this.groundY;
        this.state.vy = 0;
        this.state.isGrounded = true;
      }
    }

    // Check collectible collisions
    for (const c of this.collectibles) {
      if (!c.collected && Math.abs(this.state.x - c.x) < 32 && Math.abs(this.state.y - 30 - c.y) < 40) {
        c.collected = true;
        gameAudio.playShardChime();
        if (this.onCollectShard) this.onCollectShard();
      }
    }

    // Update rain
    for (const p of this.rainParticles) {
      p.y += p.speed;
      p.x -= 2;
      if (p.y > this.canvas.height) {
        p.y = -10;
        p.x = Math.random() * this.canvas.width;
      }
    }

    // Chapter completion check
    if (this.state.distance >= this.targetDistance) {
      this.stop();
      gameAudio.playChapterComplete();
      if (this.onChapterComplete) this.onChapterComplete();
    }
  }

  private render() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Sky Gradient (Deep midnight blue #040812 to #0C1A2E)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, "#03060E");
    skyGrad.addColorStop(0.6, "#071224");
    skyGrad.addColorStop(1, "#0D223E");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Distant Full Moon & Glow
    ctx.save();
    ctx.shadowColor = "#36D6D0";
    ctx.shadowBlur = 40;
    ctx.fillStyle = "#E4F8F7";
    ctx.beginPath();
    ctx.arc(w - 180, 110, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Parallax Layer 1: Distant Citadel Towers & Truong Tien Bridge silhouettes (0.1x speed)
    ctx.fillStyle = "#06101D";
    const bgOffset1 = -(this.cameraX * 0.08) % 400;
    ctx.beginPath();
    for (let x = -400; x < w + 400; x += 180) {
      const cx = x + bgOffset1;
      // Citadel battlements silhouette
      ctx.rect(cx, h - 260, 90, 140);
      ctx.rect(cx + 25, h - 290, 40, 30);
    }
    ctx.fill();

    // 4. Parallax Layer 2: Perfume River water reflection & mist (0.3x speed)
    const riverGrad = ctx.createLinearGradient(0, h - 180, 0, h - 80);
    riverGrad.addColorStop(0, "rgba(54, 214, 208, 0.12)");
    riverGrad.addColorStop(1, "rgba(77, 159, 255, 0.02)");
    ctx.fillStyle = riverGrad;
    ctx.fillRect(0, h - 190, w, 80);

    // 5. Parallax Layer 3: Ancient Willow & Lantern Trees along riverbank (0.6x speed)
    const bgOffset2 = -(this.cameraX * 0.4) % 360;
    for (let x = -360; x < w + 360; x += 220) {
      const tx = x + bgOffset2;
      // Lantern glow
      ctx.save();
      ctx.shadowColor = "#FFB238";
      ctx.shadowBlur = 24;
      ctx.fillStyle = "#FFC857";
      ctx.beginPath();
      ctx.arc(tx + 60, h - 180, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Tree trunk
      ctx.fillStyle = "#081422";
      ctx.fillRect(tx + 56, h - 180, 8, 70);
    }

    // 6. Stone Pavement & Road Bed
    const roadGrad = ctx.createLinearGradient(0, this.groundY, 0, h);
    roadGrad.addColorStop(0, "#101D2E");
    roadGrad.addColorStop(0.3, "#0C1726");
    roadGrad.addColorStop(1, "#070E18");
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, this.groundY, w, h - this.groundY);

    // Glowing road guide line
    ctx.strokeStyle = "rgba(54, 214, 208, 0.35)";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([28, 20]);
    ctx.lineDashOffset = -this.cameraX;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY + 18);
    ctx.lineTo(w, this.groundY + 18);
    ctx.stroke();
    ctx.setLineDash([]);

    // 7. Collectibles (Memory Shards)
    for (const c of this.collectibles) {
      if (c.collected) continue;
      const screenX = c.x - this.cameraX;
      if (screenX < -50 || screenX > w + 50) continue;

      ctx.save();
      ctx.shadowColor = "#36D6D0";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#4D9FFF";

      // Draw Diamond Shard
      ctx.beginPath();
      ctx.moveTo(screenX, c.y - 12);
      ctx.lineTo(screenX + 10, c.y);
      ctx.lineTo(screenX, c.y + 12);
      ctx.lineTo(screenX - 10, c.y);
      ctx.closePath();
      ctx.fill();

      // Inner glow
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(screenX, c.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 8. Obstacles (Old Stone Blocks)
    for (const o of this.obstacles) {
      const screenX = o.x - this.cameraX;
      if (screenX < -60 || screenX > w + 60) continue;
      ctx.fillStyle = "#1E2F46";
      ctx.strokeStyle = "#385375";
      ctx.lineWidth = 1.5;
      ctx.fillRect(screenX, o.y, o.w, o.h);
      ctx.strokeRect(screenX, o.y, o.w, o.h);
    }

    // 9. Runner Character ("An")
    const runnerScreenX = 140;
    const runnerY = this.state.y;
    const legAngle = Math.sin(this.legCycle) * 0.65;

    ctx.save();
    ctx.translate(runnerScreenX, runnerY);

    // Sprint speed aura
    if (this.state.speedMode === "sprint") {
      ctx.save();
      ctx.shadowColor = "#36D6D0";
      ctx.shadowBlur = 24;
      ctx.fillStyle = "rgba(54, 214, 208, 0.25)";
      ctx.beginPath();
      ctx.ellipse(-14, -28, 26, 36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Torso / Athletic Singlet
    ctx.fillStyle = "#36D6D0"; // Electric cyan
    ctx.beginPath();
    ctx.roundRect(-7, -42, 14, 24, 4);
    ctx.fill();

    // Head / Face
    ctx.fillStyle = "#F4F7FC";
    ctx.beginPath();
    ctx.arc(0, -50, 8, 0, Math.PI * 2);
    ctx.fill();

    // Running Headlamp beam
    const headlampGrad = ctx.createRadialGradient(8, -50, 2, 90, -45, 90);
    headlampGrad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
    headlampGrad.addColorStop(0.3, "rgba(77, 159, 255, 0.35)");
    headlampGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = headlampGrad;
    ctx.beginPath();
    ctx.moveTo(8, -50);
    ctx.lineTo(130, -75);
    ctx.lineTo(130, -20);
    ctx.closePath();
    ctx.fill();

    // Left Leg
    ctx.strokeStyle = "#1A2E44";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(Math.sin(legAngle) * 16, -6);
    ctx.lineTo(Math.sin(legAngle) * 18, 0);
    ctx.stroke();

    // Right Leg
    ctx.strokeStyle = "#4D9FFF";
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(Math.sin(-legAngle) * 16, -6);
    ctx.lineTo(Math.sin(-legAngle) * 18, 0);
    ctx.stroke();

    ctx.restore();

    // 10. Atmospheric Falling Rain
    ctx.strokeStyle = "rgba(180, 220, 255, 0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const p of this.rainParticles) {
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 2, p.y + p.len);
    }
    ctx.stroke();
  }
}
