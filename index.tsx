
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
  Square
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

const BASE_PRODUCTS = ["Sorgo", "Maíz", "Trigo", "Alimento Fase 1", "Harina de Soya", "Aceite vegetal", "Premezcla Vitamínica", "Núcleo Porcino"];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'clients' | 'types' | 'settings'>('dashboard');
  const [googleUrl, setGoogleUrl] = useState(() => localStorage.getItem('lab_google_url') || '');
  const [isSyncing, setIsSyncing] = useState(false);

  // Estados persistidos
  const [clients, setClients] = useState<Client[]>(() => JSON.parse(localStorage.getItem('lab_clients') || '[]'));
  const [techs, setTechs] = useState<Technician[]>(() => JSON.parse(localStorage.getItem('lab_techs') || '[{"id":"t1","name":"Dr. Elena Ramos","specialty":"Bromatología"}]'));
  const [types, setTypes] = useState<AnalysisType[]>(() => JSON.parse(localStorage.getItem('lab_types') || '[]'));
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
    const prefix = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
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

    // Payload EXACTO para action: 'create'
    syncToSheets({
      "action": "create",
      "sampleId": newRecord.Folio,
      "receptionDate": newRecord.receptionDate,
      "sampleName": newRecord.sampleName,
      "product": newRecord.product,
      "clientName": client?.name || 'Varios',
      "techName": tech?.name || 'Analista',
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

    // Payload EXACTO para action: 'update_results'
    // Formateamos los resultados como un solo string para la columna K
    const resultsString = Object.entries(tempResults)
      .map(([typeId, value]) => {
        const type = types.find(t => t.id === typeId);
        return `${type?.name}: ${value} ${type?.unit || ''}`;
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
                <RefreshCw size={12} className="animate-spin"/> ACTUALIZANDO NUBE...
              </div>
            )}
            <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 font-black text-xs border border-indigo-100">ESTABLE V2.5</div>
          </div>
        </header>

        <div className="p-10 animate-in">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-5"><ClipboardList/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total</p>
                  <h3 className="text-3xl font-black text-slate-900">{analyses.length}</h3>
                </div>
                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 mb-5"><CheckCircle/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Completas</p>
                  <h3 className="text-3xl font-black text-slate-900">{analyses.filter(a => a.status === 'Completado').length}</h3>
                </div>
                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="bg-amber-50 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-600 mb-5"><Clock/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Pendientes</p>
                  <h3 className="text-3xl font-black text-slate-900">{analyses.filter(a => a.status === 'Pendiente').length}</h3>
                </div>
                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-5"><DollarSign/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Ingresos</p>
                  <h3 className="text-3xl font-black text-slate-900">${analyses.reduce((s, a) => s + a.cost, 0).toLocaleString()}</h3>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="text-xl font-black mb-8">Actividad de Muestras</h4>
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
                  <h3 className="text-xl font-black text-slate-900">Bitácora de Laboratorio</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase mt-1">Sincronización con action: 'create' / 'update_results'</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-3 hover:scale-[1.02] transition-all shadow-lg shadow-indigo-100"><Plus size={20}/> Registrar Muestra</button>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-10 py-6">Folio / Fecha</th>
                      <th className="px-10 py-6">Muestra</th>
                      <th className="px-10 py-6">Estatus</th>
                      <th className="px-10 py-6">Parámetros</th>
                      <th className="px-10 py-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyses.length === 0 ? (
                      <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest">No hay muestras registradas</td></tr>
                    ) : (
                      analyses.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6">
                            <div className="font-mono font-black text-indigo-600 text-xs">{a.Folio}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{a.receptionDate}</div>
                          </td>
                          <td className="px-10 py-6 font-black text-slate-900">{a.sampleName}<br/><span className="text-[10px] text-slate-400 uppercase font-bold">{a.product}</span></td>
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
            <div className="grid grid-cols-3 gap-6">
              {clients.map(c => (
                <div key={c.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                  <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-6"><Users size={24}/></div>
                  <h4 className="font-black text-lg">{c.name}</h4>
                  <p className="text-slate-400 text-xs font-black uppercase mb-4">{c.contactName}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-2"><Mail size={16}/> {c.email}</p>
                </div>
              ))}
              <button onClick={() => {
                const n = prompt("Nombre:"); if(n) setClients([...clients, {id: Date.now().toString(), name: n, contactName: 'Gerente', email: 'mail@empresa.com', phone: '000', address: ''}]);
              }} className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all">
                <Plus size={32}/><span className="font-black text-xs uppercase mt-2">Nuevo Cliente</span>
              </button>
            </div>
          )}

          {activeTab === 'types' && (
            <div className="space-y-6">
              <button onClick={() => {
                const n = prompt("Nombre del Análisis:");
                const c = parseFloat(prompt("Costo:") || "0");
                const u = prompt("Unidad:") || "%";
                if(n) setTypes([...types, {id: 'at'+Date.now(), name: n, baseCost: c, unit: u}]);
              }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg"><Plus size={20}/> Nuevo Análisis</button>
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="px-10 py-4">Estudio</th><th className="px-10 py-4">Unidad</th><th className="px-10 py-4 text-right">Costo</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {types.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="px-10 py-4 font-black">{t.name}</td>
                        <td className="px-10 py-4 font-bold text-slate-400">{t.unit}</td>
                        <td className="px-10 py-4 text-right font-mono font-black text-emerald-600">${t.baseCost.toFixed(2)}</td>
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
              <h3 className="text-xl font-black mb-4">Configuración de Google Sheet</h3>
              <p className="text-slate-400 text-center text-sm mb-10 px-6">Pega la URL del Web App de Google Apps Script para habilitar la sincronización remota.</p>
              <div className="w-full space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Web App URL</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs focus:ring-4 focus:ring-indigo-100 outline-none" value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" />
                <button onClick={() => alert("URL Guardada Correctamente")} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Guardar Conexión</button>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Registro */}
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
                    <input name="sampleName" required placeholder="Nombre de Muestra *" className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black outline-none" />
                    <select name="product" className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black outline-none">{BASE_PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}</select>
                  </div>
                  <div className="space-y-6">
                    <select name="clientId" required className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black outline-none"><option value="">Seleccionar Cliente *</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Entrega Promesa</label>
                       <input type="date" name="deliveryDate" required className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black outline-none" />
                    </div>
                  </div>
                </div>
                <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">Parámetros a Analizar</h5>
                  <div className="grid grid-cols-4 gap-4">
                    {types.map(t => (
                      <label key={t.id} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 transition-all font-black text-[10px] has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 shadow-sm">
                        <input type="checkbox" name={`type-${t.id}`} className="w-4 h-4 accent-indigo-600" />
                        <span>{t.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs">Crear Registro en Bitácora (Sheet)</button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Resultados */}
        {showResultsModal && selectedRecord && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in">
            <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
               <div className="p-10 bg-indigo-600 text-white flex justify-between items-center shadow-lg">
                  <div>
                    <h3 className="text-2xl font-black">Captura de Resultados</h3>
                    <p className="font-bold text-indigo-100 text-[10px] uppercase tracking-widest">FOLIO: {selectedRecord.Folio}</p>
                  </div>
                  <button onClick={() => setShowResultsModal(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all shadow-sm"><X size={24}/></button>
               </div>
               <div className="p-12 space-y-8">
                  <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[1.5rem] flex gap-4 text-indigo-700">
                    <Info className="shrink-0" size={20}/>
                    <p className="text-[11px] font-bold uppercase tracking-wide">Los datos se guardarán en la columna 'Resultados' de tu Google Sheet.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 max-h-[50vh] overflow-y-auto px-2">
                    {selectedRecord.analysisIds.map(aid => {
                      const type = types.find(t => t.id === aid);
                      return (
                        <div key={aid} className="space-y-2 group">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">{type?.name} ({type?.unit})</label>
                           <input type="text" className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black text-lg focus:ring-4 focus:ring-indigo-100/50 outline-none transition-all text-slate-800" value={tempResults[aid] || ''} onChange={(e) => setTempResults({...tempResults, [aid]: e.target.value})} placeholder="0.00" />
                        </div>
                      )
                    })}
                  </div>
                  
                  <button onClick={handleSaveResults} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                    <Save size={18}/> Sincronizar Resultados a Sheet
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
