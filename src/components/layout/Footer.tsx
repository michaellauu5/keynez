import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import keynestLogo from '@/assets/keynest-logo.png';
const emailSchema = z.string().email();
const quickLinks = [{
  labelKey: 'footer.about',
  href: '/about'
}, {
  labelKey: 'footer.contact',
  href: '/contact'
}, {
  labelKey: 'footer.terms',
  href: '/terms'
}, {
  labelKey: 'footer.privacy',
  href: '/privacy'
}];
const socialLinks = [{
  icon: Facebook,
  href: 'https://facebook.com',
  label: 'Facebook'
}, {
  icon: Instagram,
  href: 'https://instagram.com',
  label: 'Instagram'
}, {
  icon: Twitter,
  href: 'https://twitter.com',
  label: 'Twitter'
}, {
  icon: Linkedin,
  href: 'https://linkedin.com',
  label: 'LinkedIn'
}];
export function Footer() {
  const {
    t
  } = useTranslation();
  const {
    toast
  } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast({
        title: t('auth.invalidEmail'),
        variant: 'destructive'
      });
      return;
    }
    setIsLoading(true);

    // Store to localStorage for now (can migrate to Supabase later)
    const subscribers = JSON.parse(localStorage.getItem('keynest-subscribers') || '[]');
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem('keynest-subscribers', JSON.stringify(subscribers));
    }
    toast({
      title: t('footer.subscribeSuccess')
    });
    setEmail('');
    setIsLoading(false);
  };
  const currentYear = new Date().getFullYear();
  return <footer className="text-primary-foreground border-t border-border bg-secondary">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img alt="Keynest AI" className="h-10 w-auto brightness-0 invert opacity-100 object-fill border-primary-foreground" src="/lovable-uploads/cc98441b-879d-49b8-a5ae-e5177fbdbf52.jpg" />
            </Link>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map(link => <li key={link.labelKey}>
                  <Link to={link.href} className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                    {t(link.labelKey)}
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.connect')}</h3>
            <div className="flex gap-3">
              {socialLinks.map(social => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors" aria-label={social.label}>
                  <social.icon className="h-5 w-5" />
                </a>)}
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.newsletter')}</h3>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <Input type="email" placeholder={t('footer.newsletterPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} className="bg-primary-foreground/10 border-primary-foreground/20 placeholder:text-primary-foreground/50 text-primary-foreground" />
              <Button type="submit" variant="secondary" disabled={isLoading} className="w-full">
                {t('footer.subscribe')}
              </Button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo at bottom left */}
            <Link to="/" className="flex items-center">
              <img src={keynestLogo} alt="Keynest AI" className="h-14 w-auto md:h-16 max-w-[200px] md:max-w-[280px] object-contain brightness-0 invert" />
            </Link>
            
            {/* Copyright */}
            <p className="text-sm text-primary-foreground/60">
              © {currentYear} Keynest AI. {t('footer.copyright')}.
            </p>
          </div>
        </div>
      </div>
    </footer>;
}