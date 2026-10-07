// Drop-in stand-in for Apollo's useQuery in portfolio demo mode. Pages that
// used useQuery directly keep passing the same query documents; this hook
// resolves them by operation name from the demo services instead of the
// network, and re-runs whenever the demo store changes (taking over the job
// refetchQueries used to do after mutations).
import { useEffect, useState } from 'react';
import type { DocumentNode } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import { subscribeToDemoStore } from './demo-store';
import { patientService } from '@/features/patient/api/patient-service';
import { therapistService } from '@/features/therapist/api/therapist-service';

type MockResolver = (variables: Record<string, any>) => Promise<Record<string, unknown>>;

const resolvers: Record<string, MockResolver> = {
  GetOwnUserProfile: async () => ({ getOwnUserProfile: await patientService.getProfile() }),
  GetMatchedTherapists: async ({ TherapistsIds }) => ({
    getMatchedTherapists: { items: await patientService.getMatchedTherapists(TherapistsIds ?? []) },
  }),
  GetOwnTherapistProfile: async () => ({ getOwnTherapistProfile: await therapistService.getProfile() }),
};

interface MockQueryOptions {
  variables?: Record<string, any>;
  skip?: boolean;
  fetchPolicy?: string;
}

interface MockQueryResult {
  data: any;
  loading: boolean;
  error?: Error;
}

export function useMockQuery(query: DocumentNode, options: MockQueryOptions = {}): MockQueryResult {
  const operationName = getOperationName(query) ?? '';
  const skip = options.skip ?? false;
  const variablesKey = JSON.stringify(options.variables ?? {});

  const [result, setResult] = useState<MockQueryResult>({ data: undefined, loading: !skip });
  const [storeVersion, setStoreVersion] = useState(0);

  useEffect(() => subscribeToDemoStore(() => setStoreVersion((version) => version + 1)), []);

  useEffect(() => {
    if (skip) {
      setResult((previous) => ({ ...previous, loading: false }));
      return;
    }

    const resolver = resolvers[operationName];
    if (!resolver) {
      setResult({ data: undefined, loading: false, error: new Error(`[Demo mode] No mock for "${operationName}"`) });
      return;
    }

    let cancelled = false;
    // Only show a loading state on the first load, not on background refreshes.
    setResult((previous) => ({ ...previous, loading: previous.data === undefined }));
    resolver(JSON.parse(variablesKey))
      .then((data) => {
        if (cancelled) return;
        // Keep the previous reference when nothing changed, so effects keyed
        // on the data (e.g. edit forms populating themselves) don't re-run
        // because of an unrelated store update.
        setResult((previous) =>
          JSON.stringify(previous.data) === JSON.stringify(data)
            ? { data: previous.data, loading: false }
            : { data, loading: false },
        );
      })
      .catch((error: Error) => {
        if (!cancelled) setResult({ data: undefined, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, [operationName, skip, variablesKey, storeVersion]);

  return result;
}
