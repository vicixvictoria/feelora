import { useState } from 'react';
import { Upload, Check, Loader2 } from 'lucide-react';
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
const optionalFields = ['title', 'profilePictureName'];

// Predefined Lists --> still needs translations
const predefinedJobs = [
  'Psychologische/r Psychotherapeut:in',
  'Ärztliche/r Psychotherapeut:in',
  'Psychiater:in',
  'Kinder- und Jugendlichenpsychotherapeut:in (KJP)',
  'Fachärzt:in für Psychosomatische Medizin und Psychotherapie',
  'Fachärzt:in für Psychiatrie und Psychotherapie',
  'Heilpraktiker:in für Psychotherapie',
  'Psychologische/r Berater:in',
  'Gestalttherapeut:in (ohne HP-Zulassung)',
  'Kunsttherapeut:in / Musiktherapeut:in',
];

//still needs translattions
const predefinedTitles = [
  'Dr. med.',
  'Dr. rer. nat.',
  'Dr. phil.',
  'Dr.',
  'Prof. Dr.',
  'Dipl.-Psych.',
  'Dipl.-Päd.',
  'M.Sc.',
  'B.Sc.',
  'M.A.',
];

// Define the Validation Schema
const step2Schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  bday: z
    .string()
    .min(1, 'Required')
    .refine(
      (val) => {
        const birthDate = new Date(val);
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
      { message: 'Underage' },
    ),
  gender: z.string().min(1, 'Required'),
  job: z.string().min(1, 'Required'),
  title: z.string().optional(),
  profilePictureName: z.string().optional(),
});

const Step2_PersonalData = ({ onNext, onBack, data, onDataChange }: PersonalDataStepProps) => {
  const { t } = useTranslation();

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

  // ORDER MATTERS: Job is 5th (Left), Title is 6th (Right)
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

  // Async upload handler for profile picture
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileToUpload = new File([file], 'profile', { type: file.type });
      await upload(fileToUpload, 'public');
      handleChange('profilePictureName', file.name);
    } catch (error) {
      console.error('Upload failed:', error);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(fieldLabels).map((field) => {
            const isOptional = optionalFields.includes(field);

            return (
              <div key={field} className="space-y-2 flex flex-col">
                {/* Dynamic Label */}
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
                ) : field === 'job' ? (
                  <>
                    <Select
                      value={isCustomJob ? 'other' : data[field] || ''}
                      onValueChange={(value) => {
                        if (value === 'other') {
                          setIsCustomJob(true);
                          handleChange(field, ''); // Clear the value so they have to type it
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

                    {/* Custom Input for Job */}
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
                          handleChange(field, ''); // Clear so they can type
                        } else if (value === 'none') {
                          setIsCustomTitle(false);
                          handleChange(field, ''); // Clear string in data
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

                    {/* Custom Input for Title */}
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
                    type={field === 'bday' ? 'date' : 'text'}
                    value={data[field] || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className={`bg-background ${errors[field] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                )}

                {/* Error message mapping */}
                {errors[field] && !isOptional && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {field === 'bday' && data[field]
                      ? t('q.t.personal.ageError', 'You must be at least 15 years old.')
                      : t('q.common.required')}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* --- Profile Picture Upload (Optional) --- */}
        <div className="space-y-2 mt-6 border-t border-border pt-6">
          <Label htmlFor="profileUpload" className="text-foreground">
            {t('q.t.personal.profilePicture', 'Profilbild')}{' '}
            <span className="text-muted-foreground font-normal text-xs ml-1">
              ({t('q.common.optional')})
            </span>
          </Label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="profileUpload"
              className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors bg-background ${
                isUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
              } border-muted-foreground/30 hover:border-primary/50`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-primary">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm font-medium">
                    {t('q.common.uploading', 'Wird hochgeladen...')}
                  </span>
                </div>
              ) : data.profilePictureName ? (
                <div className="flex flex-col items-center gap-1 text-foreground/80 p-4 text-center">
                  <Check className="w-6 h-6 text-green-500" />
                  <span className="text-sm break-all">{data.profilePictureName}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {t('q.common.clickToChange', 'Klicken zum Ändern')}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">
                    {t('q.t.personal.selectImage', 'Bild auswählen')}
                  </span>
                  <span className="text-xs">JPG, PNG</span>
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

      <div className={isUploading ? 'pointer-events-none opacity-50' : ''}>
        <NavigationButtons onNext={validateAndNext} onBack={onBack} />
      </div>
    </div>
  );
};

export default Step2_PersonalData;