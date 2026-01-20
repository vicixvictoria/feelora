import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ForPatientsSection } from './components/ForPatientsSection';
import { ForTherapistsSection } from './components/ForTherapistsSection';
import { WhyFeeloraSection } from './components/WhyFeeloraSection';
import { EvidenceBasedSection } from './components/EvidenceBasedSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { AboutUsPage } from './components/AboutUsPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { SupportPage } from './components/SupportPage';
import LoginPage from './pages/LoginPageNew';
import AuthCallback from './pages/AuthCallback';


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
