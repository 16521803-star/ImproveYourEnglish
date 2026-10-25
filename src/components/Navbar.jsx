import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Layers, 
  Headphones, 
  CheckSquare, 
  MessageSquare, 
  Stethoscope, 
  Flame, 
  Key, 
  Volume2, 
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { apiKey, openApiKeyModal, stats, speechVoice, updateSpeechSettings, speechSpeed } = useApp();

  const navItems = [
    { id: 'decks', label: 'Decks', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'dictation', label: 'Dictation', icon: Headphones },
    { id: 'quiz', label: 'Practice Quiz', icon: CheckSquare },
    { id: 'speaking', label: 'AI Speaking', icon: MessageSquare, badge: 'AI' },
    { id: 'grammar', label: 'Grammar Doctor', icon: Stethoscope, badge: 'AI' },
    { id: 'stats', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('decks')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                  Improve<span className="text-indigo-400">Your</span>English
                </span>
                <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  OpenQuiz AI for English
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer"
              title="Daily Study Streak"
              onClick={() => setActiveTab('stats')}
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{stats.streakDays}d Streak</span>
            </div>

            {/* Voice Accent Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-2 py-1 text-xs text-slate-300">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={speechVoice}
                onChange={(e) => updateSpeechSettings(e.target.value, speechSpeed)}
                className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs"
                title="Select Pronunciation Accent"
              >
                <option value="en-US" className="bg-slate-900 text-white">🇺🇸 US</option>
                <option value="en-GB" className="bg-slate-900 text-white">🇬🇧 UK</option>
                <option value="en-AU" className="bg-slate-900 text-white">🇦🇺 AU</option>
              </select>
            </div>

            {/* API Key Modal Button */}
            <button
              onClick={() => openApiKeyModal()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                apiKey
                  ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/40'
                  : 'bg-amber-950/40 border-amber-600/50 text-amber-300 hover:bg-amber-900/40 animate-pulse'
              }`}
              title={apiKey ? 'Gemini API Key Connected' : 'Set your Gemini API Key to enable AI features'}
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {apiKey ? 'API Key Connected' : 'Connect Gemini'}
              </span>
              <span className="sm:hidden">
                {apiKey ? 'Key OK' : 'API Key'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto py-2.5 gap-1 border-t border-slate-800 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center min-w-[64px] px-2 py-1 rounded-lg text-[11px] font-medium transition ${
                  isActive
                    ? 'text-indigo-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
