export enum ProductCategory {
  Equipos = "equipos",
  Accesorios = "accesorios"
}

export enum PurchaseType {
  Contado = "contado",
  Credito = "credito"
}

export enum PurchaseStatus {
  Pagado = "pagado",
  Pendiente = "pendiente"
}

export enum ExpenseCategory {
  Personal = "personal",
  Servicios = "servicios",
  Alquiler = "alquiler",
  Otros = "otros"
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  costPrice?: number; // Cost price (hidden from public)
  salePrice: number;  // Sale price
  wholesalePrice?: number; // Wholesale price (precio al mayor)
  creditPrice?: number;    // Credit price (precio a crédito)
  referenceProfit?: number; // Fallback profit if no costPrice
  stock: number;
  image?: string; // Base64 or URL
  createdAt: string;
  isBulkUploaded?: boolean;
}

export interface Sale {
  id: string;
  invoiceNumber?: string; // Consecutive invoice number starting at 000001
  controlNumber?: string; // Control number equal to invoiceNumber
  productName: string;
  productId: string;
  category: ProductCategory;
  quantity: number;
  salePrice: number;
  costPrice: number;
  profit: number;
  reference?: number; // Custom profit override (ganancia por la venta)
  customerName: string;
  customerPhone: string;
  customerCedula?: string;    // Client ID/Cédula
  customerAddress?: string;   // Client address
  customerEmail?: string;     // Client email for automatic invoice
  paymentPeriodicity?: string; // "semanal" | "quincenal" | "mensual" | "especifico"
  specificPaymentDate?: string; // YYYY-MM-DD (for "especifico" periodicity)
  installmentsCount?: number;  // Number of installments for credit sales
  initialPaymentAmount?: number; // Initial payment amount (down payment) in USD
  initialPaymentPercentage?: number; // Initial payment amount as percentage of total sale (%)
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  paymentMethod: string;
  createdAt: string;
  paidAmount?: number;
  remainingAmount?: number;
  status?: "pagado" | "pendiente";
  abonos?: {
    date: string;
    amount: number;
    paymentMethod: string;
  }[];
}

export interface PurchaseItem {
  name: string;
  category: ProductCategory;
  costPrice: number;
  quantity: number;
  salePrice: number;
}

export interface Purchase {
  id: string;
  invoiceNumber: string; // Número de factura de compra
  provider: string; // Proveedor
  providerRif?: string; // Cédula o RIF del proveedor
  providerAddress?: string; // Dirección del proveedor
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  items: PurchaseItem[];
  totalAmount: number;
  type: PurchaseType;
  status: PurchaseStatus;
  paymentDate?: string; // YYYY-MM-DD when paid
  createdAt: string;
  invoiceImage?: string; // Base64 of the invoice photo
  currency?: "USD" | "VES"; // Original currency
  bcvRate?: number; // Central Bank of Venezuela rate
  originalAmountVES?: number; // Total in VES if VES
}

export interface Provider {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  rif?: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  category: ExpenseCategory;
  createdAt: string;
}

export interface ReturnItem {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  refundAmount: number;
  discountCostFromProfit: boolean; // whether to discount cost from store profit
  costPrice: number;
  createdAt: string;
}

export interface StoreSettings {
  pin: string;
}
