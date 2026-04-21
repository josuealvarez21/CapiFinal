"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Globe, ArrowRight, UserPlus, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const googleLogin = useGoogleLogin({
    onSuccess: tokenResponse => {
      console.log('Google Success:', tokenResponse);
      // Aquí enviaríamos tokenResponse.access_token al backend
      alert("¡Éxito! Ahora solo falta conectar este token con tu servidor.");
    },
    onError: () => alert('Error al iniciar sesión con Google'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      if (response.ok) {
        const data = await response.json();
        login(data.access_token);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.detail || 'Credenciales incorrectas o error en el servidor');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-[#121212] border border-[#1e1e1e] rounded-[32px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group"
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-colors duration-700"></div>
        
        <div className="relative z-10 text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-[#3b82f6] to-[#22c55e] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-blue-500/20"
          >
            <Fingerprint size={40} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Bienvenido a Cápi</h1>
          <p className="text-gray-500 font-medium">Controla tu destino financiero hoy.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[2px] ml-1">Email de Acceso</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#3b82f6] transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#3b82f6] focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all placeholder:text-gray-700 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-[2px]">Llave de Seguridad</label>
              <Link href="/forgot-password" title="recuperar" className="text-[11px] font-black text-[#3b82f6] uppercase tracking-[1px] hover:underline transition-all">¿Olvidaste la llave?</Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#3b82f6] transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#3b82f6] focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all placeholder:text-gray-700 font-medium"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:shadow-[0_8px_24px_-8px_rgba(59,130,246,0.5)] text-white py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? 'Iniciando Sesión...' : 'Entrar a la Bóveda'}
            {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4">
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1e1e1e]"></div></div>
            <div className="relative flex justify-center"><span className="bg-[#121212] px-4 text-[10px] font-black text-gray-600 uppercase tracking-[2px]">O continúa con</span></div>
          </div>

          <button 
            type="button"
            onClick={() => googleLogin()}
            className="w-full bg-white text-black hover:bg-gray-100 py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Globe size={22} /> Google
          </button>
        </div>

        <p className="mt-10 text-center text-gray-500 text-sm font-medium">
          ¿No tienes acceso todavía? {' '}
          <Link href="/register" className="text-white font-black hover:text-[#22c55e] transition-colors inline-flex items-center gap-1 group">
            Crea tu cuenta <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
