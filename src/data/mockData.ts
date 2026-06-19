import { Store, Item, SalesRecord, DeliveryOrder, Scorecard, PurchaseOrder, Grower } from "../types";

export const STORES: Store[] = [
  { id: "S01", name: "Shoppers Drug Mart #2201 - Robson St", city: "Vancouver", state: "BC", region: "Western Canada", manager: "Sarah Jenkins" },
  { id: "S02", name: "Shoppers Drug Mart #0834 - Queen St West", city: "Toronto", state: "ON", region: "Eastern Canada", manager: "Markus Vance" },
  { id: "S03", name: "Shoppers Drug Mart #1210 - Sainte-Catherine", city: "Montreal", state: "QC", region: "Eastern Canada", manager: "Elena Rostova" },
  { id: "S04", name: "Shoppers Drug Mart #0305 - Front St", city: "Toronto", state: "ON", region: "Eastern Canada", manager: "David Kim" },
  { id: "S05", name: "Shoppers Drug Mart #1440 - 17th Ave SW", city: "Calgary", state: "AB", region: "Western Canada", manager: "Todd Reynolds" }
];

export const ITEMS: Item[] = [
  { id: "I01", sku: "FL-ROS-RED", name: "Premium Red Roses (Dozen Stems)", category: "Roses", caseQuantity: 10, defaultCost: 15.00 },
  { id: "I02", sku: "FL-LIL-WHT", name: "White Majestic Lilies (10 Pack)", category: "Lilies", caseQuantity: 5, defaultCost: 18.50 },
  { id: "I03", sku: "FL-TUL-MIX", name: "Assorted Garden Tulips (20 Pack)", category: "Tulips", caseQuantity: 8, defaultCost: 12.00 },
  { id: "I04", sku: "FL-ORC-BLU", name: "Exotic Blue Orchid Potted (Medium)", category: "Orchids", caseQuantity: 4, defaultCost: 22.00 },
  { id: "I05", sku: "FL-BOU-MIX", name: "Sunset Harmony Mixed Bouquet", category: "Mixed Bouquets", caseQuantity: 6, defaultCost: 14.50 }
];

export const GROWERS: Grower[] = [
  { id: "G01", name: "Andean Foothills Farms", contact: "Carlos Diaz", location: "Quito, Ecuador", specialtySku: ["FL-ROS-RED"] },
  { id: "G02", name: "Pacific Northwest Valley Lilies", contact: "Martha Stuart", location: "Skagit Valley, WA", specialtySku: ["FL-LIL-WHT", "FL-TUL-MIX"] },
  { id: "G03", name: "Royal Vista Orchids Ltd.", contact: "Kenji Tanaka", location: "Hilo, HI", specialtySku: ["FL-ORC-BLU"] },
  { id: "G04", name: "Soltera Growers Collective", contact: "Sofia Mendez", location: "Ensenada, Mexico", specialtySku: ["FL-BOU-MIX"] }
];

// Generate 30 days of sales records for each Store and Item
// Back-generating from 2026-06-19
export const generateSalesHistory = (): SalesRecord[] => {
  const history: SalesRecord[] = [];
  const baseDate = new Date("2026-06-19");
  
  STORES.forEach((store) => {
    ITEMS.forEach((item) => {
      // Create some variance based on store & item specialty
      const storeFactor = store.id === "S01" ? 1.4 : store.id === "S03" ? 1.2 : 0.8;
      const itemFactor = item.id === "I01" ? 1.3 : item.id === "I03" ? 1.1 : 0.9;
      
      for (let i = 30; i >= 1; i--) {
        const currentDate = new Date(baseDate);
        currentDate.setDate(baseDate.getDate() - i);
        const dateString = currentDate.toISOString().split("T")[0];
        
        // Weekend multiplier
        const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 6 is Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
        const tempMultiplier = isWeekend ? 1.6 : 1.0;
        
        // Random fluctuation
        const randomFluc = 0.8 + Math.random() * 0.4;
        
        // Base quantities per store per item
        const baseQty = 15;
        const quantity = Math.round(baseQty * storeFactor * itemFactor * tempMultiplier * randomFluc);
        
        history.push({
          storeId: store.id,
          sku: item.sku,
          date: dateString,
          quantity
        });
      }
    });
  });
  
  return history;
};

export const SALES_HISTORY = generateSalesHistory();

export const DELIVERY_ORDERS: DeliveryOrder[] = [
  {
    id: "DO-2026-001",
    storeId: "S01",
    deliveryDate: "2026-06-20", // Tomorrow
    status: "dispatched",
    items: [
      { sku: "FL-ROS-RED", name: "Premium Red Roses (Dozen Stems)", quantity: 30 },
      { sku: "FL-LIL-WHT", name: "White Majestic Lilies (10 Pack)", quantity: 15 },
      { sku: "FL-BOU-MIX", name: "Sunset Harmony Mixed Bouquet", quantity: 20 }
    ]
  },
  {
    id: "DO-2026-002",
    storeId: "S02",
    deliveryDate: "2026-06-21",
    status: "pending",
    items: [
      { sku: "FL-TUL-MIX", name: "Assorted Garden Tulips (20 Pack)", quantity: 24 },
      { sku: "FL-ORC-BLU", name: "Exotic Blue Orchid Potted (Medium)", quantity: 12 }
    ]
  },
  {
    id: "DO-2026-003",
    storeId: "S03",
    deliveryDate: "2026-06-18",
    status: "delivered",
    items: [
      { sku: "FL-ROS-RED", name: "Premium Red Roses (Dozen Stems)", quantity: 25 },
      { sku: "FL-BOU-MIX", name: "Sunset Harmony Mixed Bouquet", quantity: 30 }
    ]
  },
  {
    id: "DO-2026-004",
    storeId: "S04",
    deliveryDate: "2026-06-20",
    status: "dispatched",
    items: [
      { sku: "FL-ROS-RED", name: "Premium Red Roses (Dozen Stems)", quantity: 35 },
      { sku: "FL-TUL-MIX", name: "Assorted Garden Tulips (20 Pack)", quantity: 40 }
    ]
  },
  {
    id: "DO-2026-005",
    storeId: "S05",
    deliveryDate: "2026-06-23",
    status: "pending",
    items: [
      { sku: "FL-ROS-RED", name: "Premium Red Roses (Dozen Stems)", quantity: 15 },
      { sku: "FL-ORC-BLU", name: "Exotic Blue Orchid Potted (Medium)", quantity: 8 },
      { sku: "FL-LIL-WHT", name: "White Majestic Lilies (10 Pack)", quantity: 10 }
    ]
  }
];

export const INITIAL_SCORECARDS: Scorecard[] = [
  {
    id: "SC-001",
    storeId: "S01",
    date: "2026-06-15",
    evaluator: "Alex Mercer (SBT Field Auditor)",
    totalScore: 4.2,
    comments: "Display is beautifully organized in the high-traffic entrance lane. Water quality was excellent. Noticed minor petal browning on 2 cases of Mixed Bouquets which was logged and cleared.",
    photos: ["https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=600"],
    metrics: [
      { id: "m1", name: "Display setup and visual arrangement", score: 5, comment: "Brilliant arrangement" },
      { id: "m2", name: "Water freshness and bucket hygiene", score: 4, comment: "Buckets sanitized" },
      { id: "m3", name: "Product freshness and petal quality", score: 3, comment: "Red roses perfect, minor bouquet issues" },
      { id: "m4", name: "Accurate signage and pricing display", score: 5, comment: "SBT pricing stickers are clear" }
    ]
  },
  {
    id: "SC-002",
    storeId: "S02",
    date: "2026-06-10",
    evaluator: "Alex Mercer (SBT Field Auditor)",
    totalScore: 3.8,
    comments: "Moderate execution. Some signage was missing on Orchids forcing customers to ask. Stock levels were healthy but could be rotated better to make room for fresh tulips.",
    photos: ["https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=600"],
    metrics: [
      { id: "m1", name: "Display setup and visual arrangement", score: 4, comment: "Clean structure" },
      { id: "m2", name: "Water freshness and bucket hygiene", score: 4, comment: "Adequate" },
      { id: "m3", name: "Product freshness and petal quality", score: 4, comment: "Very good" },
      { id: "m4", name: "Accurate signage and pricing display", score: 3, comment: "Orchid pricing tags were missing" }
    ]
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "PO-Grower-1001",
    growerName: "Andean Foothills Farms",
    sku: "FL-ROS-RED",
    itemName: "Premium Red Roses (Dozen Stems)",
    quantity: 1200,
    unitCost: 1.25,
    totalCost: 1500.00,
    shippingDate: "2026-07-01",
    status: "approved",
    submittedBy: "johnny@petalswest.com",
    shippingAddress: "Petals West Vancouver Port Cold Storage, Vancouver BC V6B 1A1, Canada",
    paymentTerms: "Net 45 Days",
    customsSku: "HS-0603.11.00",
    packagingSpec: "Stem sleeves, 24 bunches per insulated master grower crate"
  },
  {
    id: "PO-Grower-1002",
    growerName: "Pacific Northwest Valley Lilies",
    sku: "FL-TUL-MIX",
    itemName: "Assorted Garden Tulips (20 Pack)",
    quantity: 950,
    unitCost: 0.85,
    totalCost: 807.50,
    shippingDate: "2026-06-25",
    status: "sent_to_grower",
    submittedBy: "johnny@petalswest.com",
    notes: "Requires thermal protection transit across BC-Alberta-Ontario border corridors",
    shippingAddress: "Petals West Toronto Logistics Hub, Mississauga ON L5T 1B1, Canada",
    paymentTerms: "Net 30 Days",
    customsSku: "Domestic-CAN-PNW",
    packagingSpec: "Paper wrap bouquet bundles in pre-chilled plastic buckets"
  }
];
