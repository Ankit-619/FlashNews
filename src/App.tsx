import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import InterestSelector from "./components/InterestSelector";
import NewsFeed from "./components/NewsFeed";
import SkeletonCard from "./components/SkeletonCard";
import CategoryVideo from "./components/CategoryVideo";
import { CATEGORY_VIDEOS } from "./data/categoryVideos";
import { sounds } from "./utils/sounds";
import "./App.css";

interface Article {
  title: string;
  summary: string;
  category: string;
  url?: string;
  readTime?: number;
}

const SAVED_KEY = "flashnews:saved";
const HOME = "Home";

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
  const [videoCategory, setVideoCategory] = useState<string>(HOME);
  const prevSelectedRef = useRef<string[]>([]);

  // Persist saved articles to localStorage
  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedArticles));
  }, [savedArticles]);

  // Update video background when selection changes
  useEffect(() => {
    const prev = prevSelectedRef.current;
    const added = selectedInterests.find((c) => !prev.includes(c));

    if (added) {
      setVideoCategory(added);
    } else if (selectedInterests.length === 0) {
      setVideoCategory(HOME);
    } else {
      setVideoCategory(selectedInterests[selectedInterests.length - 1]);
    }

    prevSelectedRef.current = selectedInterests;
  }, [selectedInterests]);

  // Entrance sound — plays on first user interaction (browser requirement)
  useEffect(() => {
    let played = false;

    const handler = () => {
      if (played) return;
      played = true;
      sounds.enter();
      document.removeEventListener("click", handler);
      document.removeEventListener("keydown", handler);
      document.removeEventListener("touchstart", handler);
    };

    document.addEventListener("click", handler);
    document.addEventListener("keydown", handler);
    document.addEventListener("touchstart", handler);

    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("keydown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  // Button sound delegation — every button plays a contextual sound
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("button");
      if (!target) return;

      if (target.classList.contains("category-pill")) {
        sounds.select();
      } else if (target.classList.contains("fetch-button")) {
        sounds.primary();
      } else if (target.classList.contains("save-button")) {
        sounds.pop();
      } else if (target.classList.contains("saved-toggle")) {
        sounds.click();
      } else {
        sounds.click();
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const fireConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.35 },
      colors: ["#FFFFFF", "#FA5D29", "#E4E4E4"],
      scalar: 0.8,
      gravity: 1.1,
      ticks: 160,
    });
  };

  const toggleSave = (article: Article) => {
    if (!article.url) return;
    const isSaved = savedArticles.some((a) => a.url === article.url);
    if (isSaved) {
      setSavedArticles(savedArticles.filter((a) => a.url !== article.url));
    } else {
      setSavedArticles([...savedArticles, article]);
    }
  };

  const handleFetchNews = async () => {
    if (selectedInterests.length === 0) {
      setError("Please select a topic first.");
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
      sounds.success();
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
    <div className={`app ${videoCategory ? "has-video" : ""}`}>
      <CategoryVideo src={CATEGORY_VIDEOS[videoCategory] || null} />

      <header className="app-header">
        <div className="eyebrow">AI-curated · always fresh</div>
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
          <>Get My News</>
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
          <h2>Latest for you</h2>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && hasSearched && news.length === 0 && !error && !showSavedOnly && (
        <div className="empty-state">
          <span className="big-emoji">🫥</span>
          No articles found. Try a different topic.
        </div>
      )}

      {!loading && showSavedOnly && savedArticles.length === 0 && (
        <div className="empty-state">
          <span className="big-emoji">💔</span>
          Nothing saved yet. Tap the ♡ on any card to save it.
        </div>
      )}

      {!loading && (
        <NewsFeed
          articles={displayArticles}
          savedUrls={savedUrls}
          onToggleSave={toggleSave}
        />
      )}
    </div>
  );
}

export default App;