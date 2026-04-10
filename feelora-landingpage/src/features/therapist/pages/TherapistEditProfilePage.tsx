import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Loader2, Camera, ArrowLeft, Save } from 'lucide-react';
import avatarPlaceholder from '@/assets/avatar-Placeholder.png';
import { therapistService, GET_OWN_THERAPIST_PROFILE_QUERY } from '../api/therapist-service';
import { Checkbox } from '@/components/ui/checkbox';
import { useS3Upload } from '@/hooks/use-s3-upload';
import { useS3Download } from '@/hooks/use-s3-download';

// Helpers for Date conversions
const toDateString = (unixSeconds?: number | null) => {
  if (!unixSeconds) return '';
  const d = new Date(unixSeconds * 1000);
  return d.toISOString().split('T')[0];
};

const toUnixSeconds = (dateStr: string) => {
  if (!dateStr) return null;
  return new Date(dateStr).getTime() / 1000;
};

const TherapistEditProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing profile data
  const { data, loading, error } = useQuery(GET_OWN_THERAPIST_PROFILE_QUERY);
  const profile = data?.getOwnTherapistProfile;

  // Form State
  const [formData, setFormData] = useState({
    Name: '',
    Surname: '',
    Title: '',
    JobTitle: '',
    City: '',
    Address: '',
    Gender: '',
    BirthDate: '',
    Languages: [] as string[],
    Availability: [] as string[],
    Specialties: [] as string[],
  });

  const [previewImage, setPreviewImage] = useState<string>(avatarPlaceholder);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { upload } = useS3Upload();
  const { download, imageUrl } = useS3Download();

  // --- TRANSLATED ARRAYS ---
  const languageOptions = useMemo(() => [
    { id: 'Deutsch', label: t('q.p.languages.options.german', 'Deutsch') },
    { id: 'Englisch', label: t('q.p.languages.options.english', 'Englisch') },
    { id: 'Kroatisch', label: t('q.p.languages.options.croatian', 'Kroatisch') },
    { id: 'Arabisch', label: t('q.p.languages.options.arabic', 'Arabisch') },
    { id: 'Türkisch', label: t('q.p.languages.options.turkish', 'Türkisch') },
    //add the rest of the languages later
  ], [t]);

  const dayOptions = useMemo(() => [
    { id: 'mo', label: t('q.t.availability.mon', 'Montag') },
    { id: 'di', label: t('q.t.availability.tue', 'Dienstag') },
    { id: 'mi', label: t('q.t.availability.wed', 'Mittwoch') },
    { id: 'do', label: t('q.t.availability.thu', 'Donnerstag') },
    { id: 'fr', label: t('q.t.availability.fri', 'Freitag') },
    { id: 'sa', label: t('q.t.availability.sat', 'Samstag') },
    { id: 'so', label: t('q.t.availability.sun', 'Sonntag') },
  ], [t]);

  const specialtyOptions = useMemo(() => [
    { id: 'Depression', label: t('q.t.specialties.depression', 'Depression') },
    { id: 'Angststörungen', label: t('q.t.specialties.anxiety', 'Angststörungen') },
    { id: 'Trauma', label: t('q.t.specialties.trauma', 'Trauma') },
    { id: 'Stress', label: t('q.t.specialties.stress', 'Stress & Burnout') },
    { id: 'Psychosomatik', label: t('q.options.psychosomatics') },
    { id: 'Sucht', label: t('q.options.addiction') },
    { id: 'Sexuelle Identität', label: t('q.options.sexualIdentity') },
    { id: 'Zwang', label: t('q.options.compulsion') },
    { id: 'Gewalterfahrungen', label: t('q.options.violence') },
    { id: 'Chronische Schmerzen', label: t('q.options.chronicPain') },
    { id: 'Essverhalten', label: t('q.options.eatingBehavior') },
  ], [t]);

  // Populate form when data loads
  useEffect(() => {
    if (profile) {
      setFormData({
        Name: profile.Name || '',
        Surname: profile.Surname || '',
        Title: profile.Title || '',
        JobTitle: profile.JobTitle || '',
        City: profile.City || '',
        Address: profile.Address || '',
        Gender: profile.Gender || '',
        BirthDate: toDateString(profile.BirthDate),
        Languages: profile.Languages || [],
        Availability: profile.Availability || [],
        Specialties: profile.Specialties || [],
      });
      // Fetch own image
      download('profile.jpg', 'public').catch((err) => {
        console.debug('No existing profile image found.');
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    if (imageUrl) {
      setPreviewImage(imageUrl);
    }
  }, [imageUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleArrayToggle = (field: 'Languages' | 'Availability' | 'Specialties', value: string) => {
    setFormData((prev) => {
      const currentArray = prev[field];
      if (currentArray.includes(value)) {
        return { ...prev, [field]: currentArray.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...currentArray, value] };
      }
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      
      try {
        const fileToUpload = new File([file], 'profile', { type: 'image/jpeg' });
        await upload(fileToUpload, 'public');
      } catch (err) {
        console.error('Upload failed:', err);
        alert(t('app.therapist.profile.uploadError', 'Fehler beim Hochladen des Bildes'));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Build the payload first to log it
    const payload = {
      Name: formData.Name,
      Surname: formData.Surname,
      Title: formData.Title,
      JobTitle: formData.JobTitle,
      City: formData.City,
      Address: formData.Address,
      Gender: formData.Gender,
      BirthDate: toUnixSeconds(formData.BirthDate),
      Languages: formData.Languages,
      Availability: formData.Availability,
      Specialties: formData.Specialties,
    };

    console.log('🟢 [COMPONENT] 1. Sending payload to Service:', payload);

    try {
      await therapistService.updateProfile(payload);
      console.log('🟢 [COMPONENT] 4. Update successful! Navigating away...');
      navigate('/therapist/profile');
    } catch (err) {
      console.error('🔴 [COMPONENT] Error caught in UI:', err);
      alert(t('app.therapist.profile.editError', 'Es gab einen Fehler beim Speichern.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return <div className="text-red-500 text-center">{t('app.therapist.profile.loadError', 'Fehler beim Laden des Profils')}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-10">
      <button 
        onClick={() => navigate('/therapist/profile')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.back', 'Zurück')}
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('app.therapist.profile.editProfile', 'Profil bearbeiten')}
      </h1>

      <div className="feelora-card">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="relative group">
              <img
                src={previewImage}
                alt="Profile Preview"
                className={`w-32 h-32 rounded-full object-cover border-4 border-background shadow-lg ${isUploading ? 'opacity-50' : ''}`}
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:scale-105 transition-transform disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>

          <div className="my-6 border-t border-border"></div>

          {/* Professional Data Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">{t('app.therapist.profile.professionalData', 'Berufliche Daten')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                <input type="text" name="Title" value={formData.Title} onChange={handleChange} className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Job Title *</label>
                <input type="text" name="JobTitle" value={formData.JobTitle} onChange={handleChange} required className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none" />
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-border"></div>

          {/* Personal Data Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">{t('app.therapist.profile.personalData', 'Persönliche Daten')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Vorname *</label>
                <input type="text" name="Name" value={formData.Name} onChange={handleChange} required className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nachname *</label>
                <input type="text" name="Surname" value={formData.Surname} onChange={handleChange} required className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Stadt</label>
                <input type="text" name="City" value={formData.City} onChange={handleChange} className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Adresse / Praxis</label>
                <input type="text" name="Address" value={formData.Address} onChange={handleChange} className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Geburtsdatum</label>
                <input type="date" name="BirthDate" value={formData.BirthDate} onChange={handleChange} className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Geschlecht</label>
                <select name="Gender" value={formData.Gender} onChange={handleChange} className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none">
                  <option value="">Bitte wählen...</option>
                  <option value="männlich">Männlich</option>
                  <option value="weiblich">Weiblich</option>
                  <option value="non-binary / divers">Non-binary / divers</option>
                </select>
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-border"></div>

          {/* Specialties Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">{t('app.therapist.profile.specialties', 'Spezialisierungen')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {specialtyOptions.map((spec) => (
                <label key={spec.id} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <Checkbox checked={formData.Specialties.includes(spec.id)} onCheckedChange={() => handleArrayToggle('Specialties', spec.id)} />
                  <span className="text-sm text-foreground">{spec.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="my-6 border-t border-border"></div>

          {/* Languages Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">{t('app.therapist.profile.languages', 'Sprachen')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {languageOptions.map((lang) => (
                <label key={lang.id} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <Checkbox checked={formData.Languages.includes(lang.id)} onCheckedChange={() => handleArrayToggle('Languages', lang.id)} />
                  <span className="text-sm text-foreground">{lang.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="my-6 border-t border-border"></div>

          {/* Availability Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">{t('app.therapist.profile.availability', 'Verfügbarkeit')}</h3>
            <div className="flex flex-wrap gap-3">
              {dayOptions.map((day) => {
                const isSelected = formData.Availability.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleArrayToggle('Availability', day.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 flex justify-end">
            <button type="submit" disabled={isSaving || isUploading} className="feelora-btn-primary flex items-center gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t('common.save', 'Speichern')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TherapistEditProfilePage;