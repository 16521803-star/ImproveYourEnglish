/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Quality ratings:
 * 1: Again (complete blackout)
 * 2: Hard (remembered with serious difficulty)
 * 3: Good (remembered with some effort / correct)
 * 4: Easy (perfect recall without hesitation)
 */

export function calculateSRS(card, quality) {
  let { repetitions = 0, interval = 0, easeFactor = 2.5 } = card.srs || {};

  // Quality: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
  if (quality < 3) {
    repetitions = 0;
    interval = 1; // 1 day or reset
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = quality === 4 ? 4 : 2;
    } else {
      interval = Math.round(interval * easeFactor);
      if (quality === 4) {
        interval = Math.round(interval * 1.3);
      }
    }
    repetitions += 1;
  }

  // Adjust ease factor
  // EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  const qMap = { 1: 1, 2: 2, 3: 4, 4: 5 };
  const q = qMap[quality] || 3;
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const now = new Date();
  const nextDueDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  let state = 'learning';
  if (repetitions >= 4 && interval >= 7) {
    state = 'mastered';
  } else if (repetitions === 0) {
    state = 'learning';
  }

  return {
    ...card,
    srs: {
      repetitions,
      interval,
      easeFactor,
      dueDate: nextDueDate.toISOString(),
      lastReviewed: now.toISOString(),
      state,
    },
  };
}

export function isCardDue(card) {
  if (!card.srs || !card.srs.dueDate) return true;
  return new Date(card.srs.dueDate) <= new Date();
}
