import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { UserMinus, AlertTriangle, Loader2 } from 'lucide-react';
//import { patientService } from '@/api/patientService'; // 

const AccountPage = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // 1. Call  backend mutation here to delete the profile from the database
      // await patientService.deleteProfile(); 
      
      // 2. Log the user out of Cognito to clear their session
      await logout(user?.groups?.includes('type:T') ? 'therapist' : 'user');
      
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Fehler beim Löschen des Kontos. Bitte versuche es später erneut.");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-foreground mb-8">Konto-Einstellungen</h1>
      
      <div className="feelora-card flex flex-col gap-6">
        {/* User Info Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Profil</h2>
          <p className="text-muted-foreground mb-4">Hier siehst du deine aktuellen Kontodaten.</p>
          
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-lg font-medium text-foreground">
              {user?.name} {user?.familyName}
            </p>
            <p className="text-sm text-muted-foreground mt-3">Email</p>
            <p className="text-lg font-medium text-foreground">
              {user?.email || "Keine Email hinterlegt"}
            </p>
          </div>
        </div>

        <hr className="border-border" />

        {/* Danger Zone */}
        <div>
          <h2 className="text-xl font-semibold text-destructive mb-1">Achtung!</h2>
          <p className="text-muted-foreground mb-4">
            Wenn du dein Konto löschst, werden alle deine Daten, Chats und Fortschritte unwiderruflich entfernt.
          </p>

          {!showConfirm ? (
            <button 
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors"
            >
              <UserMinus className="w-5 h-5" />
              Konto löschen
            </button>
          ) : (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-destructive">Bist du dir absolut sicher?</h3>
                  <p className="text-sm text-destructive/80">Diese Aktion kann nicht rückgängig gemacht werden.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-destructive text-white hover:bg-destructive/90 transition-colors disabled:opacity-50 min-w-[120px]"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ja, unwiderruflich löschen"}
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Abbrechen
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