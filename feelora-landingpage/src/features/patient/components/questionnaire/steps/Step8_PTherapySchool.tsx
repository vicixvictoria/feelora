import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Button as QuestionnaireButton } from '@/components/ui/questionnaire/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import NavigationButtons from '@/components/questionnaire/NavigationButton';
import { z } from 'zod';
import { useStepValidation } from '@/hooks/use-step-validation';
import { useTranslation } from 'react-i18next';
import { TherapySchoolData, TherapySchoolId, TherapySchoolQuizAnswer } from '@/features/patient/types/questionnaire';

interface TherapySchoolStepProps {
  onNext: () => void;
  onBack: () => void;
  data: TherapySchoolData;
  onDataChange: (data: TherapySchoolData) => void;
}

// 1. Define stable internal values for exclusive/conditional options
const OTHER_VALUE = 'Andere';
const IDK_OPTION = 'Ich weiß es nicht';

// 2. Determination quiz: 10 questions, each answer maps 1:1 to a therapy school orientation
const QUIZ_TOTAL = 10;

interface QuizOption {
  school: TherapySchoolId;
  labelKey: string;
}

interface QuizQuestionDef {
  id: number;
  questionKey: string;
  options: QuizOption[];
}

const QUIZ_QUESTIONS: QuizQuestionDef[] = Array.from({ length: QUIZ_TOTAL }, (_, i) => {
  const n = i + 1;
  return {
    id: n,
    questionKey: `q.p.therapySchool.quiz.q${n}.question`,
    options: [
      { school: 'psychodynamic', labelKey: `q.p.therapySchool.quiz.q${n}.a` },
      { school: 'humanistic', labelKey: `q.p.therapySchool.quiz.q${n}.b` },
      { school: 'systemic', labelKey: `q.p.therapySchool.quiz.q${n}.c` },
      { school: 'behavioral', labelKey: `q.p.therapySchool.quiz.q${n}.d` },
    ],
  };
});

// Step Component
const Step8_PTherapySchool = ({ onNext, onBack, data, onDataChange }: TherapySchoolStepProps) => {
  const { t } = useTranslation();

  const quizAnswers = data.quizAnswers ?? [];
  const hasCompletedQuiz = quizAnswers.length >= QUIZ_TOTAL;

  const [phase, setPhase] = useState<'main' | 'quiz'>(
    quizAnswers.length > 0 && !hasCompletedQuiz ? 'quiz' : 'main',
  );

  // 3. Define schema INSIDE the component using useMemo
  const step8Schema = useMemo(() => {
    return z
      .object({
        selected: z.array(z.string()),
        other: z.string().optional(),
        quizAnswers: z
          .array(z.object({ questionId: z.number(), school: z.string() }))
          .optional(),
      })
      .superRefine((valData, ctx) => {
        const quizDone = (valData.quizAnswers?.length ?? 0) >= QUIZ_TOTAL;

        if (!quizDone && valData.selected.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('q.p.therapySchool.error', 'Bitte wähle mindestens eine Option'),
            path: ['selected'],
          });
        }

        if (!quizDone && valData.selected.includes(OTHER_VALUE)) {
          if (!valData.other || valData.other.trim().length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('q.p.therapySchool.detailsError', 'Bitte spezifizieren'),
              path: ['other'],
            });
          }
        }
      });
  }, [t]);

  // 4. Define options with stable IDs for the backend, and translated labels for the UI
  const therapySchoolOptions = [
    { id: 'humanistic', label: t('q.p.therapySchool.options.humanistic') },
    { id: 'behavioral', label: t('q.p.therapySchool.options.behavioral') },
    { id: 'psychodynamic', label: t('q.p.therapySchool.options.psychodynamic') },
    { id: 'systemic', label: t('q.p.therapySchool.options.systemic') },
  ];

  // Initialize Validation Hook
  const { errors, validateAndNext, clearError } = useStepValidation({
    data,
    schema: step8Schema,
    onNext,
  });

  const isIdkSelected = data.selected.includes(IDK_OPTION);

  const handleToggle = (optionId: string) => {
    clearError('selected'); // Clear main error when user interacts

    // If user clicks a specific school, make sure "Ich weiß es nicht" is removed
    let currentSelection = data.selected.filter((s) => s !== IDK_OPTION);

    if (currentSelection.includes(optionId)) {
      currentSelection = currentSelection.filter((s) => s !== optionId);
    } else {
      currentSelection = [...currentSelection, optionId];
    }

    onDataChange({ ...data, selected: currentSelection });
  };

  // Handle toggle for "Other" option
  const handleOtherToggle = () => {
    clearError('selected');
    clearError('other'); // Clear specific error

    let currentSelection = data.selected.filter((s) => s !== IDK_OPTION);

    if (currentSelection.includes(OTHER_VALUE)) {
      onDataChange({
        ...data,
        selected: currentSelection.filter((s) => s !== OTHER_VALUE),
        other: '',
      });
    } else {
      onDataChange({ ...data, selected: [...currentSelection, OTHER_VALUE] });
    }
  };

  // Special handler for idk option
  const handleIdkToggle = () => {
    clearError('selected');
    clearError('other');

    if (isIdkSelected) {
      // Uncheck it
      onDataChange({ ...data, selected: [] });
    } else {
      // Check it, and wipe out everything else (including 'other' text)
      onDataChange({ ...data, selected: [IDK_OPTION], other: '' });
    }
  };

  // --- Determination quiz handlers ---
  const handleStartQuiz = () => {
    clearError('selected');
    clearError('other');
    setPhase('quiz');
  };

  const handleRetakeQuiz = () => {
    onDataChange({ ...data, quizAnswers: [] });
    setPhase('quiz');
  };

  const currentQuizIndex = quizAnswers.length;
  const currentQuizQuestion = QUIZ_QUESTIONS[currentQuizIndex];

  // Selecting an answer only stages it locally; the user must confirm with "Weiter" before it's recorded.
  const [pendingAnswer, setPendingAnswer] = useState<TherapySchoolId | null>(null);

  useEffect(() => {
    setPendingAnswer(null);
  }, [currentQuizIndex]);

  const handleQuizNext = () => {
    if (!currentQuizQuestion || !pendingAnswer) return;

    const nextAnswers: TherapySchoolQuizAnswer[] = [
      ...quizAnswers,
      { questionId: currentQuizQuestion.id, school: pendingAnswer },
    ];

    if (nextAnswers.length >= QUIZ_TOTAL) {
      // Quiz complete: the raw answers are sent to the backend, which runs the actual scoring.
      onDataChange({ selected: [], other: '', quizAnswers: nextAnswers });
      onNext();
    } else {
      onDataChange({ ...data, quizAnswers: nextAnswers });
    }
  };

  const handleQuizBack = () => {
    if (quizAnswers.length === 0) {
      setPhase('main');
      return;
    }
    onDataChange({ ...data, quizAnswers: quizAnswers.slice(0, -1) });
  };

  // --- Render: determination quiz phase ---
  if (phase === 'quiz' && currentQuizQuestion) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-2">
            {t('q.p.therapySchool.quiz.progress', {
              current: currentQuizIndex + 1,
              total: QUIZ_TOTAL,
              defaultValue: `Frage ${currentQuizIndex + 1} von ${QUIZ_TOTAL}`,
            })}
          </p>
          <h1 className="text-2xl font-bold text-purple mb-2">{t(currentQuizQuestion.questionKey)}</h1>
        </div>

        <div className="feelora-card">
          <RadioGroup
            key={currentQuizQuestion.id}
            value={pendingAnswer ?? undefined}
            onValueChange={(value) => setPendingAnswer(value as TherapySchoolId)}
            className="grid grid-cols-1 gap-3 p-1"
          >
            {currentQuizQuestion.options.map((option) => (
              <label
                key={option.school}
                htmlFor={`quiz-q${currentQuizQuestion.id}-${option.school}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <RadioGroupItem
                  value={option.school}
                  id={`quiz-q${currentQuizQuestion.id}-${option.school}`}
                />
                <span className="text-foreground">{t(option.labelKey)}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <QuestionnaireButton variant="navOutline" onClick={handleQuizBack}>
            <ArrowLeft className="w-4 h-4" />
            {t('q.common.back', 'Zurück')}
          </QuestionnaireButton>
          <QuestionnaireButton variant="nav" onClick={handleQuizNext} disabled={!pendingAnswer}>
            {t('q.common.next', 'Weiter')}
            <ArrowRight className="w-4 h-4" />
          </QuestionnaireButton>
        </div>
      </div>
    );
  }

  // --- Render: main selection phase ---
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple mb-2">{t('q.p.therapySchool.title')}</h1>
        <p className="text-muted-foreground mb-2">{t('q.p.therapySchool.subtitle')}</p>
        <p
          className={`text-sm ${errors.selected ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
        >
          {errors.selected ? t('q.p.therapySchool.error') : t('q.p.therapySchool.multiSelect')}
        </p>
      </div>

      {/* Form Card */}
      <div className="feelora-card">
        <div
          className={`grid grid-cols-1 gap-3 p-1 rounded-xl ${errors.selected ? 'border border-destructive/50 bg-destructive/5' : ''}`}
        >
          {/* Determination quiz entry point */}
          {hasCompletedQuiz ? (
            <div className="p-3 rounded-lg border border-border bg-muted/30 flex flex-col gap-2">
              <span className="text-sm text-foreground">
                {t(
                  'q.p.therapySchool.quiz.completedNotice',
                  'Du hast den Fragebogen zur Bestimmung deiner Therapieschule bereits beantwortet.',
                )}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetakeQuiz}
                className="self-start"
              >
                {t('q.p.therapySchool.quiz.retake', 'Fragebogen erneut ausfüllen')}
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-dashed border-border bg-muted/20 flex flex-col gap-2">
              <span className="text-sm text-foreground">{t('q.p.therapySchool.quiz.cta')}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartQuiz}
                className="self-start"
              >
                {t('q.p.therapySchool.quiz.ctaButton', 'Fragen beantworten')}
              </Button>
            </div>
          )}

          <div className="my-2 border-t border-border"></div>

          {/* Map through structured options */}
          {therapySchoolOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                isIdkSelected ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                checked={data.selected.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
                disabled={isIdkSelected}
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}

          {/* Other option */}
          <div className="space-y-3">
            <label
              htmlFor="p-therapy-school-other"
              className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                isIdkSelected ? 'opacity-50 bg-muted/30' : ''
              }`}
            >
              <Checkbox
                id="p-therapy-school-other"
                checked={data.selected.includes(OTHER_VALUE)}
                onCheckedChange={handleOtherToggle}
                disabled={isIdkSelected}
              />
              <span className="text-foreground">{t('q.p.therapySchool.other', 'Andere')}</span>
            </label>

            {data.selected.includes(OTHER_VALUE) && !isIdkSelected && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Input
                  type="text"
                  placeholder={t('q.p.therapySchool.specifyPlaceholder')}
                  value={data.other || ''}
                  onChange={(e) => {
                    clearError('other');
                    onDataChange({ ...data, other: e.target.value });
                  }}
                  className={`bg-background ${errors.other ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.other && (
                  <span className="text-xs text-destructive mt-1 ml-1">
                    {t('q.p.therapySchool.detailsError', 'Bitte gib Details an')}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="my-2 border-t border-border"></div>

          {/* I don't know option */}
          <label
            htmlFor="p-therapy-school-idk"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <Checkbox
              id="p-therapy-school-idk"
              checked={isIdkSelected}
              onCheckedChange={handleIdkToggle}
            />
            <span className="text-foreground font-medium">{t('q.p.therapySchool.idk')}</span>
          </label>
        </div>
      </div>

      <NavigationButtons onNext={validateAndNext} onBack={onBack} />
    </div>
  );
};

export default Step8_PTherapySchool;
