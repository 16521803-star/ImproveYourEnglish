import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { speakText } from '../utils/speech';
import { 
  Headphones, 
  Volume2, 
  RotateCcw, 
  Check, 
  HelpCircle, 
  ArrowLeft, 
  Sparkles, 
  Award,
  ChevronRight,
  Gauge
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DictationStudy({ onBackToDecks }) {
  const { activeDeck, speechVoice, decks, setActiveDeckId } = useApp();

  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.85); // slightly slower for dictation
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Extract sentences or words from active deck
  useEffect(() => {
    if (activeDeck && activeDeck.cards?.length) {
      const dictationItems = [];
      activeDeck.cards.forEach(card => {
        if (card.examples && card.examples.length > 0) {
          dictationItems.push({
            id: `${card.id}-ex-0`,
            text: card.examples[0],
            targetWord: card.word,
            hint: card.definition,
          });
        } else {
          dictationItems.push({
            id: `${card.id}-word`,
            text: card.word,
            targetWord: card.word,
            hint: card.definition,
          });
        }
      });
      setItems(dictationItems);
      setCurrentIndex(0);
      setUserInput('');
      setIsChecked(false);
      setShowHint(false);
      setScore({ correct: 0, total: 0 });
    }
  }, [activeDeck]);

  const currentItem = items[currentIndex];

  // Auto-play audio on new card
  useEffect(() => {
    if (currentItem) {
      handlePlayAudio();
    }
  }, [currentIndex, items]);

  const handlePlayAudio = (speedOverride) => {
    if (!currentItem) return;
    const speed = speedOverride !== undefined ? speedOverride : playbackSpeed;
    speakText(currentItem.text, { lang: speechVoice, rate: speed });
  };

  const cleanWord = (w) => w.toLowerCase().replace(/[^a-z0-9]/gi, '');

  const evaluateAnswer = () => {
    if (!currentItem || !userInput.trim()) return;

    const targetWords = currentItem.text.split(/\s+/);
    const userWords = userInput.trim().split(/\s+/);

    let matchCount = 0;
    targetWords.forEach((tw, idx) => {
      if (userWords[idx] && cleanWord(tw) === cleanWord(userWords[idx])) {
        matchCount++;
      }
    });

    const isFullMatch = matchCount === targetWords.length;
    if (isFullMatch) {
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    } else {
      setScore(prev => ({ ...prev, total: prev.total + 1 }));
    }

    setIsChecked(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setIsChecked(false);
      setShowHint(false);
    } else {
      // Completed round
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      setIsChecked(true);
    }
  };

  if (!activeDeck || !items.length) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <Headphones className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">No Dictation Sentences Found</h3>
        <p className="text-sm text-slate-400 mb-6">Select another deck with example sentences.</p>
        <button
          onClick={onBackToDecks}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition"
        >
          Back to Decks
        </button>
      </div>
    );
  }

  // Word-by-word diff calculation for feedback
  const targetWords = currentItem.text.split(/\s+/);
  const userWords = userInput.trim().split(/\s+/);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBackToDecks}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Decks</span>
        </button>

        <select
          value={activeDeck.id}
          onChange={(e) => setActiveDeckId(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none max-w-[200px] truncate"
        >
          {decks.map(d => (
            <option key={d.id} value={d.id}>{d.title}</option>
          ))}
        </select>

        <span className="text-xs font-semibold text-violet-400 bg-violet-950/50 px-3 py-1 rounded-full border border-violet-800/50">
          Sentence {currentIndex + 1} of {items.length}
        </span>
      </div>

      {/* Main Dictation Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        {/* Audio Player Controls */}
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePlayAudio(0.7)}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex flex-col items-center gap-1 group"
              title="Play 0.7x Slow Speed"
            >
              <Gauge className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
              <span className="text-[10px] font-bold">0.7x Slow</span>
            </button>

            <button
              onClick={() => handlePlayAudio()}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
              title="Play Audio"
            >
              <Volume2 className="w-9 h-9" />
            </button>

            <button
              onClick={() => handlePlayAudio(1.0)}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex flex-col items-center gap-1 group"
              title="Play 1.0x Normal Speed"
            >
              <RotateCcw className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition" />
              <span className="text-[10px] font-bold">1.0x Normal</span>
            </button>
          </div>
          <span className="text-xs text-slate-400">
            Listen carefully and type what you hear below
          </span>
        </div>

        {/* Input box */}
        <div className="space-y-2">
          <textarea
            rows={3}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isChecked}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isChecked) evaluateAnswer();
              }
            }}
            placeholder="Type the sentence you heard here..."
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700 focus:border-violet-500 text-white placeholder-slate-500 text-sm sm:text-base outline-none resize-none transition"
          />
        </div>

        {/* Diff Feedback Display */}
        {isChecked && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-fade-in">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Word-by-Word Evaluation
            </h4>
            <div className="flex flex-wrap gap-2 text-sm sm:text-base">
              {targetWords.map((tw, idx) => {
                const uw = userWords[idx];
                const isMatch = uw && cleanWord(tw) === cleanWord(uw);
                return (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded-lg font-mono font-medium ${
                      isMatch
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-800/80 line-through'
                    }`}
                  >
                    {isMatch ? tw : (uw || '___')}
                  </span>
                );
              })}
            </div>

            <div className="pt-2 text-xs text-slate-300 border-t border-slate-800/60">
              <span className="text-slate-400">Target sentence: </span>
              <strong className="text-white">{currentItem.text}</strong>
            </div>
          </div>
        )}

        {/* Hint toggle */}
        <div className="flex items-center justify-between text-xs pt-1">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? 'Hide Hint' : 'Show Meaning Hint'}</span>
          </button>

          {showHint && currentItem.hint && (
            <span className="text-indigo-300 italic max-w-sm truncate text-right">
              "{currentItem.hint}"
            </span>
          )}
        </div>

        {/* Action button */}
        <div className="pt-2">
          {!isChecked ? (
            <button
              onClick={evaluateAnswer}
              disabled={!userInput.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Check Answer (Enter)
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <span>{currentIndex + 1 < items.length ? 'Next Sentence' : 'Finish Dictation Session'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
