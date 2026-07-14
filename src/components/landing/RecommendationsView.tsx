import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * A single listing row from the agent `recommendations` event.
 * All fields are optional — the agent may omit values it couldn't verify.
 */
export interface RecommendationRow {
  rank?: number;
  building_name?: string;
  district?: string;
  price_hkd?: number;
  bedrooms?: number | string;
  saleable_sqft?: number;
  building_age_years?: number;
  mtr_distance?: string;
  view?: string;
  feature_tags?: string[];
  score?: number;
  agent_owner?: string;
  source?: string;
  source_url?: string;
  photos?: string[];
}

export interface RecommendationsPayload {
  rows: RecommendationRow[];
  dropped?: number;
  table_markdown?: string;
}

const SALE_THRESHOLD = 100_000; // above this the price is a sale amount, not monthly rent

function fmtPrice(price?: number): string {
  if (price == null || Number.isNaN(price)) return "—";
  const withCommas = `$${Math.round(price).toLocaleString("en-US")}`;
  return price > SALE_THRESHOLD ? withCommas : `${withCommas}/月`;
}

function fmtOr(value: unknown, suffix = ""): string {
  if (value === undefined || value === null || value === "" || value === "undefined") return "—";
  return `${value}${suffix}`;
}

function FeatureChips({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return <>—</>;
  const shown = tags.slice(0, 5);
  const overflow = tags.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((tag, i) => (
        <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
          {tag}
        </Badge>
      ))}
      {overflow > 0 && (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
          +{overflow}
        </Badge>
      )}
    </div>
  );
}

function SourceButton({ url, label }: { url?: string; label: string }) {
  if (!url) return <span className="text-muted-foreground">—</span>;
  return (
    <Button
      asChild
      size="sm"
      variant="outline"
      className="h-7 px-2 text-xs gap-1"
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="h-3 w-3" />
        {label}
      </a>
    </Button>
  );
}

export function RecommendationsView({ payload }: { payload: RecommendationsPayload }) {
  const { t } = useTranslation();
  const { rows, dropped } = payload;
  if (!rows || rows.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        {t("rec.empty")}
        {dropped && dropped > 0 ? " " + t("rec.dropped").replace("{n}", String(dropped)) : ""}
      </div>
    );
  }

  const headers = [
    t("rec.h.rank"), t("rec.h.name"), t("rec.h.district"), t("rec.h.price"),
    t("rec.h.bedrooms"), t("rec.h.size"), t("rec.h.age"), t("rec.h.mtr"),
    t("rec.h.view"), t("rec.h.features"), t("rec.h.score"), t("rec.h.agent"), t("rec.h.source"),
  ];
  const viewSourceLabel = t("rec.viewSource");
  const yearsLabel = t("rec.years");
  const bedsLabel = t("rec.beds");

  return (
    <div className="space-y-3">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full text-xs">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              {headers.map(h => (
                <th key={h} className="px-2 py-2 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className={cn(
                  "border-t border-border align-top",
                  i % 2 === 1 && "bg-muted/20"
                )}
              >
                <td className="px-2 py-2 font-semibold">{r.rank ?? i + 1}</td>
                <td className="px-2 py-2 font-medium text-foreground">{fmtOr(r.building_name)}</td>
                <td className="px-2 py-2">{fmtOr(r.district)}</td>
                <td className="px-2 py-2 whitespace-nowrap font-semibold text-foreground">{fmtPrice(r.price_hkd)}</td>
                <td className="px-2 py-2">{fmtOr(r.bedrooms)}</td>
                <td className="px-2 py-2 whitespace-nowrap">{r.saleable_sqft ? `${r.saleable_sqft} ft²` : "—"}</td>
                <td className="px-2 py-2 whitespace-nowrap">{r.building_age_years != null ? `${r.building_age_years} ${yearsLabel}` : "—"}</td>
                <td className="px-2 py-2 whitespace-nowrap">{fmtOr(r.mtr_distance)}</td>
                <td className="px-2 py-2">{fmtOr(r.view)}</td>
                <td className="px-2 py-2 min-w-[140px]"><FeatureChips tags={r.feature_tags} /></td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {r.score != null ? (
                    <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/20 font-semibold">
                      {r.score}/10
                    </Badge>
                  ) : "—"}
                </td>
                <td className="px-2 py-2">{fmtOr(r.agent_owner)}</td>
                <td className="px-2 py-2"><SourceButton url={r.source_url} label={viewSourceLabel} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {rows.map((r, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-3 space-y-2"
          >
            <div className="flex items-start gap-3">
              {r.photos && r.photos[0] ? (
                <img
                  src={r.photos[0]}
                  alt={r.building_name ?? "listing"}
                  loading="lazy"
                  className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                />
              ) : null}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">#{r.rank ?? i + 1}</span>
                  <span>·</span>
                  <span>{fmtOr(r.district)}</span>
                </div>
                <div className="font-medium text-sm text-foreground truncate">{fmtOr(r.building_name)}</div>
                <div className="font-semibold text-sm text-foreground">{fmtPrice(r.price_hkd)}</div>
              </div>
              {r.score != null && (
                <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/20 font-semibold flex-shrink-0">
                  {r.score}/10
                </Badge>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              {fmtOr(r.bedrooms, ` ${bedsLabel}`)} · {r.saleable_sqft ? `${r.saleable_sqft} ft²` : "—"} · {r.building_age_years != null ? `${r.building_age_years} ${yearsLabel}` : "—"}
            </div>

            {r.mtr_distance || r.view ? (
              <div className="text-xs text-muted-foreground">
                {r.mtr_distance ? `🚇 ${r.mtr_distance}` : ""}
                {r.mtr_distance && r.view ? " · " : ""}
                {r.view ? `🌇 ${r.view}` : ""}
              </div>
            ) : null}

            <FeatureChips tags={r.feature_tags} />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-muted-foreground">{fmtOr(r.agent_owner)}</span>
              <SourceButton url={r.source_url} label={viewSourceLabel} />
            </div>
          </div>
        ))}
      </div>

      {dropped != null && dropped > 0 && (
        <p className="text-[11px] text-muted-foreground italic">
          {t("rec.dropped").replace("{n}", String(dropped))}
        </p>
      )}
    </div>
  );
}