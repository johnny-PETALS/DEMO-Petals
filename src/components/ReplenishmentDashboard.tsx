import React, { useState, useEffect } from "react";
import { TrendingUp, Cpu, Calendar, Tag, ArrowRight, ShieldAlert, CheckCircle2, ChevronRight, Activity, Sprout } from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Item, SalesRecord } from "../types";

interface ReplenishmentDashboardProps {
  selectedStoreId: string;
  storeName: string;
  items: Item[];
  salesHistory: SalesRecord[];
}

interface PredictionData {
  insights: string;
  metricTrend: string;
  averageGrowthRate: number;
  suggestedSafetyStock: number;
  growerRawCropImpact: string;
  predictions: {
    date: string;
    predictedQty: number;
    replenishAction: string;
  }[];
}

export default function ReplenishmentDashboard({ selectedStoreId, storeName, items, salesHistory }: ReplenishmentDashboardProps) {
  const [selectedSku, setSelectedSku] = useState(items[0].sku);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState<PredictionData | null>(null);

  const selectedItem = items.find((i) => i.sku === selectedSku) || items[0];

  // Filter 30-day history for selected store + item
  const filteredHistory = salesHistory
    .filter((s) => s.storeId === selectedStoreId && s.sku === selectedSku)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Auto-trigger clean state on sku/store change
  useEffect(() => {
    setPrediction(null);
    setError("");
  }, [selectedStoreId, selectedSku]);

  const handleRunAiModel = async () => {
    setLoading(true);
    setError("");
    setPrediction(null);
    
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: selectedStoreId,
          sku: selectedSku
        })
      });

      if (!response.ok) {
        throw new Error("Unable to load forecasting calculations from server.");
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate predictive metrics.");
    } finally {
      setLoading(false);
    }
  };

  // Format historical chart data for Recharts
  const chartData = filteredHistory.map((h) => ({
    date: h.date.substring(5), // MM-DD for label brevity
    "Quantity Sold": h.quantity
  }));

  // Average 30-day velocity
  const avgSales = parseFloat(
    (filteredHistory.reduce((sum, current) => sum + current.quantity, 0) / (filteredHistory.length || 1)).toFixed(1)
  );

  return (
    <div className="space-y-4" id="replenishment-dashboard-container">
      {/* Selection Control Panel */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-3xs">
        <div className="space-y-0.5">
          <span className="text-[9px] uppercase font-bold tracking-wider text-blue-600 block">Scan-Based Trading Analytical Model</span>
          <h2 className="text-xs font-black uppercase text-slate-900 flex items-center space-x-1.5">
            <Activity className="h-4 w-4 text-blue-600" />
            <span>Store replenishment deep-dive</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Deep dive into historical daily sales trends and predict replenishment speeds.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            <select
              id="forecast-item-selector"
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent py-0.5 focus:outline-none"
            >
              {items.map((i) => (
                <option key={i.sku} value={i.sku}>
                  {i.category} - {i.name}
                </option>
              ))}
            </select>
          </div>

          <button
            id="run-predictions-button"
            onClick={handleRunAiModel}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 rounded flex items-center space-x-1 transition-colors"
          >
            <Cpu className="h-3.5 w-3.5 animate-pulse" />
            <span>{loading ? "Calculating..." : "Compute AI Sales Forecast"}</span>
          </button>
        </div>
      </div>

      {/* Primary Historical Window */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Historical Graph */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between shadow-3xs">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">30-Day Historical Sales Velocity</h3>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{storeName} | {selectedItem.name}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Average Daily Velocity</span>
                <span className="text-lg font-mono font-bold text-slate-900">{avgSales} stems</span>
              </div>
            </div>

            <div className="h-56 w-full mt-2" id="historical-sales-recharts">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} fontClassName="font-mono" />
                  <YAxis stroke="#94a3b8" fontSize={9} fontClassName="font-mono" />
                  <ChartTooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "4px", border: "none" }}
                    labelStyle={{ color: "#94a3b8", fontSize: "10px", fontWeight: "bold", fontFamily: "monospace" }}
                    itemStyle={{ color: "#ffffff", fontSize: "11px", fontFamily: "monospace" }}
                  />
                  <Area type="monotone" dataKey="Quantity Sold" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[9px] text-slate-400 font-mono flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200 mt-3">
            <span className="flex items-center gap-1 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
              SBT Chronological Sales Feed
            </span>
            <span>Refreshed daily from registers</span>
          </div>
        </div>

        {/* Action / Explanation Box */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between shadow-3xs">
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Replenishment Status Overview</h3>
            
            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Core Retail SKU Specs</span>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-500 font-semibold">Flower SKU</span>
                  <span className="font-mono text-slate-800">{selectedItem.sku}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-500 font-semibold">Standard Master Case</span>
                  <span className="text-slate-800">Pack of {selectedItem.caseQuantity} Bunches</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-500 font-semibold">Retail Base Cost</span>
                  <span className="font-mono text-blue-700">${selectedItem.defaultCost.toFixed(2)} CAD</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1 font-semibold">
              <span className="text-[9px] text-blue-600 font-black uppercase block">Scan-Based Trading (SBT) Mandate</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan-Based Trading means Petals West owns the inventory in the store until the customer registers pay for the flowers. 
              </p>
              <p className="text-xs text-slate-650 leading-relaxed font-bold italic">
                Thus, keeping zero stockout levels while strictly avoiding browning/shrink is the key to gross profit. This predictive room calculates optimal restocking cycles.
              </p>
            </div>
          </div>

          <div className="border border-dashed border-slate-200 p-2.5 rounded bg-blue-50/20 text-[10px] font-bold text-slate-700 leading-normal">
            💡 Select an item above and hit <strong className="text-blue-700">Compute AI Sales Forecast</strong> to see future replenishment recommendations.
          </div>
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-lg shadow-xs space-y-2">
          <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-800 font-mono tracking-tight">Syncing historical registers with Gemini 3.5 AI Engine...</p>
          <p className="text-[10px] text-slate-400">Comparing seasonal holiday velocity constants to forecast farm supply chain crops.</p>
        </div>
      )}

      {/* Errors */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* Predictions Section */}
      {prediction && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="prediction-feed-panel">
          {/* Main Forecast Graph */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-3.5 space-y-3 shadow-3xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase font-bold text-blue-600 tracking-wider">AI Calculation Output</span>
                <h3 className="text-xs font-black uppercase text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <span>Future 7-Day Demands Forecast</span>
                  <span className="px-1.5 py-0.25 bg-blue-50 text-blue-700 rounded border border-blue-150 text-[8px] font-mono font-extrabold uppercase">
                    Model Confirmed
                  </span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block font-semibold">Suggested Safety Cushion</span>
                <span className="text-lg font-mono font-bold text-slate-900">{prediction.suggestedSafetyStock} stems</span>
              </div>
            </div>

            {/* Recharts prediction line */}
            <div className="h-48 w-full" id="predictive-forecast-recharts">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prediction.predictions} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} fontClassName="font-mono" />
                  <YAxis stroke="#94a3b8" fontSize={9} fontClassName="font-mono" />
                  <ChartTooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "4px", border: "none" }}
                    labelStyle={{ color: "#94a3b8", fontSize: "10px", fontWeight: "bold", fontFamily: "monospace" }}
                    itemStyle={{ color: "#3b82f6", fontSize: "11px", fontFamily: "monospace" }}
                  />
                  <Line type="monotone" dataKey="predictedQty" name="Predicted Stem Sales" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Daily predictions details table */}
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-[11px] text-left text-slate-600 border border-slate-205 rounded overflow-hidden">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-left">Future Delivery Date</th>
                    <th className="px-3 py-2 text-left">Predicted Sales Demand</th>
                    <th className="px-3 py-2 text-left">Automated Replenish Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs font-semibold">
                  {prediction.predictions.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 font-mono text-slate-800">{p.date}</td>
                      <td className="px-3 py-2 font-mono text-slate-900 font-extrabold">{p.predictedQty} units</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.25 rounded border text-[9px] font-black uppercase tracking-tight ${
                          p.replenishAction.includes("High") 
                            ? "bg-amber-50 text-amber-700 border-amber-200" 
                            : p.replenishAction.includes("Restock")
                            ? "bg-slate-100 text-slate-800 border-slate-200"
                            : "bg-slate-50 text-slate-400 border-slate-150"
                        }`}>
                          {p.replenishAction}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Metrics summary bento block */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white border border-slate-800 rounded-lg p-4 space-y-3 shadow-xs">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 text-blue-400 font-semibold">
                <Cpu className="h-3.5 w-3.5" />
                <span>Executive Insights</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Calculated Trend Direction</span>
                  <span className="text-sm font-bold flex items-center gap-1 mt-0.5 text-blue-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {prediction.metricTrend} ({prediction.averageGrowthRate}% change)
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">AI Commentary Detail</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-bold">
                    {prediction.insights}
                  </p>
                </div>
              </div>
            </div>

            {/* Sprout Grower Impact box */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center space-x-1.5 text-blue-850">
                <Sprout className="h-4.5 w-4.5 text-blue-600" />
                <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-800">Grower & Farm Crop Impact</h4>
              </div>
              <p className="text-xs text-slate-700 leading-normal font-bold">
                How do we translate these future retail shelf forecasts proactively onto farm sow orders and growers?
              </p>
              <div className="bg-white p-2.5 border border-blue-150 rounded text-blue-950 text-xs font-semibold leading-relaxed shadow-3xs">
                {prediction.growerRawCropImpact}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
