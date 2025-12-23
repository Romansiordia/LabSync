
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

const BASE_PRODUCTS = ["Sorgo", "Maíz", "Trigo", "Alimento Fase 1", "Harina de Soya", "Aceite vegetal"];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'clients' | 'types' | 'settings'>('dashboard');
  const [googleUrl, setGoogleUrl] = useState(() => localStorage.getItem('lab_google_url') || '');
  const [isSyncing, setIsSyncing] = useState(false);

  // Estados de datos
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
      setIsSyncing(false);
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
      priority: formData.get('priority') as Priority,
      cost: selectedAnalyses.reduce((sum, t) => sum + t.baseCost, 0),
      status: 'Pendiente'
    };

    setAnalyses([newRecord, ...analyses]);
    setShowAddModal(false);

    // Enviar a Google Sheets
    const client = clients.find(c => c.id === newRecord.clientId);
    syncToSheets({
      "Folio": newRecord.Folio,
      "Fecha Recepción": newRecord.receptionDate,
      "Muestra": newRecord.sampleName,
      "Producto": newRecord.product,
      "Cliente": client?.name || 'Varios',
      "Estatus": newRecord.status,
      "Costo": newRecord.cost,
      "Prioridad": newRecord.priority
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

    // Enviar resultados detallados a Google Sheets
    // Esto creará columnas automáticamente para cada nombre de análisis
    const syncData: any = {
      "Folio": selectedRecord.Folio,
      "Estatus": "Completado"
    };

    Object.entries(tempResults).forEach(([typeId, value]) => {
      const type = types.find(t => t.id === typeId);
      if (type) syncData[type.name] = value;
    });

    syncToSheets(syncData);
  };

  // --- RenderHelpers ---
  const renderTab = (id: typeof activeTab, icon: any, label: string) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-bold ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>
      {icon} <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col gap-8 shadow-sm">
        <div className="flex items-center gap-3 text-indigo-600">
          <Beaker size={32} strokeWidth={2.5} />
          <h1 className="text-2xl font-black tracking-tight">LABSYNC <span className="text-slate-400">PRO</span></h1>
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

      {/* Main */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 py-6 flex justify-between items-center z-20">
          <h2 className="text-2xl font-black capitalize tracking-tight">{activeTab}</h2>
          <div className="flex items-center gap-4">
            {isSyncing && <div className="flex items-center gap-2 text-amber-500 font-bold text-xs animate-pulse"><RefreshCw size={14} className="animate-spin"/> SINCRONIZANDO...</div>}
            <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 font-bold text-sm">v2.0 Stable</div>
          </div>
        </header>

        <div className="p-10">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-4"><ClipboardList/></div>
                  <p className="text-slate-400 text-xs font-bold uppercase">Total Muestras</p>
                  <h3 className="text-3xl font-black">{analyses.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 mb-4"><CheckCircle/></div>
                  <p className="text-slate-400 text-xs font-bold uppercase">Completadas</p>
                  <h3 className="text-3xl font-black">{analyses.filter(a => a.status === 'Completado').length}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <div className="bg-amber-50 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-600 mb-4"><Clock/></div>
                  <p className="text-slate-400 text-xs font-bold uppercase">Pendientes</p>
                  <h3 className="text-3xl font-black">{analyses.filter(a => a.status === 'Pendiente').length}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-4"><DollarSign/></div>
                  <p className="text-slate-400 text-xs font-bold uppercase">Ingresos</p>
                  <h3 className="text-3xl font-black">${analyses.reduce((s, a) => s + a.cost, 0).toLocaleString()}</h3>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h4 className="text-lg font-black mb-6">Actividad de Muestras</h4>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyses.slice(-10).reverse()}>
                         <defs><linearGradient id="color" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient></defs>
                         <Area type="monotone" dataKey="cost" stroke="#4f46e5" fill="url(#color)" strokeWidth={3} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-indigo-200 hover:scale-105 transition-all"><Plus/> Nueva Muestra</button>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Folio</th>
                      <th className="px-8 py-4">Muestra</th>
                      <th className="px-8 py-4">Producto</th>
                      <th className="px-8 py-4">Estatus</th>
                      <th className="px-8 py-4">Análisis</th>
                      <th className="px-8 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyses.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5 font-mono font-bold text-indigo-600">{a.Folio}</td>
                        <td className="px-8 py-5 font-bold">{a.sampleName}</td>
                        <td className="px-8 py-5 text-sm text-slate-500">{a.product}</td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${a.status === 'Completado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{a.status}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-wrap gap-1">
                            {a.analysisIds.map(id => (
                              <span key={id} className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-md font-bold uppercase">{types.find(t => t.id === id)?.name}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button onClick={() => { setSelectedRecord(a); setTempResults(a.results || {}); setShowResultsModal(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><FlaskConical size={20}/></button>
                          <button onClick={() => setAnalyses(analyses.filter(x => x.id !== a.id))} className="p-2 text-slate-300 hover:text-red-500 rounded-lg transition-all"><Trash2 size={20}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="grid grid-cols-3 gap-6">
              {clients.map(c => (
                <div key={c.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
                  <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600"><Users/></div>
                  <div>
                    <h4 className="font-black text-lg">{c.name}</h4>
                    <p className="text-slate-400 text-sm font-bold">{c.contactName}</p>
                  </div>
                  <div className="space-y-2 text-sm text-slate-500 font-medium">
                    <p className="flex items-center gap-2"><Mail size={14}/> {c.email}</p>
                    <p className="flex items-center gap-2"><Phone size={14}/> {c.phone}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => {
                const name = prompt("Nombre Cliente:");
                if (name) setClients([...clients, { id: Date.now().toString(), name, contactName: 'Nuevo Contacto', email: '', phone: '', address: '' }]);
              }} className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-300 hover:text-indigo-400 transition-all">
                <Plus size={32}/> <span className="font-bold">Añadir Cliente</span>
              </button>
            </div>
          )}

          {activeTab === 'types' && (
            <div className="space-y-6">
              <button onClick={() => {
                const name = prompt("Nombre Análisis:");
                const cost = parseFloat(prompt("Costo:") || "0");
                const unit = prompt("Unidad (%, ppm, ppb):") || "%";
                if (name) setTypes([...types, { id: 'at'+Date.now(), name, baseCost: cost, unit }]);
              }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2">Nuevo Tipo de Análisis</button>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest"><th className="px-8 py-4">Estudio</th><th className="px-8 py-4">Unidad</th><th className="px-8 py-4 text-right">Costo</th><th className="px-8 py-4 text-right">Borrar</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {types.map(t => (
                      <tr key={t.id}>
                        <td className="px-8 py-4 font-black">{t.name}</td>
                        <td className="px-8 py-4 font-bold text-slate-400">{t.unit}</td>
                        <td className="px-8 py-4 text-right font-mono font-bold text-emerald-600">${t.baseCost}</td>
                        <td className="px-8 py-4 text-right"><button onClick={() => setTypes(types.filter(x => x.id !== t.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center gap-4"><CloudSync className="text-indigo-600" size={32}/> <h3 className="text-xl font-black">Conexión con la Nube</h3></div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Google Apps Script URL (Deploy URL)</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs focus:ring-4 focus:ring-indigo-100 transition-all outline-none" value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" />
              </div>
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs text-indigo-700 font-bold flex gap-3"><Info size={24} className="shrink-0"/> Asegúrate de haber implementado el script como "Aplicación Web" con acceso para "Cualquier persona".</div>
            </div>
          )}
        </div>

        {/* MODAL: Nueva Muestra */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in">
              <div className="p-10 flex justify-between items-center border-b border-slate-100">
                <h3 className="text-2xl font-black">Registrar Muestra</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X/></button>
              </div>
              <form onSubmit={handleCreateAnalysis} className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <input name="sampleName" required placeholder="Nombre de la Muestra *" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold" />
                    <select name="product" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold">{BASE_PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}</select>
                    <input name="origin" placeholder="Origen / Granja" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200" />
                    <input name="provider" placeholder="Proveedor / Lote" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200" />
                  </div>
                  <div className="space-y-4">
                    <select name="clientId" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold">
                      <option value="">Seleccionar Cliente *</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select name="techId" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold">
                      {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase px-2">Fecha Estimada Entrega</label>
                      <input type="date" name="deliveryDate" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold" />
                    </div>
                    <select name="priority" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold">
                      <option value="Normal">Prioridad: Normal</option>
                      <option value="Urgente">Prioridad: Urgente</option>
                      <option value="Crítico">Prioridad: Crítico</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-xs font-black uppercase text-slate-400">Seleccionar Estudios</h5>
                  <div className="grid grid-cols-3 gap-3">
                    {types.map(t => (
                      <label key={t.id} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-400 transition-all font-bold text-sm">
                        <input type="checkbox" name={`type-${t.id}`} className="w-5 h-5 accent-indigo-600" />
                        <span>{t.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Registrar y Sincronizar</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Resultados */}
        {showResultsModal && selectedRecord && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl animate-in overflow-hidden">
               <div className="p-10 bg-indigo-600 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black">Captura de Datos</h3>
                    <p className="font-bold opacity-75">Folio: {selectedRecord.Folio}</p>
                  </div>
                  <button onClick={() => setShowResultsModal(false)} className="p-2 hover:bg-white/10 rounded-xl"><X/></button>
               </div>
               <div className="p-10 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {selectedRecord.analysisIds.map(aid => {
                      const type = types.find(t => t.id === aid);
                      return (
                        <div key={aid} className="space-y-2">
                           <label className="text-xs font-black text-slate-400 uppercase px-2">{type?.name} ({type?.unit})</label>
                           <input 
                            type="text" 
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold focus:border-indigo-500 outline-none transition-all"
                            value={tempResults[aid] || ''}
                            onChange={(e) => setTempResults({...tempResults, [aid]: e.target.value})}
                            placeholder="0.00"
                           />
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={handleSaveResults} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl hover:bg-slate-800 transition-all">Guardar Resultados en Nube</button>
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
