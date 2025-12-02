import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function TermsOfUse() {
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
                                Terms of Use
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                User obligations, acceptable use, and legal terms
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Acceptance</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                By accessing or using this website, you agree to these Terms, the Privacy Policy, Cookie
                                Notice, and Disclaimer. If you do not agree, do not use the site.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">No Advice</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                The site provides educational and informational content only. We do not provide investment
                                advice. You acknowledge sole responsibility for your trading/investment actions.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Intellectual Property</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                © 2025 Zeta Aztra Technologies. All rights reserved. All code, models, visualizations, and
                                branding are protected under applicable laws, including the Indian Copyright Act, 1957.
                                Unauthorized reproduction, scraping, framing, or redistribution is prohibited. "Tradyxa"
                                and "Zeta Aztra" are brand identifiers; unauthorized use is prohibited.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Data Attribution</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Market data © respective owners. Tradyxa Quant Dashboard is not affiliated with NSE or Yahoo.
                                Derived analytics and computed indicators are © Zeta Aztra Technologies. Market data may be
                                delayed up to 30 minutes. For educational use only.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Acceptable Use</h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                                <li>No unlawful, abusive, or malicious use of the site or data.</li>
                                <li>No automated scraping or bulk extraction of content without prior written consent.</li>
                                <li>No reverse engineering of proprietary models or bypassing rate limits.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Jurisdiction & Contact</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                These Terms are governed by the laws of India. All disputes are subject exclusively to the
                                courts of Chennai, Tamil Nadu. Contact: zetaaztratech@gmail.com.
                            </p>
                        </section>

                        <section className="space-y-4 pt-6 border-t">
                            <p className="text-sm text-muted-foreground">
                                <strong>Affiliation Disclaimer:</strong> Tradyxa Aztryx is a product of Zeta Aztra Technologies
                                (India) and is not affiliated with any other Tradyxa-named companies or domains.
                            </p>
                        </section>
                    </div>
                </main>
            </ScrollArea>
        </div>
    );
}
