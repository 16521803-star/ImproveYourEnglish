import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { speakText } from '../utils/speech';
import confetti from 'canvas-confetti';
import { 
  CheckSquare, 
  Volume2, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Trophy,
  RotateCcw
} from 'lucide-react';

export default function QuizStudy({ onBackToDecks }) {
  const { activeDeck, speechVoice, speechSpeed, decks, setActiveDeckId } = useApp();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (activeDeck && activeDeck.cards?.length >= 2) {
      const generated = activeDeck.cards.map(card => {
        // Pick an example sentence or create one
        let sentence = card.examples?.[0] || `The term ${card.word} refers to: ${card.definition}`;
        // Replace target word with blank
        const regex = new RegExp(`\\b${card.word}\\b`, 'gi');
        const maskedSentence = sentence.replace(regex, '__________');

        // Pick 3 distractors from other cards
        const otherCards = activeDeck.cards.filter(c => c.id !== card.id);
        const shuffledOthers = [...otherCards].sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [card.word, ...shuffledOthers.map(c => c.word)].sort(() => 0.5 - Math.random());

        return {
          id: card.id,
          maskedSentence: maskedSentence.includes('__________') ? maskedSentence : `Choose the word for: "${card.definition}"`,
          correctAnswer: card.word,
          fullSentence: sentence,
          definition: card.definition,
          options,
        };
      });

      setQuestions(generated);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setIsFinished(false);
    }
  }, [activeDeck]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option.toLowerCase() === currentQ.correctAnswer.toLowerCase();
    if (isCorrect) {
      setScore(prev => prev + 1);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (!activeDeck || !questions.length) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <CheckSquare className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Need More Cards for Quiz</h3>
        <p className="text-sm text-slate-400 mb-6">A deck needs at least 2 cards to generate multiple-choice quizzes.</p>
        <button
          onClick={onBackToDecks}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition"
        >
          Back to Decks
        </button>
      </div>
    );
  }

  if (isFinished) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-md mx-auto text-center py-12 px-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-1">Quiz Completed!</h2>
        <p className="text-sm text-slate-400 mb-6">
          You scored <strong className="text-emerald-400">{score}</strong> out of <strong>{questions.length}</strong> ({accuracy}%)
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleRestart}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
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

        <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-800/50">
          Question {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Fill in the blank
          </span>
          <p className="text-base sm:text-xl font-medium text-slate-100 leading-relaxed">
            {currentQ.maskedSentence}
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt.toLowerCase() === currentQ.correctAnswer.toLowerCase();

            let btnStyle = 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-900';
            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-950/80 border-emerald-600 text-emerald-300 font-bold';
              } else if (isSelected && !isCorrect) {
                btnStyle = 'bg-rose-950/80 border-rose-600 text-rose-300';
              } else {
                btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswered}
                className={`p-4 rounded-2xl border text-left font-semibold text-sm sm:text-base flex items-center justify-between transition ${btnStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Post-answer Explanation Box */}
        {isAnswered && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Meaning of "{currentQ.correctAnswer}":</span>
              <button
                onClick={() => speakText(currentQ.correctAnswer, { lang: speechVoice, rate: speechSpeed })}
                className="p-1 text-slate-400 hover:text-indigo-400"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentQ.definition}
            </p>
          </div>
        )}

        {/* Next Button */}
        {isAnswered && (
          <div className="pt-2 animate-fade-in">
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
