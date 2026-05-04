import { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, ArrowLeft, CheckCircle, FileText, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '../api/admin-service';
import { useS3Download } from '@/hooks/use-s3-download';
import NotFound from '@/features/patient/pages/NotFound';
import { jwtDecode } from 'jwt-decode';

// --- Types ---

interface PendingPreview {
  Id: string;
  Email: string;
  Name: string;
  Surname: string;
}

interface TherapistProfile {
  Id: string;
  Email: string;
  Name: string;
  Surname: string;
  Gender: string;
  BirthDate: number;
  City: string;
  Languages: string[];
  Availability: string[];
  Specialties: string[];
  Plan: string;
  Address?: string;
  LicenseData: string;
  LicenseVerified: string;
  Title?: string;
  JobTitle: string;
  PriceRange: string;
  HasInsurance: boolean;
}

interface Questionnaire {
  Id: string;
  Type: string;
  Questionnaire: string;
}

// --- S3 Document Download Button ---

/**
 * Fetches a private S3 presigned URL for a specific document belonging to a therapist
 * and opens it in a new tab. The `ownerSub` is the therapist's Cognito sub.
 */
const DocumentDownloadButton = ({
  label,
  filename,
  ownerSub,
}: {
  label: string;
  filename: string;
  ownerSub: string;
}) => {
  const { download, imageUrl } = useS3Download();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      await download(filename, 'private', ownerSub);
    } catch (err) {
      setError('Could not fetch document');
      console.error(`Failed to download ${filename}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Once the presigned URL resolves to a blob URL, open it in a new tab
  useEffect(() => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  }, [imageUrl]);

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
      >
        <span className="flex items-center justify-center w-4 h-4">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        </span>
        <span>{label}</span>
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

// --- Therapist Detail View ---

const TherapistDetail = ({
  therapistId,
  onBack,
  onApproved,
}: {
  therapistId: string;
  onBack: () => void;
  onApproved: () => void;
}) => {
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      // Load profile — this is required, fail hard if it errors
      let profileData = null;
      try {
        profileData = await adminService.getPendingProfile(therapistId);
      } catch (err) {
        console.error('Admin: getPendingProfile error:', err);
        if (!cancelled) setError('Failed to load therapist profile.');
        if (!cancelled) setLoading(false);
        return;
      }

      // Load questionnaire — optional, don't block on failure
      let questionnaireData = null;
      try {
        questionnaireData = await adminService.getPendingQuestionnaire(therapistId);
      } catch (err) {
        console.warn('Admin: getPendingQuestionnaire error (non-fatal):', err);
      }

      if (!cancelled) {
        setProfile(profileData);
        setQuestionnaire(questionnaireData);
        setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [therapistId]);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await adminService.approveTherapist(therapistId);
      onApproved();
    } catch (err) {
      console.error('Admin: approve error:', err);
      alert('Approval failed. Please try again.');
      setIsApproving(false);
      setShowApproveConfirm(false);
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
    return <div className="text-center text-destructive mt-10">{error ?? 'Profile not found.'}</div>;
  }

  const age = profile.BirthDate
    ? Math.floor((Date.now() - profile.BirthDate * 1000) / 31557600000)
    : 'N/A';

  // LicenseData and Questionnaire are AWSJSON strings — parse them for display
  let licenseData: Record<string, unknown> = {};
  try {
    licenseData = JSON.parse(profile.LicenseData);
  } catch {
    licenseData = { raw: profile.LicenseData };
  }

  let questionnaireData: Record<string, unknown> = {};
  try {
    questionnaireData = questionnaire ? JSON.parse(questionnaire.Questionnaire) : {};
  } catch {
    questionnaireData = { raw: questionnaire?.Questionnaire };
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to list
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-6">
        Therapist Review:{' '}
        <span className="text-primary">
          {profile.Title ? `${profile.Title} ` : ''}
          {profile.Name} {profile.Surname}
        </span>
      </h1>

      {/* Profile card */}
      <div className="feelora-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-foreground">
          <p><span className="font-medium">Email:</span> {profile.Email}</p>
          <p><span className="font-medium">Gender:</span> {profile.Gender}</p>
          <p><span className="font-medium">Age:</span> {age}</p>
          <p><span className="font-medium">City:</span> {profile.City}</p>
          {profile.Address && <p><span className="font-medium">Address:</span> {profile.Address}</p>}
          <p><span className="font-medium">Job Title:</span> {profile.JobTitle}</p>
          <p><span className="font-medium">Price Range:</span> {profile.PriceRange}</p>
          <p><span className="font-medium">Insurance:</span> {profile.HasInsurance ? 'Yes' : 'No'}</p>
          <p><span className="font-medium">License Verified:</span> {profile.LicenseVerified}</p>
          <p><span className="font-medium">Plan:</span> {profile.Plan}</p>
          <p><span className="font-medium">Languages:</span> {profile.Languages?.join(', ')}</p>
          <p><span className="font-medium">Availability:</span> {profile.Availability?.join(', ')}</p>
          <p className="sm:col-span-2">
            <span className="font-medium">Specialties:</span> {profile.Specialties?.join(', ')}
          </p>
        </div>
      </div>

      {/* License data card */}
      <div className="feelora-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">License Data</h2>
        </div>
        <pre className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg overflow-auto whitespace-pre-wrap break-all mb-4">
          {JSON.stringify(licenseData, null, 2)}
        </pre>

        {/* S3 document download buttons — private files owned by this therapist */}
        <div className="flex flex-wrap gap-3">
          <DocumentDownloadButton
            label="Download License PDF"
            filename="license"
            ownerSub={profile.Id}
          />
          <DocumentDownloadButton
            label="Download Passport"
            filename="passport"
            ownerSub={profile.Id}
          />
        </div>
      </div>

      {/* Questionnaire card */}
      {questionnaire && (
        <div className="feelora-card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Questionnaire{questionnaire.Type ? ` — ${questionnaire.Type}` : ''}
            </h2>
          </div>
          <pre className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg overflow-auto whitespace-pre-wrap break-all">
            {JSON.stringify(questionnaireData, null, 2)}
          </pre>
        </div>
      )}

      {/* Approve section */}
      <div className="feelora-card border-primary/30">
        {!showApproveConfirm ? (
          <button
            onClick={() => setShowApproveConfirm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Approve Therapist
          </button>
        ) : (
          <div className="space-y-4">
            <p className="font-medium text-foreground">
              Did you send an email to communicate the approval yet?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isApproving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Yes, approve now
              </button>
              <button
                onClick={() => setShowApproveConfirm(false)}
                disabled={isApproving}
                className="px-5 py-2.5 rounded-lg font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Admin Page ---

const AdminPage = () => {
  const { user, idToken, accessToken, isLoading } = useAuth();

  // Decode both tokens to find where the groups claim lives
  useEffect(() => {
    if (!isLoading) {
      console.log('[Management] parsed user:', user);
      if (idToken) {
        console.log('[Management] idToken decoded:', jwtDecode<Record<string, unknown>>(idToken));
      }
      if (accessToken) {
        console.log('[Management] accessToken decoded:', jwtDecode<Record<string, unknown>>(accessToken));
      }
    }
  }, [user, idToken, accessToken, isLoading]);

  // Mirror the exact pattern used in RequireAuth
  const groups = user?.groups || [];
  const isAdmin = groups.includes('Admin');

  const [pendingList, setPendingList] = useState<PendingPreview[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchPendingList = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const result = await adminService.getPendingProfiles();
      setPendingList(result);
    } catch (err) {
      setListError('Failed to load pending therapists.');
      console.error('Admin: fetch pending error:', err);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchPendingList();
  }, [isAdmin, fetchPendingList]);

  // While auth is resolving, show nothing (avoids flicker)
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return <NotFound />;

  // When a therapist is selected, show their detail view
  if (selectedId) {
    return (
      <TherapistDetail
        therapistId={selectedId}
        onBack={() => setSelectedId(null)}
        onApproved={() => {
          setSelectedId(null);
          fetchPendingList();
        }}
      />
    );
  }

  // --- Pending therapists list view ---
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pending Therapists</h1>
        <button
          onClick={fetchPendingList}
          disabled={listLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          title="Reload list"
        >
          <RefreshCw className={`w-4 h-4 ${listLoading ? 'animate-spin' : ''}`} />
          Reload
        </button>
      </div>

      {listLoading && (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      )}

      {!listLoading && listError && (
        <p className="text-center text-destructive">{listError}</p>
      )}

      {!listLoading && !listError && pendingList.length === 0 && (
        <p className="text-center text-muted-foreground">No pending therapists at the moment.</p>
      )}

      {!listLoading && !listError && pendingList.length > 0 && (
        <div className="flex flex-col gap-3">
          {pendingList.map((t) => (
            <button
              key={t.Id}
              onClick={() => setSelectedId(t.Id)}
              className="feelora-card text-left hover:border-primary/50 hover:shadow-md transition-all w-full"
            >
              <p className="font-semibold text-foreground">
                {t.Name} {t.Surname}
              </p>
              <p className="text-sm text-muted-foreground">{t.Email}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
