# Prompt Architect (SESS-01 Genesis Protocol)

A professional AI-powered prompt engineering canvas and presentation generator.

## Key Features

- **Cinematic Presentation Generator**: Convert AI insights into professional PPT files with thematic visuals.
- **Image Diversity Engine**: Intelligent, context-aware image selection for slides.
- **Quantum Excellence UI**: A high-impact, professional dark-mode interface.
- **Global Strategy Architecture**: specialized logic for PESTLE, SWOT, and GTM strategies.

## Deployment with Vercel

This project is optimized for deployment on [Vercel](https://vercel.com/).

### Deployment Steps:
1. Connect your GitHub repository (`https://github.com/Jerry-Y-Hong/prompt_architect`) to Vercel.
2. In the Vercel project settings, navigate to **Environment Variables**.
3. Add the following variable:
   - `VITE_GEMINI_API_KEY`: Your Google Gemini API Key. (You can generate one from [Google AI Studio](https://aistudio.google.com/))
4. Click **Deploy**.

## Local Development

```bash
# Install dependencies
npm install

# Setup Environment
# Create a .env file and add:
# VITE_GEMINI_API_KEY=your_key_here

# Start development server
npm run dev
```

## Security & Ethics

**CRITICAL**: Never commit your `.env` file or expose your `VITE_GEMINI_API_KEY` publicly. The `.gitignore` is pre-configured to exclude all sensitive environment files.

