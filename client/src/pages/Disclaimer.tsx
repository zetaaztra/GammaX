import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Disclaimer() {
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
                                Disclaimer
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Educational and informational use only. Not financial advice.
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Educational Purpose Only</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                The information, analytics, indicators, models, forecasts, and visualizations on this website
                                are provided solely for educational and informational purposes. Nothing here constitutes
                                financial, investment, trading, tax, accounting, or legal advice.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">SEBI Notice</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Zeta Aztra Technologies, its owner(s), developers, and affiliates are not SEBI-registered
                                investment advisers or research analysts. All trading and investment decisions made based on
                                the information presented here are taken entirely at the user's own risk.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Liability Disclaimer</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We explicitly disclaim any and all liability for losses, damages, or other consequences arising
                                from use of, reliance upon, or inability to use the content, data, indicators, or models on
                                this website. Users should consider consulting a SEBI-registered financial adviser.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Third-Party Content</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                This website may display advertisements and links to external websites. Zeta Aztra Technologies
                                does not endorse or control third-party content or claims, and assumes no responsibility for
                                any products, services, or information provided by third parties. Interactions with such content
                                are at your own discretion and risk.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Data Accuracy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Market data and prices are sourced from publicly available providers (e.g., Yahoo Finance,
                                NSE India). While reasonable efforts are made to ensure accuracy and timely updates, no
                                guarantee or warranty is given regarding completeness, reliability, timeliness, suitability,
                                or availability for any purpose. Market data may be delayed up to 30 minutes. For educational
                                use only.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">User Acknowledgment</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                By using this website, you acknowledge and agree that you bear full responsibility for your
                                trading and investment decisions, and that Zeta Aztra Technologies and contributors shall have
                                no liability whatsoever for any loss or damage that may result.
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
