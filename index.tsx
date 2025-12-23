
import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, 
  Users, 
  Beaker, 
  ClipboardList, 
  TrendingUp, 
  Plus, 
  DollarSign, 
  CheckCircle, 
  Trash2,
  Calendar,
  X,
  Clock,
  MapPin, 
  User as UserIcon,
  Mail,
  Phone,
  Activity,
  Boxes,
  Truck,
  Globe,
  Settings,
  RefreshCw,
  Printer,
  Info,
  ChevronRight,
  FlaskConical,
  Save,
  CloudSync,
  CheckSquare,
  Square,
  Briefcase
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
}

// --- Datos Iniciales ---
const DEFAULT_CLIENTS: Client[] = [
  { id: 'c1', name: 'AgroIndustrias S.A.', contactName: 'Ing. Juan Pérez', email: 'juan@agro.com', phone: '555-0101', address: 'Zona Industrial 1' },
  { id: 'c2', name: 'Granja El Porvenir', contactName: 'Dra. María Luz', email: 'maria@porvenir.com', phone: '555-0202', address: 'Sector Rural Km 12' },
  { id: 'c3', name: 'Nutrición Animal del Norte', contactName: 'Carlos Ruiz', email: 'carlos@norte.com', phone: '555-0303', address: 'Parque Logístico B' }
];

const DEFAULT_TECHS: Technician[] = [
  { id: 't1', name: 'Dr. Elena Ramos', specialty: 'Bromatología', email: 'elena@lab.com' },
  { id: 't2', name: 'Ing. Roberto Soto', specialty: 'Microbiología', email: 'roberto@lab.com' }
];

const DEFAULT_TYPES: AnalysisType[] = [
  { id: 'a1', name: 'Humedad', baseCost: 120, unit: '%' },
  { id: 'a2', name: 'Proteína Cruda', baseCost: 250, unit: '%' },
  { id: 'a3', name: 'Grasa (Extracto Etéreo)', baseCost: 220, unit: '%' },
  { id: 'a4', name: 'Cenizas', baseCost: 150, unit: '%' },
  { id: 'a5', name: 'Fibra Cruda', baseCost: 280, unit: '%' },
  { id: 'a6', name: 'Aflatoxinas', baseCost: 450, unit: 'ppb' }
];

const BASE_PRODUCTS = ["Sorgo", "Maíz", "Trigo", "Alimento Fase 1", "Harina de Soya", "Aceite vegetal", "Premezcla Vitamínica", "Núcleo Porcino", "Pasta de Canola"];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'clients' | 'techs' | 'types' | 'settings'>('dashboard');
  const [googleUrl, setGoogleUrl] = useState(() => localStorage.getItem('lab_google_url') || '');
  const [isSyncing, setIsSyncing] = useState(false);

  // Estados con Persistencia y Datos Iniciales
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('lab_clients');
    return saved ? JSON.parse(saved) : DEFAULT_CLIENTS;
  });
  const [techs, setTechs] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('lab_techs');
    return saved ? JSON.parse(saved) : DEFAULT_TECHS;
  });
  const [types, setTypes] = useState<AnalysisType[]>(() => {
    const saved = localStorage.getItem('lab_types');
    return saved ? JSON.parse(saved) : DEFAULT_TYPES;
  });
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>(() => JSON.parse(localStorage.getItem('lab_analyses') || '[]'));

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const [tempResults, setTempResults] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem('lab_clients', JSON.stringify(clients));
    localStorage.setItem('lab_techs', JSON.stringify(techs));
    localStorage.setItem('lab_types', JSON.stringify(types));
    localStorage.setItem('lab_analyses', JSON.stringify(analyses));
    localStorage.setItem('lab_google_url', googleUrl);
  }, [clients, techs, types, analyses, googleUrl]);

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
      console.error("Sync Error", e);
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  const generateFolio = () => {
    const date = new Date();
    const prefix = `L${date.getFullYear().toString().substr(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
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
      origin: formData.get('origin') as string,
      provider: formData.get('provider') as string,
      batch: formData.get('batch') as string,
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

    // Enviar a Google Sheets
    syncToSheets({
      "action": "create",
      "sampleId": newRecord.Folio,
      "receptionDate": newRecord.receptionDate,
      "sampleName": newRecord.sampleName,
      "product": newRecord.product,
      "clientName": client?.name || 'Cliente Particular',
      "techName": tech?.name || 'Asignación Pendiente',
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

    // Formatear resultados para la columna K del Sheet
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
          {renderTab('dashboard', <LayoutDashboard size={20}/>, 'Dashboard')}
          {renderTab('analysis', <ClipboardList size={20}/>, 'Bitácora')}
          {renderTab('clients', <Users size={20}/>, 'Clientes')}
          {renderTab('techs', <Briefcase size={20}/>, 'Técnicos')}
          {renderTab('types', <Boxes size={20}/>, 'Catálogo')}
          <div className="mt-auto pt-6 border-t border-slate-100">
            {renderTab('settings', <Settings size={20}/>, 'Ajustes')}
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 px-10 py-6 flex justify-between items-center z-20">
          <h2 className="text-2xl font-black capitalize tracking-tight text-slate-900">{activeTab}</h2>
          <div className="flex items-center gap-4">
            {isSyncing && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl font-black text-[10px] animate-pulse border border-amber-100">
                <RefreshCw size={12} className="animate-spin"/> SINCRONIZANDO...
              </div>
            )}
            <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 font-black text-xs border border-indigo-100">MODO DIRECTO ACTIVO</div>
          </div>
        </header>

        <div className="p-10 animate-in">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-5"><ClipboardList/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Muestras Totales</p>
                  <h3 className="text-3xl font-black text-slate-900">{analyses.length}</h3>
                </div>
                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 mb-5"><CheckCircle/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Completadas</p>
                  <h3 className="text-3xl font-black text-slate-900">{analyses.filter(a => a.status === 'Completado').length}</h3>
                </div>
                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="bg-amber-50 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-600 mb-5"><Clock/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">En Espera</p>
                  <h3 className="text-3xl font-black text-slate-900">{analyses.filter(a => a.status === 'Pendiente').length}</h3>
                </div>
                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-5"><DollarSign/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Facturación Est.</p>
                  <h3 className="text-3xl font-black text-slate-900">${analyses.reduce((s, a) => s + a.cost, 0).toLocaleString()}</h3>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="text-xl font-black mb-8">Flujo Mensual</h4>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyses.slice(-10).reverse()}>
                        <defs>
                          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="cost" stroke="#4f46e5" fill="url(#colorCost)" strokeWidth={4} />
                        <Tooltip />
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
                  <h3 className="text-xl font-black text-slate-900">Muestras en Proceso</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase mt-1">Sincronizado con Google Bitácora</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-3 hover:scale-[1.02] transition-all shadow-lg shadow-indigo-100"><Plus size={20}/> Nueva Muestra</button>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-10 py-6">Folio / Fecha</th>
                      <th className="px-10 py-6">Detalle Muestra</th>
                      <th className="px-10 py-6">Estatus</th>
                      <th className="px-10 py-6">Análisis</th>
                      <th className="px-10 py-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyses.length === 0 ? (
                      <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest italic">No hay registros aún</td></tr>
                    ) : (
                      analyses.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6">
                            <div className="font-mono font-black text-indigo-600 text-xs">{a.Folio}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{a.receptionDate}</div>
                          </td>
                          <td className="px-10 py-6 font-black text-slate-900">
                            {a.sampleName}
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[9px] text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase font-bold">{a.product}</span>
                               <span className="text-[9px] text-slate-400 uppercase font-bold">{clients.find(c => c.id === a.clientId)?.name}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${a.status === 'Completado' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{a.status}</span>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {a.analysisIds.map(id => (
                                <span key={id} className="text-[9px] px-2 py-0.5 bg-slate-100 rounded-md font-black text-slate-400 uppercase">{types.find(t => t.id === id)?.name}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setSelectedRecord(a); setTempResults(a.results || {}); setShowResultsModal(true); }} className="p-3 bg-white text-indigo-600 border border-slate-100 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="Capturar Resultados"><FlaskConical size={18}/></button>
                              <button onClick={() => setAnalyses(analyses.filter(x => x.id !== a.id))} className="p-3 bg-white text-slate-300 border border-slate-100 rounded-xl hover:text-red-500 transition-all"><Trash2 size={18}/></button>
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
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black">Directorio de Clientes</h3>
                  <button onClick={() => {
                     const n = prompt("Nombre de la Empresa:");
                     const c = prompt("Nombre del Contacto:");
                     const e = prompt("Email:");
                     if(n && c) setClients([...clients, { id: 'c'+Date.now(), name: n, contactName: c, email: e || 'N/A', phone: '000', address: '' }]);
                  }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"><Plus size={16}/> Nuevo Cliente</button>
               </div>
               <div className="grid grid-cols-3 gap-6">
                {clients.map(c => (
                  <div key={c.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group">
                    <button onClick={() => setClients(clients.filter(x => x.id !== c.id))} className="absolute top-6 right-6 p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                    <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 font-black text-xl">{c.name.charAt(0)}</div>
                    <h4 className="font-black text-lg text-slate-900">{c.name}</h4>
                    <p className="text-slate-400 text-[10px] font-black uppercase mb-4 tracking-tighter">{c.contactName}</p>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 flex items-center gap-2 font-medium"><Mail size={14}/> {c.email}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-2 font-medium"><Phone size={14}/> {c.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'techs' && (
             <div className="space-y-8">
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black">Cuerpo Técnico</h3>
                  <button onClick={() => {
                     const n = prompt("Nombre Completo:");
                     const s = prompt("Especialidad:");
                     if(n) setTechs([...techs, { id: 't'+Date.now(), name: n, specialty: s || 'General', email: 'lab@correo.com' }]);
                  }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"><Plus size={16}/> Registrar Técnico</button>
               </div>
               <div className="grid grid-cols-3 gap-6">
                  {techs.map(t => (
                    <div key={t.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                       <div className="bg-emerald-50 text-emerald-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl uppercase">{t.name.split(' ').map(n => n[0]).join('')}</div>
                       <div>
                          <h4 className="font-black text-slate-900">{t.name}</h4>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t.specialty}</p>
                          <p className="text-xs text-slate-400 mt-1 font-medium">{t.email}</p>
                       </div>
                    </div>
                  ))}
               </div>
             </div>
          )}

          {activeTab === 'types' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black">Catálogo de Análisis</h3>
                  <button onClick={() => {
                    const n = prompt("Nombre del Análisis:");
                    const c = parseFloat(prompt("Costo:") || "0");
                    const u = prompt("Unidad:") || "%";
                    if(n) setTypes([...types, {id: 'at'+Date.now(), name: n, baseCost: c, unit: u}]);
                  }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg"><Plus size={16}/> Agregar Estudio</button>
              </div>
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="px-10 py-6">Estudio / Parámetro</th><th className="px-10 py-6">Unidad</th><th className="px-10 py-6 text-right">Costo Base</th><th className="px-10 py-6 text-right">Acción</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {types.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50 group">
                        <td className="px-10 py-6 font-black text-slate-800">{t.name}</td>
                        <td className="px-10 py-6 font-bold text-slate-400">{t.unit}</td>
                        <td className="px-10 py-6 text-right font-mono font-black text-emerald-600 text-sm">${t.baseCost.toFixed(2)}</td>
                        <td className="px-10 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => setTypes(types.filter(x => x.id !== t.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center">
              <CloudSync className="text-indigo-600 mb-6" size={48}/>
              <h3 className="text-xl font-black mb-4">Sincronización con Google</h3>
              <p className="text-slate-400 text-center text-sm mb-10 px-6 font-medium">Conecta tu Web App de Google para que todos los registros se guarden automáticamente en tu hoja de cálculo.</p>
              <div className="w-full space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Web App URL (Script)</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs focus:ring-4 focus:ring-indigo-100 outline-none" value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" />
                <button onClick={() => alert("URL Guardada")} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all text-xs uppercase tracking-widest">Verificar Conexión</button>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Registro de Muestra */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in">
            <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-white/20">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-2xl font-black">Registrar Muestra</h3>
                <button onClick={() => setShowAddModal(false)} className="p-3 bg-white rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><X/></button>
              </div>
              <form onSubmit={handleCreateAnalysis} className="p-10 space-y-10">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <input name="sampleName" required placeholder="Identificación de Muestra (Lote, ID) *" className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black outline-none" />
                    <select name="product" className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black outline-none focus:ring-4 focus:ring-indigo-50">
                       <option value="">Seleccionar Producto...</option>
                       {BASE_PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select name="techId" required className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black outline-none">
                       <option value="">Asignar Técnico Especialista *</option>
                       {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-6">
                    <select name="clientId" required className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black outline-none focus:ring-4 focus:ring-indigo-50">
                       <option value="">Seleccionar Cliente *</option>
                       {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select name="priority" className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black outline-none">
                       <option value="Normal">Prioridad: Normal</option>
                       <option value="Urgente">Prioridad: Urgente</option>
                       <option value="Crítico">Prioridad: Crítico</option>
                    </select>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 font-black">Fecha Compromiso</label>
                       <input type="date" name="deliveryDate" required className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black outline-none" />
                    </div>
                  </div>
                </div>
                <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">Estudios Solicitados</h5>
                  <div className="grid grid-cols-3 gap-4">
                    {types.map(t => (
                      <label key={t.id} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 transition-all font-black text-[10px] has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 shadow-sm">
                        <input type="checkbox" name={`type-${t.id}`} className="w-4 h-4 accent-indigo-600" />
                        <div className="flex-1">
                           <p className="font-black">{t.name}</p>
                           <p className="text-[8px] text-slate-400 font-bold">${t.baseCost} - {t.unit}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs">Crear Registro y Sincronizar</button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Resultados de Análisis */}
        {showResultsModal && selectedRecord && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in">
            <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
               <div className="p-10 bg-indigo-600 text-white flex justify-between items-center shadow-lg">
                  <div>
                    <h3 className="text-2xl font-black">Captura de Resultados</h3>
                    <p className="font-bold text-indigo-100 text-[10px] uppercase tracking-widest">FOLIO: {selectedRecord.Folio} | {selectedRecord.sampleName}</p>
                  </div>
                  <button onClick={() => setShowResultsModal(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all shadow-sm"><X size={24}/></button>
               </div>
               <div className="p-12 space-y-8">
                  <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[1.5rem] flex gap-4 text-indigo-700">
                    <Info className="shrink-0" size={20}/>
                    <p className="text-[11px] font-bold uppercase tracking-wide leading-relaxed">Los resultados se enviarán concatenados a la columna K de tu Google Sheet.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 max-h-[50vh] overflow-y-auto px-2">
                    {selectedRecord.analysisIds.map(aid => {
                      const type = types.find(t => t.id === aid);
                      return (
                        <div key={aid} className="space-y-2 group">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">{type?.name} ({type?.unit})</label>
                           <input type="text" className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black text-lg focus:ring-4 focus:ring-indigo-100/50 outline-none transition-all text-slate-800" value={tempResults[aid] || ''} onChange={(e) => setTempResults({...tempResults, [aid]: e.target.value})} placeholder="Ingrese valor..." />
                        </div>
                      )
                    })}
                  </div>
                  
                  <button onClick={handleSaveResults} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-slate-800 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                    <Save size={18}/> Actualizar en Google Sheets
                  </button>
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
