import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

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

const suggestionPrompt = PromptTemplate.fromTemplate(`
You are helping a candidate fill out an assessment form.

Question: {questionText}
User Input: {userInput}

Based on the question and the user's partial input, generate 5 relevant suggestions that:
1. Are contextually appropriate for the question
2. Match or relate to the user's input
3. Are specific and actionable
4. Are professional and relevant to job assessments

Return ONLY a JSON array of strings, no other text.
Example: ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4", "Suggestion 5"]
`);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionText, userInput } = body;

    if (!questionText || !userInput) {
      return NextResponse.json(
        { error: "Question text and user input are required" },
        { status: 400 }
      );
    }

    const prompt = await suggestionPrompt.format({
      questionText,
      userInput,
    });

    const response = await llm.invoke(prompt);
    const content = response.content as string;

    // Extract JSON array from response
    let suggestions: string[] = [];
    try {
      // Try to parse as direct JSON
      suggestions = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback: try to extract array-like content
        const arrayMatch = content.match(/\[([\s\S]*?)\]/);
        if (arrayMatch) {
          suggestions = JSON.parse(`[${arrayMatch[1]}]`);
        }
      }
    }

    // Ensure it's an array and limit to 5
    if (!Array.isArray(suggestions)) {
      suggestions = [];
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, 5) });
  } catch (error: any) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}

