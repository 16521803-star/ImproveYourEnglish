/**
 * Web Speech API Utilities: Text-to-Speech (TTS) and Speech-to-Text (STT)
 */

export function speakText(text, options = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const { lang = 'en-US', rate = 1.0, pitch = 1.0, onEnd } = options;

  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;

  // Try to find a matching voice for the target language
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const matchedVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]) && v.lang.includes(lang.split('-')[1]))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Creates a Speech Recognition instance if supported
 */
export function createSpeechRecognizer({ lang = 'en-US', onResult, onError, onEnd }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang;

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    if (onResult) {
      const isFinal = event.results[event.results.length - 1].isFinal;
      onResult(transcript, isFinal);
    }
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
