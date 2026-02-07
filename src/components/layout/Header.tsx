import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, ChevronDown, LogOut, Settings, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/components/auth/AuthContext';
import { Language, languageNames } from '@/translations';
import keynezLogo from '@/assets/keynez-logo.jpg';
import { cn } from '@/lib/utils';

const navLinks = [
  { labelKey: 'nav.buy', href: '/buy' },
  { labelKey: 'nav.rent', href: '/rent' },
  { labelKey: 'nav.sell', href: '#sell' },
  { labelKey: 'nav.research', href: '/research-canvas' },
];

const languages: Language[] = ['en', 'zh-HK', 'zh-CN'];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, language, setLanguage } = useTranslation();
  const { user, openLoginModal, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActiveRoute = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 md:px-12">
        {/* Logo - Left */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <img
            src={keynezLogo}
            alt="Keynez AI"
            className="h-10 w-auto md:h-12 max-w-[180px] object-contain"
          />
        </Link>

        {/* Desktop Navigation - Center */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.href.startsWith('#') ? (
              <a
                key={link.labelKey}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {t(link.labelKey)}
              </a>
            ) : (
              <Link
                key={link.labelKey}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200 hover:text-foreground relative",
                  isActiveRoute(link.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {t(link.labelKey)}
                {isActiveRoute(link.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full" />
                )}
              </Link>
            )
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-9">
                <Globe className="h-4 w-4" />
                <span className="text-xs">{languageNames[language]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={language === lang ? 'bg-secondary' : ''}
                >
                  {languageNames[lang]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Button / Login */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card w-48">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('auth.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {t('auth.settings')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-destructive"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4" />
                  {t('auth.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 h-9 text-sm"
              onClick={openLoginModal}
            >
              <User className="h-4 w-4" />
              {t('auth.login')}
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-card">
            <nav className="flex flex-col gap-1 mt-8">
              {navLinks.map((link) =>
                link.href.startsWith('#') ? (
                  <a
                    key={link.labelKey}
                    href={link.href}
                    className="text-base font-medium py-3 px-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {t(link.labelKey)}
                  </a>
                ) : (
                  <Link
                    key={link.labelKey}
                    to={link.href}
                    className={cn(
                      "text-base font-medium py-3 px-2 rounded-lg transition-colors",
                      isActiveRoute(link.href)
                        ? 'text-foreground bg-secondary'
                        : 'text-foreground hover:bg-secondary'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {t(link.labelKey)}
                  </Link>
                )
              )}
              <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {languageNames[language]}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[260px] bg-card">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang}
                        onClick={() => setLanguage(lang)}
                      >
                        {languageNames[lang]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {user ? (
                  <Button variant="outline" className="w-full gap-2" onClick={signOut}>
                    <LogOut className="h-4 w-4" />
                    {t('auth.logout')}
                  </Button>
                ) : (
                  <Button
                    className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => { setIsOpen(false); openLoginModal(); }}
                  >
                    <User className="h-4 w-4" />
                    {t('auth.login')}
                  </Button>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
