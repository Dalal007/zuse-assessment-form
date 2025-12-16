# Jabri RoleFit Assessment Builder

A Next.js application for creating dynamic candidate screening assessments using AI-powered question generation.

## Features

- **Dynamic Question Generation**: Questions are generated on-the-fly using LangChain and OpenAI
- **Category Selection**: Select from 6 primary assessment categories
- **AI-Powered Suggestions**: Autocomplete suggestions for "Other" option using LangChain
- **Progress Tracking**: Visual progress bar showing assessment completion
- **Responsive Design**: Built with Tailwind CSS and fully responsive

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   LANGCHAIN_API_KEY=your_langsmith_api_key_here (optional)
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_PROJECT=jabri-rolefit-assessment
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Documentation

For detailed setup instructions, API key configuration, and troubleshooting, see [SETUP.md](./SETUP.md).

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **LangChain** - AI orchestration
- **OpenAI** - Question generation
- **LangSmith** - Tracing and monitoring (optional)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── generate-question/    # API route for dynamic question generation
│   │   └── generate-suggestions/  # API route for autocomplete suggestions
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page
├── components/
│   ├── AssessmentFlow.tsx        # Main assessment flow component
│   ├── CategorySelection.tsx     # Category selection screen
│   ├── QuestionCard.tsx          # Question display component
│   └── ProgressBar.tsx           # Progress indicator
├── types/
│   └── assessment.ts             # TypeScript type definitions
└── SETUP.md                      # Detailed setup guide
```

## License

Private project - All rights reserved
