const CATEGORIES = [
    { name: "Gaming", emoji: "🎮" },
    { name: "Stocks", emoji: "📈" },
    { name: "Technology", emoji: "💻" },
    { name: "Politics", emoji: "🏛️" },
    { name: "Science", emoji: "🔬" },
    { name: "Business", emoji: "💼" },
    { name: "World", emoji: "🌍" },
    { name: "Sports", emoji: "⚽" },
  ];
  
  interface Props {
    selected: string[];
    onSelect: (interests: string[]) => void;
  }
  
  export default function InterestSelector({ selected, onSelect }: Props) {
    const toggle = (category: string) => {
      if (selected.includes(category)) {
        onSelect(selected.filter((c) => c !== category));
      } else {
        onSelect([...selected, category]);
      }
    };
  
    return (
      <div className="interest-selector">
        <h2>
          Pick your vibe
          <span>({selected.length} selected)</span>
        </h2>
        <div className="categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className={`category-pill ${selected.includes(cat.name) ? "active" : ""}`}
              onClick={() => toggle(cat.name)}
            >
              <span className="emoji">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    );
  }