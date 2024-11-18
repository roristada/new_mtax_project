import React from 'react';
import { useTranslations } from 'next-intl';

const Contact = () => {
  const t = useTranslations('Contact');

  return (
    <section id="contact" className="container mx-auto px-5 py-4">
      <h3 className='flex justify-center opacity-40 -mb-10'>{t('title')}</h3>
      <div className="container px-5 py-24 mx-auto flex sm:flex-nowrap flex-wrap">
        <div className="lg:w-2/3 md:w-1/2 bg-black rounded-lg overflow-hidden sm:mr-10 p-1 flex items-end justify-start relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d968.3377925557148!2d100.50540979582155!3d13.877938388486172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e284cec3735f5f%3A0x9dcb655313b5540f!2z4Lia4Lij4Li04Lip4Lix4LiXIOC5gOC4reC5h-C4oeC5geC4l-C5h-C4geC4i-C5jCDguJrguLHguI3guIrguLXguK3guK3guJnguYTguKXguJnguYwg4LiI4Liz4LiB4Lix4LiU!5e0!3m2!1sth!2sth!4v1709710698609!5m2!1sth!2sth"
            width="100%"
            height="100%"
            loading="lazy"
          ></iframe>
        </div>
        <div className="lg:w-1/3 md:w-1/2 bg-white flex flex-col md:ml-auto w-full md:py-8 mt-8 md:mt-0">
          <h2 className="text-gray-900 text-lg mb-1 title-font font-semibold underline">
            {t('address.title')}
          </h2>
          <p className="leading-relaxed mb-3 text-gray-600">
            {t('address.companyName')}<br/>
            {t('address.companyAddress')}
          </p>
          <h2 className="text-gray-900 text-lg mb-0 title-font font-semibold underline">
            {t('contact.title')}
          </h2>
          <p className="leading-relaxed mb-1 text-gray-600">
            {t('contact.subtitle')}
          </p>
          <div className="relative mb-1">
            <h2 className="text-gray-900 text-lg mb-0 title-font font-semibold underline">
              {t('email.title')}
            </h2>
            <p>
              <a href={`mailto:${t('email.email1')}`} className="text-indigo-500 leading-relaxed">
                {t('email.email1')}
              </a>
            </p>
            <p>
              <a href={`mailto:${t('email.email2')}`} className="text-indigo-500 leading-relaxed">
                {t('email.email2')}
              </a>
            </p>
            <h1 className="text-gray-900 text-lg mb-0 title-font font-semibold underline">
              {t('tel.title')}
            </h1>
            <p className="">
              {t('tel.number1')}<br/>
              {t('tel.number2')}
            </p>
            <h1 className="text-gray-900 text-lg mb-0 title-font font-semibold underline">
              {t('fax.title')}
            </h1>
            <p className="">{t('fax.number')}</p>
            <h1 className="text-gray-900 text-lg mb-0 title-font font-semibold">
              {t('line.title')}
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;