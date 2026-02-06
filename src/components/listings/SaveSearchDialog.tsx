import { useState } from "react";
import { Bell, BellOff, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import type { FilterState } from "./AdvancedFilterSidebar";

interface SavedSearch {
  id: string;
  name: string;
  filters: FilterState;
  transactionType: "sale" | "rent";
  emailAlerts: boolean;
  alertFrequency: "immediately" | "daily" | "weekly";
  createdAt: string;
}

interface SaveSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  transactionType: "sale" | "rent";
}

const STORAGE_KEY = "keynez_saved_searches";

function getSavedSearches(): SavedSearch[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSavedSearches(searches: SavedSearch[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

export function SaveSearchDialog({ 
  open, 
  onOpenChange, 
  filters, 
  transactionType 
}: SaveSearchDialogProps) {
  const [searchName, setSearchName] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [alertFrequency, setAlertFrequency] = useState<"immediately" | "daily" | "weekly">("daily");
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(getSavedSearches);

  const handleSave = () => {
    if (!searchName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your saved search.",
        variant: "destructive",
      });
      return;
    }

    const newSearch: SavedSearch = {
      id: crypto.randomUUID(),
      name: searchName.trim(),
      filters,
      transactionType,
      emailAlerts,
      alertFrequency,
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    saveSavedSearches(updated);

    toast({
      title: "Search saved!",
      description: emailAlerts 
        ? `You'll receive ${alertFrequency} email alerts for new matches.`
        : "Your search has been saved.",
    });

    setSearchName("");
    setEmailAlerts(false);
    onOpenChange(false);
  };

  const handleDelete = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    saveSavedSearches(updated);
    toast({
      title: "Search deleted",
      description: "Your saved search has been removed.",
    });
  };

  const getActiveFiltersCount = (f: FilterState) => {
    let count = 0;
    if (f.districts.length) count++;
    if (f.propertyTypes.length) count++;
    if (f.bedrooms.length) count++;
    if (f.bathrooms.length) count++;
    if (f.floorLevels.length) count++;
    if (f.buildingAge.length) count++;
    if (f.orientations.length) count++;
    if (f.developers.length) count++;
    if (f.amenities.length) count++;
    if (f.nearMTR) count++;
    if (f.hasBusRoutes) count++;
    return count;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save Your Search</DialogTitle>
          <DialogDescription>
            Save your current search filters and optionally receive email alerts when new properties match.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* New Search Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-name">Search Name</Label>
              <Input
                id="search-name"
                placeholder="e.g., 3BR Mid-Levels under 30M"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {emailAlerts ? (
                  <Bell className="h-4 w-4 text-primary" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="email-alerts">Email Alerts</Label>
              </div>
              <Switch
                id="email-alerts"
                checked={emailAlerts}
                onCheckedChange={setEmailAlerts}
              />
            </div>

            {emailAlerts && (
              <div className="space-y-2 pl-6">
                <Label>Alert Frequency</Label>
                <Select value={alertFrequency} onValueChange={(v) => setAlertFrequency(v as typeof alertFrequency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="immediately">Immediately</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Saved Searches List */}
          {savedSearches.length > 0 && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Your Saved Searches</Label>
              <ScrollArea className="h-[150px] rounded-md border">
                <div className="p-2 space-y-2">
                  {savedSearches.map((search) => (
                    <div
                      key={search.id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{search.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {search.transactionType === "sale" ? "Buy" : "Rent"} • {getActiveFiltersCount(search.filters)} filters
                          {search.emailAlerts && (
                            <>
                              {" "}• <Clock className="inline h-3 w-3" /> {search.alertFrequency}
                            </>
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(search.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
