# Jabri RoleFit Assessment Builder - Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenAI API Key for LangChain (Required)
OPENAI_API_KEY=your_openai_api_key_here

# LangSmith Configuration (Optional but recommended for tracing)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_API_KEY=your_langsmith_api_key_here
LANGCHAIN_PROJECT=jabri-rolefit-assessment
```

## Getting API Keys

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and add it to `.env.local` as `OPENAI_API_KEY`

### LangSmith API Key (Optional)
1. Go to https://smith.langchain.com/
2. Sign in or create an account
3. Navigate to Settings > API Keys
4. Create a new API key
5. Copy the key and add it to `.env.local` as `LANGCHAIN_API_KEY`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file with your API keys (see above)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- **Dynamic Question Generation**: Questions are generated on-the-fly using LangChain and OpenAI
- **Category Selection**: Select from 6 primary assessment categories
- **Checkbox-based Answers**: Each question has multiple checkbox options
- **"Other" Option**: Custom input with AI-powered autocomplete suggestions
- **Progress Tracking**: Visual progress bar showing assessment completion
- **Up to 10 Questions**: Assessment automatically stops at 10 questions
- **LangSmith Tracing**: Optional tracing and monitoring of AI interactions

## How It Works

1. **Category Selection**: User selects one or more categories from the 6 primary categories
2. **First Question**: After clicking "Continue", the first question is generated dynamically
3. **Dynamic Generation**: When a user selects a checkbox (except "Other"), the next question is automatically generated
4. **Autocomplete**: When "Other" is selected, typing in the textbox triggers AI-powered suggestions
5. **Progress**: Progress bar updates as questions are answered
6. **Completion**: Assessment completes after 10 questions or when user clicks "Complete"

## Troubleshooting

### API Key Errors
- Ensure your `.env.local` file is in the root directory
- Verify your OpenAI API key is valid and has credits
- Restart the development server after adding environment variables

### Question Generation Fails
- Check that `OPENAI_API_KEY` is set correctly
- Verify your OpenAI account has available credits
- Check the browser console and server logs for error messages

### Suggestions Not Working
- Ensure `OPENAI_API_KEY` is set
- Check network connectivity
- Verify the API route `/api/generate-suggestions` is accessible

