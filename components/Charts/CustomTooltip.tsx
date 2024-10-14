import React from 'react';
import { useTranslations } from 'next-intl';

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string | number;
    labelFormatter?: (label: string | number) => string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, labelFormatter }) => {
    const t = useTranslations('Charts');

    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-3 rounded-md border shadow-md">
          <p className="label">{`${t('year')}: ${labelFormatter ? labelFormatter(label ?? '') : label}`}</p>
          <ul className="list">
            {payload.map((entry, index) => (
              <li key={`item-${index}`} style={{ color: entry.color }}>
                <span>{t(`labels.${entry.dataKey.toLowerCase()}`)}: </span>
              <span style={{ color: 'black', marginLeft: '5px' }}>
                {new Intl.NumberFormat(t('locale'), {
                  style: 'currency',
                  currency: t('currencyCode'),
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(entry.value)}
              </span>
            </li>
            ))}
          </ul>
        </div>
      );
    }
  
    return null;
  };

  export default CustomTooltip;
