import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { chatSpeakingPartner } from '../services/gemini';
import { speakText, createSpeechRecognizer } from '../utils/speech';
import { SPEAKING_SCENARIOS } from '../data/starterDecks';
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Briefcase, 
  Coffee, 
  Award, 
  Hotel,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

export default function SpeakingPartner() {
  const { apiKey, requireApiKey, speechVoice, speechSpeed } = useApp();

  const [selectedScenario, setSelectedScenario] = useState(SPEAKING_SCENARIOS[0]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [error, setError] = useState('');

  const recognizerRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Initialize scenario conversation
  useEffect(() => {
    setMessages([
      {
        id: 'init',
        role: 'ai',
        text: selectedScenario.initialMessage,
        coaching: null,
      }
    ]);
    speakText(selectedScenario.initialMessage, { lang: speechVoice, rate: speechSpeed });
  }, [selectedScenario]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiResponding]);

  // Speech Recognition setup
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      recognizerRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognizer = createSpeechRecognizer({
      lang: speechVoice,
      onResult: (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsRecording(false);
        }
      },
      onError: (err) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });

    if (!recognizer) {
      alert('Speech recognition is not supported in this browser. Please type your message or use Google Chrome / Edge.');
      return;
    }

    recognizerRef.current = recognizer;
    recognizer.start();
    setIsRecording(true);
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isAiResponding) return;

    if (!apiKey) {
      requireApiKey(() => handleSendMessage(text));
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAiResponding(true);
    setError('');

    try {
      const result = await chatSpeakingPartner({
        apiKey,
        scenario: selectedScenario,
        history: [...messages, userMessage],
        userSpeech: text,
      });

      const aiMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: result.reply,
        coaching: {
          grammarScore: result.grammarScore,
          corrections: result.corrections,
          nativeAlternative: result.nativeAlternative,
          coachTip: result.coachTip,
        }
      };

      setMessages(prev => [...prev, aiMessage]);
      speakText(result.reply, { lang: speechVoice, rate: speechSpeed });
    } catch (err) {
      setError(err.message || 'AI conversation error. Please check your Gemini API key.');
    } finally {
      setIsAiResponding(false);
    }
  };

  const getScenarioIcon = (iconName) => {
    switch (iconName) {
      case 'Briefcase': return Briefcase;
      case 'Coffee': return Coffee;
      case 'Award': return Award;
      default: return Hotel;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {SPEAKING_SCENARIOS.map((sc) => {
          const Icon = getScenarioIcon(sc.icon);
          const isSelected = selectedScenario.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setSelectedScenario(sc)}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                )}
              </div>
              <span className="text-xs font-bold line-clamp-1">{sc.title}</span>
            </button>
          );
        })}
      </div>

      {/* Scenario Info Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>{selectedScenario.title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {selectedScenario.aiRole.split(',')[0]}
            </span>
          </h2>
          <p className="text-xs text-slate-400 line-clamp-1">{selectedScenario.description}</p>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'init',
                role: 'ai',
                text: selectedScenario.initialMessage,
                coaching: null,
              }
            ]);
            speakText(selectedScenario.initialMessage, { lang: speechVoice, rate: speechSpeed });
          }}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition shrink-0"
          title="Restart Scenario"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div className="h-[460px] overflow-y-auto p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-inner">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}>
              <div className="flex items-start gap-2 max-w-[85%]">
                {!isUser && (
                  <button
                    onClick={() => speakText(m.text, { lang: speechVoice, rate: speechSpeed })}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-indigo-400 shrink-0 mt-1"
                    title="Play audio"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-sm shadow-md'
                      : 'bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700/60'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
              </div>

              {/* Real-time Live English Coaching Card */}
              {m.coaching && (
                <div className="max-w-[85%] p-3.5 rounded-2xl bg-slate-950 border border-indigo-900/40 text-xs space-y-2 shadow-lg animate-fade-in">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Coach Feedback
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/50">
                      Accuracy: {m.coaching.grammarScore}%
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">Grammar Check:</span>
                    <span className="text-slate-200">{m.coaching.corrections}</span>
                  </div>

                  {m.coaching.nativeAlternative && (
                    <div className="bg-indigo-950/30 p-2 rounded-xl border border-indigo-800/30">
                      <span className="text-indigo-400 font-semibold block mb-0.5">Natural Native Phrasing:</span>
                      <span className="text-indigo-200 italic">"{m.coaching.nativeAlternative}"</span>
                    </div>
                  )}

                  {m.coaching.coachTip && (
                    <div className="text-amber-300/90 text-[11px]">
                      💡 Tip: {m.coaching.coachTip}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isAiResponding && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>Lexi is thinking and preparing coaching feedback...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input area with Microphone */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <button
          onClick={toggleSpeechRecognition}
          className={`p-3 rounded-xl transition ${
            isRecording
              ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40'
              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
          title={isRecording ? 'Listening... click to stop' : 'Click to Speak via Microphone'}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-indigo-400" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={isRecording ? 'Listening to your speech...' : 'Type or speak your answer in English...'}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isAiResponding}
          className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
