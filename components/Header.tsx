import Image from "next/image";
import React from "react";
import { useLocale, useTranslations } from "next-intl";

const Header = () => {
  const locale = useLocale();
  const t = useTranslations('Header');

  return (
    <div className="bg-[#E0F4FF] min-h-[700px] flex justify-center items-center rounded-b-3xl">
      <div className="container mx-auto px-6 py-20 flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/2 space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="text-[#DA0C81]">{t('mtax')}</span>
            <span className="text-[#687EFF]">{t('onlineAccounting')}</span>
          </h1>

          <p className="text-lg leading-relaxed text-gray-700">
            {t('describe')}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-10">
            {partners.map((partner, index) => (
              <a 
                key={index}
                href={partner.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
              >
                <Image
                  className="w-16 h-16 rounded-full object-cover"
                  src={partner.image}
                  width={64}
                  height={64}
                  alt={`Partner logo ${index + 1}`}
                />
              </a>
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center">
          <Image
            className="rounded-full object-cover w-full max-w-[500px]"
            src="/images/about1.png"
            alt="Business professionals in meeting"
            width={500}
            height={500}
            priority
          />
        </div>
      </div>
    </div>
  );
};

const partners = [
  { url: 'https://flowaccount.com', image: '/images/partner2.jpg' },
  { url: 'https://www.myaccount-cloud.com', image: '/images/partner1.jpg' },
  { url: 'https://peakaccount.com/main.html', image: '/images/partner0.jpg' },
  { url: 'https://www.tfac.or.th/', image: '/images/partner4.jpg' },
  { url: 'https://www.tfac.or.th/', image: '/images/partner3.JPG' },
];

export default Header;
