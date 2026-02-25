import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './lib/apolloClient';
import { Amplify } from 'aws-amplify';
import { amplifyConfig } from './config/amplify'; // Default to standard user

// --- Contexts ---
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { TooltipProvider } from '@/components/ui/tooltip'; // Dashboard requirement
import { RequireAuth } from '@/components/auth/RequireAuth'; // Patients and Therapists require Auth

// --- Global UI ---
import { Toaster } from '@/components/ui/toaster'; // Dashboard Toasts
import { Toaster as Sonner } from '@/components/ui/sonner'; // Dashboard Toasts

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
import PatientQuestionnaire from './features/patient/pages/PatientQuestionnaire';

// --- THERAPIST Imports Dummy Dashboard ---
import TherapistLayout from './features/therapist/layout/TherapistLayout';
import TherapistChat from './features/therapist/pages/TherapistChat';
import TherapistMoodTrackerPage from './features/therapist/pages/TherapistMoodTrackerPage';
import TherapistQuestionnaire from './features/therapist/pages/TherapistQuestionnaire';
import TherapistProfilePage from './features/therapist/pages/TherapistProfilePage';
import TherapistHomeworkPage from './features/therapist/pages/TherapistHomeworkPage';
import TherapistPatientsPage from './features/therapist/pages/TherapistPatientsPage';
import TherapistCalendarPage from './features/therapist/pages/TherapistCalendarPage';

// --- Amplify Configuration ---
Amplify.configure(amplifyConfig); // Use the default configuration (standard user pool) for the entire app.

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

const TherapistLayoutWrapper = () => (
  <TherapistLayout>
    <Outlet />
  </TherapistLayout>
);

function App() {
  return (
    <ApolloProvider client={apolloClient}>
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
                  </Route>
                  {/* 🚧 TEST ONLY: Temporary access to test UI without login 🚧 */}
                  <Route path="/test-therapist" element={<TherapistQuestionnaire />} />
                  <Route path="/test-patient" element={<PatientQuestionnaire />} />
                  {/* === GROUP 2: Patient Dashboard (Protected)=== */}
                  {/* Only Patient Users. Therapists are BLOCKED. */}
                  {/* Wrap patient dashboard and screening with RequireAuth */}
                  <Route element={<RequireAuth allowedType="user" />}>
                    {/* Questionnaire Pages (Protected) */}
                    <Route path="/patient/questionnaire" element={<PatientQuestionnaire />} />

                    {/* All routes here are prefixed with /patient
                    Example: /patient (dashboard), /patient/calendar 
                    QU
                */}
                    <Route path="/patient" element={<PatientLayoutWrapper />}>
                      <Route index element={<ChatPage />} />
                      <Route path="calendar" element={<CalendarPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="dashboard" element={<PatientDashboard />} />
                      <Route path="mood-tracker" element={<MoodTrackerPage />} />
                      <Route path="homework" element={<HomeworkPage />} />
                    </Route>
                  </Route>{' '}
                  {/* End of Patient Protected Routes*/}
                  {/* === GROUP 3: THERAPIST DASHBOARD (Protected) === */}
                  {/* Only Therapists. Patients are BLOCKED. */}
                  {/* Wrap therapist dashboard and screening with RequireAuth */}
                  <Route element={<RequireAuth allowedType="therapist" />}>
                    {/* Questionnaire Pages (Protected) */}
                    <Route path="/therapist/questionnaire" element={<TherapistQuestionnaire />} />

                    {/* All routes here are prefixed with /patient
                    Example: /patient (dashboard), /patient/calendar 
                    QU
                */}
                    <Route path="/therapist" element={<TherapistLayoutWrapper />}>
                      <Route index element={<TherapistChat />} />
                      <Route path="mood-tracker" element={<TherapistMoodTrackerPage />} />
                      <Route path="profile" element={<TherapistProfilePage />} />
                      <Route path="homework" element={<TherapistHomeworkPage />} />
                      <Route path="patients" element={<TherapistPatientsPage />} />
                      <Route path="calendar" element={<TherapistCalendarPage />} />
                    </Route>
                  </Route>
                  {/* Fallback for 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </Router>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
}

export default App;
