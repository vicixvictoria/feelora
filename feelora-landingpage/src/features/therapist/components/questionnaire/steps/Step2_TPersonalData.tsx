import { useState } from 'react';
import { Upload, Check, Loader2, User } from 'lucide-react';
import { Input } from '@/components/ui/questionnaire/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';
import { useS3Upload } from '@/hooks/use-s3-upload';

interface PersonalDataStepProps {
  onNext: () => void;
  onBack: () => void;
  data: Record<string, string>;
  onDataChange: (data: Record<string, string>) => void;
}

// Define which fields are optional
const optionalFields = ['title', 'profilePictureName', 'profilePictureUrl'];

// Define the Validation Schema
const step2Schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  bday: z
    .string()
    .min(1, 'Required')
    .refine(
      (val) => {
        // Ensure all 3 parts of the date exist before validating age
        const parts = val.split('-');
        if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return false;

        const birthDate = new Date(val);
        if (isNaN(birthDate.getTime())) return false;

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (
          monthDifference < 0 ||
          (monthDifference === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        return age >= 15;
      },
      { message: 'Underage or Incomplete' },
    ),
  gender: z.string().min(1, 'Required'),
  job: z.string().min(1, 'Required'),
  title: z.string().optional(),
  profilePictureName: z.string().optional(),
  profilePictureUrl: z.string().optional(), // Added for the local preview URL
});

const Step2_PersonalData = ({ onNext, onBack, data, onDataChange }: PersonalDataStepProps) => {
  const { t } = useTranslation();

  // Predefined Lists
  const predefinedJobs = [
    t('q.t.personal.jobs.psych_pt', 'Psychotherapist'),
    t('q.t.personal.jobs.clinicalPsych', 'Clinical Psychologist'),
    t('q.t.personal.jobs.kjp', 'Child and Adolescent Psychotherapist'),
    t('q.t.personal.jobs.fachaerzt_psychiatrie', 'Specialist in Psychiatry and Psychotherapy'),
    t('q.t.personal.jobs.psych_berater', 'Life and Social Counselor'),
    t('q.t.personal.jobs.gesundheitsPsych', 'Health Psychologist'),
  ];

  const predefinedTitles = [
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
  ];

  // Local uploading state
  const [isUploading, setIsUploading] = useState(false);
  const { upload } = useS3Upload();

  // Local state for custom selections
  const [isCustomJob, setIsCustomJob] = useState(() => {
    if (!data.job) return false;
    return !predefinedJobs.includes(data.job);
  });

  const [isCustomTitle, setIsCustomTitle] = useState(() => {
    if (!data.title) return false;
    return !predefinedTitles.includes(data.title);
  });

  const genderOptions = [
    { value: 'male', label: t('q.t.personal.male') },
    { value: 'female', label: t('q.t.personal.female') },
    { value: 'diverse', label: t('q.t.personal.diverse') },
  ];

  const fieldLabels: Record<string, string> = {
    firstName: t('q.t.personal.firstName'),
    lastName: t('q.t.personal.lastName'),
    bday: t('q.t.personal.birthday'),
    gender: t('q.t.personal.gender'),
    job: t('q.t.personal.job'),
    title: t('q.t.personal.titleField', 'Titel'),
  };

  // Initialize the validation hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step2Schema,
    onNext,
  });

  const handleChange = (field: string, value: string) => {
    clearError(field);
    onDataChange({ ...data, [field]: value });
  };

  // Instant Local Preview of proifile picture Upload Handler 
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create an instant local browser URL for the preview
    const localPreviewUrl = URL.createObjectURL(file);

    // Immediately update the form data so the image appears instantly on the left
    onDataChange({
      ...data,
      profilePictureName: file.name,
      profilePictureUrl: localPreviewUrl,
    });
    clearError('profilePictureName');

    try {
      // Start the UI spinner on the right side
      setIsUploading(true);

      // Perform the actual S3 upload in the background
      const fileToUpload = new File([file], 'profile', { type: file.type });
      await upload(fileToUpload, 'public');

    } catch (error) {
      console.error('Upload failed:', error);
      
      // Revert preview on failure
      onDataChange({
        ...data,
        profilePictureName: '',
        profilePictureUrl: '',
      });
      
      alert(
        t(
          'q.t.personal.uploadError',
          'Fehler beim Hochladen der Datei. Bitte versuche es erneut.',
        ),
      );
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Helper to calculate exact days in a month 
  const getDaysInMonth = (yearStr: string, monthStr: string) => {
    const y = parseInt(yearStr);
    const m = parseInt(monthStr);
    if (y && m) {
      return new Date(y, m, 0).getDate(); 
    }
    return 31; // Default to 31 if year/month aren't selected yet
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.personal.title')}</h1>
        <p className="text-muted-foreground">{t('q.t.personal.subtitle')}</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {t('q.t.personal.cardTitle')}
        </h2>

        {/* --- Standard Form Fields --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(fieldLabels).map((field) => {
            const isOptional = optionalFields.includes(field);

            return (
              <div key={field} className="space-y-2 flex flex-col">
                <Label
                  htmlFor={field}
                  className={errors[field] ? 'text-destructive' : 'text-foreground'}
                >
                  {fieldLabels[field]} {!isOptional && errors[field] && '*'}
                  {isOptional && (
                    <span className="text-muted-foreground font-normal text-xs ml-1">
                      ({t('q.common.optional')})
                    </span>
                  )}
                </Label>

                {field === 'gender' ? (
                  <Select
                    value={data[field] || ''}
                    onValueChange={(value) => handleChange(field, value)}
                  >
                    <SelectTrigger
                      className={`bg-background ${errors[field] ? 'border-destructive ring-destructive' : ''}`}
                    >
                      <SelectValue placeholder={t('q.common.pleaseSelect', 'Bitte auswählen')} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field === 'bday' ? (
                  (() => {
                    const bdayParts = (data[field] || '').split('-');
                    const year = bdayParts[0] || '';
                    const month = bdayParts[1] || '';
                    const day = bdayParts[2] || '';

                    const handleDateChange = (type: 'year' | 'month' | 'day', val: string) => {
                      let newY = year;
                      let newM = month;
                      let newD = day;

                      if (type === 'year') newY = val;
                      if (type === 'month') newM = val;
                      if (type === 'day') newD = val;

                      handleChange(field, `${newY}-${newM}-${newD}`);
                    };

                    const daysInMonth = getDaysInMonth(year, month);
                    const currentYear = new Date().getFullYear();
                    const yearsList = Array.from({ length: 86 }, (_, i) => (currentYear - 15 - i).toString());

                    return (
                      <div className="flex gap-2">
                        <Select value={day} onValueChange={(val) => handleDateChange('day', val)}>
                          <SelectTrigger className={`bg-background w-1/3 ${errors[field] ? 'border-destructive ring-destructive' : ''}`}>
                            <SelectValue placeholder="TT" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {Array.from({ length: daysInMonth }, (_, i) => {
                              const d = (i + 1).toString().padStart(2, '0');
                              return <SelectItem key={d} value={d}>{d}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>

                        <Select value={month} onValueChange={(val) => handleDateChange('month', val)}>
                          <SelectTrigger className={`bg-background w-1/3 ${errors[field] ? 'border-destructive ring-destructive' : ''}`}>
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {Array.from({ length: 12 }, (_, i) => {
                              const m = (i + 1).toString().padStart(2, '0');
                              return <SelectItem key={m} value={m}>{m}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>

                        <Select value={year} onValueChange={(val) => handleDateChange('year', val)}>
                          <SelectTrigger className={`bg-background w-1/3 ${errors[field] ? 'border-destructive ring-destructive' : ''}`}>
                            <SelectValue placeholder="JJJJ" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {yearsList.map((y) => (
                              <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })()
                ) : field === 'job' ? (
                  <>
                    <Select
                      value={isCustomJob ? 'other' : data[field] || ''}
                      onValueChange={(value) => {
                        if (value === 'other') {
                          setIsCustomJob(true);
                          handleChange(field, '');
                        } else {
                          setIsCustomJob(false);
                          handleChange(field, value);
                        }
                      }}
                    >
                      <SelectTrigger
                        className={`bg-background ${errors[field] && !isCustomJob ? 'border-destructive ring-destructive' : ''}`}
                      >
                        <SelectValue placeholder={t('q.common.pleaseSelect', 'Bitte auswählen')} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {predefinedJobs.map((jobTitle) => (
                          <SelectItem key={jobTitle} value={jobTitle}>
                            {jobTitle}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">
                          {t('q.t.personal.jobOther', 'Sonstiges (Eigene Eingabe)')}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {isCustomJob && (
                      <Input
                        id={`${field}-custom`}
                        type="text"
                        value={data[field] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        placeholder={t(
                          'q.t.personal.customJobPlaceholder',
                          'Bitte Berufsbezeichnung eingeben...',
                        )}
                        className={`mt-2 bg-background ${errors[field] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                    )}
                  </>
                ) : field === 'title' ? (
                  <>
                    <Select
                      value={isCustomTitle ? 'other' : data[field] ? data[field] : 'none'}
                      onValueChange={(value) => {
                        if (value === 'other') {
                          setIsCustomTitle(true);
                          handleChange(field, '');
                        } else if (value === 'none') {
                          setIsCustomTitle(false);
                          handleChange(field, '');
                        } else {
                          setIsCustomTitle(false);
                          handleChange(field, value);
                        }
                      }}
                    >
                      <SelectTrigger
                        className={`bg-background ${errors[field] && !isCustomTitle ? 'border-destructive ring-destructive' : ''}`}
                      >
                        <SelectValue placeholder={t('q.t.personal.titlePlaceholder', 'Titel auswählen')} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="none">
                          {t('q.t.personal.noTitle', '(Keinen Titel angeben)')}
                        </SelectItem>
                        {predefinedTitles.map((tItem) => (
                          <SelectItem key={tItem} value={tItem}>
                            {tItem}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">
                          {t('q.t.personal.titleOther', 'Sonstiges (Eigene Eingabe)')}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {isCustomTitle && (
                      <Input
                        id={`${field}-custom`}
                        type="text"
                        value={data[field] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        placeholder={t(
                          'q.t.personal.customTitlePlaceholder',
                          'Bitte Titel eingeben...',
                        )}
                        className={`mt-2 bg-background ${errors[field] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                    )}
                  </>
                ) : (
                  <Input
                    id={field}
                    type="text"
                    value={data[field] || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className={`bg-background ${errors[field] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                )}

                {errors[field] && !isOptional && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {field === 'bday' 
                      ? (data[field]?.length === 10
                          ? t('q.t.personal.ageError', 'You must be at least 15 years old.')
                          : t('q.t.personal.incompleteDate', 'Bitte vollständiges Datum eingeben.'))
                      : t('q.common.required')}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* --- Profile Picture Preview Section --- */}
        <div className="space-y-3 mt-8 pt-8 border-t border-border">
          <Label htmlFor="profileUpload" className="text-foreground">
            {t('q.t.personal.profilePicture', 'Profilbild')}{' '}
            <span className="text-muted-foreground font-normal text-xs ml-1">
              ({t('q.common.optional')})
            </span>
          </Label>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Image Preview Area */}
            <div className="flex justify-center sm:justify-start">
              {data.profilePictureUrl ? (
                <img
                  src={data.profilePictureUrl}
                  alt={data.profilePictureName || t('patient.profile.therapistAvatar')}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-accent flex flex-col items-center justify-center text-muted-foreground gap-1 ring-2 ring-muted">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50" strokeWidth={1} />
                  <span className="text-[0.7rem] sm:text-xs text-center px-1">
                    {t('q.t.personal.noImage', 'Noch kein Bild')}
                  </span>
                </div>
              )}
            </div>

            {/* Upload Area */}
            <div className="flex-grow">
              <label
                htmlFor="profileUpload"
                className={`flex items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg transition-colors bg-background ${
                  isUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                } border-muted-foreground/30 hover:border-primary/50 group`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2 text-primary">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs font-medium text-center">
                      {t('q.common.uploading', 'Wird hochgeladen...')}
                    </span>
                  </div>
                ) : data.profilePictureName ? (
                  <div className="flex flex-col items-center gap-1 text-center px-4">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-xs break-all text-muted-foreground font-medium">
                      {data.profilePictureName}
                    </span>
                    <span className="text-[0.6rem] sm:text-xs text-primary font-medium mt-1 transition-opacity opacity-70 group-hover:opacity-100">
                      {t('q.common.clickToChange', 'Klicken zum Ändern')}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground px-4 text-center">
                    <Upload className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {t('q.t.personal.selectImage', 'Bild auswählen')}
                    </span>
                    <span className="text-xs opacity-70">JPG, PNG</span>
                  </div>
                )}
                <input
                  id="profileUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </div>

      </div>

      <div className={isUploading ? 'pointer-events-none opacity-50' : ''}>
        <NavigationButtons onNext={validateAndNext} onBack={onBack} />
      </div>
    </div>
  );
};

export default Step2_PersonalData;