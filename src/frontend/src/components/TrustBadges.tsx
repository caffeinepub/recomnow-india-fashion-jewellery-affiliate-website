import { memo } from 'react';

interface TrustBadgesProps {
  badges: ('ssl' | 'amazon-verified' | 'genuine' | 'return-guarantee' | 'secure-checkout' | 'discount' | 'kolkata')[];
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

const TrustBadges = memo(({ badges, className = '', layout = 'horizontal' }: TrustBadgesProps) => {
  const badgeConfig = {
    ssl: {
      src: '/assets/generated/badge-ssl.dim_200x80.png',
      alt: 'SSL Protected – Safe & Secure / SSL সুরক্ষিত – নিরাপদ শপিং',
    },
    'amazon-verified': {
      src: '/assets/generated/badge-amazon-verified.dim_200x80.png',
      alt: 'Amazon Verified Affiliate / Amazon অনুমোদিত পার্টনার',
    },
    genuine: {
      src: '/assets/generated/badge-genuine.dim_200x80.png',
      alt: '100% Genuine – Star Rated Items / ১০০% আসল – স্টার রেটেড প্রোডাক্টস',
    },
    'return-guarantee': {
      src: '/assets/generated/badge-return-guarantee.dim_200x80.png',
      alt: 'Amazon Return & Refund Guarantee / Amazon রিটার্ন ও রিফান্ড গ্যারান্টি',
    },
    'secure-checkout': {
      src: '/assets/generated/badge-secure-checkout.dim_200x80.png',
      alt: 'Secure Amazon Checkout / Amazon এ নিরাপদ চেকআউট',
    },
    discount: {
      src: '/assets/generated/badge-discount.dim_200x80.png',
      alt: 'Up to 87% OFF – Limited Stock! / ৮৭% পর্যন্ত ছাড় – সীমিত স্টক!',
    },
    kolkata: {
      src: '/assets/generated/badge-kolkata.dim_150x60.png',
      alt: 'Kolkata Based',
    },
  };

  const layoutClass = layout === 'vertical' 
    ? 'flex flex-col gap-4 items-center' 
    : 'flex flex-wrap gap-4 items-center justify-center';

  return (
    <div className={`${layoutClass} ${className}`} role="list" aria-label="Trust badges">
      {badges.map((badge) => {
        const config = badgeConfig[badge];
        const isKolkata = badge === 'kolkata';
        return (
          <div 
            key={badge} 
            role="listitem" 
            className={`flex-shrink-0 min-w-fit ${isKolkata ? 'h-16' : 'h-24'} flex items-center justify-center`}
          >
            <img
              src={config.src}
              alt={config.alt}
              className="h-full w-auto object-contain"
              loading="lazy"
            />
          </div>
        );
      })}
    </div>
  );
});

TrustBadges.displayName = 'TrustBadges';

export default TrustBadges;
