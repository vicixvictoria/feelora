import { Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Steps ---
interface SummaryStepProps {
  onNext: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
  // All collected data from previous steps stored in a single object for easy access
  data: {
    personalData: Record<string, string>;
    contactInfo: Record<string, string>;
    qualifications: Record<string, string>;
    experience: string[];
    specialties: { selected: string[]; other: string };
    languages: { selected: string[]; other: string[] };
    therapySchool: { selected: string[]; other: string };
    therapyMethods: string;
    therapySetting: string[];
    therapyFormat: string[];
    therapyDuration: string;
    sessionFrequency: string[];
    patientGender: string[];
    valuesPreferences: { selected: string[]; other: string };
    additionalInfo: string;
    availability: string[];
  };
}

// Define a type for each section in the summary
interface SummarySection {
  step: number;
  title: string;
  content: React.ReactNode;
}

// Step Component for final summary and review of all answers before submission           
const Step18_TSummary = ({ onNext, onBack, onEdit, data }: SummaryStepProps) => {
  const formatArray = (arr: string[] | undefined, fallback = "—") => {
    if (!arr || arr.length === 0) return fallback;
    return arr.join(", ");
  };
  
  const formatArrayWithOther = (selected: string[] | undefined, other?: string | string[]) => {
    const items = selected || [];
    const otherItems = Array.isArray(other) ? other : other ? [other] : [];
    const combined = [...items, ...otherItems];
    return combined.length > 0 ? combined.join(", ") : "—";
  };

  const sections: SummarySection[] = [
    {
      step: 1,
      title: "Persönliche Daten",
      content: (
        <p className="text-foreground/80">
          {data.personalData?.firstName || "—"} {data.personalData?.lastName || ""}
          {data.personalData?.title && ` (${data.personalData.title})`}
          {data.personalData?.age && `, ${data.personalData.age} Jahre`}
          {data.personalData?.profession && `, ${data.personalData.profession}`}
        </p>
      ),
    },
    {
      step: 2,
      title: "Kontaktinformationen",
      content: (
        <>
          <p className="text-foreground/80">
            Mobil: {data.contactInfo?.phone || "—"}
            {" · "}Mail: {data.contactInfo?.email || "—"}
          </p>
          <p className="text-foreground/80">
            {data.contactInfo?.address || "—"}, {data.contactInfo?.postalCode || ""}{" "}
            {data.contactInfo?.city || ""}, {data.contactInfo?.country || "—"}
          </p>
        </>
      ),
    },
    {
      step: 3,
      title: "Titel und Qualifikationen",
      content: (
        <>
          <p className="text-foreground/80">
            Titel: {data.qualifications?.titlePrefix || "—"}
            {data.qualifications?.titleFromPrefix && ` (von ${data.qualifications.titleFromPrefix})`}
            {data.qualifications?.titleSuffix && `, ${data.qualifications.titleSuffix}`}
            {data.qualifications?.titleFromSuffix && ` (von ${data.qualifications.titleFromSuffix})`}
          </p>
          {data.qualifications?.qualifications && (
            <p className="text-foreground/80">Qualifikationen: {data.qualifications.qualifications}</p>
          )}
        </>
      ),
    },
    {
      step: 4,
      title: "Erfahrung seit",
      content: <p className="text-foreground/80">{formatArray(data.experience)}</p>,
    },
    {
      step: 5,
      title: "Fachgebiete",
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.specialties?.selected, data.specialties?.other)}
        </p>
      ),
    },
    {
      step: 6,
      title: "Sprachen",
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.languages?.selected, data.languages?.other)}
        </p>
      ),
    },
    {
      step: 7,
      title: "Therapieschule",
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.therapySchool?.selected, data.therapySchool?.other)}
        </p>
      ),
    },
    {
      step: 8,
      title: "Genaue Therapiemethode(n)",
      content: <p className="text-foreground/80">{data.therapyMethods || "—"}</p>,
    },
    {
      step: 9,
      title: "Bevorzugtes Therapie Setting Modus",
      content: <p className="text-foreground/80">{formatArray(data.therapySetting)}</p>,
    },
    {
      step: 10,
      title: "Bevorzugtes Therapie Setting Format",
      content: <p className="text-foreground/80">{formatArray(data.therapyFormat)}</p>,
    },
    {
      step: 11,
      title: "Therapiedauer",
      content: <p className="text-foreground/80">{data.therapyDuration || "—"}</p>,
    },
    {
      step: 12,
      title: "Sitzungsfrequenz",
      content: <p className="text-foreground/80">{formatArray(data.sessionFrequency)}</p>,
    },
    {
      step: 13,
      title: "Patient:Innen Geschlecht",
      content: <p className="text-foreground/80">{formatArray(data.patientGender)}</p>,
    },
    {
      step: 14,
      title: "Werte und Präferenzen",
      content: (
        <p className="text-foreground/80">
          {formatArrayWithOther(data.valuesPreferences?.selected, data.valuesPreferences?.other)}
        </p>
      ),
    },
    {
      step: 15,
      title: "Zusätzliche Information",
      content: <p className="text-foreground/80">{data.additionalInfo || "—"}</p>,
    },
    {
      step: 16,
      title: "Verfügbarkeit",
      content: (
        <p className="text-foreground/80">
          {formatArray(data.availability?.map((d) => d.toUpperCase()))}
        </p>
      ),
    },
  ];
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">Zusammenfassung</h1>
        <p className="text-muted-foreground">
          Bitte überprüfe alle Daten und deine Antworten, bevor du den Screening-Fragebogen absendest.
        </p>
      </div>
      {/* Summary Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.step}
            className="feelora-card relative"
          >
            <button
              onClick={() => onEdit(section.step)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
              aria-label={`${section.title} bearbeiten`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold text-purple mb-2">{section.title}</h3>
            <div className="pr-10">{section.content}</div>
          </div>
        ))}
      </div>
      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack} className="feelora-btn-outline">
          ← zurück
        </Button>
        <Button onClick={onNext} className="feelora-btn-primary">
          Absenden
          <Check className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
export default Step18_TSummary;