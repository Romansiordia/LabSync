
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
  KeyRound
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
  // --- Estados de Autenticación ---
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('lab_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // --- Estados de Navegación ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'techs' | 'types' | 'analysis' | 'settings'>('dashboard');
  
  // --- Estados de Modales ---
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // --- Estados de Datos ---
  const [clients, setClients] = useState<Client[]>(() => JSON.parse(localStorage.getItem('lab_clients') || JSON.stringify(INITIAL_CLIENTS)));
  const [techs, setTechs] = useState<Technician[]>(() => JSON.parse(localStorage.getItem('lab_techs') || JSON.stringify(INITIAL_TECHS)));
  const [types, setTypes] = useState<AnalysisType[]>(() => JSON.parse(localStorage.getItem('lab_types') || JSON.stringify(INITIAL_TYPES)));
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>(() => JSON.parse(localStorage.getItem('lab_analyses') || '[]'));
  const [products, setProducts] = useState<string[]>(() => JSON.parse(localStorage.getItem('lab_products') || JSON.stringify(BASE_PRODUCT_LIST)));
  
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

  const [googleUrl, setGoogleUrl] = useState(() => localStorage.getItem('lab_google_url') || '');
  const [isSyncing, setIsSyncing] = useState(false);

  // --- Persistencia ---
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

  // --- Lógica de Autenticación ---
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

  const handleLogout = () => {
    if (window.confirm("¿Deseas cerrar la sesión actual?")) {
      setCurrentUser(null);
    }
  };

  // --- Sincronización Estructurada ---
  const syncWithGoogle = async (payload: any) => {
    if (!googleUrl) return;
    setIsSyncing(true);
    try {
      await fetch(googleUrl, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: JSON.stringify(payload) 
      });
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
    const current = newAnalysis.analysisIds || [];
    const updated = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    const totalCost = updated.reduce((acc, analysisId) => {
       const type = types.find(t => t.id === analysisId);
       return acc + (type?.baseCost || 0);
    }, 0);
    setNewAnalysis({ ...newAnalysis, analysisIds: updated, cost: totalCost });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientObj = clients.find(c => c.id === newAnalysis.clientId);
    const techObj = techs.find(t => t.id === newAnalysis.technicianId);
    
    const record = { 
      ...newAnalysis, 
      id: `a${Date.now()}`, 
      status: 'Pending', 
      results: {}, 
      comments: "" 
    } as AnalysisRecord;
    
    setAnalyses([record, ...analyses]);
    setShowAnalysisModal(false);

    // Enviar a Google de forma estructurada (Mapeo manual para el Excel)
    syncWithGoogle({
      action: 'create',
      sampleId: record.sampleId,
      receptionDate: record.receptionDate,
      sampleName: record.sampleName,
      product: record.product,
      clientName: clientObj?.name || 'Cliente no definido',
      techName: techObj?.name || 'Analista no asignado',
      priority: record.priority,
      status: record.status,
      cost: record.cost,
      // Extra: IDs internos para futuras referencias
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

    setAnalyses(analyses.map(a => a.id === updated.id ? updated : a));
    setShowResultsModal(false);

    // Sincronizar actualización de resultados
    // Convertimos el objeto de resultados a un string legible para una sola celda del Excel
    const resultsSummary = Object.entries(currentResults)
      .map(([id, val]) => {
        const type = types.find(t => t.id === id);
        return `${type?.name}: ${val}${type?.unit || ''}`;
      }).join(' | ');

    syncWithGoogle({
      action: 'update_results',
      sampleId: updated.sampleId,
      status: 'Completed',
      results: resultsSummary
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
      <button onClick={() => setActiveTab(id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        {icon} <span className="font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 flex-1">
          <div className="flex items-center space-x-3 text-white mb-8">
            <div className="bg-indigo-600 p-2 rounded-lg"><Beaker size={24} /></div>
            <span className="text-xl font-bold tracking-tight">LabSync <span className="text-indigo-400">Pro</span></span>
          </div>
          <nav className="space-y-2">
            {renderSidebarItem('dashboard', <LayoutDashboard size={20} />, 'Dashboard')}
            {renderSidebarItem('analysis', <ClipboardList size={20} />, 'Bitácora')}
            {renderSidebarItem('clients', <Users size={20} />, 'Clientes')}
            {renderSidebarItem('techs', <UserIcon size={20} />, 'Técnicos')}
            {renderSidebarItem('types', <Boxes size={20} />, 'Catálogo')}
            <div className="pt-4 border-t border-slate-800 mt-4">
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <h2 className="text-xl font-semibold text-slate-800 capitalize">{activeTab}</h2>
        </header>

        <div className="p-8 overflow-y-auto flex-1">
          {activeTab === 'dashboard' && (
             <div className="space-y-8 animate-in">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { label: 'Facturación Acum.', value: `$${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="text-green-600"/>, bg: 'bg-green-50' },
                 { label: 'Muestras Totales', value: analyses.length, icon: <ClipboardList className="text-indigo-600"/>, bg: 'bg-indigo-50' },
                 { label: 'Ingresos Pendientes', value: analyses.filter(a => a.status === 'Pending').length, icon: <Clock className="text-orange-600"/>, bg: 'bg-orange-50' },
                 { label: 'Eficiencia Lab', value: `${analyses.length > 0 ? Math.round((stats.completedTests/analyses.length)*100) : 0}%`, icon: <CheckCircle className="text-blue-600"/>, bg: 'bg-blue-50' },
               ].map((card, i) => (
                 <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                   <div className="flex justify-between items-start mb-4"><div className={`${card.bg} p-2 rounded-xl`}>{card.icon}</div></div>
                   <p className="text-slate-500 text-sm font-medium">{card.label}</p>
                   <h3 className="text-2xl font-bold text-slate-800 mt-1">{card.value}</h3>
                 </div>
               ))}
             </div>
             {['Admin', 'Reception'].includes(currentUser.role) && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6"><TrendingUp size={18} className="text-indigo-600" /> Facturación por Cliente</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.clientStats}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} /><Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} /><Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} /></BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 text-center">Carga por Técnico</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.techStats}><defs><linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} /><Tooltip /><Area type="monotone" dataKey="tests" stroke="#10b981" fillOpacity={1} fill="url(#colorTests)" strokeWidth={3} /></AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
             )}
           </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6 animate-in">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Bitácora de Recepción</h3>
                  <p className="text-slate-500 text-sm">Gestiona y consulta el historial de ingresos.</p>
                </div>
                {['Admin', 'Reception'].includes(currentUser.role) && (
                  <button onClick={() => { setNewAnalysis({...newAnalysis, sampleId: generateNextFolio(), analysisIds: [], cost: 0}); setShowAnalysisModal(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg font-bold"><Plus size={20} /> Registrar Muestra</button>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider"><th className="px-6 py-4">Folio</th><th className="px-6 py-4">Muestra</th><th className="px-6 py-4">Logística</th><th className="px-6 py-4">Admón</th><th className="px-6 py-4">Análisis</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analyses.map(record => (
                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4"><span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{record.sampleId}</span></td>
                          <td className="px-6 py-4"><div className="flex flex-col"><span className="font-bold text-slate-900 text-sm">{record.sampleName}</span><span className="text-[10px] text-slate-500 font-medium">{record.product}</span></div></td>
                          <td className="px-6 py-4 text-[11px] text-slate-500"><p className="flex items-center gap-1"><Truck size={10} /> {record.provider}</p><p className="flex items-center gap-1"><Globe size={10} /> {record.origin}</p></td>
                          <td className="px-6 py-4"><p className="text-xs font-bold text-slate-700">{clients.find(c => c.id === record.clientId)?.name || 'General'}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{techs.find(t => t.id === record.technicianId)?.name || 'Pendiente'}</p></td>
                          <td className="px-6 py-4"><div className="flex flex-wrap gap-1 max-w-[180px]">{types.filter(t => (record.analysisIds || []).includes(t.id)).map(t => (<span key={t.id} className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${record.results && Object.keys(record.results).length > 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>{t.name}</span>))}</div></td>
                          <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${record.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : record.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{record.status}</span></td>
                          <td className="px-6 py-4 text-right space-x-1 flex justify-end">
                             {['Admin', 'Technician'].includes(currentUser.role) && (<button onClick={() => { setSelectedRecordForResults(record); setCurrentResults(record.results || {}); setShowResultsModal(true); }} className="text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg border border-indigo-100 bg-white"><FlaskConical size={16} /></button>)}
                             {record.status === 'Completed' && (<button onClick={() => { setSelectedRecordForReport(record); setShowReportModal(true); }} className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white"><Printer size={16} /></button>)}
                             {currentUser.role === 'Admin' && (<button onClick={() => setAnalyses(analyses.filter(a => a.id !== record.id))} className="text-red-400 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && currentUser.role === 'Admin' && (
             <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                   <div className="flex items-center gap-4 mb-6"><div className="bg-indigo-600 p-3 rounded-2xl text-white"><Zap size={24} /></div><h3 className="text-xl font-bold text-slate-900">Enlace con Google Sheets</h3></div>
                   <input type="text" placeholder="URL de Google Apps Script" className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none font-mono text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 mb-4" value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)} />
                   <button onClick={() => alert("URL Guardada")} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl">Guardar Configuración</button>
                </div>
             </div>
          )}
        </div>

        {/* --- MODALES --- */}
        {showAnalysisModal && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden animate-in">
              <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
                <div className="flex items-center gap-3">
                   <div className="bg-white/20 p-2 rounded-xl"><Plus size={24} /></div>
                   <h3 className="text-2xl font-bold">Nueva Muestra ({newAnalysis.sampleId})</h3>
                </div>
                <button onClick={() => setShowAnalysisModal(false)} className="p-2 hover:bg-white/10 rounded-xl"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleRegisterSubmit} className="p-10 overflow-y-auto max-h-[80vh]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Columna 1: Información Base */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Info size={14} /> Datos de Identificación</h4>
                    <div className="space-y-4">
                       <input type="text" required placeholder="Nombre de la Muestra *" className="w-full px-4 py-3 rounded-xl border focus:border-indigo-500 outline-none font-bold text-slate-700" value={newAnalysis.sampleName || ''} onChange={(e) => setNewAnalysis({...newAnalysis, sampleName: e.target.value})} />
                       <select required className="w-full px-4 py-3 rounded-xl border bg-white font-bold text-slate-700" value={newAnalysis.product} onChange={(e) => setNewAnalysis({...newAnalysis, product: e.target.value})}>{products.map(p => <option key={p} value={p}>{p}</option>)}</select>
                       <input type="text" placeholder="Procedencia" className="w-full px-4 py-3 rounded-xl border" value={newAnalysis.origin || ''} onChange={(e) => setNewAnalysis({...newAnalysis, origin: e.target.value})} />
                       <input type="text" placeholder="Proveedor" className="w-full px-4 py-3 rounded-xl border" value={newAnalysis.provider || ''} onChange={(e) => setNewAnalysis({...newAnalysis, provider: e.target.value})} />
                       <input type="text" placeholder="Lote" className="w-full px-4 py-3 rounded-xl border" value={newAnalysis.batch || ''} onChange={(e) => setNewAnalysis({...newAnalysis, batch: e.target.value})} />
                    </div>
                  </div>

                  {/* Columna 2: Logística y Asignación */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><UserIcon size={14} /> Administración</h4>
                    <div className="space-y-4">
                       <select required className="w-full px-4 py-3 rounded-xl border bg-white font-bold" value={newAnalysis.clientId} onChange={(e) => setNewAnalysis({...newAnalysis, clientId: e.target.value})}>
                          <option value="">Seleccionar Cliente *</option>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                       <select required className="w-full px-4 py-3 rounded-xl border bg-white font-bold" value={newAnalysis.technicianId} onChange={(e) => setNewAnalysis({...newAnalysis, technicianId: e.target.value})}>
                          <option value="">Asignar Técnico *</option>
                          {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                       </select>
                       <select className="w-full px-4 py-3 rounded-xl border bg-white font-bold" value={newAnalysis.priority} onChange={(e) => setNewAnalysis({...newAnalysis, priority: e.target.value as Priority})}>
                          <option value="Normal">Prioridad Normal</option>
                          <option value="Urgent">Prioridad Urgente</option>
                          <option value="Critical">Prioridad Crítica</option>
                       </select>
                       <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-[10px] font-bold text-slate-400 block mb-1">RECEPCIÓN</label><input type="date" className="w-full px-3 py-2 rounded-lg border text-sm" value={newAnalysis.receptionDate} onChange={(e) => setNewAnalysis({...newAnalysis, receptionDate: e.target.value})} /></div>
                          <div><label className="text-[10px] font-bold text-slate-400 block mb-1">ENTREGA</label><input type="date" className="w-full px-3 py-2 rounded-lg border text-sm" value={newAnalysis.deliveryDate} onChange={(e) => setNewAnalysis({...newAnalysis, deliveryDate: e.target.value})} /></div>
                       </div>
                    </div>
                  </div>

                  {/* Columna 3: Análisis y Costo */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FlaskConical size={14} /> Estudios Solicitados</h4>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-[300px] overflow-y-auto space-y-2">
                       {types.map(t => (
                          <label key={t.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${newAnalysis.analysisIds?.includes(t.id) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 hover:border-indigo-300'}`}>
                             <div className="flex items-center gap-3">
                                {newAnalysis.analysisIds?.includes(t.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                <span className="text-sm font-bold">{t.name}</span>
                             </div>
                             <input type="checkbox" className="hidden" checked={newAnalysis.analysisIds?.includes(t.id)} onChange={() => toggleAnalysis(t.id)} />
                             <span className="text-xs opacity-70">${t.baseCost}</span>
                          </label>
                       ))}
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-100 flex flex-col items-center">
                       <span className="text-xs font-bold text-indigo-400 uppercase mb-1">Costo Total Estimado</span>
                       <span className="text-3xl font-black text-indigo-700">${newAnalysis.cost?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 flex gap-4">
                  <button type="button" onClick={() => setShowAnalysisModal(false)} className="flex-1 py-4 text-slate-600 font-bold border rounded-2xl hover:bg-slate-50 transition-all">Cancelar</button>
                  <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all">Confirmar y Guardar Registro</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Resultados */}
        {showResultsModal && selectedRecordForResults && (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-green-600 text-white">
                        <h3 className="text-xl font-bold">Captura de Resultados: {selectedRecordForResults.sampleId}</h3>
                        <button onClick={() => setShowResultsModal(false)} className="p-2 hover:bg-green-500 rounded-xl"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleResultsSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {types.filter(t => selectedRecordForResults.analysisIds.includes(t.id)).map(type => (
                                <div key={type.id}>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{type.name} ({type.unit})</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl border focus:border-indigo-500 outline-none font-bold" value={currentResults[type.id] || ''} onChange={(e) => setCurrentResults({...currentResults, [type.id]: e.target.value})} />
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 flex gap-4">
                            <button type="button" onClick={() => setShowResultsModal(false)} className="flex-1 py-3 text-slate-600 font-bold border rounded-xl">Cerrar</button>
                            <button type="submit" className="flex-[2] py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700">Guardar y Finalizar</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Modal Reporte */}
        {showReportModal && selectedRecordForReport && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[110] overflow-y-auto flex items-center justify-center p-6">
             <div className="bg-white w-full max-w-3xl p-12 rounded-xl relative shadow-2xl">
                <button onClick={() => setShowReportModal(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full"><X size={20}/></button>
                <div className="border-b-2 border-indigo-600 pb-6 mb-8 flex justify-between">
                   <div><h1 className="text-2xl font-black">LabSync Pro</h1><p className="text-xs text-slate-500">REPORTE DE LABORATORIO</p></div>
                   <div className="text-right"><p className="text-xl font-bold text-indigo-600">FOLIO: {selectedRecordForReport.sampleId}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                   <div><p className="text-slate-400 font-bold mb-1">MUESTRA / PRODUCTO</p><p className="font-bold">{selectedRecordForReport.sampleName} - {selectedRecordForReport.product}</p></div>
                   <div><p className="text-slate-400 font-bold mb-1">CLIENTE</p><p className="font-bold">{clients.find(c => c.id === selectedRecordForReport.clientId)?.name}</p></div>
                </div>
                <table className="w-full mb-12">
                   <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200"><th className="px-4 py-3 text-left">Parámetro</th><th className="px-4 py-3 text-right">Resultado</th><th className="px-4 py-3 text-left">Unidad</th></thead>
                   <tbody>
                      {selectedRecordForReport.analysisIds.map(aid => {
                         const type = types.find(t => t.id === aid);
                         return (<tr key={aid} className="border-b border-slate-100"><td className="px-4 py-3 font-bold">{type?.name}</td><td className="px-4 py-3 text-right font-mono font-black">{selectedRecordForReport.results?.[aid] || '---'}</td><td className="px-4 py-3 text-xs text-slate-500">{type?.unit}</td></tr>);
                      })}
                   </tbody>
                </table>
                <div className="flex justify-between items-end"><div className="text-xs text-slate-400">Fecha de Emisión: {new Date().toLocaleDateString()}</div><div className="text-center border-t border-slate-300 pt-2 w-48 text-xs font-bold">{techs.find(t => t.id === selectedRecordForReport.technicianId)?.name}<br/>Analista Responsable</div></div>
                <button onClick={() => window.print()} className="mt-10 w-full py-4 bg-slate-900 text-white font-bold rounded-xl no-print">Imprimir Documento</button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) { createRoot(rootElement).render(<App />); }
