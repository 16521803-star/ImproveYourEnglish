import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  Flame, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Award, 
  TrendingUp,
  BookOpen
} from 'lucide-react';

export default function StatsView() {
  const { decks, stats } = useApp();

  const totalCards = decks.reduce((acc, d) => acc + (d.cards?.length || 0), 0);
  const masteredCards = decks.reduce(
    (acc, d) => acc + (d.cards?.filter(c => c.srs?.state === 'mastered').length || 0),
    0
  );
  const learningCards = totalCards - masteredCards;
  const masteryPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Learning Analytics</h1>
          <p className="text-xs text-slate-400">Track your spaced repetition retention and English study habits</p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Study Streak</span>
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.streakDays} <span className="text-xs font-normal text-slate-400">days</span>
          </p>
        </div>

        {/* Mastered Words */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Mastered Words</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {masteredCards} <span className="text-xs font-normal text-slate-400">/ {totalCards}</span>
          </p>
        </div>

        {/* Reviews Today */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Reviews Today</span>
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.reviewsToday} <span className="text-xs font-normal text-slate-400">cards</span>
          </p>
        </div>

        {/* All-time Reviews */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Repetitions</span>
            <TrendingUp className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.totalReviews}
          </p>
        </div>
      </div>

      {/* Progress Breakdown */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Overall Retention & Mastery</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-300 font-medium">
            <span>Fluency Mastery Progress</span>
            <span className="text-emerald-400 font-bold">{masteryPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${masteryPercentage}%` }}
              title={`Mastered: ${masteredCards} words`}
            />
            <div 
              className="bg-indigo-500 h-full transition-all duration-500" 
              style={{ width: `${100 - masteryPercentage}%` }}
              title={`In Progress: ${learningCards} words`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Mastered ({masteredCards})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Currently Learning ({learningCards})
            </span>
          </div>
        </div>
      </div>

      {/* Decks Performance Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Deck Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              <tr>
                <th className="py-2.5">Deck Name</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5 text-center">Words</th>
                <th className="py-2.5 text-center">Mastered</th>
                <th className="py-2.5 text-right">Mastery Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {decks.map(deck => {
                const total = deck.cards?.length || 0;
                const mastered = deck.cards?.filter(c => c.srs?.state === 'mastered').length || 0;
                const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
                return (
                  <tr key={deck.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 font-semibold text-white">{deck.title}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                        {deck.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 text-center">{total}</td>
                    <td className="py-3 text-center text-emerald-400 font-semibold">{mastered}</td>
                    <td className="py-3 text-right font-bold text-indigo-400">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
