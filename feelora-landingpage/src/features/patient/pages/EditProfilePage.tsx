import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Loader2, Camera, ArrowLeft, Save } from 'lucide-react';
import avatarPlaceholder from '@/assets/avatar-Placeholder.png';
import { patientService, GET_OWN_USER_PROFILE_QUERY } from '../api/patient-service';
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

const EditProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing profile data
  const { data, loading, error } = useQuery(GET_OWN_USER_PROFILE_QUERY);
  const patient = data?.getOwnUserProfile;

  // Form State
  const [formData, setFormData] = useState({
    Name: '',
    Surname: '',
    City: '',
    Gender: '',
    BirthDate: '',
    Languages: [] as string[],
    Availability: [] as string[],
  });

  const [previewImage, setPreviewImage] = useState<string>(avatarPlaceholder);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { upload } = useS3Upload();
  const { download, imageUrl } = useS3Download();

  // --- TRANSLATED ARRAYS ---
  const languageOptions = useMemo(
    () => [
      { id: 'Deutsch', label: t('q.p.languages.options.german', 'Deutsch') },
      { id: 'Englisch', label: t('q.p.languages.options.english', 'Englisch') },
      { id: 'Kroatisch', label: t('q.p.languages.options.croatian', 'Kroatisch') },
      { id: 'Arabisch', label: t('q.p.languages.options.arabic', 'Arabisch') },
      { id: 'Türkisch', label: t('q.p.languages.options.turkish', 'Türkisch') },
      { id: 'Polnisch', label: t('q.p.languages.options.polish', 'Polnisch') },
      { id: 'Serbisch', label: t('q.p.languages.options.serbian', 'Serbisch') },
      { id: 'Italienisch', label: t('q.p.languages.options.italian', 'Italienisch') },
      { id: 'Ungarisch', label: t('q.p.languages.options.hungarian', 'Ungarisch') },
      { id: 'Farsi / Persisch', label: t('q.p.languages.options.farsi', 'Farsi / Persisch') },
      { id: 'Rumänisch', label: t('q.p.languages.options.romanian', 'Rumänisch') },
      { id: 'Spanisch', label: t('q.p.languages.options.spanish', 'Spanisch') },
      { id: 'Französisch', label: t('q.p.languages.options.french', 'Französisch') },
      { id: 'Ukrainisch', label: t('q.p.languages.options.ukrainian', 'Ukrainisch') },
      { id: 'Russisch', label: t('q.p.languages.options.russian', 'Russisch') },
    ],
    [t],
  );

  const dayOptions = useMemo(
    () => [
      { id: 'mo', label: t('q.t.availability.mon', 'Montag') },
      { id: 'di', label: t('q.t.availability.tue', 'Dienstag') },
      { id: 'mi', label: t('q.t.availability.wed', 'Mittwoch') },
      { id: 'do', label: t('q.t.availability.thu', 'Donnerstag') },
      { id: 'fr', label: t('q.t.availability.fri', 'Freitag') },
      { id: 'sa', label: t('q.t.availability.sat', 'Samstag') },
      { id: 'so', label: t('q.t.availability.sun', 'Sonntag') },
    ],
    [t],
  );

  // Populate form when data loads
  useEffect(() => {
    if (patient) {
      setFormData({
        Name: patient.Name || '',
        Surname: patient.Surname || '',
        City: patient.City || '',
        Gender: patient.Gender || '',
        BirthDate: toDateString(patient.BirthDate),
        Languages: patient.Languages || [],
        Availability: patient.Availability || [],
      });
      // Try to download the existing profile picture
      download('profile.jpg', 'public').catch((err) => {
        console.error('Could not download profile image:', err);
      });
    }
  }, [patient]);

  // Update preview when S3 image is loaded
  useEffect(() => {
    if (imageUrl) {
      setPreviewImage(imageUrl);
    }
  }, [imageUrl]);

  // Handle Standard Text/Select Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle Checkbox/Array Toggles
  const handleArrayToggle = (field: 'Languages' | 'Availability', value: string) => {
    setFormData((prev) => {
      const currentArray = prev[field];
      if (currentArray.includes(value)) {
        return { ...prev, [field]: currentArray.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...currentArray, value] };
      }
    });
  };

  // Handle Real Image Upload
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
        alert(t('patient.profile.uploadError', 'Fehler beim Hochladen des Bildes'));
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await patientService.updateProfile({
        Name: formData.Name,
        Surname: formData.Surname,
        City: formData.City,
        Gender: formData.Gender,
        BirthDate: toUnixSeconds(formData.BirthDate),
        Languages: formData.Languages,
        Availability: formData.Availability,
      });
      navigate('/patient/profile');
    } catch (err) {
      alert(t('patient.profile.editError', 'Es gab einen Fehler beim Speichern.'));
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

  if (error || !patient) {
    return (
      <div className="text-red-500 text-center">
        {t('patient.profile.loadError', 'Fehler beim Laden des Profils')}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-10">
      <button
        onClick={() => navigate('/patient/profile')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.back', 'Zurück')}
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('patient.profile.editProfile', 'Profil bearbeiten')}
      </h1>

      <div className="feelora-card">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Upload Section */}
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-sm text-muted-foreground">
              {t(
                'patient.profile.uploadPhoto',
                'Klicke auf das Kamera-Icon, um ein Bild hochzuladen',
              )}
            </p>
          </div>

          <div className="my-6 border-t border-border"></div>

          {/* Personal Data Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              {t('patient.profile.personalData', 'Persönliche Daten')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('patient.profile.firstName', 'Vorname')}
                </label>
                <input
                  type="text"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('patient.profile.lastName', 'Nachname')}
                </label>
                <input
                  type="text"
                  name="Surname"
                  value={formData.Surname}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('patient.profile.city', 'Stadt')}
                </label>
                <input
                  type="text"
                  name="City"
                  value={formData.City}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('patient.profile.birthDate', 'Geburtsdatum')}
                </label>
                <input
                  type="date"
                  name="BirthDate"
                  value={formData.BirthDate}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('patient.profile.gender', 'Geschlecht')}
                </label>
                <select
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">{t('common.select', 'Bitte wählen...')}</option>
                  <option value="männlich">{t('q.t.patientGender.male', 'Männlich')}</option>
                  <option value="weiblich">{t('q.t.patientGender.female', 'Weiblich')}</option>
                  <option value="non-binary / divers">
                    {t('q.t.patientGender.nonBinary', 'Non-binary / divers')}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-border"></div>

          {/* Languages Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              {t('patient.profile.languages', 'Sprachen')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {languageOptions.map((lang) => (
                <label
                  key={lang.id}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={formData.Languages.includes(lang.id)}
                    onCheckedChange={() => handleArrayToggle('Languages', lang.id)}
                  />
                  <span className="text-sm text-foreground">{lang.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="my-6 border-t border-border"></div>

          {/* Availability Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              {t('patient.profile.availability', 'Verfügbarkeit')}
            </h3>
            <div className="flex flex-wrap gap-3">
              {dayOptions.map((day) => {
                const isSelected = formData.Availability.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleArrayToggle('Availability', day.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="feelora-btn-primary flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {t('common.save', 'Speichern')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
