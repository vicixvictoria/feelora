import { useTranslation } from 'react-i18next';

export const TitleFrame = () => {
  const { t } = useTranslation();
  return (
    <header className="inline-flex flex-col items-center gap-2.5 relative max-w-7xl mx-auto px-8">
      <div className="relative w-full">
        <h1 className="text-center [font-family:'Sora',Helvetica] font-normal text-transparent">
          <span className="font-semibold text-[#4baa94] font-heading-sorabold-5 text-[40px] sm:text-[48px] md:text-[60px] lg:text-[72px] leading-[1.2]">
            {t('hero.title.feel')}
          </span>
          <span className="font-semibold text-[#2f3e46] font-heading-sorabold-5 text-[40px] sm:text-[48px] md:text-[60px] lg:text-[72px] leading-[1.2]">
            {t('hero.title.ora')}
          </span>
          <span className="font-sans text-[#4f378b] text-[20px] sm:text-[24px] md:text-[30px] lg:text-[36px] leading-[1.2] block">
            {t('hero.subtitle')}
          </span>
        </h1>
      </div>
      <p className="relative w-full text-center text-body-large font-normal mt-6">
        <span className="font-sans text-[#2f3e46] text-h3 text-[18px] sm:text-[24px] md:text-[30px] lg:text-[36px] leading-[1.2]">
          {t('hero.description')}
        </span>
      </p>
    </header>
  );
};
