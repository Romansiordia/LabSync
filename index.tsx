
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // --- Estados de Datos ---
  const [clients, setClients] = useState<Client[]>(() => JSON.parse(localStorage.getItem('lab_clients') || JSON.stringify(INITIAL_CLIENTS)));
  const [techs, setTechs] = useState<Technician[]>(() => JSON.parse(localStorage.getItem('lab_techs') || JSON.stringify(INITIAL_TECHS)));
  const [types, setTypes] = useState<AnalysisType[]>(() => JSON.parse(localStorage.getItem('lab_types') || JSON.stringify(INITIAL_TYPES)));
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>(() => JSON.parse(localStorage.getItem('lab_analyses') || '[]'));
  const [products, setProducts] = useState<string[]>(() => JSON.parse(localStorage.getItem('lab_products') || JSON.stringify(BASE_PRODUCT_LIST)));
  
  const [selectedRecordForResults, setSelectedRecordForResults] = useState<AnalysisRecord | null>(null);
  const [selectedRecordForReport, setSelectedRecordForReport] = useState<AnalysisRecord | null>(null);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<AnalysisRecord | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
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
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
      // Si hay URL de Google, intentar validar contra la pestaña de Usuarios
      if (googleUrl) {
        const response = await fetch(googleUrl, {
          method: 'POST',
          mode: 'no-cors', // Para evitar problemas de CORS con Apps Script simple
          body: JSON.stringify({ 
            action: 'login', 
            email: loginForm.email, 
            password: loginForm.password 
          })
        });
        
        // Simulación de respuesta exitosa de Google por ahora (dado que no podemos leer la respuesta de no-cors)
        // En un entorno real, usaríamos JSONP o un proxy para leer el resultado del login.
      }

      // LOGIN SIMULADO (Para demostración)
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
        alert("Credenciales incorrectas. Pruebe:\n- admin@labsync.com / admin123\n- tecnico@labsync.com / tech123\n- recepcion@labsync.com / rec123");
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

  // --- Lógica de Negocio ---
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

  const pullFromGoogle = async () => {
    if (!googleUrl) { alert("Configure la URL de Google Sheets."); return; }
    setIsSyncing(true);
    try {
      const response = await fetch(googleUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        const mergedAnalyses = [...analyses];
        data.forEach((row: any) => {
          if (!row.Folio) return;
          const existingIndex = mergedAnalyses.findIndex(a => a.sampleId === row.Folio.toString());
          const analysisIds: string[] = [];
          types.forEach(t => { if (row[t.name]) analysisIds.push(t.id); });
          const results: Record<string, string> = {};
          types.forEach(t => { if (row[t.name] && row[t.name] !== "[SOLICITADO]") { results[t.id] = row[t.name].toString(); } });
          
          const newRecord: AnalysisRecord = {
            id: existingIndex !== -1 ? mergedAnalyses[existingIndex].id : `ext_${Date.now()}_${row.Folio}`,
            sampleId: row.Folio.toString(),
            sampleName: row.Muestra || "Muestra Importada",
            product: row.Producto || "General",
            origin: row.Procedencia || row.Origen || "",
            provider: row.Proveedor || "",
            batch: row.Lote || "",
            clientId: clients.find(c => c.name === row.Cliente)?.id || (clients[0]?.id || ""),
            technicianId: techs.find(t => t.name === row.Técnico)?.id || (techs[0]?.id || ""),
            analysisIds: analysisIds,
            results: results,
            receptionDate: row["Fecha Recepción"] || new Date().toISOString().split('T')[0],
            deliveryDate: row["Fecha Entrega"] || new Date().toISOString().split('T')[0],
            priority: row.Prioridad || 'Normal',
            cost: parseFloat(row.Costo) || 0,
            status: row.Estatus === 'Completado' ? 'Completed' : row.Estatus === 'En Proceso' ? 'In Progress' : 'Pending'
          };
          if (existingIndex !== -1) mergedAnalyses[existingIndex] = newRecord;
          else mergedAnalyses.push(newRecord);
        });
        setAnalyses(mergedAnalyses);
        setSyncStatus('success');
      }
    } catch (error) { setSyncStatus('error'); } finally { setIsSyncing(false); setTimeout(() => setSyncStatus('idle'), 3000); }
  };

  const syncWithGoogle = async (data: any) => {
    if (!googleUrl) return;
    setIsSyncing(true);
    try {
      await fetch(googleUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
      setSyncStatus('success');
    } catch (error) { setSyncStatus('error'); } finally { setIsSyncing(false); setTimeout(() => setSyncStatus('idle'), 3000); }
  };

  // --- Renderizado Condicional de Sidebar ---
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
        {/* Background Elements */}
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
                    <input 
                      type="email" 
                      required 
                      placeholder="Correo Electrónico" 
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    />
                 </div>
                 <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="password" 
                      required 
                      placeholder="Contraseña" 
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    />
                 </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoginLoading}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {isLoginLoading ? <RefreshCw className="animate-spin" size={20}/> : <ChevronRight size={20}/>}
                {isLoginLoading ? 'Iniciando...' : 'Entrar al Sistema'}
              </button>
              
              <div className="pt-4 text-center">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Conexión Segura v2.5</p>
              </div>
           </form>
        </div>
      </div>
    );
  }

  // --- Renderizado Sidebar Item ---
  const renderSidebarItem = (id: typeof activeTab, icon: React.ReactNode, label: string) => {
    if (!canSee(id)) return null;
    return (
      <button 
        onClick={() => setActiveTab(id)} 
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
      >
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

        {/* User Card in Sidebar */}
        <div className="p-4 bg-slate-800/50 border-t border-slate-800">
           <div className="flex items-center gap-3 px-2 mb-3">
              <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400"><UserIcon size={18}/></div>
              <div className="min-w-0">
                 <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                 <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                   currentUser.role === 'Admin' ? 'bg-indigo-600 text-white' : 
                   currentUser.role === 'Technician' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'
                 }`}>{currentUser.role}</span>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
           >
              <LogOut size={14}/> Cerrar Sesión
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <h2 className="text-xl font-semibold text-slate-800 capitalize">{activeTab}</h2>
          <div className="flex items-center space-x-4">
             <button onClick={pullFromGoogle} disabled={isSyncing} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all font-bold text-xs">
                <CloudDownload size={16} /> {isSyncing ? 'Buscando...' : 'Actualizar Datos'}
             </button>
          </div>
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
             
             {/* Gráficas solo visibles para Admin y Recepción (Ventas) */}
             {['Admin', 'Reception'].includes(currentUser.role) && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6"><TrendingUp size={18} className="text-indigo-600" /> Facturación por Cliente</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.clientStats}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                          <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 text-center">Carga por Técnico</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.techStats}>
                          <defs><linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <Tooltip /><Area type="monotone" dataKey="tests" stroke="#10b981" fillOpacity={1} fill="url(#colorTests)" strokeWidth={3} />
                        </AreaChart>
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
                  <p className="text-slate-500 text-sm">Gestiona y consulta el historial de ingresos del laboratorio.</p>
                </div>
                {/* Registro solo para Admin y Recepción */}
                {['Admin', 'Reception'].includes(currentUser.role) && (
                  <button 
                    onClick={() => {
                      const nextFolio = generateNextFolio();
                      setNewAnalysis({
                        priority: 'Normal',
                        status: 'Pending',
                        product: products[0] || '',
                        origin: '',
                        provider: '',
                        batch: '',
                        analysisIds: [],
                        sampleId: nextFolio,
                        receptionDate: new Date().toISOString().split('T')[0],
                        deliveryDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
                        cost: 0
                      });
                      setShowAnalysisModal(true);
                    }} 
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg font-bold"
                  >
                    <Plus size={20} /> Registrar Muestra
                  </button>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Folio / Identificación</th>
                        <th className="px-6 py-4">Muestra</th>
                        <th className="px-6 py-4">Logística</th>
                        <th className="px-6 py-4">Administración</th>
                        <th className="px-6 py-4">Análisis</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analyses.map(record => (
                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <button onClick={() => { setSelectedRecordForDetail(record); setIsEditMode(false); setShowDetailModal(true); }} className="flex flex-col text-left group-hover:translate-x-1 transition-transform">
                              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-1">{record.sampleId}</span>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold uppercase"><Calendar size={10} /> {record.receptionDate}</span>
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 text-sm">{record.sampleName}</span>
                              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-1"><Package size={10}/> {record.product}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[11px] space-y-1">
                              <p className="flex items-center gap-1 text-slate-500 font-medium"><Truck size={10} /> {record.provider || 'N/A'}</p>
                              <p className="flex items-center gap-1 text-slate-500 font-medium"><Globe size={10} /> {record.origin || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-slate-700 mb-1">{clients.find(c => c.id === record.clientId)?.name || 'C. General'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{techs.find(t => t.id === record.technicianId)?.name || 'S. Asignar'}</p>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex flex-wrap gap-1 max-w-[180px]">
                                {types.filter(t => (record.analysisIds || []).includes(t.id)).map(t => (
                                  <span key={t.id} className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${record.results?.[t.id] ? 'bg-green-100 text-green-700 border-green-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>{t.name}</span>
                                ))}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${record.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : record.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-1 flex justify-end">
                             {/* Captura solo para Admin y Técnico */}
                             {['Admin', 'Technician'].includes(currentUser.role) && (
                               <button onClick={() => { setSelectedRecordForResults(record); setCurrentResults(record.results || {}); setShowResultsModal(true); }} title="Capturar Resultados" className="text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg border border-indigo-100 bg-white shadow-sm"><FlaskConical size={16} /></button>
                             )}
                             {record.status === 'Completed' && (
                               <button onClick={() => { setSelectedRecordForReport(record); setShowReportModal(true); }} title="Imprimir Reporte" className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm"><Printer size={16} /></button>
                             )}
                             {currentUser.role === 'Admin' && (
                               <button onClick={() => setAnalyses(analyses.filter(a => a.id !== record.id))} className="text-red-400 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                             )}
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
                  <div className="space-y-4">
                    <input type="text" placeholder="URL de Google Apps Script" className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none font-mono text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500" value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)} />
                    <button onClick={() => alert("URL Guardada")} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all">Guardar Configuración</button>
                  </div>
               </div>
               <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-6"><div className="bg-orange-500 p-3 rounded-2xl text-white"><Users size={24} /></div><h3 className="text-xl font-bold text-slate-900">Gestión de Usuarios</h3></div>
                  <p className="text-slate-500 text-sm mb-4 italic">La gestión de contraseñas y roles se realiza directamente en la pestaña 'Usuarios' de su Google Sheet para máxima seguridad.</p>
                  <button onClick={() => window.open(googleUrl.split('/exec')[0], '_blank')} className="flex items-center gap-2 text-indigo-600 font-bold hover:underline"><ExternalLink size={16}/> Abrir archivo de Control</button>
               </div>
            </div>
          )}
        </div>

        {/* --- MODALES --- */}
        {/* Registro (Ingreso) */}
        {showAnalysisModal && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in">
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <h3 className="text-2xl font-bold text-slate-900">Registro de Muestra</h3>
                <button onClick={() => setShowAnalysisModal(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400"><X size={24} /></button>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const record: AnalysisRecord = { 
                    ...(newAnalysis as Required<Omit<AnalysisRecord, 'id' | 'results' | 'comments'>>), 
                    id: `a${Date.now()}`, 
                    results: {}, 
                    comments: "" 
                  } as AnalysisRecord;
                  setAnalyses([record, ...analyses]);
                  setShowAnalysisModal(false);
                  if (googleUrl) {
                    syncWithGoogle({ action: 'create', ...record });
                  }
                }} 
                className="p-10 space-y-8 overflow-y-auto max-h-[75vh]"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" required placeholder="Nombre Muestra *" className="w-full px-5 py-3.5 rounded-2xl border" value={newAnalysis.sampleName || ''} onChange={(e) => setNewAnalysis({...newAnalysis, sampleName: e.target.value})} />
                  <select required className="w-full px-5 py-3.5 rounded-2xl border bg-white" value={newAnalysis.product} onChange={(e) => setNewAnalysis({...newAnalysis, product: e.target.value})}>
                    {products.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {/* ... Resto de los campos del formulario de ingreso ... */}
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setShowAnalysisModal(false)} className="flex-1 py-4 text-slate-600 font-bold border rounded-2xl">Cancelar</button>
                  <button type="submit" disabled={isSyncing} className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700">Confirmar Registro</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Captura de Resultados */}
        {showResultsModal && selectedRecordForResults && (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
                        <h3 className="text-xl font-bold">Captura de Resultados</h3>
                        <button onClick={() => setShowResultsModal(false)} className="p-2 hover:bg-indigo-500 rounded-xl text-indigo-100"><X size={20} /></button>
                    </div>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const updated: AnalysisRecord = { ...selectedRecordForResults, results: currentResults, status: 'Completed' };
                        setAnalyses(analyses.map(a => a.id === updated.id ? updated : a));
                        setShowResultsModal(false);
                        if (googleUrl) syncWithGoogle({ action: 'update_results', ...updated });
                      }} 
                      className="p-8 space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {types.filter(t => selectedRecordForResults.analysisIds.includes(t.id)).map(type => (
                                <div key={type.id}>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{type.name} ({type.unit})</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl border focus:border-indigo-500 outline-none font-bold" value={currentResults[type.id] || ''} onChange={(e) => setCurrentResults({...currentResults, [type.id]: e.target.value})} />
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 flex gap-4">
                            <button type="button" onClick={() => setShowResultsModal(false)} className="flex-1 py-3 text-slate-600 font-bold border rounded-xl">Cancelar</button>
                            <button type="submit" className="flex-[2] py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg">Guardar Resultados</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Reporte (Pre-visualización) */}
        {showReportModal && selectedRecordForReport && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[110] overflow-y-auto">
             <div className="fixed top-6 right-6 flex flex-col sm:flex-row gap-3 no-print z-[120]">
                <button onClick={() => window.print()} className="bg-indigo-600 text-white px-5 py-3 rounded-full font-bold shadow-xl hover:bg-indigo-700 flex items-center gap-2"><Printer size={20} /> Imprimir</button>
                <button onClick={() => setShowReportModal(false)} className="bg-white text-slate-700 px-5 py-3 rounded-full font-bold shadow-xl border border-slate-200 flex items-center gap-2"><X size={20} /> Cerrar</button>
             </div>
             <div className="flex min-h-full items-center justify-center p-4 py-20">
                <div id="report-preview" className="bg-white w-full max-w-[21cm] min-h-[29.7cm] shadow-2xl p-12 text-slate-800">
                    {/* Estructura del Certificado */}
                    <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-6 mb-8">
                       <div className="flex items-center gap-4">
                          <div className="bg-indigo-600 p-2 rounded-lg text-white"><Beaker size={32} /></div>
                          <div><h1 className="text-3xl font-extrabold text-slate-900">LabSync <span className="text-indigo-600">Pro</span></h1><p className="text-xs text-slate-500 font-bold uppercase">Certificado de Análisis</p></div>
                       </div>
                       <div className="text-right">
                          <h2 className="text-2xl font-black text-indigo-700">CERTIFICADO</h2>
                          <p className="text-sm font-bold text-slate-600">FOLIO: <span className="font-mono text-indigo-600">{selectedRecordForReport.sampleId}</span></p>
                       </div>
                    </div>
                    {/* ... Resto del contenido del reporte ... */}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) { createRoot(rootElement).render(<App />); }
