// hooks/useStepValidation.ts
import { useState } from 'react';
import { ZodSchema } from 'zod'; // Import Zod for schema validation

interface UseStepValidationProps<T> {
  data: T;
  schema: ZodSchema<any>;
  onNext: () => void;
}

export const useStepValidation = <T>({ data, schema, onNext }: UseStepValidationProps<T>) => {
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const validateAndNext = () => {
    const result = schema.safeParse(data);

    if (result.success) {
      setErrors({});
      onNext();
    } else {
      // Transform Zod errors into your simple boolean map
      const fieldErrors: Record<string, boolean> = {};
      result.error.issues.forEach((issue) => {
        // issue.path[0] is the field name (e.g., "firstName")
        fieldErrors[issue.path[0] as string] = true;
      });
      setErrors(fieldErrors);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return {
    errors,
    validateAndNext,
    clearError,
  };
};
