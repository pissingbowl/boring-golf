import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useVibe, VIBE_OPTIONS, type VibeName, type VibeColors } from "../../lib/vibe-provider";

interface SwatchProps {
  colors: VibeColors;
}

function VibeSwatch({ colors }: SwatchProps) {
  return (
    <div className="bg-vibe-swatch-multi">
      <span style={{ background: colors.primary }} />
      <span style={{ background: colors.accent }} />
      <span style={{ background: colors.secondary }} />
    </div>
  );
}

export function VibeSwitcher() {
  const { vibe, setVibe, vibeColors } = useVibe();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleVibeSelect = (vibeId: VibeName) => {
    setVibe(vibeId);
    setIsOpen(false);
  };

  const categories = ["Classic American", "International", "Resort Vibes"] as const;

  return (
    <div
      ref={containerRef}
      className={`bg-vibe-switcher ${isOpen ? "open" : ""}`}
      data-testid="vibe-switcher"
    >
      <button
        className="bg-vibe-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-vibe-toggle"
      >
        <VibeSwatch colors={vibeColors} />
        <span>Vibe</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      <div className="bg-vibe-dropdown">
        {categories.map((category) => (
          <div key={category}>
            <div className="bg-vibe-category">{category}</div>
            {VIBE_OPTIONS.filter((opt) => opt.category === category).map((option) => (
              <div
                key={option.id}
                className={`bg-vibe-option ${vibe === option.id ? "active" : ""}`}
                onClick={() => handleVibeSelect(option.id)}
                data-testid={`vibe-option-${option.id}`}
              >
                <VibeSwatch colors={option.colors} />
                <span className="bg-vibe-name">{option.name}</span>
                {vibe === option.id && (
                  <Check className="w-4 h-4 ml-auto" style={{ color: "var(--bg-accent)" }} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
