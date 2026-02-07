import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import keynezLogo from '@/assets/keynez-logo.jpg';

const emailSchema = z.string().email();

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Blog', href: '/blog' },
];

const resourceLinks = [
  { label: 'Market Reports', href: '/reports' },
  { label: 'Property Guides', href: '/guides' },
  { label: 'Research Canvas', href: '/research-canvas' },
];

const supportLinks = [
  { labelKey: 'footer.contact', href: '/contact' },
  { labelKey: 'footer.terms', href: '/terms' },
  { labelKey: 'footer.privacy', href: '/privacy' },
];

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export function Footer() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast({ title: t('auth.invalidEmail'), variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const subscribers = JSON.parse(localStorage.getItem('keynez-subscribers') || '[]');
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem('keynez-subscribers', JSON.stringify(subscribers));
    }
    toast({ title: t('footer.subscribeSuccess') });
    setEmail('');
    setIsLoading(false);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Company */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/60">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/60">
              Resources
            </h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/60">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors duration-200"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect / Newsletter */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/60">
              Connect
            </h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-4">
              <Input
                type="email"
                placeholder={t('footer.newsletterPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 placeholder:text-primary-foreground/40 text-primary-foreground h-10 text-sm"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-10 text-sm font-medium"
              >
                {t('footer.subscribe')}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center">
              <img
                src={keynezLogo}
                alt="Keynez AI"
                className="h-8 w-auto object-contain brightness-0 invert opacity-60"
              />
            </Link>
            <p className="text-xs text-primary-foreground/40">
              © {currentYear} Keynez AI. {t('footer.copyright')}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
