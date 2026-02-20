import { useEffect, useState } from "react";
import { ExternalLink, Search, Send, Loader2 } from "lucide-react";
import avatar from "@/assets/avatar-Placeholder.png";
import { patientService } from "../api/patientService"; 
import { PatientProfile, MatchedTherapist } from "../types/profiles"; // Import your new types!

// Helper to convert Unix timestamp (in seconds) to Age
const calculateAge = (birthDateUnix: number | null | undefined) => {
  if (!birthDateUnix) return "Unbekannt";
  const birthDate = new Date(birthDateUnix * 1000);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const ProfilePage = () => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [therapist, setTherapist] = useState<MatchedTherapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Patient Profile
        const userProfile = await patientService.getProfile();
        setPatient(userProfile);

        // 2. If patient has matches, fetch the first matched therapist
        if (userProfile?.Matches && userProfile.Matches.length > 0) {
          const matchedTherapists = await patientService.getMatchedTherapists(userProfile.Matches);
          if (matchedTherapists && matchedTherapists.length > 0) {
            setTherapist(matchedTherapists[0]); // We display the primary match --> (maybe with score and not position in list)
          }
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Fehler beim Laden der Profildaten.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!patient) return null;

  return (
    <div className="max-w-4xl animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">Dein Profil</h1>

      {/* User Profile Card */}
      <div className="feelora-card mb-10">
        <div className="flex gap-8">
          <img
            src={avatar}
            alt={`${patient.Name} ${patient.Surname}`}
            className="w-40 h-40 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              {patient.Name} {patient.Surname}
            </h2>
            <div className="space-y-1 text-foreground">
              <p>Alter: {calculateAge(patient.BirthDate)}</p>
              <p>Stadt: {patient.City || "Nicht angegeben"}</p>
              <p className="mt-3">Rolle: Patient</p>
              <div className="flex items-center gap-4 mt-4">
                <p>Therapeuten Match: {therapist ? therapist.Name : "Noch kein Match"}</p>
              </div>
            </div>
          </div>
          <div className="self-center">
            <button className="feelora-btn-primary flex items-center gap-2">
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

      {therapist ? (
        <div className="feelora-card">
          <div className="flex gap-8">
            <img
              src={avatar}
              alt={therapist.Name || "Therapeut Profilbild"}
              className="w-40 h-40 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-primary mb-2">
               {therapist.Name} {therapist.Surname}
              </h2>
              <div className="space-y-1 text-foreground">
                <p>Alter: {calculateAge(therapist.BirthDate)}</p>
                <p>Stadt: {therapist.City || "Nicht angegeben"}</p>
                <p className="mt-3">Rolle: Therapeut</p>
                <p>Spezialisierung: {therapist?.Specialties?.join(", ") || "Keine Spezialisierung angegeben"}</p>
                <p className="mt-1">Verfügbarkeit: {therapist.Availability?.join(", ") || "Nicht angegeben"}</p>
                {therapist.Address && <p className="mt-3">Praxis: {therapist.Address || "keine Praxis angegeben"}</p>}
                {/* Note: Languages we need to add later */}
              </div>
            </div>
            <div className="flex flex-col gap-3 self-start">
              <button className="feelora-btn-primary flex items-center gap-2 justify-center">
                Profil
                <Search className="w-4 h-4" />
              </button>
              <button className="feelora-btn-primary flex items-center gap-2 justify-center">
                Nachricht
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="feelora-card p-6 text-center text-foreground">
          <p>Du hast aktuell noch keine/n zugewiesene/n Therapeut:in.</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;