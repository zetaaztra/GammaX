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
import { Shield, X } from "lucide-react";

interface PrivacyPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Shield className="h-6 w-6 text-primary" />
                        Privacy Policy
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        How we handle your data and protect your privacy
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-6 text-sm leading-relaxed">
                        <section>
                            <h3 className="font-semibold text-foreground mb-2 text-base">Overview</h3>
                            <p className="text-muted-foreground">
                                This website does not collect, store, or process personally identifiable information (PII).
                                Tradyxa Quant Dashboard uses publicly available market data (e.g., Yahoo Finance, NSE India)
                                and does not require user accounts or user-submitted data for access. Market data may be
                                delayed up to 30 minutes. For educational use only.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-semibold text-foreground mb-2 text-base">Hosting & Logs</h3>
                            <p className="text-muted-foreground">
                                The site is hosted by Cloudflare Pages (Cloudflare, Inc.). For security and performance,
                                Cloudflare may process limited technical information such as IP address, user agent, and
                                timestamps in server logs. We do not persist or export these logs. To the best of our
                                knowledge, host logs are auto-purged within a short retention window (typically ≤ 7 days).
                                We do not combine logs with any other data to identify individuals.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-semibold text-foreground mb-2 text-base">Analytics</h3>
                            <p className="text-muted-foreground">
                                We may use anonymous, aggregate analytics (e.g., Cloudflare Analytics) for performance
                                monitoring only. If Google Analytics is enabled, it will operate under Google Consent Mode v2
                                and respect your consent choices. IP anonymization is enabled where applicable.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-semibold text-foreground mb-2 text-base">Cookies</h3>
                            <p className="text-muted-foreground">
                                We use minimal cookies for theme preferences (dark/light) and basic site functionality.
                                Analytics and advertising cookies (if any) are used only with your consent. This website
                                displays advertisements from Adsterra (adsterra.com), a third-party advertising network.
                                Adsterra may use cookies and similar technologies to deliver relevant ads and measure ad
                                performance. We do not control Adsterra's data collection practices. For more information
                                about Adsterra's privacy practices, please visit their privacy policy. Users in the EEA/UK
                                are shown a Google-certified CMP (Funding Choices) implementing IAB TCF v2.2. You can change
                                your choices at any time via the Cookie Settings/Preferences link or banner.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-semibold text-foreground mb-2 text-base">Cookie Settings / Preferences</h3>
                            <p className="text-muted-foreground">
                                You can manage your cookie preferences at any time by clicking the "Cookie Preferences"
                                link in the footer.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-semibold text-foreground mb-2 text-base">International & Indian Compliance</h3>
                            <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                                <li>
                                    <strong>India:</strong> Information Technology Act, 2000; SPDI Rules 2011; SEBI IA
                                    Regulations (not an adviser).
                                </li>
                                <li>
                                    <strong>EU/UK:</strong> GDPR/UK-GDPR – lawful basis: legitimate interests and consent
                                    (where required).
                                </li>
                                <li>
                                    <strong>California:</strong> CCPA/CPRA – we do not sell personal information.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold text-foreground mb-2 text-base">Your Choices</h3>
                            <p className="text-muted-foreground">
                                You may request removal of any retained technical data by contacting us. Provide a detailed
                                description (date/time/region) so we can coordinate with our host. For cookie choices, use
                                the Cookie Settings link above to review or modify consent.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-semibold text-foreground mb-2 text-base">Affiliation Disclaimer</h3>
                            <p className="text-muted-foreground">
                                Tradyxa Aztryx is a product of Zeta Aztra Technologies (India) and is not affiliated with
                                any other Tradyxa-named companies or domains.
                            </p>
                        </section>

                        <section className="border-t pt-4">
                            <p className="text-muted-foreground text-xs">
                                Operated by Zeta Aztra Technologies (Individual Proprietorship, India) • © 2025 Zeta Aztra
                                Technologies. All Rights Reserved. • Jurisdiction: Chennai, Tamil Nadu • Contact:
                                zetaaztratech@gmail.com • Version: v1.0.0
                            </p>
                        </section>
                    </div>
                </ScrollArea>

                <DialogFooter className="pt-4 border-t">
                    <Button onClick={onClose} data-testid="button-privacy-close">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
