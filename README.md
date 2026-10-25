# ImproveYourEnglish ✨

> An AI-powered English learning platform inspired by **OpenQuiz.ai**, focused exclusively on English fluency, vocabulary expansion, listening dictation, speaking roleplay, and grammar mastery.

[![Deploy to GitHub Pages](https://github.com/16521803-star/ImproveYourEnglish/actions/workflows/deploy.yml/badge.svg)](https://github.com/16521803-star/ImproveYourEnglish/actions/workflows/deploy.yml)

---

## 🌟 Key Features

1. **AI Vocabulary & Deck Generator (Gemini)**
   - Generate study decks by topic (e.g. *Job Interview*, *Software Engineering*, *Ordering Coffee*, *IELTS Band 8.0+*).
   - Extract difficult words automatically from pasted reading texts and articles.
   - Includes **IPA phonetics**, **CEFR levels (A1–C2)**, **collocations**, **context sentences**, and **synonyms**.

2. **Spaced Repetition (SRS) Flashcards**
   - SM-2 scientific repetition algorithm (Again, Hard, Good, Easy).
   - 3D interactive flip cards with native **Text-to-Speech (TTS)** audio (US, UK, and Australian accents).

3. **Dictation & Listening Drill**
   - Listen to native audio at normal (1.0x) or slow (0.7x) speed and type what you hear.
   - Real-time word-by-word diff feedback highlighting missed or misspelled words.

4. **Fill-in-the-Blank Context Quiz**
   - Test words in authentic sentence contexts with instant definitions and explanations.

5. **AI Speaking & Roleplay Partner**
   - Simulated realistic scenarios: *Tech Job Interview*, *Specialty Cafe*, *IELTS Speaking Part 2 & 3*, and *Hotel Check-in*.
   - Microphone input with speech recognition + natural AI speech responses.
   - Real-time coaching card on every response: grammar accuracy score, native phrasing recommendations, and vocabulary tips.

6. **AI Grammar & Sentence Doctor**
   - Diagnoses any English sentence and provides 3 stylistic versions (*Casual*, *Professional*, *Academic Band 8.5+*) and vocabulary upgrades.

7. **Zero-Setup Gemini API Key Modal**
   - Enter your Gemini API key via the built-in popup modal.
   - Keys are stored strictly in your browser's `localStorage` and never transmitted to external servers.

---

## 🚀 Getting Started

### Local Development

```bash
# Clone the repository
git clone https://github.com/16521803-star/ImproveYourEnglish.git
cd ImproveYourEnglish

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🌐 Deploying to GitHub Pages

This repository includes a GitHub Actions workflow in `.github/workflows/deploy.yml`.

To enable GitHub Pages:
1. Push your commits to `main`.
2. Go to your repository on GitHub: **Settings** -> **Pages**.
3. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
4. The deployment workflow will trigger automatically and host your site at `https://16521803-star.github.io/ImproveYourEnglish/`.

---

## 🔑 Gemini API Key

You can get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
Once obtained, click the **Connect Gemini** button in the web app navigation to paste and test your key.
