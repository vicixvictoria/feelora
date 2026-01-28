import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// --- Contexts ---
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { TooltipProvider } from "@/components/ui/tooltip"; // Dashboard requirement

// --- Global UI ---
import { Toaster } from "@/components/ui/toaster"; // Dashboard Toasts
import { Toaster as Sonner } from "@/components/ui/sonner"; // Dashboard Toasts

// --- LANDING Page Imports ---
import { Navbar } from './features/landing/layout/Navbar';
import { Footer } from './features/landing/layout/Footer';
import { HeroSection } from './features/landing/pages/HeroSection';
import { ForPatientsSection } from './features/landing/pages/ForPatientsSection';
import { ForTherapistsSection } from './features/landing/pages/ForTherapistsSection';
import { WhyFeeloraSection } from './features/landing/pages/WhyFeeloraSection';
import { EvidenceBasedSection } from './features/landing/pages/EvidenceBasedSection';
import { TestimonialsSection } from './features/landing/pages/TestimonialsSection';
import { AboutUsPage } from './features/landing/pages/AboutUsPage';
import { PrivacyPolicyPage } from './features/landing/pages/PrivacyPolicyPage';
import { SupportPage } from './features/landing/pages/SupportPage';
import LoginPage from './features/auth/LoginPageNew';
import AuthCallback from './features/auth/AuthCallback';

// --- PATIENT DASHBOARD Imports ---
import PatientAppLayout from './features/patient/layout/AppLayout'; 
import PatientDashboard from './features/patient/pages/Dashboard';
import CalendarPage from './features/patient/pages/CalendarPage';
import ProfilePage from './features/patient/pages/ProfilePage';
import ChatPage from './features/patient/pages/ChatPage';
import MoodTrackerPage from './features/patient/pages/MoodTrackerPage';
import HomeworkPage from './features/patient/pages/HomeworkPage';
import NotFound from './features/patient/pages/NotFound';

// 1. Initialize Query Client
const queryClient = new QueryClient();

// --- Components ---

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

// --- Layout Wrappers ---

// 1. Wrapper for Landing Pages (Navbar + Footer)
const LandingLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        {/* Outlet renders the child route (HomePage, AboutUsPage, etc.) */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// 2. Wrapper for Patient Dashboard
//Wrap the Outlet in AppLayout that Sidebar appears
const PatientLayoutWrapper = () => {
  return (
    <PatientAppLayout>
      <Outlet />
    </PatientAppLayout>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Router>
            <AuthProvider>
              <ScrollToTop />
              <Toaster />
              <Sonner />

              <Routes>
                {/* === GROUP 1: Public Landing Pages === */}
                <Route element={<LandingLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/login" element={<LoginPage userType="user" />} />
                  <Route path="/loginTherapist" element={<LoginPage userType="therapist" />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  {/* <Route path="/legal" element={<LegalPage />} /> */}
                </Route>

                {/* === GROUP 2: Patient Dashboard === */}
                {/* All routes here are prefixed with /patient 
                    Example: /patient (dashboard), /patient/calendar 
                */}
                <Route path="/patient" element={<PatientLayoutWrapper />}>
                  <Route index element={<PatientDashboard />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="mood-tracker" element={<MoodTrackerPage />} />
                  <Route path="homework" element={<HomeworkPage />} />
                </Route>

                {/* Fallback for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </Router>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;