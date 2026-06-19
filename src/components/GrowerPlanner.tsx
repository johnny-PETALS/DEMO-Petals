import React, { useState } from "react";
import { ShoppingBag, ChevronRight, Sprout, ArrowRight, CheckCircle2, ShieldAlert, BadgeInfo, Star, FileCheck, RefreshCw, Layers } from "lucide-react";
import { Grower, Item, PurchaseOrder } from "../types";

interface GrowerPlannerProps {
  growers: Grower[];
  items: Item[];
  purchaseOrders: PurchaseOrder[];
  onAddPurchaseOrder: (po: PurchaseOrder) => void;
  onUpdatePoStatus: (id: string, status: PurchaseOrder["status"]) => void;
}

export default function GrowerPlanner({ growers, items, purchaseOrders, onAddPurchaseOrder, onUpdatePoStatus }: GrowerPlannerProps) {
  const [selectedGrowerName, setSelectedGrowerName] = useState(growers[0].name);
  const [selectedSku, setSelectedSku] = useState(items[0].sku);
  const [targetQuantity, setTargetQuantity] = useState(1500);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [draftPo, setDraftPo] = useState<PurchaseOrder | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const currentGrower = growers.find(g => g.name === selectedGrowerName) || growers[0];
  const currentItem = items.find(i => i.sku === selectedSku) || items[0];

  // AI procurement generation trigger
  const handleAiAutoFill = async () => {
    if (targetQuantity <= 0) return;
    setAiGenerating(true);
    setDraftPo(null);
    setToastMsg("");
    setErrorMsg("");

    try {
      const response = await fetch("/api/generate-po", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          growerName: selectedGrowerName,
          sku: selectedSku,
          quantity: targetQuantity,
          submittedBy: "johnny@petalswest.com"
        })
      });

      if (!response.ok) {
        throw new Error("Unable to contact procurement generator.");
      }

      const data = await response.json();
      setDraftPo(data.po);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("AI Auto-fill failed. Check backend connection.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveDraftPo = async () => {
    if (!draftPo) return;
    
    try {
      const response = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftPo)
      });

      if (response.ok) {
        const data = await response.json();
        onAddPurchaseOrder(data.po);
        setDraftPo(null);
        setToastMsg(`Successfully generated and queued contract PO ${data.po.id}!`);
        setTimeout(() => setToastMsg(""), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4" id="grower-purchasing-panel">
      {/* Visual Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-3xs">
        <div className="space-y-0.5">
          <span className="text-[9px] uppercase font-bold tracking-wider text-blue-600 block">Proactive Agriculture & Crop Booking</span>
          <h2 className="text-xs font-black uppercase text-slate-900 flex items-center space-x-1.5">
            <Layers className="h-4.5 w-4.5 text-blue-600" />
            <span>Buyer automation console</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-medium font-sans">
            Bridge predicted shelf demands directly to farm sow quotas, auto-fitting customs categorization and packaging specs.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 text-[10px] font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded border border-slate-200">
          <Sprout className="h-3.5 w-3.5 text-blue-600" />
          <span>Farm Integration Hub</span>
        </div>
      </div>

      {toastMsg && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] rounded font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-[11px] rounded font-bold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main split work board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Farm Order auto-filler (Column left) */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white border border-slate-200 p-3.5 rounded-lg space-y-3.5 shadow-3xs">
          <div className="border-b border-slate-200 pb-2 flex items-center space-x-1.5">
            <Sprout className="h-4.5 w-4.5 text-blue-600" />
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">AI PO Auto-Fill Panel</h3>
          </div>

          <p className="text-[11px] text-slate-500 leading-normal font-sans">
            Input the projected stem demand. The assistant will auto-fill shipping destinations, compliance tax codes (HS tariffs), and packaging restrictions based on geographical lead-times.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Target Grower Destination</label>
              <select
                id="po-grower-selector"
                value={selectedGrowerName}
                onChange={(e) => setSelectedGrowerName(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:border-slate-800 focus:bg-white text-slate-800 font-semibold"
              >
                {growers.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name} ({g.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Flower / Plant SKU</label>
              <select
                id="po-item-selector"
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:border-slate-800 focus:bg-white text-slate-800 font-semibold"
              >
                {items.map((i) => (
                  <option key={i.sku} value={i.sku}>
                    {i.sku} - {i.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Target Quantity Needed (Stems)</label>
              <input
                id="po-qty-input"
                type="number"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(parseInt(e.target.value) || 0)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800 font-bold"
              />
            </div>

            <div className="text-[10px] text-slate-500 space-y-1 pt-1">
              <div className="flex justify-between font-mono">
                <span>Wholesale base:</span>
                <span>${(currentItem.defaultCost * 0.1).toFixed(2)} CAD / stem</span>
              </div>
              <div className="flex justify-between font-mono font-bold text-slate-800">
                <span>Calculated farm cost (bulk):</span>
                <span>${(currentItem.defaultCost * 0.1 * targetQuantity).toFixed(2)} CAD</span>
              </div>
            </div>

            <button
              id="autofill-po-btn"
              onClick={handleAiAutoFill}
              disabled={aiGenerating || targetQuantity <= 0}
              className="w-full py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded disabled:opacity-50 transition-colors flex items-center justify-center space-x-1.5"
            >
              {aiGenerating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Configuring custom grower schemas...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Generate Grower PO with AI Auto-Fill</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Auto-filled PO Preview (Column right) */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-4">
          {draftPo ? (
            <div className="bg-slate-900 text-white rounded-lg p-4 border border-slate-850 space-y-3 shadow-md animate-fade-in" id="draft-po-preview-card">
              <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-widest block font-black">AI AUTO-FILLED RESULT PREVIEW</span>
                  <p className="text-slate-400 text-[10px] font-mono font-bold">{draftPo.id} (Proposed Draft)</p>
                </div>
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono text-[9px] uppercase font-bold tracking-wider">
                  Needs Review
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono font-bold">
                <div>
                  <span className="text-[9px] text-slate-400 block font-normal">GROWER</span>
                  <span className="font-sans font-semibold text-slate-200 truncate block">{draftPo.growerName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-normal">ITEM</span>
                  <span className="font-sans font-semibold text-slate-200 truncate block">{draftPo.itemName} ({draftPo.sku})</span>
                </div>
              </div>

              <div className="space-y-2 pt-2.5 border-t border-slate-800 text-xs font-semibold">
                <div>
                  <span className="text-[9px] font-bold text-blue-400 block uppercase font-mono mb-0.5">Shipping Target Destination Node:</span>
                  <p className="text-slate-300 font-medium italic leading-relaxed">{draftPo.shippingAddress}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-normal">PAYMENT TERMS</span>
                    <span className="text-slate-200 font-semibold">{draftPo.paymentTerms}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-normal">CUSTOMS HS CODE</span>
                    <span className="text-slate-200 font-semibold">{draftPo.customsSku}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-blue-400 block uppercase font-mono mb-0.5">Grower Rigid Packaging Spec:</span>
                  <p className="text-slate-300 capitalize italic bg-slate-950 p-2 border border-slate-800 text-[11px] leading-relaxed">
                    {draftPo.packagingSpec}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 block font-mono mb-0.5 font-normal">Procurement Assistant Advisory & Lead-Times:</span>
                  <p className="text-slate-300 font-medium italic text-[11px] leading-relaxed bg-slate-950 p-2 border border-slate-800">
                    &ldquo;{draftPo.notes}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDraftPo(null)}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Discard Draft
                </button>
                <button
                  type="button"
                  id="confirm-ai-po-btn"
                  onClick={handleSaveDraftPo}
                  className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center space-x-1 transition-colors"
                >
                  <FileCheck className="h-3.5 w-3.5" />
                  <span>Verify and Commit Purchase Order</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-slate-200 bg-slate-50/50 rounded-lg p-6 text-center flex flex-col items-center justify-center space-y-2.5 h-[340px] shadow-3xs">
              <div className="p-2.5 bg-white rounded-full border border-slate-200">
                <BadgeInfo className="h-5 w-5 text-slate-400" />
              </div>
              <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">No Proposed Purchase Order Loaded</h4>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed font-semibold">
                Fill the target grower details on the left, then click <strong className="text-blue-600 font-bold">Generate Grower PO</strong> to see the AI agent automatically fill complex HS, packaging, delivery address schedules instantaneously.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Active purchase orders log (Bottom) */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-3 shadow-3xs">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Active Grower Purchasing Contracts ({purchaseOrders.length})</h3>
          <span className="text-[9px] font-mono text-slate-400 font-bold">Petals West Global Procurement Track</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-black tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 border-b border-slate-200">Contract ID</th>
                <th className="px-3 py-2.5 border-b border-slate-200">Grower</th>
                <th className="px-3 py-2.5 border-b border-slate-200">Flower SKU</th>
                <th className="px-3 py-2.5 border-b border-slate-200">Quantity</th>
                <th className="px-3 py-2.5 border-b border-slate-200">Est. Cost</th>
                <th className="px-3 py-2.5 border-b border-slate-200">Shipping Date</th>
                <th className="px-3 py-2.5 border-b border-slate-200">Status Gate</th>
                <th className="px-3 py-2.5 border-b border-slate-200 text-right">Procurement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {purchaseOrders.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 font-mono font-bold text-slate-900">{p.id}</td>
                  <td className="px-3 py-2.5 text-slate-700">{p.growerName}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-500">{p.sku}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-slate-800">{p.quantity} Stems</td>
                  <td className="px-3 py-2.5 font-mono text-blue-700 font-semibold">${p.totalCost.toFixed(2)} CAD</td>
                  <td className="px-3 py-2.5 font-mono text-slate-500">{p.shippingDate}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-1.5 py-0.25 rounded border text-[9px] font-black uppercase tracking-tight ${
                      p.status === "approved"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : p.status === "sent_to_grower"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {p.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {p.status === "draft" && (
                      <button
                        onClick={() => onUpdatePoStatus(p.id, "approved")}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[9px] font-bold transition-colors"
                      >
                        Approve contract
                      </button>
                    )}
                    {p.status === "approved" && (
                      <button
                        onClick={() => onUpdatePoStatus(p.id, "sent_to_grower")}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold transition-colors"
                      >
                        Transmit PO
                      </button>
                    )}
                    {p.status === "sent_to_grower" && (
                      <button
                        onClick={() => onUpdatePoStatus(p.id, "fulfilled")}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[9px] font-bold transition-colors"
                      >
                        Clear delivery
                      </button>
                    )}
                    {p.status === "fulfilled" && (
                      <span className="text-[9px] text-green-700 font-extrabold uppercase tracking-tight">Active Ingress</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
