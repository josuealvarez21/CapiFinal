"use client";
import { motion, AnimatePresence } from 'framer-motion';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label
} from 'recharts';
import { 
  LayoutDashboard, TrendingUp, TrendingDown, Target, 
  Wallet, Settings, LogOut, Plus, Home as HomeIcon,
  Utensils, ShoppingCart, Car, Zap, X, PlusCircle, MinusCircle, PieChart as PieChartIcon,
  Trash2
} from 'lucide-react';

// --- Types ---
interface UserData { nombre: string; }
interface SummaryData { balance_total: number; ingresos_mes: number; gastos_mes: number; }
interface CategoriaDistribucion { nombre: string; valor: string | number; color: string; }
interface Transaccion { id: string; descripcion: string; monto: number; tipo: string; categoria: string; fecha: string; }
interface Meta { id: string; nombre: string; monto_objetivo: number; ahorro_actual: number; fecha_limite?: string; ahorro_automatico?: boolean; color?: string; }
interface Presupuesto { id: string; categoria: string; gastado: number; limite: number; }
interface DashboardData { user: UserData; summary: SummaryData; distribucion_gastos: CategoriaDistribucion[]; ultimos_movimientos: Transaccion[]; metas: Meta[]; presupuestos: Presupuesto[]; }
interface CategoriaBackend { id_categoria: number; nombre_categoria: string; tipo: string; }

// --- Utils ---
const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(Number(amount));
};

const formatAmountForDisplay = (value: string) => {
  if (!value) return '';
  const number = value.replace(/\D/g, '');
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(Number(number));
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Comida': return <Utensils size={24} />;
    case 'Alquiler': return <HomeIcon size={24} />;
    case 'Transporte': return <Car size={24} />;
    case 'Servicios': return <Zap size={24} />;
    case 'Salario': return <TrendingUp size={24} />;
    default: return <ShoppingCart size={24} />;
  }
};

const getCategoryBadgeClass = (tipo: string) => {
    return tipo === 'ingreso' ? 'bg-[#1C542D] text-[#22c55e]' : 'bg-red-950 text-red-400 border border-red-900';
}

const PresupuestoProgress = ({ presupuesto, onDelete }: { presupuesto: Presupuesto, onDelete: (id: string) => void }) => {
  const gastado = Number(presupuesto.gastado || 0);
  const limite = Number(presupuesto.limite || 0);
  const porcentaje = limite > 0 ? (gastado / limite) * 100 : 0;
  const esExcedido = gastado > limite;
  const montoDiferencia = Math.abs(limite - gastado);

  return (
    <div className={`mb-4 bg-[#121212] p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${esExcedido ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : 'border-[#2e2e2e] hover:border-[#8b5cf6]'}`}>
      <div className="flex justify-between mb-4 relative z-10">
        <div className="flex flex-col">
          <span className="text-white font-bold tracking-wide flex items-center gap-2">
            {presupuesto.categoria}
            {esExcedido && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">EXCEDIDO</span>}
          </span>
          <p className={`text-[11px] mt-1 ${esExcedido ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
            {esExcedido ? `¡Te has pasado por ${formatCurrency(montoDiferencia)}!` : `Te quedan ${formatCurrency(montoDiferencia)} disponibles`}
          </p>
        </div>
        <button 
          onClick={() => onDelete(presupuesto.id)}
          className="text-gray-600 hover:text-red-500 transition-colors p-1"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex justify-between items-end mb-3 relative z-10">
        <span className={`text-2xl font-black ${esExcedido ? 'text-red-500' : 'text-white'}`}>
          {formatCurrency(gastado)}
        </span>
        <span className="text-gray-500 text-xs font-bold mb-1">
          de {formatCurrency(limite)}
        </span>
      </div>

      <div className="w-full bg-[#1e1e1e] rounded-full h-3.5 border border-[#2e2e2e] overflow-hidden relative z-10 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(porcentaje, 100)}%` }}
          className={`h-full transition-all duration-1000 ${esExcedido ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.4)]'}`}
        />
      </div>
      
      <div className="mt-3 flex justify-between items-center relative z-10">
        <span className={`text-[10px] font-black uppercase tracking-widest ${esExcedido ? 'text-red-500' : 'text-[#8b5cf6]'}`}>
          {porcentaje.toFixed(1)}% Consumido
        </span>
        {esExcedido && <TrendingUp size={14} className="text-red-500" />}
      </div>
    </div>
  );
};

const MetaProgress = ({ meta, onDelete, projectedAmount = 0 }: { meta: Meta, onDelete: (id: string) => void, projectedAmount?: number }) => {
  const currentActual = Number(meta.ahorro_actual || 0);
  const target = Number(meta.monto_objetivo || 0);
  const projected = Number(projectedAmount || 0);

  const currentPercentage = target > 0 ? Math.min((currentActual / target) * 100, 100) : 0;
  const projectedPercentage = target > 0 ? Math.min(((currentActual + projected) / target) * 100, 100) : 0;
  
  const isCompleted = currentActual >= target;
  const willBeCompleted = (currentActual + projected) >= target;

  const color = meta.color || '#f59e0b';
  
  // Calcular meses restantes si se sigue ahorrando el monto proyectado mensualmente
  const calculateMonthsRemaining = () => {
    if (isCompleted) return 0;
    if (projectedAmount <= 0) return null;
    const remaining = meta.monto_objetivo - meta.ahorro_actual;
    return Math.ceil(remaining / projectedAmount);
  };

  const months = calculateMonthsRemaining();

  return (
    <div className={`mb-4 bg-[#121212] p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden group ${isCompleted ? 'border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-[#2e2e2e] hover:border-[#f59e0b]'}`}>
      <div className="flex justify-between mb-3 relative z-10">
        <div className="flex flex-col">
          <span className="text-white font-bold tracking-wide flex items-center gap-2">
            {meta.nombre}
            {isCompleted && <span className="text-[#22c55e] text-[10px] bg-[#1C542D] px-2 py-0.5 rounded-full uppercase">Completada</span>}
          </span>
          {months !== null && !isCompleted && (
            <span className="text-[10px] text-gray-500 font-medium">Faltan aprox. {months} meses</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm font-medium mr-2">
            <span className="text-white">{formatCurrency(Number(meta.ahorro_actual || 0) + Number(projectedAmount || 0))}</span> / {formatCurrency(meta.monto_objetivo)}
          </span>
          <button 
            onClick={() => onDelete(meta.id)}
            className="text-gray-500 hover:text-red-500 transition-colors p-1"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="w-full bg-[#1e1e1e] rounded-full h-3 border border-[#2e2e2e] overflow-hidden mb-3 relative">
        {/* Projected Progress */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(projectedPercentage, (projectedAmount > 0 ? 1 : 0))}%` }}
          className={`h-3 rounded-full absolute top-0 left-0 opacity-40 ${willBeCompleted ? 'bg-[#22c55e]' : 'bg-[#f59e0b]'}`}
        ></motion.div>
        {/* Current Progress */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(currentPercentage, (meta.ahorro_actual > 0 ? 1 : 0))}%` }}
          className={`h-3 rounded-full absolute top-0 left-0 z-10 shadow-[0_0_15px_rgba(245,158,11,0.6)] ${isCompleted ? 'bg-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.8)]' : ''}`}
          style={{ backgroundColor: !isCompleted ? color : undefined }}
        ></motion.div>
      </div>
      <div className="flex justify-between items-center mt-2">
         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${willBeCompleted ? 'bg-[#22c55e]' : 'bg-[#f59e0b]'} text-[#121212]`}>
            {projectedPercentage < 1 && projectedPercentage > 0 ? projectedPercentage.toFixed(2) : projectedPercentage.toFixed(0)}% {willBeCompleted ? 'Logrado' : 'Proyectado'}
         </span>
         {projectedAmount > 0 && !isCompleted && (
           <span className="text-[#22c55e] text-xs font-bold animate-pulse">
             +{formatCurrency(projectedAmount)} proyectados
           </span>
         )}
      </div>
    </div>
  );
};

// --- Page ---
export default function SinglePageApp() {
  const { token, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [token, authLoading]);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'dashboard'|'ingresos'|'gastos'|'metas'|'presupuestos'>('dashboard');

  if (authLoading || !token) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ambos'|'ingreso'|'gasto'>('ambos');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [categories, setCategories] = useState<CategoriaBackend[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [formData, setFormData] = useState({ monto: '', descripcion: '', id_categoria: '', fecha: new Date().toISOString().split('T')[0] });
  const [goalFormData, setGoalFormData] = useState({ nombre: '', objetivo: '', fecha: new Date().toISOString().split('T')[0] });
  const [budgetFormData, setBudgetFormData] = useState({ id_categoria: '', limite: '', fecha_mes: new Date().toISOString().slice(0, 7) }); // YYYY-MM
  const [savingsPercentage, setSavingsPercentage] = useState(10);
  const [savingsDistributionMode, setSavingsDistributionMode] = useState<'equitativa'|'prioridad'>('equitativa');
  const [manualSavingsAmount, setManualSavingsAmount] = useState<string>('');
  const [showSuccessFeedback, setShowSuccessFeedback] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/categories/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setCategories(await response.json());
    } catch (error) { console.warn(error); }
  };

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/dashboard/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener datos reales');
      const backendData: DashboardData = await response.json();
      if (!backendData || !backendData.summary) throw new Error('Invalido');
      
      // Fix string values from Backend Decimal parsing for Recharts
      backendData.distribucion_gastos = backendData.distribucion_gastos.map(item => ({
          ...item,
          valor: Number(item.valor) // Recharts needs strict Numbers!
      }));
      
      setData(backendData);
    } catch (error) { console.warn(error); }
  };

  useEffect(() => {
    if (token) {
      const init = async () => {
        setLoading(true);
        await fetchCategories();
        await fetchData();
        setLoading(false);
      };
      init();
    }
  }, [token]);

  const openMovementModal = (type: 'ambos'|'ingreso'|'gasto') => {
      setModalType(type);
      setIsModalOpen(true);
  }

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/movements/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_categoria: parseInt(formData.id_categoria),
          monto: parseFloat(formData.monto),
          descripcion: formData.descripcion,
          fecha: formData.fecha
        })
      });
      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ monto: '', descripcion: '', id_categoria: '', fecha: new Date().toISOString().split('T')[0] });
        await fetchData(); 
      }
    } catch (error) { console.error(error); } 
    finally { setIsSubmitting(false); }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/goals/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre_meta: goalFormData.nombre,
          monto_objetivo: parseFloat(goalFormData.objetivo),
          monto_actual: 0,
          fecha_limite: goalFormData.fecha
        })
      });
      if (response.ok) {
        setIsGoalModalOpen(false);
        setGoalFormData({ nombre: '', objetivo: '', fecha: new Date().toISOString().split('T')[0] });
        await fetchData();
      }
    } catch(e) { console.error(e); } 
    finally { setIsSubmitting(false); }
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dateParts = budgetFormData.fecha_mes.split('-');
      const response = await fetch('http://localhost:8000/api/v1/budgets/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_categoria: parseInt(budgetFormData.id_categoria),
          monto_limite: parseFloat(budgetFormData.limite),
          mes: parseInt(dateParts[1]),
          anio: parseInt(dateParts[0])
        })
      });
      if (response.ok) {
        setIsBudgetModalOpen(false);
        setBudgetFormData({ id_categoria: '', limite: '', fecha_mes: new Date().toISOString().slice(0, 7) });
        await fetchData();
      }
    } catch(e) { console.error(e); } 
    finally { setIsSubmitting(false); }
  };

  const handleDeleteMovement = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este movimiento?')) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/movements/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) await fetchData();
    } catch (error) { console.error(error); }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta meta?')) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/goals/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) await fetchData();
    } catch (error) { console.error(error); }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este presupuesto?')) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/budgets/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) await fetchData();
    } catch (error) { console.error(error); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium font-sans animate-pulse">Sincronizando cuentas con Cápi...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-white space-y-4">
        <h2 className="text-xl text-red-500 font-bold">Error de Conexión</h2>
        <p className="text-gray-400">No se pudo cargar el Dashboard. Comprueba tu backend.</p>
        <button onClick={() => window.location.reload()} className="bg-[#3b82f6] px-6 py-2 rounded-xl text-white mt-4 hover:bg-blue-600 transition">Reintentar</button>
      </div>
    )
  }

  // Helpers for views
  const movementsFiltered = currentTab === 'ingresos' 
    ? data.ultimos_movimientos.filter(m => m.tipo === 'ingreso')
    : data.ultimos_movimientos.filter(m => m.tipo === 'egreso' || m.tipo === 'gasto');

  // The modal select categories based on the button clicked or tab
  const categoriesFiltered = modalType === 'ingreso' || currentTab === 'ingresos'
    ? categories.filter(c => c.tipo === 'ingreso')
    : modalType === 'gasto' || currentTab === 'gastos' 
    ? categories.filter(c => c.tipo === 'gasto')
    : categories;

  return (
    <div className="min-h-screen bg-[#121212] text-white flex font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#1e1e1e] border-r border-[#2e2e2e] flex flex-col justify-between hidden md:flex z-10 sticky top-0 h-screen shadow-2xl">
        <div>
          <div className="p-6 pb-8">
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#3b82f6] to-[#22c55e]">
              Cápi
            </h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Hub Financiero</p>
          </div>
          <nav className="px-4 space-y-2 relative">
            {/* Dashboard */}
            <button 
              onClick={() => setCurrentTab('dashboard')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-medium transition-all duration-300 ${currentTab === 'dashboard' ? 'bg-[#3b82f6] bg-opacity-30 text-white shadow-lg shadow-blue-500/10' : 'text-gray-400 hover:bg-[#2e2e2e] hover:text-white'}`}
            >
              <LayoutDashboard size={22} /> Dashboard
            </button>
            
            {/* Ingresos */}
            <button 
              onClick={() => setCurrentTab('ingresos')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-medium transition-all duration-300 ${currentTab === 'ingresos' ? 'bg-[#22c55e] bg-opacity-30 text-white shadow-lg shadow-green-500/10' : 'text-gray-400 hover:bg-[#2e2e2e] hover:text-white'}`}
            >
              <TrendingUp size={22} /> Ingresos
            </button>
            
            {/* Gastos */}
            <button 
              onClick={() => setCurrentTab('gastos')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-medium transition-all duration-300 ${currentTab === 'gastos' ? 'bg-[#ef4444] bg-opacity-30 text-white shadow-lg shadow-red-500/10' : 'text-gray-400 hover:bg-[#2e2e2e] hover:text-white'}`}
            >
              <TrendingDown size={22} /> Gastos
            </button>
            
            {/* Metas */}
            <button 
              onClick={() => setCurrentTab('metas')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-medium transition-all duration-300 ${currentTab === 'metas' ? 'bg-[#f59e0b] bg-opacity-30 text-white shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-[#2e2e2e] hover:text-white'}`}
            >
              <Target size={22} /> Metas
            </button>
            
            {/* Presupuestos */}
            <button 
              onClick={() => setCurrentTab('presupuestos')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-medium transition-all duration-300 ${currentTab === 'presupuestos' ? 'bg-[#8b5cf6] bg-opacity-30 text-white shadow-lg shadow-purple-500/10' : 'text-gray-400 hover:bg-[#2e2e2e] hover:text-white'}`}
            >
              <Wallet size={22} /> Presupuestos
            </button>
          </nav>
        </div>
        <div className="p-4 space-y-2 mb-4">
          <button className="w-full flex items-center gap-4 px-5 py-4 text-gray-500 hover:bg-[#2e2e2e] hover:text-white rounded-xl font-medium transition-colors">
            <Settings size={22} /> Ajustes
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-5 py-4 text-red-500 hover:bg-red-500/10 rounded-xl font-black transition-colors"
          >
            <LogOut size={22} /> Salir de Cápi
          </button>
        </div>
      </aside>

      {/* Main Content Render */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative min-h-screen bg-gradient-to-b from-[#181818] to-[#121212]">
        
        {/* TAB 1: DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="animate-in fade-in duration-300 slide-in-from-bottom-4">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div>
                <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Resumen General</h2>
                <p className="text-gray-400 text-lg">Monitoreo de flujo de caja en tiempo real.</p>
              </div>
              <div className="flex gap-3">
                  <button 
                    onClick={() => openMovementModal('ingreso')}
                    className="flex items-center gap-2 bg-[#1C542D] hover:bg-[#22c55e] hover:text-[#121212] text-white px-5 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-green-900/20 active:scale-95"
                  >
                    <PlusCircle size={20} /> Ingreso Rápido
                  </button>
                  <button 
                    onClick={() => openMovementModal('gasto')}
                    className="flex items-center gap-2 bg-[#451a1a] hover:bg-red-500 text-white px-5 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-red-900/20 active:scale-95"
                  >
                    <MinusCircle size={20} /> Gasto Rápido
                  </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-gradient-to-br from-[#1e1e1e] to-[#252525] border border-[#2e2e2e] rounded-3xl p-8 transition-transform hover:scale-105 hover:border-[#3b82f6] shadow-xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 text-[#3b82f6] opacity-10 group-hover:scale-150 transition-transform duration-500">
                    <Wallet size={120} />
                </div>
                <p className="text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider relative z-10">Balance Total</p>
                <h3 className="text-4xl font-extrabold text-white relative z-10 drop-shadow-md">{formatCurrency(data.summary.balance_total)}</h3>
              </div>
              <div className="bg-gradient-to-br from-[#1C542D] to-[#143B1F] border border-green-900 rounded-3xl p-8 transition-transform hover:scale-105 hover:border-[#22c55e] shadow-xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 text-[#22c55e] opacity-10 group-hover:scale-150 transition-transform duration-500">
                    <TrendingUp size={120} />
                </div>
                <p className="text-green-300 text-sm font-bold mb-2 uppercase tracking-wider relative z-10">Total Ingresos</p>
                <h3 className="text-4xl font-extrabold text-white relative z-10 drop-shadow-md">{formatCurrency(data.summary.ingresos_mes)}</h3>
              </div>
              <div className="bg-gradient-to-br from-[#451a1a] to-[#2B1010] border border-red-900 rounded-3xl p-8 transition-transform hover:scale-105 hover:border-[#ef4444] shadow-xl relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 text-[#ef4444] opacity-10 group-hover:scale-150 transition-transform duration-500">
                    <TrendingDown size={120} />
                </div>
                <p className="text-red-300 text-sm font-bold mb-2 uppercase tracking-wider relative z-10">Total Gastos</p>
                <h3 className="text-4xl font-extrabold text-white relative z-10 drop-shadow-md">{formatCurrency(data.summary.gastos_mes)}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-3xl p-8 shadow-2xl relative">
                <h3 className="text-2xl font-bold text-white mb-6">Ingresos vs Gastos</h3>
                {Number(data.summary.ingresos_mes) === 0 && Number(data.summary.gastos_mes) === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                     <PieChartIcon size={64} className="opacity-20 mb-4" />
                     <p>Registra movimientos para ver el análisis.</p>
                  </div>
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={[
                            { nombre: 'Ingresos', valor: Number(data.summary.ingresos_mes), color: '#22c55e' },
                            { nombre: 'Gastos', valor: Number(data.summary.gastos_mes), color: '#ef4444' }
                          ].filter(d => d.valor > 0)} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={90} 
                          outerRadius={125} 
                          paddingAngle={5} 
                          dataKey="valor" 
                          nameKey="nombre"
                          stroke="none"
                          isAnimationActive={false}
                        >
                          <Label 
                            value={formatCurrency(data.summary.balance_total)} 
                            position="center" 
                            fill="#ffffff" 
                            style={{ fontSize: '22px', fontWeight: 'bold' }} 
                            className="drop-shadow-md"
                          />
                          {[
                            { nombre: 'Ingresos', valor: Number(data.summary.ingresos_mes), color: '#22c55e' },
                            { nombre: 'Gastos', valor: Number(data.summary.gastos_mes), color: '#ef4444' }
                          ].filter(d => d.valor > 0).map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip 
                            formatter={(value: any) => formatCurrency(Number(value))} 
                            contentStyle={{ backgroundColor: '#121212', borderColor: '#2e2e2e', borderRadius: '16px', color: '#fff', fontWeight: 'bold' }} 
                            itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                {/* Labels Legend */}
                {Number(data.summary.ingresos_mes) > 0 || Number(data.summary.gastos_mes) > 0 ? (
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2 bg-[#1C542D] bg-opacity-20 px-4 py-2 rounded-full border border-green-900">
                            <div className="w-4 h-4 rounded-full bg-[#22c55e]"></div>
                            <span className="text-sm font-bold text-green-400">Ingresos: {(Number(data.summary.ingresos_mes) / (Number(data.summary.ingresos_mes) + Number(data.summary.gastos_mes)) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#451a1a] bg-opacity-20 px-4 py-2 rounded-full border border-red-900">
                            <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
                            <span className="text-sm font-bold text-red-400">Gastos: {(Number(data.summary.gastos_mes) / (Number(data.summary.ingresos_mes) + Number(data.summary.gastos_mes)) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                ) : null}
              </div>

              <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Últimos Movimientos</h3>
                </div>
                <div className="space-y-4">
                  {data.ultimos_movimientos.length === 0 ? (
                      <p className="text-gray-500 italic text-center py-10">No hay movimientos. Agrega uno.</p>
                  ) : (
                      data.ultimos_movimientos.slice(0, 5).map((mov) => (
                        <div key={mov.id} className="flex items-center justify-between bg-[#121212] p-4 rounded-2xl border border-[#2e2e2e] hover:border-gray-700 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl flex-shrink-0 transition-transform group-hover:scale-110 ${mov.tipo === 'ingreso' ? 'bg-[#1C542D] text-[#22c55e]' : 'bg-[#451a1a] text-[#ef4444]'}`}>
                              {getCategoryIcon(mov.categoria)}
                            </div>
                            <div>
                              <p className="text-base font-bold text-white">{mov.descripcion}</p>
                              <p className="text-xs text-gray-400 font-medium">
                                <span className={`mr-2 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${getCategoryBadgeClass(mov.tipo)}`}>
                                    {mov.categoria}
                                </span>
                                {mov.fecha}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`font-extrabold text-lg ${mov.tipo === 'ingreso' ? 'text-[#22c55e]' : 'text-white'}`}>
                                {mov.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(mov.monto)}
                            </span>
                            <button 
                                onClick={() => handleDeleteMovement(mov.id)}
                                className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 & 3: INGRESOS y GASTOS */}
        {(currentTab === 'ingresos' || currentTab === 'gastos') && (
          <div className="animate-in fade-in duration-300 slide-in-from-bottom-4">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div>
                <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Registro de {currentTab === 'ingresos' ? 'Ingresos' : 'Gastos'}</h2>
                <p className="text-gray-400 text-lg">Historial completo detallado.</p>
              </div>
              <button 
                onClick={() => openMovementModal(currentTab === 'ingresos' ? 'ingreso' : 'gasto')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 text-white shadow-xl active:scale-95 ${currentTab === 'ingresos' ? 'bg-[#1C542D] hover:bg-[#22c55e] hover:text-[#121212] shadow-green-900/20' : 'bg-[#451a1a] hover:bg-red-600 shadow-red-900/20'}`}
              >
                <Plus size={20} /> Añadir {currentTab === 'ingresos' ? 'ingreso' : 'gasto'}
              </button>
            </header>

            <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-3xl p-8 shadow-2xl">
               <div className="space-y-4">
                  {movementsFiltered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        {currentTab === 'ingresos' ? <TrendingUp size={64} className="opacity-20 mb-4"/> : <TrendingDown size={64} className="opacity-20 mb-4"/>}
                        <p className="text-lg">Aún no hay registros en la categoría de {currentTab}.</p>
                    </div>
                  ) : (
                    movementsFiltered.map((mov) => (
                      <div key={mov.id} className="flex items-center justify-between bg-[#121212] p-5 rounded-2xl border border-[#2e2e2e] hover:border-gray-700 transition-colors group">
                        <div className="flex items-center gap-5">
                          <div className={`p-4 rounded-xl flex-shrink-0 shadow-inner transition-transform group-hover:scale-110 ${currentTab === 'ingresos' ? 'bg-[#1C542D] text-[#22c55e]' : 'bg-[#451a1a] text-[#ef4444]'}`}>
                            {getCategoryIcon(mov.categoria)}
                          </div>
                          <div>
                            <p className="text-xl font-extrabold text-white">{mov.descripcion}</p>
                            <p className="text-sm text-gray-400 font-medium mt-1">
                                <span className="bg-[#1e1e1e] border border-[#2e2e2e] text-gray-300 px-2 py-0.5 rounded text-xs uppercase tracking-wider mr-2">
                                    {mov.categoria}
                                </span>
                                Registrado el {mov.fecha}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className={`font-extrabold text-2xl ${currentTab === 'ingresos' ? 'text-[#22c55e]' : 'text-white'}`}>
                                {currentTab === 'ingresos' ? '+' : '-'}{formatCurrency(mov.monto)}
                            </span>
                            <button 
                                onClick={() => handleDeleteMovement(mov.id)}
                                className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={22} />
                            </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
            </div>
          </div>
        )}

        {/* TAB 4: METAS */}
        {currentTab === 'metas' && (
          <div className="animate-in fade-in duration-300 slide-in-from-bottom-4">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div>
                <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Tus Metas de Ahorro</h2>
                <p className="text-gray-400 text-lg">Define un horizonte para tus ahorros.</p>
              </div>
              <button 
                onClick={() => setIsGoalModalOpen(true)}
                className="flex items-center gap-2 bg-[#f59e0b] hover:bg-yellow-400 hover:text-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-xl shadow-yellow-900/20 active:scale-95"
              >
                <Plus size={20} /> Definir Objetivo
              </button>
            </header>
            
            {/* Calculadora de Ahorro Inteligente Avanzada */}
            <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-3xl p-8 mb-10 shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#f59e0b] opacity-5 pointer-events-none"></div>
                <div className="flex flex-col lg:flex-row justify-between items-start gap-8 relative z-10">
                    <div className="max-w-md">
                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                            <Target className="text-[#f59e0b]" /> Planificador de Inversión
                        </h3>
                        <p className="text-gray-400 mb-6">Optimiza cómo crece tu dinero. Elige un porcentaje o un monto exacto y decide cómo distribuirlo entre tus metas.</p>
                        
                        <div className="flex gap-2 p-1 bg-[#121212] rounded-xl border border-[#2e2e2e] mb-4">
                            <button 
                                onClick={() => setSavingsDistributionMode('equitativa')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${savingsDistributionMode === 'equitativa' ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:text-white'}`}
                            >
                                Equitativa
                            </button>
                            <button 
                                onClick={() => setSavingsDistributionMode('prioridad')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${savingsDistributionMode === 'prioridad' ? 'bg-[#f59e0b] text-white shadow-lg shadow-yellow-900/20' : 'text-gray-500 hover:text-white'}`}
                            >
                                Por Prioridad
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">
                            {savingsDistributionMode === 'equitativa' 
                                ? "* Divide el ahorro en partes iguales entre todas tus metas." 
                                : "* Prioriza completar las metas más cercanas a su fecha límite."}
                        </p>
                    </div>
                    
                    <div className="flex-1 w-full bg-[#121212] p-6 rounded-2xl border border-[#2e2e2e]">
                        <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
                            <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Porcentaje de Balance</span>
                                    <span className="text-[#f59e0b] font-extrabold">{savingsPercentage}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" max="100" 
                                    value={savingsPercentage} 
                                    onChange={(e) => {
                                        setSavingsPercentage(parseInt(e.target.value));
                                        setManualSavingsAmount('');
                                    }}
                                    className="w-full h-1.5 bg-[#1e1e1e] rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
                                />
                            </div>
                            <div className="w-full sm:w-48">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">O monto exacto</span>
                                </div>
                                <input 
                                    type="number" 
                                    placeholder="Monto $"
                                    value={manualSavingsAmount}
                                    onChange={(e) => {
                                        setManualSavingsAmount(e.target.value);
                                        setSavingsPercentage(0);
                                    }}
                                    className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f59e0b]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#2e2e2e]">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Balance Disponible</p>
                                <p className="text-md font-bold text-white">{formatCurrency(data.summary.balance_total)}</p>
                            </div>
                            <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#f59e0b] bg-opacity-10">
                                <p className="text-[10px] text-[#f59e0b] uppercase font-bold mb-1">Total a Invertir</p>
                                <p className="text-md font-bold text-[#f59e0b]">
                                    {formatCurrency(manualSavingsAmount ? Number(manualSavingsAmount) : (Number(data.summary.balance_total) * savingsPercentage / 100))}
                                </p>
                            </div>
                            <button 
                                onClick={async () => {
                                    const totalToDistribute = manualSavingsAmount ? Number(manualSavingsAmount) : (Number(data.summary.balance_total) * savingsPercentage / 100);
                                    if (totalToDistribute <= 0) return;
                                    
                                    // Calcular alocación
                                    const allocations: {id_meta: number, monto: number}[] = [];
                                    const activeMetas = data.metas.filter(m => m.ahorro_actual < m.monto_objetivo);
                                    
                                    if (savingsDistributionMode === 'equitativa') {
                                        const perMeta = totalToDistribute / activeMetas.length;
                                        activeMetas.forEach(m => allocations.push({ id_meta: parseInt(m.id), monto: perMeta }));
                                    } else {
                                        // Prioridad: por fecha límite (asumiendo formato ISO en backend)
                                        let remaining = totalToDistribute;
                                        const sorted = [...activeMetas].sort((a, b) => {
                                            const da = a.fecha_limite ? new Date(a.fecha_limite).getTime() : Infinity;
                                            const db = b.fecha_limite ? new Date(b.fecha_limite).getTime() : Infinity;
                                            return da - db;
                                        });
                                        
                                        for (const m of sorted) {
                                            if (remaining <= 0) break;
                                            const needed = m.monto_objetivo - m.ahorro_actual;
                                            const toGive = Math.min(remaining, needed);
                                            allocations.push({ id_meta: parseInt(m.id), monto: toGive });
                                            remaining -= toGive;
                                        }
                                        // Si sobra después de llenar prioridades, repartir equitativamente lo que sobra
                                        if (remaining > 0) {
                                            const extra = remaining / activeMetas.length;
                                            allocations.forEach(a => a.monto += extra);
                                        }
                                    }
                                    
                                    if (confirm(`¿Confirmas la distribución de ${formatCurrency(totalToDistribute)} en ${allocations.length} metas?`)) {
                                        try {
                                            const response = await fetch('http://localhost:8000/api/v1/goals/bulk-allocate/', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(allocations)
                                            });
                                            if (response.ok) {
                                                setShowSuccessFeedback("¡Inversión exitosa! Tus metas están más cerca.");
                                                await fetchData();
                                                setTimeout(() => setShowSuccessFeedback(null), 4000);
                                            }
                                        } catch(e) { console.error(e); }
                                    }
                                }}
                                className="bg-[#f59e0b] hover:bg-yellow-500 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-yellow-900/20 flex items-center justify-center gap-2"
                            >
                                <PlusCircle size={18} /> Ejecutar Plan
                            </button>
                        </div>
                    </div>
                </div>
                
                <AnimatePresence>
                    {showSuccessFeedback && (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#22c55e] text-white px-6 py-2 rounded-full font-bold text-sm shadow-xl z-20 flex items-center gap-2"
                        >
                            <TrendingUp size={16} /> {showSuccessFeedback}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.metas.length === 0 ? (
                <div className="col-span-full border-2 border-dashed border-[#2e2e2e] rounded-3xl p-20 flex flex-col items-center justify-center text-gray-500">
                    <Target size={64} className="opacity-20 mb-4" />
                    <p className="text-lg">No has establecido ninguna meta financiera aún.</p>
                </div>
              ) : (
                data.metas.map((meta) => {
                  // Calcular proyección dinámica para esta tarjeta específica
                  const getProjectedForMeta = () => {
                    const totalToDistribute = manualSavingsAmount ? Number(manualSavingsAmount) : (Number(data.summary.balance_total) * savingsPercentage / 100);
                    if (totalToDistribute <= 0) return 0;
                    
                    const activeMetas = data.metas.filter(m => m.ahorro_actual < m.monto_objetivo);
                    if (activeMetas.length === 0) return 0;

                    if (savingsDistributionMode === 'equitativa') {
                        return totalToDistribute / activeMetas.length;
                    } else {
                        let remaining = totalToDistribute;
                        const sorted = [...activeMetas].sort((a, b) => {
                            const da = a.fecha_limite ? new Date(a.fecha_limite).getTime() : Infinity;
                            const db = b.fecha_limite ? new Date(b.fecha_limite).getTime() : Infinity;
                            return da - db;
                        });
                        
                        let metaAmount = 0;
                        for (const m of sorted) {
                            if (remaining <= 0) break;
                            const needed = m.monto_objetivo - m.ahorro_actual;
                            const toGive = Math.min(remaining, needed);
                            if (m.id === meta.id) metaAmount = toGive;
                            remaining -= toGive;
                        }
                        if (remaining > 0) {
                            metaAmount += remaining / activeMetas.length;
                        }
                        return metaAmount;
                    }
                  };

                  const projectedAmount = getProjectedForMeta();
                  
                  return (
                    <div key={meta.id} className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-3xl p-6 shadow-xl hover:border-[#f59e0b] transition-colors relative group overflow-hidden">
                       <div className="absolute -right-6 -top-6 text-[#f59e0b] opacity-5 group-hover:scale-125 transition-transform duration-500 pointer-events-none">
                           <Target size={150} />
                       </div>
                      <MetaProgress 
                        meta={meta} 
                        onDelete={handleDeleteGoal} 
                        projectedAmount={projectedAmount} 
                      />
                      <button 
                        onClick={async () => {
                            if (confirm(`¿Quieres abonar ${formatCurrency(projectedAmount)} a esta meta?`)) {
                                try {
                                    const response = await fetch(`http://localhost:8000/api/v1/goals/${meta.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ monto_adicional: projectedAmount })
                                    });
                                    if (response.ok) {
                                        setShowSuccessFeedback(`¡Abono de ${formatCurrency(projectedAmount)} realizado!`);
                                        await fetchData();
                                        setTimeout(() => setShowSuccessFeedback(null), 4000);
                                    }
                                } catch(e) { console.error(e); }
                            }
                        }}
                        className={`w-full mt-4 py-3 border transition-all rounded-xl font-bold uppercase tracking-wider text-sm shadow-md ${projectedAmount > 0 ? 'bg-[#f59e0b] text-black border-[#f59e0b] hover:bg-yellow-500' : 'bg-[#121212] border-[#2e2e2e] text-gray-500 cursor-not-allowed'}`}
                        disabled={projectedAmount <= 0}
                      >
                        {projectedAmount > 0 ? 'Abonar Plan' : 'Sin Alocación'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PRESUPUESTOS */}
        {currentTab === 'presupuestos' && (
          <div className="animate-in fade-in duration-300 slide-in-from-bottom-4">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div>
                <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Manejo de Presupuestos</h2>
                <p className="text-gray-400 text-lg">Control estricto de fuga de capital.</p>
              </div>
              <button 
                onClick={() => setIsBudgetModalOpen(true)}
                className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-purple-500 hover:text-white text-white px-6 py-3 rounded-xl font-bold transition-all shadow-xl shadow-purple-900/20 active:scale-95"
              >
                <Wallet size={20} /> Nuevo Límite Escudo
              </button>
            </header>

            <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.presupuestos.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500">
                      <Wallet size={64} className="opacity-20 mb-4" />
                      <p className="text-lg">Tus finanzas no tienen barreras activas actualmente.</p>
                  </div>
                ) : (
                  data.presupuestos.map(presupuesto => (
                    <PresupuestoProgress key={presupuesto.id} presupuesto={presupuesto} onDelete={handleDeleteBudget} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL 1: ADD MOVEMENT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition bg-[#121212] p-2 rounded-full border border-[#2e2e2e]">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-extrabold text-white mb-6">Registrar Transacción</h3>
            <form onSubmit={handleAddMovement} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Categoría Selecta</label>
                <select required value={formData.id_categoria} onChange={(e) => setFormData({...formData, id_categoria: e.target.value})} className="w-full bg-[#121212] border-2 border-[#2e2e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6] hover:border-gray-600 transition-colors appearance-none font-medium">
                  <option value="" disabled>Elige la naturaleza de la cuenta</option>
                  {categoriesFiltered.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.tipo === 'ingreso' ? '🟢' : '🔴'} {cat.nombre_categoria}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Monto Cifrado ($)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#3b82f6] transition-colors">
                    <span className="text-xl font-bold">$</span>
                  </div>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={formatAmountForDisplay(formData.monto)}
                    onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        setFormData({...formData, monto: rawValue});
                    }}
                    className="w-full bg-[#121212] border-2 border-[#2e2e2e] focus:border-[#3b82f6] rounded-2xl py-5 pl-10 pr-6 text-white text-3xl font-black outline-none transition-all placeholder:text-gray-800"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Concepto Breve</label>
                <input type="text" required value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-[#121212] border-2 border-[#2e2e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6] hover:border-gray-600 transition-colors placeholder-gray-700 font-medium" placeholder="Descripción del movimiento..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Fecha del Registro</label>
                <input type="date" required value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} className="w-full bg-[#121212] border-2 border-[#2e2e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6] hover:border-gray-600 transition-colors [color-scheme:dark] font-medium" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white py-4 rounded-xl font-extrabold text-lg mt-6 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-blue-900/30">
                {isSubmitting ? 'Encriptando...' : 'Confirmar Envio'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD GOAL --- */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
            <button onClick={() => setIsGoalModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition bg-[#121212] p-2 rounded-full border border-[#2e2e2e]"><X size={20} /></button>
            <h3 className="text-2xl font-extrabold text-white mb-6">Nuevo Proyecto</h3>
            <form onSubmit={handleAddGoal} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Título de la Meta</label>
                <input type="text" required value={goalFormData.nombre} onChange={(e) => setGoalFormData({...goalFormData, nombre: e.target.value})} className="w-full bg-[#121212] border-2 border-[#2e2e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b]" placeholder="Mi nueva Laptop..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Monto a Reunir ($)</label>
                <input type="number" step="0.01" required value={goalFormData.objetivo} onChange={(e) => setGoalFormData({...goalFormData, objetivo: e.target.value})} className="w-full bg-[#121212] border-2 border-[#2e2e2e] rounded-xl px-4 py-3 text-[20px] font-bold text-white focus:outline-none focus:border-[#f59e0b]" placeholder="5000.00" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Fecha de Expiración</label>
                <input type="date" required value={goalFormData.fecha} onChange={(e) => setGoalFormData({...goalFormData, fecha: e.target.value})} className="w-full bg-[#121212] border-2 border-[#2e2e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] [color-scheme:dark]" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white py-4 rounded-xl font-extrabold text-lg mt-6 shadow-lg shadow-yellow-900/30">
                {isSubmitting ? 'Trazando Ruta...' : 'Establecer Objetivo'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ADD BUDGET --- */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
            <button onClick={() => setIsBudgetModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition bg-[#121212] p-2 rounded-full border border-[#2e2e2e]"><X size={20} /></button>
            <h3 className="text-2xl font-extrabold text-white mb-6">Escudo Financiero</h3>
            <form onSubmit={handleAddBudget} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Categoría A Bloquear</label>
                <select required value={budgetFormData.id_categoria} onChange={(e) => setBudgetFormData({...budgetFormData, id_categoria: e.target.value})} className="w-full bg-[#121212] border-2 border-[#2e2e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8b5cf6] appearance-none font-medium">
                  <option value="" disabled>Selecciona la llave de gasto</option>
                  {categories.filter(c => c.tipo === 'gasto').map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>🔴 {cat.nombre_categoria}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Límite de Capital ($)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#8b5cf6] transition-colors">
                    <span className="text-xl font-bold">$</span>
                  </div>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={formatAmountForDisplay(budgetFormData.limite)}
                    onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        setBudgetFormData({...budgetFormData, limite: rawValue});
                    }}
                    className="w-full bg-[#121212] border-2 border-[#2e2e2e] focus:border-[#8b5cf6] rounded-2xl py-5 pl-10 pr-6 text-white text-3xl font-black outline-none transition-all placeholder:text-gray-800"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Temporalidad (Mes/Año)</label>
                <input type="month" required value={budgetFormData.fecha_mes} onChange={(e) => setBudgetFormData({...budgetFormData, fecha_mes: e.target.value})} className="w-full bg-[#121212] border-2 border-[#2e2e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8b5cf6] [color-scheme:dark]" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white py-4 rounded-xl font-extrabold text-lg mt-6 shadow-lg shadow-purple-900/30">
                {isSubmitting ? 'Blindando...' : 'Fijar Bóveda'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
