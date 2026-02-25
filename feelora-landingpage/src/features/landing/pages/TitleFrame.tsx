import { useLanguage } from '@/contexts/LanguageContext';

export const TitleFrame = (): JSX.Element => {
  const { t } = useLanguage();
  return (
    <header className="inline-flex flex-col items-center gap-2.5 relative max-w-7xl mx-auto px-8">
      <div className="relative w-full">
        <h1 className="text-center [font-family:'Sora',Helvetica] font-normal text-transparent">
          <span className="font-semibold text-[#4baa94] font-heading-sorabold-5 text-[72px] leading-[72px]">
            {t('hero.title.feel')}
          </span>
          <span className="font-semibold text-[#2f3e46] font-heading-sorabold-5 text-[72px] leading-[72px]">
            {t('hero.title.ora')}
          </span>
          <span className="font-heading-sora-1 text-[#4f378b] text-[36px] leading-[40px] block">
            {t('hero.subtitle')}
          </span>
        </h1>
      </div>
      <p className="relative w-full text-center text-body-large font-normal mt-6">
        <span className="text-[#2f3e46] text-h3 text-[36px] leading-[32px]">
          {t('hero.description')}
        </span>
      </p>
    </header>
  );
};
