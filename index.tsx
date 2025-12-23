import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, 
  Users, 
  Beaker, 
  ClipboardList, 
  Plus, 
  DollarSign, 
  CheckCircle, 
  Trash2,
  X,
  Clock,
  Mail,
  Phone,
  Boxes,
  Settings,
  RefreshCw,
  Info,
  FlaskConical,
  Save,
  CloudSync,
  Briefcase,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

// --- Interfaces ---
type Status = 'Pendiente' | 'En Proceso' | 'Completado';
type Priority = 'Normal' | 'Urgente' | 'Crítico';

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
}

interface AnalysisType {
  id: string;
  name: string;
  baseCost: number;
  unit: string;
}

interface AnalysisRecord {
  id: string;
  Folio: string;      
  sampleName: string;    
  product: string;       
  clientId: string;
  technicianId: string;
  analysisIds: string[]; 
  results?: Record<string, string>; 
  receptionDate: string;
  deliveryDate: string;
  priority: Priority;
  cost: number;
  status: Status;
}

// --- Datos Maestros de Fábrica (Seed Data) ---
const SEED_CLIENTS: Client[] = [
  { id: 'c1', name: 'AgroIndustrias de México', contactName: 'Ing. Juan Pérez', email: 'juan@agro.mx', phone: '555-010-1010', address: 'Zona Industrial Nte' },
  { id: 'c2', name: 'Alimentos El Porvenir', contactName: 'Dra. María Luz', email: 'gerencia@porvenir.com', phone: '555-020-2020', address: 'Carretera Km 14' },
  { id: 'c3', name: 'Nutrición Animal Pro', contactName: 'Carlos Ruiz', email: 'cruiz@nutripro.mx', phone: '555-030-3030', address: 'Parque Logístico' }
];

const SEED_TECHS: Technician[] = [
  { id: 't1', name: 'Dra. Elena Ramos', specialty: 'Bromatología', email: 'eramos@laboratorio.com' },
  { id: 't2', name: 'Ing. Roberto Soto', specialty: 'Microbiología', email: 'rsoto@laboratorio.com' }
];

const SEED_TYPES: AnalysisType[] = [
  { id: 'a1', name: 'Humedad', baseCost: 150, unit: '%' },
  { id: 'a2', name: 'Proteína Cruda', baseCost: 350, unit: '%' },
  { id: 'a3', name: 'Grasa (Extracto Etéreo)', baseCost: 300, unit: '%' },
  { id: 'a4', name: 'Cenizas', baseCost: 180, unit: '%' },
  { id: 'a5', name: 'Fibra Cruda', baseCost: 320, unit: '%' },
  { id: 'a6', name: 'Aflatoxinas Totales', baseCost: 550, unit: 'ppb' }
];

const BASE_PRODUCTS = ["Sorgo", "Maíz Amarillo", "Trigo Panificable", "Harina de Soya", "Aceite Vegetal", "Pasta de Canola", "Alimento Fase Inicial"];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'clients' | 'techs' | 'types' | 'settings'>('dashboard');
  const [googleUrl, setGoogleUrl] = useState(() => localStorage.getItem('lab_google_url') || '');
  const [isSyncing, setIsSyncing] = useState(false);

  // --- Inicialización Forzada: Si el array está vacío o no existe, carga SEED ---
  const [clients, setClients] = useState<Client[]>(() => {
    const s = localStorage.getItem('lab_clients');
    if (!s) return SEED_CLIENTS;
    const parsed = JSON.parse(s);
    return parsed.length === 0 ? SEED_CLIENTS : parsed;
  });

  const [techs, setTechs] = useState<Technician[]>(() => {
    const s = localStorage.getItem('lab_techs');
    if (!s) return SEED_TECHS;
    const parsed = JSON.parse(s);
    return parsed.length === 0 ? SEED_TECHS : parsed;
  });

  const [types, setTypes] = useState<AnalysisType[]>(() => {
    const s = localStorage.getItem('lab_types');
    if (!s) return SEED_TYPES;
    const parsed = JSON.parse(s);
    return parsed.length === 0 ? SEED_TYPES : parsed;
  });

  const [analyses, setAnalyses] = useState<AnalysisRecord[]>(() => JSON.parse(localStorage.getItem('lab_analyses') || '[]'));

  // Persistencia en LocalStorage
  useEffect(() => {
    localStorage.setItem('lab_clients', JSON.stringify(clients));
    localStorage.setItem('lab_techs', JSON.stringify(techs));
    localStorage.setItem('lab_types', JSON.stringify(types));
    localStorage.setItem('lab_analyses', JSON.stringify(analyses));
    localStorage.setItem('lab_google_url', googleUrl);
  }, [clients, techs, types, analyses, googleUrl]);

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const [tempResults, setTempResults] = useState<Record<string, string>>({});

  const handleResetSystem = () => {
    if (confirm("¿Estás seguro de restablecer los datos? Se cargarán los datos de fábrica y se limpiará la caché.")) {
      setClients(SEED_CLIENTS);
      setTechs(SEED_TECHS);
      setTypes(SEED_TYPES);
      alert("Catálogos restablecidos.");
    }
  };

  const syncToSheets = async (payload: any) => {
    if (!googleUrl) return;
    setIsSyncing(true);
    try {
      await fetch(googleUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Error de Sincronización", e);
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  const generateFolio = () => {
    const d = new Date();
    const prefix = `LB${d.getFullYear().toString().substr(-2)}${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const count = analyses.filter(a => a.Folio.startsWith(prefix)).length + 1;
    return `${prefix}${count.toString().padStart(4, '0')}`;
  };

  const handleCreateAnalysis = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedAnalyses = types.filter(t => formData.get(`type-${t.id}`));
    const client = clients.find(c => c.id === formData.get('clientId'));
    const tech = techs.find(t => t.id === formData.get('techId'));
    
    const newRecord: AnalysisRecord = {
      id: Math.random().toString(36).substr(2, 9),
      Folio: generateFolio(),
      sampleName: formData.get('sampleName') as string,
      product: formData.get('product') as string,
      clientId: formData.get('clientId') as string,
      technicianId: formData.get('techId') as string,
      analysisIds: selectedAnalyses.map(t => t.id),
      receptionDate: new Date().toISOString().split('T')[0],
      deliveryDate: formData.get('deliveryDate') as string,
      priority: formData.get('priority') as Priority || 'Normal',
      cost: selectedAnalyses.reduce((sum, t) => sum + t.baseCost, 0),
      status: 'Pendiente'
    };

    setAnalyses([newRecord, ...analyses]);
    setShowAddModal(false);

    syncToSheets({
      "action": "create",
      "sampleId": newRecord.Folio,
      "receptionDate": newRecord.receptionDate,
      "sampleName": newRecord.sampleName,
      "product": newRecord.product,
      "clientName": client?.name || 'Varios',
      "techName": tech?.name || 'Asignado',
      "priority": newRecord.priority,
      "status": "Pendiente",
      "cost": newRecord.cost,
      "analisis": selectedAnalyses.map(t => t.name).join(", "),
      "deliveryDate": newRecord.deliveryDate
    });
  };

  const handleSaveResults = () => {
    if (!selectedRecord) return;
    
    const updated = analyses.map(a => {
      if (a.id === selectedRecord.id) {
        return { ...a, results: tempResults, status: 'Completado' as Status };
      }
      return a;
    });
    
    setAnalyses(updated);
    setShowResultsModal(false);

    const resultsString = Object.entries(tempResults)
      .map(([typeId, value]) => {
        const type = types.find(t => t.id === typeId);
        return `${type?.name}: ${value}${type?.unit || ''}`;
      })
      .join(" | ");

    syncToSheets({
      "action": "update_results",
      "sampleId": selectedRecord.Folio,
      "status": "Completado",
      "results": resultsString
    });
  };

  const renderTab = (id: typeof activeTab, icon: any, label: string) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-bold ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>
      {icon} <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans">
      <aside className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col gap-8 shadow-sm">
        <div className="flex items-center gap-3 text-indigo-600">
          <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-100"><Beaker size={28} /></div>
          <h1 className="text-2xl font-black tracking-tighter">LABSYNC <span className="text-slate-300">PRO</span></h1>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {renderTab('dashboard', <LayoutDashboard size={20}/>, 'Panel General')}
          {renderTab('analysis', <ClipboardList size={20}/>, 'Bitácora')}
          {renderTab('clients', <Users size={20}/>, 'Clientes')}
          {renderTab('techs', <Briefcase size={20}/>, 'Técnicos')}
          {renderTab('types', <Boxes size={20}/>, 'Catálogo')}
          <div className="mt-auto pt-6 border-t border-slate-100">
            {renderTab('settings', <Settings size={20}/>, 'Configuración')}
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 px-10 py-6 flex justify-between items-center z-20">
          <h2 className="text-2xl font-black capitalize tracking-tight text-slate-900">{activeTab}</h2>
          <div className="flex items-center gap-4">
            {isSyncing && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl font-black text-[10px] animate-pulse border border-amber-100 uppercase tracking-widest">
                <RefreshCw size={12} className="animate-spin"/> Nube Activa
              </div>
            )}
            <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 font-black text-xs border border-indigo-100 tracking-tighter uppercase">Sistema de Análisis</div>
          </div>
        </header>

        <div className="p-10 animate-in">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-5"><ClipboardList/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Muestras</p>
                  <h3 className="text-3xl font-black text-slate-900">{analyses.length}</h3>
                </div>
                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 mb-5"><CheckCircle/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Listas</p>
                  <h3 className="text-3xl font-black text-slate-900">{analyses.filter(a => a.status === 'Completado').length}</h3>
                </div>
                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="bg-amber-50 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-600 mb-5"><Clock/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">En Proceso</p>
                  <h3 className="text-3xl font-black text-slate-900">{analyses.filter(a => a.status === 'Pendiente').length}</h3>
                </div>
                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-5"><DollarSign/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Ingresos Est.</p>
                  <h3 className="text-3xl font-black text-slate-900">${analyses.reduce((s, a) => s + a.cost, 0).toLocaleString()}</h3>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="text-xl font-black mb-8">Flujo de Trabajo</h4>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyses.length > 0 ? analyses.slice(-7).reverse() : [{Folio: 'N/A', cost: 0}]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="Folio" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Area type="monotone" dataKey="cost" stroke="#4f46e5" fill="url(#colorCost)" strokeWidth={4} />
                        <defs>
                          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Bitácora de Entrada</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase mt-1">Conectado a Google Sheets</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-3 hover:scale-[1.02] transition-all shadow-lg"><Plus size={20}/> Registrar Entrada</button>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-10 py-6">Folio / Fecha</th>
                      <th className="px-10 py-6">Muestra / Producto</th>
                      <th className="px-10 py-6">Estatus</th>
                      <th className="px-10 py-6">Análisis</th>
                      <th className="px-10 py-6 text-right">Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyses.length === 0 ? (
                      <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest italic">No hay muestras registradas</td></tr>
                    ) : (
                      analyses.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6">
                            <div className="font-mono font-black text-indigo-600 text-xs">{a.Folio}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{a.receptionDate}</div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="font-black text-slate-900">{a.sampleName}</div>
                            <div className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter">{a.product}</div>
                          </td>
                          <td className="px-10 py-6">
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${a.status === 'Completado' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{a.status}</span>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {a.analysisIds.map(id => (
                                <span key={id} className="text-[9px] px-2 py-0.5 bg-slate-100 rounded-md font-black text-slate-500 uppercase">{types.find(t => t.id === id)?.name}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setSelectedRecord(a); setTempResults(a.results || {}); setShowResultsModal(true); }} className="p-3 bg-white text-indigo-600 border border-slate-100 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><FlaskConical size={18}/></button>
                              <button onClick={() => setAnalyses(analyses.filter(x => x.id !== a.id))} className="p-3 bg-white text-slate-300 border border-slate-100 rounded-xl hover:text-red-500 transition-all shadow-sm"><Trash2 size={18}/></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-8">
               <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-black">Directorio de Clientes</h3>
                  <button onClick={() => {
                     const n = prompt("Nombre Comercial:");
                     if(n) setClients([{ id: 'c'+Date.now(), name: n, contactName: 'Responsable', email: 'lab@correo.com', phone: '000-000', address: '' }, ...clients]);
                  }} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg"><Plus size={20}/> Nuevo Cliente</button>
               </div>
               <div className="grid grid-cols-3 gap-6">
                {clients.map(c => (
                  <div key={c.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group">
                    <button onClick={() => setClients(clients.filter(x => x.id !== c.id))} className="absolute top-6 right-6 p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                    <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 font-black text-xl">{c.name.charAt(0)}</div>
                    <h4 className="font-black text-lg text-slate-900">{c.name}</h4>
                    <p className="text-slate-400 text-[10px] font-black uppercase mb-4 tracking-tighter">{c.contactName}</p>
                    <div className="space-y-2 border-t border-slate-50 pt-4 text-xs text-slate-500">
                      <p className="flex items-center gap-2"><Mail size={14} className="text-indigo-300"/> {c.email}</p>
                      <p className="flex items-center gap-2"><Phone size={14} className="text-indigo-300"/> {c.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'techs' && (
             <div className="space-y-8">
               <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-black">Equipo de Analistas</h3>
                  <button onClick={() => {
                     const n = prompt("Nombre del Analista:");
                     if(n) setTechs([{ id: 't'+Date.now(), name: n, specialty: 'General', email: 'staff@lab.com' }, ...techs]);
                  }} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg"><Plus size={20}/> Nuevo Analista</button>
               </div>
               <div className="grid grid-cols-3 gap-6">
                  {techs.map(t => (
                    <div key={t.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 relative group">
                       <button onClick={() => setTechs(techs.filter(x => x.id !== t.id))} className="absolute top-4 right-4 p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                       <div className="bg-emerald-50 text-emerald-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl uppercase">{t.name.split(' ').map(n => n[0]).join('')}</div>
                       <div>
                          <h4 className="font-black text-slate-900 leading-tight">{t.name}</h4>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">{t.specialty}</p>
                       </div>
                    </div>
                  ))}
               </div>
             </div>
          )}

          {activeTab === 'types' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-black">Catálogo Bromatológico</h3>
                  <button onClick={() => {
                    const n = prompt("Nombre del Análisis:");
                    const c = prompt("Costo:");
                    if(n) setTypes([{ id: 'at'+Date.now(), name: n, baseCost: parseFloat(c || "0"), unit: '%' }, ...types]);
                  }} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg"><Plus size={20}/> Nuevo Estudio</button>
              </div>
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="px-10 py-6">Parámetro</th><th className="px-10 py-6">Unidad</th><th className="px-10 py-6 text-right">Costo Base</th><th className="px-10 py-6 text-right">Borrar</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {types.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50 group transition-colors">
                        <td className="px-10 py-6 font-black text-slate-800">{t.name}</td>
                        <td className="px-10 py-6 font-bold text-slate-400">{t.unit}</td>
                        <td className="px-10 py-6 text-right font-mono font-black text-emerald-600">${t.baseCost.toFixed(2)}</td>
                        <td className="px-10 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => setTypes(types.filter(x => x.id !== t.id))} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-8">
              <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <CloudSync className="text-indigo-600 mb-6" size={48}/>
                <h3 className="text-xl font-black mb-4">Conexión Google Sheets</h3>
                <p className="text-slate-400 text-sm mb-10 font-medium px-4">Introduce la URL de tu Web App para sincronizar los registros automáticamente.</p>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs focus:ring-4 focus:ring-indigo-100 outline-none transition-all mb-4" value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)} placeholder="https://script.google.com/..." />
                <button onClick={() => alert("Configuración guardada.")} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs">Guardar URL</button>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-4 text-left">
                    <div className="bg-red-50 p-4 rounded-2xl text-red-600"><AlertTriangle size={24}/></div>
                    <div>
                       <h4 className="font-black text-slate-900">Mantenimiento de Datos</h4>
                       <p className="text-xs text-slate-400 font-medium">Restablece catálogos a valores de fábrica.</p>
                    </div>
                 </div>
                 <button onClick={handleResetSystem} className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-red-600 hover:text-white transition-all"><RotateCcw size={16}/> Resetear</button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL: REGISTRO */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-white/20">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-2xl font-black">Nuevo Registro</h3>
                <button onClick={() => setShowAddModal(false)} className="p-4 bg-white rounded-2xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"><X/></button>
              </div>
              <form onSubmit={handleCreateAnalysis} className="p-10 space-y-10">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <input name="sampleName" required placeholder="ID Muestra / Lote *" className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-none font-black outline-none focus:ring-4 focus:ring-indigo-100" />
                    <select name="product" className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-none font-black outline-none">
                       {BASE_PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select name="techId" required className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-none font-black outline-none">
                       {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-6">
                    <select name="clientId" required className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-none font-black outline-none">
                       {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select name="priority" className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-none font-black outline-none">
                       <option value="Normal">Normal</option><option value="Urgente">Urgente</option><option value="Crítico">Crítico</option>
                    </select>
                    <div className="px-4"><label className="text-[10px] font-black text-slate-400 uppercase">Fecha Entrega</label>
                    <input type="date" name="deliveryDate" required className="w-full py-2 bg-transparent border-b-2 border-slate-100 font-black outline-none" /></div>
                  </div>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">Estudios Bromatológicos</h5>
                  <div className="grid grid-cols-3 gap-4">
                    {types.map(t => (
                      <label key={t.id} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 transition-all font-black text-[10px] has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 shadow-sm uppercase tracking-tighter">
                        <input type="checkbox" name={`type-${t.id}`} className="w-5 h-5 accent-indigo-600 rounded-lg" />
                        <span>{t.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3"><Save size={18}/> Guardar Registro</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: RESULTADOS */}
        {showResultsModal && selectedRecord && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
               <div className="p-10 bg-indigo-600 text-white flex justify-between items-center shadow-lg">
                  <div><h3 className="text-2xl font-black">Captura de Resultados</h3><p className="font-bold text-indigo-100 text-[10px] uppercase mt-1">FOLIO: {selectedRecord.Folio}</p></div>
                  <button onClick={() => setShowResultsModal(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all shadow-sm"><X size={24}/></button>
               </div>
               <div className="p-12 space-y-8">
                  <div className="grid grid-cols-1 gap-6 max-h-[45vh] overflow-y-auto px-2 custom-scroll">
                    {selectedRecord.analysisIds.map(aid => {
                      const type = types.find(t => t.id === aid);
                      return (
                        <div key={aid} className="space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">{type?.name} ({type?.unit})</label>
                           <input type="text" className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border-none font-black text-lg focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800" value={tempResults[aid] || ''} onChange={(e) => setTempResults({...tempResults, [aid]: e.target.value})} placeholder="0.00" />
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={handleSaveResults} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"><CheckCircle size={18}/> Finalizar y Sincronizar</button>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

