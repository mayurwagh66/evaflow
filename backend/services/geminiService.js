const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getGemini = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key not configured');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

const generateChatResponse = async (userMessage, contextData) => {
  try {
    console.log('Initializing Gemini...');
    const gen = getGemini();
    const model = gen.getGenerativeModel({ model: 'gemini-pro' });
    console.log('Gemini model initialized successfully');

    const systemPrompt = `You are EvaFlow AI, a sustainability and carbon emissions expert for a road freight logistics platform. 
You help users understand their carbon footprint, suggest reductions, and analyze emission data.
Always be concise, factual, and actionable. Use the provided data context to answer accurately.
If data is provided, reference specific numbers. Format numbers nicely (e.g., 1,234 kg CO2).
${contextData ? `\nCurrent data context:\n${JSON.stringify(contextData, null, 2)}` : ''}`;

    const prompt = `${systemPrompt}\n\nUser question: ${userMessage}\n\nProvide a helpful, data-driven response:`;

    console.log('Generating content with Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log('Gemini response length:', text?.length || 0);
    return text || 'Unable to generate response.';
  } catch (error) {
    console.error('Gemini error details:', error.message);
    console.error('Full error:', error);
    return `Sorry, I encountered an error: ${error.message}. Please try again.`;
  }
};

module.exports = { generateChatResponse };
