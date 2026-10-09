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
  const handleClick = (category: string) => {
    const isSelected = selected.includes(category);

    if (isSelected) {
      // Clicking the selected pill deselects it
      onSelect([]);
    } else {
      // Selecting a new pill replaces whatever was selected before
      onSelect([category]);
    }
  };

  return (
    <div className="interest-selector">
      <h2>
        {selected.length === 0 ? "Pick a topic" : `Topic: ${selected[0]}`}
      </h2>
      <div className="categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            className={`category-pill ${selected.includes(cat.name) ? "active" : ""}`}
            onClick={() => handleClick(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}