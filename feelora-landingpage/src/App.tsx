import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ForPatientsSection } from './components/ForPatientsSection';
import { ForTherapistsSection } from './components/ForTherapistsSection';
import { WhyFeeloraSection } from './components/WhyFeeloraSection';
import { EvidenceBasedSection } from './components/EvidenceBasedSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { AboutUsPage } from './components/AboutUsPage';
import LoginPage from './pages/LoginPage';

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

function clearURLSearchParams() {
  const url = new URL(window.location.href);
  url.search = ''; // Clear the search params
  window.history.replaceState({}, '', url.toString());
}

function App() {
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check for authentication errors in URL params
    const eventualError = new URLSearchParams(window.location.search).get('error_description');
    if (eventualError && !errorModalVisible) {
      console.error('Error during authentication:', eventualError);
      setErrorMessage(eventualError);
      setErrorModalVisible(true);
      clearURLSearchParams();
    }
  }, [errorModalVisible]);

  return (
    <LanguageProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/login" element={<LoginPage />} />
              {/*<Route path="/legal" element={<LegalPage />} />*/}
            </Routes>
          </main>
          <Footer />
        </div>

        {/* Error Modal */}
        {errorModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-red-600 mb-4">Login Failed</h3>
              <p className="text-gray-700 mb-6">
                {errorMessage || 'An unknown error occurred during login.'}
              </p>
              <button
                onClick={() => setErrorModalVisible(false)}
                className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Router>
    </LanguageProvider>
  );
}

export default App;
