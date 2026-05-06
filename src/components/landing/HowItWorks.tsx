import { MessageSquare, Sparkles, LayoutGrid, type LucideIcon } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface Step {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

const steps: Step[] = [
  { icon: MessageSquare, titleKey: "how.step1.title", descKey: "how.step1.desc" },
  { icon: Sparkles, titleKey: "how.step2.title", descKey: "how.step2.desc" },
  { icon: LayoutGrid, titleKey: "how.step3.title", descKey: "how.step3.desc" },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">{t("how.title")}</h2>
          <p className="mt-3 text-base md:text-lg text-white/80">{t("how.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-5xl mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.titleKey} className="flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 border border-primary/40 backdrop-blur-sm">
                    <Icon className="h-9 w-9 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t(step.titleKey)}</h3>
                <p className="text-sm text-white/80 leading-relaxed max-w-xs">{t(step.descKey)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}