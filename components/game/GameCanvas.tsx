"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Zap,
  ArrowUp,
  Heart,
  Activity,
  Flame,
  Award,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { GameEngine } from "@/lib/game/engine";
import { gameChapters } from "@/lib/game/chapters";
import { loadGameSave, saveGameProgress } from "@/lib/game/storage";
import { gameAudio } from "@/lib/game/audio";
import type { Locale } from "@/lib/i18n/settings";
import type { DialogueNode, GameChapter } from "@/lib/game/types";
import { cn } from "@/lib/utils";

export function GameCanvas({ locale, initialChapterId = 1 }: { locale: Locale; initialChapterId?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [currentChapter, setCurrentChapter] = useState<GameChapter>(
    () => gameChapters.find((c) => c.id === initialChapterId) || gameChapters[0]
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // HUD States
  const [distance, setDistance] = useState(0);
  const [stamina, setStamina] = useState(100);
  const [heartRate, setHeartRate] = useState(140);
  const [speedMode, setSpeedMode] = useState<"jog" | "run" | "sprint">("run");
  const [shardsCount, setShardsCount] = useState(0);

  // Story & Dialogue States
  const [activeDialogue, setActiveDialogue] = useState<DialogueNode | null>(null);
  const [chapterCompleted, setChapterCompleted] = useState(false);
  const [endingReached, setEndingReached] = useState<string | null>(null);

  // Load initial progress
  useEffect(() => {
    const save = loadGameSave();
    setShardsCount(save.shardsCount);
  }, []);

  const handleStartChapter = useCallback((chapter: GameChapter) => {
    setCurrentChapter(chapter);
    setChapterCompleted(false);
    setEndingReached(null);
    setDistance(0);
    setStamina(100);

    if (canvasRef.current) {
      if (engineRef.current) engineRef.current.stop();

      const engine = new GameEngine(canvasRef.current, chapter.targetMeters);
      engineRef.current = engine;

      engine.onCollectShard = () => {
        setShardsCount((prev) => {
          const next = prev + 1;
          saveGameProgress({ shardsCount: next });
          return next;
        });
      };

      engine.onChapterComplete = () => {
        setIsPlaying(false);
        setChapterCompleted(true);
        saveGameProgress({
          chapter: Math.min(8, chapter.id + 1),
          completedChapters: Array.from(new Set([...loadGameSave().completedChapters, chapter.id])),
        });
      };

      // Show initial dialogue if present
      if (chapter.initialDialogue && chapter.initialDialogue.length > 0) {
        setActiveDialogue(chapter.initialDialogue[0]);
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        engine.start();
      }
    }
  }, []);

  // Initialize engine on mount
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.parentElement?.clientWidth || 960;
      canvasRef.current.height = 480;
      handleStartChapter(currentChapter);
    }

    return () => {
      if (engineRef.current) engineRef.current.stop();
    };
  }, [currentChapter, handleStartChapter]);

  // Sync HUD state from engine ticker
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (engineRef.current) {
        setDistance(Math.floor(engineRef.current.state.distance));
        setStamina(Math.floor(engineRef.current.state.stamina));
        setHeartRate(Math.floor(engineRef.current.state.heartRate));
        setSpeedMode(engineRef.current.state.speedMode);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Keyboard controls
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!engineRef.current || activeDialogue) return;

      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        engineRef.current.jump();
      } else if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        engineRef.current.setSpeedMode("sprint");
      } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        engineRef.current.setSpeedMode("run");
      } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        engineRef.current.setSpeedMode("jog");
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (!engineRef.current) return;
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        engineRef.current.setSpeedMode("run");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeDialogue]);

  const togglePause = () => {
    if (!engineRef.current) return;
    if (isPlaying) {
      engineRef.current.stop();
      setIsPlaying(false);
      setIsPaused(true);
    } else {
      engineRef.current.start();
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const toggleAudio = () => {
    const next = !isMuted;
    setIsMuted(next);
    gameAudio.setMuted(next);
  };

  const handleDialogueChoice = (effect?: string, nextId?: string) => {
    if (effect === "preserve" || effect === "pioneer" || effect === "endure") {
      const cur = loadGameSave().storyAlignment;
      saveGameProgress({
        storyAlignment: {
          ...cur,
          [effect]: (cur[effect as keyof typeof cur] || 0) + 1,
        },
      });
      if (currentChapter.id === 8) {
        setEndingReached(effect);
      }
    }

    if (nextId) {
      const nextNode = currentChapter.initialDialogue.find((n) => n.id === nextId);
      if (nextNode) {
        setActiveDialogue(nextNode);
        return;
      }
    }

    // Dialogue finished, resume running
    setActiveDialogue(null);
    setIsPlaying(true);
    if (engineRef.current) engineRef.current.start();
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-line bg-[#040812] shadow-2xl">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between border-b border-line/60 bg-surface/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
          <span className="font-display text-sm font-semibold text-ink">
            {currentChapter.title[locale]}
          </span>
          <span className="hidden sm:inline font-mono text-[0.68rem] text-subtle">
            {currentChapter.location[locale]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            className="rounded-lg border border-line bg-elevated/70 p-2 text-muted transition hover:text-ink"
            title="Audio FX"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-teal" />}
          </button>

          {/* Pause / Play */}
          <button
            onClick={togglePause}
            className="rounded-lg border border-line bg-elevated/70 p-2 text-muted transition hover:text-ink"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-accent" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive Canvas */}
      <div className="relative w-full overflow-hidden bg-[#03060E]">
        <canvas ref={canvasRef} className="block w-full h-[400px] sm:h-[460px] cursor-pointer" />

        {/* HUD Overlay */}
        <div className="pointer-events-none absolute left-4 top-4 right-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Distance progress */}
          <div className="flex items-center gap-2 rounded-xl border border-line/80 bg-canvas/80 px-3 py-1.5 backdrop-blur shadow-md">
            <Activity className="h-3.5 w-3.5 text-accent" />
            <span className="font-mono text-ink font-semibold">{distance}m</span>
            <span className="text-subtle font-mono">/ {currentChapter.targetMeters}m</span>
          </div>

          {/* Biometrics: Heart Rate & Stamina */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-line/80 bg-canvas/80 px-3 py-1.5 backdrop-blur shadow-md">
              <Heart className={cn("h-3.5 w-3.5 text-rose-500", heartRate > 165 && "animate-ping")} />
              <span className="font-mono font-semibold text-ink">{heartRate}</span>
              <span className="text-[0.65rem] text-subtle">bpm</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-line/80 bg-canvas/80 px-3 py-1.5 backdrop-blur shadow-md">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <div className="h-2 w-16 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full bg-gradient-to-r from-teal to-accent transition-all duration-300"
                  style={{ width: `${stamina}%` }}
                />
              </div>
            </div>

            {/* Memory Shards */}
            <div className="flex items-center gap-1.5 rounded-xl border border-line/80 bg-canvas/80 px-3 py-1.5 backdrop-blur shadow-md">
              <Sparkles className="h-3.5 w-3.5 text-teal animate-spin" style={{ animationDuration: "6s" }} />
              <span className="font-mono font-semibold text-teal">{shardsCount}</span>
            </div>
          </div>
        </div>

        {/* 3. Dialogue Overlay */}
        {activeDialogue ? (
          <div className="absolute inset-0 z-30 flex items-end p-4 sm:p-6 bg-canvas/40 backdrop-blur-sm animate-fade-in">
            <div className="w-full rounded-2xl border border-teal/40 bg-[#081220]/95 p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-line pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-teal text-sm">
                    {activeDialogue.speaker}
                  </span>
                  <span className="font-mono text-[0.65rem] text-subtle uppercase tracking-wider">
                    ({activeDialogue.speakerRole[locale]})
                  </span>
                </div>
              </div>

              <p className="font-sans text-sm sm:text-base leading-relaxed text-ink/90">
                {activeDialogue.text[locale]}
              </p>

              {activeDialogue.choices && activeDialogue.choices.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-line/60">
                  {activeDialogue.choices.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDialogueChoice(choice.effect, choice.nextNodeId)}
                      className="rounded-xl border border-teal/30 bg-teal/10 px-4 py-2 text-xs font-medium text-teal hover:bg-teal hover:text-black transition shadow-sm"
                    >
                      {choice.text[locale]}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleDialogueChoice()}
                    className="rounded-xl bg-teal px-5 py-2 text-xs font-semibold text-black hover:bg-teal/90 transition shadow-md"
                  >
                    {locale === "vi" ? "Chạy tiếp »" : locale === "zh-CN" ? "继续奔跑 »" : locale === "ja" ? "走る »" : "Run On »"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* 4. Chapter Completed Overlay */}
        {chapterCompleted ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-canvas/80 backdrop-blur-md animate-fade-up">
            <div className="max-w-md w-full text-center rounded-2xl border border-line bg-surface p-7 shadow-2xl">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-teal/40 bg-teal/10 text-teal">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-ink">
                {locale === "vi" ? "Hoàn Thành Cung Đường!" : "Chapter Completed!"}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted">
                {currentChapter.completionDialogue[0]?.text[locale]}
              </p>

              <div className="mt-6 flex flex-col gap-2">
                {currentChapter.id < 8 ? (
                  <button
                    onClick={() => handleStartChapter(gameChapters[currentChapter.id])}
                    className="w-full rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-black hover:bg-teal/90 transition shadow-lg"
                  >
                    {locale === "vi" ? `Qua Chương ${currentChapter.id + 1} »` : `Next Chapter ${currentChapter.id + 1} »`}
                  </button>
                ) : (
                  <button
                    onClick={() => setEndingReached("complete")}
                    className="w-full rounded-xl bg-gradient-to-r from-teal to-accent px-4 py-3 text-sm font-semibold text-black hover:opacity-90 transition shadow-lg"
                  >
                    {locale === "vi" ? "Xem Kết Thúc Vận Mệnh »" : "Reveal Final Destiny »"}
                  </button>
                )}

                <button
                  onClick={() => handleStartChapter(currentChapter)}
                  className="w-full rounded-xl border border-line bg-elevated px-4 py-2.5 text-xs text-muted hover:text-ink transition"
                >
                  <RotateCcw className="inline mr-1.5 h-3.5 w-3.5" />
                  {locale === "vi" ? "Chạy lại chương này" : "Replay Chapter"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* 5. Ending Screen */}
        {endingReached ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-canvas/95 backdrop-blur-xl animate-fade-in">
            <div className="max-w-lg w-full text-center rounded-3xl border border-teal/40 bg-[#06101E] p-8 shadow-2xl">
              <span className="font-mono text-xs uppercase tracking-widest text-accent">
                {locale === "vi" ? "MYTHOS: DẤU CHÂN CUỐI CÙNG" : "MYTHOS: THE LAST ROUTE"}
              </span>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
                {endingReached === "preserve"
                  ? locale === "vi" ? "KẾT THÚC: NGƯỜI LƯU GIỮ" : "ENDING: THE PRESERVER"
                  : endingReached === "pioneer"
                  ? locale === "vi" ? "KẾT THÚC: NGƯỜI KHAI MỞ" : "ENDING: THE PIONEER"
                  : locale === "vi" ? "KẾT THÚC: BƯỚC CHẠY BẤT TẬN" : "ENDING: THE ETERNAL RUNNER"}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {endingReached === "preserve"
                  ? locale === "vi"
                    ? "Bạn đã chọn bảo tồn nguyên vẹn những ký ức xưa của Cố Đô. Những con đường cổ kính sẽ không bao giờ phai mờ, nhưng thế giới bên ngoài sẽ mãi là một bí ẩn."
                    : "You chose to preserve the pristine memories of Hue. The ancient stones remain timeless, sealed in perpetual grace."
                  : endingReached === "pioneer"
                  ? locale === "vi"
                    ? "Bạn đã đập tan rào cản của Người Giữ Đường. Ánh bình minh rực rỡ tràn ngập dòng sông Hương, mở ra kỷ nguyên mới cho hàng vạn thế hệ runner tiếp bước!"
                    : "You shattered the stasis barrier. The radiant dawn floods the Perfume River, welcoming generations of future runners!"
                  : locale === "vi"
                  ? "Bạn đã hòa đôi chân mình vào nhịp thở của dòng sông. Kể từ nay, bạn trở thành người dẫn lối cho bất kỳ ai lạc bước trong màn sương đêm."
                  : "You became one with the river's rhythm. A living legend guiding all wanderers through the mist."}
              </p>

              <div className="mt-8 flex justify-center gap-3">
                <button
                  onClick={() => handleStartChapter(gameChapters[0])}
                  className="rounded-xl bg-teal px-6 py-2.5 text-xs font-semibold text-black hover:bg-teal/90 transition shadow-lg"
                >
                  {locale === "vi" ? "Chơi Lại Từ Đầu" : "New Game"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 6. On-screen Controls (Touch & Mobile Friendly) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line bg-surface/90 px-4 py-3 sm:px-6">
        {/* Pace Controls */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.65rem] text-subtle uppercase tracking-wider hidden sm:inline">Pace:</span>
          {(["jog", "run", "sprint"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setSpeedMode(mode);
                if (engineRef.current) engineRef.current.setSpeedMode(mode);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wider transition",
                speedMode === mode
                  ? "bg-teal text-black font-semibold shadow-sm"
                  : "border border-line bg-elevated/80 text-muted hover:text-ink"
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (engineRef.current) engineRef.current.jump();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-xs font-semibold text-accent hover:bg-accent hover:text-black transition shadow-sm active:scale-95"
          >
            <ArrowUp className="h-4 w-4" />
            <span>JUMP (Space)</span>
          </button>

          <button
            onClick={() => {
              setSpeedMode("sprint");
              if (engineRef.current) engineRef.current.setSpeedMode("sprint");
            }}
            className="flex items-center gap-1.5 rounded-xl border border-teal/40 bg-teal/10 px-4 py-2 font-mono text-xs font-semibold text-teal hover:bg-teal hover:text-black transition shadow-sm active:scale-95"
          >
            <Flame className="h-4 w-4" />
            <span>BOOST (Shift)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
