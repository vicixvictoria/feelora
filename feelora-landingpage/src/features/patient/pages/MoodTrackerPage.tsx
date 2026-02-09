import { useState } from "react";
import { ArrowRight } from "lucide-react";
import feeloraLogo from "@/assets/logo.png";

interface MoodOption {
  emoji: string;
  label: string;
}

interface MoodCategory {
  question: string;
  options: MoodOption[];
}

const moodCategories: MoodCategory[] = [
  {
    question: "Wie fühlst du dich heute?",
    options: [
      { emoji: "😊", label: "Glücklich" },
      { emoji: "😌", label: "Zufrieden" },
      { emoji: "😐", label: "Neutral" },
      { emoji: "😢", label: "Traurig" },
      { emoji: "😰", label: "Ängstlich" },
      { emoji: "😤", label: "Gestresst" },
      { emoji: "😴", label: "Müde" },
      { emoji: "😠", label: "Wütend" },
      { emoji: "😕", label: "Verwirrt" },
      { emoji: "🥰", label: "Verliebt" },
    ],
  },
  {
    question: "Hast du genug geschlafen?",
    options: [
      { emoji: "😊", label: "Ausgeschlafen" },
      { emoji: "😴", label: "Etwas müde" },
      { emoji: "💤", label: "Unruhig geschlafen" },
      { emoji: "😩", label: "Kaum geschlafen" },
      { emoji: "😵", label: "Zu viel geschlafen" },
    ],
  },
  {
    question: "Hast du gegessen?",
    options: [
      { emoji: "🍽️", label: "Regelmäßig gegessen" },
      { emoji: "🥗", label: "Etwas Kleines gegessen" },
      { emoji: "🍿", label: "Nur gesnackt" },
      { emoji: "❌", label: "Mahlzeit ausgelassen" },
      { emoji: "🤢", label: "Zu viel gegessen, fühle mich unwohl" },
    ],
  },
  {
    question: "Hast du dich bewegt / warst du draußen?",
    options: [
      { emoji: "🌳", label: "Viel bewegt & draußen gewesen" },
      { emoji: "🚶", label: "Kurz draußen gewesen" },
      { emoji: "🏠", label: "Drinnen geblieben" },
      { emoji: "💪", label: "Sport gemacht" },
      { emoji: "🧘", label: "Leichte Bewegung / Stretching" },
      { emoji: "💤", label: "Keine Bewegung" },
    ],
  },
  {
    question: "Wie fühlst du dich körperlich?",
    options: [
      { emoji: "💚", label: "Energetisch" },
      { emoji: "😌", label: "Entspannt" },
      { emoji: "😩", label: "Erschöpft" },
      { emoji: "😣", label: "Schmerzen" },
      { emoji: "🤒", label: "Krank" },
      { emoji: "😫", label: "Schwach" },
    ],
  },
  {
    question: "Stresslevel",
    options: [
      { emoji: "😌", label: "Entspannt" },
      { emoji: "😐", label: "Etwas angespannt" },
      { emoji: "😤", label: "Gestresst" },
      { emoji: "🤯", label: "Überfordert" },
    ],
  },
  {
    question: "Fokus & Produktivität",
    options: [
      { emoji: "🎯", label: "Sehr fokussiert" },
      { emoji: "😊", label: "Produktiv" },
      { emoji: "😐", label: "Abgelenkt" },
      { emoji: "😞", label: "Unmotiviert" },
    ],
  },
  {
    question: "Soziale Verbindung heute",
    options: [
      { emoji: "❤️", label: "Zeit mit anderen verbracht" },
      { emoji: "💬", label: "Mit jemandem gesprochen" },
      { emoji: "😔", label: "Einsam gefühlt" },
      { emoji: "🚫", label: "Allein sein wollen" },
    ],
  },
  {
    question: "Selbstfürsorge",
    options: [
      { emoji: "💚", label: "Etwas für mich getan" },
      { emoji: "🎨", label: "Etwas Schönes gemacht" },
      { emoji: "🧘", label: "Entspannt / meditiert" },
      { emoji: "🚫", label: "Keine Selbstfürsorge" },
    ],
  },
  {
    question: "Dankbarkeit / Highlight des Tages",
    options: [
      { emoji: "🌟", label: "Etwas Gutes ist passiert" },
      { emoji: "❤️", label: "Dankbar" },
      { emoji: "😔", label: "Schwieriger Tag" },
      { emoji: "❌", label: "Nichts Positives heute" },
    ],
  },
];

const MoodTrackerPage = () => {
  const [selectedMoods, setSelectedMoods] = useState<Record<number, string[]>>({});

  const toggleMood = (categoryIndex: number, label: string) => {
    setSelectedMoods((prev) => {
      const current = prev[categoryIndex] || [];
      if (current.includes(label)) {
        return { ...prev, [categoryIndex]: current.filter((l) => l !== label) };
      }
      return { ...prev, [categoryIndex]: [...current, label] };
    });
  };

  const isMoodSelected = (categoryIndex: number, label: string) => {
    return selectedMoods[categoryIndex]?.includes(label) || false;
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <img src={feeloraLogo} alt="Feelora" className="w-12 h-12" />
        <h1 className="text-2xl font-bold text-foreground">Track your Mood</h1>
      </div>

      <hr className="border-border mb-6" />

      {/* Greeting Message */}
      <div className="flex items-start gap-3 mb-8">
        <img src={feeloraLogo} alt="Feelora" className="w-10 h-10" />
        <div className="bg-tertiary rounded-2xl rounded-bl-sm px-4 py-3 max-w-md">
          <p className="text-foreground">
            Hey Nina! Möchtest du mir etwas über deine aktuelle Stimmung erzählen? 
            Wie fühlst du dich heute?
          </p>
        </div>
      </div>

      {/* Mood Categories */}
      <div className="space-y-8">
        {moodCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="feelora-card">
            <h3 className="font-semibold text-foreground mb-4">
              {category.question}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  onClick={() => toggleMood(categoryIndex, option.label)}
                  className={`mood-chip ${
                    isMoodSelected(categoryIndex, option.label) ? "mood-chip-selected" : ""
                  }`}
                >
                  <span className="text-lg">{option.emoji}</span>
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-8">
        <button className="feelora-btn-primary px-8">
          Nächste
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MoodTrackerPage;
