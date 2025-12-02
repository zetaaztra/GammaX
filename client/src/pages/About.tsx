import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function About() {
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
                                About Tradyxa Quant Dashboard
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Next-Day Forecasts, Volatility Analysis, and Quantitative ML Models
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Purpose</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Tradyxa Aztryx is an educational platform designed to provide advanced options analytics,
                                volatility indicators, and machine learning-based forecasts for NIFTY options trading. The
                                dashboard aggregates real-time market data from NSE India and Yahoo Finance to compute various
                                metrics including IV Rank, Volatility Risk Premium, Market Mood Index, and predictive models
                                using Linear Regression, Logistic Regression, Random Forest, Quantile Regression, and LSTM
                                neural networks.
                            </p>
                            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mt-4">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Important:</strong> This dashboard is for educational purposes only and does not
                                    constitute financial, investment, trading, or legal advice. All trading decisions are made
                                    at your own risk.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Data Sources & Attribution</h2>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>
                                    <strong>NSE India:</strong> Real-time option chain data, historical prices
                                </li>
                                <li>
                                    <strong>Yahoo Finance:</strong> Market data, VIX, historical OHLC data
                                </li>
                            </ul>
                            <p className="text-sm text-muted-foreground mt-4">
                                Market data © respective owners. Tradyxa Quant Dashboard is unaffiliated with NSE or Yahoo.
                                Market data may be delayed up to 30 minutes. For educational use only.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Legal & Privacy</h2>
                            <div className="space-y-3 text-muted-foreground">
                                <p><strong>Operated by:</strong> Zeta Aztra Technologies (Individual Proprietorship, India)</p>
                                <p><strong>Jurisdiction:</strong> Chennai, Tamil Nadu, India</p>
                                <p><strong>Contact:</strong> zetaaztratech@gmail.com</p>
                                <p><strong>Version:</strong> v1.0.0</p>
                                <p>
                                    <strong>Data Protection:</strong> This site does not collect or store any personally
                                    identifiable information. Server logs are automatically deleted within 7 days by the host
                                    (Cloudflare Pages).
                                </p>
                                <p>
                                    <strong>Advertising:</strong> This website displays advertisements provided by Adsterra
                                    (adsterra.com), a third-party advertising network. Adsterra may use cookies and similar
                                    technologies to deliver relevant ads. We do not control Adsterra's data collection practices.
                                </p>
                                <p>
                                    <strong>Intellectual Property:</strong> Visual models and code protected under Copyright
                                    Act, 1957 (India). Unauthorized use of the Tradyxa or Zeta Aztra name, logo, or visuals is
                                    strictly prohibited.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4 pt-6 border-t">
                            <p className="text-sm text-muted-foreground">
                                <strong>Affiliation Disclaimer:</strong> Tradyxa Aztryx is a product of Zeta Aztra Technologies
                                (India) and is not affiliated with any other Tradyxa-named companies or domains.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Contact & Support</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                For inquiries, support, or data deletion requests:
                            </p>
                            <p className="text-lg font-medium">zetaaztratech@gmail.com</p>
                        </section>
                    </div>
                </main>
            </ScrollArea>
        </div>
    );
}
