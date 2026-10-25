/**
 * Gemini API Service for English Learning Platform
 * Automatically detects available models for the user's API key.
 */

let cachedModel = null;

/**
 * Automatically fetch the active working model for the user's API key
 */
export async function getActiveGeminiModel(apiKey) {
  if (cachedModel) return cachedModel;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
    if (res.ok) {
      const data = await res.json();
      const models = data.models || [];

      // Filter models that support generateContent
      const usable = models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));

      // Priority list
      const priorities = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-8b',
        'gemini-pro'
      ];

      for (const p of priorities) {
        if (usable.includes(p)) {
          cachedModel = p;
          return p;
        }
      }

      if (usable.length > 0) {
        cachedModel = usable[0];
        return usable[0];
      }
    }
  } catch (e) {
    console.warn('Could not query model list, using default fallback:', e);
  }

  // Fallback default
  return 'gemini-2.0-flash';
}

/**
 * Generic Gemini API Caller with dynamic model resolution
 */
export async function callGemini(apiKey, { prompt, systemInstruction = '', responseSchema = null, model = null }) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Please provide a valid Gemini API Key.');
  }

  const resolvedModel = model || (await getActiveGeminiModel(apiKey));
  const fallbackList = [resolvedModel, 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  let lastError = null;

  for (const currentModel of fallbackList) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey.trim()}`;

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
        const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;

        // If it's a 404 (model not found), reset cache and try next model
        if (response.status === 404) {
          cachedModel = null;
          continue;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No content returned from Gemini.');
      }

      // Save working model
      cachedModel = currentModel;
      return text;
    } catch (err) {
      lastError = err;
      if (!err.message?.includes('404') && !err.message?.includes('not found')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Failed to communicate with Gemini API.');
}

/**
 * Verify if the API key works
 */
export async function testGeminiApiKey(apiKey) {
  try {
    cachedModel = null; // force fresh lookup
    const activeModel = await getActiveGeminiModel(apiKey);
    const response = await callGemini(apiKey, {
      prompt: 'Respond with exactly: {"status": "ok"}',
      systemInstruction: 'You are an API health check helper. Output JSON.',
      responseSchema: true,
      model: activeModel,
    });
    return { success: true, message: `Connected successfully using model: ${activeModel}` };
  } catch (err) {
    return { success: false, message: err.message || 'API Key verification failed.' };
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
    throw new Error('Received invalid JSON format from AI. Please try again.');
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
