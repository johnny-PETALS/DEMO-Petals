import React from "react";
import { Flower, Store as StoreIcon, TrendingUp, ShoppingBag, ShieldCheck } from "lucide-react";

interface HeaderProps {
  currentTab: "hub" | "predict" | "po";
  setTab: (tab: "hub" | "predict" | "po") => void;
  selectedStoreId: string;
  setSelectedStoreId: (id: string) => void;
  stores: { id: string; name: string; city: string }[];
}

export default function Header({ currentTab, setTab, selectedStoreId, setSelectedStoreId, stores }: HeaderProps) {
  return (
    <header id="app-header" className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Logo Brand Brand */}
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-blue-600 rounded text-white flex items-center justify-center shadow-xs">
              <Flower className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-900 tracking-tight">Petals West</span>
              <span className="ml-2 text-[10px] font-mono px-1.5 py-0.25 bg-slate-100 text-slate-650 rounded border border-slate-200 font-semibold">SBT PLANNED REPLENISHMENT SYS</span>
            </div>
          </div>

          {/* Navigation Action tabs */}
          <nav className="hidden md:flex space-x-1">
            <button
              id="nav-tab-hub"
              onClick={() => setTab("hub")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                currentTab === "hub"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <StoreIcon className="h-3.5 w-3.5" />
              <span>Customer Help & Scorecards</span>
            </button>
            <button
              id="nav-tab-predict"
              onClick={() => setTab("predict")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                currentTab === "predict"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>SBT Forecasts & Analytics</span>
            </button>
            <button
              id="nav-tab-po"
              onClick={() => setTab("po")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                currentTab === "po"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Proactive Grower Buying / POs</span>
            </button>
          </nav>

          {/* Selector Context Section */}
          <div className="flex items-center space-x-2">
            <span className="hidden lg:inline text-[11px] font-bold text-slate-500 uppercase tracking-tight">Active Node:</span>
            <select
              id="store-selector-dropdown"
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="px-2 py-1 text-xs font-semibold border border-slate-250 rounded bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 hover:bg-slate-100 transition-colors"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile menu nav pills (visible on small displays) */}
        <div className="flex md:hidden space-x-1 overflow-x-auto py-1.5 border-t border-slate-105">
          <button
            onClick={() => setTab("hub")}
            className={`flex-none text-[10px] px-2.5 py-1 rounded font-bold uppercase ${
              currentTab === "hub" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Store Support
          </button>
          <button
            onClick={() => setTab("predict")}
            className={`flex-none text-[10px] px-2.5 py-1 rounded font-bold uppercase ${
              currentTab === "predict" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Predictions
          </button>
          <button
            onClick={() => setTab("po")}
            className={`flex-none text-[10px] px-2.5 py-1 rounded font-bold uppercase ${
              currentTab === "po" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Grower Buying
          </button>
        </div>
      </div>
    </header>
  );
}
