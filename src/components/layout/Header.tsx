import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, ChevronDown, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/components/auth/AuthContext";
import { Language, languageNames } from "@/translations";
import keynezLogo from "@/assets/keynez-logo-new.png";

const navLinks = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.buy", href: "/buy" },
  { labelKey: "nav.rent", href: "/rent" },
  { labelKey: "nav.sell", href: "/#sell-services", isAnchor: true },
  { labelKey: "nav.research", href: "/research-canvas" },
] as const;

const languages: Language[] = ["en", "zh-HK", "zh-CN"];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language, setLanguage } = useTranslation();
  const { user, openLoginModal, signOut } = useAuth();
  const location = useLocation();

  const isActiveRoute = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href.startsWith("/#")) return false;
    return location.pathname.startsWith(href);
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const DesktopNav = () => (
    <nav className="hidden items-center gap-8 lg:flex">
      {navLinks.map((link) => {
        const active = isActiveRoute(link.href);
        const className = active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground";

        if (link.isAnchor) {
          return (
            <a
              key={link.labelKey}
              href={link.href}
              className={`text-sm font-medium transition-colors ${className}`}
            >
              {t(link.labelKey)}
            </a>
          );
        }

        return (
          <Link
            key={link.labelKey}
            to={link.href}
            className={`relative text-sm font-medium transition-colors ${className}`}
          >
            {t(link.labelKey)}
            {active && <span className="absolute -bottom-2 left-0 h-px w-full bg-foreground" />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="container flex h-20 items-center gap-4 px-4 md:px-6">
        <Link to="/" className="flex shrink-0 items-center">
          <img src={keynezLogo} alt="Keynez AI" className="h-12 w-auto md:h-14" />
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <DesktopNav />
        </div>

        <div className="ml-auto hidden items-center gap-2 md:flex lg:ml-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 gap-2 rounded-full px-4 text-foreground">
                <span className="text-sm">{languageNames[language]}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px] bg-background/95 backdrop-blur-xl">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={language === lang ? "bg-accent text-accent-foreground" : ""}
                >
                  {languageNames[lang]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border/70">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl">
                <DropdownMenuItem className="gap-2">
                  <User className="h-4 w-4" />
                  {t("auth.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Settings className="h-4 w-4" />
                  {t("auth.settings")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-destructive" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" className="h-10 rounded-full px-5" onClick={openLoginModal}>
              <User className="mr-2 h-4 w-4" />
              {t("auth.login")}
            </Button>
          )}
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="ml-auto h-10 w-10 rounded-full border border-border/70">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] bg-background/95 px-6 backdrop-blur-xl">
            <div className="mt-8 flex flex-col gap-8">
              <nav className="flex flex-col gap-5">
                {navLinks.map((link) =>
                  link.isAnchor ? (
                    <a
                      key={link.labelKey}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="border-b border-border/70 pb-3 text-base font-medium text-foreground"
                    >
                      {t(link.labelKey)}
                    </a>
                  ) : (
                    <Link
                      key={link.labelKey}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="border-b border-border/70 pb-3 text-base font-medium text-foreground"
                    >
                      {t(link.labelKey)}
                    </Link>
                  )
                )}
              </nav>

              <div className="space-y-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-11 w-full justify-between rounded-full px-4">
                      {languageNames[language]}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[260px] bg-background/95 backdrop-blur-xl">
                    {languages.map((lang) => (
                      <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)}>
                        {languageNames[lang]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {user ? (
                  <Button variant="outline" className="h-11 w-full rounded-full" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("auth.logout")}
                  </Button>
                ) : (
                  <Button
                    className="h-11 w-full rounded-full"
                    onClick={() => {
                      setIsOpen(false);
                      openLoginModal();
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {t("auth.login")}
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
