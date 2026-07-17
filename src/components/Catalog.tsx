import React, { useState, useEffect } from "react";
import { Product, ProductCategory } from "../types";
import {
  Search, Smartphone, ShoppingBag, Grid, AlertTriangle, Plus, Minus,
  Trash2, ShoppingCart, X, User, Phone, FileText, MapPin, Check, MessageSquare, Mail
} from "lucide-react";
import logoImg from "../assets/images/credishop_logo_1784292169322.jpg";

interface CatalogProps {
  products: Product[];
  whatsappNumber: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Catalog({ products, whatsappNumber }: CatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "equipos" | "accesorios">("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  // Reset brand filter when category changes
  useEffect(() => {
    setSelectedBrand("all");
  }, [categoryFilter]);

  // Brand detection helper based on product names
  const getProductBrand = (productName: string): string => {
    const name = productName.toLowerCase().trim();
    
    // 1. Check for explicit master brand keywords anywhere in the product name
    if (name.includes("samsung") || name.includes("galaxy")) return "Samsung";
    if (name.includes("iphone") || name.includes("apple") || name.includes("ipad") || name.includes("macbook") || name.includes("ios")) return "Apple";
    if (name.includes("xiaomi") || name.includes("redmi") || name.includes("poco")) return "Xiaomi";
    if (name.includes("motorola") || name.includes("moto ")) return "Motorola";
    if (name.includes("infinix")) return "Infinix";
    if (name.includes("tecno")) return "Tecno";
    if (name.includes("realme")) return "Realme";
    if (name.includes("honor")) return "Honor";
    if (name.includes("huawei")) return "Huawei";
    if (name.includes("oppo")) return "Oppo";
    if (name.includes("vivo")) return "Vivo";

    // Clean split into individual word tokens to inspect model numbers or prefixes
    const words = name.split(/[\s,.\-\/()]+/).filter(Boolean);

    // 2. Samsung Model Detection (e.g., A03, A04, A05, A06, A14, A15, A25, A35, A55, S21, S22, S23, S24, S25, J7, Grand, Prime, Fold, Flip, Ultra, Note)
    const isSamsungModel = words.some(word => 
      /^(a0\d|a1\d|a2\d|a3\d|a5\d|a7\d|s2\d|s1\d|j\d|z\d)/i.test(word) || // Matches a05, a15, s24, s23, a06, a06s, etc.
      /^(fold|flip|ultra|note|grand|prime|j4|j5|j6|j7|j8)$/i.test(word)
    );
    if (isSamsungModel) return "Samsung";

    // 3. Xiaomi / Redmi / Poco Model Detection (e.g., C65, C55, X6, M6, F5, F6)
    const isXiaomiModel = words.some(word => 
      /^(c\d{2}|x\d|m\d|f\d)/i.test(word) || // Matches c65, x6, x6pro, etc.
      /^(redmi|poco)$/i.test(word)
    );
    if (isXiaomiModel) return "Xiaomi";

    // 4. Motorola Model Detection (e.g., G14, G24, G34, G54, G84, E13, E20, Edge)
    const isMotorolaModel = words.some(word => 
      /^(g\d{2}|e\d{2})/i.test(word) || // Matches g14, g24, g54, e13, etc.
      /^(moto|edge)$/i.test(word)
    );
    if (isMotorolaModel) return "Motorola";

    // 5. Infinix Model Detection (e.g., Hot 30, Hot 40, Smart 8, Smart 9, Zero)
    const isInfinixModel = words.some(word => 
      /^(hot|smart|zero|note)\d*/i.test(word)
    );
    if (isInfinixModel) return "Infinix";

    // 6. Tecno Model Detection (e.g., Spark 10, Spark 20, Pop 8, Camon, Pova)
    const isTecnoModel = words.some(word => 
      /^(spark|pop|camon|pova)\d*/i.test(word)
    );
    if (isTecnoModel) return "Tecno";

    // Fallback: Use the first word capitalized if it is a reasonable, non-generic word
    const firstWord = words[0];
    if (
      firstWord && 
      firstWord.length > 2 && 
      !["celular", "telefono", "equipo", "smart", "nuevo", "for", "para", "vidrio", "forro", "case", "cargador", "cable"].includes(firstWord.toLowerCase())
    ) {
      // Check if firstWord resembles a model code of Samsung
      if (/^a0[1-9]/i.test(firstWord) || /^a[1-9][0-9]/i.test(firstWord) || /^s[1-9][0-9]/i.test(firstWord)) {
        return "Samsung";
      }
      return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    }
    
    return "Otras Marcas";
  };

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Billing Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCedulaPrefix, setCustomerCedulaPrefix] = useState("V");
  const [customerCedulaNumber, setCustomerCedulaNumber] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("credishop_guayana_cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading cart from localStorage");
      }
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("credishop_guayana_cart", JSON.stringify(newCart));
  };

  const handleAddToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      const updated = cart.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      saveCart(updated);
    } else {
      saveCart([...cart, { product, quantity: 1 }]);
    }
    // Give feedback or open cart
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const updated = cart.map((item) => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as CartItem[];
    saveCart(updated);
  };

  const handleRemoveFromCart = (productId: string) => {
    const updated = cart.filter((item) => item.product.id !== productId);
    saveCart(updated);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    if (cart.length === 0) {
      setCheckoutError("Tu carrito está vacío.");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !customerCedulaNumber.trim() || !customerAddress.trim()) {
      setCheckoutError("Por favor completa todos los datos de facturación solicitados.");
      return;
    }

    const combinedCedula = `${customerCedulaPrefix}-${customerCedulaNumber.trim()}`;

    // Build the beautiful structured message for WhatsApp
    const header = `*NUEVO PEDIDO - CREDISHOP GUAYANA* 🛒📱✨\n\n`;
    
    const clientDetails = `*Datos de Facturación / Despacho:*\n` +
                          `👤 *Cliente:* ${customerName.trim()}\n` +
                          `🪪 *Cédula/RIF:* ${combinedCedula}\n` +
                          `📞 *Teléfono:* ${customerPhone.trim()}\n` +
                          `📧 *Correo:* ${customerEmail.trim() || "N/A"}\n` +
                          `📍 *Dirección:* ${customerAddress.trim()}\n\n`;

    let itemsDetail = `*Productos Solicitados:*\n`;
    cart.forEach((item, index) => {
      itemsDetail += `${index + 1}. *${item.product.name}*\n` +
                     `   Cant: ${item.quantity} x $${item.product.salePrice.toLocaleString()} | Subtotal: *$$${(item.product.salePrice * item.quantity).toLocaleString()}*\n`;
    });

    const totalSection = `\n💵 *Total General del Pedido: $${cartTotal.toLocaleString()}*\n\n` +
                         `_Hola, acabo de armar mi pedido desde el catálogo digital de CREDISHOP GUAYANA. Quedo atento(a) para verificar el pago y proceder con la facturación y entrega. ¡Gracias!_`;

    const fullMessage = header + clientDetails + itemsDetail + totalSection;
    const encodedMessage = encodeURIComponent(fullMessage);
    
    // Use the admin configured whatsapp number
    const targetNumber = whatsappNumber ? whatsappNumber.replace(/[^0-9]/g, "") : "584120000000";
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetNumber}&text=${encodedMessage}`;

    // Clear cart and localStorage
    saveCart([]);
    setIsCartOpen(false);

    // Open WhatsApp
    window.open(whatsappUrl, "_blank");
  };

  // Get all search-matching celular (equipos) products to find the list of active brands
  const activeEquipos = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && p.category === "equipos";
  });

  // Calculate product count per brand
  const brandCounts = activeEquipos.reduce((acc, p) => {
    const brand = getProductBrand(p.name);
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const availableBrands = Object.entries(brandCounts)
    .map(([name, count]) => {
      let id = name.toLowerCase();
      if (id === "otras marcas") id = "otros";
      return { id, name, count };
    })
    .sort((a, b) => b.count - a.count); // sort by product count descending

  // Add "all" option at the beginning
  if (activeEquipos.length > 0) {
    availableBrands.unshift({
      id: "all",
      name: "Todas las Marcas",
      count: activeEquipos.length
    });
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    
    // Apply brand filter if we are in cellular category
    if (categoryFilter === "equipos" && selectedBrand !== "all") {
      const brand = getProductBrand(p.name);
      let brandId = brand.toLowerCase();
      if (brandId === "otras marcas") brandId = "otros";
      return matchesSearch && matchesCategory && brandId === selectedBrand;
    }

    return matchesSearch && matchesCategory;
  });

  // Group products by brand if we are in the celulares category
  const groupedEquipos: Record<string, Product[]> = {};
  if (categoryFilter === "equipos") {
    filteredProducts.forEach((p) => {
      const brand = getProductBrand(p.name);
      if (!groupedEquipos[brand]) {
        groupedEquipos[brand] = [];
      }
      groupedEquipos[brand].push(p);
    });
  }

  const sortedBrandNames = Object.keys(groupedEquipos).sort((a, b) => {
    if (a === "Otras Marcas") return 1;
    if (b === "Otras Marcas") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center space-x-2 transition-all hover:scale-105 border-2 border-white animate-bounce"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="bg-white text-blue-700 text-xs font-black h-5 w-5 rounded-full flex items-center justify-center shadow-inner">
            {cartItemsCount}
          </span>
        </button>
      )}

      {/* Banner de Bienvenida */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-blue-500/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1200')] bg-cover bg-center opacity-15 mix-blend-overlay" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-bold uppercase tracking-wider text-blue-300">
              <span>Catálogo Oficial</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
              <span className="text-blue-300">CREDISHOP GUAYANA</span>
            </h2>
            <p className="text-sm sm:text-base text-blue-100/80 leading-relaxed">
              Explora nuestro inventario en tiempo real de teléfonos de alta gama, accesorios originales y repuestos. ¡Añade al carrito y haz tu pedido directo por WhatsApp para facturar!
            </p>
          </div>
          <div className="flex-shrink-0 self-center md:self-auto">
            <img
              src={logoImg}
              alt="Credishop Guayana Logo"
              className="w-32 h-32 rounded-2xl object-cover shadow-2xl border-2 border-blue-400/30"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 rounded-xl text-sm font-medium transition-all outline-none"
          />
        </div>

        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              categoryFilter === "all"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setCategoryFilter("equipos")}
            className={`flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              categoryFilter === "equipos"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Celulares</span>
          </button>
          <button
            onClick={() => setCategoryFilter("accesorios")}
            className={`flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              categoryFilter === "accesorios"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Accesorios</span>
          </button>
        </div>
      </div>

      {/* Brand Sub-filter for Celulares */}
      {categoryFilter === "equipos" && availableBrands.length > 0 && (
        <div className="bg-gradient-to-r from-slate-50 to-blue-50/20 border border-slate-200/50 p-6 rounded-3xl space-y-4 animate-fade-in shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <Smartphone className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Selecciona una Marca de tu Interés
              </span>
            </div>
            {selectedBrand !== "all" && (
              <button
                onClick={() => setSelectedBrand("all")}
                className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors"
              >
                Limpiar Filtro ×
              </button>
            )}
          </div>
          
          <div className="flex flex-nowrap sm:flex-wrap gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-none scroll-smooth">
            {availableBrands.map((b) => {
              const isSelected = selectedBrand === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrand(b.id)}
                  className={`flex-shrink-0 flex items-center space-x-3 px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 border focus:outline-none ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white border-transparent shadow-lg shadow-blue-500/20 scale-[1.03] -translate-y-0.5"
                      : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 hover:scale-[1.01] hover:-translate-y-0.5 shadow-sm"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black uppercase transition-all shadow-inner ${
                    isSelected 
                      ? "bg-white/20 text-white" 
                      : "bg-gradient-to-br from-blue-50 to-sky-50 text-blue-600 border border-blue-100"
                  }`}>
                    {b.id === "all" ? "★" : b.name.charAt(0)}
                  </span>
                  <span className="tracking-tight uppercase font-extrabold">{b.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
          <Grid className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No se encontraron productos</h3>
          <p className="text-sm text-slate-400 mt-1">Prueba con otra búsqueda o filtro de categoría o marca.</p>
        </div>
      ) : categoryFilter === "equipos" ? (
        <div className="space-y-12">
          {sortedBrandNames.map((brandName) => {
            const brandProducts = groupedEquipos[brandName] || [];
            if (brandProducts.length === 0) return null;
            return (
              <div key={brandName} className="space-y-4 animate-fade-in">
                {/* Brand Header */}
                <div className="flex items-center space-x-2.5 border-b border-slate-200 pb-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                    {brandName}
                  </h3>
                </div>

                {/* Brand Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {brandProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full justify-between"
                    >
                      <div>
                        {/* Product Image */}
                        {product.image ? (
                          <div className="relative aspect-square w-full overflow-hidden bg-slate-50 group border-b border-slate-100">
                            <img
                              src={product.image}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            />
                            {product.stock === 0 && (
                              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-2">
                                <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-widest shadow-md">
                                  <AlertTriangle className="h-3.5 w-3.5 animate-bounce" />
                                  <span>Agotado</span>
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-1 bg-gradient-to-r from-blue-100 to-sky-50 border-b border-slate-100/50" />
                        )}

                        {/* Product Content */}
                        <div className="p-6 space-y-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500">
                              Celular / Equipo
                            </span>
                            <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2">
                              {product.name}
                            </h3>
                          </div>

                          <div className="flex items-end justify-between pt-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Precio</span>
                              <span className="text-2xl font-black text-blue-950">${product.salePrice.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Add to Cart button */}
                      <div className="p-6 pt-0 border-t border-slate-50 mt-auto">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-blue-500/25 transition-all"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>Añadir al Carrito</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full justify-between"
            >
              <div>
                {/* Product Image */}
                {product.image ? (
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-50 group border-b border-slate-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-2">
                        <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-widest shadow-md">
                          <AlertTriangle className="h-3.5 w-3.5 animate-bounce" />
                          <span>Agotado</span>
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-1 bg-gradient-to-r from-blue-100 to-sky-50 border-b border-slate-100/50" />
                )}

                {/* Product Content */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500">
                      {product.category === ProductCategory.Equipos ? "Celular / Equipo" : "Accesorio"}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-end justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Precio</span>
                      <span className="text-2xl font-black text-blue-950">${product.salePrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add to Cart button */}
              <div className="p-6 pt-0 border-t border-slate-50 mt-auto">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-blue-500/25 transition-all"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Añadir al Carrito</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SHOPPING CART DRAWER / SLIDING PANEL */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-end">
          <div className="bg-white h-full w-full max-w-lg shadow-2xl flex flex-col border-l border-slate-100 animate-slide-in">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-700">
                <ShoppingCart className="h-6 w-6" />
                <h3 className="text-lg font-black tracking-tight text-slate-900">Carrito de Compras</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <ShoppingBag className="h-16 w-16 text-slate-200 mx-auto animate-bounce" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-700">El carrito está vacío</h4>
                    <p className="text-xs text-slate-400">¡Explora nuestro catálogo y agrega productos para comenzar!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-12 w-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                            P
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-extrabold text-slate-800 truncate" title={item.product.name}>
                            {item.product.name}
                          </h4>
                          <span className="text-xs text-slate-400 font-bold block">
                            ${item.product.salePrice.toLocaleString()} unidad
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Quantity selector */}
                        <div className="flex items-center border border-slate-200 bg-white rounded-xl p-1 shadow-sm">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product.id, -1)}
                            className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2.5 text-xs font-extrabold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product.id, 1)}
                            className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <span className="text-xs font-black text-slate-800 w-16 text-right">
                          ${(item.product.salePrice * item.quantity).toLocaleString()}
                        </span>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-full hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Summary card */}
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex justify-between items-center">
                    <span className="text-xs font-extrabold text-blue-900 uppercase">Subtotal General:</span>
                    <span className="text-lg font-black text-blue-950">${cartTotal.toLocaleString()}</span>
                  </div>

                  {/* Customer Checkout Form */}
                  <form onSubmit={handleCheckoutSubmit} className="border-t border-slate-100 pt-6 space-y-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tus Datos de Facturación / Despacho</p>
                    
                    <div className="space-y-3">
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Nombre Completo"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-medium transition-all outline-none"
                        />
                      </div>

                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Número de Teléfono (Celular)"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-medium transition-all outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <select
                          value={customerCedulaPrefix}
                          onChange={(e) => setCustomerCedulaPrefix(e.target.value)}
                          className="p-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-bold outline-none"
                        >
                          <option value="V">V</option>
                          <option value="E">E</option>
                          <option value="J">J</option>
                          <option value="G">G</option>
                          <option value="P">P</option>
                        </select>
                        <div className="relative flex-1">
                          <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="Número de Cédula / RIF"
                            value={customerCedulaNumber}
                            onChange={(e) => setCustomerCedulaNumber(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-medium transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Dirección Completa de Despacho"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-medium transition-all outline-none"
                        />
                      </div>

                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="Correo Electrónico (para Facturación Automática)"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-medium transition-all outline-none"
                        />
                      </div>
                    </div>

                    {checkoutError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl flex items-center space-x-1.5">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span>{checkoutError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center space-x-2 py-3.5 bg-green-600 hover:bg-green-500 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-green-500/25 transition-all"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Confirmar Pedido por WhatsApp</span>
                    </button>
                    <p className="text-[10px] text-center text-slate-400 font-semibold leading-snug">
                      Al presionar se abrirá un chat directo con la administración de la tienda adjuntando la orden detallada con tus datos de facturación para coordinar el pago.
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
