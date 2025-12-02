import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, ChevronDown, Check, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_TICKERS } from "@/data/tickers";

const TOP_TICKERS = [
  { symbol: "NIFTY", name: "Nifty 50 Index" },
  { symbol: "BANKNIFTY", name: "Nifty Bank Index" },
];

const NIFTY_500_SAMPLE = [
  { symbol: "RELIANCE", name: "Reliance Industries Ltd" },
  { symbol: "TCS", name: "Tata Consultancy Services" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd" },
  { symbol: "INFY", name: "Infosys Ltd" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd" },
  { symbol: "ITC", name: "ITC Ltd" },
  { symbol: "SBIN", name: "State Bank of India" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank" },
  { symbol: "LT", name: "Larsen & Toubro Ltd" },
  { symbol: "AXISBANK", name: "Axis Bank Ltd" },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd" },
  { symbol: "MARUTI", name: "Maruti Suzuki India" },
  { symbol: "TITAN", name: "Titan Company Ltd" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd" },
  { symbol: "WIPRO", name: "Wipro Ltd" },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement" },
  { symbol: "HCLTECH", name: "HCL Technologies" },
];

interface LeftRailProps {
  selectedTicker: string;
  onTickerChange: (ticker: string) => void;
  notional: number;
  onNotionalChange: (notional: number) => void;
  verdictMultiplier?: number;
}

export function LeftRail({
  selectedTicker,
  onTickerChange,
  notional,
  onNotionalChange,
  verdictMultiplier = 1.0,
}: LeftRailProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTickers = useMemo(() => {
    if (!search) return ALL_TICKERS;
    const query = search.toLowerCase();
    return ALL_TICKERS.filter(
      (t) =>
        t.symbol.toLowerCase().includes(query) ||
        t.name.toLowerCase().includes(query)
    );
  }, [search]);

  const selectedTickerData = ALL_TICKERS.find((t) => t.symbol === selectedTicker);

  return (
    <aside className="w-full lg:w-80 bg-sidebar border-r border-sidebar-border h-full flex flex-col">
      <div className="px-4 py-2 min-h-[60px] border-b border-sidebar-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <TrendingUp className="h-6 w-6 text-primary shrink-0" />
          <div className="min-w-0">
            <h1 className="font-bold text-lg truncate leading-none">Tradyxa Aztryx</h1>
            <p className="text-xs text-muted-foreground leading-none mt-1">Dashboard</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 sm:p-4 space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Ticker
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between text-xs sm:text-sm h-auto min-h-[2.5rem] py-2 px-3 whitespace-normal text-left"
                  data-testid="button-ticker-select"
                >
                  <span className="flex-1 mr-2">
                    {selectedTickerData
                      ? `${selectedTickerData.symbol} - ${selectedTickerData.name}`
                      : "Select ticker..."}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search tickers..."
                    value={search}
                    onValueChange={setSearch}
                    data-testid="input-ticker-search"
                    className="text-xs sm:text-sm h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No ticker found.</CommandEmpty>
                    <CommandGroup heading="All Tickers">
                      {filteredTickers.map((ticker) => (
                        <CommandItem
                          key={ticker.symbol}
                          value={ticker.symbol}
                          onSelect={() => {
                            onTickerChange(ticker.symbol);
                            setOpen(false);
                          }}
                          data-testid={`option-ticker-${ticker.symbol}`}
                          className="text-xs sm:text-sm"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              selectedTicker === ticker.symbol
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium font-mono">
                              {ticker.symbol}
                            </span>
                            <span className="text-muted-foreground text-xs ml-1 block sm:inline">
                              {ticker.name}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label
              htmlFor="notional"
              className="text-xs text-muted-foreground uppercase tracking-wide"
            >
              Money to Invest (INR)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="notional"
                type="number"
                value={notional}
                onChange={(e) => onNotionalChange(Number(e.target.value))}
                className="pl-7 font-mono text-sm h-9"
                placeholder="1000000"
                data-testid="input-notional"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              💰 How much MONEY you want to invest - Changes when you buy/sell
            </p>

            {verdictMultiplier > 0 && (
              <div className="bg-muted/50 rounded-md p-3 mt-3 border border-muted">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                  💰 Invest THIS MUCH
                </p>
                <p className="text-lg sm:text-xl font-bold font-mono">
                  ₹{((notional * verdictMultiplier).toLocaleString('en-IN', { maximumFractionDigits: 0 }))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ({(verdictMultiplier * 100).toFixed(0)}%)
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic leading-normal">
                  Our MODEL says: Use only this much - Rest stay SAFE
                </p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border text-xs text-muted-foreground">
        <p>v1.0.0 · Educational use only</p>
      </div>
    </aside>
  );
}
