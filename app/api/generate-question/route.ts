import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { PrimaryCategory, Question } from "@/types/assessment";

// Configure LangSmith tracing if API key is provided
if (process.env.LANGCHAIN_API_KEY) {
  process.env.LANGCHAIN_TRACING_V2 = "true";
  process.env.LANGCHAIN_PROJECT = process.env.LANGCHAIN_PROJECT || "jabri-rolefit-assessment";
}

const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const questionPrompt = PromptTemplate.fromTemplate(`
You are a RoleFit Assessment Builder creating candidate screening questions.

Context:
- Selected Categories: {selectedCategories}
- Previous Questions: {previousQuestions}
- Previous Answers: {previousAnswers}
- Current Question Number: {questionNumber} of 10

Generate a NEW assessment question that:
1. Is relevant to one of the selected categories
2. Has NOT been asked before (check previous questions)
3. Is appropriate for the question number and context
4. Takes into account previous answers, including "Other" custom responses
5. Includes 4 checkbox options plus "Other"
6. Is clear, practical, and scenario-based

Return a JSON object with this structure:
{{
  "text": "Question text here",
  "primaryCategory": "One of the selected categories",
  "secondTierCompetencies": ["Competency 1", "Competency 2"],
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "whatItMeasures": "What this question measures",
  "maxAnswerTime": 90,
  "scoringGuide": {{
    "1": "Description for score 1",
    "2": "Description for score 2",
    "3": "Description for score 3",
    "4": "Description for score 4",
    "5": "Description for score 5"
  }}
}}

Only return the JSON object, no other text.
`);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      selectedCategories,
      previousQuestions,
      previousAnswers,
      questionNumber,
    } = body;

    if (!selectedCategories || selectedCategories.length === 0) {
      return NextResponse.json(
        { error: "Selected categories are required" },
        { status: 400 }
      );
    }

    const prompt = await questionPrompt.format({
      selectedCategories: JSON.stringify(selectedCategories),
      previousQuestions: JSON.stringify(previousQuestions || []),
      previousAnswers: JSON.stringify(previousAnswers || {}),
      questionNumber: questionNumber || 1,
    });

    const response = await llm.invoke(prompt);
    const content = response.content as string;

    // Extract JSON from response
    let questionData: Partial<Question>;
    try {
      // Try to parse as direct JSON
      questionData = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        questionData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Could not parse JSON from response");
      }
    }

    // Ensure "Other" is in options
    if (questionData.options && !questionData.options.includes("Other")) {
      questionData.options.push("Other");
    }

    // Generate question ID
    const question: Question = {
      id: `q${questionNumber}`,
      text: questionData.text || "",
      primaryCategory: questionData.primaryCategory as PrimaryCategory,
      secondTierCompetencies: questionData.secondTierCompetencies || [],
      options: questionData.options || [],
      whatItMeasures: questionData.whatItMeasures || "",
      maxAnswerTime: questionData.maxAnswerTime || 90,
      scoringGuide: questionData.scoringGuide || {},
    };

    return NextResponse.json({ question });
  } catch (error: any) {
    console.error("Error generating question:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate question" },
      { status: 500 }
    );
  }
}

