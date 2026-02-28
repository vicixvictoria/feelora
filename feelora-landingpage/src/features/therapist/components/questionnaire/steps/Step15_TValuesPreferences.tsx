import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { useTranslation } from 'react-i18next';

interface ValuesPreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
  data: { selected: string[]; other: string };
  onDataChange: (data: { selected: string[]; other: string }) => void;
}

const Step15_TValuesPreferences = ({
  onNext,
  onBack,
  data,
  onDataChange,
}: ValuesPreferencesStepProps) => {
  const { t } = useTranslation();

  const valueOptions = [
    { id: 'lgbtq', label: t('q.t.valuesPreferences.lgbtq') },
    { id: 'cultural', label: t('q.t.valuesPreferences.cultural') },
    { id: 'executives', label: t('q.t.valuesPreferences.executives') },
    { id: 'relationships', label: t('q.t.valuesPreferences.relationships') },
    { id: 'workplace', label: t('q.t.valuesPreferences.workplace') },
    { id: 'expats', label: t('q.t.valuesPreferences.expats') },
    { id: 'feminist', label: t('q.t.valuesPreferences.feminist') },
    { id: 'lifeChanges', label: t('q.t.valuesPreferences.lifeChanges') },
    { id: 'experience10', label: t('q.t.valuesPreferences.experience10') },
    { id: 'supervision', label: t('q.t.valuesPreferences.supervision') },
    { id: 'none', label: t('q.t.valuesPreferences.none') },
  ];

  const handleToggle = (value: string) => {
    if (data.selected.includes(value)) {
      onDataChange({ ...data, selected: data.selected.filter((v) => v !== value) });
    } else {
      onDataChange({ ...data, selected: [...data.selected, value] });
    }
  };

  const handleOtherToggle = () => {
    if (data.selected.includes('Other')) {
      onDataChange({ ...data, selected: data.selected.filter((v) => v !== 'Other'), other: '' });
    } else {
      onDataChange({ ...data, selected: [...data.selected, 'Other'] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.t.valuesPreferences.title')}</h1>
        <p className="text-muted-foreground mb-2">
          {t('q.t.valuesPreferences.subtitle')}
        </p>
        <p className="text-sm text-muted-foreground">{t('q.t.valuesPreferences.multiSelect')}</p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <div className="grid grid-cols-1 gap-3">
          {valueOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={data.selected.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}

          {/* Other option */}
          <div className="space-y-3">
            <label
              htmlFor="t-values-other"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                id="t-values-other"
                checked={data.selected.includes('Other')}
                onCheckedChange={handleOtherToggle}
              />
              <span className="text-foreground">{t('q.t.valuesPreferences.other')}</span>
            </label>
            {data.selected.includes('Other') && (
              <Input
                type="text"
                placeholder={t('q.t.valuesPreferences.otherPlaceholder')}
                value={data.other}
                onChange={(e) => onDataChange({ ...data, other: e.target.value })}
                className="bg-background"
              />
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <NavigationButtons onNext={onNext} onBack={onBack} />
    </div>
  );
};

export default Step15_TValuesPreferences;
