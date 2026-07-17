import React, { useState } from "react";
import { Lock, X, AlertCircle } from "lucide-react";
import logoImg from "../assets/images/credishop_logo_1784292169322.jpg";

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  savedPin: string;
}

export default function AdminLogin({
  isOpen,
  onClose,
  onLoginSuccess,
  savedPin
}: AdminLoginProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    setError("");
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin === savedPin) {
        onLoginSuccess();
        setPin("");
        onClose();
      } else if (newPin.length === 4) {
        setError("PIN Incorrecto. Intenta de nuevo.");
        setTimeout(() => setPin(""), 600);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-900/40 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-xl border border-purple-500/30 mb-3 bg-purple-950 flex-shrink-0">
            <img
              src={logoImg}
              alt="Credishop Guayana Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-xl font-bold text-white">Acceso Administrador</h2>
          <p className="text-xs text-slate-400 mt-1">Ingresa el PIN de seguridad de 4 dígitos</p>
        </div>

        {/* Display dots for PIN */}
        <div className="flex justify-center space-x-3 mb-6">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                index < pin.length
                  ? "bg-purple-500 border-purple-400 scale-110 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  : "border-slate-700 bg-transparent"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-3 py-2 rounded-xl mb-6 animate-bounce justify-center">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 bg-slate-800/40 hover:bg-purple-600/20 active:bg-purple-600 border border-slate-800/80 active:border-purple-500 rounded-2xl text-xl font-bold text-white transition-all flex items-center justify-center shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="h-14 bg-slate-800/20 hover:bg-rose-500/10 rounded-2xl text-xs font-semibold text-rose-400 transition-all flex items-center justify-center border border-transparent hover:border-rose-500/20"
          >
            Borrar
          </button>
          <button
            onClick={() => handleKeyPress("0")}
            className="h-14 bg-slate-800/40 hover:bg-purple-600/20 active:bg-purple-600 border border-slate-800/80 active:border-purple-500 rounded-2xl text-xl font-bold text-white transition-all flex items-center justify-center shadow-sm"
          >
            0
          </button>
          <button
            onClick={() => setPin("")}
            className="h-14 bg-slate-800/20 hover:bg-slate-800 rounded-2xl text-xs font-semibold text-slate-400 transition-all flex items-center justify-center"
          >
            Limpiar
          </button>
        </div>


      </div>
    </div>
  );
}
