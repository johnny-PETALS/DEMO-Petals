import React, { useState } from "react";
import { Star, FileText, Camera, UploadCloud, Plus, Calendar, UserCheck, AlertCircle, Sparkles } from "lucide-react";
import { Scorecard, ScorecardMetric } from "../types";

interface ScorecardManagerProps {
  selectedStoreId: string;
  storeName: string;
  scorecards: Scorecard[];
  onAddScorecard: (sc: Scorecard) => void;
}

// Some seed floral display visual options to simulate beautiful photos uploaded by visiting staff
const PHOTO_TEMPLATE_OPTIONS = [
  { url: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=600", label: "Entrance Bouquet Display" },
  { url: "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=600", label: "SBT Chilled Crate Setup" },
  { url: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&q=80&w=600", label: "Multi-tiered Floral Shelf" },
  { url: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=600", label: "Bloom Freshness Check" }
];

export default function ScorecardManager({ selectedStoreId, storeName, scorecards, onAddScorecard }: ScorecardManagerProps) {
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [evaluator, setEvaluator] = useState("Johnny West (SBT Regional Lead)");
  const [comments, setComments] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(PHOTO_TEMPLATE_OPTIONS[0].url);
  const [metrics, setMetrics] = useState<Omit<ScorecardMetric, "id">[]>([
    { name: "Display setup and visual arrangement", score: 4, comment: "" },
    { name: "Water freshness and bucket hygiene", score: 4, comment: "" },
    { name: "Product freshness and petal quality", score: 4, comment: "" },
    { name: "Accurate signage and pricing display", score: 4, comment: "" }
  ]);
  const [toastMsg, setToastMsg] = useState("");

  const filteredScorecards = scorecards.filter((sc) => sc.storeId === selectedStoreId);

  const handleScoreChange = (index: number, score: number) => {
    const updated = [...metrics];
    updated[index].score = score;
    setMetrics(updated);
  };

  const handleMetricCommentChange = (index: number, val: string) => {
    const updated = [...metrics];
    updated[index].comment = val;
    setMetrics(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluator.trim()) return;

    // Calculate overall average score
    const totalScore = parseFloat((metrics.reduce((acc, curr) => acc + curr.score, 0) / metrics.length).toFixed(1));

    const newScorecard: Scorecard = {
      id: `SC-${Math.floor(1000 + Math.random() * 9000)}`,
      storeId: selectedStoreId,
      date: new Date().toISOString().split("T")[0],
      evaluator,
      totalScore,
      comments,
      photos: [selectedPhoto],
      metrics: metrics.map((m, idx) => ({ ...m, id: `m-${idx}` }))
    };

    try {
      const response = await fetch("/api/scorecards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newScorecard)
      });

      if (response.ok) {
        onAddScorecard(newScorecard);
        setToastMsg("Scorecard logged successfully!");
        setComments("");
        setShowAuditForm(false);
        setTimeout(() => setToastMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4" id="scorecard-manager-section">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-3xs">
        <div>
          <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center space-x-1.5">
            <FileText className="h-4.5 w-4.5 text-blue-600" />
            <span>Store Merchandising Scorecards</span>
          </h2>
          <p className="text-[11px] text-slate-550 text-slate-500 font-medium mt-0.5">
            Monitor freshness, labeling tags, bucket water status, and visual setups in real time.
          </p>
        </div>
        
        <button
          id="perform-audit-btn"
          onClick={() => setShowAuditForm(!showAuditForm)}
          className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded flex items-center space-x-1 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{showAuditForm ? "Hide Form" : "Perform Store Visit Audit"}</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] rounded flex items-center space-x-2 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping"></span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Perform Store Audit Form */}
      {showAuditForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50/60 border border-slate-200 p-4 rounded-lg space-y-4" id="audit-entry-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Auditor / Staff Name
              </label>
              <input
                type="text"
                value={evaluator}
                onChange={(e) => setEvaluator(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-250 rounded text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Store Target
              </label>
              <input
                type="text"
                value={storeName}
                disabled
                className="w-full text-xs p-2 bg-slate-100 border border-slate-200 rounded text-slate-500 font-bold"
              />
            </div>
          </div>

          {/* Metric Ratings */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
              Quality Ratings (1 = Poor, 5 = Premium)
            </h3>
            
            <div className="grid grid-cols-1 gap-2">
              {metrics.map((m, idx) => (
                <div key={idx} className="bg-white p-3 border border-slate-200 rounded shadow-3xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-1 w-full">
                    <p className="text-xs font-bold text-slate-800">{m.name}</p>
                    <input
                      type="text"
                      placeholder="Add observation note (optional)..."
                      value={m.comment}
                      onChange={(e) => handleMetricCommentChange(idx, e.target.value)}
                      className="mt-1 w-full text-xs p-1.5 border border-slate-200 rounded bg-slate-50/50 text-slate-700 focus:bg-white"
                    />
                  </div>
                  
                  {/* Stars rating selection */}
                  <div className="flex items-center space-x-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => handleScoreChange(idx, star)}
                        className="p-0.5 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-4.5 w-4.5 ${
                            star <= m.score ? "fill-amber-400 text-amber-400" : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Picture Upload Simulation Section */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200">
            <div className="flex items-center space-x-1.5">
              <Camera className="h-4 w-4 text-slate-600" />
              <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                Storefront Visual Audit Photo
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Upload photos of floral displays and buckets so farm buying managers can audit petal sizes, vase water levels, and branding shelf space instantly.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PHOTO_TEMPLATE_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.url}
                  onClick={() => setSelectedPhoto(opt.url)}
                  className={`relative aspect-video rounded overflow-hidden border-2 transition-all ${
                    selectedPhoto === opt.url
                      ? "border-blue-600 scale-[1.02] ring-1 ring-blue-200 shadow-xs animate-subtle"
                      : "border-transparent hover:border-slate-300 opacity-80"
                  }`}
                >
                  <img src={opt.url} alt={opt.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-slate-950/75 text-[9px] text-white py-0.5 px-1.5 truncate text-left">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="border border-dashed border-slate-300 rounded p-4 text-center bg-white flex flex-col items-center justify-center space-y-1">
              <UploadCloud className="h-4.5 w-4.5 text-slate-400" />
              <p className="text-[10px] font-bold text-slate-700">Drag or click to choose smartphone camera upload</p>
              <p className="text-[9px] text-slate-400">Accepted formats: JPG, PNG, HEIC. Max width 2400px.</p>
            </div>
          </div>

          {/* Comments and submit */}
          <div className="space-y-1.5 pt-3 border-t border-slate-200">
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Overall Field Observation Comments</label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide a final summary of store staff engagement, bucket water freshness adjustments made, and floral case rotations..."
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAuditForm(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded flex items-center space-x-1.5 transition-colors"
            >
              <UserCheck className="h-4 w-4" />
              <span>Submit Secure Scorecard Audit</span>
            </button>
          </div>
        </form>
      )}

      {/* Historical Scorecards Feed */}
      <div className="space-y-2.5">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>Previous Compliance Scorecards for Store</span>
          <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.25 rounded border border-slate-200 text-[8px] font-bold">
            {filteredScorecards.length}
          </span>
        </h3>

        {filteredScorecards.length === 0 ? (
          <div className="text-center p-6 border border-slate-250 rounded-lg bg-slate-50/50 space-y-1.5">
            <AlertCircle className="h-5 w-5 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">No scorecards found for this store yet.</p>
            <p className="text-[10px] text-slate-400">Click &quot;Perform Store Visit Audit&quot; above to log the very first SBT scorecard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScorecards.map((sc) => (
              <div key={sc.id} className="bg-white border border-slate-205 rounded-lg overflow-hidden shadow-3xs flex flex-col">
                {/* Scorecard Photos View */}
                {sc.photos && sc.photos.length > 0 && (
                  <div className="relative h-32 bg-slate-100 overflow-hidden">
                    <img
                      src={sc.photos[0]}
                      alt="Store visual audit capture"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-slate-950/75 text-[9px] font-mono font-bold text-white px-1.5 py-0.5 rounded flex items-center space-x-1">
                      <Camera className="h-2.5 w-2.5" />
                      <span>Display Audit Asset</span>
                    </div>
                    <div className="absolute top-2 right-2 bg-blue-600 font-mono font-bold text-white text-[10px] px-2 py-0.5 rounded shadow-xs flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-current text-white" />
                      <span>{sc.totalScore} / 5.0</span>
                    </div>
                  </div>
                )}

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 font-bold">
                        <Calendar className="h-2.5 w-2.5 text-slate-400" />
                        {sc.date}
                      </span>
                      <span className="bg-slate-100 px-1 py-0.25 rounded border border-slate-200">ID: {sc.id}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-800 italic leading-normal bg-slate-50 p-2 border border-slate-150 rounded">
                      &ldquo;{sc.comments}&rdquo;
                    </p>

                    {/* Breakdown grids */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-tight block">Metric Ratings:</span>
                      <div className="grid grid-cols-1 gap-1 text-[10px] font-semibold">
                        {sc.metrics.map((m) => (
                          <div key={m.id} className="p-1 px-1.5 bg-slate-50 border border-slate-100 rounded flex justify-between items-center">
                            <span className="text-slate-650 truncate max-w-[150px]">{m.name}</span>
                            <span className="flex items-center space-x-0.5 font-mono font-bold text-slate-900">
                              <span>{m.score}</span>
                              <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500 inline" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-450 font-medium">
                    <span className="font-mono text-[9px] text-slate-500 font-semibold">Auditor: {sc.evaluator}</span>
                    <span className="px-1.5 py-0.25 bg-blue-50 text-blue-750 rounded font-black border border-blue-150 uppercase tracking-wider text-[8px]">
                      Compliant
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
