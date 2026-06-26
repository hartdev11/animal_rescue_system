"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  QUIZ_QUESTIONS,
  KAHOOT_OPTION_STYLES,
  TEMPERAMENT_TRAITS,
  type MatchResult,
  type QuizAnswers,
} from "@/lib/adoption-match";
import { ANIMAL_SPECIES } from "@/lib/constants";
import type { AnimalSpecies, TemperamentTrait } from "@/types";

type Step = "choose" | "quiz" | "tags" | "loading" | "results";
type MatchMode = "quiz" | "tags";

export function AdoptionMatch() {
  const [step, setStep] = useState<Step>("choose");
  const [mode, setMode] = useState<MatchMode>("quiz");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [selectedSpecies, setSelectedSpecies] = useState<AnimalSpecies | "">("");
  const [selectedTraits, setSelectedTraits] = useState<TemperamentTrait[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [speciesFilter, setSpeciesFilter] = useState<string | null>(null);
  const [dataSourceNote, setDataSourceNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);

  const currentQuestion = QUIZ_QUESTIONS[questionIndex];
  const quizProgress = ((questionIndex + 1) / QUIZ_QUESTIONS.length) * 100;

  const runMatch = useCallback(
    async (
      matchMode: MatchMode,
      quizAnswers?: QuizAnswers,
      tags?: { species: AnimalSpecies; traits: TemperamentTrait[] }
    ) => {
      setStep("loading");
      setError(null);
      try {
        const res = await fetch("/api/adoption/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: matchMode,
            quizAnswers: quizAnswers ?? undefined,
            selectedSpecies: tags?.species,
            selectedTraits: tags?.traits,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message ?? "วิเคราะห์ไม่สำเร็จ");
        }
        setResults(data.results ?? []);
        setSpeciesFilter(data.speciesFilter ?? null);
        setDataSourceNote(data.dataSource ?? null);
        setStep("results");
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        setStep(matchMode === "quiz" ? "quiz" : "tags");
      }
    },
    []
  );

  const selectQuizAnswer = (questionId: string, value: string) => {
    if (isAnimating) return;

    setSelectedOption(value);
    setIsAnimating(true);

    setTimeout(() => {
      const nextAnswers = { ...answers, [questionId]: value };
      setAnswers(nextAnswers);
      setSelectedOption(null);
      setIsAnimating(false);

      if (questionIndex < QUIZ_QUESTIONS.length - 1) {
        setQuestionIndex((i) => i + 1);
        setQuestionKey((k) => k + 1);
        return;
      }

      void runMatch("quiz", nextAnswers);
    }, 520);
  };

  const reset = () => {
    setStep("choose");
    setQuestionIndex(0);
    setAnswers({});
    setSelectedSpecies("");
    setSelectedTraits([]);
    setResults([]);
    setSpeciesFilter(null);
    setDataSourceNote(null);
    setError(null);
    setSelectedOption(null);
    setIsAnimating(false);
    setQuestionKey(0);
  };

  if (step === "choose") {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-violet-600 via-purple-600 to-indigo-800 p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-pink-400/20 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-violet-200">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">Pet Match Quiz</span>
            </div>
            <h2 className="mt-3 text-xl font-bold sm:text-2xl">
              หาสัตว์เลี้ยงที่เหมาะกับคุณ
            </h2>
            <p className="mt-2 text-sm text-violet-100 sm:text-base">
              ทำ Quiz หรือเลือกแท็กนิสัย — ระบบเทียบจากข้อมูลที่คลินิกกรอกเท่านั้น
              ไม่เดาจากข้อความอิสระ
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setMode("quiz");
              setStep("quiz");
              setQuestionIndex(0);
              setAnswers({});
              setQuestionKey(0);
            }}
            className="group relative overflow-hidden rounded-2xl border-2 border-violet-100 bg-white p-6 text-left shadow-sm transition hover:border-violet-300 hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-linear-to-br from-violet-50 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-red-400 via-blue-400 to-emerald-400 text-2xl shadow-md">
                🎯
              </div>
              <h3 className="mt-4 text-lg font-bold">แบบทดสอบ Quiz</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                ตอบ 6 คำถาม พร้อมอนิเมชันสนุกๆ — เลือกชนิดสัตว์ก่อน แล้วจับคู่นิสัย
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-violet-600">
                เริ่ม Quiz <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("tags");
              setStep("tags");
            }}
            className="group relative overflow-hidden rounded-2xl border-2 border-emerald-100 bg-white p-6 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-linear-to-br from-emerald-50 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
                🏷️
              </div>
              <h3 className="mt-4 text-lg font-bold">เลือกแท็กนิสัย</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                เลือกชนิดสัตว์ + แท็กที่ต้องการ — ระบบจับคู่กับข้อมูลที่คลินิกเลือกไว้เท่านั้น
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                เริ่มเลือก <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </button>
        </div>

        <Link
          href="/adoption"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          ดูรายการสัตว์ทั้งหมด
        </Link>
      </div>
    );
  }

  if (step === "quiz" && currentQuestion) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
          {/* Top bar */}
          <div className="border-b border-white/10 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between text-xs text-slate-400 sm:text-sm">
              <span className="font-medium text-white">
                คำถาม {questionIndex + 1} / {QUIZ_QUESTIONS.length}
              </span>
              <button
                type="button"
                onClick={reset}
                className="rounded-full px-2 py-1 transition hover:bg-white/10 hover:text-white"
              >
                ยกเลิก
              </button>
            </div>

            {/* Progress dots */}
            <div className="mt-3 flex gap-1.5">
              {QUIZ_QUESTIONS.map((q, i) => (
                <div
                  key={q.id}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                    i < questionIndex
                      ? "bg-emerald-400"
                      : i === questionIndex
                        ? "bg-violet-400"
                        : "bg-white/15"
                  )}
                />
              ))}
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-linear-to-r from-violet-400 to-fuchsia-400 transition-all duration-500 ease-out"
                style={{ width: `${quizProgress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div
            key={questionKey}
            className="animate-quiz-slide-in px-4 py-8 text-center sm:px-8 sm:py-10"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-5xl shadow-inner backdrop-blur-sm">
              {currentQuestion.emoji}
            </div>
            <h2 className="mt-5 text-xl font-bold text-white sm:text-2xl">
              {currentQuestion.question}
            </h2>
            {"subtitle" in currentQuestion && currentQuestion.subtitle && (
              <p className="mt-2 text-sm text-slate-400">{currentQuestion.subtitle}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 px-4 pb-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 sm:px-6 sm:pb-8">
            {currentQuestion.options.map((opt, idx) => {
              const style = KAHOOT_OPTION_STYLES[idx % KAHOOT_OPTION_STYLES.length];
              const isSelected = selectedOption === opt.value;
              const isDisabled = isAnimating && !isSelected;

              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isAnimating}
                  onClick={() => selectQuizAnswer(currentQuestion.id, opt.value)}
                  style={{ animationDelay: `${idx * 70}ms` }}
                  className={cn(
                    "animate-quiz-option-in relative flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left font-semibold text-white shadow-lg transition-all duration-200",
                    style.bg,
                    !isAnimating && style.hover,
                    !isAnimating && "hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]",
                    isSelected && "scale-[1.03] ring-4 ring-white/80 animate-quiz-pop",
                    isSelected && style.ring,
                    isDisabled && "opacity-40 scale-95",
                    "text" in style ? style.text : undefined
                  )}
                >
                  {isSelected && (
                    <span className="pointer-events-none absolute inset-0 rounded-2xl animate-quiz-pulse-ring" />
                  )}

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/20 text-lg">
                    {"icon" in opt ? opt.icon : idx + 1}
                  </span>

                  <span className="flex-1 text-sm leading-snug sm:text-base">
                    {opt.label}
                  </span>

                  {isSelected && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/25 animate-quiz-check">
                      <Check className="h-5 w-5" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {questionIndex > 0 && !isAnimating && (
            <div className="border-t border-white/10 px-4 py-3 sm:px-6">
              <Button
                type="button"
                variant="ghost"
                className="text-slate-300 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setQuestionIndex((i) => i - 1);
                  setQuestionKey((k) => k + 1);
                }}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                ย้อนกลับ
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  if (step === "tags") {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับ
        </button>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <Label className="text-base font-semibold">1. เลือกชนิดสัตว์ *</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {ANIMAL_SPECIES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSelectedSpecies(s.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition",
                  selectedSpecies === s.value
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-gray-200 hover:border-emerald-300"
                )}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          <Label className="mt-6 block text-base font-semibold">
            2. เลือกนิสัยที่ต้องการ * (ตรงกับแท็กที่คลินิกระบุ)
          </Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {TEMPERAMENT_TRAITS.map((trait) => {
              const active = selectedTraits.includes(trait.value);
              return (
                <button
                  key={trait.value}
                  type="button"
                  onClick={() =>
                    setSelectedTraits((prev) =>
                      active
                        ? prev.filter((t) => t !== trait.value)
                        : [...prev, trait.value]
                    )
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition",
                    active
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-gray-200 hover:border-violet-300"
                  )}
                >
                  {trait.label}
                </button>
              );
            })}
          </div>

          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            ระบบจะแสดงเฉพาะสัตว์ที่คลินิกติ๊กแท็กตรงกับที่คุณเลือก — ไม่มีการเดาจากคำอธิบายอิสระ
          </p>

          <Button
            type="button"
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={!selectedSpecies || selectedTraits.length === 0}
            onClick={() =>
              void runMatch("tags", undefined, {
                species: selectedSpecies as AnimalSpecies,
                traits: selectedTraits,
              })
            }
          >
            <Wand2 className="mr-2 h-4 w-4" />
            จับคู่จากข้อมูลคลินิก
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-linear-to-b from-slate-900 to-slate-800 py-24 text-white">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-violet-400" />
          <Sparkles className="absolute -right-2 -top-2 h-5 w-5 animate-pulse text-amber-300" />
        </div>
        <p className="mt-5 text-base font-medium">กำลังวิเคราะห์และจับคู่...</p>
        <p className="mt-1 text-sm text-slate-400">รอสักครู่นะ 🐾</p>
      </div>
    );
  }

  return (
    <MatchResultsView
      results={results}
      mode={mode}
      speciesFilter={speciesFilter}
      dataSourceNote={dataSourceNote}
      onReset={reset}
    />
  );
}

function MatchResultsView({
  results,
  mode,
  speciesFilter,
  dataSourceNote,
  onReset,
}: {
  results: MatchResult[];
  mode: MatchMode;
  speciesFilter: string | null;
  dataSourceNote: string | null;
  onReset: () => void;
}) {
  const podium = results.slice(0, 3);
  const others = results.slice(3);
  const topPick = podium[0];

  const podiumSlots = [
    { rank: 2 as const, result: podium[1], pedestal: "h-16 sm:h-24", size: "h-16 w-16 sm:h-20 sm:w-20" },
    { rank: 1 as const, result: podium[0], pedestal: "h-24 sm:h-32", size: "h-20 w-20 sm:h-28 sm:w-28" },
    { rank: 3 as const, result: podium[2], pedestal: "h-12 sm:h-20", size: "h-14 w-14 sm:h-16 sm:w-16" },
  ].filter((slot) => slot.result);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-100/80 bg-linear-to-br from-emerald-50 via-white to-violet-50 shadow-lg">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="relative space-y-6 p-4 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Match Results
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
              🏆 ผลการจับคู่
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {mode === "quiz"
                ? "เทียบจากข้อมูลที่คลินิกกรอกในฟอร์มลงทะเบียน"
                : "เทียบแท็กนิสัยที่คุณเลือกกับข้อมูลคลินิก"}
            </p>
            {dataSourceNote && (
              <p className="mt-2 text-xs text-gray-500">{dataSourceNote}</p>
            )}
            {speciesFilter && (
              <span className="mt-2 inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
                แสดงเฉพาะ: {speciesFilter}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="border-emerald-200 bg-white/80 hover:bg-emerald-50"
          >
            ทำใหม่
          </Button>
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 py-14 text-center">
            <p className="text-4xl">🐾</p>
            <p className="mt-3 font-medium text-gray-700">
              {speciesFilter
                ? `ยังไม่มี${speciesFilter}ที่ตรงกับเงื่อนไขในระบบ`
                : "ยังไม่พบสัตว์ที่ตรงกับเงื่อนไข"}
            </p>
            <Link href="/adoption" className="mt-4 inline-block text-emerald-600 hover:underline">
              ดูสัตว์ทั้งหมด
            </Link>
          </div>
        ) : (
          <>
            {podiumSlots.length > 0 && (
              <div className="rounded-2xl bg-linear-to-b from-slate-800 to-slate-900 px-3 pb-4 pt-6 sm:px-6 sm:pb-6">
                <p className="mb-4 text-center text-sm font-medium text-slate-300">
                  Top {podiumSlots.length} ที่ตรงกับคุณมากที่สุด
                </p>
                <div className="flex items-end justify-center gap-2 sm:gap-5">
                  {podiumSlots.map((slot) => (
                    <PodiumSlot
                      key={slot.rank}
                      rank={slot.rank}
                      result={slot.result!}
                      pedestalClass={slot.pedestal}
                      imageClass={slot.size}
                    />
                  ))}
                </div>
              </div>
            )}

            {topPick && (
              <div className="rounded-2xl border border-amber-200/80 bg-linear-to-br from-amber-50 to-white p-4 shadow-sm sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  แนะนำมากที่สุด
                </p>
                <MatchResultDetail result={topPick} rank={1} />
              </div>
            )}

            {others.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600">
                  ตัวเลือกอื่น (ไม่ขึ้นแท่น)
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {others.map((result, idx) => (
                    <MatchResultCompact
                      key={result.animal.id}
                      result={result}
                      rank={idx + 4}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <Link
          href="/adoption"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
        >
          ดูสัตว์ทั้งหมดในระบบ →
        </Link>
      </div>
    </div>
  );
}

const PODIUM_STYLES = {
  1: {
    medal: "🥇",
    label: "อันดับ 1",
    bar: "bg-linear-to-t from-amber-500 to-amber-300",
    ring: "ring-amber-400/60",
    badge: "bg-amber-100 text-amber-800",
  },
  2: {
    medal: "🥈",
    label: "อันดับ 2",
    bar: "bg-linear-to-t from-slate-400 to-slate-300",
    ring: "ring-slate-300/60",
    badge: "bg-slate-100 text-slate-700",
  },
  3: {
    medal: "🥉",
    label: "อันดับ 3",
    bar: "bg-linear-to-t from-orange-400 to-orange-300",
    ring: "ring-orange-300/60",
    badge: "bg-orange-100 text-orange-800",
  },
} as const;

function PodiumSlot({
  rank,
  result,
  pedestalClass,
  imageClass,
}: {
  rank: 1 | 2 | 3;
  result: MatchResult;
  pedestalClass: string;
  imageClass: string;
}) {
  const style = PODIUM_STYLES[rank];
  const { animal, matchPercent, matchedCriteria, totalCriteria } = result;

  return (
    <Link
      href={`/adoption/${animal.id}`}
      className="group flex w-[30%] max-w-[140px] flex-col items-center sm:max-w-[160px]"
    >
      <span className="mb-1 text-lg sm:text-xl">{style.medal}</span>

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-white shadow-lg ring-2 transition group-hover:scale-[1.03]",
          style.ring,
          imageClass
        )}
      >
        {animal.coverImage ? (
          <Image
            src={animal.coverImage}
            alt={animal.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">
            {animal.speciesIcon}
          </div>
        )}
        {animal.hasDisability && (
          <span className="absolute bottom-0 left-0 right-0 bg-amber-500/90 py-0.5 text-center text-[9px] text-white">
            พิการ
          </span>
        )}
      </div>

      <p className="mt-2 line-clamp-2 text-center text-xs font-semibold text-white sm:text-sm">
        {animal.name}
      </p>
      <p className="mt-0.5 text-center text-[10px] text-slate-400 sm:text-xs">
        {animal.speciesIcon} {animal.breed || animal.speciesLabel}
      </p>

      <span
        className={cn(
          "mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold sm:text-xs",
          style.badge
        )}
      >
        {totalCriteria > 0 ? `${matchPercent}%` : "ตรงชนิด"}
        {totalCriteria > 0 && (
          <span className="font-normal opacity-80">
            {" "}
            ({matchedCriteria}/{totalCriteria})
          </span>
        )}
      </span>

      <div
        className={cn(
          "mt-2 w-full rounded-t-lg transition group-hover:brightness-110",
          pedestalClass,
          style.bar
        )}
      />
      <p className="mt-1 text-[10px] text-slate-500 opacity-0 transition group-hover:opacity-100">
        ดูรายละเอียด →
      </p>
    </Link>
  );
}

function MatchResultDetail({ result }: { result: MatchResult; rank: number }) {
  const { animal, matchPercent, matchedCriteria, totalCriteria, reasons, dataIncomplete } =
    result;

  return (
    <Link
      href={`/adoption/${animal.id}`}
      className="group mt-3 flex gap-4 rounded-xl transition hover:opacity-95"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-2 ring-amber-300 sm:h-28 sm:w-28">
        {animal.coverImage ? (
          <Image
            src={animal.coverImage}
            alt={animal.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">
            {animal.speciesIcon}
          </div>
        )}
        <span className="absolute left-1 top-1 rounded bg-amber-500 px-1.5 py-0.5 text-xs text-white">
          🥇
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-800">
          {animal.name}
        </h3>
        <p className="text-sm text-gray-600">
          {animal.speciesIcon} {animal.speciesLabel}
          {animal.breed ? ` • ${animal.breed}` : ""} • {animal.estimatedAge}
        </p>

        <div className="mt-2 inline-flex rounded-full bg-violet-100 px-3 py-1 text-sm font-bold text-violet-800">
          {totalCriteria > 0
            ? `ตรง ${matchedCriteria}/${totalCriteria} ข้อ (${matchPercent}%)`
            : "ตรงชนิดสัตว์ที่เลือก"}
        </div>

        {dataIncomplete && (
          <p className="mt-2 text-xs text-amber-700">
            คลินิกยังกรอกข้อมูลจับคู่ไม่ครบบางส่วน
          </p>
        )}

        {reasons.length > 0 && (
          <ul className="mt-3 space-y-1">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-1.5 text-sm text-gray-700">
                <span className="mt-0.5 text-emerald-600">✓</span>
                {reason}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-sm font-medium text-emerald-700 group-hover:underline">
          ดูรายละเอียดจากคลินิก →
        </p>
      </div>
    </Link>
  );
}

function MatchResultCompact({ result, rank }: { result: MatchResult; rank: number }) {
  const { animal, matchPercent, matchedCriteria, totalCriteria } = result;

  return (
    <Link
      href={`/adoption/${animal.id}`}
      className="group flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white/70 p-3 transition hover:border-emerald-200 hover:bg-white hover:shadow-sm"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {animal.coverImage ? (
          <Image
            src={animal.coverImage}
            alt={animal.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xl">
            {animal.speciesIcon}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{animal.name}</p>
        <p className="text-xs text-gray-500">
          {rank}. {animal.speciesLabel}
          {animal.breed ? ` • ${animal.breed}` : ""}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
        {totalCriteria > 0 ? `${matchPercent}%` : "—"}
        {totalCriteria > 0 && (
          <span className="block text-center text-[10px] font-normal">
            {matchedCriteria}/{totalCriteria}
          </span>
        )}
      </span>
    </Link>
  );
}
