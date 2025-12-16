"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Question } from "@/types/assessment";

interface QuestionCardProps {
  question: Question;
  selectedOptions: string[];
  onOptionToggle: (option: string) => void;
  onOtherInputChange: (value: string) => void;
  otherInputValue: string;
}

export default function QuestionCard({
  question,
  selectedOptions,
  onOptionToggle,
  onOtherInputChange,
  otherInputValue,
}: QuestionCardProps) {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isOtherSelected = selectedOptions.includes("Other");

  useEffect(() => {
    if (isOtherSelected && !showOtherInput) {
      setShowOtherInput(true);
      // Small delay to ensure input is rendered before focus
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else if (!isOtherSelected && showOtherInput) {
      setShowOtherInput(false);
      onOtherInputChange("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [isOtherSelected, showOtherInput, onOtherInputChange]);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch("/api/generate-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionText: question.text,
          userInput: input,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(data.suggestions && data.suggestions.length > 0);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [question.text]);

  useEffect(() => {
    // Debounce the suggestion fetching
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (otherInputValue.length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(otherInputValue);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [otherInputValue, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    // Set the suggestion as the input value (single selection)
    onOtherInputChange(suggestion);
    setShowSuggestions(false);
    // Close the suggestions dropdown after selection
    inputRef.current?.blur();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {question.text}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Category: {question.primaryCategory}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {question.options.map((option) => {
          const isSelected = selectedOptions.includes(option);
          const isOther = option === "Other";

          return (
            <div key={option}>
              <label
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onOptionToggle(option)}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-gray-900 dark:text-white font-medium">
                  {option}
                </span>
              </label>

              {isOther && showOtherInput && (
                <div className="mt-3 ml-8 relative" ref={suggestionsRef}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={otherInputValue}
                    onChange={(e) => onOtherInputChange(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 dark:bg-gray-800 dark:text-white"
                  />
                  {isLoadingSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 text-sm text-gray-500">
                      Loading suggestions...
                    </div>
                  )}
                  {!isLoadingSuggestions && showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`w-full text-left px-4 py-2 transition-colors ${
                            otherInputValue === suggestion
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-medium"
                              : "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-white"
                          }`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

