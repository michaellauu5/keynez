import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Home, Key, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { HK_REGIONS, RegionKey } from "@/data/hkDistricts";

// ---------- Intake payload types ----------

export type TransactionType = "rent" | "sale";

export interface IntakeSoftPreferences {
  near_mtr?: number;
  newer_building?: number;
  view?: number;
  furnished_appliances?: number;
  renovated?: number;
  owner_direct?: number;
  pet_friendly?: number;
  clubhouse?: number;
  quiet?: number;
  high_floor?: number;
}

export interface IntakeHardCriteria {
  transaction_type: TransactionType;
  districts: string[];
  budget_hkd: { min: number; max: number };
  bedrooms?: { min: number; max: number };
  saleable_sqft?: { min: number; max: number };
}

export interface IntakePayload {
  version: 1;
  hard_criteria: IntakeHardCriteria;
  soft_preferences?: IntakeSoftPreferences;
}

/** Full editable form state; converted to IntakePayload on submit. */
export interface IntakeFormValue {
  transaction_type: TransactionType;
  districts: string[];
  budget: [number, number];
  bedrooms: string[]; // "0" (open), "1", "2", "3", "4+"
  sqftEnabled: boolean;
  sqft: [number, number];
  soft: IntakeSoftPreferences;
  notes: string;
}

// ---------- Defaults ----------

const RENT_BUDGET_RANGE: [number, number] = [5_000, 80_000];
const SALE_BUDGET_RANGE: [number, number] = [2_000_000, 30_000_000];
const SQFT_RANGE: [number, number] = [200, 2000];

const BEDROOM_CHIPS: { value: string; label: string }[] = [
  { value: "0", label: "開放式" },
  { value: "1", label: "1房" },
  { value: "2", label: "2房" },
  { value: "3", label: "3房" },
  { value: "4+", label: "4房+" },
];

const SOFT_ROWS: { key: keyof IntakeSoftPreferences; label: string }[] = [
  { key: "near_mtr", label: "近地鐵" },
  { key: "newer_building", label: "樓齡較新" },
  { key: "view", label: "景觀" },
  { key: "furnished_appliances", label: "連傢電" },
  { key: "renovated", label: "有裝修" },
  { key: "owner_direct", label: "業主盤" },
  { key: "pet_friendly", label: "可養寵物" },
  { key: "clubhouse", label: "有會所" },
  { key: "quiet", label: "寧靜" },
  { key: "high_floor", label: "高層" },
];

export function defaultIntakeValue(txn: TransactionType = "rent"): IntakeFormValue {
  return {
    transaction_type: txn,
    districts: [],
    budget: txn === "rent" ? [16_000, 30_000] : [5_000_000, 12_000_000],
    bedrooms: [],
    sqftEnabled: false,
    sqft: [400, 900],
    soft: {},
    notes: "",
  };
}

// ---------- Helpers ----------

function fmtBudget(n: number, txn: TransactionType): string {
  if (txn === "sale") {
    const wan = n / 10_000;
    if (wan >= 100) return `$${(wan / 100).toFixed(wan % 100 === 0 ? 0 : 2)}千萬`;
    return `$${wan}萬`;
  }
  return `$${n.toLocaleString("en-US")}`;
}

function bedroomsToMinMax(values: string[]): { min: number; max: number } | undefined {
  if (values.length === 0) return undefined;
  const nums = values.map(v => (v === "4+" ? 4 : parseInt(v, 10))).filter(n => !Number.isNaN(n));
  if (nums.length === 0) return undefined;
  const min = Math.min(...nums);
  const hasOpen = values.includes("4+");
  const max = hasOpen ? 99 : Math.max(...nums);
  return { min, max };
}

/** Convert form state → the JSON payload emitted in the `intake` block. */
export function buildIntakePayload(v: IntakeFormValue): IntakePayload {
  const hard: IntakeHardCriteria = {
    transaction_type: v.transaction_type,
    districts: v.districts,
    budget_hkd: { min: v.budget[0], max: v.budget[1] },
  };
  const beds = bedroomsToMinMax(v.bedrooms);
  if (beds) hard.bedrooms = beds;
  if (v.sqftEnabled) hard.saleable_sqft = { min: v.sqft[0], max: v.sqft[1] };

  const soft: IntakeSoftPreferences = {};
  for (const [k, val] of Object.entries(v.soft)) {
    if (typeof val === "number" && val > 0) {
      (soft as Record<string, number>)[k] = val;
    }
  }

  const payload: IntakePayload = { version: 1, hard_criteria: hard };
  if (Object.keys(soft).length > 0) payload.soft_preferences = soft;
  return payload;
}

// ---------- Component ----------

interface IntakeFormProps {
  value: IntakeFormValue;
  onChange: (v: IntakeFormValue) => void;
  onSubmit: (payload: IntakePayload, notes: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
  disabled?: boolean;
  compact?: boolean;
}

export function IntakeForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "開始搜尋",
  disabled,
  compact,
}: IntakeFormProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<RegionKey | null>("hk_island");
  const [error, setError] = useState<string | null>(null);

  const isRent = value.transaction_type === "rent";
  const budgetBounds = isRent ? RENT_BUDGET_RANGE : SALE_BUDGET_RANGE;
  const budgetStep = isRent ? 500 : 100_000;

  const patch = (partial: Partial<IntakeFormValue>) => onChange({ ...value, ...partial });

  const toggleDistrict = (d: string) => {
    const next = value.districts.includes(d)
      ? value.districts.filter(x => x !== d)
      : [...value.districts, d];
    patch({ districts: next });
  };

  const toggleBedroom = (b: string) => {
    const next = value.bedrooms.includes(b)
      ? value.bedrooms.filter(x => x !== b)
      : [...value.bedrooms, b];
    patch({ bedrooms: next });
  };

  const setSoft = (key: keyof IntakeSoftPreferences, stars: number) => {
    const current = value.soft[key] ?? 0;
    const next = current === stars ? 0 : stars; // click same star to clear
    patch({ soft: { ...value.soft, [key]: next } });
  };

  const setTransaction = (txn: TransactionType) => {
    if (txn === value.transaction_type) return;
    const bounds = txn === "rent" ? RENT_BUDGET_RANGE : SALE_BUDGET_RANGE;
    patch({
      transaction_type: txn,
      budget: [bounds[0], Math.min(bounds[1], bounds[0] + (bounds[1] - bounds[0]) / 2)],
    });
  };

  const validationHint = useMemo(() => {
    if (value.districts.length === 0) return "請選擇至少一個地區";
    const [min, max] = value.budget;
    if (max <= min) return "預算上限必須大於下限";
    if (isRent && max < 3_000) {
      const wan = Math.round(max / 10_000);
      return `您是指 $${wan || 1}萬嗎？`;
    }
    return null;
  }, [value.districts, value.budget, isRent]);

  const handleSubmit = () => {
    if (validationHint) {
      setError(validationHint);
      return;
    }
    setError(null);
    onSubmit(buildIntakePayload(value), value.notes.trim());
  };

  return (
    <div className={cn("space-y-5", compact && "space-y-4")}>
      {/* 1. Transaction type */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">租/買</Label>
        <div className="inline-flex items-center p-1 rounded-full bg-muted">
          <Button
            type="button"
            size="sm"
            variant={isRent ? "default" : "ghost"}
            className={cn(
              "rounded-full px-5 gap-1.5",
              isRent && "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90"
            )}
            onClick={() => setTransaction("rent")}
          >
            <Key className="h-3.5 w-3.5" /> 租
          </Button>
          <Button
            type="button"
            size="sm"
            variant={!isRent ? "default" : "ghost"}
            className={cn(
              "rounded-full px-5 gap-1.5",
              !isRent && "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            )}
            onClick={() => setTransaction("sale")}
          >
            <Home className="h-3.5 w-3.5" /> 買
          </Button>
        </div>
      </div>

      {/* 2. Districts */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            地區 <span className="text-destructive">*</span>
          </Label>
          {value.districts.length > 0 && (
            <button
              type="button"
              onClick={() => patch({ districts: [] })}
              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
            >
              <X className="h-3 w-3" /> 清除
            </button>
          )}
        </div>

        {value.districts.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {value.districts.map(d => (
              <Badge
                key={d}
                variant="secondary"
                className="bg-accent/15 text-foreground gap-1 pr-1 py-0.5"
              >
                {d}
                <button
                  type="button"
                  onClick={() => toggleDistrict(d)}
                  className="hover:bg-foreground/10 rounded-full p-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-1.5 mb-2">
          {HK_REGIONS.map(r => (
            <Button
              key={r.key}
              type="button"
              size="sm"
              variant={expandedRegion === r.key ? "default" : "outline"}
              className="rounded-full h-7 px-3 text-xs"
              onClick={() => setExpandedRegion(expandedRegion === r.key ? null : r.key)}
            >
              {r.label}
            </Button>
          ))}
        </div>

        {expandedRegion && (
          <div className="flex flex-wrap gap-1.5 rounded-md border border-border bg-muted/30 p-2">
            {HK_REGIONS.find(r => r.key === expandedRegion)!.districts.map(d => {
              const active = value.districts.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDistrict(d)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border transition-colors",
                    active
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background border-border hover:border-accent/50 text-foreground"
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Budget */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            預算 <span className="text-destructive">*</span>
            {isRent && <span className="ml-1 text-[11px] text-muted-foreground">（月租）</span>}
          </Label>
          <span className="text-xs font-medium text-foreground">
            {fmtBudget(value.budget[0], value.transaction_type)} – {fmtBudget(value.budget[1], value.transaction_type)}
            {isRent && <span className="text-muted-foreground">/月</span>}
          </span>
        </div>
        <Slider
          value={value.budget}
          onValueChange={(v) => patch({ budget: [v[0], v[1]] as [number, number] })}
          min={budgetBounds[0]}
          max={budgetBounds[1]}
          step={budgetStep}
          minStepsBetweenThumbs={1}
          className="mt-2"
        />
      </div>

      {/* 4. Bedrooms */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">房數</Label>
        <div className="flex flex-wrap gap-1.5">
          {BEDROOM_CHIPS.map(c => {
            const active = value.bedrooms.includes(c.value);
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => toggleBedroom(c.value)}
                className={cn(
                  "text-xs px-3 py-1 rounded-full border transition-colors",
                  active
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-background border-border hover:border-accent/50"
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Saleable sqft */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs font-medium text-muted-foreground">實用面積</Label>
          <div className="flex items-center gap-2">
            {value.sqftEnabled ? (
              <span className="text-xs font-medium text-foreground">
                {value.sqft[0]} – {value.sqft[1]} 呎
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">不限</span>
            )}
            <button
              type="button"
              className="text-[11px] text-accent hover:underline"
              onClick={() => patch({ sqftEnabled: !value.sqftEnabled })}
            >
              {value.sqftEnabled ? "重設為不限" : "設定範圍"}
            </button>
          </div>
        </div>
        {value.sqftEnabled && (
          <Slider
            value={value.sqft}
            onValueChange={(v) => patch({ sqft: [v[0], v[1]] as [number, number] })}
            min={SQFT_RANGE[0]}
            max={SQFT_RANGE[1]}
            step={50}
            minStepsBetweenThumbs={1}
            className="mt-2"
          />
        )}
      </div>

      {/* 6. Advanced (collapsible) */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {advancedOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            進階偏好（可選）
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-1.5">
          {SOFT_ROWS.map(row => {
            const val = value.soft[row.key] ?? 0;
            return (
              <div
                key={row.key}
                className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/40"
              >
                <span className="text-xs text-foreground">{row.label}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSoft(row.key, n)}
                      className="p-0.5"
                      aria-label={`${row.label} ${n} 星`}
                    >
                      <Star
                        className={cn(
                          "h-3.5 w-3.5 transition-colors",
                          n <= val ? "fill-accent text-accent" : "text-muted-foreground/40"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      {/* 7. Notes */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">其他要求</Label>
        <Textarea
          value={value.notes}
          onChange={(e) => patch({ notes: e.target.value.slice(0, 500) })}
          placeholder="例如：想要靠海、有工作間、避開高速公路旁…"
          rows={2}
          className="text-sm resize-none"
        />
      </div>

      {(error || validationHint) && (
        <div className="text-xs text-destructive">{error ?? validationHint}</div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !!validationHint}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            取消
          </Button>
        )}
      </div>
    </div>
  );
}