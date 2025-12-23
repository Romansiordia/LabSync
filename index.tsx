
import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, 
  Users, 
  Beaker, 
  ClipboardList, 
  User as UserIcon, 
  TrendingUp, 
  Plus, 
  Search, 
  DollarSign, 
  CheckCircle, 
  Trash2,
  Calendar,
  X,
  Clock,
  MapPin, 
  User,
  Mail,
  Phone,
  Edit2,
  Stethoscope,
  Activity,
  Layers,
  Package,
  FileText,
  Tag,
  Boxes,
  Truck,
  Globe,
  Hash,
  Settings,
  Zap,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  ShieldAlert,
  CheckSquare,
  Square,
  FlaskConical,
  Save,
  Printer,
  Download,
  CloudDownload,
  Lock,
  Info,
  ChevronRight,
  LogOut,
  KeyRound,
  CloudSync
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area
} from 'recharts';

// --- Tipos ---
type Status = 'Pending' | 'In Progress' | 'Completed';
type Priority = 'Normal' | 'Urgent' | 'Critical';
type UserRole = 'Admin' | 'Technician' | 'Reception';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface Client {
  id: string;
  name: string;        
  address: string;     
  email: string;       
  phone: string;       
  contactName: string; 
}

interface Technician {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
}

interface AnalysisType {
  id: string;
  name: string;
  baseCost: number;
  unit: string;
}

interface AnalysisRecord {
  id: string;
  sampleId: string;      
  sampleName: string;    
  product: string;       
  origin: string;        
  provider: string;      
  batch: string;         
  clientId: string;
  technicianId: string;
  analysisIds: string[]; 
  results?: Record<string, string>; 
  receptionDate: string;
  deliveryDate: string;
  priority: Priority;
  cost: number;
  status: Status;
  comments?: string;
}

const BASE_PRODUCT_LIST = [
  "Alimento Wean Up Fase 0", "Alimento Wean Up Fase 1", "Alimento Wean Up Fase 2", "Alimento Wean Up Fase 3", "Alimento Wean Up Fase 4",
  "Alimento Apliwrean Fase 0", "Alimento Apliwrean Fase 1", "Alimento Apliwrean Fase 2", "Alimento Apliwrean Fase 3",
  "Sorgo", "Maíz", "Trigo", "Arroz", "Cebada", "Avena", "Linaza", "Cartamo", "Girasol", "Cacahuate",
  "Cascarilla de Arroz", "Cascarilla de Soya", "Cascarilla de Avena",
  "Concentrado de Soya 65%", "Harina de Pescado", "Harina de Carne", "Harina de Hueso", "Harina de Galleta",
  "Suero de Leche Desproteinizado", "Aceite de Soya", "Pasta de Soya", "Pasta de Canola", "Pasta de Ajonjolí",
  "Carbonato de Calcio Fino", "Carbonato de Calcio Grueso", "Sal", "Ortofosfato",
  "Alimento Youpig 1", "Alimento Youpig 2", "Alimento Youpig 3", "Alimento Youpig Baby",
  "TMR Inicio", "TMR Intermedia", "TMR Final", "TMR Engorda",
  "Hemoglobina Bovina", "Plasma Bovino", "Plasma Porcino",
  "Pollinaza", "Urea 46%", "Zeolita"
];

const INITIAL_CLIENTS: Client[] = [{ id: 'c1', name: 'Nutrición Animal del Norte', address: 'Zona Industrial 5', email: 'info@nutrianimal.com', phone: '555-0101', contactName: 'Ing. David Luna' }];
const INITIAL_TECHS: Technician[] = [{ id: 't1', name: 'Dra. Elena Ramos', specialty: 'Bromatología', email: 'elena.ramos@labsync.com', phone: '555-9001' }];

const INITIAL_TYPES: AnalysisType[] = [
  { id: 'at1', name: 'Proteína', baseCost: 150.0, unit: '%' },
  { id: 'at2', name: 'Humedad', baseCost: 50.0, unit: '%' },
  { id: 'at3', name: 'Grasa', baseCost: 180.0, unit: '%' },
  { id: 'at4', name: 'Fibra', baseCost: 120.0, unit: '%' },
  { id: 'at5', name: 'Ceniza', baseCost: 80.0, unit: '%' },
  { id: 'at6', name: 'Almidón', baseCost: 200.0, unit: '%' },
  { id: 'at7', name: 'Aflatoxina', baseCost: 350.0, unit: 'ppb' },
  { id: 'at8', name: 'Ocratoxina', baseCost: 350.0, unit: 'ppb' },
  { id: 'at9', name: 'Zearalenona', baseCost: 380.0, unit: 'ppb' },
  { id: 'at10', name: 'Fumonisina', baseCost: 380.0, unit: 'ppm' },
  { id: 'at11', name: 'Vomitoxina', baseCost: 350.0, unit: 'ppm' },
  { id: 'at12', name: 'FDA', baseCost: 140.0, unit: '%' },
  { id: 'at13', name: 'FDN', baseCost: 140.0, unit: '%' },
  { id: 'at14', name: 'Calcio', baseCost: 100.0, unit: '%' },
  { id: 'at15', name: 'Fósforo', baseCost: 110.0, unit: '%' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('lab_current_user');
    return saved ? (JSON.parse(saved) as AuthUser) : null;
  });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'techs' | 'types' | 'analysis' | 'settings'>('dashboard');
  
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showTechModal, setShowTechModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  
  const [clients, setClients] = useState<Client[]>(() => (JSON.parse(localStorage.getItem('lab_clients') || JSON.stringify(INITIAL_CLIENTS)) as Client[]));
  const [techs, setTechs] = useState<Technician[]>(() => (JSON.parse(localStorage.getItem('lab_techs') || JSON.stringify(INITIAL_TECHS)) as Technician[]));
  const [types, setTypes] = useState<AnalysisType[]>(() => (JSON.parse(localStorage.getItem('lab_types') || JSON.stringify(INITIAL_TYPES)) as AnalysisType[]));
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>(() => (JSON.parse(localStorage.getItem('lab_analyses') || '[]') as AnalysisRecord[]));
  const [products, setProducts] = useState<string[]>(() => (JSON.parse(localStorage.getItem('lab_products') || JSON.stringify(BASE_PRODUCT_LIST)) as string[]));
  
  const [selectedRecordForResults, setSelectedRecordForResults] = useState<AnalysisRecord | null>(null);
  const [selectedRecordForReport, setSelectedRecordForReport] = useState<AnalysisRecord | null>(null);
  const [currentResults, setCurrentResults] = useState<Record<string, string>>({});

  const [newAnalysis, setNewAnalysis] = useState<Partial<AnalysisRecord>>({
    priority: 'Normal',
    status: 'Pending',
    product: BASE_PRODUCT_LIST[0] || '',
    origin: '',
    provider: '',
    batch: '',
    analysisIds: [], 
    receptionDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    cost: 0
  });

  // DO add explicit string typing to googleUrl state
  const [googleUrl, setGoogleUrl] = useState<string>(() => localStorage.getItem('lab_google_url') || '');
  // DO add explicit boolean typing to isSyncing state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  // DO add explicit string typing to lastSync state
  const [lastSync, setLastSync] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('lab_clients', JSON.stringify(clients));
    localStorage.setItem('lab_techs', JSON.stringify(techs));
    localStorage.setItem('lab_types', JSON.stringify(types));
    localStorage.setItem('lab_analyses', JSON.stringify(analyses));
    localStorage.setItem('lab_products', JSON.stringify(products));
    localStorage.setItem('lab_google_url', googleUrl);
    if (currentUser) {
      localStorage.setItem('lab_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('lab_current_user');
    }
  }, [clients, techs, types, analyses, products, googleUrl, currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    try {
      if (googleUrl) {
         try {
            await fetch(googleUrl, {
               method: 'POST',
               mode: 'no-cors',
               body: JSON.stringify({ action: 'login', email: loginForm.email, password: loginForm.password })
            });
         } catch (err) { console.error("Error validando con Google", err); }
      }

      let mockUser: AuthUser | null = null;
      if (loginForm.email === 'admin@labsync.com' && loginForm.password === 'admin123') {
        mockUser = { id: 'u1', name: 'Administrador Lab', email: 'admin@labsync.com', role: 'Admin' };
      } else if (loginForm.email === 'tecnico@labsync.com' && loginForm.password === 'tech123') {
        mockUser = { id: 'u2', name: 'Técnico Analista', email: 'tecnico@labsync.com', role: 'Technician' };
      } else if (loginForm.email === 'recepcion@labsync.com' && loginForm.password === 'rec123') {
        mockUser = { id: 'u3', name: 'Recepción Central', email: 'recepcion@labsync.com', role: 'Reception' };
      }

      if (mockUser) {
        setCurrentUser(mockUser);
        setActiveTab('dashboard');
      } else {
        alert("Credenciales incorrectas.");
      }
    } catch (error) {
      alert("Error en el servidor de autenticación.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const syncWithGoogle = async (payload: any) => {
    if (!googleUrl) return;
    setIsSyncing(true);
    console.log("Sincronizando con Google Payload:", payload);
    try {
      await fetch(googleUrl, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: JSON.stringify(payload) 
      });
      setLastSync(new Date().toLocaleTimeString());
    } catch (error) { 
      console.error("Error sincronizando", error); 
    } finally { 
      setIsSyncing(false); 
    }
  };

  const stats = useMemo(() => {
    const totalRevenue = analyses.reduce((acc, curr) => acc + (curr.cost || 0), 0);
    const completedTests = analyses.filter(a => a.status === 'Completed').length;
    const clientStats = clients.map(c => ({
      name: c.name,
      value: analyses.filter(a => a.clientId === c.id).reduce((acc, curr) => acc + (curr.cost || 0), 0)
    })).filter(s => s.value > 0);
    const techStats = techs.map(t => ({
      name: t.name,
      tests: analyses.filter(a => a.technicianId === t.id).length
    }));
    return { totalRevenue, completedTests, clientStats, techStats };
  }, [analyses, clients, techs]);

  const generateNextFolio = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `${year}${month}`;
    const currentMonthAnalyses = analyses
      .filter(a => a.sampleId && a.sampleId.startsWith(prefix))
      .map(a => parseInt(a.sampleId.substring(6)))
      .filter(num => !isNaN(num));
    const nextNumber = currentMonthAnalyses.length > 0 ? Math.max(...currentMonthAnalyses) + 1 : 1;
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  };

  const toggleAnalysis = (id: string) => {
    setNewAnalysis(prev => {
      const current = prev.analysisIds || [];
      const updated = current.includes(id) 
        ? current.filter(i => i !== id) 
        : [...current, id];
      
      const totalCost = updated.reduce((acc, analysisId) => {
        const type = types.find(t => t.id === analysisId);
        return acc + (type?.baseCost || 0);
      }, 0);

      return { ...prev, analysisIds: updated, cost: totalCost };
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentAnalysisIds = newAnalysis.analysisIds || [];
    const clientObj = clients.find(c => c.id === newAnalysis.clientId);
    const techObj = techs.find(t => t.id === newAnalysis.technicianId);
    
    const record = { 
      ...newAnalysis, 
      id: `a${Date.now()}`, 
      status: 'Pending', 
      results: {}, 
      comments: "" 
    } as AnalysisRecord;
    
    setAnalyses(prev => [record, ...prev]);
    setShowAnalysisModal(false);

    const analysisNames = currentAnalysisIds
      .map(id => types.find(t => t.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    syncWithGoogle({
      action: 'create',
      sampleId: record.sampleId,
      receptionDate: record.receptionDate,
      deliveryDate: record.deliveryDate,
      sampleName: record.sampleName,
      product: record.product,
      clientName: clientObj?.name || 'No definido',
      techName: techObj?.name || 'No asignado',
      priority: record.priority,
      status: record.status,
      cost: record.cost,
      analisis: analysisNames,
      origin: record.origin,
      provider: record.provider,
      batch: record.batch
    });
  };

  const handleResultsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForResults) return;

    const updated = { 
      ...selectedRecordForResults, 
      results: currentResults, 
      status: 'Completed' as Status 
    };

    setAnalyses(prev => prev.map(a => a.id === updated.id ? updated : a));
    setShowResultsModal(false);

    const detailedResults: Record<string, string> = {};
    Object.entries(currentResults).forEach(([id, val]) => {
      const type = types.find(t => t.id === id);
      if (type) {
        detailedResults[type.name] = val;
      }
    });

    syncWithGoogle({
      action: 'update_results',
      sampleId: updated.sampleId,
      status: 'Completed',
      detailedResults: detailedResults
    });
  };

  const canSee = (tab: typeof activeTab) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    if (currentUser.role === 'Technician') return ['dashboard', 'analysis'].includes(tab);
    if (currentUser.role === 'Reception') return ['dashboard', 'analysis', 'clients'].includes(tab);
    return false;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
           <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]"></div>
           <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        </div>
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-white/20 animate-in">
           <div className="p-10 pt-12 text-center bg-slate-50 border-b border-slate-100">
              <div className="inline-flex items-center justify-center bg-indigo-600 p-4 rounded-[1.5rem] text-white shadow-xl mb-6">
                 <Beaker size={40} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">LabSync <span className="text-indigo-600">Pro</span></h1>
              <p className="text-slate-500 mt-2 font-medium">Gestión Inteligente de Laboratorios</p>
           </div>
           <form onSubmit={handleLogin} className="p-10 space-y-6">
              <div className="space-y-4">
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="email" required placeholder="Correo Electrónico" className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700" value={loginForm.email} onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} />
                 </div>
                 <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="password" required placeholder="Contraseña" className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} />
                 </div>
              </div>
              <button type="submit" disabled={isLoginLoading} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                {isLoginLoading ? <RefreshCw className="animate-spin" size={20}/> : <ChevronRight size={20}/>}
                {isLoginLoading ? 'Iniciando...' : 'Entrar al Sistema'}
              </button>
           </form>
        </div>
      </div>
    );
  }

  const renderSidebarItem = (id: typeof activeTab, icon: React.ReactNode, label: string) => {
    if (!canSee(id)) return null;
    return (
      <button onClick={() => setActiveTab(id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        {icon} <span className="font-bold text-sm">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 flex-1">
          <div className="flex items-center space-x-3 text-white mb-10">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20"><Beaker size={24} /></div>
            <span className="text-xl font-black tracking-tight">LabSync <span className="text-indigo-400">Pro</span></span>
          </div>
          <nav className="space-y-2">
            {renderSidebarItem('dashboard', <LayoutDashboard size={20} />, 'Dashboard')}
            {renderSidebarItem('analysis', <ClipboardList size={20} />, 'Bitácora')}
            {renderSidebarItem('clients', <Users size={20} />, 'Clientes')}
            {renderSidebarItem('techs', <UserIcon size={20} />, 'Técnicos')}
            {renderSidebarItem('types', <Boxes size={20} />, 'Catálogo')}
            <div className="pt-6 border-t border-slate-800/50 mt-6">
               {renderSidebarItem('settings', <Settings size={20} />, 'Configuración')}
            </div>
          </nav>
        </div>
        <div className="p-4 bg-slate-800/50 border-t border-slate-800">
           <div className="flex items-center gap-3 px-2 mb-3">
              <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400"><UserIcon size={18}/></div>
              <div className="min-w-0">
                 <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                 <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${currentUser.role === 'Admin' ? 'bg-indigo-600 text-white' : currentUser.role === 'Technician' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>{currentUser.role}</span>
              </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><LogOut size={14}/> Cerrar Sesión</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
             <h2 className="text-2xl font-black text-slate-800 capitalize tracking-tight">{activeTab}</h2>
             {isSyncing && <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 animate-pulse"><RefreshCw size={12} className="animate-spin" /><span className="text-[10px] font-bold">Sincronizando...</span></div>}
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Última Sincronización</p>
                {/* DO fix: Explicitly cast lastSync to string to avoid unknown type error on line 375 */}
                <p className="text-xs font-black text-slate-600">{(lastSync as string) || '--:--:--'}</p>
             </div>
             <button onClick={() => syncWithGoogle({action: 'heartbeat'})} className={`p-3 rounded-2xl border transition-all ${isSyncing ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200'}`}>
                <CloudSync size={24} />
             </button>
          </div>
        </header>

        <div className="p-10 overflow-y-auto flex-1">
          {activeTab === 'dashboard' && (
             <div className="space-y-8 animate-in">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { label: 'Facturación Acum.', value: `$${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="text-green-600"/>, bg: 'bg-green-50' },
                 { label: 'Muestras Totales', value: analyses.length, icon: <ClipboardList className="text-indigo-600"/>, bg: 'bg-indigo-50' },
                 { label: 'Ingresos Pendientes', value: analyses.filter(a => a.status === 'Pending').length, icon: <Clock className="text-orange-600"/>, bg: 'bg-orange-50' },
                 { label: 'Eficiencia Lab', value: `${analyses.length > 0 ? Math.round((stats.completedTests/analyses.length)*100) : 0}%`, icon: <CheckCircle className="text-blue-600"/>, bg: 'bg-blue-50' },
               ].map((card, i) => (
                 <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                   <div className="flex justify-between items-start mb-4"><div className={`${card.bg} p-3 rounded-2xl`}>{card.icon}</div></div>
                   <p className="text-slate-500 text-xs font-black uppercase tracking-wider">{card.label}</p>
                   <h3 className="text-3xl font-black text-slate-800 mt-2">{card.value}</h3>
                 </div>
               ))}
             </div>
             {['Admin', 'Reception'].includes(currentUser.role) && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-3 mb-8"><TrendingUp size={22} className="text-indigo-600" /> Facturación por Cliente</h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.clientStats}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} /><Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} /><Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={50} /></BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-800 mb-8 text-center flex items-center justify-center gap-3"><Activity size={22} className="text-emerald-500" /> Carga Laboral de Analistas</h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.techStats}><defs><linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} /><Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} /><Area type="monotone" dataKey="tests" stroke="#10b981" fillOpacity={1} fill="url(#colorTests)" strokeWidth={4} /></AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
             )}
           </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6 animate-in">
              <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Bitácora de Análisis</h3>
                  <p className="text-slate-500 text-sm font-medium">Gestión y seguimiento de muestras activas.</p>
                </div>
                {['Admin', 'Reception'].includes(currentUser.role) && (
                  <button onClick={() => { setNewAnalysis({...newAnalysis, sampleId: generateNextFolio(), analysisIds: [], cost: 0}); setShowAnalysisModal(true); }} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 font-black"><Plus size={20} /> Nueva Muestra</button>
                )}
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest"><th className="px-8 py-5">Folio / Plazos</th><th className="px-8 py-5">Identificación</th><th className="px-8 py-5">Logística</th><th className="px-8 py-5">Asignación</th><th className="px-8 py-5">Estudios</th><th className="px-8 py-5">Estado</th><th className="px-8 py-5 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analyses.map(record => (
                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-mono text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg w-fit mb-2 shadow-sm border border-indigo-100">{record.sampleId}</span>
                              <div className="space-y-1.5">
                                 <div className="flex items-center gap-2 text-[12px] font-black text-slate-700">
                                    <Calendar size={13} className="text-indigo-600" />
                                    <span>Rec: {record.receptionDate}</span>
                                 </div>
                                 <div className="flex items-center gap-2 text-[12px] font-black text-indigo-600">
                                    <Clock size={13} className="text-indigo-600" />
                                    <span>Ent: {record.deliveryDate}</span>
                                 </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5"><div className="flex flex-col"><span className="font-black text-slate-900 text-base">{record.sampleName}</span><span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md w-fit mt-1">{record.product}</span></div></td>
                          <td className="px-8 py-5 text-xs text-slate-600 font-bold"><p className="flex items-center gap-2 mb-1.5"><Truck size={14} className="text-slate-400" /> {record.provider}</p><p className="flex items-center gap-2"><Globe size={14} className="text-slate-400" /> {record.origin}</p></td>
                          <td className="px-8 py-5"><p className="text-xs font-black text-slate-800">{clients.find(c => c.id === record.clientId)?.name || 'General'}</p><p className="text-[10px] text-indigo-500 font-black uppercase tracking-wider mt-1">{techs.find(t => t.id === record.technicianId)?.name || 'Sin Asignar'}</p></td>
                          <td className="px-8 py-5"><div className="flex flex-wrap gap-1.5 max-w-[200px]">{types.filter(t => (record.analysisIds || []).includes(t.id)).map(t => (<span key={t.id} className={`text-[9px] px-2 py-1 rounded-md border font-black uppercase tracking-tight ${record.results && Object.keys(record.results).length > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>{t.name}</span>))}</div></td>
                          <td className="px-8 py-5"><span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${record.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : record.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>{record.status}</span></td>
                          <td className="px-8 py-5 text-right space-x-2 flex justify-end">
                             {['Admin', 'Technician'].includes(currentUser.role) && (<button onClick={() => { setSelectedRecordForResults(record); setCurrentResults(record.results || {}); setShowResultsModal(true); }} className="text-indigo-600 p-3 hover:bg-indigo-600 hover:text-white rounded-xl border border-indigo-100 bg-white transition-all shadow-sm"><FlaskConical size={18} /></button>)}
                             {record.status === 'Completed' && (<button onClick={() => { setSelectedRecordForReport(record); setShowReportModal(true); }} className="text-slate-600 p-3 hover:bg-slate-800 hover:text-white rounded-xl border border-slate-200 bg-white transition-all shadow-sm"><Printer size={18} /></button>)}
                             {currentUser.role === 'Admin' && (<button onClick={() => { if(window.confirm("¿Eliminar registro?")) setAnalyses(prev => prev.filter(a => a.id !== record.id)) }} className="text-red-400 p-3 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={18}/></button>)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-6 animate-in">
              <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div><h3 className="text-2xl font-black text-slate-900">Directorio de Clientes</h3><p className="text-slate-500 text-sm font-medium">Administra la base de datos de cuentas comerciales.</p></div>
                {currentUser.role === 'Admin' && <button onClick={() => setShowClientModal(true)} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 font-black"><Plus size={20} /> Nuevo Cliente</button>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map(client => (
                  <div key={client.id} className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><Users size={24} /></div>
                       {currentUser.role === 'Admin' && <button onClick={() => setClients(prev => prev.filter(c => c.id !== client.id))} className="text-slate-300 hover:text-red-500 p-2 transition-colors"><Trash2 size={18} /></button>}
                    </div>
                    <h4 className="text-lg font-black text-slate-900">{client.name}</h4>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{client.contactName}</p>
                    <div className="mt-6 space-y-2">
                       <div className="flex items-center gap-3 text-slate-600 text-sm font-medium"><Mail size={16} className="text-slate-400" /> {client.email}</div>
                       <div className="flex items-center gap-3 text-slate-600 text-sm font-medium"><Phone size={16} className="text-slate-400" /> {client.phone}</div>
                       <div className="flex items-center gap-3 text-slate-600 text-sm font-medium"><MapPin size={16} className="text-slate-400" /> {client.address}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'techs' && (
            <div className="space-y-6 animate-in">
              <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div><h3 className="text-2xl font-black text-slate-900">Personal Técnico</h3><p className="text-slate-500 text-sm font-medium">Analistas y laboratoristas responsables.</p></div>
                {currentUser.role === 'Admin' && <button onClick={() => setShowTechModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-indigo-700 transition-all font-black shadow-xl shadow-indigo-200"><Plus size={20} /> Añadir Técnico</button>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {techs.map(tech => (
                  <div key={tech.id} className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-xl transition-all text-center">
                    <div className="flex justify-end">{currentUser.role === 'Admin' && <button onClick={() => setTechs(prev => prev.filter(t => t.id !== tech.id))} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={16}/></button>}</div>
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600"><UserIcon size={40} /></div>
                    <h4 className="text-xl font-black text-slate-900">{tech.name}</h4>
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full mt-2">{tech.specialty}</span>
                    <div className="mt-8 pt-6 border-t border-slate-50 flex justify-center gap-4">
                       <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all"><Mail size={20}/></button>
                       <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all"><Phone size={20}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'types' && (
            <div className="space-y-6 animate-in">
              <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div><h3 className="text-2xl font-black text-slate-900">Catálogo de Análisis</h3><p className="text-slate-500 text-sm font-medium">Estudios disponibles y costos unitarios.</p></div>
                {currentUser.role === 'Admin' && <button onClick={() => setShowTypeModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-slate-800 transition-all font-black shadow-xl"><Plus size={20} /> Nuevo Estudio</button>}
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest"><th className="px-8 py-5">Nombre del Estudio</th><th className="px-8 py-5 text-center">Unidad</th><th className="px-8 py-5 text-right">Costo Base</th><th className="px-8 py-5 text-right">Acciones</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {types.map(type => (
                      <tr key={type.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 font-black text-slate-800">{type.name}</td>
                        <td className="px-8 py-5 text-center"><span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg font-bold text-xs">{type.unit}</span></td>
                        <td className="px-8 py-5 text-right font-mono font-black text-emerald-600">${type.baseCost.toFixed(2)}</td>
                        <td className="px-8 py-5 text-right">
                          <button onClick={() => {if(window.confirm("¿Eliminar estudio?")) setTypes(prev => prev.filter(t => t.id !== type.id))}} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && currentUser.role === 'Admin' && (
             <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                   <div className="flex items-center gap-5 mb-8"><div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-600/20"><Zap size={28} /></div><h3 className="text-2xl font-black text-slate-900">Enlace con Google Sheets</h3></div>
                   <p className="text-slate-500 text-sm font-medium mb-6">Pega aquí la URL de tu implementación de Google Apps Script para sincronizar con tu base de datos central en la nube.</p>
                   <input type="text" placeholder="https://script.google.com/macros/s/..." className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none font-mono text-sm bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 mb-6 transition-all" value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)} />
                   <button onClick={() => alert("URL Guardada Correctamente")} className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3"><Save size={20}/> Guardar Cambios</button>
                </div>
             </div>
          )}
        </div>

        {/* --- MODALES --- */}
        {showAnalysisModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl overflow-hidden animate-in">
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
                <div className="flex items-center gap-4">
                   <div className="bg-white/20 p-3 rounded-2xl"><Plus size={28} /></div>
                   <div><h3 className="text-2xl font-black">Registro de Muestra</h3><p className="text-white/70 text-xs font-bold uppercase tracking-wider">Folio: {newAnalysis.sampleId}</p></div>
                </div>
                <button onClick={() => setShowAnalysisModal(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={28} /></button>
              </div>
              
              <form onSubmit={handleRegisterSubmit} className="p-10 overflow-y-auto max-h-[75vh]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2"><Info size={14} /> Logística de Recepción</h4>
                    <div className="space-y-4">
                       <div className="relative"><input type="text" required placeholder="Nombre de la Muestra *" className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-black text-slate-700 bg-slate-50/50" value={newAnalysis.sampleName || ''} onChange={(e) => setNewAnalysis({...newAnalysis, sampleName: e.target.value})} /><Beaker className="absolute left-4 top-4 text-slate-400" size={18}/></div>
                       <select required className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-white font-black text-slate-700" value={newAnalysis.product} onChange={(e) => setNewAnalysis({...newAnalysis, product: e.target.value})}>{products.map(p => <option key={p} value={p}>{p}</option>)}</select>
                       <input type="text" placeholder="Procedencia" className="w-full px-6 py-4 rounded-2xl border border-slate-200" value={newAnalysis.origin || ''} onChange={(e) => setNewAnalysis({...newAnalysis, origin: e.target.value})} />
                       <input type="text" placeholder="Proveedor / Lote" className="w-full px-6 py-4 rounded-2xl border border-slate-200" value={newAnalysis.provider || ''} onChange={(e) => setNewAnalysis({...newAnalysis, provider: e.target.value})} />
                       <div>
                         <label className="text-[11px] font-black text-slate-500 uppercase mb-1.5 block">Fecha de Recepción *</label>
                         <input type="date" required className="w-full px-6 py-3 rounded-2xl border border-slate-200 font-bold" value={newAnalysis.receptionDate} onChange={(e) => setNewAnalysis({...newAnalysis, receptionDate: e.target.value})} />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2"><UserIcon size={14} /> Asignación y Prioridad</h4>
                    <div className="space-y-4">
                       <select required className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-white font-black" value={newAnalysis.clientId} onChange={(e) => setNewAnalysis({...newAnalysis, clientId: e.target.value})}>
                          <option value="">Seleccionar Cliente *</option>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                       <select required className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-white font-black" value={newAnalysis.technicianId} onChange={(e) => setNewAnalysis({...newAnalysis, technicianId: e.target.value})}>
                          <option value="">Analista Responsable *</option>
                          {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                       </select>
                       <div>
                         <label className="text-[11px] font-black text-slate-500 uppercase mb-1.5 block">Compromiso de Entrega *</label>
                         <input type="date" required className="w-full px-6 py-3 rounded-2xl border border-slate-200 font-bold" value={newAnalysis.deliveryDate} onChange={(e) => setNewAnalysis({...newAnalysis, deliveryDate: e.target.value})} />
                       </div>
                       <div className="grid grid-cols-1 gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Prioridad de Análisis</p>
                          <div className="flex gap-2">
                             {['Normal', 'Urgent', 'Critical'].map(p => (
                                <button key={p} type="button" onClick={() => setNewAnalysis({...newAnalysis, priority: p as Priority})} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${newAnalysis.priority === p ? (p === 'Normal' ? 'bg-indigo-600 text-white shadow-md' : p === 'Urgent' ? 'bg-orange-500 text-white shadow-md' : 'bg-red-600 text-white shadow-md') : 'bg-white text-slate-400 border border-slate-100'}`}>{p}</button>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2"><FlaskConical size={14} /> Estudios a Realizar</h4>
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 max-h-[250px] overflow-y-auto space-y-2 shadow-inner">
                       {types.map(t => {
                          const isSelected = newAnalysis.analysisIds?.includes(t.id);
                          return (
                            <div 
                              key={t.id} 
                              onClick={() => toggleAnalysis(t.id)}
                              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 scale-[1.02]' : 'bg-white text-slate-600 hover:border-indigo-300'}`}
                            >
                               <div className="flex items-center gap-3">
                                  {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                  <span className="text-sm font-black">{t.name}</span>
                               </div>
                               <span className="text-[10px] font-black opacity-70 tracking-widest">${t.baseCost}</span>
                            </div>
                          );
                       })}
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-[2rem] border-2 border-indigo-100 flex flex-col items-center">
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Presupuesto Estimado</span>
                       <span className="text-4xl font-black text-indigo-700">${newAnalysis.cost?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex gap-6">
                  <button type="button" onClick={() => setShowAnalysisModal(false)} className="flex-1 py-5 text-slate-400 font-black border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">Cancelar</button>
                  <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all uppercase tracking-widest text-xs">Registrar en Bitácora</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Captura de Resultados */}
        {showResultsModal && selectedRecordForResults && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in">
                    <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-emerald-600 text-white">
                        <div className="flex items-center gap-4">
                           <div className="bg-white/20 p-2.5 rounded-xl"><Activity size={24} /></div>
                           <div><h3 className="text-2xl font-black">Captura de Resultados</h3><p className="text-white/70 text-xs font-bold uppercase tracking-wider">Folio: {selectedRecordForResults.sampleId}</p></div>
                        </div>
                        <button onClick={() => setShowResultsModal(false)} className="p-3 hover:bg-emerald-500 rounded-2xl"><X size={24} /></button>
                    </div>
                    <form onSubmit={handleResultsSubmit} className="p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {types.filter(t => selectedRecordForResults.analysisIds.includes(t.id)).map(type => (
                                <div key={type.id}>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{type.name} ({type.unit})</label>
                                    <div className="relative">
                                       <input type="text" required className="w-full pl-6 pr-14 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-black text-xl bg-slate-50/50" value={currentResults[type.id] || ''} onChange={(e) => setCurrentResults({...currentResults, [type.id]: e.target.value})} />
                                       <span className="absolute right-5 top-4.5 text-slate-400 font-black text-sm uppercase">{type.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-8 flex gap-6">
                            <button type="button" onClick={() => setShowResultsModal(false)} className="flex-1 py-4 text-slate-400 font-black border rounded-2xl uppercase tracking-widest text-[10px]">Cerrar</button>
                            <button type="submit" className="flex-[2] py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 uppercase tracking-widest text-[10px]">Guardar y Finalizar Análisis</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Modal Reporte Certificado */}
        {showReportModal && selectedRecordForReport && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[110] overflow-y-auto flex items-center justify-center p-8">
             <div className="bg-white w-full max-w-4xl p-16 rounded-[2rem] relative shadow-2xl">
                <button onClick={() => setShowReportModal(false)} className="absolute top-10 right-10 p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all text-slate-500 no-print"><X size={24}/></button>
                <div className="border-b-4 border-indigo-600 pb-10 mb-12 flex justify-between items-start">
                   <div><h1 className="text-4xl font-black text-slate-900 mb-2">LabSync <span className="text-indigo-600">Pro</span></h1><p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">Certificado de Análisis Laboratorial</p></div>
                   <div className="text-right"><p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Folio de Control</p><p className="text-3xl font-black text-indigo-600">{selectedRecordForReport.sampleId}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-16 mb-12">
                   <div className="space-y-4"><div className="bg-slate-50 p-6 rounded-3xl"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descripción de la Muestra</p><p className="text-xl font-black text-slate-800">{selectedRecordForReport.sampleName}</p><p className="text-sm font-bold text-slate-500 mt-1">{selectedRecordForReport.product}</p></div></div>
                   <div className="space-y-4"><div className="bg-slate-50 p-6 rounded-3xl"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Información del Cliente</p><p className="text-xl font-black text-slate-800">{clients.find(c => c.id === selectedRecordForReport.clientId)?.name}</p></div></div>
                </div>
                <table className="w-full mb-16">
                   <thead className="bg-slate-900 text-white"><tr><th className="px-8 py-4 text-left rounded-tl-2xl text-[10px] font-black uppercase tracking-widest">Parámetro Evaluado</th><th className="px-8 py-4 text-center text-[10px] font-black uppercase tracking-widest">Resultado</th><th className="px-8 py-4 text-left rounded-tr-2xl text-[10px] font-black uppercase tracking-widest">Unidad</th></tr></thead>
                   <tbody className="divide-y divide-slate-100 border-x border-b border-slate-100">
                      {selectedRecordForReport.analysisIds.map(aid => {
                         const type = types.find(t => t.id === aid);
                         return (<tr key={aid} className="hover:bg-slate-50/30 transition-colors"><td className="px-8 py-6 font-black text-slate-800">{type?.name}</td><td className="px-8 py-6 text-center font-mono text-2xl font-black text-indigo-600">{selectedRecordForReport.results?.[aid] || '---'}</td><td className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">{type?.unit}</td></tr>);
                      })}
                   </tbody>
                </table>
                <div className="flex justify-between items-end border-t border-slate-100 pt-10">
                   <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha de Certificación</p><p className="text-sm font-black text-slate-700">{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                   <div className="text-center w-64"><div className="h-px bg-slate-300 w-full mb-4"></div><p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">{techs.find(t => t.id === selectedRecordForReport.technicianId)?.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Firma de Validación</p></div>
                </div>
                <button onClick={() => window.print()} className="mt-16 w-full py-6 bg-slate-900 text-white font-black rounded-3xl no-print hover:bg-slate-800 transition-all flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl"><Printer size={20}/> Imprimir Reporte de Resultados</button>
             </div>
          </div>
        )}

        {/* Modal Clientes */}
        {showClientModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 animate-in">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-black text-slate-900">Nuevo Cliente</h3>
                   <button onClick={() => setShowClientModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={24} /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); const target = e.target as any; const nc = { id: `c${Date.now()}`, name: target.name.value, contactName: target.contact.value, email: target.email.value, phone: target.phone.value, address: target.address.value }; setClients(prev => [...prev, nc]); setShowClientModal(false); }} className="space-y-4">
                   <div className="space-y-4">
                      <input name="name" required placeholder="Nombre Comercial o Razón Social *" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold" />
                      <input name="contact" required placeholder="Persona de Contacto *" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none" />
                      <input name="email" type="email" required placeholder="Email de Facturación/Reportes *" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none" />
                      <input name="phone" placeholder="Teléfono" className="w-full px-6 py-4 rounded-2xl border border-slate-200" />
                      <input name="address" placeholder="Domicilio Fiscal" className="w-full px-6 py-4 rounded-2xl border border-slate-200" />
                   </div>
                   <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl mt-6 shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all">Registrar Cliente</button>
                </form>
             </div>
          </div>
        )}

        {/* Modal Técnicos */}
        {showTechModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 animate-in">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-black text-slate-900">Añadir Analista</h3>
                   <button onClick={() => setShowTechModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={24} /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); const target = e.target as any; const nt = { id: `t${Date.now()}`, name: target.name.value, specialty: target.specialty.value, email: target.email.value, phone: target.phone.value }; setTechs(prev => [...prev, nt]); setShowTechModal(false); }} className="space-y-4">
                   <div className="space-y-4">
                      <input name="name" required placeholder="Nombre Completo del Analista *" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold focus:border-indigo-500 outline-none" />
                      <input name="specialty" required placeholder="Especialidad (Bromatología, Micotoxinas...) *" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none" />
                      <input name="email" type="email" required placeholder="Email Institucional *" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none" />
                      <input name="phone" placeholder="Celular" className="w-full px-6 py-4 rounded-2xl border border-slate-200" />
                   </div>
                   <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl mt-6 shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">Guardar Datos de Personal</button>
                </form>
             </div>
          </div>
        )}

        {/* Modal Catálogo */}
        {showTypeModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 animate-in">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-black text-slate-900">Configurar Análisis</h3>
                   <button onClick={() => setShowTypeModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={24} /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); const target = e.target as any; const nty = { id: `at${Date.now()}`, name: target.name.value, baseCost: parseFloat(target.cost.value), unit: target.unit.value }; setTypes(prev => [...prev, nty]); setShowTypeModal(false); }} className="space-y-4">
                   <div className="space-y-4">
                      <input name="name" required placeholder="Nombre del Análisis (ej. Proteína) *" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold focus:border-indigo-500 outline-none" />
                      <input name="unit" required placeholder="Unidad de Medida (%, ppb, ppm...) *" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none" />
                      <input name="cost" type="number" step="0.01" required placeholder="Costo Base por Muestra ($) *" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none" />
                   </div>
                   <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl mt-6 shadow-xl hover:bg-slate-800 transition-all">Añadir al Catálogo</button>
                </form>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) { createRoot(rootElement).render(<App />); }
