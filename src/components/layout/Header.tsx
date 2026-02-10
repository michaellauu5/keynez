import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, ChevronDown, LogOut, Settings } from 'lucide-react';
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
import keynezLogo from '@/assets/keynez-logo-new.png';

const navLinks = [
  { labelKey: 'nav.home', href: '/' },
  { labelKey: 'nav.buy', href: '/buy' },
  { labelKey: 'nav.rent', href: '/rent' },
  { labelKey: 'nav.sell', href: '#sell' },
  { labelKey: 'nav.research', href: '/research-canvas' },
];

const languages: Language[] = ['en', 'zh-HK', 'zh-CN'];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language, setLanguage } = useTranslation();
  const { user, openLoginModal, signOut } = useAuth();
  const location = useLocation();

  const isActiveRoute = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-gradient-to-r from-primary/10 via-sky/5 to-accent/10 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={keynezLogo}
            alt="Keynez AI"
            className="h-14 w-auto md:h-16 max-w-[200px] md:max-w-[280px] object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) =>
            link.href.startsWith('#') ? (
              <a
                key={link.labelKey}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(link.labelKey)}
              </a>
            ) : (
              <Link
                key={link.labelKey}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-foreground relative ${
                  isActiveRoute(link.href)
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground'
                }`}
              >
                {t(link.labelKey)}
                {isActiveRoute(link.href) && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-accent" />
                )}
              </Link>
            )
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                {languageNames[language]}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background">
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

          {/* User Button / Login */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background w-48">
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
            <Button variant="outline" size="sm" className="gap-2" onClick={openLoginModal}>
              <User className="h-4 w-4" />
              {t('auth.login')}
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <nav className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) =>
                link.href.startsWith('#') ? (
                  <a
                    key={link.labelKey}
                    href={link.href}
                    className={`text-lg font-medium py-2 border-b border-border ${
                      isActiveRoute(link.href) ? 'text-foreground' : 'text-foreground'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {t(link.labelKey)}
                  </a>
                ) : (
                  <Link
                    key={link.labelKey}
                    to={link.href}
                    className={`text-lg font-medium py-2 border-b border-border ${
                      isActiveRoute(link.href) ? 'text-foreground font-semibold' : 'text-foreground'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {t(link.labelKey)}
                  </Link>
                )
              )}
              <div className="pt-4 flex flex-col gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {languageNames[language]}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[240px] bg-background">
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
                  <Button className="w-full gap-2" onClick={() => { setIsOpen(false); openLoginModal(); }}>
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
