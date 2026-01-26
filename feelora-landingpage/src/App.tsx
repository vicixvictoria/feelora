import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './features/landing/Navbar';
import { HeroSection } from './features/landing/HeroSection';
import { ForPatientsSection } from './features/landing/ForPatientsSection';
import { ForTherapistsSection } from './features/landing/ForTherapistsSection';
import { WhyFeeloraSection } from './features/landing/WhyFeeloraSection';
import { EvidenceBasedSection } from './features/landing/EvidenceBasedSection';
import { TestimonialsSection } from './features/landing/TestimonialsSection';
import { Footer } from './features/landing/Footer';
import { AboutUsPage } from './features/landing/AboutUsPage';
import { PrivacyPolicyPage } from './features/landing/PrivacyPolicyPage';
import { SupportPage } from './features/landing/SupportPage';
import LoginPage from './features/auth/LoginPageNew';
import AuthCallback from './features/auth/AuthCallback';


function HomePage() {
  return (
    <>
      <HeroSection />
      <ForPatientsSection />
      <ForTherapistsSection />
      <WhyFeeloraSection />
      <EvidenceBasedSection />
      <TestimonialsSection />
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AuthProvider>
          <ScrollToTop />
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/login" element={<LoginPage userType="user" />} />
                <Route path="/loginTherapist" element={<LoginPage userType="therapist" />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/support" element={<SupportPage />} />
                {/*<Route path="/legal" element={<LegalPage />} />*/}
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </Router>
    </LanguageProvider>
  );
}

export default App;
