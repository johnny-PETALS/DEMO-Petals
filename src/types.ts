export interface Store {
  id: string;
  name: string;
  city: string;
  state: string;
  region: string;
  manager: string;
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  category: "Roses" | "Lilies" | "Tulips" | "Orchids" | "Mixed Bouquets";
  caseQuantity: number;
  defaultCost: number;
}

export interface SalesRecord {
  storeId: string;
  sku: string;
  date: string; // YYYY-MM-DD
  quantity: number;
}

export interface DeliveryOrder {
  id: string;
  storeId: string;
  deliveryDate: string; // YYYY-MM-DD
  status: "pending" | "dispatched" | "delivered";
  items: {
    sku: string;
    name: string;
    quantity: number;
  }[];
}

export interface ScorecardMetric {
  id: string;
  name: string;
  score: number; // 1 to 5
  comment: string;
}

export interface Scorecard {
  id: string;
  storeId: string;
  date: string;
  evaluator: string;
  totalScore: number; // calculated field
  comments: string;
  photos: string[]; // base64 strings or placeholders
  metrics: ScorecardMetric[];
}

export interface PurchaseOrder {
  id: string;
  growerName: string;
  sku: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  shippingDate: string;
  status: "draft" | "approved" | "sent_to_grower" | "fulfilled";
  submittedBy: string;
  notes?: string;
  // system fields that can be auto-filled by AI
  shippingAddress: string;
  paymentTerms: string;
  customsSku?: string;
  packagingSpec?: string;
}

export interface Grower {
  id: string;
  name: string;
  contact: string;
  location: string;
  specialtySku: string[];
}
