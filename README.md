# ⚡ FlashNews

> AI-curated news, tailored to your interests.

FlashNews is a personalized news aggregator that fetches live headlines and uses Google Gemini to summarize, categorize, and estimate reading time for each article. Pick a topic, get a clean feed of AI-summarized stories — no clutter, no clickbait, no endless scrolling.

**[🔗 Live Demo](https://your-site.netlify.app)** · **[🐛 Report Bug](https://github.com/Ankit-619/FlashNews/issues)** · **[✨ Request Feature](https://github.com/Ankit-619/FlashNews/issues)**

---

## ✨ Features

- **AI-powered summaries** — Gemini 3.8 Flash condenses each article into a 2–3 sentence digest
- **Smart categorization** — articles auto-tagged across Gaming, Stocks, Technology, Politics, Science, Business, World, and Sports
- **Estimated reading time** — Gemini predicts how long the original article will take to read
- **Reactive video backgrounds** — each category has its own ambient background video
- **Save for later** — bookmark articles with a heart; persisted via localStorage
- **Beautiful, minimal UI** — cream-and-ink editorial design with a dynamic dark theme when a video is active
- **Audio feedback** — subtle Web Audio API sounds on interactions (no audio files needed)
- **Skeleton loaders** — smooth loading states while Gemini works its magic
- **Fully responsive** — looks great on desktop and mobile

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Vanilla CSS with CSS custom properties |
| **Backend** | Netlify Functions (serverless) |
| **AI** | Google Gemini 3.8 Flash via `@google/genai` |
| **News Source** | [NewsAPI.org](https://newsapi.org) |
| **Video Backgrounds** | Pixabay CDN |
| **Sounds** | Web Audio API (synthesized, no assets) |
| **Deployment** | Netlify (auto-deploy from GitHub) |

---

## 🏗 How It Works
User selects a topic
↓
Frontend → /api/get-news?interests=Gaming
↓
Netlify Function fetches raw articles from NewsAPI
↓
Articles sent to Gemini with a structured prompt
↓
Gemini returns: { title, summary, category, url, readTime }
↓
Frontend renders cards + fires confetti + plays success sound


**Key architectural decisions:**

- **Serverless backend** — API keys stay on the server, never exposed to the browser
- **Gemini for intelligence, NewsAPI for data** — split responsibilities to keep costs and latency low
- **Retry logic with model fallback** — automatic exponential backoff on 503s, with fallback to older Gemini models
- **Cached video URLs** — background videos served from Pixabay's CDN, keeping the repo under 1MB

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- A [Google AI Studio](https://aistudio.google.com) API key (free tier available)
- A [NewsAPI.org](https://newsapi.org) API key (free developer tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/Ankit-619/FlashNews.git
cd FlashNews

# Install dependencies
npm install

# Create your .env file
echo "GEMINI_API_KEY=your_key_here" > .env
echo "NEWSAPI_KEY=your_key_here" >> .env

# Start the dev server
npm run dev

Open http://localhost:5173 in your browser.

Environment Variables
Variable	Description
GEMINI_API_KEY	Google Gemini API key from Google AI Studio
NEWSAPI_KEY	NewsAPI key from newsapi.org
⚠️ Never commit your .env file. It's already excluded in .gitignore.

📦 Deployment
This project is set up for one-click deployment on Netlify:

Push your code to GitHub

Connect the repo on Netlify

Add GEMINI_API_KEY and NEWSAPI_KEY under Site configuration → Environment variables

Deploy — Netlify auto-builds on every push to main

💡 What I Learned Building This
Structuring prompts for LLMs — getting reliable JSON output requires explicit instructions and defensive parsing

Handling AI rate limits — 503s and 429s are inevitable; exponential backoff with model fallback keeps the UX smooth

Serverless architecture — keeping secrets safe by moving all API calls behind Netlify Functions

Progressive enhancement — features like sounds and video backgrounds degrade gracefully when unsupported

Asset strategy — moving large video files to a CDN keeps the repo lean and deploys fast

📄 License
MIT — free to use, modify, and learn from.

👤 Author
Ankit Ojha

GitHub: @Ankit-619

LinkedIn: [https://www.linkedin.com/in/ankit-ojha-286a90287/]

⭐ If you found this project useful or interesting, consider giving it a star!
