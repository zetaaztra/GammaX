import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation("/")}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </header>

            <ScrollArea className="h-[calc(100vh-64px)]">
                <main className="max-w-4xl mx-auto p-6 sm:p-8 md:p-12">
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                                Privacy Policy
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                How we handle your data and protect your privacy
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Overview</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                This website does not collect, store, or process personally identifiable information (PII).
                                Tradyxa Quant Dashboard uses publicly available market data (e.g., Yahoo Finance, NSE India)
                                and does not require user accounts or user-submitted data for access. Market data may be
                                delayed up to 30 minutes. For educational use only.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Hosting & Logs</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                The site is hosted by Cloudflare Pages (Cloudflare, Inc.). For security and performance,
                                Cloudflare may process limited technical information such as IP address, user agent, and
                                timestamps in server logs. We do not persist or export these logs. To the best of our knowledge,
                                host logs are auto-purged within a short retention window (typically ≤ 7 days). We do not
                                combine logs with any other data to identify individuals.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Analytics</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may use anonymous, aggregate analytics (e.g., Cloudflare Analytics) for performance
                                monitoring only. If Google Analytics is enabled, it will operate under Google Consent Mode v2
                                and respect your consent choices. IP anonymization is enabled where applicable.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Cookies</h2>
                            <p className="text-muted-foreground leading-relaxed">
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

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Cookie Settings / Preferences</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You can manage your cookie preferences at any time by clicking the "Cookie Preferences"
                                link in the footer.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">International & Indian Compliance</h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
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

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Your Choices</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You may request removal of any retained technical data by contacting us. Provide a detailed
                                description (date/time/region) so we can coordinate with our host. For cookie choices, use
                                the Cookie Settings link above to review or modify consent.
                            </p>
                        </section>

                        <section className="space-y-4 pt-6 border-t">
                            <p className="text-sm text-muted-foreground">
                                <strong>Affiliation Disclaimer:</strong> Tradyxa Aztryx is a product of Zeta Aztra Technologies
                                (India) and is not affiliated with any other Tradyxa-named companies or domains.
                            </p>
                        </section>

                        <footer className="pt-8 pb-4 border-t text-sm text-muted-foreground space-y-2">
                            <p>
                                Operated by Zeta Aztra Technologies (Individual Proprietorship, India) • © 2025 Zeta Aztra
                                Technologies. All Rights Reserved.
                            </p>
                            <p>
                                Jurisdiction: Chennai, Tamil Nadu • Contact: zetaaztratech@gmail.com • Version: v1.0.0
                            </p>
                        </footer>
                    </div>
                </main>
            </ScrollArea>
        </div>
    );
}
