import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useStepValidation } from '@/hooks/use-step-validation';

interface PriceRangeStepProps {
  onNext: () => void;
  onBack: () => void;
  data: {
    kassenvertrag?: boolean;
    hasPrice?: boolean;
    priceDetails?: string;
  };
  onDataChange: (data: any) => void;
}

// Validation Schema
const stepSchema = z
  .object({
    kassenvertrag: z.boolean().optional(),
    hasPrice: z.boolean().optional(),
    priceDetails: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // If they check the box to provide a price, make sure they actually typed something
    if (data.hasPrice && (!data.priceDetails || data.priceDetails.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bitte gib einen Preis oder eine Preisspanne an.',
        path: ['priceDetails'],
      });
    }
  });

const Step15_1_TPriceRange = ({ onNext, onBack, data, onDataChange }: PriceRangeStepProps) => {
  const { t } = useTranslation();
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: stepSchema,
    onNext,
  });

  const handleCheckboxChange = (field: 'kassenvertrag' | 'hasPrice', checked: boolean) => {
    onDataChange({ ...data, [field]: checked });
    clearError(field);

    // Clear price details error if they uncheck the price option
    if (field === 'hasPrice' && !checked) {
      clearError('priceDetails');
    }
  };

  const handleTextChange = (value: string) => {
    onDataChange({ ...data, priceDetails: value });
    clearError('priceDetails');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">
          {t('q.t.price.title', 'Preise und Kosten')}
        </h1>
        <p className="text-muted-foreground">
          {t(
            'q.t.price.subtitle1',
            'Bitte teile uns die ungefähren Kosten pro Therapiestunde mit und ob du auch Kassenverträge hast.',
          )}
          <br />
          {t(
            'q.t.price.subtitle2',
            'Diese Information wird in deinem Profil angezeigt. Du kannst es jederzeit ändern.',
          )}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <div className="space-y-6">
          {/* Kassenvertrag Checkbox */}
          <div className="flex items-center space-x-3">
            <Checkbox
              id="kassenvertrag"
              checked={data.kassenvertrag || false}
              onCheckedChange={(checked) =>
                handleCheckboxChange('kassenvertrag', checked as boolean)
              }
            />
            <Label
              htmlFor="kassenvertrag"
              className="text-base font-normal cursor-pointer text-foreground"
            >
              {t('q.t.price.kassenvertrag', 'Kassenvertrag')}
            </Label>
          </div>

          {/* Price Range Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="hasPrice"
                checked={data.hasPrice || false}
                onCheckedChange={(checked) => handleCheckboxChange('hasPrice', checked as boolean)}
              />
              <Label
                htmlFor="hasPrice"
                className="text-base font-normal cursor-pointer text-muted-foreground"
              >
                {t('q.t.price.priceOption', 'entweder fixen Preis oder Preispanne angeben (in €)')}
              </Label>
            </div>

            {/* Textarea is always visible, regardless of checkbox state */}
            <div className="pl-7 animate-fade-in">
              <Textarea
                value={data.priceDetails || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={t('q.t.price.placeholder', 'hier tippen...')}
                className={`min-h-[100px] resize-y bg-background ${errors.priceDetails ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {errors.priceDetails && (
                <p className="text-xs text-destructive mt-1">{errors.priceDetails}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step15_1_TPriceRange;
