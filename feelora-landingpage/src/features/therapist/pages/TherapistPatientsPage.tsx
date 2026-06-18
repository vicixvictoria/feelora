import { ChevronRight, Search, Send, Check, ChevronLeft } from 'lucide-react';
import avatar from '@/assets/avatar-Placeholder.png';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface Patient {
  name: string;
  avatar: string;
}

interface NewPatient {
  name: string;
  avatar: string;
  age: number;
  city: string;
  role: string;
  therapy: string;
  request: string;
}

const existingPatients: Patient[] = [
  { name: 'Nina Netwon', avatar: avatar },
  { name: 'Tom Turbo', avatar: avatar },
  { name: 'Jon Doe', avatar: avatar },
  { name: 'Nina Netwon', avatar: avatar },
  { name: 'Nina Netwon', avatar: avatar },
  { name: 'Nina Netwon', avatar: avatar },
  { name: 'Nina Netwon', avatar: avatar },
  { name: 'Nina Netwon', avatar: avatar },
];

const newPatients: NewPatient[] = [
  {
    name: 'Mel Mandela',
    avatar: avatar,
    age: 20,
    city: 'Milano',
    role: 'Patient',
    therapy: 'Depression',
    request: 'Online Therapy',
  },
  {
    name: 'Tina Tesla',
    avatar: avatar,
    age: 23,
    city: 'Wien',
    role: 'Patient',
    therapy: 'Depression',
    request: 'Online Therapy',
  },
];

const PatientsPage = () => {
  const { t } = useTranslation();
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in relative">
      {/* Coming Soon Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 z-30 bg-background/80 backdrop-blur-sm rounded-2xl">
          <div className="sticky top-0 h-screen flex flex-col items-center justify-start pt-[25vh] px-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                {t('app.therapist.patients.comingSoon')}
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {t('app.therapist.patients.comingSoonTitle')}
              </p>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xs">
                {t('app.therapist.patients.comingSoonDesc')}
              </p>
              <button
                onClick={() => setShowOverlay(false)}
                className="mt-2 feelora-btn-outline"
              >
                {t('app.therapist.patients.revealPreview')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Patients */}
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('app.therapist.patients.title')}
      </h1>

      <div className="feelora-card mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {existingPatients.map((patient, index) => (
            <div
              key={index}
              className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-background cursor-pointer hover:shadow-sm transition-shadow"
            >
              <img
                src={patient.avatar}
                alt={patient.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <p className="font-medium text-foreground flex-1">{patient.name}</p>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      {/* New Patients */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {t('app.therapist.patients.newPatients')}
        </h2>
        <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
          new
        </span>
      </div>

      <div className="relative">
        <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-8 h-8 rounded-full bg-background border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-8 h-8 rounded-full bg-background border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {newPatients.map((patient, index) => (
            <div key={index} className="feelora-card relative">
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full z-20">
                new
              </span>

              <div className="flex gap-4 mb-4">
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex flex-col justify-center">
                  <p className="font-bold text-primary text-lg">{patient.name}</p>
                  <p className="text-sm text-foreground">
                    {t('app.therapist.patients.age')} {patient.age}
                  </p>
                  <p className="text-sm text-foreground">
                    {t('app.therapist.patients.city')} {patient.city}
                  </p>
                  <p className="text-sm text-foreground">
                    {t('app.therapist.patients.role')} {patient.role}
                  </p>
                  <p className="text-sm text-foreground">
                    {t('app.therapist.patients.therapy')} {patient.therapy}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {t('app.therapist.patients.request')} {patient.request}
              </p>

              <div className="flex flex-wrap gap-3">
                <button className="feelora-btn-primary text-sm">
                  {t('app.therapist.patients.profile')}
                  <Search className="w-4 h-4" />
                </button>
                <button className="feelora-btn-primary text-sm">
                  {t('app.therapist.patients.message')}
                  <Send className="w-4 h-4" />
                </button>
                <button className="border border-destructive text-destructive px-4 py-2 rounded-full font-medium hover:bg-destructive/10 transition-all duration-200 flex items-center gap-2 text-sm">
                  {t('app.therapist.patients.initialSession')}
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;
