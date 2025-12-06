import { Button } from "@/components/ui/button";
import { Share2, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
    ticker: string;
    verdict?: string;
    className?: string;
}

export function ShareButtons({ ticker, verdict, className = "" }: ShareButtonsProps) {
    const baseUrl = "https://tradyxa-betax.pages.dev/";

    const shareText = verdict
        ? `📊 ${ticker} Analysis: ${verdict} signal on Tradyxa Aztryx! Check out this free stock analysis dashboard for NIFTY, BankNifty & 500+ Indian stocks.`
        : `📊 Check out ${ticker} analysis on Tradyxa Aztryx - Free stock analysis for NIFTY, BankNifty & 500+ Indian stocks!`;

    const handleTwitterShare = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(baseUrl)}`;
        window.open(twitterUrl, "_blank", "noopener,noreferrer,width=600,height=400");
    };

    const handleWhatsAppShare = () => {
        const whatsappText = `${shareText}\n\n${baseUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Button
                variant="outline"
                size="sm"
                onClick={handleTwitterShare}
                className="gap-2 text-xs"
                title="Share on Twitter/X"
            >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tweet</span>
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsAppShare}
                className="gap-2 text-xs"
                title="Share on WhatsApp"
            >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
            </Button>
        </div>
    );
}
