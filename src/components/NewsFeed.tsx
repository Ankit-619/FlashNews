interface Article {
  title: string;
  summary: string;
  category: string;
  url?: string;
  readTime?: number;
}

interface Props {
  articles: Article[];
  savedUrls: string[];
  onToggleSave: (article: Article) => void;
}

export default function NewsFeed({ articles, savedUrls, onToggleSave }: Props) {
  if (articles.length === 0) return null;

  return (
    <div className="news-feed">
      <h2>Latest for you</h2>
      {articles.map((article, index) => {
        const isSaved = article.url ? savedUrls.includes(article.url) : false;

        return (
          <div
            key={index}
            className="news-card"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="card-top-row">
              <span className="category-tag">{article.category}</span>
              <div className="card-meta">
                {article.readTime && (
                  <span className="read-time">⏱ {article.readTime} min</span>
                )}
                <button
                  className={`save-button ${isSaved ? "saved" : ""}`}
                  onClick={() => onToggleSave(article)}
                  aria-label={isSaved ? "Remove from saved" : "Save for later"}
                >
                  {isSaved ? "♥" : "♡"}
                </button>
              </div>
            </div>

            <h3>{article.title}</h3>
            <p>{article.summary}</p>

            {article.url && (
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                Read article
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}