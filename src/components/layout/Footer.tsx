import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Mail, MessageCircle } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Language, languageNames } from '@/translations';
import keynezLogo from '@/assets/keynez-logo.jpg';

const emailSchema = z.string().email();
const languages: Language[] = ['en', 'zh-HK', 'zh-CN'];

// Routes that exist today; others render as disabled placeholders.
const quickLinks = [
  { labelKey: 'footer.about', href: '/about', enabled: true },
  { labelKey: 'footer.contact', href: '/contact', enabled: true },
  { labelKey: 'footer.terms', href: '/terms', enabled: true },
  { labelKey: 'footer.privacy', href: '/privacy', enabled: true },
];

const companyLinks = [
  { labelKey: 'footer.about', href: '/about', enabled: true },
  { labelKey: 'footer.careers', href: '/careers', enabled: false },
  { labelKey: 'footer.press', href: '/press', enabled: false },
  { labelKey: 'footer.blog', href: '/blog', enabled: false },
];

export function Footer() {
  const { t, language, setLanguage } = useTranslation();
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
    const { error } = await supabase.from('subscribers').insert({ email });
    if (error && error.code !== '23505') {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('footer.subscribeSuccess') });
      setEmail('');
    }
    setIsLoading(false);
  };

  const currentYear = new Date().getFullYear();

  const renderLink = (link: { labelKey: string; href: string; enabled: boolean }) =>
    link.enabled ? (
      <Link
        to={link.href}
        className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
      >
        {t(link.labelKey)}
      </Link>
    ) : (
      <span
        aria-disabled="true"
        className="text-sm text-primary-foreground/40 cursor-not-allowed inline-flex items-center gap-2"
      >
        {t(link.labelKey)}
        <span className="text-[10px] uppercase tracking-wider rounded bg-primary-foreground/10 px-1.5 py-0.5">
          {t('footer.comingSoon')}
        </span>
      </span>
    );

  return (
    <footer className="text-primary-foreground border-t border-border bg-secondary">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="inline-block">
              <img src={keynezLogo} alt="Keynez AI" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              {t('footer.description')}
            </p>

            {/* Language Selector */}
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    {languageNames[language]}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-background">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={language === lang ? 'bg-accent' : ''}
                    >
                      {languageNames[lang]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.company')}</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.labelKey}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.contact')}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:hello@keynez.com"
                  className="text-sm text-primary-foreground/80 hover:text-accent transition-colors inline-flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  hello@keynez.com
                </a>
              </li>
              <li>
                <span
                  aria-disabled="true"
                  className="text-sm text-primary-foreground/40 cursor-not-allowed inline-flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('footer.whatsapp')}
                  <span className="text-[10px] uppercase tracking-wider rounded bg-primary-foreground/10 px-1.5 py-0.5">
                    {t('footer.comingSoon')}
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.newsletter')}</h3>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder={t('footer.newsletterPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 placeholder:text-primary-foreground/50 text-primary-foreground"
              />
              <Button type="submit" variant="secondary" disabled={isLoading} className="w-full">
                {t('footer.subscribe')}
              </Button>
            </form>
          </div>
        </div>

        {/* Disclaimer + Copyright */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 space-y-4">
          <p className="text-xs text-primary-foreground/60 leading-relaxed">
            {t('footer.disclaimer')}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/60">
              © {currentYear} Keynez AI. {t('footer.copyright')}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}