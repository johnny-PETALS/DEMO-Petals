import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

// Standard database/mock models we share with client or run locally
import { STORES, ITEMS, GROWERS, SALES_HISTORY, DELIVERY_ORDERS, INITIAL_SCORECARDS, INITIAL_PURCHASE_ORDERS } from "./src/data/mockData";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Cache database additions in memory during application runtime
let dynamicPurchaseOrders = [...INITIAL_PURCHASE_ORDERS];
let dynamicScorecards = [...INITIAL_SCORECARDS];

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Get base static information
app.get("/api/static-data", (req, res) => {
  res.json({
    stores: STORES,
    items: ITEMS,
    growers: GROWERS,
    deliveryOrders: DELIVERY_ORDERS,
    purchaseOrders: dynamicPurchaseOrders,
    scorecards: dynamicScorecards
  });
});

// Update database routes (in-memory)
app.post("/api/purchase-orders", (req, res) => {
  const newPo = req.body;
  dynamicPurchaseOrders.unshift(newPo);
  res.json({ success: true, count: dynamicPurchaseOrders.length, po: newPo });
});

app.post("/api/purchase-orders/update-status", (req, res) => {
  const { id, status } = req.body;
  const poIndex = dynamicPurchaseOrders.findIndex(p => p.id === id);
  if (poIndex > -1) {
    dynamicPurchaseOrders[poIndex].status = status;
    res.json({ success: true, po: dynamicPurchaseOrders[poIndex] });
  } else {
    res.status(404).json({ error: "PO not found" });
  }
});

app.post("/api/scorecards", (req, res) => {
  const newScorecard = req.body;
  dynamicScorecards.unshift(newScorecard);
  res.json({ success: true, count: dynamicScorecards.length, scorecard: newScorecard });
});

// Endpoint: AI Chatbot powered by Gemini
app.post("/api/chat", async (req, res) => {
  try {
    const { message, storeId, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get selected store's contextual info
    const store = STORES.find(s => s.id === storeId) || STORES[0];
    const storeDeliveries = DELIVERY_ORDERS.filter(d => d.storeId === store.id);
    const storeScorecards = dynamicScorecards.filter(sc => sc.storeId === store.id);
    
    // Aggregate summary of recent trends for this store's items
    const storeSales = SALES_HISTORY.filter(s => s.storeId === store.id);
    const itemTrendSummaries = ITEMS.map(item => {
      const records = storeSales.filter(s => s.sku === item.sku);
      const totalSales = records.reduce((sum, r) => sum + r.quantity, 0);
      const recentSales = records.slice(-7).reduce((sum, r) => sum + r.quantity, 0);
      const prevSales = records.slice(-14, -7).reduce((sum, r) => sum + r.quantity, 0);
      const change = prevSales > 0 ? ((recentSales - prevSales) / prevSales) * 100 : 0;
      return `${item.name} (SKU: ${item.sku}): Totals: ${totalSales} items. Change in weekly velocity: ${change.toFixed(1)}%`;
    }).join("\n");

    const systemInstruction = `
You are the Petals West AI Store Agent, a highly responsive digital coordinator supporting Canadian retail flower operations for Shoppers Drug Mart stores and field representatives within our Scan-Based Trading (SBT) network.

Your goal is to answer client queries directly using actual database information, referencing Shoppers Drug Mart store locations, and formatting all prices and financials in Canadian Dollars (CAD, e.g., $10.50 CAD). Handle complex requests (like extra stock order) by summarizing them clearly so representatives can submit them.

Current Store Target Context:
- Store Name: ${store.name}
- Manager: ${store.manager}
- Location: ${store.city}, ${store.state} (${store.region} region, Canada)

UPCOMING DELIVERIES:
${JSON.stringify(storeDeliveries, null, 2)}

RECENT SCORECARDS RECORDED:
${JSON.stringify(storeScorecards, null, 2)}

RECENT FLORAL SALES TREND SUMMARY FOR THIS STORE (comparing last 7 days vs previous 7 days):
${itemTrendSummaries}

Common User Questions Guideline:
- "When is my next order coming?" / "What is my next order?" -> Refer to upcoming delivery orders that are pending/dispatched. State the exact date and list items/quantities.
- "What are my current trends?" -> Summarize the items trending up or down based on the recent sales trend summary. Identify top movers.
- "Can I get more product?" / "I need an extra delivery" -> Tell them you are drafting a formalized replenishment ticket. Synthesize their store needs into a concise ticket summary with: [Store Name], [Requested SKU/Items], [Estimated Urgency based on trends], and [Routing recipient: Regional Rep, Sarah/Alex]. Reassure them that a direct copy has been prepared for dispatch to our Canadian headquarters buying representatives!

Respond conversational, humble, and strictly literal. Use clear markdown formatting. All pricing references must be in Canadian Dollars (CAD). Do not assume or suggest any details of external databases or container host systems. Keep user secrets secure.
`;

    // Map incoming client chat history to correct parts format for chat.sendMessage
    // Using generative model
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: `System context initialized. Client message: ${message}` }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.error("Gemini chatbot error:", error);
    res.status(500).json({ error: error.message || "Something went wrong in the AI bot" });
  }
});

// Endpoint: Predictive Replenishment Model (Analysis Room)
app.post("/api/predict", async (req, res) => {
  try {
    const { storeId, sku } = req.body;
    if (!storeId || !sku) {
      return res.status(400).json({ error: "storeId and sku are required" });
    }

    const store = STORES.find(s => s.id === storeId);
    const item = ITEMS.find(i => i.sku === sku);
    if (!store || !item) {
      return res.status(404).json({ error: "Store or item not found" });
    }

    // Gather past 30 days history
    const history = SALES_HISTORY.filter(s => s.storeId === storeId && s.sku === sku)
      .sort((a,b) => a.date.localeCompare(b.date));

    const promptText = `
Given the last 30 days of sales history of item: ${item.name} (${item.sku}) at Store: ${store.name} (${store.id}).
We are using the Scan-Based Trading (SBT) model to minimize shelf waste and maximize bloom freshness.

Analyze the sales pattern (days of week, weekends, weekly velocity) and forecast the NEXT 7 days of replenishment requirements.
Also supply high-level executive insights, growth rates, and a decision action recommendation.

Input sales history data (date and quantity sold):
${JSON.stringify(history.map(h => ({ date: h.date, quantity: h.quantity })))}

Provide the prediction in a JSON format. The response schema must be:
{
  "insights": "Executive commentary summarizing historical peaks and weekend velocities (max 3 sentences)",
  "metricTrend": "Upward / Downward / Stable",
  "averageGrowthRate": number (percentage e.g. 2.4),
  "suggestedSafetyStock": number (recommended reserve bags/cases),
  "predictions": [
    {
      "date": "YYYY-MM-DD (next 7 calendar dates from 2026-06-20 to 2026-06-26)",
      "predictedQty": number,
      "replenishAction": "Deploy High / Standard Restock / Keep Idle"
    }
  ],
  "growerRawCropImpact": "A prediction translating these predicted sales into raw grower acres planning (e.g. how many blooms to sow/purchase in bulk)"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["insights", "metricTrend", "averageGrowthRate", "suggestedSafetyStock", "predictions", "growerRawCropImpact"],
          properties: {
            insights: { type: Type.STRING },
            metricTrend: { type: Type.STRING },
            averageGrowthRate: { type: Type.NUMBER },
            suggestedSafetyStock: { type: Type.NUMBER },
            growerRawCropImpact: { type: Type.STRING },
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["date", "predictedQty", "replenishAction"],
                properties: {
                  date: { type: Type.STRING },
                  predictedQty: { type: Type.NUMBER },
                  replenishAction: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const parsedJson = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedJson);
  } catch (error: any) {
    console.error("Gemini predictive error:", error);
    res.status(500).json({ error: error.message || "Failed to run predictions Model" });
  }
});

// Endpoint: Automated Purchase Order Auto-fill fields
app.post("/api/generate-po", async (req, res) => {
  try {
    const { growerName, sku, quantity, submittedBy } = req.body;
    if (!growerName || !sku || !quantity) {
      return res.status(400).json({ error: "growerName, sku, and quantity are required" });
    }

    const grower = GROWERS.find(g => g.name === growerName) || GROWERS[0];
    const item = ITEMS.find(i => i.sku === sku);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const calculatedCost = Number((item.defaultCost * 0.1 * quantity).toFixed(2)); // Grower raw cost is typically lower than list

    const promptText = `
You are the Purchasing Procurement Automation AI for Petals West Canada.
Your task is to take a raw order need, grower destination, and fill out ALL system and compliance fields for the grower purchase contract in Canadian Dollars (CAD).

Order Requirements:
- Grower: ${grower.name} (${grower.location})
- Item: ${item.name} (${item.sku})
- Raw Forecast Quantity: ${quantity} units (stems/bunches)
- Calculated Gross Cost: $${calculatedCost} CAD

Please generate the structured Purchase Order payload. Use the grower location and item type to determine realistic values:
- Domestic flowers like Lilies or Tulips from local growers will have: CustomsSku: "DOMESTIC-CAN-PNW", lower lead times, PaymentTerms: "Net 30 Days", Packaging: "Kraft sleeves".
- Imported flowers like Roses from Quito, Ecuador will have: CustomsSku: "HS-0603.11.00", longer ocean/cold transit, PaymentTerms: "Net 45 Days", Packaging: "Stem protective sleeves in cardboard grower crates".

The output must be JSON adhering exactly to this schema:
{
  "shippingAddress": "The physical warehouse to deliver to (select either 'Petals West Vancouver Port Cold Storage, Vancouver BC' or 'Petals West Toronto Logistics Hub, Mississauga ON' depending on SKU/Grower location)",
  "paymentTerms": "E.g. Net 30, Net 45",
  "customsSku": "The Customs HS Tariffs categorization code or domestic label",
  "packagingSpec": "The rigid shipping constraints and packaging instructions for growers",
  "notes": "Smart assistant suggestions on transport temperatures or grower relationship actions"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["shippingAddress", "paymentTerms", "customsSku", "packagingSpec", "notes"],
          properties: {
            shippingAddress: { type: Type.STRING },
            paymentTerms: { type: Type.STRING },
            customsSku: { type: Type.STRING },
            packagingSpec: { type: Type.STRING },
            notes: { type: Type.STRING }
          }
        }
      }
    });

    const parsedJson = JSON.parse(response.text?.trim() || "{}");
    
    // Formulate final PO
    const randomPoId = `PO-AI-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPo = {
      id: randomPoId,
      growerName: grower.name,
      sku: item.sku,
      itemName: item.name,
      quantity: Number(quantity),
      unitCost: Number((calculatedCost / quantity).toFixed(2)),
      totalCost: calculatedCost,
      shippingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 10 days out
      status: "draft",
      submittedBy: submittedBy || "buyer@petalswest.com",
      shippingAddress: parsedJson.shippingAddress,
      paymentTerms: parsedJson.paymentTerms,
      customsSku: parsedJson.customsSku,
      packagingSpec: parsedJson.packagingSpec,
      notes: parsedJson.notes
    };

    res.json({ success: true, po: newPo });
  } catch (error: any) {
    console.error("Gemini PO builder error:", error);
    res.status(500).json({ error: error.message || "Failed to automate PO field completion" });
  }
});


// Vite middleware mapping
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on http://localhost:${PORT}`);
  });
}

startServer();
