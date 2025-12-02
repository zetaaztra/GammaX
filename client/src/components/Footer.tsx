import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-card/50 py-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="space-y-1">
            <p><strong>Data Sources:</strong> NSE India, Yahoo Finance</p>
            <p>Analytics powered by Tradyxa Analytics Engine v1.0.0</p>
          </div>
          <div className="space-y-1 md:text-right">
            <p>Market data © respective owners. Tradyxa Quant Dashboard is unaffiliated with NSE or Yahoo.</p>
            <p>Market data may be delayed up to 30 minutes. For educational use only.</p>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <p>Operated by Zeta Aztra Technologies (Individual Proprietorship, India)</p>
          <p>© 2025 Zeta Aztra Technologies. All Rights Reserved.</p>
        </div>

        <div className="text-center text-[10px] text-muted-foreground/60 space-y-1">
          <p>zetaaztratech@gmail.com | Jurisdiction: Chennai, Tamil Nadu | Version: v1.0.0</p>
          <p>Visual models and code protected under Copyright Act, 1957 (India). Unauthorized use of the Tradyxa or Zeta Aztra name, logo, or visuals is strictly prohibited.</p>
          <p>Tradyxa Quant Dashboard is a product of Zeta Aztra Technologies (India) and is not affiliated with any other Tradyxa-named companies or domains.</p>
        </div>

        <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-2">
          <Link href="/privacy-policy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link href="/cookie-notice" className="hover:text-primary transition-colors">
            Cookie Preferences
          </Link>
          <span>·</span>
          <Link href="/terms-of-use" className="hover:text-primary transition-colors">
            Terms of Use
          </Link>
          <span>·</span>
          <Link href="/disclaimer" className="hover:text-primary transition-colors">
            Disclaimer
          </Link>
          <span>·</span>
          <Link href="/about" className="hover:text-primary transition-colors">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
