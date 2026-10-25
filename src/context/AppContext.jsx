import React, { createContext, useContext, useState, useEffect } from 'react';
import { STARTER_DECKS } from '../data/starterDecks';
import { calculateSRS } from '../utils/srs';

const AppContext = createContext();

const STORAGE_KEY_API_KEY = 'lexiflow_gemini_api_key';
const STORAGE_KEY_DECKS = 'lexiflow_decks';
const STORAGE_KEY_STATS = 'lexiflow_stats';
const STORAGE_KEY_VOICE = 'lexiflow_speech_voice';
const STORAGE_KEY_SPEED = 'lexiflow_speech_speed';

export function AppProvider({ children }) {
  // API Key state
  const [apiKey, setApiKeyState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_API_KEY) || '';
  });

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [pendingApiAction, setPendingApiAction] = useState(null);

  // Decks state
  const [decks, setDecks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DECKS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load decks from localStorage:', e);
    }
    return STARTER_DECKS;
  });

  const [activeDeckId, setActiveDeckId] = useState(() => {
    return decks[0]?.id || 'deck-ielts-academic';
  });

  // User Stats & Daily Streak
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      reviewsToday: 0,
      totalReviews: 0,
      streakDays: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      masteredWordsCount: 0,
    };
  });

  // Audio Speech Settings
  const [speechVoice, setSpeechVoice] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_VOICE) || 'en-US';
  });
  const [speechSpeed, setSpeechSpeed] = useState(() => {
    return parseFloat(localStorage.getItem(STORAGE_KEY_SPEED) || '1.0');
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  }, [stats]);

  const setApiKey = (key) => {
    const trimmed = (key || '').trim();
    setApiKeyState(trimmed);
    localStorage.setItem(STORAGE_KEY_API_KEY, trimmed);

    // If there was an action waiting for the API key, trigger it
    if (trimmed && pendingApiAction) {
      pendingApiAction();
      setPendingApiAction(null);
    }
  };

  const openApiKeyModal = (onSuccessCallback = null) => {
    if (onSuccessCallback) {
      setPendingApiAction(() => onSuccessCallback);
    }
    setIsApiKeyModalOpen(true);
  };

  const closeApiKeyModal = () => {
    setIsApiKeyModalOpen(false);
    setPendingApiAction(null);
  };

  /**
   * Helper that checks if API key exists. If not, pops up modal!
   */
  const requireApiKey = (callback) => {
    if (!apiKey) {
      openApiKeyModal(callback);
      return false;
    }
    if (callback) callback();
    return true;
  };

  const updateCardSRS = (deckId, cardId, quality) => {
    setDecks(prevDecks => {
      return prevDecks.map(deck => {
        if (deck.id !== deckId) return deck;

        const updatedCards = deck.cards.map(card => {
          if (card.id !== cardId) return card;
          return calculateSRS(card, quality);
        });

        return { ...deck, cards: updatedCards };
      });
    });

    // Update study stats
    setStats(prev => {
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = prev.lastStudyDate !== today;
      return {
        ...prev,
        reviewsToday: isNewDay ? 1 : prev.reviewsToday + 1,
        totalReviews: prev.totalReviews + 1,
        lastStudyDate: today,
        streakDays: isNewDay ? prev.streakDays + 1 : prev.streakDays,
      };
    });
  };

  const addDeck = (newDeck) => {
    setDecks(prev => [newDeck, ...prev]);
    setActiveDeckId(newDeck.id);
  };

  const deleteDeck = (deckId) => {
    setDecks(prev => prev.filter(d => d.id !== deckId));
    if (activeDeckId === deckId) {
      const remaining = decks.filter(d => d.id !== deckId);
      if (remaining.length > 0) setActiveDeckId(remaining[0].id);
    }
  };

  const updateSpeechSettings = (voice, speed) => {
    setSpeechVoice(voice);
    setSpeechSpeed(speed);
    localStorage.setItem(STORAGE_KEY_VOICE, voice);
    localStorage.setItem(STORAGE_KEY_SPEED, speed.toString());
  };

  const activeDeck = decks.find(d => d.id === activeDeckId) || decks[0] || null;

  return (
    <AppContext.Provider
      value={{
        apiKey,
        setApiKey,
        isApiKeyModalOpen,
        openApiKeyModal,
        closeApiKeyModal,
        requireApiKey,
        decks,
        activeDeckId,
        setActiveDeckId,
        activeDeck,
        stats,
        updateCardSRS,
        addDeck,
        deleteDeck,
        speechVoice,
        speechSpeed,
        updateSpeechSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
