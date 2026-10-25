import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import DeckList from './components/DeckList';
import FlashcardStudy from './components/FlashcardStudy';
import DictationStudy from './components/DictationStudy';
import QuizStudy from './components/QuizStudy';
import SpeakingPartner from './components/SpeakingPartner';
import GrammarDoctor from './components/GrammarDoctor';
import StatsView from './components/StatsView';
import ApiKeyModal from './components/ApiKeyModal';
import CreateDeckModal from './components/CreateDeckModal';
import { Sparkles, Globe, Heart } from 'lucide-react';

function MainLayout() {
  const [activeTab, setActiveTab] = useState('decks');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { openApiKeyModal, apiKey } = useApp();

  const handleStartStudy = (mode, deckId) => {
    setActiveTab(mode);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <div>
        {/* Navigation Bar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* API Key Callout Banner if not set yet */}
        {!apiKey && (
          <div className="bg-gradient-to-r from-amber-950/60 via-indigo-950/60 to-violet-950/60 border-b border-indigo-900/40 py-2.5 px-4 text-center">
            <p className="text-xs text-slate-300 inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Want to unlock AI Vocabulary Generation, Speaking Coach & Grammar Doctor?
              </span>
              <button
                onClick={() => openApiKeyModal()}
                className="underline font-bold text-amber-300 hover:text-white transition ml-1"
              >
                Connect free Gemini Key
              </button>
            </p>
          </div>
        )}

        {/* Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {activeTab === 'decks' && (
            <DeckList
              onStartStudy={handleStartStudy}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardStudy onBackToDecks={() => setActiveTab('decks')} />
          )}

          {activeTab === 'dictation' && (
            <DictationStudy onBackToDecks={() => setActiveTab('decks')} />
          )}

          {activeTab === 'quiz' && (
            <QuizStudy onBackToDecks={() => setActiveTab('decks')} />
          )}

          {activeTab === 'speaking' && (
            <SpeakingPartner />
          )}

          {activeTab === 'grammar' && (
            <GrammarDoctor />
          )}

          {activeTab === 'stats' && (
            <StatsView />
          )}
        </main>
      </div>

      {/* Modals */}
      <ApiKeyModal />
      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">ImproveYourEnglish</span>
            <span>—</span>
            <span>Dedicated OpenQuiz AI for English Mastery</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/16521803-star/ImproveYourEnglish"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white flex items-center gap-1.5 transition"
            >
              <Globe className="w-4 h-4" />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
