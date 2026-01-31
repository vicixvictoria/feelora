import { ExternalLink, Search, Send } from "lucide-react";
import avatar from "@/assets/avatar-Placeholder.png";

const ProfilePage = () => {
  return (
    <div className="max-w-4xl animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">Dein Profil</h1>

      {/* User Profile Card */}
      <div className="feelora-card mb-10">
        <div className="flex gap-8">
          <img
            src={avatar}
            alt="Nina Newton"
            className="w-40 h-40 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Nina Newton
            </h2>
            <div className="space-y-1 text-foreground">
              <p>Alter: 23</p>
              <p>Stadt: Wien</p>
              <p className="mt-3">Rolle: Patient</p>
              <div className="flex items-center gap-4 mt-4">
                <p>Therapeuten Match: Dr. Eva Eddison</p>
              </div>
            </div>
          </div>
          <div className="self-center">
            <button className="feelora-btn-primary">
              Bearbeiten
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Therapist Section */}
      <h2 className="text-xl font-bold text-foreground mb-4">
        Dein/e zugewiesene/r Therapeut:in
      </h2>

      <div className="feelora-card">
        <div className="flex gap-8">
          <img
            src={avatar}
            alt="Dr. Eva Eddison"
            className="w-40 h-40 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-primary mb-2">
              Dr. Eva Eddison
            </h2>
            <div className="space-y-1 text-foreground">
              <p>Alter: 38</p>
              <p>Stadt: Wien</p>
              <p className="mt-3">Rolle: Therapeut</p>
              <p>Spezialisierung: Depression, Angststörung</p>
              <p className="mt-3">Verfügbarkeit: Mo, Di, Fr</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 self-start">
            <button className="feelora-btn-primary">
              Profil
              <Search className="w-4 h-4" />
            </button>
            <button className="feelora-btn-primary">
              Nachricht
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
