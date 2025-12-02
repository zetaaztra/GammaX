import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import type { CookieChoices } from "@shared/schema";

const COOKIE_KEY = "aztryx_cookie_choices";

export function getCookieChoices(): CookieChoices | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(COOKIE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveCookieChoices(choices: CookieChoices): void {
  localStorage.setItem(COOKIE_KEY, JSON.stringify(choices));
}

export function shouldShowCookieConsent(): boolean {
  return getCookieChoices() === null;
}

interface CookieConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CookieConsentModal({ isOpen, onClose }: CookieConsentModalProps) {
  const [analytics, setAnalytics] = useState(false);
  const [ads, setAds] = useState(false);

  useEffect(() => {
    const choices = getCookieChoices();
    if (choices) {
      setAnalytics(choices.analytics);
      setAds(choices.ads);
    }
  }, [isOpen]);

  const handleAcceptAll = () => {
    const choices: CookieChoices = {
      analytics: true,
      ads: true,
      accepted_at: new Date().toISOString(),
    };
    saveCookieChoices(choices);
    onClose();
  };

  const handleRejectAll = () => {
    const choices: CookieChoices = {
      analytics: false,
      ads: false,
      accepted_at: new Date().toISOString(),
    };
    saveCookieChoices(choices);
    onClose();
  };

  const handleSaveChoices = () => {
    const choices: CookieChoices = {
      analytics,
      ads,
      accepted_at: new Date().toISOString(),
    };
    saveCookieChoices(choices);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Cookie className="h-6 w-6 text-primary" />
            Cookies & Advertising Consent
          </DialogTitle>
          <DialogDescription className="text-base">
            We use cookies for theme preferences and performance. Our advertising 
            partner (Adsterra) may also use cookies to show you relevant ads. 
            You can control this below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="essential" className="text-base font-medium">
                Essential Cookies
              </Label>
              <p className="text-sm text-muted-foreground">
                Required for theme and basic functionality
              </p>
            </div>
            <Switch id="essential" checked disabled />
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="analytics" className="text-base font-medium">
                Analytics & Performance
              </Label>
              <p className="text-sm text-muted-foreground">
                Anonymous usage data to improve the dashboard
              </p>
            </div>
            <Switch
              id="analytics"
              checked={analytics}
              onCheckedChange={setAnalytics}
              data-testid="switch-analytics"
            />
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="ads" className="text-base font-medium">
                Allow Analytics & Advertising (Adsterra)
              </Label>
              <p className="text-sm text-muted-foreground">
                Show personalized ads from our partners
              </p>
            </div>
            <Switch
              id="ads"
              checked={ads}
              onCheckedChange={setAds}
              data-testid="switch-ads"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground border-t pt-4">
          <a href="#" className="hover:text-foreground flex items-center gap-1">
            Privacy <ExternalLink className="h-3 w-3" />
          </a>
          <span>·</span>
          <a href="#" className="hover:text-foreground flex items-center gap-1">
            Cookies <ExternalLink className="h-3 w-3" />
          </a>
          <span>·</span>
          <a href="#" className="hover:text-foreground flex items-center gap-1">
            Terms <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleRejectAll}
            data-testid="button-cookie-reject"
          >
            Reject All
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleSaveChoices}
            data-testid="button-cookie-save"
          >
            Save Choices
          </Button>
          <Button 
            onClick={handleAcceptAll}
            data-testid="button-cookie-accept"
          >
            Accept All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
