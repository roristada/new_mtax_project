import React from 'react';
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';

const Services = () => {
  const t = useTranslations('Services');
  const locale = useLocale();

  // Create arrays of detail keys for each service
  const onlineAccountingKeys = ['details.0', 'details.1', 'details.2', 'details.3'];
  const payrollOutsourcingKeys = ['details.0', 'details.1', 'details.2', 'details.3'];
  const bookkeepingServicesKeys = ['details.0', 'details.1', 'details.2'];
  const businessStartupKeys = ['details.0', 'details.1', 'details.2', 'details.3', 'details.4'];

  return (
    <section id="service" className='container px-5 py-8 mx-auto'>
      <h3 className='flex justify-center opacity-40 mb-4'>{t('title')}</h3>
      <div className="flex flex-wrap -m-12">
        <div className="p-12 md:w-1/2 flex flex-col items-start">
          <h2 className="sm:text-3xl text-2xl title-font font-medium text-gray-900 mt-4 mb-4">{t('onlineAccounting.title')}</h2>
          <p className="leading-relaxed mb-8">{t('onlineAccounting.description')} <br />
            {onlineAccountingKeys.map((key, index) => (
              <React.Fragment key={index}>
                - {t(`onlineAccounting.${key}`)} <br />
              </React.Fragment>
            ))}
          </p>
          <div className="flex items-center flex-wrap pb-4 mb-4 border-b-2 border-gray-100 mt-auto w-full">
            <Link href={`/${locale}/service/online_accounting`} className="text-indigo-500 inline-flex items-center">{t('onlineAccounting.moreDetails')}
              <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
        <div className="p-12 md:w-1/2 flex flex-col items-start">
          <h2 className="sm:text-3xl text-2xl title-font font-medium text-gray-900 mt-4 mb-4">{t('payrollOutsourcing.title')}</h2>
          <p className="leading-relaxed mb-8">{t('payrollOutsourcing.description')} <br />
            {payrollOutsourcingKeys.map((key, index) => (
              <React.Fragment key={index}>
                - {t(`payrollOutsourcing.${key}`)} <br />
              </React.Fragment>
            ))}
          </p>
          <div className="flex items-center flex-wrap pb-4 mb-4 border-b-2 border-gray-100 mt-auto w-full">
            <Link href={`/${locale}/service/payroll`} className="text-indigo-500 inline-flex items-center">{t('payrollOutsourcing.moreDetails')}
              <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>  
        </div>
        <div className="p-12 md:w-1/2 flex flex-col items-start">
          <h2 className="sm:text-3xl text-2xl title-font font-medium text-gray-900 mt-4 mb-4">{t('bookkeepingServices.title')}</h2>
          <p className="leading-relaxed mb-8">{t('bookkeepingServices.description')} <br />
            {bookkeepingServicesKeys.map((key, index) => (
              <React.Fragment key={index}>
                - {t(`bookkeepingServices.${key}`)} <br />
              </React.Fragment>
            ))}
          </p>
          <div className="flex items-center flex-wrap pb-4 mb-4 border-b-2 border-gray-100 mt-auto w-full">
            <Link href={`/${locale}/service/book`} className="text-indigo-500 inline-flex items-center">{t('bookkeepingServices.moreDetails')}
              <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
        <div className="p-12 md:w-1/2 flex flex-col items-start">
          <h2 className="sm:text-3xl text-2xl title-font font-medium text-gray-900 mt-4 mb-4">{t('businessStartup.title')}</h2>
          <p className="leading-relaxed mb-8">{t('businessStartup.description')} <br />
            {businessStartupKeys.map((key, index) => (
              <React.Fragment key={index}>
                - {t(`businessStartup.${key}`)} <br />
              </React.Fragment>
            ))}
          </p>
          <div className="flex items-center flex-wrap pb-4 mb-4 border-b-2 border-gray-100 mt-auto w-full">
            <Link href={`/${locale}/service/business-startup`} className="text-indigo-500 inline-flex items-center">{t('businessStartup.moreDetails')}
              <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;
