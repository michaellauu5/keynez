import { Layers, MessagesSquare, Shield, Download, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

type Reason = {
  key: string;
  Icon: LucideIcon;
  titleKey: string;
  bodyKey: string;
};

const REASONS: Reason[] = [
  { key: "platforms", Icon: Layers, titleKey: "why.platforms.title", bodyKey: "why.platforms.body" },
  { key: "language", Icon: MessagesSquare, titleKey: "why.language.title", bodyKey: "why.language.body" },
  { key: "tool", Icon: Shield, titleKey: "why.tool.title", bodyKey: "why.tool.body" },
  { key: "export", Icon: Download, titleKey: "why.export.title", bodyKey: "why.export.body" },
];

export function WhyKeynez() {
  const { t } = useTranslation();

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4">
        <div className="max-w-2xl mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {t("why.title")}
          </h2>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            {t("why.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {REASONS.map(({ key, Icon, titleKey, bodyKey }) => (
            <Card key={key} className="bg-background/70 backdrop-blur-sm border-border/60">
              <CardContent className="p-6 flex gap-4">
                <div className="shrink-0 h-11 w-11 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base md:text-lg font-semibold text-foreground">
                    {t(titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(bodyKey)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}