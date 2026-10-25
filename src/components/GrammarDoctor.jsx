import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeGrammarDoctor } from '../services/gemini';
import { speakText } from '../utils/speech';
import { 
  Stethoscope, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Volume2, 
  TrendingUp, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function GrammarDoctor() {
  const { apiKey, requireApiKey, speechVoice, speechSpeed } = useApp();

  const [inputSentence, setInputSentence] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const sampleSentences = [
    "I am looking forward to meet you yesterday and discuss about the project.",
    "Although he worked hard, but he failed the exam.",
    "The manager insisted that everyone is on time for the meeting.",
  ];

  const handleAnalyze = async (textToAnalyze) => {
    const text = (textToAnalyze || inputSentence).trim();
    if (!text) {
      setError('Please enter a sentence to diagnose.');
      return;
    }

    if (!apiKey) {
      requireApiKey(() => handleAnalyze(text));
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const data = await analyzeGrammarDoctor({ apiKey, sentence: text });
      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze sentence. Please verify your Gemini API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mb-2">
          <Stethoscope className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">AI English Sentence Doctor</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Get real-time grammatical diagnosis, stylistic tone variations, and high-impact vocabulary upgrades.
        </p>
      </div>

      {/* Input box */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <textarea
          rows={3}
          value={inputSentence}
          onChange={(e) => setInputSentence(e.target.value)}
          placeholder="Type or paste any English sentence to diagnose..."
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-white placeholder-slate-500 text-sm sm:text-base outline-none resize-none"
        />

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-500 font-semibold">Try sample:</span>
          {sampleSentences.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputSentence(sample);
                handleAnalyze(sample);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition truncate max-w-xs"
            >
              {sample}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleAnalyze()}
          disabled={isLoading || !inputSentence.trim()}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Diagnosing with Gemini...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Diagnose & Enhance Sentence
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Diagnosis Report */}
      {analysis && (
        <div className="space-y-5 animate-fade-in">
          {/* Verdict Score Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase border ${
                  analysis.isCorrect
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}>
                  {analysis.isCorrect ? 'Grammatically Sound' : 'Improvements Needed'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {analysis.summary}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Health Score</span>
                <span className="text-xl font-extrabold text-indigo-400">{analysis.score}/100</span>
              </div>
            </div>

            {/* Corrected version */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/50 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                Corrected & Polished Version
              </span>
              <p className="text-base font-semibold text-white">
                {analysis.correctedSentence}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => speakText(analysis.correctedSentence, { lang: speechVoice, rate: speechSpeed })}
                  className="p-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-900/70 text-indigo-300 text-xs flex items-center gap-1 transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
                <button
                  onClick={() => copyToClipboard(analysis.correctedSentence, 'corrected')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'corrected' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Grammar Explanation */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Detailed Diagnosis
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                {analysis.explanation}
              </p>
            </div>
          </div>

          {/* 3 Stylistic Tone Variations */}
          {analysis.variations && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Casual */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                  ☕ Casual / Friendly
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {analysis.variations.casual}
                </p>
                <button
                  onClick={() => speakText(analysis.variations.casual, { lang: speechVoice, rate: speechSpeed })}
                  className="p-1 text-slate-400 hover:text-emerald-400"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Professional */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
                  💼 Workplace / Professional
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {analysis.variations.professional}
                </p>
                <button
                  onClick={() => speakText(analysis.variations.professional, { lang: speechVoice, rate: speechSpeed })}
                  className="p-1 text-slate-400 hover:text-blue-400"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Academic */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400 block">
                  🎓 Academic / Band 8.5+
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {analysis.variations.advanced}
                </p>
                <button
                  onClick={() => speakText(analysis.variations.advanced, { lang: speechVoice, rate: speechSpeed })}
                  className="p-1 text-slate-400 hover:text-violet-400"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Vocabulary Upgrades */}
          {analysis.vocabularyUpgrades?.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Recommended Vocabulary Upgrades
              </h4>
              <div className="space-y-2">
                {analysis.vocabularyUpgrades.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="line-through text-slate-500 font-mono">{item.original}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-emerald-400 font-bold font-mono">{item.upgrade}</span>
                    </div>
                    <span className="text-slate-400 italic">{item.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
