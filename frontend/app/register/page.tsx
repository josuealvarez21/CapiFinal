"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, ArrowRight, LogIn, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      });

      if (response.ok) {
        alert('Cuenta creada con éxito. Ya puedes iniciar sesión.');
        router.push('/login');
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Error al crear la cuenta');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent_50%)]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] bg-[#121212] border border-[#1e1e1e] rounded-[32px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/10 blur-[80px] rounded-full group-hover:bg-green-500/20 transition-colors duration-700"></div>
        
        <div className="relative z-10 text-center mb-10">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className="w-20 h-20 bg-gradient-to-br from-[#22c55e] to-[#1C542D] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-green-500/20"
          >
            <ShieldCheck size={40} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Nueva Identidad</h1>
          <p className="text-gray-500 font-medium">Únete a la élite financiera de Cápi.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[2px] ml-1">Nombre Completo</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#22c55e] transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#22c55e] focus:ring-4 focus:ring-green-500/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all placeholder:text-gray-700 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[2px] ml-1">Correo Electrónico</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#22c55e] transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#22c55e] focus:ring-4 focus:ring-green-500/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all placeholder:text-gray-700 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[2px] ml-1">Contraseña de Bóveda</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#22c55e] transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#22c55e] focus:ring-4 focus:ring-green-500/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all placeholder:text-gray-700 font-medium"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:shadow-[0_8px_24px_-8px_rgba(34,197,94,0.5)] text-white py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? 'Creando Acceso...' : 'Sellar Mi Registro'}
            {!isLoading && <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />}
          </button>
        </form>

        <p className="mt-10 text-center text-gray-500 text-sm font-medium">
          ¿Ya tienes una llave? {' '}
          <Link href="/login" className="text-white font-black hover:text-[#3b82f6] transition-colors inline-flex items-center gap-1 group">
            Inicia sesión <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
