import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import StoreBot from "./components/StoreBot";
import ScorecardManager from "./components/ScorecardManager";
import ReplenishmentDashboard from "./components/ReplenishmentDashboard";
import GrowerPlanner from "./components/GrowerPlanner";
import { Store, Item, Grower, DeliveryOrder, Scorecard, PurchaseOrder } from "./types";
import { STORES, ITEMS, GROWERS, SALES_HISTORY, DELIVERY_ORDERS, INITIAL_SCORECARDS, INITIAL_PURCHASE_ORDERS } from "./data/mockData";
import { ShieldCheck, Calendar, Activity, Cpu } from "lucide-react";

export default function App() {
  const [tab, setTab] = useState<"hub" | "predict" | "po">("hub");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("S01");
  
  // Entities lists loaded from server static-data api
  const [stores, setStores] = useState<Store[]>(STORES);
  const [items, setItems] = useState<Item[]>(ITEMS);
  const [growers, setGrowers] = useState<Grower[]>(GROWERS);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>(DELIVERY_ORDERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [scorecards, setScorecards] = useState<Scorecard[]>(INITIAL_SCORECARDS);
  const [loadingContext, setLoadingContext] = useState(true);

  // Synchronize base database assets with express server
  useEffect(() => {
    async function fetchStaticContext() {
      try {
        const res = await fetch("/api/static-data");
        if (res.ok) {
          const data = await res.json();
          setStores(data.stores);
          setItems(data.items);
          setGrowers(data.growers);
          setDeliveryOrders(data.deliveryOrders);
          setPurchaseOrders(data.purchaseOrders);
          setScorecards(data.scorecards);
        }
      } catch (err) {
        console.error("Failed to load databases static assets. Using local assemblies as fallbacks.", err);
      } finally {
        setLoadingContext(false);
      }
    }
    fetchStaticContext();
  }, []);

  const activeStore = stores.find((s) => s.id === selectedStoreId) || stores[0];

  const handleAddScorecard = (newSc: Scorecard) => {
    setScorecards((prev) => [newSc, ...prev]);
  };

  const handleAddPurchaseOrder = (newPo: PurchaseOrder) => {
    setPurchaseOrders((prev) => [newPo, ...prev]);
  };

  const handleUpdatePoStatus = async (id: string, status: PurchaseOrder["status"]) => {
    try {
      const res = await fetch("/api/purchase-orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        const data = await res.json();
        setPurchaseOrders((prev) => prev.map((p) => p.id === id ? data.po : p));
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800" id="applet-main-root">
      {/* Workspace Header */}
      <Header
        currentTab={tab}
        setTab={setTab}
        selectedStoreId={selectedStoreId}
        setSelectedStoreId={setSelectedStoreId}
        stores={stores}
      />

      {/* Primary Workspace Space */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-5 space-y-4">
        {loadingContext && (
          <div className="p-2 sm:p-3 bg-slate-100 text-slate-600 font-mono text-[10px] font-bold text-center border border-slate-200 rounded animate-pulse">
            Loading Petals West SBT data warehouses...
          </div>
        )}

        {/* Tab 1: Customer Service Agent & Compliance Checklist */}
        {tab === "hub" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" id="customer-hub-view">
            {/* Column Left: AI Chat Bot */}
            <div className="lg:col-span-12 xl:col-span-6 space-y-3.5">
              <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-3xs">
                <span className="text-[9px] uppercase font-bold text-blue-600 tracking-widest block">Instant Customer Service Agent</span>
                <h1 className="text-xs font-black uppercase text-slate-900 tracking-wider mt-0.5">AI Sales Support Assistant</h1>
                <p className="text-[11px] text-slate-500 font-medium">Answering client queries and routing stock escalations proactively.</p>
              </div>

              <StoreBot
                selectedStoreId={selectedStoreId}
                storeName={activeStore.name}
              />
            </div>

            {/* Column Right: Scorecards replacement */}
            <div className="lg:col-span-12 xl:col-span-6 space-y-3.5">
              <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-3xs">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest block">Merchandiser Field Checklists</span>
                <h1 className="text-xs font-black uppercase text-slate-900 tracking-wider mt-0.5">Scorecard replacements</h1>
                <p className="text-[11px] text-slate-500 font-medium">Visiting staff visual audits and water health validation parameters.</p>
              </div>

              <ScorecardManager
                selectedStoreId={selectedStoreId}
                storeName={activeStore.name}
                scorecards={scorecards}
                onAddScorecard={handleAddScorecard}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Scan-Based Trading predictions & forecast graphs */}
        {tab === "predict" && (
          <div id="predictive-replenishment-view" className="space-y-4">
            <div className="bg-white p-4.5 border border-slate-200 rounded-lg shadow-3xs">
              <span className="text-[9px] uppercase font-bold text-blue-600 tracking-widest block mb-0.5">Predictive Intelligence Model</span>
              <h1 className="text-xs font-black uppercase text-slate-900 tracking-wider">AI Predictive Sales Plan & Forecast Model</h1>
              <p className="text-[11px] text-slate-500 font-medium font-sans mt-0.5">
                Analyzing historical store/item/day sale registers through Gemini advanced mathematical thinking model to map out farm crop booking volumes.
              </p>
            </div>

            <ReplenishmentDashboard
              selectedStoreId={selectedStoreId}
              storeName={activeStore.name}
              items={items}
              salesHistory={SALES_HISTORY}
            />
          </div>
        )}

        {/* Tab 3: Proactive Grower Purchase contracts */}
        {tab === "po" && (
          <div id="grower-planner-view" className="space-y-4">
            <div className="bg-white p-4.5 border border-slate-200 rounded-lg shadow-3xs">
              <span className="text-[9px] uppercase font-bold text-blue-600 tracking-widest block mb-0.5">Procurement Automation Framework</span>
              <h1 className="text-xs font-black uppercase text-slate-900 tracking-wider">Farm Grower purchase agreements & automated PO management</h1>
              <p className="text-[11px] text-slate-500 font-medium font-sans mt-0.5">
                Review crop demands, automatically draft contracts, and bypass repetitive manual buying tasks to free up buyers capacity.
              </p>
            </div>

            <GrowerPlanner
              growers={growers}
              items={items}
              purchaseOrders={purchaseOrders}
              onAddPurchaseOrder={handleAddPurchaseOrder}
              onUpdatePoStatus={handleUpdatePoStatus}
            />
          </div>
        )}
      </main>

      {/* Clean elegant footer */}
      <footer className="border-t border-slate-200 bg-white py-3.5 mt-auto shadow-3xs">
        <div className="max-w-7xl mx-auto px-4 text-center flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-slate-400 font-mono font-bold">
          <span>Petals West © 2026 Procurement & Logistics Management Systems</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
            <span>Secure Enterprise Node</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
