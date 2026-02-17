import { useGetPage } from '../hooks/useQueries';
import { X, Loader2 } from 'lucide-react';

interface PageModalProps {
  pageKey: string;
  onClose: () => void;
}

export default function PageModal({ pageKey, onClose }: PageModalProps) {
  const { data: page, isLoading } = useGetPage(pageKey);

  const getDefaultContent = () => {
    switch (pageKey) {
      case 'privacy-policy':
        return {
          title: 'Privacy Policy',
          content: 'Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information.\n\nInformation We Collect:\n- Email addresses for newsletter subscriptions\n- Usage data and analytics\n\nHow We Use Your Information:\n- To send you newsletters and updates\n- To improve our services\n- To comply with legal obligations\n\nData Protection:\nWe implement appropriate security measures to protect your personal information.\n\nContact Us:\nIf you have any questions about this privacy policy, please contact us.',
        };
      case 'terms-of-service':
        return {
          title: 'Terms of Service',
          content: 'Welcome to RecomNow India. By using our website, you agree to these terms of service.\n\nAffiliate Disclosure:\nRecomNow India is a participant in various affiliate programs. We may earn commissions from qualifying purchases made through links on our site.\n\nContent:\nAll product recommendations and content are provided for informational purposes only. We strive to provide accurate information but cannot guarantee the accuracy of all product details.\n\nUser Conduct:\nYou agree to use our website only for lawful purposes and in a way that does not infringe the rights of others.\n\nLimitation of Liability:\nRecomNow India is not responsible for any damages arising from the use of our website or products purchased through affiliate links.\n\nChanges to Terms:\nWe reserve the right to modify these terms at any time. Continued use of the site constitutes acceptance of modified terms.',
        };
      case 'contact':
        return {
          title: 'Contact Us',
          content: 'Get in Touch with RecomNow India\n\nWe\'d love to hear from you! Whether you have questions, feedback, or partnership inquiries, feel free to reach out.\n\nEmail: contact@recomnow.in\n\nSocial Media:\n- Facebook: facebook.com/recomnow\n- WhatsApp: Available on our website\n\nBusiness Hours:\nMonday - Friday: 9:00 AM - 6:00 PM IST\nSaturday: 10:00 AM - 4:00 PM IST\nSunday: Closed\n\nFor partnership and collaboration inquiries, please email us with "Partnership" in the subject line.',
        };
      default:
        return { title: 'Page Not Found', content: 'This page does not exist.' };
    }
  };

  const displayContent = page || getDefaultContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">{displayContent.title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-magenta" />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-foreground">
              {displayContent.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-gradient-rainbow text-white font-medium hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
