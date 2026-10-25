import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateDeckFromTopic, extractVocabularyFromText } from '../services/gemini';
import { Sparkles, FileText, PlusCircle, X, AlertCircle, Wand2, BookOpen } from 'lucide-react';

export default function CreateDeckModal({ isOpen, onClose }) {
  const { apiKey, requireApiKey, addDeck } = useApp();

  const [mode, setMode] = useState('ai-topic'); // 'ai-topic' | 'ai-text' | 'manual'
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('B2');
  const [count, setCount] = useState(8);
  const [passageText, setPassageText] = useState('');
  
  // Manual deck fields
  const [manualTitle, setManualTitle] = useState('');
  const [manualDesc, setManualDesc] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerateFromTopic = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    if (!apiKey) {
      requireApiKey(() => handleGenerateFromTopic());
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await generateDeckFromTopic({
        apiKey,
        topic: topic.trim(),
        level,
        count: parseInt(count, 10),
      });

      const newDeck = {
        id: `deck-${Date.now()}`,
        title: data.deckTitle || `Vocabulary: ${topic}`,
        description: data.deckDescription || `Master essential ${level} vocabulary for ${topic}`,
        category: 'Custom AI',
        icon: 'Sparkles',
        color: 'from-purple-600 to-indigo-600',
        cards: (data.cards || []).map((card, idx) => ({
          ...card,
          id: `card-${Date.now()}-${idx}`,
          srs: { repetitions: 0, interval: 0, easeFactor: 2.5, dueDate: null, state: 'new' }
        })),
      };

      addDeck(newDeck);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to generate vocabulary set.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractFromText = async () => {
    if (!passageText.trim()) {
      setError('Please paste or type an English text passage.');
      return;
    }

    if (!apiKey) {
      requireApiKey(() => handleExtractFromText());
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await extractVocabularyFromText({
        apiKey,
        text: passageText.trim(),
        count: parseInt(count, 10),
      });

      const newDeck = {
        id: `deck-${Date.now()}`,
        title: data.deckTitle || 'Extracted Vocabulary',
        description: data.deckDescription || 'Vocabulary extracted from custom article',
        category: 'Reading',
        icon: 'FileText',
        color: 'from-emerald-600 to-cyan-600',
        cards: (data.cards || []).map((card, idx) => ({
          ...card,
          id: `card-${Date.now()}-${idx}`,
          srs: { repetitions: 0, interval: 0, easeFactor: 2.5, dueDate: null, state: 'new' }
        })),
      };

      addDeck(newDeck);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to extract vocabulary.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateManual = (e) => {
    e.preventDefault();
    if (!manualTitle.trim()) {
      setError('Please provide a deck title.');
      return;
    }

    const newDeck = {
      id: `deck-${Date.now()}`,
      title: manualTitle.trim(),
      description: manualDesc.trim() || 'My custom English study list',
      category: 'Personal',
      icon: 'BookOpen',
      color: 'from-slate-700 to-slate-900',
      cards: [],
    };

    addDeck(newDeck);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create New Study Deck</h2>
            <p className="text-xs text-slate-400">Generate instantly with Gemini AI or build manually</p>
          </div>
        </div>

        {/* Tab mode selection */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950 rounded-xl mb-5 border border-slate-800">
          <button
            onClick={() => { setMode('ai-topic'); setError(''); }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              mode === 'ai-topic'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Topic
          </button>
          <button
            onClick={() => { setMode('ai-text'); setError(''); }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              mode === 'ai-text'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            From Text
          </button>
          <button
            onClick={() => { setMode('manual'); setError(''); }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              mode === 'manual'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Custom
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* AI by Topic */}
        {mode === 'ai-topic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Topic or Goal
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Software Architecture, Job Interview, Airport & Hotel, Climate Change"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-white text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target CEFR Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none"
                >
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced (IELTS 7.5+)</option>
                  <option value="C2">C2 - Mastery / Native</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Number of Cards
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none"
                >
                  <option value="5">5 Cards (Quick)</option>
                  <option value="8">8 Cards (Balanced)</option>
                  <option value="12">12 Cards (Deep Study)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateFromTopic}
              disabled={isLoading || !topic.trim()}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Study Deck with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Vocabulary Deck
                </>
              )}
            </button>
          </div>
        )}

        {/* AI from Text */}
        {mode === 'ai-text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Paste Reading Passage or Article
              </label>
              <textarea
                rows={5}
                value={passageText}
                onChange={(e) => setPassageText(e.target.value)}
                placeholder="Paste an article, BBC News snippet, academic abstract, or email here..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-white text-sm outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Number of Words to Extract
              </label>
              <select
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none"
              >
                <option value="5">5 Words</option>
                <option value="8">8 Words</option>
                <option value="12">12 Words</option>
              </select>
            </div>

            <button
              onClick={handleExtractFromText}
              disabled={isLoading || !passageText.trim()}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Text & Extracting Words...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Extract & Build Deck
                </>
              )}
            </button>
          </div>
        )}

        {/* Manual Deck */}
        {mode === 'manual' && (
          <form onSubmit={handleCreateManual} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Deck Title
              </label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. My Favorite Phrasal Verbs"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Description (Optional)
              </label>
              <input
                type="text"
                value={manualDesc}
                onChange={(e) => setManualDesc(e.target.value)}
                placeholder="e.g. Words I learned while reading books"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-white text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Create Empty Deck
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
