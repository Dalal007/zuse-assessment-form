"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PrimaryCategory, Question } from "@/types/assessment";
import CategorySelection from "./CategorySelection";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";

type AssessmentStep = "categories" | "questions" | "complete";

export default function AssessmentFlow() {
  const [step, setStep] = useState<AssessmentStep>("categories");
  const [selectedCategories, setSelectedCategories] = useState<PrimaryCategory[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [otherInputs, setOtherInputs] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const questionsRef = useRef<Question[]>([]);
  const answersRef = useRef<Record<string, string[]>>({});
  const otherInputsRef = useRef<Record<string, string>>({});

  // Keep refs in sync with state
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    otherInputsRef.current = otherInputs;
  }, [otherInputs]);

  const generateNextQuestion = useCallback(async () => {
    if (isGenerating || questionsRef.current.length >= 10) return;
    
    setIsGenerating(true);
    try {
      // Include otherInputs in the context for better question generation
      const previousAnswersWithOther = { ...answersRef.current };
      Object.keys(otherInputsRef.current).forEach((questionId) => {
        if (otherInputsRef.current[questionId]) {
          previousAnswersWithOther[questionId] = [
            ...(previousAnswersWithOther[questionId] || []),
            `Other: ${otherInputsRef.current[questionId]}`,
          ];
        }
      });

      const response = await fetch("/api/generate-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedCategories,
          previousQuestions: questionsRef.current.map((q) => ({
            text: q.text,
            primaryCategory: q.primaryCategory,
          })),
          previousAnswers: previousAnswersWithOther,
          questionNumber: questionsRef.current.length + 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate question");
      }

      const data = await response.json();
      const newQuestion = data.question;

      setQuestions((prev) => {
        const updated = [...prev, newQuestion];
        setCurrentQuestionIndex(updated.length - 1);
        return updated;
      });
    } catch (error) {
      console.error("Error generating question:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedCategories, isGenerating]);

  const handleCategoryToggle = useCallback((category: PrimaryCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleContinue = useCallback(async () => {
    if (selectedCategories.length > 0) {
      setStep("questions");
      setCurrentQuestionIndex(0);
      // Generate first question
      await generateNextQuestion();
    }
  }, [selectedCategories, generateNextQuestion]);

  const handleOptionToggle = useCallback(
    (option: string) => {
      const currentQuestion = questionsRef.current[currentQuestionIndex];
      if (!currentQuestion) return;

      const questionId = currentQuestion.id;

      setAnswers((prev) => {
        const currentAnswers = prev[questionId] || [];
        if (currentAnswers.includes(option)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter((a) => a !== option),
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, option],
          };
        }
      });
    },
    [currentQuestionIndex]
  );

  const handleOtherInputChange = useCallback((value: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const questionId = currentQuestion.id;
    setOtherInputs((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }, [questions, currentQuestionIndex]);

  const handleNext = useCallback(async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (questions.length < 10) {
      // Generate next question if we haven't reached 10
      await generateNextQuestion();
    } else {
      setStep("complete");
    }
  }, [currentQuestionIndex, questions.length, generateNextQuestion]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswers = currentQuestion ? answers[currentQuestion.id] || [] : [];
  const currentOtherInput = currentQuestion ? otherInputs[currentQuestion.id] || "" : "";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {step === "categories" && (
          <CategorySelection
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            onContinue={handleContinue}
          />
        )}

        {step === "questions" && currentQuestion && (
          <div>
            <ProgressBar current={currentQuestionIndex + 1} total={Math.max(questions.length, 10)} />
            {isGenerating && questions.length < 10 && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300 text-sm">
                Generating next question...
              </div>
            )}
            <QuestionCard
              question={currentQuestion}
              selectedOptions={currentAnswers}
              onOptionToggle={handleOptionToggle}
              onOtherInputChange={handleOtherInputChange}
              otherInputValue={currentOtherInput}
            />
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  currentQuestionIndex === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={isGenerating}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  isGenerating
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {questions.length >= 10 && currentQuestionIndex === questions.length - 1
                  ? "Complete"
                  : "Next"}
              </button>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Assessment Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Thank you for completing the assessment. Your responses have been recorded.
            </p>
            <button
              onClick={() => {
                setStep("categories");
                setSelectedCategories([]);
                setQuestions([]);
                setCurrentQuestionIndex(0);
                setAnswers({});
                setOtherInputs({});
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Start New Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

