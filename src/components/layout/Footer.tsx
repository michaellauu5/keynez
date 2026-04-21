import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Facebook, Instagram, Linkedin } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import keynezLogo from "@/assets/keynez-logo-new.png";

const emailSchema = z.string().email();

const quickLinks = [
  { labelKey: "footer.about", href: "/about" },
  { labelKey: "footer.contact", href: "/contact" },
  { labelKey: "footer.terms", href: "/terms" },
  { labelKey: "footer.privacy", href: "/privacy" },
] as const;

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
] as const;

export function Footer() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);

    if (!result.success) {
      toast({ title: t("auth.invalidEmail"), variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const subscribers = JSON.parse(localStorage.getItem("keynez-subscribers") || "[]");
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem("keynez-subscribers", JSON.stringify(subscribers));
    }
    toast({ title: t("footer.subscribeSuccess") });
    setEmail("");
    setIsLoading(false);
  };

  return (
    <footer id="sell-services" className="border-t border-border bg-background">
      <div className="container px-4 py-16 md:px-6">
        <div className="grid gap-12 border-b border-border pb-12 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
          <div className="space-y-5">
            <Link to="/" className="inline-flex items-center">
              <img src={keynezLogo} alt="Keynez AI" className="h-14 w-auto" />
            </Link>
            <p className="max-w-md text-sm leading-7 text-muted-foreground">{t("footer.description")}</p>
            <div className="grid max-w-xl gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-border bg-card px-4 py-4">
                <p className="text-xs uppercase tracking-normal text-muted-foreground">Coverage</p>
                <p className="mt-2 text-sm font-semibold text-foreground">Hong Kong-wide inventory</p>
              </div>
              <div className="rounded-md border border-border bg-card px-4 py-4">
                <p className="text-xs uppercase tracking-normal text-muted-foreground">Search</p>
                <p className="mt-2 text-sm font-semibold text-foreground">AI-guided discovery</p>
              </div>
              <div className="rounded-md border border-border bg-card px-4 py-4">
                <p className="text-xs uppercase tracking-normal text-muted-foreground">Support</p>
                <p className="mt-2 text-sm font-semibold text-foreground">Advisory workflows</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-normal text-foreground">Explore</h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.labelKey}>
                  <Link to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-normal text-foreground">Services</h3>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>Buy-side property search</li>
              <li>Rental matching</li>
              <li>Shortlist comparison</li>
              <li>Research workflows</li>
            </ul>
            <div className="mt-6 flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">{t("footer.newsletter")}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Market updates, curated homes, and new search tools directly to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="mt-5 space-y-3">
              <Input
                type="email"
                placeholder={t("footer.newsletterPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-full"
              />
              <Button type="submit" disabled={isLoading} className="h-11 w-full rounded-full">
                {t("footer.subscribe")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} Keynez AI. {t("footer.copyright")}.</p>
          <p>Built for premium property discovery in Hong Kong.</p>
        </div>
      </div>
    </footer>
  );
}
