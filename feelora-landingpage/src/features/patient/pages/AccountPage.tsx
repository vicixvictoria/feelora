import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { UserMinus, AlertTriangle, Loader2 } from 'lucide-react';
import { patientService } from '../api/patient-service';

const AccountPage = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // 1. Call backend mutation to delete the profile from the database
      const isDeleted = await patientService.deleteProfile();

      // 2. If it returns true, log the user out of Cognito to clear their session
      if (isDeleted) {
        // Checking for 'type:T' (Therapist) or 'type:P' (Pending Therapist)
        const isTherapist = user?.groups?.includes('type:T') || user?.groups?.includes('type:P');
        await logout(isTherapist ? 'therapist' : 'user');
      } else {
        throw new Error('Backend returned false for deletion.');
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Fehler beim Löschen des Kontos. Bitte versuche es später erneut.');
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-foreground mb-8">{t('settings.account.title')}</h1>

      <div className="feelora-card flex flex-col gap-6">
        {/* User Info Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">
            {t('settings.account.profile')}
          </h2>
          <p className="text-muted-foreground mb-4">{t('settings.account.subtitle')}</p>

          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">{t('settings.account.name')}</p>
            <p className="text-lg font-medium text-foreground">
              {user?.name} {user?.familyName}
            </p>
            <p className="text-sm text-muted-foreground mt-3">{t('settings.account.email')}</p>
            <p className="text-lg font-medium text-foreground">
              {user?.email || 'Keine Email hinterlegt'}
            </p>
          </div>
        </div>

        <hr className="border-border" />

        {/* Danger Zone */}
        <div>
          <h2 className="text-xl font-semibold text-destructive mb-1">
            {t('settings.account.achtung')}
          </h2>
          <p className="text-muted-foreground mb-4">{t('settings.account.achtungWarning')}</p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors"
            >
              <UserMinus className="w-5 h-5" />
              {t('settings.account.deleteAccount')}
            </button>
          ) : (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-destructive">
                    {t('settings.account.deleteAccount.sure')}
                  </h3>
                  <p className="text-sm text-destructive/80">
                    {t('settings.account.deleteAccount.hint')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t('settings.account.deleteAccount.confirm')
                  )}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-destructive text-white hover:bg-destructive/90 transition-colors disabled:opacity-50 min-w-[120px]"
                >
                  {t('settings.account.deleteAccount.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
