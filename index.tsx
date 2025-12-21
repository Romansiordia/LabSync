
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
  Download
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

// Definición para evitar errores de compilación con librerías externas
declare global {
  interface Window {
    html2pdf: any;
  }
}

// --- Tipos ---
type Status = 'Pending' | 'In Progress' | 'Completed';
type Priority = 'Normal' | 'Urgent' | 'Critical';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'techs' | 'types' | 'analysis' | 'settings'>('dashboard');
  const [catalogTab, setCatalogTab] = useState<'tests' | 'products'>('tests');
  
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showTechModal, setShowTechModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  
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

  const [newClient, setNewClient] = useState<Partial<Client>>({});
  const [newTech, setNewTech] = useState<Partial<Technician>>({});
  const [newType, setNewType] = useState<Partial<AnalysisType>>({});
  const [newProduct, setNewProduct] = useState<string>('');
  
  const [googleUrl, setGoogleUrl] = useState(() => localStorage.getItem('lab_google_url') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    localStorage.setItem('lab_clients', JSON.stringify(clients));
    localStorage.setItem('lab_techs', JSON.stringify(techs));
    localStorage.setItem('lab_types', JSON.stringify(types));
    localStorage.setItem('lab_analyses', JSON.stringify(analyses));
    localStorage.setItem('lab_products', JSON.stringify(products));
    localStorage.setItem('lab_google_url', googleUrl);
  }, [clients, techs, types, analyses, products, googleUrl]);

  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      #report-preview, #report-preview * {
        visibility: visible;
      }
      #report-preview {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
        padding: 20px;
        background: white;
        z-index: 9999;
        box-shadow: none !important;
      }
      .no-print {
        display: none !important;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `;

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

  const syncWithGoogle = async (data: any) => {
    if (!googleUrl) return;
    setIsSyncing(true);
    setSyncStatus('idle');
    try {
      await fetch(googleUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error("Error sincronizando:", error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenResults = (record: AnalysisRecord) => {
      setSelectedRecordForResults(record);
      setCurrentResults(record.results || {});
      setShowResultsModal(true);
  };

  const handleOpenReport = (record: AnalysisRecord) => {
    setSelectedRecordForReport(record);
    setShowReportModal(true);
  };

  const handleDownloadPDF = () => {
    if (!selectedRecordForReport) return;
    const element = document.getElementById('report-preview');
    
    const opt = {
      margin:       0,
      filename:     `Certificado_${selectedRecordForReport.sampleId}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
        window.html2pdf().set(opt).from(element).save();
    } else {
        alert("La librería de generación de PDF aún no está lista.");
    }
  };

  const handleSaveResults = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedRecordForResults) return;

      const updatedRecord: AnalysisRecord = {
          ...selectedRecordForResults,
          results: currentResults,
          status: 'Completed' 
      };

      setAnalyses(analyses.map(a => a.id === updatedRecord.id ? updatedRecord : a));
      
      const selectedClient = clients.find(c => c.id === updatedRecord.clientId);
      const selectedTech = techs.find(t => t.id === updatedRecord.technicianId);
      
      const formattedPayload: Record<string, string | number> = {
         "Folio": updatedRecord.sampleId,
         "Muestra": updatedRecord.sampleName,
         "Producto": updatedRecord.product,
         "Lote": updatedRecord.batch || "",
         "Cliente": selectedClient?.name || "N/A",
         "Técnico": selectedTech?.name || "N/A",
         "Fecha Recepción": updatedRecord.receptionDate,
         "Fecha Entrega": updatedRecord.deliveryDate,
         "Estatus": "Completado",
         "Costo": updatedRecord.cost
      };

      types.forEach(type => {
          if (currentResults[type.id]) {
              formattedPayload[type.name] = currentResults[type.id];
          } else if (updatedRecord.analysisIds.includes(type.id)) {
              formattedPayload[type.name] = "PENDIENTE";
          }
      });

      if (googleUrl) {
          syncWithGoogle(formattedPayload);
      }

      setShowResultsModal(false);
      setSelectedRecordForResults(null);
  };

  const handleSubmitAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnalysis.clientId || !newAnalysis.sampleName || !newAnalysis.sampleId) {
      alert("Campos obligatorios faltantes.");
      return;
    }

    const selectedClient = clients.find(c => c.id === newAnalysis.clientId);
    const selectedTech = techs.find(t => t.id === newAnalysis.technicianId);
    
    const record: AnalysisRecord = {
      ...(newAnalysis as Required<Omit<AnalysisRecord, 'id' | 'results' | 'comments'>>),
      id: `a${Date.now()}`,
      results: {},
      comments: ""
    } as AnalysisRecord;

    setAnalyses([record, ...analyses]);
    setShowAnalysisModal(false);

    if (googleUrl) {
       const formattedPayload: Record<string, string | number> = {
          "Folio": record.sampleId,
          "Muestra": record.sampleName,
          "Producto": record.product,
          "Lote": record.batch || "",
          "Cliente": selectedClient?.name || "N/A",
          "Técnico": selectedTech?.name || "N/A",
          "Fecha Recepción": record.receptionDate,
          "Fecha Entrega": record.deliveryDate,
          "Estatus": record.status,
          "Costo": record.cost,
          "Lista Análisis": types.filter(t => (record.analysisIds || []).includes(t.id)).map(t => t.name).join(', ')
       };
       
       types.forEach(type => {
          if ((record.analysisIds || []).includes(type.id)) {
             formattedPayload[type.name] = "SOLICITADO";
          }
       });

      syncWithGoogle(formattedPayload);
    }

    setNewAnalysis({
      priority: 'Normal', status: 'Pending',
      product: products[0] || '', origin: '', provider: '', batch: '',
      receptionDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      analysisIds: [],
      cost: 0
    });
  };

  const toggleAnalysisSelection = (typeId: string, baseCost: number) => {
    const currentIds = newAnalysis.analysisIds || [];
    let newIds: string[];
    let newCost = newAnalysis.cost || 0;

    if (currentIds.includes(typeId)) {
      newIds = currentIds.filter(id => id !== typeId);
      newCost -= baseCost;
    } else {
      newIds = [...currentIds, typeId];
      newCost += baseCost;
    }
    setNewAnalysis({ ...newAnalysis, analysisIds: newIds, cost: Math.max(0, newCost) });
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    setClients([...clients, { ...newClient, id: `c${Date.now()}` } as Client]);
    setNewClient({});
    setShowClientModal(false);
  };

  const handleSaveTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTech.name) return;
    setTechs([...techs, { ...newTech, id: `t${Date.now()}` } as Technician]);
    setNewTech({});
    setShowTechModal(false);
  };

  const handleSaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.name) return;
    setTypes([...types, { ...newType, id: `at${Date.now()}` } as AnalysisType]);
    setNewType({});
    setShowTypeModal(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct) return;
    setProducts([...products, newProduct]);
    setNewProduct('');
    setShowProductModal(false);
  };

  const renderSidebarItem = (id: typeof activeTab, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <style>{printStyles}</style>
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center space-x-3 text-white mb-8">
            <div className="bg-indigo-600 p-2 rounded-lg"><Beaker size={24} /></div>
            <span className="text-xl font-bold tracking-tight">LabSync <span className="text-indigo-400">Pro</span></span>
          </div>
          <nav className="space-y-2">
            {renderSidebarItem('dashboard', <LayoutDashboard size={20} />, 'Dashboard')}
            {renderSidebarItem('analysis', <ClipboardList size={20} />, 'Ingreso Muestras')}
            {renderSidebarItem('clients', <Users size={20} />, 'Clientes')}
            {renderSidebarItem('techs', <UserIcon size={20} />, 'Técnicos')}
            {renderSidebarItem('types', <Boxes size={20} />, 'Catálogo')}
            <div className="pt-4 border-t border-slate-800 mt-4">
               {renderSidebarItem('settings', <Settings size={20} />, 'Configuración')}
            </div>
          </nav>
        </div>
        {isSyncing && (
          <div className="mt-auto p-4 bg-indigo-600/10 flex items-center gap-3 text-indigo-400 px-6 py-4 animate-pulse">
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">Sincronizando...</span>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <h2 className="text-xl font-semibold text-slate-800 capitalize">{activeTab}</h2>
          <div className="flex items-center space-x-4">
             {googleUrl && (
               <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${syncStatus === 'success' ? 'bg-green-100 text-green-700 border-green-200' : syncStatus === 'error' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-50 text-green-600 border-green-100'}`}>
                  {syncStatus === 'error' ? <AlertCircle size={14} /> : <Zap size={14} />}
                  <span className="text-[10px] font-bold uppercase">{syncStatus === 'success' ? 'Enviado OK' : syncStatus === 'error' ? 'Error URL' : 'Sheets Conectado'}</span>
               </div>
             )}
             <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded">V 2.3 Stable</span>
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
                   <div className="flex justify-between items-start mb-4">
                     <div className={`${card.bg} p-2 rounded-xl`}>{card.icon}</div>
                   </div>
                   <p className="text-slate-500 text-sm font-medium">{card.label}</p>
                   <h3 className="text-2xl font-bold text-slate-800 mt-1">{card.value}</h3>
                 </div>
               ))}
             </div>
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
                        <defs>
                          <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="tests" stroke="#10b981" fillOpacity={1} fill="url(#colorTests)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
           </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6 animate-in">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Bitácora de Recepción</h3>
                  <p className="text-slate-500 text-sm">Registro técnico de ingreso de materias primas.</p>
                </div>
                <button onClick={() => setShowAnalysisModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
                  <Plus size={20} /> Registrar Muestra
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Muestra / Producto</th>
                        <th className="px-6 py-4">Procedencia</th>
                        <th className="px-6 py-4">Cliente / Folio</th>
                        <th className="px-6 py-4">Análisis</th>
                        <th className="px-6 py-4">Tiempos</th>
                        <th className="px-6 py-4 text-center">Prioridad</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analyses.length === 0 ? (
                        <tr><td colSpan={8} className="px-6 py-20 text-center text-slate-400">No hay ingresos registrados.</td></tr>
                      ) : analyses.map(record => (
                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{record.sampleName}</span>
                              <span className="text-xs text-indigo-600 flex items-center gap-1 font-medium bg-indigo-50 px-2 py-0.5 rounded w-fit mt-1">
                                <Package size={10} /> {record.product}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[11px] space-y-1">
                              <p className="flex items-center gap-1 text-slate-500"><Truck size={10} /> <span className="font-bold text-slate-700">{record.provider || 'S/P'}</span></p>
                              <p className="flex items-center gap-1 text-slate-500"><Globe size={10} /> {record.origin || 'N/A'}</p>
                              <p className="flex items-center gap-1 text-indigo-500 font-bold"><Hash size={10} /> Lote: {record.batch || 'S/L'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-700">{clients.find(c => c.id === record.clientId)?.name || 'N/A'}</p>
                            <p className="font-mono text-[10px] text-slate-400">{record.sampleId}</p>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {(record.analysisIds || []).length > 0 ? (
                                    types.filter(t => (record.analysisIds || []).includes(t.id)).map(t => {
                                      const hasResult = record.results && record.results[t.id];
                                      return (
                                        <span key={t.id} className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex items-center gap-1 ${hasResult ? 'bg-green-100 text-green-700 border-green-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>
                                            {t.name}
                                            {hasResult && <span className="font-bold">: {record.results![t.id]}</span>}
                                        </span>
                                      );
                                    })
                                ) : (
                                    <span className="text-xs text-slate-400 italic">Sin análisis</span>
                                )}
                             </div>
                             <div className="mt-1 text-xs text-slate-500">
                                Técnico: {techs.find(t => t.id === record.technicianId)?.name || 'Sin Asignar'}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col text-xs space-y-1">
                               <span className="text-slate-500 flex items-center gap-1"><Calendar size={12}/> In: <span className="font-medium text-slate-600">{record.receptionDate}</span></span>
                               <span className="text-indigo-600 font-bold flex items-center gap-1"><Clock size={12}/> Fin: {record.deliveryDate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <span className={`px-2 py-1 rounded text-[10px] font-bold ${record.priority === 'Urgent' ? 'bg-red-100 text-red-700' : record.priority === 'Critical' ? 'bg-black text-white' : 'bg-blue-100 text-blue-700'}`}>
                               {record.priority}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${record.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : record.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                             <button onClick={() => handleOpenResults(record)} title="Capturar Resultados" className="text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg transition-all border border-indigo-100 bg-white"><FlaskConical size={18} /></button>
                             {record.status === 'Completed' && (
                               <button onClick={() => handleOpenReport(record)} title="Imprimir Reporte" className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-all border border-slate-200 bg-white"><Printer size={18} /></button>
                             )}
                             <button onClick={() => setAnalyses(analyses.filter(a => a.id !== record.id))} className="text-red-400 p-2 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
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
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Cartera de Clientes</h3>
                </div>
                <button onClick={() => setShowClientModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
                  <Plus size={20} /> Nuevo Cliente
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map(client => (
                  <div key={client.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all hover:shadow-md group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <button onClick={() => setClients(clients.filter(c => c.id !== client.id))} className="text-slate-300 hover:text-red-400"><Trash2 size={18} /></button>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">{client.name}</h4>
                    <p className="text-sm text-slate-500 mb-4">{client.address}</p>
                    <div className="space-y-2 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm text-slate-600"><UserIcon size={14} className="text-indigo-400"/> {client.contactName}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-600"><Mail size={14} className="text-indigo-400"/> {client.email}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-600"><Phone size={14} className="text-indigo-400"/> {client.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'techs' && (
            <div className="space-y-6 animate-in">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Equipo Técnico</h3>
                </div>
                <button onClick={() => setShowTechModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
                  <Plus size={20} /> Registrar Técnico
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {techs.map(tech => (
                  <div key={tech.id} className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:shadow-md transition-all relative">
                     <button onClick={() => setTechs(techs.filter(t => t.id !== tech.id))} className="absolute top-4 right-4 text-slate-300 hover:text-red-400"><Trash2 size={16} /></button>
                     <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-slate-400">
                        {tech.name.charAt(0)}
                     </div>
                     <h4 className="font-bold text-slate-800">{tech.name}</h4>
                     <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-4">{tech.specialty}</p>
                     <div className="text-sm text-slate-500 space-y-1">
                        <p>{tech.email}</p>
                        <p>{tech.phone}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'types' && (
             <div className="space-y-6 animate-in">
               <div className="flex gap-4 mb-6">
                  <button onClick={() => setCatalogTab('tests')} className={`px-6 py-2 rounded-xl font-bold transition-all ${catalogTab === 'tests' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>Tipos de Análisis</button>
                  <button onClick={() => setCatalogTab('products')} className={`px-6 py-2 rounded-xl font-bold transition-all ${catalogTab === 'products' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>Productos Base</button>
               </div>

               {catalogTab === 'tests' ? (
                 <>
                   <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Catálogo de Pruebas</h3>
                      </div>
                      <button onClick={() => setShowTypeModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
                        <Plus size={20} /> Nueva Prueba
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {types.map(type => (
                        <div key={type.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800">{type.name}</h4>
                            <button onClick={() => setTypes(types.filter(t => t.id !== type.id))} className="text-slate-300 hover:text-red-400"><Trash2 size={16} /></button>
                          </div>
                          <div className="flex items-end gap-1">
                             <span className="text-3xl font-bold text-indigo-600">${type.baseCost}</span>
                             <span className="text-slate-400 font-medium mb-1">/ {type.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                 </>
               ) : (
                 <>
                   <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Productos Estándar</h3>
                      </div>
                      <button onClick={() => setShowProductModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
                        <Plus size={20} /> Nuevo Producto
                      </button>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                       <div className="flex flex-wrap gap-3">
                          {products.map((prod, idx) => (
                            <span key={idx} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2">
                               {prod}
                               <button onClick={() => setProducts(products.filter(p => p !== prod))} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                            </span>
                          ))}
                       </div>
                    </div>
                 </>
               )}
             </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-indigo-600 p-3 rounded-2xl text-white"><Zap size={24} /></div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Configuración de Sincronización</h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm text-slate-600 space-y-3">
                    <p>Pega aquí la URL de tu Google Apps Script para sincronizar los datos automáticamente con tu hoja de cálculo.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1">URL de Implementación</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="flex-1 px-5 py-3.5 rounded-2xl border border-slate-200 outline-none text-sm font-mono focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
                        value={googleUrl}
                        onChange={(e) => setGoogleUrl(e.target.value)}
                      />
                      <button 
                        onClick={() => alert("URL guardada.")}
                        className="px-6 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg transition-all"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODALES */}
        {showAnalysisModal && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in">
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <h3 className="text-2xl font-bold text-slate-900">Ingreso de Muestra</h3>
                <button onClick={() => setShowAnalysisModal(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmitAnalysis} className="p-10 space-y-8 overflow-y-auto max-h-[75vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" required placeholder="Nombre Muestra *" className="w-full px-5 py-3.5 rounded-2xl border" value={newAnalysis.sampleName || ''} onChange={(e) => setNewAnalysis({...newAnalysis, sampleName: e.target.value})} />
                  <select required className="w-full px-5 py-3.5 rounded-2xl border bg-white" value={newAnalysis.product} onChange={(e) => setNewAnalysis({...newAnalysis, product: e.target.value})}>
                    {products.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="relative">
                      <span className="absolute left-4 top-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha Recepción</span>
                      <input type="date" required className="w-full px-5 pt-6 pb-2 rounded-2xl border font-medium text-slate-700" value={newAnalysis.receptionDate || ''} onChange={(e) => setNewAnalysis({...newAnalysis, receptionDate: e.target.value})} />
                   </div>
                   <div className="relative">
                      <span className="absolute left-4 top-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha Entrega</span>
                      <input type="date" required className="w-full px-5 pt-6 pb-2 rounded-2xl border font-medium text-slate-700" value={newAnalysis.deliveryDate || ''} onChange={(e) => setNewAnalysis({...newAnalysis, deliveryDate: e.target.value})} />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <input type="text" placeholder="Lote" className="w-full px-5 py-3.5 rounded-2xl border" value={newAnalysis.batch || ''} onChange={(e) => setNewAnalysis({...newAnalysis, batch: e.target.value})} />
                   <input type="text" required placeholder="ID Folio *" className="w-full px-5 py-3.5 rounded-2xl border" value={newAnalysis.sampleId || ''} onChange={(e) => setNewAnalysis({...newAnalysis, sampleId: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select required className="w-full px-5 py-3.5 rounded-2xl border bg-white" value={newAnalysis.clientId || ''} onChange={(e) => setNewAnalysis({...newAnalysis, clientId: e.target.value})}>
                    <option value="">Cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select className="w-full px-5 py-3.5 rounded-2xl border bg-white" value={newAnalysis.technicianId || ''} onChange={(e) => setNewAnalysis({...newAnalysis, technicianId: e.target.value})}>
                    <option value="">Asignar Técnico...</option>
                    {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-700 mb-4">Selecciona Análisis</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {types.map(t => {
                            const isSelected = (newAnalysis.analysisIds || []).includes(t.id);
                            return (
                                <button 
                                    key={t.id} 
                                    type="button"
                                    onClick={() => toggleAnalysisSelection(t.id, t.baseCost)}
                                    className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                                >
                                    <div>
                                        <div className="font-bold text-sm">{t.name}</div>
                                        <div className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>${t.baseCost} / {t.unit}</div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="flex justify-end items-center gap-4 bg-indigo-50 p-4 rounded-xl">
                  <span className="text-slate-600 font-medium">Costo Estimado: ${newAnalysis.cost || 0}</span>
                </div>

                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setShowAnalysisModal(false)} className="flex-1 py-4 text-slate-600 font-bold border rounded-2xl">Cancelar</button>
                  <button type="submit" disabled={isSyncing} className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700">
                    {isSyncing ? 'Sincronizando...' : 'Confirmar Ingreso'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showResultsModal && selectedRecordForResults && (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
                        <h3 className="text-xl font-bold">Captura de Resultados</h3>
                        <button onClick={() => setShowResultsModal(false)} className="p-2 hover:bg-indigo-500 rounded-xl text-indigo-100"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSaveResults} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {types.filter(t => selectedRecordForResults.analysisIds.includes(t.id)).map(type => (
                                <div key={type.id}>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{type.name} ({type.unit})</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-xl border focus:border-indigo-500 outline-none"
                                        value={currentResults[type.id] || ''}
                                        onChange={(e) => setCurrentResults({...currentResults, [type.id]: e.target.value})}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 flex gap-4">
                            <button type="button" onClick={() => setShowResultsModal(false)} className="flex-1 py-3 text-slate-600 font-bold border rounded-xl">Cancelar</button>
                            <button type="submit" className="flex-[2] py-3 bg-green-600 text-white font-bold rounded-xl">Guardar Resultados</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {showReportModal && selectedRecordForReport && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 overflow-y-auto">
             <div className="fixed top-6 right-6 flex flex-col sm:flex-row gap-3 no-print z-[60]">
                <button onClick={handleDownloadPDF} className="bg-green-600 text-white px-5 py-3 rounded-full font-bold shadow-xl hover:bg-green-700 flex items-center gap-2">
                  <Download size={20} /> Descargar
                </button>
                <button onClick={() => window.print()} className="bg-indigo-600 text-white px-5 py-3 rounded-full font-bold shadow-xl hover:bg-indigo-700 flex items-center gap-2">
                  <Printer size={20} /> Imprimir
                </button>
                <button onClick={() => setShowReportModal(false)} className="bg-white text-slate-700 px-5 py-3 rounded-full font-bold shadow-xl border border-slate-200 flex items-center gap-2">
                  <X size={20} /> Cerrar
                </button>
             </div>

             <div className="flex min-h-full items-center justify-center p-4 py-20">
                <div id="report-preview" className="bg-white w-full max-w-[21cm] min-h-[29.7cm] shadow-2xl p-12 text-slate-800">
                    <div className="flex justify-between items-end border-b-2 border-indigo-600 pb-6 mb-8">
                       <div>
                          <h1 className="text-4xl font-bold text-slate-900">LabSync <span className="text-indigo-600">Pro</span></h1>
                          <p className="text-sm text-slate-500">Servicios Analíticos de Precisión</p>
                       </div>
                       <div className="text-right">
                          <h2 className="text-2xl font-bold text-slate-800">CERTIFICADO</h2>
                          <p className="text-sm">Folio: {selectedRecordForReport.sampleId}</p>
                       </div>
                    </div>
                    <div className="mb-12">
                       <h3 className="text-lg font-bold text-slate-800 mb-4">Resultados</h3>
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-slate-100 text-slate-600 text-xs">
                                <th className="px-4 py-3 border-b">Parámetro</th>
                                <th className="px-4 py-3 border-b text-right">Resultado</th>
                                <th className="px-4 py-3 border-b pl-6">Unidad</th>
                             </tr>
                          </thead>
                          <tbody>
                             {types.filter(t => selectedRecordForReport.analysisIds.includes(t.id)).map((type) => (
                                <tr key={type.id}>
                                   <td className="px-4 py-3 border-b font-bold">{type.name}</td>
                                   <td className="px-4 py-3 border-b text-right font-mono">{selectedRecordForReport.results?.[type.id] || '---'}</td>
                                   <td className="px-4 py-3 border-b pl-6 text-slate-500">{type.unit}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
