"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Key, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`, {
        method: 'POST'
      });

      if (response.ok) {
        setIsSent(true);
      } else {
        alert('No encontramos ninguna cuenta con ese correo');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05),transparent_50%)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-[#121212] border border-[#1e1e1e] rounded-[32px] p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full"></div>
        
        <div className="relative z-10 text-center mb-10">
          <Link href="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Volver al Inicio
          </Link>
          
          <div className="w-20 h-20 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-purple-500/20">
            <Key size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Recuperar Acceso</h1>
          <p className="text-gray-500 font-medium">Te enviaremos una nueva llave a tu correo.</p>
        </div>

        {isSent ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl mb-8">
              <p className="text-green-400 font-bold mb-2">¡Email Enviado!</p>
              <p className="text-gray-400 text-sm">Revisa tu bandeja de entrada para continuar con la recuperación.</p>
            </div>
            <Link href="/login" className="text-white font-black hover:underline">Ir al Login</Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-[2px] ml-1">Tu Correo Registrado</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#8b5cf6] transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#8b5cf6] focus:ring-4 focus:ring-purple-500/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all placeholder:text-gray-700 font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
              {!isLoading && <Send size={20} />}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
