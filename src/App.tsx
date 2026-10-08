import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import InterestSelector from "./components/InterestSelector";
import NewsFeed from "./components/NewsFeed";
import SkeletonCard from "./components/SkeletonCard";
import "./App.css";

interface Article {
  title: string;
  summary: string;
  category: string;
  url?: string;
  readTime?: number;
}

const SAVED_KEY = "flashnews:saved";

function App() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [savedArticles, setSavedArticles] = useState<Article[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedArticles));
  }, [savedArticles]);

  const playPopSound = () => {
    try {
      const ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio not supported or blocked — silently skip
    }
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.35 },
      colors: ["#a855f7", "#ec4899", "#06b6d4", "#f97316"],
      scalar: 0.9,
      gravity: 1.1,
      ticks: 180,
    });
  };

  const toggleSave = (article: Article) => {
    if (!article.url) return;
    const isSaved = savedArticles.some((a) => a.url === article.url);
    if (isSaved) {
      setSavedArticles(savedArticles.filter((a) => a.url !== article.url));
    } else {
      setSavedArticles([...savedArticles, article]);
      playPopSound();
    }
  };

  const handleFetchNews = async () => {
    if (selectedInterests.length === 0) {
      setError("Please select at least one interest.");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setNews([]);

    try {
      const response = await fetch(
        `/api/get-news?interests=${selectedInterests.join(",")}`
      );
      if (!response.ok) throw new Error("Failed to fetch news");
      const data = await response.json();
      setNews(data.articles || []);
      fireConfetti();
    } catch (err) {
      setError(
        `Something went wrong: ${err instanceof Error ? err.message : String(err)}`
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const savedUrls = savedArticles
    .map((a) => a.url)
    .filter((u): u is string => !!u);

  const displayArticles = showSavedOnly ? savedArticles : news;

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand-badge">AI-curated · always fresh</div>
        <h1>FlashNews</h1>
        <p>Your feed, your vibe. Pick what you're into, get the highlights.</p>
      </header>

      <InterestSelector
        selected={selectedInterests}
        onSelect={setSelectedInterests}
      />

      <button
        className="fetch-button"
        onClick={handleFetchNews}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" /> Brewing your feed…
          </>
        ) : (
          <>✨ Get My News</>
        )}
      </button>

      {savedArticles.length > 0 && (
        <div className="saved-toggle-row">
          <button
            className={`saved-toggle ${showSavedOnly ? "active" : ""}`}
            onClick={() => setShowSavedOnly(!showSavedOnly)}
          >
            {showSavedOnly
              ? `← Back to feed`
              : `♥ Saved (${savedArticles.length})`}
          </button>
        </div>
      )}

      {error && (
        <div className="error-state">
          <strong>Oops.</strong> {error}
        </div>
      )}

      {loading && (
        <div className="news-feed">
          <h2>Fresh for you</h2>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && hasSearched && news.length === 0 && !error && !showSavedOnly && (
        <div className="empty-state">
          <span className="big-emoji">🫥</span>
          No articles found. Try a different mix of interests.
        </div>
      )}

      {!loading && showSavedOnly && savedArticles.length === 0 && (
        <div className="empty-state">
          <span className="big-emoji">💔</span>
          Nothing saved yet. Tap the ♡ on any card to save it.
        </div>
      )}

      {!loading && <NewsFeed
        articles={displayArticles}
        savedUrls={savedUrls}
        onToggleSave={toggleSave}
      />}
    </div>
  );
}

export default App;