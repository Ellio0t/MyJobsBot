import React, { useState } from 'react';

interface CompanyLogoProps {
  logoUrl?: string;
  companyName: string;
  sizeClass?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  logoUrl,
  companyName,
  sizeClass = 'w-12 h-12',
}) => {
  const [error, setError] = useState(false);

  // Iniciales corporativas de respaldo
  const initials =
    companyName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'JB';

  if (!logoUrl || error) {
    return (
      <div
        className={`${sizeClass} rounded-xl border border-neutral-200 dark:border-[#2b313f] bg-neutral-100 dark:bg-[#181c26] flex items-center justify-center font-montserrat font-extrabold text-xs tracking-wider text-emerald-600 dark:text-[#4ade80] shadow-xs select-none shrink-0`}
        title={companyName}
      >
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-xl border border-neutral-200 dark:border-[#2b313f] bg-white dark:bg-[#181c26] flex items-center justify-center overflow-hidden shrink-0 shadow-xs p-1`}
    >
      <img
        src={logoUrl}
        alt={companyName}
        className="w-full h-full object-contain"
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
};

