import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// We initialize this dynamically inside the function to avoid HMR / caching issues
let genAI: GoogleGenerativeAI | null = null;

// Helper to get or initialize the client dynamically
function getGenAIClient(): GoogleGenerativeAI {
    if (genAI) return genAI;

    const key = import.meta.env.VITE_GEMINI_API_KEY;

    if (!key || key === 'your_api_key_here') {
        throw new Error('Gemini API key is not configured or still set to default. Please check your .env file.');
    }

    genAI = new GoogleGenerativeAI(key);
    return genAI;
}

// Pre-configured typical safety settings for ideation
export const ideationSafetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

/**
 * Utility function to wrap the actual Gemini API call
 * Can easily be swapped out or mocked during testing
 */
export async function generateContentWithGemini(
    systemInstruction: string,
    userPrompt: string,
    modelName: string = 'gemini-2.5-flash'
): Promise<string> {
    const client = getGenAIClient();

    const model = client.getGenerativeModel({
        model: modelName,
        safetySettings: ideationSafetySettings,
    });

    const chat = model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.7, // 0.7 gives a good balance of creativity and structure for ideation
        },
    });

    // Create an explicit system instruction block prepended to user prompt for simplicity in typical 1.5 flash REST APIs.
    const structuredPrompt = `[System Instructions]\n${systemInstruction}\n\n[User Final Input]\n${userPrompt}`;

    try {
        const result = await chat.sendMessage(structuredPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
}
