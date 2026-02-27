import { memo } from 'react';

interface TrustBadgesProps {
  badges: ('kolkata' | 'amazon-associates' | 'safe-checkout' | 'money-back' | 'ssl-secure')[];
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

const TrustBadges = memo(({ badges, className = '', layout = 'horizontal' }: TrustBadgesProps) => {
  const badgeConfig = {
    'kolkata': {
      src: '/assets/image-7.png',
      alt: 'Kolkata Based / কলকাতা ভিত্তিক',
      width: 120,
      height: 48,
    },
    'amazon-associates': {
      src: '/assets/image-8.png',
      alt: 'Amazon Associates Partner / Amazon অ্যাসোসিয়েটস পার্টনার',
      width: 120,
      height: 48,
    },
    'safe-checkout': {
      src: '/assets/image-9.png',
      alt: 'Safe & Secure Checkout / নিরাপদ ও সুরক্ষিত চেকআউট',
      width: 80,
      height: 80,
    },
    'money-back': {
      src: '/assets/image-10.png',
      alt: 'Money Back 100% Guaranteed / ১০০% টাকা ফেরত গ্যারান্টি',
      width: 80,
      height: 80,
    },
    'ssl-secure': {
      src: '/assets/image-11.png',
      alt: '100% Secure Transactions SSL Secure / ১০০% সুরক্ষিত লেনদেন SSL সিকিউর',
      width: 80,
      height: 80,
    },
  };

  const layoutClass = layout === 'vertical'
    ? 'flex flex-col gap-4 items-center'
    : 'flex flex-row flex-wrap gap-3 items-center justify-center';

  return (
    <div className={`${layoutClass} ${className}`} role="list" aria-label="Trust badges">
      {badges.map((badge) => {
        const config = badgeConfig[badge];
        return (
          <div
            key={badge}
            role="listitem"
            className="flex items-center justify-center flex-shrink-0"
          >
            <img
              src={config.src}
              alt={config.alt}
              width={config.width}
              height={config.height}
              className="object-contain"
              style={{ width: config.width, height: config.height }}
              loading="lazy"
              decoding="async"
            />
          </div>
        );
      })}
    </div>
  );
});

TrustBadges.displayName = 'TrustBadges';

export default TrustBadges;
