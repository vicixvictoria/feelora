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

// --- Country/City Imports ---
import { City } from 'country-state-city';
import countries from 'i18n-iso-countries';
import deLocale from 'i18n-iso-countries/langs/de.json';
import enLocale from 'i18n-iso-countries/langs/en.json';

// Register languages
countries.registerLocale(deLocale);
countries.registerLocale(enLocale);

interface LanguageOption {
  id: string;
  label: string;
}

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

const OTHER_VALUE = 'other';

// --- City Translation Helpers ---
const getFlagEmoji = (countryCode: string) => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

const deCityTranslationMap: Record<string, string> = {
  "Vienna": "Wien",
  "Munich": "München",
  "Cologne": "Köln",
  "Nuremberg": "Nürnberg",
  "Prague": "Prag",
  "Rome": "Rom",
  "Milan": "Mailand",
  "Venice": "Venedig",
  "Florence": "Florenz",
  "Geneva": "Genf",
  "Zurich": "Zürich",
  "Lucerne": "Luzern",
  "Warsaw": "Warschau",
  "Brussels": "Brüssel",
  "Lisbon": "Lissabon",
  "Athens": "Athen",
  "Moscow": "Moskau",
};

const translateCity = (cityName: string, currentLang: string) => {
  if (currentLang === 'de') {
    return deCityTranslationMap[cityName] || cityName;
  }
  return cityName; 
};

const TherapistEditProfilePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentLang = i18n.language?.startsWith('de') ? 'de' : 'en';

  // Force Apollo to skip the cache to get fresh data including Title, Country, HasInsurance, etc.
  const { data, loading, error } = useQuery(GET_OWN_THERAPIST_PROFILE_QUERY, {
    fetchPolicy: 'network-only',
  });
  const profile = data?.getOwnTherapistProfile;

  // Form State
  const [formData, setFormData] = useState({
    Name: '',
    Surname: '',
    Title: '',
    JobTitle: '',
    Country: '',
    City: '',
    Address: '',
    Gender: '',
    BirthDate: '',
    Languages: [] as string[],
    Availability: [] as string[],
    Specialties: [] as string[],
    // New Pricing Fields
    HasInsurance: false,
    MinPrice: '' as string | number,
    MaxPrice: '' as string | number,
  });

  const [previewImage, setPreviewImage] = useState<string>(avatarPlaceholder);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- Custom Title & JobTitle State ---
  const [isCustomJob, setIsCustomJob] = useState(false);
  const [isCustomTitle, setIsCustomTitle] = useState(false);

  // --- Country & City State ---
  const [countryQuery, setCountryQuery] = useState('');
  const [isCountryFocused, setIsCountryFocused] = useState(false);
  const [isCityFocused, setIsCityFocused] = useState(false);

  const { upload } = useS3Upload();
  const { download, imageUrl } = useS3Download();

  // --- PREDEFINED OPTIONS ---
  const predefinedJobs = useMemo(() => [
    t('q.t.personal.jobs.psych_pt', 'Psychotherapist'),
    t('q.t.personal.jobs.clinicalPsych', 'Clinical Psychologist'),
    t('q.t.personal.jobs.kjp', 'Child and Adolescent Psychotherapist'),
    t('q.t.personal.jobs.fachaerzt_psychiatrie', 'Specialist in Psychiatry and Psychotherapy'),
    t('q.t.personal.jobs.psych_berater', 'Life and Social Counselor'),
    t('q.t.personal.jobs.gesundheitsPsych', 'Health Psychologist'),
  ], [t]);

  const predefinedTitles = useMemo(() => [
    t('q.t.personal.titles.dr_med', 'Dr. med.'),
    t('q.t.personal.titles.dr_rer_nat', 'Dr. rer. nat.'),
    t('q.t.personal.titles.dr_phil', 'Dr. phil.'),
    t('q.t.personal.titles.dr', 'Dr.'),
    t('q.t.personal.titles.prof_dr', 'Prof. Dr.'),
    t('q.t.personal.titles.dipl_psych', 'Dipl.-Psych.'),
    t('q.t.personal.titles.dipl_paed', 'Dipl.-Päd.'),
    t('q.t.personal.titles.m_sc', 'M.Sc.'),
    t('q.t.personal.titles.b_sc', 'B.Sc.'),
    t('q.t.personal.titles.m_a', 'M.A.'),
    t('q.t.personal.titles.b_a', 'B.A.'),
  ], [t]);

  // --- Dynamic Search Options ---
  const availableCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (query.length < 2) return [];

    const countryObj = countries.getNames(currentLang, { select: 'official' });
    const allLocalizedCountries = Object.entries(countryObj).map(([code, name]) => ({
      isoCode: code,
      name: name,
      flag: getFlagEmoji(code),
    }));

    return allLocalizedCountries
      .filter((country) => country.name.toLowerCase().startsWith(query))
      .slice(0, 20);
  }, [countryQuery, currentLang]);

  const availableCities = useMemo(() => {
    if (!formData.Country) return [];

    const query = (formData.City || '').trim().toLowerCase();
    if (query.length < 2) return [];

    const allCities = City.getCitiesOfCountry(formData.Country) || [];
    const uniqueCities: string[] = [];
    const seenNames = new Set<string>();

    for (const city of allCities) {
      const rawName = city.name?.trim();
      if (!rawName) continue;

      const translatedName = translateCity(rawName, currentLang);

      if (seenNames.has(translatedName)) continue;

      if (translatedName.toLowerCase().startsWith(query)) {
        seenNames.add(translatedName);
        uniqueCities.push(translatedName);
      }

      if (uniqueCities.length >= 50) break;
    }

    return uniqueCities;
  }, [formData.Country, formData.City, currentLang]);

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

  const specialtyOptions = useMemo(
    () => [
      { id: 'Depression', label: t('q.options.depression', 'Depression') },
      { id: 'Angststörungen', label: t('q.options.anxiety', 'Angststörungen') },
      { id: 'Trauma', label: t('q.options.trauma', 'Trauma') },
      { id: 'Stress', label: t('q.options.stress', 'Stress & Burnout') },
      { id: 'Psychosomatik', label: t('q.options.psychosomatics', 'Psychosomatik') },
      { id: 'Sucht', label: t('q.options.addiction', 'Sucht') },
      { id: 'Sexuelle Identität', label: t('q.options.sexualIdentity', 'Sexuelle Identität') },
      { id: 'Zwang', label: t('q.options.compulsion', 'Zwang') },
      { id: 'Gewalterfahrungen', label: t('q.options.violence', 'Gewalterfahrungen') },
      { id: 'Chronische Schmerzen', label: t('q.options.chronicPain', 'Chronische Schmerzen') },
      { id: 'Essverhalten', label: t('q.options.eatingBehavior', 'Essverhalten') },
    ],
    [t],
  );

  // Update country query if language changes
  useEffect(() => {
    if (formData.Country) {
      setCountryQuery(countries.getName(formData.Country, currentLang, { select: 'official' }) || '');
    }
  }, [currentLang, formData.Country]);

  // Populate form when data loads
  useEffect(() => {
    if (profile) {
      console.log('🔍 [DEBUG] Profile Data loaded from Backend:', profile);

      let loadedLanguages = profile.Languages || [];
      const hasOtherLanguage = loadedLanguages.some((lang: string) =>
        otherLanguages.some((other: LanguageOption) => other.id === lang),
      );

      if (hasOtherLanguage && !loadedLanguages.includes(OTHER_VALUE)) {
        loadedLanguages = [...loadedLanguages, OTHER_VALUE];
      }

      // Parse the PriceRange string (e.g., "50-100") back to Min and Max
      let minP: string | number = '';
      let maxP: string | number = '';
      if (profile.PriceRange) {
        const parts = profile.PriceRange.split('-');
        if (parts.length === 2) {
          minP = Number(parts[0]);
          maxP = Number(parts[1]);
        }
      }

      setFormData({
        Name: profile.Name || '',
        Surname: profile.Surname || '',
        Title: profile.Title || '',
        JobTitle: profile.JobTitle || '',
        Country: profile.Country || '',
        City: profile.City || '',
        Address: profile.Address || '',
        Gender: profile.Gender || '',
        BirthDate: toDateString(profile.BirthDate),
        Languages: loadedLanguages,
        Availability: profile.Availability || [],
        Specialties: profile.Specialties || [],
        HasInsurance: profile.HasInsurance || false,
        MinPrice: minP,
        MaxPrice: maxP,
      });

      // Handle custom selections
      if (profile.JobTitle && !predefinedJobs.includes(profile.JobTitle)) {
        setIsCustomJob(true);
      } else {
        setIsCustomJob(false);
      }

      if (profile.Title && !predefinedTitles.includes(profile.Title)) {
        setIsCustomTitle(true);
      } else {
        setIsCustomTitle(false);
      }

      if (profile.Country) {
        setCountryQuery(countries.getName(profile.Country, currentLang, { select: 'official' }) || '');
      }

      // Fetch own image
      download('profile', 'public').catch((err) => {
        console.debug('No existing profile image found.', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, predefinedJobs, predefinedTitles]);

  useEffect(() => {
    if (imageUrl) {
      setPreviewImage(imageUrl);
    }
  }, [imageUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleArrayToggle = (
    field: 'Languages' | 'Availability' | 'Specialties',
    value: string,
  ) => {
    setFormData((prev) => {
      const currentArray = prev[field];
      if (currentArray.includes(value)) {
        return { ...prev, [field]: currentArray.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...currentArray, value] };
      }
    });
  };

  const handleOtherLanguagesToggle = () => {
    if (formData.Languages.includes(OTHER_VALUE)) {
      const otherIds = otherLanguages.map((l) => l.id);
      setFormData((prev) => ({
        ...prev,
        Languages: prev.Languages.filter((l) => l !== OTHER_VALUE && !otherIds.includes(l)),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        Languages: [...prev.Languages, OTHER_VALUE],
      }));
    }
  };

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
        alert(t('app.therapist.profile.uploadError', 'Fehler beim Hochladen des Bildes'));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Validate Pricing
    if (formData.MinPrice !== '' && formData.MaxPrice !== '' && Number(formData.MinPrice) > Number(formData.MaxPrice)) {
      alert(t('q.t.price.errorMinMax', 'Der Mindestpreis darf nicht größer als der Höchstpreis sein.'));
      setIsSaving(false);
      return;
    }

    const payload = {
      Name: formData.Name,
      Surname: formData.Surname,
      Title: formData.Title,
      JobTitle: formData.JobTitle,
      City: formData.City,
      Address: formData.Address,
      Gender: formData.Gender,
      BirthDate: toUnixSeconds(formData.BirthDate),
      Languages: formData.Languages.filter((l) => l !== OTHER_VALUE),
      Availability: formData.Availability,
      Specialties: formData.Specialties,
      HasInsurance: formData.HasInsurance,
      PriceRange: formData.MinPrice !== '' && formData.MaxPrice !== '' ? `${formData.MinPrice}-${formData.MaxPrice}` : '',
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
    return (
      <div className="text-red-500 text-center">
        {t('app.therapist.profile.loadError', 'Fehler beim Laden des Profils')}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-10">
      <button
        onClick={() => navigate('/therapist/profile')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('q.common.back', 'Zurück')}
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="my-6 border-t border-border"></div>

          {/* Professional Data Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              {t('app.therapist.profile.professionalData', 'Berufliche Daten')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('app.therapist.profile.title.academic', 'Titel (wird im Profil angezeigt)')}
                </label>
                <select
                  value={isCustomTitle ? 'other' : (formData.Title || 'none')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'other') {
                      setIsCustomTitle(true);
                      setFormData(prev => ({ ...prev, Title: '' }));
                    } else if (val === 'none') {
                      setIsCustomTitle(false);
                      setFormData(prev => ({ ...prev, Title: '' }));
                    } else {
                      setIsCustomTitle(false);
                      setFormData(prev => ({ ...prev, Title: val }));
                    }
                  }}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none"
                >
                  <option value="none">{t('q.t.personal.noTitle', '(Keinen Titel angeben)')}</option>
                  {predefinedTitles.map(tItem => <option key={tItem} value={tItem}>{tItem}</option>)}
                  <option value="other">{t('q.t.personal.titleOther', 'Sonstiges (Eigene Eingabe)')}</option>
                </select>
                {isCustomTitle && (
                  <input
                    type="text"
                    name="Title"
                    value={formData.Title}
                    onChange={handleChange}
                    placeholder={t('q.t.personal.customTitlePlaceholder', 'Bitte Titel eingeben...')}
                    className="w-full p-3 mt-2 rounded-lg border border-border bg-background focus:ring-2 outline-none"
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('app.therapist.profile.jobTitle', 'Berufsbezeichnung')} *
                </label>
                <select
                  value={isCustomJob ? 'other' : formData.JobTitle}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'other') {
                      setIsCustomJob(true);
                      setFormData(prev => ({ ...prev, JobTitle: '' }));
                    } else {
                      setIsCustomJob(false);
                      setFormData(prev => ({ ...prev, JobTitle: val }));
                    }
                  }}
                  required={!isCustomJob}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none"
                >
                  <option value="" disabled>{t('q.common.pleaseSelect', 'Bitte auswählen')}</option>
                  {predefinedJobs.map(job => <option key={job} value={job}>{job}</option>)}
                  <option value="other">{t('q.t.personal.jobOther', 'Sonstiges (Eigene Eingabe)')}</option>
                </select>
                {isCustomJob && (
                  <input
                    type="text"
                    name="JobTitle"
                    value={formData.JobTitle}
                    onChange={handleChange}
                    required
                    placeholder={t('q.t.personal.customJobPlaceholder', 'Bitte Berufsbezeichnung eingeben...')}
                    className="w-full p-3 mt-2 rounded-lg border border-border bg-background focus:ring-2 outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-border"></div>

          {/* Pricing & Costs Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              {t('q.t.price.title', 'Preise und Kosten')}
            </h3>
            
            <div className="space-y-6">
              {/* Kassenvertrag Checkbox */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="HasInsurance"
                  checked={formData.HasInsurance}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, HasInsurance: checked as boolean }))}
                />
                <label
                  htmlFor="HasInsurance"
                  className="text-sm font-medium cursor-pointer text-foreground"
                >
                  {t('q.t.price.kassenvertrag', 'Kassenvertrag')}
                </label>
              </div>

              {/* Price Range Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('q.t.price.min', 'Mindestpreis (€)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="MinPrice"
                    value={formData.MinPrice}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('q.t.price.max', 'Höchstpreis (€)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="MaxPrice"
                    value={formData.MaxPrice}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-border"></div>

          {/* Personal Data Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              {t('app.therapist.profile.personalData', 'Persönliche Daten')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('app.therapist.profile.firstName', 'Vorname')} *
                </label>
                <input
                  type="text"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('app.therapist.profile.lastName', 'Nachname')} *
                </label>
                <input
                  type="text"
                  name="Surname"
                  value={formData.Surname}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none"
                />
              </div>

              {/* Country Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('q.t.contact.country', 'Land')}
                </label>
                <input
                  type="text"
                  value={countryQuery}
                  placeholder={t('q.common.searchPlaceholder', 'Suchen...')}
                  onChange={(e) => {
                    const nextQuery = e.target.value;
                    setCountryQuery(nextQuery);
                    setFormData((prev) => ({ ...prev, Country: '', City: '' }));
                  }}
                  onFocus={() => setIsCountryFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsCountryFocused(false), 150);
                  }}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none"
                />

                {isCountryFocused && countryQuery.trim().length >= 2 && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-56 overflow-auto">
                    {availableCountries.length > 0 ? (
                      availableCountries.map((country) => (
                        <button
                          key={country.isoCode}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setCountryQuery(country.name);
                            setFormData((prev) => ({ ...prev, Country: country.isoCode, City: '' }));
                            setIsCountryFocused(false);
                          }}
                        >
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        {t('q.common.noResults', 'Keine Ergebnisse gefunden')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* City Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('app.therapist.profile.city', 'Stadt')}
                </label>
                <input
                  type="text"
                  name="City"
                  value={formData.City}
                  disabled={!formData.Country}
                  placeholder={
                    formData.Country
                      ? t('q.common.searchPlaceholder', 'Suchen...')
                      : t('q.t.contact.selectCountryFirst', 'Bitte zuerst Land wählen')
                  }
                  onChange={(e) => setFormData((prev) => ({ ...prev, City: e.target.value }))}
                  onFocus={() => setIsCityFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsCityFocused(false), 150);
                  }}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none disabled:opacity-50"
                />

                {isCityFocused && formData.Country && (formData.City || '').trim().length >= 2 && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-56 overflow-auto">
                    {availableCities.length > 0 ? (
                      availableCities.map((cityName) => (
                        <button
                          key={cityName}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setFormData((prev) => ({ ...prev, City: cityName }));
                            setIsCityFocused(false);
                          }}
                        >
                          {cityName}
                        </button>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        {t('q.common.noResults', 'Keine Ergebnisse gefunden')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('app.therapist.profile.address', 'Praxisadresse')}
                </label>
                <input
                  type="text"
                  name="Address"
                  value={formData.Address}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('app.therapist.profile.birthday', 'Geburtsdatum')}
                </label>
                <input
                  type="date"
                  name="BirthDate"
                  value={formData.BirthDate}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('app.therapist.profile.gender', 'Geschlecht')}
                </label>
                <select
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 outline-none"
                >
                  <option value="">{t('common.choose')}</option>
                  <option value="male">{t('q.t.personal.male')}</option>
                  <option value="female">{t('q.t.personal.female')}</option>
                  <option value="diverse">{t('q.t.personal.diverse')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-border"></div>

          {/* Specialties Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              {t('app.therapist.profile.specializedIn', 'Spezialisierungen')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {specialtyOptions.map((spec) => (
                <label
                  key={spec.id}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={formData.Specialties.includes(spec.id)}
                    onCheckedChange={() => handleArrayToggle('Specialties', spec.id)}
                  />
                  <span className="text-sm text-foreground">{spec.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="my-6 border-t border-border"></div>

          {/* Languages Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              {t('app.therapist.profile.languages', 'Sprachen')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {languageOptions.map((lang) => (
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

              <div className="col-span-full space-y-3">
                <label
                  htmlFor="t-languages-other"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    id="t-languages-other"
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
                      {otherLanguages.map((lang) => (
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
              {t('app.therapist.profile.availability', 'Verfügbarkeit')}
            </h3>
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

export default TherapistEditProfilePage;