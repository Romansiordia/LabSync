
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
  ChevronRight
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  
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
      body * { visibility: hidden; }
      #report-preview, #report-preview * { visibility: visible; }
      #report-preview { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; background: white; z-index: 9999; box-shadow: none !important; }
      .no-print { display: none !important; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
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

  const handleOpenAnalysisModal = () => {
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
  };

  const handleOpenDetail = (record: AnalysisRecord) => {
    setSelectedRecordForDetail(record);
    setIsEditMode(false);
    setShowDetailModal(true);
  };

  // --- Fixes for undefined handler errors ---

  /** Opens the results capture modal for a specific record */
  const handleOpenResults = (record: AnalysisRecord) => {
    setSelectedRecordForResults(record);
    setCurrentResults(record.results || {});
    setShowResultsModal(true);
  };

  /** Opens the report preview modal for a completed analysis */
  const handleOpenReport = (record: AnalysisRecord) => {
    setSelectedRecordForReport(record);
    setShowReportModal(true);
  };

  /** Saves captured results and updates record status to Completed */
  const handleSaveResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForResults) return;

    const updatedRecord: AnalysisRecord = {
      ...selectedRecordForResults,
      results: currentResults,
      status: 'Completed'
    };

    setAnalyses(analyses.map(a => a.id === updatedRecord.id ? updatedRecord : a));
    setShowResultsModal(false);

    if (googleUrl) {
      const selectedClient = clients.find(c => c.id === updatedRecord.clientId);
      const selectedTech = techs.find(t => t.id === updatedRecord.technicianId);
      const formattedPayload: Record<string, string | number> = {
        "Folio": updatedRecord.sampleId,
        "Muestra": updatedRecord.sampleName,
        "Producto": updatedRecord.product,
        "Procedencia": updatedRecord.origin || "",
        "Proveedor": updatedRecord.provider || "",
        "Lote": updatedRecord.batch || "",
        "Cliente": selectedClient?.name || "N/A",
        "Técnico": selectedTech?.name || "N/A",
        "Fecha Recepción": updatedRecord.receptionDate,
        "Fecha Entrega": updatedRecord.deliveryDate,
        "Estatus": "Completado",
        "Costo": updatedRecord.cost
      };
      
      types.forEach(type => {
        if (updatedRecord.analysisIds.includes(type.id)) {
          formattedPayload[type.name] = currentResults[type.id] || "N.D.";
        }
      });
      
      syncWithGoogle(formattedPayload);
    }
    alert("Resultados guardados y sincronizados correctamente.");
  };

  const pullFromGoogle = async () => {
    if (!googleUrl) { alert("Por favor, configura la URL de Google Sheets en Configuración."); return; }
    setIsSyncing(true);
    try {
      const response = await fetch(googleUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        const mergedAnalyses = [...analyses];
        let updatedCount = 0; let newCount = 0;
        data.forEach((row: any) => {
          if (!row.Folio) return;
          const existingIndex = mergedAnalyses.findIndex(a => a.sampleId === row.Folio.toString());
          let mappedStatus: Status = 'Pending';
          if (row.Estatus === 'Completado') mappedStatus = 'Completed';
          if (row.Estatus === 'En Proceso') mappedStatus = 'In Progress';
          const results: Record<string, string> = {};
          types.forEach(t => { if (row[t.name] && row[t.name] !== "[SOLICITADO]") { results[t.id] = row[t.name].toString(); } });
          const analysisIds: string[] = [];
          types.forEach(t => { if (row[t.name]) analysisIds.push(t.id); });
          const newRecord: AnalysisRecord = {
            id: existingIndex !== -1 ? mergedAnalyses[existingIndex].id : `ext_${Date.now()}_${row.Folio}`,
            sampleId: row.Folio.toString(),
            sampleName: row.Muestra || "Muestra Importada",
            product: row.Producto || "General",
            origin: row.Procedencia || row.Origen || "",
            provider: row.Proveedor || "",
            batch: row.Lote || "",
            clientId: clients.find(c => c.id === row.Cliente)?.id || (clients.find(c => c.name === row.Cliente)?.id || (clients[0]?.id || "")),
            technicianId: techs.find(t => t.name === row.Técnico)?.id || (techs[0]?.id || ""),
            analysisIds: analysisIds,
            results: results,
            receptionDate: row["Fecha Recepción"] || new Date().toISOString().split('T')[0],
            deliveryDate: row["Fecha Entrega"] || new Date().toISOString().split('T')[0],
            priority: row.Prioridad || 'Normal',
            cost: parseFloat(row.Costo) || 0,
            status: mappedStatus
          };
          if (existingIndex !== -1) { mergedAnalyses[existingIndex] = newRecord; updatedCount++; } else { mergedAnalyses.push(newRecord); newCount++; }
        });
        setAnalyses(mergedAnalyses);
        setSyncStatus('success');
        alert(`Sincronización completa:\n- ${newCount} nuevas muestras.\n- ${updatedCount} actualizadas.`);
      }
    } catch (error) { setSyncStatus('error'); alert("Error al conectar con Google Sheets."); } finally { setIsSyncing(false); setTimeout(() => setSyncStatus('idle'), 3000); }
  };

  const syncWithGoogle = async (data: any) => {
    if (!googleUrl) return;
    setIsSyncing(true); setSyncStatus('idle');
    try {
      await fetch(googleUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      setSyncStatus('success'); setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) { setSyncStatus('error'); } finally { setIsSyncing(false); }
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForDetail) return;
    
    setAnalyses(analyses.map(a => a.id === selectedRecordForDetail.id ? selectedRecordForDetail : a));
    
    if (googleUrl) {
      const selectedClient = clients.find(c => c.id === selectedRecordForDetail.clientId);
      const selectedTech = techs.find(t => t.id === selectedRecordForDetail.technicianId);
      const formattedPayload: Record<string, string | number> = {
        "Folio": selectedRecordForDetail.sampleId,
        "Muestra": selectedRecordForDetail.sampleName,
        "Producto": selectedRecordForDetail.product,
        "Procedencia": selectedRecordForDetail.origin || "",
        "Proveedor": selectedRecordForDetail.provider || "",
        "Lote": selectedRecordForDetail.batch || "",
        "Cliente": selectedClient?.name || "N/A",
        "Técnico": selectedTech?.name || "N/A",
        "Fecha Recepción": selectedRecordForDetail.receptionDate,
        "Fecha Entrega": selectedRecordForDetail.deliveryDate,
        "Estatus": selectedRecordForDetail.status === 'Completed' ? "Completado" : selectedRecordForDetail.status === 'In Progress' ? "En Proceso" : "Pendiente",
        "Costo": selectedRecordForDetail.cost
      };
      syncWithGoogle(formattedPayload);
    }
    
    setIsEditMode(false);
    alert("Datos actualizados correctamente.");
  };

  const handleSubmitAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnalysis.clientId || !newAnalysis.sampleName || !newAnalysis.sampleId) { alert("Campos obligatorios faltantes."); return; }
    const selectedClient = clients.find(c => c.id === newAnalysis.clientId);
    const selectedTech = techs.find(t => t.id === newAnalysis.technicianId);
    const record: AnalysisRecord = { ...(newAnalysis as Required<Omit<AnalysisRecord, 'id' | 'results' | 'comments'>>), id: `a${Date.now()}`, results: {}, comments: "" } as AnalysisRecord;
    setAnalyses([record, ...analyses]);
    setShowAnalysisModal(false);
    if (googleUrl) {
       const formattedPayload: Record<string, string | number> = {
          "Folio": record.sampleId, "Muestra": record.sampleName, "Producto": record.product, "Procedencia": record.origin || "", "Proveedor": record.provider || "", "Lote": record.batch || "",
          "Cliente": selectedClient?.name || "N/A", "Técnico": selectedTech?.name || "N/A", "Fecha Recepción": record.receptionDate, "Fecha Entrega": record.deliveryDate, "Estatus": "Pendiente", "Costo": record.cost
       };
       types.forEach(type => { if ((record.analysisIds || []).includes(type.id)) { formattedPayload[type.name] = "[SOLICITADO]"; } });
       syncWithGoogle(formattedPayload);
    }
  };

  const toggleAnalysisSelection = (typeId: string, baseCost: number, isEdit: boolean = false) => {
    if (isEdit && selectedRecordForDetail) {
        const currentIds = selectedRecordForDetail.analysisIds || [];
        let newIds = currentIds.includes(typeId) ? currentIds.filter(id => id !== typeId) : [...currentIds, typeId];
        let newCost = newIds.reduce((acc, id) => acc + (types.find(t => t.id === id)?.baseCost || 0), 0);
        setSelectedRecordForDetail({ ...selectedRecordForDetail, analysisIds: newIds, cost: newCost });
    } else {
        const currentIds = newAnalysis.analysisIds || [];
        let newIds = currentIds.includes(typeId) ? currentIds.filter(id => id !== typeId) : [...currentIds, typeId];
        let newCost = newIds.reduce((acc, id) => acc + (types.find(t => t.id === id)?.baseCost || 0), 0);
        setNewAnalysis({ ...newAnalysis, analysisIds: newIds, cost: newCost });
    }
  };

  const renderSidebarItem = (id: typeof activeTab, icon: React.ReactNode, label: string) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon} <span className="font-medium">{label}</span>
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
            {renderSidebarItem('analysis', <ClipboardList size={20} />, 'Bitácora')}
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
           </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6 animate-in">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Bitácora de Recepción</h3>
                  <p className="text-slate-500 text-sm">Gestiona y consulta el historial de ingresos del laboratorio.</p>
                </div>
                <button onClick={handleOpenAnalysisModal} className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg font-bold">
                  <Plus size={20} /> Registrar Muestra
                </button>
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
                      {analyses.length === 0 ? (
                        <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-medium">No hay registros locales. Actualiza desde la nube.</td></tr>
                      ) : analyses.map(record => (
                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <button onClick={() => handleOpenDetail(record)} className="flex flex-col text-left group-hover:translate-x-1 transition-transform">
                              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-1">{record.sampleId}</span>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold uppercase"><Calendar size={10} /> {record.receptionDate}</span>
                            </button>
                          </td>
                          <td className="px-6 py-4 cursor-pointer" onClick={() => handleOpenDetail(record)}>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{record.sampleName}</span>
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
                             <button onClick={() => handleOpenResults(record)} title="Capturar Resultados" className="text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg border border-indigo-100 bg-white shadow-sm"><FlaskConical size={16} /></button>
                             {record.status === 'Completed' && (
                               <button onClick={() => handleOpenReport(record)} title="Imprimir Reporte" className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm"><Printer size={16} /></button>
                             )}
                             <button onClick={() => setAnalyses(analyses.filter(a => a.id !== record.id))} className="text-red-400 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
               <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-6"><div className="bg-indigo-600 p-3 rounded-2xl text-white"><Zap size={24} /></div><h3 className="text-xl font-bold text-slate-900">Enlace con Google Sheets</h3></div>
                  <div className="space-y-4">
                    <input type="text" placeholder="URL de Google Apps Script" className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none font-mono text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500" value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)} />
                    <button onClick={() => alert("URL Guardada")} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all">Guardar Configuración</button>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* MODAL DETALLE / EDICIÓN */}
        {showDetailModal && selectedRecordForDetail && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in">
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                   <div className="bg-indigo-600 p-3 rounded-2xl text-white"><Info size={24}/></div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900">{isEditMode ? 'Edición de Ingreso' : 'Expediente de Muestra'}</h3>
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Folio: {selectedRecordForDetail.sampleId}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   {!isEditMode && (
                      <button onClick={() => setIsEditMode(true)} className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 flex items-center gap-2"><Edit2 size={16}/> Editar Datos</button>
                   )}
                   <button onClick={() => setShowDetailModal(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400"><X size={24}/></button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10">
                {isEditMode ? (
                  <form onSubmit={handleUpdateRecord} className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre Muestra</label>
                           <input type="text" className="w-full px-5 py-3.5 rounded-2xl border bg-slate-50 focus:bg-white transition-all font-bold" value={selectedRecordForDetail.sampleName} onChange={(e) => setSelectedRecordForDetail({...selectedRecordForDetail, sampleName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1">Producto</label>
                           <select className="w-full px-5 py-3.5 rounded-2xl border bg-slate-50 font-bold" value={selectedRecordForDetail.product} onChange={(e) => setSelectedRecordForDetail({...selectedRecordForDetail, product: e.target.value})}>
                              {products.map(p => <option key={p} value={p}>{p}</option>)}
                           </select>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1">Procedencia / Origen</label>
                           <input type="text" className="w-full px-5 py-3.5 rounded-2xl border bg-slate-50 font-bold" value={selectedRecordForDetail.origin} onChange={(e) => setSelectedRecordForDetail({...selectedRecordForDetail, origin: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1">Proveedor</label>
                           <input type="text" className="w-full px-5 py-3.5 rounded-2xl border bg-slate-50 font-bold" value={selectedRecordForDetail.provider} onChange={(e) => setSelectedRecordForDetail({...selectedRecordForDetail, provider: e.target.value})} />
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1">Número de Lote</label>
                           <input type="text" className="w-full px-5 py-3.5 rounded-2xl border bg-slate-50 font-bold" value={selectedRecordForDetail.batch} onChange={(e) => setSelectedRecordForDetail({...selectedRecordForDetail, batch: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1">Cliente</label>
                           <select className="w-full px-5 py-3.5 rounded-2xl border bg-slate-50 font-bold" value={selectedRecordForDetail.clientId} onChange={(e) => setSelectedRecordForDetail({...selectedRecordForDetail, clientId: e.target.value})}>
                              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                        </div>
                     </div>
                     <div className="pt-6 flex gap-4">
                        <button type="button" onClick={() => setIsEditMode(false)} className="flex-1 py-4 text-slate-500 font-bold border rounded-2xl hover:bg-slate-50">Descartar</button>
                        <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"><Save size={20}/> Guardar Cambios en Nube</button>
                     </div>
                  </form>
                ) : (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                          <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 mb-3"><Package size={24}/></div>
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Producto</p>
                          <h4 className="font-bold text-slate-800">{selectedRecordForDetail.product}</h4>
                       </div>
                       <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                          <div className="bg-orange-100 p-3 rounded-2xl text-orange-600 mb-3"><Hash size={24}/></div>
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Número de Lote</p>
                          <h4 className="font-bold text-slate-800">{selectedRecordForDetail.batch || 'Sin Registro'}</h4>
                       </div>
                       <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                          <div className="bg-green-100 p-3 rounded-2xl text-green-600 mb-3"><Truck size={24}/></div>
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Proveedor</p>
                          <h4 className="font-bold text-slate-800">{selectedRecordForDetail.provider || 'N/A'}</h4>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                       <div className="space-y-6">
                          <h5 className="font-black text-slate-900 border-l-4 border-indigo-600 pl-4 uppercase text-xs tracking-widest">Detalles de Logística</h5>
                          <div className="space-y-4">
                             <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <Globe className="text-slate-400" size={20}/>
                                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Procedencia / Origen</p><p className="font-bold text-slate-700">{selectedRecordForDetail.origin || 'Desconocido'}</p></div>
                             </div>
                             <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <Users className="text-slate-400" size={20}/>
                                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Cliente</p><p className="font-bold text-slate-700">{clients.find(c => c.id === selectedRecordForDetail.clientId)?.name}</p></div>
                             </div>
                             <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <UserIcon className="text-slate-400" size={20}/>
                                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Técnico Asignado</p><p className="font-bold text-slate-700">{techs.find(t => t.id === selectedRecordForDetail.technicianId)?.name}</p></div>
                             </div>
                          </div>
                       </div>
                       <div className="space-y-6">
                          <h5 className="font-black text-slate-900 border-l-4 border-indigo-600 pl-4 uppercase text-xs tracking-widest">Tiempos y Costos</h5>
                          <div className="bg-indigo-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                             <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-center">
                                   <div className="flex items-center gap-3">
                                      <Calendar size={18} className="text-indigo-400"/>
                                      <div><p className="text-[10px] uppercase font-bold text-indigo-400">Ingreso</p><p className="font-bold">{selectedRecordForDetail.receptionDate}</p></div>
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <Clock size={18} className="text-indigo-400"/>
                                      <div><p className="text-[10px] uppercase font-bold text-indigo-400">Entrega Estimada</p><p className="font-bold text-orange-400">{selectedRecordForDetail.deliveryDate}</p></div>
                                   </div>
                                </div>
                                <div className="pt-6 border-t border-indigo-800">
                                   <p className="text-[10px] uppercase font-bold text-indigo-400 mb-2">Inversión del Análisis</p>
                                   <div className="flex items-baseline gap-2">
                                      <span className="text-4xl font-black">${selectedRecordForDetail.cost.toLocaleString()}</span>
                                      <span className="text-indigo-400 text-sm font-bold">MXN</span>
                                   </div>
                                </div>
                             </div>
                             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full"></div>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* OTROS MODALES (INGRESOS, RESULTADOS, REPORTES) */}
        {showAnalysisModal && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in">
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <h3 className="text-2xl font-bold text-slate-900">Registro de Muestra</h3>
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
                   <input type="text" placeholder="Procedencia / Origen" className="w-full px-5 py-3.5 rounded-2xl border" value={newAnalysis.origin || ''} onChange={(e) => setNewAnalysis({...newAnalysis, origin: e.target.value})} />
                   <input type="text" placeholder="Proveedor" className="w-full px-5 py-3.5 rounded-2xl border" value={newAnalysis.provider || ''} onChange={(e) => setNewAnalysis({...newAnalysis, provider: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <input type="text" placeholder="Lote" className="w-full px-5 py-3.5 rounded-2xl border" value={newAnalysis.batch || ''} onChange={(e) => setNewAnalysis({...newAnalysis, batch: e.target.value})} />
                   <div className="relative">
                      <span className="absolute left-4 top-2 text-[10px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1"><Lock size={10} /> Folio Automático</span>
                      <input type="text" readOnly className="w-full px-5 pt-6 pb-2 rounded-2xl border bg-indigo-50/50 text-indigo-900 font-bold border-indigo-200" value={newAnalysis.sampleId || ''} />
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select required className="w-full px-5 py-3.5 rounded-2xl border bg-white" value={newAnalysis.clientId || ''} onChange={(e) => setNewAnalysis({...newAnalysis, clientId: e.target.value})}>
                    <option value="">Seleccionar Cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select className="w-full px-5 py-3.5 rounded-2xl border bg-white" value={newAnalysis.technicianId || ''} onChange={(e) => setNewAnalysis({...newAnalysis, technicianId: e.target.value})}>
                    <option value="">Asignar Técnico...</option>
                    {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-widest">Seleccionar Análisis</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {types.map(t => {
                            const isSelected = (newAnalysis.analysisIds || []).includes(t.id);
                            return (
                                <button key={t.id} type="button" onClick={() => toggleAnalysisSelection(t.id, t.baseCost)} className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                                    <div><div className="font-bold text-sm">{t.name}</div><div className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>${t.baseCost} / {t.unit}</div></div>
                                </button>
                            )
                        })}
                    </div>
                </div>
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setShowAnalysisModal(false)} className="flex-1 py-4 text-slate-600 font-bold border rounded-2xl">Cancelar</button>
                  <button type="submit" disabled={isSyncing} className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700">Confirmar Registro</button>
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

        {showReportModal && selectedRecordForReport && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[70] overflow-y-auto">
             <div className="fixed top-6 right-6 flex flex-col sm:flex-row gap-3 no-print z-[80]">
                <button onClick={() => window.print()} className="bg-indigo-600 text-white px-5 py-3 rounded-full font-bold shadow-xl hover:bg-indigo-700 flex items-center gap-2"><Printer size={20} /> Imprimir</button>
                <button onClick={() => setShowReportModal(false)} className="bg-white text-slate-700 px-5 py-3 rounded-full font-bold shadow-xl border border-slate-200 flex items-center gap-2"><X size={20} /> Cerrar</button>
             </div>
             <div className="flex min-h-full items-center justify-center p-4 py-20">
                <div id="report-preview" className="bg-white w-full max-w-[21cm] min-h-[29.7cm] shadow-2xl p-12 text-slate-800">
                    <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-6 mb-8">
                       <div className="flex items-center gap-4">
                          <div className="bg-indigo-600 p-2 rounded-lg text-white"><Beaker size={32} /></div>
                          <div><h1 className="text-3xl font-extrabold text-slate-900">LabSync <span className="text-indigo-600">Pro</span></h1><p className="text-xs text-slate-500 font-bold uppercase">Excelencia Analítica</p></div>
                       </div>
                       <div className="text-right">
                          <h2 className="text-2xl font-black text-indigo-700">CERTIFICADO</h2>
                          <div className="bg-slate-100 px-3 py-1 rounded-lg inline-block border border-slate-200"><p className="text-sm font-bold text-slate-600">FOLIO: <span className="font-mono text-indigo-600">{selectedRecordForReport.sampleId}</span></p></div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10 mb-10">
                       <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                          <h3 className="text-[10px] font-black uppercase text-indigo-500 mb-3 flex items-center gap-2"><Users size={12}/> Cliente</h3>
                          <p className="text-lg font-bold text-slate-900">{clients.find(c => c.id === selectedRecordForReport.clientId)?.name || 'N/A'}</p>
                          <p className="text-sm text-slate-600 leading-tight mb-2">{clients.find(c => c.id === selectedRecordForReport.clientId)?.address}</p>
                          <p className="text-xs text-indigo-600 font-bold">At'n: {clients.find(c => c.id === selectedRecordForReport.clientId)?.contactName}</p>
                       </div>
                       <div className="p-5 rounded-2xl border border-slate-100 bg-white">
                          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2"><ShieldAlert size={12}/> Técnico</h3>
                          <p className="text-base font-bold text-slate-800">{techs.find(t => t.id === selectedRecordForReport.technicianId)?.name}</p>
                          <p className="text-xs font-bold text-indigo-500 uppercase">{techs.find(t => t.id === selectedRecordForReport.technicianId)?.specialty}</p>
                          <div className="mt-4 pt-4 border-t border-slate-50">
                             <p className="text-[10px] text-slate-400">Recepción: <span className="text-slate-700 font-bold">{selectedRecordForReport.receptionDate}</span></p>
                             <p className="text-[10px] text-slate-400">Emisión: <span className="text-indigo-600 font-bold">{new Date().toLocaleDateString('es-MX')}</span></p>
                          </div>
                       </div>
                    </div>
                    <div className="mb-10 p-6 bg-indigo-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
                       <h3 className="text-[10px] font-black uppercase text-indigo-300 mb-4 flex items-center gap-2"><Hash size={12}/> Identificación</h3>
                       <div className="grid grid-cols-4 gap-6 relative z-10">
                          <div><p className="text-[10px] text-indigo-300 uppercase mb-1">Muestra</p><p className="text-base font-bold">{selectedRecordForReport.sampleName}</p></div>
                          <div><p className="text-[10px] text-indigo-300 uppercase mb-1">Producto</p><p className="text-base font-bold">{selectedRecordForReport.product}</p></div>
                          <div><p className="text-[10px] text-indigo-300 uppercase mb-1">Lote</p><p className="text-base font-bold">{selectedRecordForReport.batch || 'S/L'}</p></div>
                          <div><p className="text-[10px] text-indigo-300 uppercase mb-1">Origen</p><p className="text-base font-bold">{selectedRecordForReport.origin || 'N/A'}</p></div>
                       </div>
                    </div>
                    <div className="mb-12 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                       <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50"><tr className="text-slate-600 text-[10px] font-black uppercase"><th className="px-8 py-4 border-b">Parámetro</th><th className="px-8 py-4 border-b text-center">Unidad</th><th className="px-8 py-4 border-b text-right">Resultado</th></tr></thead>
                          <tbody className="divide-y divide-slate-100">
                             {types.filter(t => selectedRecordForReport.analysisIds.includes(t.id)).map((type) => (
                                <tr key={type.id}><td className="px-8 py-5 font-bold text-slate-900">{type.name}</td><td className="px-8 py-5 text-center text-slate-500 italic">{type.unit}</td><td className="px-8 py-5 text-right font-mono font-black text-indigo-600 text-lg">{selectedRecordForReport.results?.[type.id] || 'N.D.'}</td></tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                    <div className="mt-auto pt-20 grid grid-cols-2 gap-20">
                       <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed">Certificado emitido electrónicamente. Resultados definitivos para la muestra bajo estudio.</p>
                       <div className="flex flex-col items-center"><div className="w-full border-b-2 border-slate-300 mb-2"></div><p className="text-xs font-black text-slate-800 uppercase tracking-widest">Firma Autorizada</p></div>
                    </div>
                    <div className="mt-10 pt-8 border-t border-slate-100 text-[9px] text-slate-400 font-bold flex justify-between uppercase"><span>LabSync Pro ERP Cloud</span><span>ISO 9001:2015</span></div>
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
