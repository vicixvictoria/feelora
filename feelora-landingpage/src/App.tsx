import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './lib/apollo-client';
import { Amplify } from 'aws-amplify';
import { amplifyConfig } from './config/amplify';

// --- Contexts ---
import { AuthProvider } from './contexts/AuthContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { RequireAuth } from '@/components/auth/RequireAuth';

// --- Global UI ---
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

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
import AccountPage from './features/patient/pages/AccountPage';
import MoodTrackerDetailsPage from './features/patient/pages/MoodTrackerDetailsPage';
import EditProfilePage from './features/patient/pages/EditProfilePage';

// --- THERAPIST Imports ---
import TherapistLayout from './features/therapist/layout/TherapistLayout';
import TherapistChat from './features/therapist/pages/TherapistChat';
import TherapistMoodTrackerPage from './features/therapist/pages/TherapistMoodTrackerPage';
import TherapistQuestionnaire from './features/therapist/pages/TherapistQuestionnaire';
import TherapistProfilePage from './features/therapist/pages/TherapistProfilePage';
import TherapistHomeworkPage from './features/therapist/pages/TherapistHomeworkPage';
import TherapistPatientsPage from './features/therapist/pages/TherapistPatientsPage';
import TherapistCalendarPage from './features/therapist/pages/TherapistCalendarPage';
import TherapistAccountPage from './features/therapist/pages/TherapistAccountPage';
import TherapistMoodTrackerDetailsPage from './features/therapist/pages/TherapistMoodTrackerDetailsPage';
import TherapistEditProfilePage from './features/therapist/pages/TherapistEditProfilePage';
import { WebsocketProvider } from './contexts/WebsocketContext';

// --- Amplify Configuration ---
Amplify.configure(amplifyConfig);

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

// --- Root Layout (provides AuthProvider + global UI) ---

function RootLayout() {
  return (
    <AuthProvider>
      <WebsocketProvider>
        <ScrollRestoration />
        <Toaster />
        <Sonner />
        <Outlet />
      </WebsocketProvider>
    </AuthProvider>
  );
}

// --- Layout Wrappers ---

const LandingLayout = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

const PatientLayoutWrapper = () => (
  <PatientAppLayout>
    <Outlet />
  </PatientAppLayout>
);

const TherapistLayoutWrapper = () => (
  <TherapistLayout>
    <Outlet />
  </TherapistLayout>
);

// --- Router ---

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public landing pages
      {
        element: <LandingLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/about', element: <AboutUsPage /> },
          { path: '/login', element: <LoginPage userType="user" /> },
          { path: '/loginTherapist', element: <LoginPage userType="therapist" /> },
          { path: '/auth/callback', element: <AuthCallback /> },
          { path: '/privacy', element: <PrivacyPolicyPage /> },
          { path: '/support', element: <SupportPage /> },
        ],
      },
      // Test routes
      { path: '/test-therapist', element: <TherapistQuestionnaire /> },
      { path: '/test-patient', element: <PatientQuestionnaire /> },
      // Patient protected routes
      {
        element: <RequireAuth allowedType="user" />,
        children: [
          { path: '/patient/questionnaire', element: <PatientQuestionnaire /> },
          {
            path: '/patient',
            element: <PatientLayoutWrapper />,
            children: [
              { index: true, element: <ChatPage /> },
              { path: 'calendar', element: <CalendarPage /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'dashboard', element: <PatientDashboard /> },
              { path: 'mood-tracker', element: <MoodTrackerPage /> },
              { path: 'homework', element: <HomeworkPage /> },
              { path: 'account', element: <AccountPage /> },
              { path: 'dashboard/details', element: <MoodTrackerDetailsPage /> },
              { path: 'profile/edit', element: <EditProfilePage /> },
            ],
          },
        ],
      },
      // Therapist protected routes
      {
        element: <RequireAuth allowedType="therapist" />,
        children: [
          { path: '/therapist/questionnaire', element: <TherapistQuestionnaire /> },
          {
            path: '/therapist',
            element: <TherapistLayoutWrapper />,
            children: [
              { index: true, element: <TherapistChat /> },
              { path: 'mood-tracker', element: <TherapistMoodTrackerPage /> },
              { path: 'profile', element: <TherapistProfilePage /> },
              { path: 'homework', element: <TherapistHomeworkPage /> },
              { path: 'patients', element: <TherapistPatientsPage /> },
              { path: 'calendar', element: <TherapistCalendarPage /> },
              { path: 'account', element: <TherapistAccountPage /> },
              { path: 'mood-tracker/details', element: <TherapistMoodTrackerDetailsPage /> },
              { path: 'profile/edit', element: <TherapistEditProfilePage /> },
            ],
          },
        ],
      },
      // 404
      { path: '*', element: <NotFound /> },
    ],
  },
]);

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
}

export default App;
