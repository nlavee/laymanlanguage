"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchQuestions, saveProfile, QuestionOption } from "@/api/client";
import { useAuth } from "@/providers/auth-provider";

export default function OnboardingFlow() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionOption>>({});

  const { data: qData, isLoading: isLoadingQuestions, error: qError } = useQuery({
    queryKey: ["profile-questions"],
    queryFn: fetchQuestions,
    enabled: !!token,   // Only fire once the auth token is available
  });

  const saveMutation = useMutation({
    mutationFn: () => saveProfile(answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  if (isLoadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-neutral-800 rounded-full animate-spin mb-4" />
        <p className="text-neutral-400 font-medium">Generating intelligent profiling questions...</p>
      </div>
    );
  }

  if (qError || !qData || qData.questions.length === 0) {
    return <div className="text-red-400">Failed to load profiling questions. Ensure the backend is running.</div>;
  }

  const questions = qData.questions;
  const isSaving = saveMutation.isPending;

  const handleSelectOption = (questionId: string, option: QuestionOption) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    if (currentStep < questions.length - 1) {
        setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
        saveMutation.mutate();
    }
  };

  const currentQ = questions[currentStep];

  return (
    <div className="max-w-2xl mx-auto mt-16 p-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">
            Configure Technical Persona
        </h1>
        <p className="text-neutral-400 text-[17px]">
            To provide precise architectural constraints, laymen.ai needs to map your background depth.
        </p>
      </div>

      <div className="relative min-h-[500px] w-full max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {isSaving ? (
             <motion.div 
               key="saving"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col items-center justify-center h-full space-y-4"
             >
                <div className="w-12 h-12 border-4 border-t-emerald-500 border-neutral-800 rounded-full animate-spin" />
                <p className="text-neutral-300 font-medium text-lg">Synthesizing your technical persona...</p>
             </motion.div>
          ) : (
             <motion.div
               key={currentStep}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
               className="w-full"
             >
              <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-2xl shadow-2xl">
                  <div className="flex items-center gap-4 mb-8 text-neutral-500 text-xs font-semibold tracking-widest uppercase">
                      <span>Step {currentStep + 1} / {questions.length}</span>
                      <div className="flex-1 h-px flex bg-neutral-800 overflow-hidden relative">
                          <div 
                             className="absolute top-0 left-0 h-full bg-white transition-all duration-500"
                             style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                          />
                      </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-8">{currentQ.question_text}</h2>
                  
                  <div className="space-y-3">
                      {currentQ.options.map((opt) => (
                          <button
                              key={opt.id}
                              onClick={() => handleSelectOption(currentQ.id, opt)}
                              className={`w-full text-left p-4 rounded-lg border transition-all duration-300 group flex items-start gap-6 justify-between ${
                                  answers[currentQ.id]?.id === opt.id 
                                    ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                                    : "border-neutral-800 bg-[#0A0A0A] hover:bg-[#111] hover:border-neutral-700"
                              }`}
                          >
                              <span className={`font-medium flex-1 transition-colors ${answers[currentQ.id]?.id === opt.id ? "text-emerald-50" : "text-neutral-200 group-hover:text-white"}`}>{opt.text}</span>
                              <div className={`w-4 h-4 shrink-0 rounded-full border flex items-center justify-center transition-colors mt-1 ${
                                  answers[currentQ.id]?.id === opt.id ? "border-emerald-500 bg-emerald-500/20" : "border-neutral-700 group-hover:border-neutral-500"
                              }`}>
                                  {answers[currentQ.id]?.id === opt.id && <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_5px_rgba(52,211,153,0.8)]" />}
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
