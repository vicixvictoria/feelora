import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowLeftIcon, ShieldIcon, FileTextIcon, CookieIcon } from 'lucide-react';
import { Button } from '@/components/ui/buttonLanding';
import { Card } from '@/components/ui/cardLanding';
import { useState } from 'react';

export function PrivacyPolicyPage() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [activeSection, setActiveSection] = useState<'privacy' | 'terms' | 'cookies'>('privacy');

  const sections = [
    { id: 'privacy' as const, label: 'Datenschutzerklärung', icon: ShieldIcon },
    { id: 'terms' as const, label: 'Nutzungsbedingungen', icon: FileTextIcon },
    { id: 'cookies' as const, label: 'Cookie-Richtlinie', icon: CookieIcon },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="py-24 px-8 bg-gradient-to-br from-tertiary/30 to-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-8 text-gray-700 hover:text-primary"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Zurück
            </Button>

            <h1 className="text-h1 font-headline font-bold text-[#4f378b] tracking-headline leading-headline mb-8">
              Feelora – Rechtliche Dokumente
            </h1>

            <div className="flex flex-wrap gap-4 mb-12">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? 'default' : 'outline'}
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-center gap-2"
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section ref={ref} className="py-12 px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            {activeSection === 'privacy' && <PrivacySection />}
            {activeSection === 'terms' && <TermsSection />}
            {activeSection === 'cookies' && <CookiesSection />}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function PrivacySection() {
  return (
    <Card className="p-12 bg-card border-border">
      <h2 className="text-h2 font-headline font-semibold text-gray-800 mb-6">
        1. Datenschutzerklärung (Privacy Policy)
      </h2>
      
      <div className="space-y-8 text-body leading-body" style={{ color: '#2F3E46' }}>
        <div>
          <p className="font-semibold mb-2">Stand: Oktober 2025</p>
          <p className="font-semibold mb-2">Verantwortlich:</p>
          <p>Feelora</p>
          <p>Feldkellergasse 24/16</p>
          <p>1130 Wien, Österreich</p>
          <p>E-Mail: info@feelora.com</p>
          <p>Web: www.feelora.com</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">1. Allgemeines</h3>
          <p>
            Der Schutz Ihrer persönlichen Daten ist uns ein zentrales Anliegen. Wir verarbeiten Ihre Daten ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, DSG). In dieser Datenschutzerklärung informieren wir Sie über Art, Umfang und Zweck der Erhebung und Verarbeitung personenbezogener Daten im Rahmen der Nutzung unserer Website und Plattform.
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">2. Verantwortliche Stelle</h3>
          <p>Verantwortlich für die Datenverarbeitung ist:</p>
          <p className="mt-2">Feelora: Aylin Schatz, Feldkellergasse 24/16, 1130 Wien, Österreich</p>
          <p>E-Mail: info@feelora.com</p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">3. Zweck und Umfang der Datenverarbeitung</h3>
          <p className="mb-3">Wir verarbeiten personenbezogene Daten, um:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nutzer:innen mit passenden Therapeut:innen zu verbinden,</li>
            <li>die Kommunikation zwischen Nutzer:innen und Therapeut:innen zu ermöglichen,</li>
            <li>Anfragen über das Kontaktformular zu beantworten,</li>
            <li>Nutzungsstatistiken zu erstellen und unsere Website zu optimieren,</li>
            <li>rechtliche Verpflichtungen zu erfüllen.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">4. Cookies und Tracking</h3>
          <p>
            Unsere Website verwendet Cookies, um Ihnen ein optimales Nutzungserlebnis zu bieten. Dazu zählen notwendige, Analyse- und Marketing-Cookies. Beim ersten Besuch werden Sie über ein Cookie-Banner informiert und können Ihre Einwilligung individuell erteilen.
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">5. Webanalyse</h3>
          <p>
            Wir verwenden Google Analytics (Google Ireland Limited, Dublin, Irland) zur Analyse des Nutzerverhaltens. Die Datenverarbeitung erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">6. Datenweitergabe und Auftragsverarbeiter</h3>
          <p>
            Eine Weitergabe erfolgt nur, wenn dies zur Erfüllung unserer Leistungen erforderlich ist oder Sie zugestimmt haben. Hosting über Amazon Web Services (AWS) mit Serverstandort in der EU.
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">7. Speicherdauer</h3>
          <p>
            Ihre Daten werden nur so lange gespeichert, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">8. Ihre Rechte</h3>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch und Widerruf. Anfragen: info@feelora.com
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">9. Sicherheit</h3>
          <p>
            Wir treffen technische und organisatorische Maßnahmen, um Ihre Daten zu schützen.
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">10. Änderungen</h3>
          <p>
            Diese Datenschutzerklärung kann angepasst werden. Die aktuelle Version ist auf unserer Website abrufbar.
          </p>
        </div>
      </div>
    </Card>
  );
}

function TermsSection() {
  return (
    <Card className="p-12 bg-card border-border">
      <h2 className="text-h2 font-headline font-semibold text-gray-800 mb-6">
        2. Nutzungsbedingungen (Terms & Conditions)
      </h2>
      
      <div className="space-y-8 text-body leading-body" style={{ color: '#2F3E46' }}>
        <p className="font-semibold">Stand: Oktober 2025</p>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">1. Geltungsbereich</h3>
          <p>
            Diese Nutzungsbedingungen gelten für die Nutzung der Website www.feelora.com und aller damit verbundenen Dienste von Feelora.
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">2. Leistungen von Feelora</h3>
          <p>
            Feelora ist eine digitale Plattform, die Nutzer:innen mit qualifizierten Therapeut:innen zusammenbringt. Wir bieten Matching, Mood-Tracking und Termin-Tools. Feelora selbst bietet keine psychotherapeutische Behandlung an.
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">3. Registrierung und Konto</h3>
          <p>
            Für bestimmte Funktionen ist ein Benutzerkonto erforderlich. Sie verpflichten sich, korrekte Angaben zu machen und Zugangsdaten vertraulich zu behandeln.
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">4. Pflichten der Nutzer:innen</h3>
          <p>
            Die Plattform darf nur zu legalen, persönlichen Zwecken genutzt werden. Inhalte dürfen nicht kopiert oder weitergegeben werden.
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">5. Haftungsausschluss</h3>
          <p>
            Feelora übernimmt keine Haftung für die Qualität der Beratungen, technische Ausfälle oder externe Links. Haftung nur bei grober Fahrlässigkeit oder Vorsatz.
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">6. Geistiges Eigentum</h3>
          <p>
            Alle Inhalte sind urheberrechtlich geschützt. Nutzung ohne Zustimmung ist untersagt.
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">7. Änderungen</h3>
          <p>
            Feelora kann diese Bedingungen jederzeit ändern. Mit fortgesetzter Nutzung stimmen Sie den Änderungen zu.
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">8. Anwendbares Recht</h3>
          <p>
            Es gilt österreichisches Recht. Gerichtsstand ist Wien.
          </p>
        </div>
      </div>
    </Card>
  );
}

function CookiesSection() {
  return (
    <Card className="p-12 bg-card border-border">
      <h2 className="text-h2 font-headline font-semibold text-gray-800 mb-6">
        3. Cookie-Richtlinie (Cookie Policy)
      </h2>
      
      <div className="space-y-8 text-body leading-body" style={{ color: '#2F3E46' }}>
        <p className="font-semibold">Stand: Oktober 2025</p>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">1. Was sind Cookies?</h3>
          <p>
            Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, um unsere Website funktionsfähig zu machen und Ihre Nutzererfahrung zu verbessern.
          </p>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">2. Wie wir Cookies verwenden</h3>
          <p className="mb-3">Feelora nutzt Cookies zu folgenden Zwecken:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Technisch notwendige Cookies:</strong> Login, Sicherheit</li>
            <li><strong>Analyse-Cookies:</strong> z. B. Google Analytics</li>
            <li><strong>Marketing-Cookies:</strong> z. B. Meta Pixel</li>
          </ul>
        </div>

        <div>
          <h3 className="text-h3 font-headline font-semibold text-gray-800 mb-4">3. Verwaltung Ihrer Cookie-Einstellungen</h3>
          <p>
            Sie können Ihre Einwilligung jederzeit über das Cookie-Banner oder Ihren Browser ändern oder widerrufen.
          </p>
        </div>

        <div className="mt-12 p-6 bg-tertiary/20 rounded-lg">
          <p className="font-semibold text-gray-800 mb-2">Kontakt für Datenschutzfragen:</p>
          <p>E-Mail: info@feelora.com</p>
          <p>Adresse: Feldkellergasse 24/16, 1130 Wien, Österreich</p>
        </div>
      </div>
    </Card>
  );
}
