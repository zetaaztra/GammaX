import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, ExternalLink } from "lucide-react";

const DISCLAIMER_KEY = "aztryx_disclaimer_accepted_at";
const DISCLAIMER_EXPIRY_MS = 48 * 60 * 60 * 1000; // 48 hours

export function shouldShowDisclaimer(): boolean {
  if (typeof window === "undefined") return false;
  const acceptedAt = localStorage.getItem(DISCLAIMER_KEY);
  if (!acceptedAt) return true;
  const acceptedTime = new Date(acceptedAt).getTime();
  return Date.now() - acceptedTime > DISCLAIMER_EXPIRY_MS;
}

export function acceptDisclaimer(): void {
  localStorage.setItem(DISCLAIMER_KEY, new Date().toISOString());
}

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onLearnMore?: () => void;
}

export function DisclaimerModal({ isOpen, onAccept, onLearnMore }: DisclaimerModalProps) {
  const handleAccept = () => {
    acceptDisclaimer();
    onAccept();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            Important Disclaimer
          </DialogTitle>
          <DialogDescription className="text-base">
            Please read and acknowledge before using Tradyxa Aztryx
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4 text-sm leading-relaxed">
            <section>
              <h3 className="font-semibold text-foreground mb-2">Data Sources</h3>
              <p className="text-muted-foreground">
                NSE India, Yahoo Finance
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">Analytics Engine</h3>
              <p className="text-muted-foreground">
                Analytics powered by Tradyxa Analytics Engine v1.0.0
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">Affiliation Notice</h3>
              <p className="text-muted-foreground">
                Market data © respective owners. Tradyxa Quant Dashboard is unaffiliated with NSE or Yahoo.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">Data Delay</h3>
              <p className="text-muted-foreground">
                Market data may be delayed up to 30 minutes. For educational use only.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">Risk Warning</h3>
              <p className="text-muted-foreground">
                Trading in financial instruments involves substantial risk of loss. Past performance 
                is not indicative of future results. The information provided by this dashboard is 
                for informational and educational purposes only and should not be considered as 
                investment advice or a recommendation to buy or sell any security.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">No Guarantee</h3>
              <p className="text-muted-foreground">
                We make no representations or warranties about the accuracy, completeness, or 
                timeliness of any information provided. Users should conduct their own research 
                and consult with qualified financial advisors before making investment decisions.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">Operator</h3>
              <p className="text-muted-foreground">
                Operated by Zeta Aztra Technologies (Individual Proprietorship, India)
              </p>
              <p className="text-muted-foreground mt-2">
                © 2025 Zeta Aztra Technologies. All Rights Reserved.
              </p>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
          {onLearnMore && (
            <Button 
              variant="outline" 
              onClick={onLearnMore}
              className="gap-2"
              data-testid="button-disclaimer-learn-more"
            >
              Learn More
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          <Button 
            onClick={handleAccept}
            data-testid="button-disclaimer-accept"
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
