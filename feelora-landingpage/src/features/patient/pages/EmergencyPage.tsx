//import React from 'react';
import { useTranslation } from 'react-i18next';
import { PhoneCall, AlertTriangle } from 'lucide-react';

const EmergencyPage = () => {
  const { t } = useTranslation();

  const hotlines = [
    {
      id: 'ts',
      number: '142',
      name: t('app.emergency.hotlines.ts.name'),
      desc: t('app.emergency.hotlines.ts.desc'),
    },
    {
      id: 'psnd',
      number: '01 31330',
      name: t('app.emergency.hotlines.psnd.name'),
      desc: t('app.emergency.hotlines.psnd.desc'),
    },
    {
      id: 'rad',
      number: '147',
      name: t('app.emergency.hotlines.rad.name'),
      desc: t('app.emergency.hotlines.rad.desc'),
    },
    {
      id: 'rk',
      number: '116 123',
      name: t('app.emergency.hotlines.rk.name'),
      desc: t('app.emergency.hotlines.rk.desc'),
    },
    {
      id: 'fh',
      number: '0800 222 555',
      name: t('app.emergency.hotlines.fh.name'),
      desc: t('app.emergency.hotlines.fh.desc'),
    },
    {
      id: 'mn',
      number: '0800 246 247',
      name: t('app.emergency.hotlines.mn.name'),
      desc: t('app.emergency.hotlines.mn.desc'),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {t('app.emergency.title')}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          {t('app.emergency.subtitle.patient')}
        </p>
      </div>

      {/* Acute Emergency Banner */}
      <div className="bg-destructive/10 border-l-4 border-destructive rounded-r-lg p-6 mb-10 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 text-destructive">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-destructive mb-1">
            {t('app.emergency.acuteTitle')}
          </h2>
          <p className="text-foreground text-lg">
            {t('app.emergency.acuteDesc')}
          </p>
        </div>
        <div className="md:ml-auto flex gap-4 text-3xl font-black text-destructive tracking-wider">
          <span>144</span>
          <span className="text-muted-foreground/30">|</span>
          <span>112</span>
        </div>
      </div>

      {/* Hotlines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hotlines.map((hotline) => (
          <a
            key={hotline.id}
            href={`tel:${hotline.number.replace(/\s/g, '')}`}
            className="feelora-card flex items-start gap-4 hover:border-primary/50 transition-colors group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-1">
                {hotline.name}
              </h3>
              <p className="text-primary font-bold text-xl tracking-wide mb-1">
                {hotline.number}
              </p>
              <p className="text-sm text-muted-foreground">
                {hotline.desc}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default EmergencyPage;