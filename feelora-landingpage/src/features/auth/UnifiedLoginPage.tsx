import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button-landing';
import { User, Stethoscope } from 'lucide-react'; 

function UnifiedLoginPage() {
  const { login, isLoading } = useAuth();
  const { t } = useTranslation();

  const handleLogin = (type: 'user' | 'therapist') => {
    // triggers the backend redirect logic already in your AuthContext
    login(type, '/'); 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4 pt-32 sm:pt-40">
      <div className="text-center mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('login.title')}</h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600">{t('login.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Patient Option */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-primary transition-all group">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('login.patient.title')}</h2>
          <p className="text-gray-500 mb-8 min-h-[3rem]">
            {t('login.patient.subtitle')}
          </p>
          <Button 
            onClick={() => handleLogin('user')} 
            className="w-full py-6 text-lg"
          >
            {t('login.continueSignIn.patient')}
          </Button>
        </div>

        {/* Therapist Option */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-secondary transition-all group">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
            <Stethoscope className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('login.therapist.title')}</h2>
          <p className="text-gray-500 mb-8 min-h-[3rem]">
            {t('login.therapist.subtitle')}
          </p>
          <Button 
            onClick={() => handleLogin('therapist')} 
            variant="outline"
            className="w-full py-6 text-lg border-secondary text-secondary hover:bg-secondary hover:text-white"
          >
            {t('login.continueSignIn.therapist')}
          </Button>
        </div>
      </div>

      <p className="mt-12 text-gray-500 text-sm">
        {t('login.termsAndConditions.start')} <a href="/termsandconditions" className="underline">{t('login.termsAndConditions.terms')}</a> {t('login.termsAndConditions.and')} <a href="https://www.iubenda.com/privacy-policy/89492002" className="underline">{t('login.termsAndConditions.conditions')}</a>.
      </p>
    </div>
  );
}

export default UnifiedLoginPage;