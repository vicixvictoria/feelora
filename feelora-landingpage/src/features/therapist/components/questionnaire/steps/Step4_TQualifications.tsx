import { useState } from 'react';
import { Upload, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface QualificationsStepProps {
  onNext: () => void;
  onBack: () => void;
  data: Record<string, string>;
  onDataChange: (data: Record<string, string>) => void;
}

// Define Validation Schema
const step4Schema = z
  .object({
    titlePrefix: z.string().optional(),
    titleSuffix: z.string().optional(),
    titleFromPrefix: z.string().optional(),
    titleFromSuffix: z.string().optional(),

    // Mandatory fields
    licenseNumber: z.string().min(1, 'License required'),
    idFileName: z.string().min(1, 'Upload required'),

    // Optional field
    qualifications: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Custom Logic: At least one title must be filled out
    const hasPrefix = data.titlePrefix && data.titlePrefix.trim().length > 0;
    const hasSuffix = data.titleSuffix && data.titleSuffix.trim().length > 0;

    if (!hasPrefix && !hasSuffix) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Title required',
        path: ['titlePrefix'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Title required',
        path: ['titleSuffix'],
      });
    }
  });

const Step4_TQualifications = ({ onNext, onBack, data, onDataChange }: QualificationsStepProps) => {
  const { t } = useTranslation();

  // --- Predefined Titles ---
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
  ];

  // Local uploading state and initialize hook
  const [isUploading, setIsUploading] = useState(false);
  const { upload } = useS3Upload();

  // --- Track custom inputs for BOTH Prefix and Suffix ---
  const [isCustomPrefix, setIsCustomPrefix] = useState(() => {
    if (!data.titlePrefix) return false;
    return !predefinedTitles.includes(data.titlePrefix);
  });

  const [isCustomSuffix, setIsCustomSuffix] = useState(() => {
    if (!data.titleSuffix) return false;
    return !predefinedTitles.includes(data.titleSuffix);
  });

  // Initialize Validation Hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step4Schema,
    onNext,
  });

  const handleChange = (field: string, value: string) => {
    // If user types in either title, clear errors for both titles since the condition is met
    if (field === 'titlePrefix' || field === 'titleSuffix') {
      clearError('titlePrefix');
      clearError('titleSuffix');
    } else {
      clearError(field);
    }

    onDataChange({ ...data, [field]: value });
  };

  // async upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileToUpload = new File([file], 'license', { type: file.type });
      await upload(fileToUpload, 'private');
      clearError('idFileName');
      handleChange('idFileName', file.name);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(
        t(
          'q.t.qualifications.uploadError',
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
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.qualifications.title')}</h1>
        <p className="text-muted-foreground">{t('q.t.qualifications.subtitle')}</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {t('q.t.qualifications.cardTitle')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          
          {/* --- TITLE PREFIX DROPDOWN --- */}
          <div className="space-y-2 flex flex-col">
            <Label
              htmlFor="titlePrefix"
              className={errors.titlePrefix ? 'text-destructive' : 'text-foreground'}
            >
              {t('q.t.qualifications.titlePrefix')} {errors.titlePrefix && '*'}
            </Label>
            
            <Select
              value={isCustomPrefix ? 'other' : data.titlePrefix ? data.titlePrefix : 'none'}
              onValueChange={(value) => {
                if (value === 'other') {
                  setIsCustomPrefix(true);
                  handleChange('titlePrefix', ''); // Clear so they can type
                } else if (value === 'none') {
                  setIsCustomPrefix(false);
                  handleChange('titlePrefix', ''); // Clear string in data
                } else {
                  setIsCustomPrefix(false);
                  handleChange('titlePrefix', value);
                }
              }}
            >
              <SelectTrigger
                className={`bg-background ${errors.titlePrefix && !isCustomPrefix ? 'border-destructive ring-destructive' : ''}`}
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

            {/* Custom Input for Prefix */}
            {isCustomPrefix && (
              <Input
                id="titlePrefix-custom"
                type="text"
                value={data.titlePrefix || ''}
                onChange={(e) => handleChange('titlePrefix', e.target.value)}
                placeholder={t('q.t.personal.customTitlePlaceholder', 'Bitte Titel eingeben...')}
                className={`mt-2 bg-background ${errors.titlePrefix ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
            )}

            {errors.titlePrefix && (
              <p className="text-xs text-destructive">{t('q.t.qualifications.titleRequired')}</p>
            )}
          </div>

          {/* --- TITLE SUFFIX DROPDOWN --- */}
          <div className="space-y-2 flex flex-col">
            <Label
              htmlFor="titleSuffix"
              className={errors.titleSuffix ? 'text-destructive' : 'text-foreground'}
            >
              {t('q.t.qualifications.titleSuffix')}{' '}
              <span className={errors.titleSuffix ? 'text-destructive' : 'text-muted-foreground'}>
                ({t('q.common.optional')})
              </span>
            </Label>

            <Select
              value={isCustomSuffix ? 'other' : data.titleSuffix ? data.titleSuffix : 'none'}
              onValueChange={(value) => {
                if (value === 'other') {
                  setIsCustomSuffix(true);
                  handleChange('titleSuffix', ''); 
                } else if (value === 'none') {
                  setIsCustomSuffix(false);
                  handleChange('titleSuffix', ''); 
                } else {
                  setIsCustomSuffix(false);
                  handleChange('titleSuffix', value);
                }
              }}
            >
              <SelectTrigger
                className={`bg-background ${errors.titleSuffix && !isCustomSuffix ? 'border-destructive ring-destructive' : ''}`}
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

            {/* Custom Input for Suffix */}
            {isCustomSuffix && (
              <Input
                id="titleSuffix-custom"
                type="text"
                value={data.titleSuffix || ''}
                onChange={(e) => handleChange('titleSuffix', e.target.value)}
                placeholder={t('q.t.personal.customTitlePlaceholder', 'Bitte Titel eingeben...')}
                className={`mt-2 bg-background ${errors.titleSuffix ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
            )}
          </div>

          {/* Default Inputs for Title From */}
          <div className="space-y-2">
            <Label htmlFor="titleFromPrefix" className="text-foreground">
              {t('q.t.qualifications.titleFromPrefix')}
            </Label>
            <Input
              id="titleFromPrefix"
              type="text"
              value={data.titleFromPrefix || ''}
              onChange={(e) => handleChange('titleFromPrefix', e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="titleFromSuffix" className="text-foreground">
              {t('q.t.qualifications.titleFromSuffix')}
            </Label>
            <Input
              id="titleFromSuffix"
              type="text"
              value={data.titleFromSuffix || ''}
              onChange={(e) => handleChange('titleFromSuffix', e.target.value)}
              className="bg-background"
            />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <Label
            htmlFor="licenseNumber"
            className={errors.licenseNumber ? 'text-destructive' : 'text-foreground'}
          >
            {t('q.t.qualifications.licenseNumber')} {errors.licenseNumber && '*'}
          </Label>
          <Input
            id="licenseNumber"
            type="text"
            value={data.licenseNumber || ''}
            onChange={(e) => handleChange('licenseNumber', e.target.value)}
            placeholder={t('q.t.qualifications.licensePlaceholder')}
            className={`bg-background ${errors.licenseNumber ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          {errors.licenseNumber && (
            <p className="text-xs text-destructive">{t('q.t.qualifications.licenseRequired')}</p>
          )}
        </div>

        <div className="space-y-2 mb-6">
          <Label htmlFor="qualifications" className="text-foreground">
            {t('q.t.qualifications.qualifications')}{' '}
            <span className="text-muted-foreground">({t('q.common.optional')})</span>
          </Label>
          <Textarea
            id="qualifications"
            value={data.qualifications || ''}
            onChange={(e) => handleChange('qualifications', e.target.value)}
            className="bg-background min-h-[100px] resize-y"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="idUpload"
            className={errors.idFileName ? 'text-destructive font-medium' : 'text-foreground'}
          >
            {t('q.t.qualifications.idUpload')} {errors.idFileName && '*'} <br />
            <span className="text-muted-foreground text-sm font-normal">
              {t('q.t.qualifications.idUploadHint')}
            </span>
          </Label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="idUpload"
              className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors bg-background ${
                isUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
              } ${
                errors.idFileName
                  ? 'border-destructive/50 hover:border-destructive bg-destructive/5'
                  : 'border-muted-foreground/30 hover:border-primary/50'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-primary">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm font-medium">
                    {t('q.t.qualifications.uploading', 'Wird hochgeladen...')}
                  </span>
                </div>
              ) : data.idFileName ? (
                <div className="flex flex-col items-center gap-1 text-foreground/80 p-4 text-center">
                  <Check className="w-6 h-6 text-green-500" />
                  <span className="text-sm break-all">{data.idFileName}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {t('q.t.qualifications.clickToChange')}
                  </span>
                </div>
              ) : (
                <div
                  className={`flex flex-col items-center gap-1 ${errors.idFileName ? 'text-destructive' : 'text-muted-foreground'}`}
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">{t('q.t.qualifications.selectImage')}</span>
                  <span className="text-xs">{t('q.t.qualifications.fileTypes')}</span>
                </div>
              )}
              <input
                id="idUpload"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileUpload}
              />
            </label>
          </div>
          {errors.idFileName && (
            <p className="text-xs text-destructive">{t('q.t.qualifications.uploadRequired')}</p>
          )}
        </div>
      </div>

      <div className={isUploading ? 'pointer-events-none opacity-50' : ''}>
        <NavigationButtons onNext={validateAndNext} onBack={onBack} />
      </div>
    </div>
  );
};

export default Step4_TQualifications;