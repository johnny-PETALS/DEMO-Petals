import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, CornerDownRight, ShieldAlert, Sparkles, Mail, CheckCircle2 } from "lucide-react";

interface StoreBotProps {
  selectedStoreId: string;
  storeName: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

interface EscalationTicket {
  id: string;
  itemText: string;
  urgency: "high" | "normal";
  status: "pending_review" | "notified_rep";
  submittedAt: string;
}

export default function StoreBot({ selectedStoreId, storeName }: StoreBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m0",
      role: "model",
      text: `Hello! I am your Petals West AI Store Agent. I am connected directly to your Scan-Based Trading (SBT) store inventory. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [escalatedTickets, setEscalatedTickets] = useState<EscalationTicket[]>([]);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationDraft, setEscalationDraft] = useState({
    items: "",
    urgency: "high" as "high" | "normal"
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle preset shortcut questions
  const handleShortcut = async (prompt: string) => {
    if (isLoading) return;
    await sendMessageToApi(prompt);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText;
    setInputText("");
    await sendMessageToApi(msg);
  };

  const sendMessageToApi = async (userText: string) => {
    // Add user message to state
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          storeId: selectedStoreId,
          chatHistory: messages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response from store bot");
      }

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: "model",
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages((prev) => [...prev, modelMsg]);

      // Check if they asked to get more product or manual escalation to draft a ticket
      if (userText.toLowerCase().includes("more product") || userText.toLowerCase().includes("get more") || userText.toLowerCase().includes("extra order")) {
        // Pre-fill transition draft
        setEscalationDraft({
          items: "Assorted extra roses & holiday bouquets based on weekend spike forecasts",
          urgency: "high"
        });
        // Spark a small helpful recommendation to escalate
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `system-${Date.now()}`,
              role: "model",
              text: "💡 I have detected that you need more stock. Under standard SBT contracts, extra inventory requires buying office authentication. Would you like to generate a formalized procurement request to Sarah Jenkins (Regional Account Rep)?",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 800);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          text: `⚠️ I encountered an issue contacting the procurement database. Error: ${err.message || "Unknown issue"}. Please verify your network.`,
          timestamp: new Date().toLocaleTimeString([])
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitEscalation = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket: EscalationTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      itemText: escalationDraft.items,
      urgency: escalationDraft.urgency,
      status: "pending_review",
      submittedAt: new Date().toLocaleDateString()
    };
    setEscalatedTickets((prev) => [ticket, ...prev]);
    setShowEscalationModal(false);

    // Append mock ticket confirmation
    setMessages((prev) => [
      ...prev,
      {
        id: `b-escalated-${Date.now()}`,
        role: "model",
        text: `✅ **Support Request Logged:** Ticket **${ticket.id}** has been generated and dispatched to Petals West regional representatives. Sarah Jenkins was sent an auto-summarized digest with your storefront metrics reference! Status: *Pending Buying Office Review*.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col h-[520px]" id="store-ai-agent-container">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center space-x-2.5">
          <div className="p-1 bg-blue-600 rounded text-white flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-tight">Active Store Copilot</h3>
            <p className="text-[10px] text-slate-500 font-semibold">{storeName}</p>
          </div>
        </div>
        <span className="flex items-center space-x-1 text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-150">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-100 animate-pulse"></span>
          <span>SBT CONNECTIVITY</span>
        </span>
      </div>

      {/* Message space */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50/20">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex gap-2 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`p-1.5 h-6.5 w-6.5 rounded flex items-center justify-center flex-shrink-0 text-xs ${
                m.role === "user" ? "bg-slate-900 text-white font-bold" : "bg-blue-50 text-blue-700 border border-blue-100"
              }`}>
                {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>
              <div>
                <div className={`px-3 py-2 rounded-lg text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : m.id.startsWith("system")
                    ? "bg-amber-50 border border-amber-200 text-slate-900"
                    : "bg-white border border-slate-200 text-slate-800 shadow-3xs"
                }`}>
                  {m.text}
                  
                  {/* System extra action block inside bot conversation */}
                  {m.id.startsWith("system") && (
                    <div className="mt-2 pt-2 border-t border-amber-200/60 flex justify-end">
                      <button
                        onClick={() => setShowEscalationModal(true)}
                        className="text-[10px] font-bold px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded flex items-center space-x-1 transition-colors"
                      >
                        <Mail className="h-3 w-3" />
                        <span>Route Ticket to Regional Representative</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-0.5 block px-1 text-right">
                  {m.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[85%]">
              <div className="p-1.5 h-6.5 w-6.5 rounded bg-blue-50 text-blue-750 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-[10px] text-slate-500 font-mono tracking-tight flex items-center space-x-2">
                <div className="flex space-x-1 items-center">
                  <div className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Gemini analyzing SBT trend logs...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested shortcuts */}
      <div className="p-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
        <button
          onClick={() => handleShortcut("When is my next order coming?")}
          className="text-[10px] font-bold px-2.5 py-1 rounded border border-slate-200 hover:border-slate-800 hover:bg-slate-50 transition-all text-slate-700 flex items-center"
        >
          <CornerDownRight className="h-2.5 w-2.5 mr-1 text-slate-400" />
          When is next order?
        </button>
        <button
          onClick={() => handleShortcut("What is my next order?")}
          className="text-[10px] font-bold px-2.5 py-1 rounded border border-slate-200 hover:border-slate-800 hover:bg-slate-50 transition-all text-slate-700 flex items-center"
        >
          <CornerDownRight className="h-2.5 w-2.5 mr-1 text-slate-400" />
          What's on next delivery?
        </button>
        <button
          onClick={() => handleShortcut("What are my current trends?")}
          className="text-[10px] font-bold px-2.5 py-1 rounded border border-slate-200 hover:border-slate-800 hover:bg-slate-50 transition-all text-slate-700 flex items-center"
        >
          <CornerDownRight className="h-2.5 w-2.5 mr-1 text-slate-400" />
          Analyze sales trends
        </button>
        <button
          onClick={() => handleShortcut("Can I get more product? Our weekend floral display is selling out fast.")}
          className="text-[10px] font-bold px-2.5 py-1 rounded border border-blue-200 bg-blue-50/50 text-blue-750 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center"
        >
          <Sparkles className="h-2.5 w-2.5 mr-1 text-blue-600" />
          Request extra product
        </button>
      </div>

      {/* Input zone */}
      <form onSubmit={handleSend} className="p-2 border-t border-slate-200 bg-slate-50/80 flex items-center gap-1.5 rounded-b-xl">
        <input
          id="chat-input-text"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask anything about ${storeName}'s florals...`}
          className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
        <button
          id="chat-submit-btn"
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded disabled:opacity-50 transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* Escalated support tickets sidebar/list */}
      {escalatedTickets.length > 0 && (
        <div className="p-2 border-t border-slate-200 bg-slate-50/80">
          <div className="flex items-center space-x-1 mb-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-blue-600" />
            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Dispatched Recalls / Support Escalations</h4>
          </div>
          <div className="space-y-1 max-h-[100px] overflow-y-auto">
            {escalatedTickets.map((t) => (
              <div key={t.id} className="text-[10px] p-1.5 bg-white border border-slate-200 rounded flex justify-between items-center shadow-3xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-950">{t.id}</span>
                    <span className="px-1 py-0.25 text-[8px] font-bold bg-blue-50 text-blue-700 border border-blue-150 rounded uppercase tracking-tight">
                      {t.urgency} Urgency
                    </span>
                  </div>
                  <p className="text-slate-650 text-[9px] max-w-[280px] truncate">{t.itemText}</p>
                </div>
                <span className="flex items-center text-[8px] text-blue-700 font-extrabold space-x-1 bg-blue-50 border border-blue-200 px-1.5 py-0.25 rounded">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  <span>HQ DISPATCHED</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Escalation Modal */}
      {showEscalationModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-3xs flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-5 max-w-sm w-full shadow-lg">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mb-1.5 uppercase tracking-tight">
              <Mail className="h-4.5 w-4.5 text-blue-600" />
              <span>Route Order Ticket to HQ Buying Office</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              When an SBT store needs immediate non-forecasted floral replenishment, this system routes a live digest with historical store velocities straight to the buyer's farm dispatch queue.
            </p>

            <form onSubmit={submitEscalation} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Requested Items & Estimated Scale
                </label>
                <textarea
                  value={escalationDraft.items}
                  onChange={(e) => setEscalationDraft({ ...escalationDraft, items: e.target.value })}
                  rows={2}
                  className="w-full text-xs p-2 border border-slate-200 rounded focus:ring-1 focus:ring-slate-900 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Severity / Replenishment Urgency</label>
                <select
                  value={escalationDraft.urgency}
                  onChange={(e) => setEscalationDraft({ ...escalationDraft, urgency: e.target.value as "high" | "normal" })}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-slate-900"
                >
                  <option value="high">High Level (Weekend/Holiday Out of Stock Risk)</option>
                  <option value="normal">Standard (Restock request for standard rotation)</option>
                </select>
              </div>

              <div className="flex justify-end gap-1.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => setShowEscalationModal(false)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded flex items-center space-x-1.5"
                >
                  <Send className="h-3 w-3" />
                  <span>Transmit to HQ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
