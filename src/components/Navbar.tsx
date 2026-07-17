import React from "react";
import { Smartphone, ShoppingBag, Lock, Unlock, LogOut } from "lucide-react";
import logoImg from "../assets/images/credishop_logo_1784292169322.jpg";

interface NavbarProps {
  isAdmin: boolean;
  onAdminClick: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({
  isAdmin,
  onAdminClick,
  onLogout,
  activeTab,
  setActiveTab
}: NavbarProps) {
  return (
    <header className="bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("catalogo")}>
            <div className="relative h-12 w-12 rounded-xl overflow-hidden shadow-lg border border-purple-400/30 bg-purple-950 flex-shrink-0">
              <img
                src={logoImg}
                alt="Credishop Guayana Logo"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-indigo-200">
                CREDISHOP GUAYANA
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-purple-300">
                Celulares y Accesorios
              </p>
            </div>
          </div>

          {/* Tab Navigation (Public vs Admin) */}
          <div className="hidden md:flex space-x-1">
            {!isAdmin ? (
              <button
                onClick={() => setActiveTab("catalogo")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "catalogo"
                    ? "bg-purple-600/30 border border-purple-500/50 text-white shadow-md"
                    : "text-purple-200 hover:text-white hover:bg-white/5"
                }`}
              >
                Catálogo Público
              </button>
            ) : (
              <div className="flex space-x-1 bg-black/20 p-1 rounded-xl border border-white/5">
                {[
                  { id: "dashboard", label: "Dashboard" },
                  { id: "inventario", label: "Inventario" },
                  { id: "ventas", label: "Ventas" },
                  { id: "clientes", label: "Clientes & Cobros" },
                  { id: "compras", label: "Compras/Deudas" },
                  { id: "gastos", label: "Gastos/Nómina" },
                  { id: "devoluciones", label: "Devoluciones" },
                  { id: "ajustes", label: "Ajustes" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-purple-600 text-white shadow"
                        : "text-purple-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin Log / Out Button */}
          <div className="flex items-center space-x-3">
            {isAdmin ? (
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir Admin</span>
              </button>
            ) : (
              <button
                onClick={onAdminClick}
                className="flex items-center space-x-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/40 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg"
              >
                <Lock className="h-4 w-4" />
                <span>Panel Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation row for Admin */}
      {isAdmin && (
        <div className="md:hidden flex items-center justify-start overflow-x-auto border-t border-purple-900/40 bg-purple-950/80 p-2 space-x-1 scrollbar-thin scrollbar-thumb-purple-900">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "inventario", label: "Inventario" },
            { id: "ventas", label: "Ventas" },
            { id: "clientes", label: "Clientes & Cobros" },
            { id: "compras", label: "Compras" },
            { id: "gastos", label: "Gastos" },
            { id: "devoluciones", label: "Devoluciones" },
            { id: "ajustes", label: "Ajustes" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white border border-purple-500"
                  : "text-purple-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
