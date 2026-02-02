import { useState } from "react";
import { Menu, X, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import keynestLogo from "@/assets/keynest-logo.png";

const navLinks = [
  { label: "Buy", href: "#buy" },
  { label: "Rent", href: "#rent" },
  { label: "Sell", href: "#sell" },
  { label: "Research Canvas", href: "#research" },
];

const languages = [
  { code: "en", label: "English" },
  { code: "zh-HK", label: "繁體中文" },
  { code: "zh-CN", label: "简体中文" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img
            src={keynestLogo}
            alt="Keynest AI"
            className="h-8 w-auto md:h-10"
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                {languages.find((l) => l.code === currentLang)?.label}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setCurrentLang(lang.code)}
                  className={currentLang === lang.code ? "bg-accent" : ""}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Login Button */}
          <Button variant="outline" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            Login
          </Button>
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
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-lg font-medium text-foreground py-2 border-b border-border"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {languages.find((l) => l.code === currentLang)?.label}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[240px]">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setCurrentLang(lang.code)}
                      >
                        {lang.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button className="w-full gap-2">
                  <User className="h-4 w-4" />
                  Login
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
