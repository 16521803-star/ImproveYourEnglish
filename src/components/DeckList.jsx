import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Layers, 
  Headphones, 
  CheckSquare, 
  Plus, 
  Trash2, 
  GraduationCap, 
  Briefcase, 
  MessageCircle, 
  FileText,
  BookOpen,
  Volume2
} from 'lucide-react';
import { speakText } from '../utils/speech';

export default function DeckList({ onStartStudy, onOpenCreateModal }) {
  const { decks, activeDeckId, setActiveDeckId, deleteDeck, speechVoice, speechSpeed } = useApp();
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'IELTS', 'Business', 'Daily', 'Custom AI', 'Personal'];

  const filteredDecks = filterCategory === 'All'
    ? decks
    : decks.filter(d => (d.category || 'Other').toLowerCase() === filterCategory.toLowerCase());

  const getDeckIcon = (iconName) => {
    switch (iconName) {
      case 'GraduationCap': return GraduationCap;
      case 'Briefcase': return Briefcase;
      case 'MessageCircle': return MessageCircle;
      case 'FileText': return FileText;
      case 'Sparkles': return Sparkles;
      default: return BookOpen;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-violet-950/60 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Enhanced English Mastery
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Supercharge Your English with Smart SRS & AI Practice
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
            Scientific spaced repetition flashcards, listening dictation drills, and interactive speaking roleplay with real-time grammar coaching.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              Generate AI Vocabulary Deck
            </button>
            <button
              onClick={() => onStartStudy('flashcards', activeDeckId)}
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-sm font-medium flex items-center gap-2 transition"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              Continue Studying Active Deck
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          New Deck
        </button>
      </div>

      {/* Deck Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDecks.map((deck) => {
          const Icon = getDeckIcon(deck.icon);
          const totalCards = deck.cards?.length || 0;
          const masteredCards = deck.cards?.filter(c => c.srs?.state === 'mastered').length || 0;
          const progressPercent = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
          const isSelected = deck.id === activeDeckId;

          return (
            <div
              key={deck.id}
              className={`relative flex flex-col justify-between rounded-2xl border transition group ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/20'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="p-5">
                {/* Deck Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${deck.color || 'from-indigo-600 to-violet-600'} text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {deck.category && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                        {deck.category}
                      </span>
                    )}
                    {decks.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete deck "${deck.title}"?`)) {
                            deleteDeck(deck.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
                        title="Delete Deck"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 
                  onClick={() => setActiveDeckId(deck.id)}
                  className="text-base font-bold text-white hover:text-indigo-400 cursor-pointer transition line-clamp-1 mb-1"
                >
                  {deck.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {deck.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>{totalCards} words</span>
                    <span>{progressPercent}% Mastered</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Quick Word Preview Pills */}
                {totalCards > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800/60">
                    {deck.cards.slice(0, 3).map((c) => (
                      <span
                        key={c.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(c.word, { lang: speechVoice, rate: speechSpeed });
                        }}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer transition group/pill"
                        title="Click to hear pronunciation"
                      >
                        <span>{c.word}</span>
                        <Volume2 className="w-2.5 h-2.5 opacity-60 group-hover/pill:opacity-100 text-indigo-400" />
                      </span>
                    ))}
                    {totalCards > 3 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{totalCards - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 border-t border-slate-800/80 bg-slate-950/40 divide-x divide-slate-800/80 rounded-b-2xl">
                <button
                  onClick={() => {
                    setActiveDeckId(deck.id);
                    onStartStudy('flashcards', deck.id);
                  }}
                  className="py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-indigo-600/10 flex items-center justify-center gap-1.5 transition"
                  title="Flashcards (Spaced Repetition)"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Cards
                </button>
                <button
                  onClick={() => {
                    setActiveDeckId(deck.id);
                    onStartStudy('dictation', deck.id);
                  }}
                  className="py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-indigo-600/10 flex items-center justify-center gap-1.5 transition"
                  title="Listen & Type Dictation Drill"
                >
                  <Headphones className="w-3.5 h-3.5 text-violet-400" />
                  Listen
                </button>
                <button
                  onClick={() => {
                    setActiveDeckId(deck.id);
                    onStartStudy('quiz', deck.id);
                  }}
                  className="py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-indigo-600/10 flex items-center justify-center gap-1.5 transition"
                  title="Fill-in-the-Blank Context Quiz"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Quiz
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
