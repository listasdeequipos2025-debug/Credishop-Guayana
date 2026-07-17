import React, { useState, useEffect } from "react";
import {
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, getDoc
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";
import {
  Product, Sale, Purchase, Expense, ReturnItem, StoreSettings,
  ProductCategory, PurchaseStatus, PurchaseType, Provider
} from "./types";

// Import modular components
import Navbar from "./components/Navbar";
import AdminLogin from "./components/AdminLogin";
import Catalog from "./components/Catalog";
import Dashboard from "./components/Dashboard";
import InventoryManager from "./components/InventoryManager";
import SalesManager from "./components/SalesManager";
import PurchasesManager from "./components/PurchasesManager";
import ExpensesManager from "./components/ExpensesManager";
import ReturnsManager from "./components/ReturnsManager";
import SettingsManager from "./components/SettingsManager";
import ClientesManager from "./components/ClientesManager";

// Helper function to remove undefined values from Firestore payloads
function cleanUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined) as unknown as T;
  }
  if (typeof obj === "object") {
    const clean: any = {};
    for (const key of Object.keys(obj)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        clean[key] = cleanUndefined(val);
      }
    }
    return clean as T;
  }
  return obj;
}

function normalizeString(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export default function App() {
  // Navigation & Authentication states
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("catalogo");
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Firestore Real-time Collections States
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [pin, setPin] = useState("1234"); // Defaults to 1234
  const [whatsapp, setWhatsapp] = useState("584120000000"); // Default WhatsApp
  const [providers, setProviders] = useState<Provider[]>([]);

  // Real-time synchronization listeners
  useEffect(() => {
    // 1. Listen to settings / PIN and WhatsApp
    const pinDocRef = doc(db, "settings", "admin");
    const unsubscribePin = onSnapshot(pinDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPin(data.pin || "1234");
        setWhatsapp(data.whatsapp || "584120000000");
      } else {
        // Create initial settings document if missing
        setDoc(pinDocRef, { pin: "1234", whatsapp: "584120000000" }).catch((error) => {
          handleFirestoreError(error, OperationType.WRITE, "settings/admin");
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "settings/admin");
    });

    // 2. Listen to Inventory (Products)
    const unsubscribeProducts = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || "",
          category: data.category || ProductCategory.Equipos,
          costPrice: data.costPrice,
          salePrice: data.salePrice || 0,
          wholesalePrice: data.wholesalePrice,
          creditPrice: data.creditPrice,
          referenceProfit: data.referenceProfit,
          stock: data.stock !== undefined ? data.stock : 0,
          image: data.image || "",
          createdAt: data.createdAt || ""
        });
      });
      // Sort by creation date or name
      setProducts(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "inventory");
    });

    // 3. Listen to Sales
    const unsubscribeSales = onSnapshot(collection(db, "sales"), (snapshot) => {
      const items: Sale[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const totalAmount = (data.salePrice || 0) * (data.quantity || 1);
        items.push({
          id: docSnap.id,
          invoiceNumber: data.invoiceNumber || "",
          controlNumber: data.controlNumber || "",
          productName: data.productName || "",
          productId: data.productId || "",
          category: data.category || ProductCategory.Equipos,
          quantity: data.quantity || 1,
          salePrice: data.salePrice || 0,
          costPrice: data.costPrice || 0,
          profit: data.profit || 0,
          reference: data.reference,
          customerName: data.customerName || "Cliente General",
          customerPhone: data.customerPhone || "N/A",
          customerCedula: data.customerCedula || "",
          customerAddress: data.customerAddress || "",
          customerEmail: data.customerEmail || "",
          date: data.date || "",
          month: data.month || "",
          paymentMethod: data.paymentMethod || "Efectivo",
          createdAt: data.createdAt || "",
          paidAmount: data.paidAmount !== undefined ? data.paidAmount : totalAmount,
          remainingAmount: data.remainingAmount !== undefined ? data.remainingAmount : 0,
          status: data.status || "pagado",
          installmentsCount: data.installmentsCount !== undefined ? data.installmentsCount : undefined,
          paymentPeriodicity: data.paymentPeriodicity || undefined,
          specificPaymentDate: data.specificPaymentDate || undefined,
          initialPaymentAmount: data.initialPaymentAmount !== undefined ? data.initialPaymentAmount : undefined,
          initialPaymentPercentage: data.initialPaymentPercentage !== undefined ? data.initialPaymentPercentage : undefined,
          abonos: data.abonos || []
        });
      });
      setSales(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "sales");
    });

    // 4. Listen to Purchases
    const unsubscribePurchases = onSnapshot(collection(db, "purchases"), (snapshot) => {
      const items: Purchase[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          invoiceNumber: data.invoiceNumber || "",
          provider: data.provider || "",
          date: data.date || "",
          month: data.month || "",
          items: data.items || [],
          totalAmount: data.totalAmount || 0,
          type: data.type || PurchaseType.Contado,
          status: data.status || PurchaseStatus.Pagado,
          paymentDate: data.paymentDate || "",
          createdAt: data.createdAt || "",
          invoiceImage: data.invoiceImage || undefined,
          currency: data.currency || undefined,
          bcvRate: data.bcvRate || undefined,
          originalAmountVES: data.originalAmountVES || undefined
        });
      });
      setPurchases(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "purchases");
    });

    // 5. Listen to Expenses
    const unsubscribeExpenses = onSnapshot(collection(db, "expenses"), (snapshot) => {
      const items: Expense[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          description: data.description || "",
          amount: data.amount || 0,
          date: data.date || "",
          month: data.month || "",
          category: data.category || "",
          createdAt: data.createdAt || ""
        });
      });
      setExpenses(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "expenses");
    });

    // 6. Listen to Returns
    const unsubscribeReturns = onSnapshot(collection(db, "returns"), (snapshot) => {
      const items: ReturnItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          productId: data.productId || "",
          productName: data.productName || "",
          category: data.category || ProductCategory.Equipos,
          quantity: data.quantity || 1,
          date: data.date || "",
          month: data.month || "",
          refundAmount: data.refundAmount || 0,
          discountCostFromProfit: data.discountCostFromProfit || false,
          costPrice: data.costPrice || 0,
          createdAt: data.createdAt || ""
        });
      });
      setReturns(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "returns");
    });

    // 7. Listen to Providers
    const unsubscribeProviders = onSnapshot(collection(db, "providers"), (snapshot) => {
      const items: Provider[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          rif: data.rif || "",
          notes: data.notes || "",
          createdAt: data.createdAt || ""
        });
      });
      setProviders(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "providers");
    });

    // Clean up real-time listeners on unmount
    return () => {
      unsubscribePin();
      unsubscribeProducts();
      unsubscribeSales();
      unsubscribePurchases();
      unsubscribeExpenses();
      unsubscribeReturns();
      unsubscribeProviders();
    };
  }, []);

  // ----------------------------------------------------
  // INVENTORY OPERATIONS
  // ----------------------------------------------------
  const handleAddProduct = async (prodData: Omit<Product, "id" | "createdAt">) => {
    try {
      const normalizedNewName = normalizeString(prodData.name);
      const existing = products.find((p) => normalizeString(p.name) === normalizedNewName);

      if (existing) {
        // Update existing instead of creating a duplicate
        // Only update other fields (category, prices, reference, image) and keep existing stock untouched
        const docRef = doc(db, "inventory", existing.id);
        const updates: Partial<Product> = {
          category: prodData.category,
          salePrice: prodData.salePrice,
        };
        if (prodData.costPrice !== undefined) updates.costPrice = prodData.costPrice;
        if (prodData.wholesalePrice !== undefined) updates.wholesalePrice = prodData.wholesalePrice;
        if (prodData.creditPrice !== undefined) updates.creditPrice = prodData.creditPrice;
        if (prodData.referenceProfit !== undefined) updates.referenceProfit = prodData.referenceProfit;
        if (prodData.image !== undefined) updates.image = prodData.image;

        await updateDoc(docRef, cleanUndefined(updates));
      } else {
        const docRef = collection(db, "inventory");
        await addDoc(docRef, cleanUndefined({
          ...prodData,
          createdAt: new Date().toISOString()
        }));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "inventory");
    }
  };

  const handleAddProductsBulk = async (prodList: Omit<Product, "id" | "createdAt">[], shouldModifyStock?: boolean) => {
    try {
      for (const item of prodList) {
        const normalizedNewName = normalizeString(item.name);
        const existing = products.find((p) => normalizeString(p.name) === normalizedNewName);

        if (existing) {
          // Detect changes and update the existing product
          const docRef = doc(db, "inventory", existing.id);
          const updates: Partial<Product> = {
            category: item.category,
            salePrice: item.salePrice,
            isBulkUploaded: true // Mark so that bulk uploaded products can be deleted together
          };
          if (item.costPrice !== undefined) updates.costPrice = item.costPrice;
          if (item.wholesalePrice !== undefined) updates.wholesalePrice = item.wholesalePrice;
          if (item.creditPrice !== undefined) updates.creditPrice = item.creditPrice;
          if (item.referenceProfit !== undefined) updates.referenceProfit = item.referenceProfit;
          if (item.image !== undefined) updates.image = item.image;

          // If shouldModifyStock is true and new stock is valid (> 0), sum it to the old stock
          if (shouldModifyStock && item.stock !== undefined && item.stock > 0) {
            updates.stock = existing.stock + item.stock;
          }

          await updateDoc(docRef, cleanUndefined(updates));
        } else {
          // If no match, add as a new product
          const docRef = collection(db, "inventory");
          await addDoc(docRef, cleanUndefined({
            ...item,
            isBulkUploaded: true,
            createdAt: new Date().toISOString()
          }));
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "inventory");
    }
  };

  const handleEditProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const docRef = doc(db, "inventory", id);
      await updateDoc(docRef, cleanUndefined(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `inventory/${id}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const docRef = doc(db, "inventory", id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `inventory/${id}`);
    }
  };

  const handleDeleteProductsBulk = async (ids: string[]) => {
    try {
      for (const id of ids) {
        const docRef = doc(db, "inventory", id);
        await deleteDoc(docRef);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "inventory");
    }
  };

  // ----------------------------------------------------
  // SALES OPERATIONS
  // ----------------------------------------------------
  const handleRegisterSale = async (saleData: Omit<Sale, "id" | "createdAt">): Promise<string> => {
    try {
      // Calculate next consecutive invoice number
      let nextNumber = 1;
      if (sales && sales.length > 0) {
        const numbers = sales
          .map(s => s.invoiceNumber ? parseInt(s.invoiceNumber, 10) : 0)
          .filter(n => !isNaN(n));
        const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
        if (maxNum > 0) {
          nextNumber = maxNum + 1;
        } else {
          // If none have invoiceNumbers, fallback to length + 1
          nextNumber = sales.length + 1;
        }
      }
      const formattedInvoiceNumber = String(nextNumber).padStart(6, "0");

      // 1. Record the sale
      const docRef = collection(db, "sales");
      const addedDoc = await addDoc(docRef, cleanUndefined({
        ...saleData,
        invoiceNumber: formattedInvoiceNumber,
        controlNumber: formattedInvoiceNumber,
        createdAt: new Date().toISOString()
      }));

      // 2. Decrement product stock in inventory
      const productRef = doc(db, "inventory", saleData.productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const currentStock = productSnap.data().stock || 0;
        await updateDoc(productRef, {
          stock: currentStock - saleData.quantity
        });
      }

      // 3. Automatically send invoice email if customerEmail is provided
      if (saleData.customerEmail) {
        try {
          const response = await fetch("/api/send-invoice-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerEmail: saleData.customerEmail,
              customerName: saleData.customerName,
              customerPhone: saleData.customerPhone,
              customerCedula: saleData.customerCedula,
              customerAddress: saleData.customerAddress,
              invoiceId: addedDoc.id,
              productName: saleData.productName,
              quantity: saleData.quantity,
              salePrice: saleData.salePrice,
              paymentMethod: saleData.paymentMethod,
              totalAmount: saleData.salePrice * saleData.quantity,
              paidAmount: saleData.paidAmount,
              remainingAmount: saleData.remainingAmount,
              paymentPeriodicity: saleData.paymentPeriodicity,
              status: saleData.status,
              date: saleData.date,
              abonos: []
            })
          });
          const result = await response.json();
          if (result.success && result.isEthereal && result.etherealUrl) {
            alert(`[Simulación Factura] Correo enviado. Puedes ver el diseño real de la factura aquí:\n${result.etherealUrl}`);
          }
        } catch (emailErr) {
          console.error("Network error sending email:", emailErr);
        }
      }

      return addedDoc.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "sales");
      throw error;
    }
  };

  const handleUpdateSaleDebt = async (saleId: string, paidIncrement: number, paymentMethod: string = "Efectivo", paymentDate?: string) => {
    try {
      const docRef = doc(db, "sales", saleId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const totalAmount = (data.salePrice || 0) * (data.quantity || 1);
        const currentPaid = data.paidAmount !== undefined ? data.paidAmount : totalAmount;
        const newPaid = Math.min(totalAmount, currentPaid + paidIncrement);
        const newRemaining = Math.max(0, totalAmount - newPaid);
        const newStatus = newRemaining === 0 ? "pagado" : "pendiente";

        const currentAbonos = data.abonos || [];
        const abonoDate = paymentDate || new Date().toISOString().split("T")[0];
        const updatedAbonos = [
          ...currentAbonos,
          {
            date: abonoDate,
            amount: paidIncrement,
            paymentMethod: paymentMethod
          }
        ];

        await updateDoc(docRef, {
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newStatus,
          abonos: updatedAbonos
        });

        // Automatically send updated invoice / statement email if customerEmail is provided
        if (data.customerEmail) {
          try {
            const response = await fetch("/api/send-invoice-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                customerEmail: data.customerEmail,
                customerName: data.customerName || "Cliente General",
                customerPhone: data.customerPhone || "N/A",
                customerCedula: data.customerCedula || "N/A",
                customerAddress: data.customerAddress || "N/A",
                invoiceId: saleId,
                productName: data.productName || "",
                quantity: data.quantity || 1,
                salePrice: data.salePrice || 0,
                paymentMethod: paymentMethod,
                totalAmount: totalAmount,
                paidAmount: newPaid,
                remainingAmount: newRemaining,
                paymentPeriodicity: data.paymentPeriodicity || "semanal",
                status: newStatus,
                date: data.date || abonoDate,
                abonos: updatedAbonos
              })
            });
            const result = await response.json();
            if (result.success && result.isEthereal && result.etherealUrl) {
              alert(`[Plan de Pagos / Abono] Estado de cuenta actualizado y enviado al cliente. Puedes verlo aquí:\n${result.etherealUrl}`);
            }
          } catch (emailErr) {
            console.error("Failed to send updated invoice email:", emailErr);
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `sales/${saleId}`);
    }
  };

  const handleDeleteSale = async (id: string) => {
    try {
      const docRef = doc(db, "sales", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const saleData = docSnap.data();
        const productId = saleData.productId;
        const quantity = saleData.quantity || 1;
        
        if (productId) {
          const productRef = doc(db, "inventory", productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const currentStock = productSnap.data().stock || 0;
            await updateDoc(productRef, {
              stock: currentStock + quantity
            });
          }
        }
      }
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `sales/${id}`);
    }
  };

  const handleEditSale = async (id: string, updates: Partial<Sale>) => {
    try {
      const docRef = doc(db, "sales", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;
      const oldSale = docSnap.data() as Sale;

      const prodIdChanged = updates.productId && updates.productId !== oldSale.productId;
      const qtyChanged = updates.quantity !== undefined && updates.quantity !== oldSale.quantity;

      if (prodIdChanged || qtyChanged) {
        // Return old stock
        if (oldSale.productId) {
          const oldProductRef = doc(db, "inventory", oldSale.productId);
          const oldProductSnap = await getDoc(oldProductRef);
          if (oldProductSnap.exists()) {
            const oldStock = oldProductSnap.data().stock || 0;
            await updateDoc(oldProductRef, {
              stock: oldStock + (oldSale.quantity || 1)
            });
          }
        }

        // Deduct new stock
        const targetProdId = updates.productId || oldSale.productId;
        const targetQty = updates.quantity !== undefined ? updates.quantity : (oldSale.quantity || 1);
        if (targetProdId) {
          const newProductRef = doc(db, "inventory", targetProdId);
          const newProductSnap = await getDoc(newProductRef);
          if (newProductSnap.exists()) {
            const newStock = newProductSnap.data().stock || 0;
            await updateDoc(newProductRef, {
              stock: newStock - targetQty
            });
          }
        }
      }

      await updateDoc(docRef, cleanUndefined(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `sales/${id}`);
    }
  };

  const handleUpdateClient = async (
    oldCedula: string,
    oldName: string,
    newDetails: { name: string; phone: string; cedula: string; address: string; email: string }
  ) => {
    try {
      const salesToUpdate = sales.filter((sale) => {
        const saleCedula = sale.customerCedula || "N/A";
        const saleName = sale.customerName || "Cliente General";
        if (oldCedula !== "N/A" && sale.customerCedula && sale.customerCedula !== "N/A") {
          return saleCedula.toLowerCase() === oldCedula.toLowerCase();
        }
        return saleName.toLowerCase() === oldName.toLowerCase();
      });

      for (const sale of salesToUpdate) {
        const docRef = doc(db, "sales", sale.id);
        await updateDoc(docRef, {
          customerName: newDetails.name,
          customerPhone: newDetails.phone,
          customerCedula: newDetails.cedula,
          customerAddress: newDetails.address,
          customerEmail: newDetails.email
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "sales");
    }
  };

  const handleDeleteClient = async (oldCedula: string, oldName: string) => {
    try {
      const salesToAnonymize = sales.filter((sale) => {
        const saleCedula = sale.customerCedula || "N/A";
        const saleName = sale.customerName || "Cliente General";
        if (oldCedula !== "N/A" && sale.customerCedula && sale.customerCedula !== "N/A") {
          return saleCedula.toLowerCase() === oldCedula.toLowerCase();
        }
        return saleName.toLowerCase() === oldName.toLowerCase();
      });

      for (const sale of salesToAnonymize) {
        const docRef = doc(db, "sales", sale.id);
        await updateDoc(docRef, {
          customerName: "Cliente General",
          customerCedula: "N/A",
          customerPhone: "N/A",
          customerAddress: "N/A",
          customerEmail: ""
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "sales");
    }
  };

  // ----------------------------------------------------
  // PROVIDER OPERATIONS
  // ----------------------------------------------------
  const handleAddProvider = async (pData: Omit<Provider, "id" | "createdAt">) => {
    try {
      const docRef = collection(db, "providers");
      const todayStr = new Date().toISOString();
      await addDoc(docRef, cleanUndefined({
        ...pData,
        createdAt: todayStr
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "providers");
    }
  };

  const handleEditProvider = async (id: string, updates: Partial<Provider>) => {
    try {
      const docRef = doc(db, "providers", id);
      await updateDoc(docRef, cleanUndefined(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `providers/${id}`);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    try {
      const docRef = doc(db, "providers", id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `providers/${id}`);
    }
  };

  // ----------------------------------------------------
  // PURCHASES OPERATIONS
  // ----------------------------------------------------
  const handleAddPurchase = async (pData: Omit<Purchase, "id" | "createdAt">) => {
    try {
      const docRef = collection(db, "purchases");
      await addDoc(docRef, cleanUndefined({
        ...pData,
        createdAt: new Date().toISOString()
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "purchases");
    }
  };

  const handleAddPurchasesBulk = async (pList: Omit<Purchase, "id" | "createdAt">[]) => {
    try {
      const docRef = collection(db, "purchases");
      for (const item of pList) {
        await addDoc(docRef, cleanUndefined({
          ...item,
          createdAt: new Date().toISOString()
        }));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "purchases");
    }
  };

  const handlePayPurchase = async (id: string) => {
    try {
      const docRef = doc(db, "purchases", id);
      const todayStr = new Date().toISOString().split("T")[0];
      await updateDoc(docRef, {
        status: PurchaseStatus.Pagado,
        paymentDate: todayStr
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `purchases/${id}`);
    }
  };

  const handleDeletePurchase = async (id: string) => {
    try {
      const docRef = doc(db, "purchases", id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `purchases/${id}`);
    }
  };

  const handleEditPurchase = async (id: string, updates: Partial<Purchase>) => {
    try {
      const docRef = doc(db, "purchases", id);
      await updateDoc(docRef, cleanUndefined(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `purchases/${id}`);
    }
  };

  // ----------------------------------------------------
  // EXPENSES OPERATIONS
  // ----------------------------------------------------
  const handleAddExpense = async (eData: Omit<Expense, "id" | "createdAt">) => {
    try {
      const docRef = collection(db, "expenses");
      await addDoc(docRef, cleanUndefined({
        ...eData,
        createdAt: new Date().toISOString()
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "expenses");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const docRef = doc(db, "expenses", id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `expenses/${id}`);
    }
  };

  // ----------------------------------------------------
  // RETURNS OPERATIONS
  // ----------------------------------------------------
  const handleAddReturn = async (rData: Omit<ReturnItem, "id" | "createdAt">) => {
    try {
      // 1. Record return document
      const docRef = collection(db, "returns");
      await addDoc(docRef, cleanUndefined({
        ...rData,
        createdAt: new Date().toISOString()
      }));

      // 2. Return product back to stock in inventory
      const productRef = doc(db, "inventory", rData.productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const currentStock = productSnap.data().stock || 0;
        await updateDoc(productRef, {
          stock: currentStock + rData.quantity
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "returns");
    }
  };

  const handleDeleteReturn = async (id: string) => {
    try {
      const docRef = doc(db, "returns", id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `returns/${id}`);
    }
  };

  // ----------------------------------------------------
  // SETTINGS & PIN MANAGEMENT
  // ----------------------------------------------------
  const handleUpdatePin = async (newPin: string) => {
    try {
      const docRef = doc(db, "settings", "admin");
      await updateDoc(docRef, { pin: newPin });
      setPin(newPin);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "settings/admin");
    }
  };

  const handleUpdateWhatsappNumber = async (newWhatsapp: string) => {
    try {
      const docRef = doc(db, "settings", "admin");
      await updateDoc(docRef, { whatsapp: newWhatsapp });
      setWhatsapp(newWhatsapp);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "settings/admin");
    }
  };

  // Handle successful Admin Login
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setActiveTab("dashboard");
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setActiveTab("catalogo");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Navigation Header */}
      <Navbar
        isAdmin={isAdmin}
        onAdminClick={() => setIsLoginOpen(true)}
        onLogout={handleAdminLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Admin Verification Modal overlay */}
      <AdminLogin
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
        savedPin={pin}
      />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Render pages depending on current selection and role */}
        {!isAdmin || activeTab === "catalogo" ? (
          <Catalog products={products} whatsappNumber={whatsapp} />
        ) : (
          <div className="space-y-6">
            {activeTab === "dashboard" && (
              <Dashboard
                products={products}
                sales={sales}
                purchases={purchases}
                expenses={expenses}
                returns={returns}
              />
            )}
            {activeTab === "inventario" && (
              <InventoryManager
                products={products}
                onAddProduct={handleAddProduct}
                onAddProductsBulk={handleAddProductsBulk}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onDeleteProductsBulk={handleDeleteProductsBulk}
              />
            )}
            {activeTab === "ventas" && (
              <SalesManager
                products={products}
                sales={sales}
                onRegisterSale={handleRegisterSale}
                onUpdateSaleDebt={handleUpdateSaleDebt}
                onDeleteSale={handleDeleteSale}
                onEditSale={handleEditSale}
              />
            )}
            {activeTab === "compras" && (
              <PurchasesManager
                purchases={purchases}
                onAddPurchase={handleAddPurchase}
                onAddPurchasesBulk={handleAddPurchasesBulk}
                onPayPurchase={handlePayPurchase}
                onDeletePurchase={handleDeletePurchase}
                onEditPurchase={handleEditPurchase}
                providers={providers}
                onAddProvider={handleAddProvider}
                onEditProvider={handleEditProvider}
                onDeleteProvider={handleDeleteProvider}
              />
            )}
            {activeTab === "gastos" && (
              <ExpensesManager
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            )}
            {activeTab === "devoluciones" && (
              <ReturnsManager
                products={products}
                returns={returns}
                onAddReturn={handleAddReturn}
                onDeleteReturn={handleDeleteReturn}
              />
            )}
            {activeTab === "clientes" && (
              <ClientesManager
                sales={sales}
                onUpdateSaleDebt={handleUpdateSaleDebt}
                onUpdateClient={handleUpdateClient}
                onDeleteClient={handleDeleteClient}
                onRegisterSale={handleRegisterSale}
              />
            )}
            {activeTab === "ajustes" && (
              <SettingsManager
                currentPin={pin}
                onUpdatePin={handleUpdatePin}
                currentWhatsapp={whatsapp}
                onUpdateWhatsapp={handleUpdateWhatsappNumber}
              />
            )}
          </div>
        )}
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest space-y-2">
          <p>© 2026 CREDISHOP GUAYANA - Celulares y Accesorios. Todos los derechos reservados.</p>
          <p className="text-[10px] text-slate-300">Conectado en tiempo real a Firebase Cloud Firestore</p>
        </div>
      </footer>
    </div>
  );
}
