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

// Interface for clean TypeScript
interface LanguageOption {
  id: string;
  label: string;
}

const OTHER_VALUE = 'other';

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
      { id: 'german', label: t('q.p.languages.options.german', 'Deutsch') },
      { id: 'english', label: t('q.p.languages.options.english', 'Englisch') },
      { id: 'croatian', label: t('q.p.languages.options.croatian', 'Kroatisch') },
      { id: 'arabic', label: t('q.p.languages.options.arabic', 'Arabisch') },
      { id: 'turkish', label: t('q.p.languages.options.turkish', 'Türkisch') },
      { id: 'polish', label: t('q.p.languages.options.polish', 'Polnisch') },
      { id: 'serbian', label: t('q.p.languages.options.serbian', 'Serbisch') },
      { id: 'italian', label: t('q.p.languages.options.italian', 'Italienisch') },
      { id: 'hungarian', label: t('q.p.languages.options.hungarian', 'Ungarisch') },
      { id: 'farsi', label: t('q.p.languages.options.farsi', 'Farsi / Persisch') },
      { id: 'romanian', label: t('q.p.languages.options.romanian', 'Rumänisch') },
      { id: 'spanish', label: t('q.p.languages.options.spanish', 'Spanisch') },
      { id: 'french', label: t('q.p.languages.options.french', 'Französisch') },
      { id: 'ukrainian', label: t('q.p.languages.options.ukrainian', 'Ukrainisch') },
      { id: 'russian', label: t('q.p.languages.options.russian', 'Russisch') },
    ],
    [t],
  );

  const otherLanguages = useMemo(
    () => [
      { id: 'albanian', label: t('q.p.languages.other.albanian', 'Albanisch') },
      { id: 'portuguese', label: t('q.p.languages.other.portuguese', 'Portugiesisch') },
      { id: 'chinese', label: t('q.p.languages.other.chinese', 'Chinesisch') },
      { id: 'japanese', label: t('q.p.languages.other.japanese', 'Japanisch') },
      { id: 'korean', label: t('q.p.languages.other.korean', 'Koreanisch') },
      { id: 'dutch', label: t('q.p.languages.other.dutch', 'Niederländisch') },
      { id: 'swedish', label: t('q.p.languages.other.swedish', 'Schwedisch') },
      { id: 'danish', label: t('q.p.languages.other.danish', 'Dänisch') },
      { id: 'norwegian', label: t('q.p.languages.other.norwegian', 'Norwegisch') },
      { id: 'finnish', label: t('q.p.languages.other.finnish', 'Finnisch') },
      { id: 'greek', label: t('q.p.languages.other.greek', 'Griechisch') },
      { id: 'hebrew', label: t('q.p.languages.other.hebrew', 'Hebräisch') },
      { id: 'czech', label: t('q.p.languages.other.czech', 'Tschechisch') },
      { id: 'slovak', label: t('q.p.languages.other.slovak', 'Slowakisch') },
      { id: 'bulgarian', label: t('q.p.languages.other.bulgarian', 'Bulgarisch') },
      { id: 'slovenian', label: t('q.p.languages.other.slovenian', 'Slowenisch') },
      { id: 'hindi', label: t('q.p.languages.other.hindi', 'Hindi') },
      { id: 'bengali', label: t('q.p.languages.other.bengali', 'Bengalisch') },
      { id: 'vietnamese', label: t('q.p.languages.other.vietnamese', 'Vietnamesisch') },
      { id: 'thai', label: t('q.p.languages.other.thai', 'Thailändisch') },
      { id: 'urdu', label: t('q.p.languages.other.urdu', 'Urdu') },
      { id: 'pashto', label: t('q.p.languages.other.pashto', 'Paschtu') },
      { id: 'kurdish', label: t('q.p.languages.other.kurdish', 'Kurdisch') },
      { id: 'dari', label: t('q.p.languages.other.dari', 'Dari') },
      { id: 'indonesian', label: t('q.p.languages.other.indonesian', 'Indonesisch') },
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
      // Auto-open "Andere" if they have another language saved
      let loadedLanguages = patient.Languages || [];
      const hasOtherLanguage = loadedLanguages.some((lang: string) =>
        otherLanguages.some((other: LanguageOption) => other.id === lang),
      );

      if (hasOtherLanguage && !loadedLanguages.includes(OTHER_VALUE)) {
        loadedLanguages = [...loadedLanguages, OTHER_VALUE];
      }

      setFormData({
        Name: patient.Name || '',
        Surname: patient.Surname || '',
        City: patient.City || '',
        Gender: patient.Gender || '',
        BirthDate: toDateString(patient.BirthDate),
        Languages: loadedLanguages,
        Availability: patient.Availability || [],
      });
      // Try to download the existing profile picture
      download('profile', 'public').catch((err) => {
        console.error('Could not download profile image:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // handler for toggling the "Andere" checkbox group
  const handleOtherLanguagesToggle = () => {
    if (formData.Languages.includes(OTHER_VALUE)) {
      // Uncheck: Remove "Andere" and clear all selected "other" languages
      const otherIds = otherLanguages.map((l) => l.id);
      setFormData((prev) => ({
        ...prev,
        Languages: prev.Languages.filter((l) => l !== OTHER_VALUE && !otherIds.includes(l)),
      }));
    } else {
      // Check: Just add "Andere" to trigger the dropdown
      setFormData((prev) => ({
        ...prev,
        Languages: [...prev.Languages, OTHER_VALUE],
      }));
    }
  };

  // Handle Real Image Upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);

      try {
        const fileToUpload = new File([file], 'profile', { type: file.type });
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
        // 6. Filter out the utility 'Andere' string before sending it to the DB
        Languages: formData.Languages.filter((l) => l !== OTHER_VALUE),
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
                  <option value="male">{t('q.t.patientGender.male', 'Männlich')}</option>
                  <option value="female">{t('q.t.patientGender.female', 'Weiblich')}</option>
                  <option value="diverse">
                    {t('q.t.patientGender.nonBinary', 'Non-binary / diverse')}
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
              {languageOptions.map((lang: LanguageOption) => (
                <label
                  key={lang.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={formData.Languages.includes(lang.id)}
                    onCheckedChange={() => handleArrayToggle('Languages', lang.id)}
                  />
                  <span className="text-sm text-foreground">{lang.label}</span>
                </label>
              ))}

              {/* "Andere" Option spanning entire columns */}
              <div className="col-span-full space-y-3">
                <label
                  htmlFor="p-languages-other"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    id="p-languages-other"
                    checked={formData.Languages.includes(OTHER_VALUE)}
                    onCheckedChange={handleOtherLanguagesToggle}
                  />
                  <span className="text-sm text-foreground font-medium">
                    {t('q.common.otherLanguages')}
                  </span>
                </label>

                {formData.Languages.includes(OTHER_VALUE) && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 p-4 rounded-lg border bg-muted/20 border-border">
                    <p className="text-sm font-medium mb-3 text-foreground">
                      {t('q.common.selectMoreLanguages')}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {otherLanguages.map((lang: LanguageOption) => (
                        <label
                          key={lang.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-background/50 p-1 rounded"
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
                )}
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-border"></div>

          {/* Availability Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              {t('patient.profile.availability', 'Verfügbarkeit')}
            </h3>
            <div className="flex flex-wrap gap-3">
              {dayOptions.map((day: LanguageOption) => {
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
