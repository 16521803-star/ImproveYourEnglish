import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { speakText } from '../utils/speech';
import confetti from 'canvas-confetti';
import { 
  Volume2, 
  RotateCw, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  HelpCircle, 
  Trophy,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Keyboard
} from 'lucide-react';

export default function FlashcardStudy({ onBackToDecks }) {
  const { activeDeck, updateCardSRS, speechVoice, speechSpeed, decks, setActiveDeckId } = useApp();
  
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [statsSummary, setStatsSummary] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  useEffect(() => {
    if (activeDeck && activeDeck.cards) {
      setCards(activeDeck.cards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionCompleted(false);
      setStatsSummary({ again: 0, hard: 0, good: 0, easy: 0 });
    }
  }, [activeDeck]);

  const currentCard = cards[currentIndex];

  const handleSpeak = (text, e) => {
    if (e) e.stopPropagation();
    speakText(text, { lang: speechVoice, rate: speechSpeed });
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNextCard = () => {
    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleGrade = (quality) => {
    if (!currentCard) return;

    // Quality: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
    updateCardSRS(activeDeck.id, currentCard.id, quality);

    const keyMap = { 1: 'again', 2: 'hard', 3: 'good', 4: 'easy' };
    setStatsSummary(prev => ({ ...prev, [keyMap[quality]]: prev[keyMap[quality]] + 1 }));

    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionCompleted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (isFlipped) {
        if (e.key === '1') handleGrade(1);
        else if (e.key === '2') handleGrade(2);
        else if (e.key === '3') handleGrade(3);
        else if (e.key === '4') handleGrade(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length, isFlipped, currentCard]);

  if (!activeDeck || !cards.length) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">No Cards in this Deck Yet</h3>
        <p className="text-sm text-slate-400 mb-6">Add words or generate with AI to start studying.</p>
        <button
          onClick={onBackToDecks}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition"
        >
          Back to Decks
        </button>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 px-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-amber-500/20">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-1">Session Complete!</h2>
        <p className="text-sm text-slate-400 mb-6">
          Great job! You reviewed {cards.length} English flashcards in <strong>{activeDeck.title}</strong>.
        </p>

        <div className="grid grid-cols-4 gap-2 mb-8">
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-center">
            <span className="block text-xs text-rose-400 font-semibold mb-1">Again</span>
            <span className="text-lg font-bold text-white">{statsSummary.again}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-center">
            <span className="block text-xs text-amber-400 font-semibold mb-1">Hard</span>
            <span className="text-lg font-bold text-white">{statsSummary.hard}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-center">
            <span className="block text-xs text-emerald-400 font-semibold mb-1">Good</span>
            <span className="text-lg font-bold text-white">{statsSummary.good}</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-center">
            <span className="block text-xs text-blue-400 font-semibold mb-1">Easy</span>
            <span className="text-lg font-bold text-white">{statsSummary.easy}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
              setSessionCompleted(false);
              setStatsSummary({ again: 0, hard: 0, good: 0, easy: 0 });
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition"
          >
            Review Again
          </button>
          <button
            onClick={onBackToDecks}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition"
          >
            Back to Decks
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBackToDecks}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Decks</span>
        </button>

        {/* Deck Selector */}
        <select
          value={activeDeck.id}
          onChange={(e) => setActiveDeckId(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none max-w-[200px] truncate"
        >
          {decks.map(d => (
            <option key={d.id} value={d.id}>{d.title}</option>
          ))}
        </select>

        {/* Card Counter with Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-full border border-slate-800">
          <button
            onClick={handlePrevCard}
            disabled={currentIndex === 0}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Previous card (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-indigo-400 px-1">
            {currentIndex + 1} / {cards.length}
          </span>
          <button
            onClick={handleNextCard}
            disabled={currentIndex + 1 >= cards.length}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Next card (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Card Carousel Navigation Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none justify-center">
        {cards.map((c, idx) => (
          <button
            key={c.id || idx}
            onClick={() => {
              setCurrentIndex(idx);
              setIsFlipped(false);
            }}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center shrink-0 ${
              idx === currentIndex
                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/50'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={`Jump to card ${idx + 1}: ${c.word}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* 3D Flashcard with side arrows */}
      <div className="relative flex items-center justify-between gap-2">
        {/* Left Arrow Button */}
        <button
          onClick={handlePrevCard}
          disabled={currentIndex === 0}
          className="hidden sm:flex p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition disabled:opacity-20 disabled:cursor-not-allowed shadow-lg hover:scale-105 active:scale-95"
          title="Previous card (Left Arrow)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* The Card */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative min-h-[380px] w-full cursor-pointer perspective-1000 select-none flex-1"
        >
          <div
            className={`relative w-full h-full min-h-[380px] rounded-3xl p-6 sm:p-8 border transition-all duration-500 transform-style-3d shadow-2xl ${
              isFlipped
                ? 'bg-slate-900 border-indigo-500/50 rotate-y-180'
                : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* FRONT */}
            {!isFlipped ? (
              <div className="flex flex-col justify-between h-full min-h-[330px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {currentCard.level && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 uppercase">
                        {currentCard.level}
                      </span>
                    )}
                    {currentCard.partOfSpeech && (
                      <span className="text-xs italic text-slate-400">
                        {currentCard.partOfSpeech}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleSpeak(currentCard.word, e)}
                    className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition hover:scale-105"
                    title="Pronounce word"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Word */}
                <div className="text-center py-8">
                  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
                    {currentCard.word}
                  </h2>
                  {currentCard.phonetic && (
                    <p className="text-slate-400 font-mono text-sm sm:text-base">
                      {currentCard.phonetic}
                    </p>
                  )}
                </div>

                {/* Hint */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-4 py-2 rounded-xl">
                    <RotateCw className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    Click or press Space to reveal answer
                  </span>
                </div>
              </div>
            ) : (
              /* BACK */
              <div className="flex flex-col justify-between h-full min-h-[330px] rotate-y-180">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">{currentCard.word}</h3>
                      {currentCard.phonetic && (
                        <span className="text-xs text-slate-400 font-mono">{currentCard.phonetic}</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleSpeak(currentCard.word, e)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Definition */}
                  <div>
                    <h4 className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Definition
                    </h4>
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                      {currentCard.definition}
                    </p>
                    {currentCard.simpleExplanation && (
                      <p className="text-xs text-indigo-300 mt-1 italic">
                        💡 {currentCard.simpleExplanation}
                      </p>
                    )}
                  </div>

                  {/* Collocations */}
                  {currentCard.collocations?.length > 0 && (
                    <div>
                      <h4 className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Common Collocations
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {currentCard.collocations.map((col, idx) => (
                          <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60">
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Examples */}
                  {currentCard.examples?.length > 0 && (
                    <div>
                      <h4 className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Context Sentences
                      </h4>
                      <div className="space-y-1.5">
                        {currentCard.examples.map((ex, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
                            <button
                              onClick={(e) => handleSpeak(ex, e)}
                              className="p-1 text-slate-400 hover:text-indigo-400 shrink-0 mt-0.5"
                              title="Play sentence audio"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="leading-relaxed">{ex}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center pt-2">
                  <span className="text-[11px] text-slate-500">
                    Rate how well you remembered this card below (Keys 1 - 4):
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleNextCard}
          disabled={currentIndex + 1 >= cards.length}
          className="hidden sm:flex p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition disabled:opacity-20 disabled:cursor-not-allowed shadow-lg hover:scale-105 active:scale-95"
          title="Next card (Right Arrow)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* SRS Quality Controls or Flip Controls */}
      <div className="space-y-3">
        {isFlipped ? (
          <div className="grid grid-cols-4 gap-2 sm:gap-3 animate-fade-in">
            <button
              onClick={() => handleGrade(1)}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 text-rose-300 font-semibold text-xs sm:text-sm transition hover:scale-[1.02]"
              title="Press 1"
            >
              <span>Again (1)</span>
              <span className="text-[10px] text-rose-400/80 font-normal mt-0.5">&lt; 1 min</span>
            </button>
            <button
              onClick={() => handleGrade(2)}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 text-amber-300 font-semibold text-xs sm:text-sm transition hover:scale-[1.02]"
              title="Press 2"
            >
              <span>Hard (2)</span>
              <span className="text-[10px] text-amber-400/80 font-normal mt-0.5">10 min</span>
            </button>
            <button
              onClick={() => handleGrade(3)}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-300 font-semibold text-xs sm:text-sm transition hover:scale-[1.02]"
              title="Press 3"
            >
              <span>Good (3)</span>
              <span className="text-[10px] text-emerald-400/80 font-normal mt-0.5">1 day</span>
            </button>
            <button
              onClick={() => handleGrade(4)}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/60 text-blue-300 font-semibold text-xs sm:text-sm transition hover:scale-[1.02]"
              title="Press 4"
            >
              <span>Easy (4)</span>
              <span className="text-[10px] text-blue-400/80 font-normal mt-0.5">4 days</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handlePrevCard}
              disabled={currentIndex === 0}
              className="sm:hidden px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFlipped(true)}
              className="flex-1 sm:flex-initial px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Show Answer</span>
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextCard}
              disabled={currentIndex + 1 >= cards.length}
              className="sm:hidden px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Keyboard Shortcuts Hint Bar */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">←</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">→</kbd>
            <span>Navigate</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Space</kbd>
            <span>Flip</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">1-4</kbd>
            <span>Grade</span>
          </span>
        </div>
      </div>
    </div>
  );
}
