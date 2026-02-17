import { useState, useEffect } from 'react';
import { useGetPage, useBulkUpdatePages } from '../../hooks/useQueries';
import { Loader2, Save, FileText } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const PAGE_KEYS = {
  privacy: 'privacy-policy',
  terms: 'terms-of-service',
  contact: 'contact',
};

export default function SitePagesManagement() {
  const { data: privacyPage } = useGetPage(PAGE_KEYS.privacy);
  const { data: termsPage } = useGetPage(PAGE_KEYS.terms);
  const { data: contactPage } = useGetPage(PAGE_KEYS.contact);
  const bulkUpdatePages = useBulkUpdatePages();

  const [privacyTitle, setPrivacyTitle] = useState('');
  const [privacyContent, setPrivacyContent] = useState('');
  const [termsTitle, setTermsTitle] = useState('');
  const [termsContent, setTermsContent] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [contactContent, setContactContent] = useState('');

  // Initialize form values when data loads
  useEffect(() => {
    if (privacyPage) {
      setPrivacyTitle(privacyPage.title);
      setPrivacyContent(privacyPage.content);
    } else {
      setPrivacyTitle('Privacy Policy');
      setPrivacyContent('Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information.\n\nInformation We Collect:\n- Email addresses for newsletter subscriptions\n- Usage data and analytics\n\nHow We Use Your Information:\n- To send you newsletters and updates\n- To improve our services\n- To comply with legal obligations\n\nData Protection:\nWe implement appropriate security measures to protect your personal information.\n\nContact Us:\nIf you have any questions about this privacy policy, please contact us.');
    }
  }, [privacyPage]);

  useEffect(() => {
    if (termsPage) {
      setTermsTitle(termsPage.title);
      setTermsContent(termsPage.content);
    } else {
      setTermsTitle('Terms of Service');
      setTermsContent('Welcome to RecomNow India. By using our website, you agree to these terms of service.\n\nAffiliate Disclosure:\nRecomNow India is a participant in various affiliate programs. We may earn commissions from qualifying purchases made through links on our site.\n\nContent:\nAll product recommendations and content are provided for informational purposes only. We strive to provide accurate information but cannot guarantee the accuracy of all product details.\n\nUser Conduct:\nYou agree to use our website only for lawful purposes and in a way that does not infringe the rights of others.\n\nLimitation of Liability:\nRecomNow India is not responsible for any damages arising from the use of our website or products purchased through affiliate links.\n\nChanges to Terms:\nWe reserve the right to modify these terms at any time. Continued use of the site constitutes acceptance of modified terms.');
    }
  }, [termsPage]);

  useEffect(() => {
    if (contactPage) {
      setContactTitle(contactPage.title);
      setContactContent(contactPage.content);
    } else {
      setContactTitle('Contact Us');
      setContactContent('Get in Touch with RecomNow India\n\nWe\'d love to hear from you! Whether you have questions, feedback, or partnership inquiries, feel free to reach out.\n\nEmail: contact@recomnow.in\n\nSocial Media:\n- Facebook: facebook.com/recomnow\n- WhatsApp: Available on our website\n\nBusiness Hours:\nMonday - Friday: 9:00 AM - 6:00 PM IST\nSaturday: 10:00 AM - 4:00 PM IST\nSunday: Closed\n\nFor partnership and collaboration inquiries, please email us with "Partnership" in the subject line.');
    }
  }, [contactPage]);

  const handleSaveAll = async () => {
    const pages: Array<[string, string, string]> = [
      [PAGE_KEYS.privacy, privacyTitle, privacyContent],
      [PAGE_KEYS.terms, termsTitle, termsContent],
      [PAGE_KEYS.contact, contactTitle, contactContent],
    ];

    try {
      await bulkUpdatePages.mutateAsync(pages);
    } catch (error) {
      console.error('Save pages error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Site Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Edit content for site pages
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={bulkUpdatePages.isPending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-rainbow text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
        >
          {bulkUpdatePages.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save All Pages
            </>
          )}
        </button>
      </div>

      {/* Privacy Policy */}
      <div className="bg-muted/20 rounded-xl p-6 border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-primary-magenta" />
          <h4 className="text-lg font-semibold text-foreground">Privacy Policy</h4>
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="privacy-title" className="text-sm font-medium text-foreground">
              Page Title
            </Label>
            <Input
              id="privacy-title"
              value={privacyTitle}
              onChange={(e) => setPrivacyTitle(e.target.value)}
              placeholder="Privacy Policy"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="privacy-content" className="text-sm font-medium text-foreground">
              Content
            </Label>
            <Textarea
              id="privacy-content"
              value={privacyContent}
              onChange={(e) => setPrivacyContent(e.target.value)}
              placeholder="Enter privacy policy content..."
              rows={8}
              className="mt-1 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Terms of Service */}
      <div className="bg-muted/20 rounded-xl p-6 border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-primary-magenta" />
          <h4 className="text-lg font-semibold text-foreground">Terms of Service</h4>
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="terms-title" className="text-sm font-medium text-foreground">
              Page Title
            </Label>
            <Input
              id="terms-title"
              value={termsTitle}
              onChange={(e) => setTermsTitle(e.target.value)}
              placeholder="Terms of Service"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="terms-content" className="text-sm font-medium text-foreground">
              Content
            </Label>
            <Textarea
              id="terms-content"
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
              placeholder="Enter terms of service content..."
              rows={8}
              className="mt-1 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-muted/20 rounded-xl p-6 border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-primary-magenta" />
          <h4 className="text-lg font-semibold text-foreground">Contact</h4>
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="contact-title" className="text-sm font-medium text-foreground">
              Page Title
            </Label>
            <Input
              id="contact-title"
              value={contactTitle}
              onChange={(e) => setContactTitle(e.target.value)}
              placeholder="Contact Us"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="contact-content" className="text-sm font-medium text-foreground">
              Content
            </Label>
            <Textarea
              id="contact-content"
              value={contactContent}
              onChange={(e) => setContactContent(e.target.value)}
              placeholder="Enter contact page content..."
              rows={8}
              className="mt-1 font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
