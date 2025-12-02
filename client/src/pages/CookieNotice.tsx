import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function CookieNotice() {
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
                                Cookie Notice
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                How we use cookies and manage your consent preferences
                            </p>
                        </div>

                        <section className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                We use a minimal set of cookies and similar technologies to operate this site. Some cookies
                                are strictly necessary; others (analytics) are used only with your consent.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Cookie Categories</h2>
                            <ul className="space-y-3 text-muted-foreground">
                                <li>
                                    <strong>Strictly Necessary / Security:</strong> required for basic operation and security;
                                    always enabled.
                                </li>
                                <li>
                                    <strong>Functionality:</strong> theme preference (dark/light), UI settings.
                                </li>
                                <li>
                                    <strong>Analytics:</strong> anonymized traffic/performance metrics (enabled only with consent).
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Consent Management</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We provide a consent banner to manage your preferences. Your choices are stored locally in
                                your browser and will persist until you change them or clear your browser data.
                            </p>
                            <Button variant="outline" className="mt-4">
                                Open Cookie Settings
                            </Button>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Third Parties</h2>
                            <ul className="space-y-3 text-muted-foreground">
                                <li>
                                    <strong>Cloudflare Pages</strong> — hosting and performance; may log IPs for security.
                                </li>
                                <li>
                                    <strong>Adsterra</strong> — third-party advertising network (adsterra.com); may use cookies
                                    for ad delivery and measurement. We do not control Adsterra's data collection practices.
                                </li>
                                <li>
                                    <strong>Optional Google Analytics</strong> — anonymized analytics with Consent Mode v2.
                                </li>
                            </ul>
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
