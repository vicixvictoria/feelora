import { ExternalLink } from "lucide-react";
import therapistAvatar from "@/assets/avatar-Placeholder.png";

const TherapistProfilePage = () => {
  return (
    <div className="max-w-4xl animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">Dein Profil</h1>

      <div className="feelora-card">
        <div className="flex gap-8 mb-6">
          <img
            src={therapistAvatar}
            alt="Dr. Eva Eddison"
            className="w-40 h-40 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-primary mb-1">
              Dr. Eva Eddison
            </h2>
            <div className="space-y-0.5 text-foreground">
              <p>Alter: 38</p>
              <p>Stadt: Wien</p>
              <p>Rolle: Therapeutin</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-foreground">
          <div>
            <p><span className="font-semibold">Spezalisiert in:</span> Depression, Angststörungen</p>
            <p><span className="font-semibold">Methodik:</span> Verhaltenstherapie</p>
            <p><span className="font-semibold">Sprachen:</span> Deutsch, English, Kroatisch</p>
          </div>

          <div>
            <p className="text-muted-foreground">Information: studied at MUW</p>
            <p className="text-muted-foreground">Titel: Dr. Med</p>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="font-semibold">Verfügbarkeit</p>
              <p>Mon: 13:00-18:00, Tue: 09:00-12:00, Fri: 09:00-18:00</p>
            </div>
            <button className="feelora-btn-primary">
              Bearbeiten
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistProfilePage;
