/**
 * Gemini API Service for English Learning Platform
 * Fetches available models from Google API and runs inference.
 */

const STORAGE_SELECTED_MODEL = 'lexiflow_selected_gemini_model';

/**
 * Fetch list of all models supporting generateContent for this API key
 */
export async function fetchAvailableModels(apiKey) {
  if (!apiKey || !apiKey.trim()) return [];

  const key = apiKey.trim();
  const versions = ['v1beta', 'v1'];
  let foundModels = [];
  let lastError = '';

  for (const ver of versions) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/${ver}/models?key=${key}`);
      if (res.ok) {
        const data = await res.json();
        const models = (data.models || [])
          .filter(m => !m.supportedGenerationMethods || m.supportedGenerationMethods.includes('generateContent'))
          .map(m => {
            const cleanId = m.name.replace(/^models\//, '');
            return {
              id: cleanId,
              displayName: m.displayName || cleanId,
              version: ver,
              description: m.description || '',
            };
          })
          // Filter to only generative chat/text models (exclude embedding/aqa)
          .filter(m => !m.id.includes('embedding') && !m.id.includes('aqa') && !m.id.includes('imagen'));

        if (models.length > 0) {
          foundModels = models;
          break;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastError = errJson.error?.message || `HTTP ${res.status}`;
      }
    } catch (e) {
      lastError = e.message;
    }
  }

  if (foundModels.length === 0 && lastError) {
    throw new Error(lastError);
  }

  return foundModels;
}

/**
 * Get active model ID (stored in localStorage or auto-selected)
 */
export function getStoredModelId() {
  const stored = localStorage.getItem(STORAGE_SELECTED_MODEL) || '';
  // Upgrade deprecated models
  if (stored.includes('2.5-flash') || stored.includes('1.5-flash') || stored.includes('2.0-flash')) {
    return 'gemini-3.8-flash';
  }
  return stored || 'gemini-3.8-flash';
}

export function setStoredModelId(modelId) {
  localStorage.setItem(STORAGE_SELECTED_MODEL, modelId);
}

/**
 * Generic Gemini API Caller
 */
export async function callGemini(apiKey, { prompt, systemInstruction = '', responseSchema = null, modelId = null }) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Please enter your Gemini API Key in the settings popup.');
  }

  const key = apiKey.trim();
  let selected = modelId || getStoredModelId();

  // If no model selected, find one
  if (!selected || selected.includes('2.5-flash') || selected.includes('1.5-flash')) {
    const list = await fetchAvailableModels(key).catch(() => []);
    if (list.length > 0) {
      // Find preferred model: gemini-3.8-flash
      const preferred = list.find(m => m.id.includes('3.8-flash')) 
        || list.find(m => m.id.includes('3.8'))
        || list.find(m => m.id.includes('flash'))
        || list[0];
      selected = preferred.id;
      setStoredModelId(selected);
    } else {
      selected = 'gemini-3.8-flash';
    }
  }

  // Try v1beta first, then v1
  const versions = ['v1beta', 'v1'];
  let lastErrorMessage = '';

  for (const ver of versions) {
    const url = `https://generativelanguage.googleapis.com/${ver}/models/${selected}:generateContent?key=${key}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    if (responseSchema) {
      body.generationConfig.responseMimeType = 'application/json';
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        lastErrorMessage = msg;

        // If 404 on this version, try next version
        if (response.status === 404) {
          continue;
        }

        throw new Error(msg);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No text returned from Gemini API.');
      }

      return text;
    } catch (err) {
      lastErrorMessage = err.message || 'Network error';
      if (!err.message?.includes('404') && !err.message?.includes('not found')) {
        throw err;
      }
    }
  }

  throw new Error(lastErrorMessage || `Model "${selected}" not found on your API key.`);
}

/**
 * Verify if the API key works and returns the list of models
 */
export async function testGeminiApiKey(apiKey, customModel = null) {
  try {
    const models = await fetchAvailableModels(apiKey);
    if (!models || models.length === 0) {
      throw new Error('No available models found for this API key. Check if Gemini API is enabled in your Google AI Studio.');
    }

    const targetModel = customModel 
      || models.find(m => m.id.includes('3.8-flash'))?.id
      || models.find(m => m.id.includes('3.8'))?.id
      || models.find(m => m.id.includes('flash'))?.id 
      || models[0].id;
    setStoredModelId(targetModel);

    // Test a basic generateContent call
    await callGemini(apiKey, {
      prompt: 'Respond with exactly: {"status": "ok"}',
      responseSchema: true,
      modelId: targetModel,
    });

    return { 
      success: true, 
      message: `Connected successfully with model: ${targetModel}`,
      models 
    };
  } catch (err) {
    return { 
      success: false, 
      message: err.message || 'API Key verification failed.' 
    };
  }
}

/**
 * Clean JSON parser that strips markdown code fences if present
 */
function parseJsonSafe(text) {
  try {
    const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse JSON response:', text);
    throw new Error('Received invalid format from AI. Please try again.');
  }
}

/**
 * Generate a Vocabulary Set from a Topic
 */
export async function generateDeckFromTopic({ apiKey, topic, level = 'B2', count = 10 }) {
  const systemInstruction = `You are an expert English language lexicographer and ESL curriculum designer. 
Generate a list of exactly ${count} essential, high-impact English vocabulary words, idioms, or collocations related to the specified topic, appropriate for CEFR level ${level}.
Return ONLY valid JSON matching this structure:
{
  "deckTitle": "Short catchy title",
  "deckDescription": "1-line description",
  "cards": [
    {
      "word": "word or phrase",
      "phonetic": "/IPA phonetics/",
      "partOfSpeech": "verb | noun | adjective | idiom | adverb",
      "level": "A1 | A2 | B1 | B2 | C1 | C2",
      "definition": "Clear, precise English definition",
      "simpleExplanation": "Easy to understand everyday explanation",
      "collocations": ["common collocations 1", "common collocation 2"],
      "examples": [
        "First realistic natural example sentence.",
        "Second realistic natural example sentence."
      ],
      "synonyms": ["synonym1", "synonym2"]
    }
  ]
}`;

  const prompt = `Topic: "${topic}". CEFR target level: ${level}. Number of cards: ${count}.`;

  const raw = await callGemini(apiKey, {
    prompt,
    systemInstruction,
    responseSchema: true,
  });

  return parseJsonSafe(raw);
}

/**
 * Extract Vocabulary from Custom Text or Article
 */
export async function extractVocabularyFromText({ apiKey, text, count = 8 }) {
  const systemInstruction = `You are an expert English teacher. 
Analyze the provided English text and extract up to ${count} of the most useful, advanced, or interesting vocabulary words/idioms.
Return ONLY valid JSON matching this structure:
{
  "deckTitle": "Key Vocabulary from Text",
  "deckDescription": "Extracted key terms for deep study",
  "cards": [
    {
      "word": "word or phrase",
      "phonetic": "/IPA/",
      "partOfSpeech": "noun | verb | adj | adv | idiom",
      "level": "B1 | B2 | C1 | C2",
      "definition": "Clear definition in English",
      "simpleExplanation": "Simplified explanation",
      "collocations": ["collocation 1", "collocation 2"],
      "examples": [
        "Context sentence from the text or natural usage."
      ],
      "synonyms": ["synonym1", "synonym2"]
    }
  ]
}`;

  const prompt = `Extract ${count} key vocabulary items from this passage:\n\n${text.slice(0, 3000)}`;

  const raw = await callGemini(apiKey, {
    prompt,
    systemInstruction,
    responseSchema: true,
  });

  return parseJsonSafe(raw);
}

/**
 * AI Speaking Partner: Roleplay and provide real-time English coaching
 */
export async function chatSpeakingPartner({ apiKey, scenario, history, userSpeech }) {
  const systemInstruction = `You are "Lexi", an engaging, friendly native English conversation partner and coach.
The conversation scenario is: "${scenario.title}" - ${scenario.description}.
Your persona in this scenario: ${scenario.aiRole}. The user is: ${scenario.userRole}.

Your mission is twofold:
1. Continue the conversation naturally and in character as ${scenario.aiRole} (keep reply engaging, realistic, and around 1-3 sentences).
2. Coach the user on their English: evaluate grammar, vocabulary, and provide a more natural native alternative to how they phrased their message.

Return ONLY a JSON object with this exact structure:
{
  "reply": "Your in-character spoken reply to continue the roleplay",
  "grammarScore": 85,
  "corrections": "Point out any grammar or preposition errors, or 'None! Flawless sentence.' if correct",
  "nativeAlternative": "How a fluent native speaker would naturally say what the user meant",
  "coachTip": "A quick practical tip on vocabulary, idiom, or pronunciation"
}`;

  const conversationHistory = history
    .slice(-6)
    .map(m => `${m.role === 'user' ? 'User' : 'Lexi'}: ${m.text}`)
    .join('\n');

  const prompt = `Conversation history:\n${conversationHistory}\n\nUser just said: "${userSpeech}".\nProvide your response and coaching breakdown in JSON.`;

  const raw = await callGemini(apiKey, {
    prompt,
    systemInstruction,
    responseSchema: true,
  });

  return parseJsonSafe(raw);
}

/**
 * AI Grammar Doctor: In-depth sentence analysis and re-phrasing
 */
export async function analyzeGrammarDoctor({ apiKey, sentence }) {
  const systemInstruction = `You are the AI English Grammar & Sentence Doctor.
Analyze the user's sentence thoroughly.
Return ONLY valid JSON with this structure:
{
  "isCorrect": true,
  "score": 90,
  "summary": "Brief 1-sentence verdict",
  "correctedSentence": "The grammatically perfect version",
  "explanation": "Detailed breakdown of mistakes (articles, prepositions, tenses, word order)",
  "variations": {
    "casual": "Casual everyday phrasing",
    "professional": "Polite, professional workplace phrasing",
    "advanced": "Academic / IELTS Band 8.5+ phrasing"
  },
  "vocabularyUpgrades": [
    {
      "original": "simple word used",
      "upgrade": "better/more expressive word",
      "reason": "why it improves the sentence"
    }
  ]
}`;

  const prompt = `Analyze this sentence: "${sentence}"`;

  const raw = await callGemini(apiKey, {
    prompt,
    systemInstruction,
    responseSchema: true,
  });

  return parseJsonSafe(raw);
}
