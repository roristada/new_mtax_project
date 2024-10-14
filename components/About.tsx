import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const About = () => {
  const [clientRendered, setClientRendered] = useState(false);
  const t = useTranslations('About');

  useEffect(() => {
    setClientRendered(true);
  }, []);

  return (
    <section id="about" className="container mx-auto my-10">
      <h3 className="flex justify-center opacity-40">{t('title')}</h3>
      <h1 className="flex justify-center text-4xl font-bold opacity-80 mt-3">{t('subtitle')}</h1>

      <div className="flex justify-between items-center mt-12 px-5">
        {clientRendered && (
          <div className="w-[50%] flex-col">
            <h1 className="text-4xl mb-4 text-[#DA0C81]">
              Mtax
              <span className="text-[#687EFF]"> Online Accounting: Payroll Outsourcing</span>
            </h1>
            <p>
              {t('description.part1')} <br />
              {t('description.part2')}
              <br />
              <span className="font-semibold underline">{t('description.policies')}</span>
              <br />
              {t('description.policy1')} <br />
              {t('description.policy2')} <br />
              {t('description.policy3')} <br />
              {t('description.policy4')} <br />
              <span className="font-semibold underline">{t('description.goal')}</span>
              <br />
              {t('description.goalDescription')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default About;
