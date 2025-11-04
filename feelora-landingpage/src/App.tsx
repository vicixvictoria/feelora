import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ForPatientsSection } from './components/ForPatientsSection';
import { ForTherapistsSection } from './components/ForTherapistsSection';
import { WhyFeeloraSection } from './components/WhyFeeloraSection';
import { EvidenceBasedSection } from './components/EvidenceBasedSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { AboutUsPage } from './components/AboutUsPage';

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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutUsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
