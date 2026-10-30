"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, HelpCircle, RotateCcw, ArrowRight, Award, Zap } from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";

interface Question {
  id: number;
  question: { vi: string; en: string };
  options: { vi: string; en: string }[];
  correctIndex: number;
  explanation: { vi: string; en: string };
  category: string;
}

const questions: Question[] = [
  {
    id: 1,
    category: "Physiology",
    question: {
      vi: "Nhịp chân (Cadence) tối ưu thường được các chuyên gia sinh học vận động khuyến nghị là khoảng bao nhiêu?",
      en: "What cadence range is typically recommended by biomechanics experts for running efficiency?",
    },
    options: [
      { vi: "140 – 150 spm", en: "140 – 150 spm" },
      { vi: "170 – 185 spm", en: "170 – 185 spm" },
      { vi: "200 – 220 spm", en: "200 – 220 spm" },
      { vi: "Càng thấp càng tốt để sải chân dài", en: "The lower the better for longer stride" },
    ],
    correctIndex: 1,
    explanation: {
      vi: "Cadence trong khoảng 170-185 bước/phút giúp giảm thời gian tiếp đất (ground contact time), hạn chế lực phản chấn lên khớp gối và tăng hiệu quả chuyển hóa năng lượng.",
      en: "A cadence between 170-185 spm reduces ground contact time, minimizes braking forces on the knees, and maximizes running economy.",
    },
  },
  {
    id: 2,
    category: "Nutrition",
    question: {
      vi: "Trong giải chạy Marathon (42.195 km), lượng carbohydrate nạp khuyến nghị mỗi giờ thi đấu là:",
      en: "During a full marathon (42.195 km), what is the recommended carbohydrate intake per hour?",
    },
    options: [
      { vi: "Chỉ uống nước lọc khi khát", en: "Only plain water when thirsty" },
      { vi: "30 – 60g carb/giờ (có thể tới 90g nếu đã tập dạ dày)", en: "30 – 60g carbs/hour (up to 90g if gut-trained)" },
      { vi: "120 – 150g carb/giờ", en: "120 – 150g carbs/hour" },
      { vi: "Không cần bổ sung carb, chỉ cần muối", en: "No carbs needed, only electrolytes" },
    ],
    correctIndex: 1,
    explanation: {
      vi: "Cơ thể chỉ dự trữ được khoảng 2000 kcal glycogen (đủ cho ~30-32km). Nạp 30-60g carb mỗi giờ (qua gel, nước điện giải) là cốt lõi để tránh hiện tượng 'đụng tường' (hitting the wall).",
      en: "The body stores ~2000 kcal of glycogen (depleted around 30-32km). Consuming 30-60g carbs/hour prevents glycogen depletion and the dreaded 'wall'.",
    },
  },
  {
    id: 3,
    category: "Training",
    question: {
      vi: "Quy tắc phân bổ cường độ 80/20 trong giáo án chạy bộ hiện đại nghĩa là gì?",
      en: "What does the 80/20 intensity rule mean in modern endurance running?",
    },
    options: [
      { vi: "80% chạy dốc, 20% chạy đường bằng", en: "80% hills, 20% flat running" },
      { vi: "80% tổng thời lượng ở Zone 1-2 (nhẹ nhàng), 20% ở cường độ cao (Zone 4-5)", en: "80% of volume in Zone 1-2 (easy aerobic), 20% at high intensity (Zone 4-5)" },
      { vi: "80% thời gian chạy ngoài trời, 20% chạy máy", en: "80% outdoors, 20% on treadmill" },
      { vi: "80% tốc độ marathon, 20% chạy hết sức", en: "80% marathon pace, 20% all-out sprint" },
    ],
    correctIndex: 1,
    explanation: {
      vi: "Nghiên cứu của GS. Stephen Seiler cho thấy các vận động viên sức bền hàng đầu thế giới dành 80% thời lượng ở ngưỡng hiếu khí nhẹ để phát triển ty thể và mao mạch mà không gây kiệt sức thần kinh.",
      en: "Research by Dr. Stephen Seiler demonstrates elite runners spend 80% of training time at low aerobic intensity to build mitochondrial density without central fatigue.",
    },
  },
  {
    id: 4,
    category: "Physiology",
    question: {
      vi: "Hiện tượng DOMS (Đau mỏi cơ khởi phát muộn) thường đạt đỉnh sau bao lâu kể từ buổi chạy dài / bài tập nặng?",
      en: "When does DOMS (Delayed Onset Muscle Soreness) typically peak after a strenuous long run?",
    },
    options: [
      { vi: "Ngay lập tức sau khi dừng chạy", en: "Immediately after stopping" },
      { vi: "24 – 48 giờ sau buổi tập", en: "24 – 48 hours after the session" },
      { vi: "Sau 7 ngày", en: "After 7 days" },
      { vi: "Chỉ xảy ra khi cơ thể thiếu canxi", en: "Only occurs if calcium is deficient" },
    ],
    correctIndex: 1,
    explanation: {
      vi: "DOMS là phản ứng viêm và tái tạo tự nhiên trước các vi tổn thương sợi cơ (micro-tears), thường đạt đỉnh sau 24-48 giờ chứ không phải do tích tụ axit lactic (axit lactic tan hết sau 1 giờ).",
      en: "DOMS results from microscopic tears in muscle fibers during eccentric contractions and inflammation, peaking 24-48 hours later, not lactic acid accumulation.",
    },
  },
];

export function RunnerQuiz({ locale }: { locale: Locale }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[currentIdx];
  const lang = locale === "vi" ? "vi" : "en";

  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    const nextAnswers = [...selectedAnswers];
    nextAnswers[currentIdx] = idx;
    setSelectedAnswers(nextAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAnswers([]);
    setShowExplanation(false);
    setFinished(false);
  };

  const score = selectedAnswers.reduce((acc, ans, i) => {
    return ans === questions[i].correctIndex ? acc + 1 : acc;
  }, 0);

  return (
    <div className="card overflow-hidden border border-line bg-surface/90 shadow-xl backdrop-blur">
      <div className="border-b border-line bg-elevated/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Zap className="h-4 w-4 text-accent" />
          <h3 className="font-display text-sm font-semibold text-ink">
            {locale === "vi" ? "Trắc Nghiệm Kiến Thức Chạy Bộ Khoa Học" : "Running Science Diagnostic Quiz"}
          </h3>
        </div>
        <span className="font-mono text-xs text-subtle">
          {finished ? `${score}/${questions.length}` : `${currentIdx + 1}/${questions.length}`}
        </span>
      </div>

      <div className="p-6">
        {!finished ? (
          <div>
            <div className="mb-2">
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-mono text-[0.68rem] text-accent font-medium">
                {q.category}
              </span>
            </div>
            <h4 className="font-display text-base sm:text-lg font-medium text-ink leading-snug">
              {q.question[lang]}
            </h4>

            <div className="mt-5 space-y-2.5">
              {q.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentIdx] === idx;
                const isCorrect = idx === q.correctIndex;
                let btnStyle = "border-line bg-surface hover:border-accent/60 text-ink";

                if (showExplanation) {
                  if (isCorrect) {
                    btnStyle = "border-teal bg-teal/10 text-teal font-semibold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "border-red-500/80 bg-red-500/10 text-red-400";
                  } else {
                    btnStyle = "border-line/40 bg-surface/40 text-muted";
                  }
                } else if (isSelected) {
                  btnStyle = "border-accent bg-accent/10 text-accent";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    disabled={showExplanation}
                    className={`w-full text-left rounded-xl border p-3.5 text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt[lang]}</span>
                    {showExplanation && isCorrect && <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-5 rounded-xl border border-teal/20 bg-teal/5 p-4 text-xs sm:text-sm text-ink leading-relaxed">
                <p className="font-semibold text-teal mb-1">
                  {selectedAnswers[currentIdx] === q.correctIndex
                    ? (locale === "vi" ? "Chính xác!" : "Correct!")
                    : (locale === "vi" ? "Chưa chính xác!" : "Not quite!")}
                </p>
                <p className="text-muted">{q.explanation[lang]}</p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white dark:text-[#04101F] transition hover:opacity-90"
                >
                  {currentIdx + 1 < questions.length
                    ? (locale === "vi" ? "Câu Tiếp Theo" : "Next Question")
                    : (locale === "vi" ? "Xem Kết Quả Đánh Giá" : "View Score")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal/10 text-teal border border-teal/30">
              <Award className="h-7 w-7" />
            </div>
            <h4 className="mt-4 font-display text-xl font-bold text-ink">
              {score === questions.length
                ? (locale === "vi" ? "Tuyệt vời! Kiến thức bậc thầy" : "Master Level Knowledge!")
                : (locale === "vi" ? "Kết quả bài đánh giá của bạn" : "Your Diagnostic Result")}
            </h4>
            <p className="mt-1 font-mono text-2xl font-bold text-accent">
              {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
            </p>
            <p className="mt-3 text-xs sm:text-sm text-muted max-w-md mx-auto">
              {locale === "vi"
                ? "Nền tảng sinh lý học và dinh dưỡng vững vàng là chìa khóa để chạy bền bỉ không chấn thương. Hãy khám phá thư viện giáo trình chuyên sâu tại Học viện Mythos."
                : "A grounded understanding of exercise physiology and nutrition is key to injury-free running. Continue expanding your foundation at Mythos Academy."}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-medium text-ink hover:border-accent transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {locale === "vi" ? "Làm lại bài kiểm tra" : "Retake Quiz"}
              </button>
              <Link
                href={localePath(locale, "/academy")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-white dark:text-[#04101F] hover:opacity-95 transition"
              >
                {locale === "vi" ? "Đọc Thư Viện Học Viện" : "Browse Academy Library"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
