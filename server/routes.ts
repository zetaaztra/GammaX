import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSyntheticData, generateFullSyntheticData } from "./syntheticData";
import fs from "fs";

const tickerCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

const simulationJobs = new Map<string, { status: string; progress: number; ticker: string }>();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Helper to read JSON file safely
  const readJsonFile = async (filePath: string) => {
    try {
      if (!fs.existsSync(filePath)) return null;
      const content = await fs.promises.readFile(filePath, 'utf-8');
      if (!content || content.trim() === '') return null;
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error reading JSON file ${filePath}:`, error);
      return null;
    }
  };

  // Helper to get live spot price
  const getLiveSpotPrice = async (ticker: string) => {
    try {
      const liveData = await readJsonFile('public/data/live/spot_prices.json');

      // Map frontend tickers to yfinance tickers
      let searchTicker = ticker;
      if (ticker === 'NIFTY') searchTicker = '^NSEI';
      else if (ticker === 'BANKNIFTY') searchTicker = '^NSEBANK';
      else if (!ticker.endsWith('.NS')) searchTicker = `${ticker}.NS`;

      if (liveData && liveData.spot_prices && liveData.spot_prices[searchTicker]) {
        return liveData.spot_prices[searchTicker];
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Get ticker basic data
  app.get("/api/ticker/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      const cleanTicker = ticker.toUpperCase();

      // Try to read real data first
      const filePath = `public/data/ticker/${cleanTicker}.json`;
      let data = await readJsonFile(filePath);

      // If not found, try appending .NS (common for Nifty 500 tickers)
      let actualTicker = cleanTicker;
      if (!data && !cleanTicker.endsWith('.NS')) {
        actualTicker = `${cleanTicker}.NS`;
        const nsFilePath = `public/data/ticker/${actualTicker}.json`;
        data = await readJsonFile(nsFilePath);
      }

      // Get live spot price and VIX
      const liveSpot = await getLiveSpotPrice(cleanTicker);
      const liveData = await readJsonFile('public/data/live/spot_prices.json');

      if (!data) {
        // If no ticker file exists, create minimal structure from spot price only
        console.log(`No data file found for ${cleanTicker}, using spot price data only`);
        if (!liveSpot) {
          return res.status(404).json({ error: `No data available for ${cleanTicker}` });
        }

        // Create minimal response with just spot price data
        data = {
          ticker: cleanTicker,
          metrics: {
            spotPrice: Number(liveSpot.spot_price) || 0,
            spotChangePercent: Number(liveSpot.change_percent) || 0,
            spotChange: (Number(liveSpot.spot_price) * Number(liveSpot.change_percent)) / 100,
            vix: liveData?.india_vix?.vix || 0,
            slippageExpectation: 0,
          },
          verdict: null,
          analysis: null
        };
      } else {
        // Real file exists - compute slippage expectation from _slippage.json
        const slippageFile = `public/data/ticker/${actualTicker}_slippage.json`;
        const slippageData = await readJsonFile(slippageFile);

        let slippageExpectation = 0;
        if (slippageData) {
          // Calculate median slippage across all volume levels
          const allMedians: number[] = [];
          for (const volumeKey in slippageData) {
            const volData = slippageData[volumeKey];
            if (volData && typeof volData.median === 'number') {
              allMedians.push(volData.median * 100); // Convert to percentage
            }
          }
          if (allMedians.length > 0) {
            // Use median of medians as slippage expectation
            allMedians.sort((a, b) => a - b);
            const mid = Math.floor(allMedians.length / 2);
            slippageExpectation = allMedians.length % 2 === 0
              ? (allMedians[mid - 1] + allMedians[mid]) / 2
              : allMedians[mid];
          }
        }

        // Add slippageExpectation to metrics
        if (!data.metrics) data.metrics = {};
        data.metrics.slippageExpectation = Number(slippageExpectation.toFixed(3));

        // Overlay live spot price if available
        if (liveSpot && data.metrics) {
          data.metrics.spotPrice = Number(liveSpot.spot_price) || 0;
          data.metrics.spotChangePercent = Number(liveSpot.change_percent) || 0;
          data.metrics.spotChange = (data.metrics.spotPrice * data.metrics.spotChangePercent) / 100;
        }

        // Overlay India VIX if available
        if (liveData && liveData.india_vix && data.metrics) {
          data.metrics.vix = liveData.india_vix.vix;
        }
      }

      res.json(data);
    } catch (error) {
      console.error("Error fetching ticker data:", error);
      res.status(500).json({ error: "Failed to fetch ticker data" });
    }
  });

  // Get ticker full data (heavy)
  app.get("/api/ticker/:ticker/full", async (req, res) => {
    try {
      const { ticker } = req.params;
      const cleanTicker = ticker.toUpperCase();

      // Try to read real data first
      // Note: currently full data is also in the same JSON or generated
      // For now, we'll read the same JSON file as it contains full analysis
      const filePath = `public/data/ticker/${cleanTicker}.json`;
      let data = await readJsonFile(filePath);

      if (!data) {
        console.log(`No full data file found for ${cleanTicker}, using synthetic`);
        data = generateFullSyntheticData(cleanTicker);
      } else {
        // If the file exists, we might need to augment it with "full" data structure 
        // if the JSON structure differs from what the frontend expects for "full".
        // However, based on tradyxa_pipeline.py, the JSON seems comprehensive.
        // Let's ensure it has the fields the frontend expects, or fallback to synthetic for missing fields.
        const synthetic = generateFullSyntheticData(cleanTicker);
        data = { ...synthetic, ...data }; // Merge real data over synthetic structure to ensure all fields exist
      }

      res.json(data);
    } catch (error) {
      console.error("Error fetching full ticker data:", error);
      res.status(500).json({ error: "Failed to fetch full ticker data" });
    }
  });

  // Run simulation
  app.post("/api/run_simulation", async (req, res) => {
    try {
      const { ticker } = req.body;
      if (!ticker) {
        return res.status(400).json({ error: "Ticker is required" });
      }

      const jobId = `sim_${ticker}_${Date.now()}`;
      simulationJobs.set(jobId, { status: "running", progress: 0, ticker });

      // Simulate async processing
      setTimeout(() => {
        simulationJobs.set(jobId, { status: "running", progress: 50, ticker });
      }, 500);

      setTimeout(() => {
        // Clear cache to force refresh with new data
        tickerCache.delete(`basic_${ticker}`);
        tickerCache.delete(`full_${ticker}`);
        simulationJobs.set(jobId, { status: "completed", progress: 100, ticker });
      }, 1000);

      res.json({ jobId, status: "running", message: "Simulation started" });
    } catch (error) {
      console.error("Error running simulation:", error);
      res.status(500).json({ error: "Failed to run simulation" });
    }
  });

  // Get simulation status
  app.get("/api/simulation/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = simulationJobs.get(jobId);

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json(job);
    } catch (error) {
      console.error("Error fetching simulation status:", error);
      res.status(500).json({ error: "Failed to fetch simulation status" });
    }
  });

  return httpServer;
}
