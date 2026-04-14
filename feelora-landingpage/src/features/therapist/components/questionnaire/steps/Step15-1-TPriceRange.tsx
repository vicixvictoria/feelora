import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useStepValidation } from '@/hooks/use-step-validation';

interface PriceRangeStepProps {
  onNext: () => void;
  onBack: () => void;
  data: {
    kassenvertrag?: boolean;
    minPrice?: number;
    maxPrice?: number;
  };
  onDataChange: (data: any) => void;
}

// Validation Schema
const stepSchema = z.object({
  kassenvertrag: z.boolean().optional(),
  minPrice: z.number().min(0, 'Bitte gib einen Mindestpreis an.'),
  maxPrice: z.number().min(0, 'Bitte gib einen Höchstpreis an.'),
}).superRefine((data, ctx) => {
  if (data.minPrice > data.maxPrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Der Mindestpreis darf nicht größer als der Höchstpreis sein.',
      path: ['minPrice'],
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

  const handleCheckboxChange = (checked: boolean) => {
    onDataChange({ ...data, kassenvertrag: checked });
    clearError('kassenvertrag');
  };

  const handleMinPriceChange = (value: string) => {
    const num = value === '' ? undefined : Number(value);
    onDataChange({ ...data, minPrice: num });
    clearError('minPrice');
  };

  const handleMaxPriceChange = (value: string) => {
    const num = value === '' ? undefined : Number(value);
    onDataChange({ ...data, maxPrice: num });
    clearError('maxPrice');
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
              onCheckedChange={(checked) => handleCheckboxChange(checked as boolean)}
            />
            <Label
              htmlFor="kassenvertrag"
              className="text-base font-normal cursor-pointer text-foreground"
            >
              {t('q.t.price.kassenvertrag', 'Kassenvertrag')}
            </Label>
          </div>

          {/* Price Range Numeric Inputs */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="minPrice" className="block mb-1">
                {t('q.t.price.min', 'Mindestpreis (€)')}
              </Label>
              <Input
                id="minPrice"
                type="number"
                min={0}
                value={data.minPrice ?? ''}
                onChange={(e) => handleMinPriceChange(e.target.value)}
                className={errors.minPrice ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.minPrice && (
                <p className="text-xs text-destructive mt-1">{errors.minPrice}</p>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="maxPrice" className="block mb-1">
                {t('q.t.price.max', 'Höchstpreis (€)')}
              </Label>
              <Input
                id="maxPrice"
                type="number"
                min={0}
                value={data.maxPrice ?? ''}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
                className={errors.maxPrice ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.maxPrice && (
                <p className="text-xs text-destructive mt-1">{errors.maxPrice}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <NavigationButtons
        onNext={() => {
          // Convert min/max to string for saving
          if (typeof data.minPrice === 'number' && typeof data.maxPrice === 'number') {
            onDataChange({
              ...data,
              priceDetails: `${data.minPrice}-${data.maxPrice}`,
            });
          }
          validateAndNext();
        }}
        onBack={onBack}
      />
    </div>
  );
};

export default Step15_1_TPriceRange;
