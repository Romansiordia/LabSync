
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
      // El script proporcionado por el usuario espera un JSON plano
      await fetch(googleUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Sync Error", e);
    } finally {
      setTimeout(() => setIsSyncing(false), 1000);
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

    // Enviar a Google Sheets con las cabeceras base
    const client = clients.find(c => c.id === newRecord.clientId);
    syncToSheets({
      "Folio": newRecord.Folio,
      "Fecha Recepción": newRecord.receptionDate,
      "Muestra": newRecord.sampleName,
      "Producto": newRecord.product,
      "Cliente": client?.name || 'Varios',
      "Estatus": newRecord.status,
      "Costo": newRecord.cost,
      "Prioridad": newRecord.priority,
      "Técnico": techs.find(t => t.id === newRecord.technicianId)?.name || ''
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

    // Construir el objeto para Google Sheets
    // Importante: Usamos el mismo Folio para que el script actualice la fila
    const syncData: any = {
      "Folio": selectedRecord.Folio,
      "Estatus": "Completado"
    };

    // Añadir cada resultado como una columna con el nombre del análisis
    Object.entries(tempResults).forEach(([typeId, value]) => {
      const type = types.find(t => t.id === typeId);
      if (type) {
        syncData[type.name] = value;
      }
    });

    syncToSheets(syncData);
  };

  // --- RenderHelpers ---
  const renderTab = (id: typeof activeTab, icon: any, label: string) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-bold ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-100'}`}>
      {icon} <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col gap-8 shadow-sm">
        <div className="flex items-center gap-3 text-indigo-600">
          <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-100">
            <Beaker size={28} />
          </div>
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

      {/* Main */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 px-10 py-6 flex justify-between items-center z-20">
          <h2 className="text-2xl font-black capitalize tracking-tight text-slate-900">{activeTab}</h2>
          <div className="flex items-center gap-4">
            {isSyncing && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl font-black text-[10px] animate-pulse border border-amber-100">
                <RefreshCw size={12} className="animate-spin"/> SINCRONIZANDO CON NUBE
              </div>
            )}
            <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 font-black text-xs border border-indigo-100">V2.1 - UPSERT ENABLED</div>
          </div>
        </header>

        <div className="p-10 animate-in">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                  <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-110 transition-transform"><ClipboardList/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Muestras Totales</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{analyses.length}</h3>
                </div>
                <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                  <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-110 transition-transform"><CheckCircle/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Completadas</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{analyses.filter(a => a.status === 'Completado').length}</h3>
                </div>
                <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                  <div className="bg-amber-50 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-600 mb-5 group-hover:scale-110 transition-transform"><Clock/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">En Proceso</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{analyses.filter(a => a.status === 'Pendiente').length}</h3>
                </div>
                <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                  <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform"><DollarSign/></div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Ingresos Proyectados</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">${analyses.reduce((s, a) => s + a.cost, 0).toLocaleString()}</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <h4 className="text-xl font-black mb-8 flex items-center gap-3"><Activity className="text-indigo-600" /> Flujo Financiero</h4>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyses.slice(-12).reverse()}>
                        <defs>
                          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="Folio" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Area type="monotone" dataKey="cost" stroke="#4f46e5" fillOpacity={1} fill="url(#colorCost)" strokeWidth={4} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                  <div className="bg-indigo-50 p-6 rounded-full text-indigo-600 mb-6">
                    <CloudSync size={48} />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">Sincronización Activa</h4>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">Tus datos se respaldan automáticamente en la nube de Google Sheets mediante tecnología Upsert.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Bitácora de Análisis</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Gestión centralizada de muestras</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-3 shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all"><Plus size={20}/> Registrar Nueva Muestra</button>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-10 py-6">Folio / Plazos</th>
                      <th className="px-10 py-6">Identificación</th>
                      <th className="px-10 py-6">Estado</th>
                      <th className="px-10 py-6">Estudios Solicitados</th>
                      <th className="px-10 py-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyses.length === 0 ? (
                      <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest">No hay registros en la bitácora</td></tr>
                    ) : (
                      analyses.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6">
                            <div className="flex flex-col">
                              <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg w-fit mb-2 text-xs border border-indigo-100">{a.Folio}</span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                                <Clock size={12}/> Ent: {a.deliveryDate}
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-base">{a.sampleName}</span>
                              <span className="text-xs text-slate-400 font-bold">{a.product}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${a.status === 'Completado' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{a.status}</span>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                              {a.analysisIds.map(id => (
                                <span key={id} className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase border ${a.status === 'Completado' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}>{types.find(t => t.id === id)?.name}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setSelectedRecord(a); setTempResults(a.results || {}); setShowResultsModal(true); }} className="p-3 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100 rounded-2xl transition-all shadow-sm"><FlaskConical size={18}/></button>
                              <button onClick={() => { if(confirm("¿Eliminar registro?")) setAnalyses(analyses.filter(x => x.id !== a.id)); }} className="p-3 bg-white text-slate-300 hover:text-red-500 border border-slate-100 rounded-2xl transition-all"><Trash2 size={18}/></button>
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
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-slate-100">
                 <h3 className="text-xl font-black text-slate-900">Directorio de Clientes</h3>
                 <button onClick={() => {
                   const name = prompt("Razón Social:");
                   if (name) setClients([...clients, { id: Date.now().toString(), name, contactName: 'Encargado de Planta', email: 'correo@ejemplo.com', phone: '000-000', address: 'Zona Industrial' }]);
                 }} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-100"><Plus size={20}/> Nuevo Cliente</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map(c => (
                  <div key={c.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
                    <div className="bg-indigo-50 w-14 h-14 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Users size={24}/></div>
                    <h4 className="font-black text-lg text-slate-900">{c.name}</h4>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1 mb-6 border-b border-slate-50 pb-4">{c.contactName}</p>
                    <div className="space-y-3">
                      <p className="flex items-center gap-3 text-sm text-slate-500 font-bold"><Mail size={16} className="text-slate-300"/> {c.email}</p>
                      <p className="flex items-center gap-3 text-sm text-slate-500 font-bold"><Phone size={16} className="text-slate-300"/> {c.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'types' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-slate-100">
                 <h3 className="text-xl font-black text-slate-900">Catálogo de Análisis</h3>
                 <button onClick={() => {
                   const name = prompt("Nombre del Análisis:");
                   const cost = parseFloat(prompt("Costo Base ($):") || "0");
                   const unit = prompt("Unidad de Medida (%, ppm, ppb):") || "%";
                   if (name) setTypes([...types, { id: 'at'+Date.now(), name, baseCost: cost, unit }]);
                 }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg"><Plus size={20}/> Definir Nuevo Estudio</button>
              </div>
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-10 py-6">Estudio / Parámetro</th>
                      <th className="px-10 py-6 text-center">Unidad</th>
                      <th className="px-10 py-6 text-right">Costo Unitario</th>
                      <th className="px-10 py-6 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {types.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="px-10 py-6 font-black text-slate-900">{t.name}</td>
                        <td className="px-10 py-6 text-center"><span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-500">{t.unit}</span></td>
                        <td className="px-10 py-6 text-right font-mono font-black text-emerald-600">${t.baseCost.toFixed(2)}</td>
                        <td className="px-10 py-6 text-right">
                          <button onClick={() => setTypes(types.filter(x => x.id !== t.id))} className="text-slate-300 hover:text-red-500 transition-colors p-2"><Trash2 size={18}/></button>
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
              <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-xl shadow-indigo-100 mb-8"><CloudSync size={48}/></div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Configuración de la Nube</h3>
                <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">Conecta tu sistema con Google Sheets pegando la URL de implementación del script proporcionado.</p>
                <div className="w-full space-y-4">
                  <div className="text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2 block">Google Apps Script URL (Web App)</label>
                    <input 
                      type="text" 
                      className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-200 font-mono text-xs focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-slate-600" 
                      value={googleUrl} 
                      onChange={(e) => setGoogleUrl(e.target.value)} 
                      placeholder="https://script.google.com/macros/s/.../exec" 
                    />
                  </div>
                  <button onClick={() => alert("URL Guardada Exitosamente")} className="w-full py-5 bg-indigo-600 text-white font-black rounded-[1.5rem] shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4">
                    <Save size={20}/> Guardar Configuración
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL: Nueva Muestra */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in">
            <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="p-10 flex justify-between items-center border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-600 text-white p-3 rounded-2xl"><Plus size={24}/></div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Registrar Muestra</h3>
                    <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">Folio sugerido: {generateFolio()}</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 bg-white hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-2xl transition-all border border-slate-100"><X/></button>
              </div>
              
              <form onSubmit={handleCreateAnalysis} className="p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-indigo-600 pl-4">Datos de Identificación</h5>
                    <div className="space-y-4">
                      <div className="relative">
                        <Beaker className="absolute left-6 top-5 text-slate-400" size={18}/>
                        <input name="sampleName" required placeholder="Descripción de la Muestra *" className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-400 transition-all" />
                      </div>
                      <select name="product" className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-bold outline-none focus:border-indigo-400 transition-all">
                        {BASE_PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input name="origin" placeholder="Origen / Granja / Cliente Final" className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-medium outline-none" />
                      <input name="provider" placeholder="Lote / Proveedor" className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-medium outline-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-emerald-500 pl-4">Asignación y Logística</h5>
                    <div className="space-y-4">
                      <select name="clientId" required className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black outline-none focus:border-emerald-500">
                        <option value="">Seleccionar Cliente *</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <select name="techId" required className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black outline-none">
                        {techs.map(t => <option key={t.id} value={t.id}>{t.name} (Analista)</option>)}
                      </select>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 block">Fecha Compromiso de Entrega</label>
                        <input type="date" name="deliveryDate" required className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black outline-none" />
                      </div>
                      <select name="priority" className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black outline-none">
                        <option value="Normal">Prioridad: Normal</option>
                        <option value="Urgente">Prioridad: Urgente</option>
                        <option value="Crítico">Prioridad: Crítico</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-indigo-600 pl-4">Configurar Perfil de Análisis</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                    {types.length === 0 ? (
                      <p className="col-span-full text-center text-slate-400 py-4 font-bold uppercase tracking-widest text-[10px]">Debe registrar tipos de análisis en el catálogo primero</p>
                    ) : (
                      types.map(t => (
                        <label key={t.id} className="group relative flex items-center gap-3 p-5 bg-white border border-slate-200 rounded-[1.25rem] cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all font-black text-xs select-none has-[:checked]:bg-indigo-600 has-[:checked]:text-white has-[:checked]:border-indigo-600 shadow-sm">
                          <input type="checkbox" name={`type-${t.id}`} className="hidden" />
                          <div className="w-5 h-5 border-2 border-slate-200 rounded-lg group-has-[:checked]:border-white flex items-center justify-center group-has-[:checked]:bg-indigo-500 transition-all">
                             <div className="w-2 h-2 bg-white rounded-sm opacity-0 group-has-[:checked]:opacity-100"></div>
                          </div>
                          <span>{t.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.98] transition-all text-sm uppercase tracking-[0.2em]">Registrar Muestra y Sincronizar Fila</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Captura de Resultados */}
        {showResultsModal && selectedRecord && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in">
            <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
               <div className="p-10 bg-indigo-600 text-white flex justify-between items-center shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-2xl"><FlaskConical size={24}/></div>
                    <div>
                      <h3 className="text-2xl font-black">Captura de Resultados</h3>
                      <p className="font-bold text-indigo-100 text-xs uppercase tracking-widest">Folio: {selectedRecord.Folio}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowResultsModal(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={24}/></button>
               </div>
               
               <div className="p-12 space-y-8">
                  <div className="bg-amber-50 border border-amber-100 p-6 rounded-[1.5rem] flex gap-4 text-amber-700">
                    <Info className="shrink-0" size={20}/>
                    <p className="text-[11px] font-bold leading-relaxed uppercase tracking-wide">Los valores ingresados aquí se sincronizarán directamente con las columnas correspondientes en tu Google Sheet.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {selectedRecord.analysisIds.map(aid => {
                      const type = types.find(t => t.id === aid);
                      return (
                        <div key={aid} className="space-y-3 group">
                           <label className="text-[10px] font-black text-slate-400 uppercase px-4 tracking-widest group-focus-within:text-indigo-600 transition-colors">{type?.name} ({type?.unit})</label>
                           <div className="relative">
                              <input 
                                type="text" 
                                className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-black text-lg focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-400 outline-none transition-all pr-20 text-slate-800"
                                value={tempResults[aid] || ''}
                                onChange={(e) => setTempResults({...tempResults, [aid]: e.target.value})}
                                placeholder="0.00"
                              />
                              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xs">{type?.unit}</span>
                           </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="pt-4">
                    <button onClick={handleSaveResults} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs">
                      <Save size={18}/> Actualizar Registro en Nube
                    </button>
                    <p className="text-center text-[10px] text-slate-300 font-bold uppercase mt-6 tracking-widest">El estado del folio cambiará automáticamente a "Completado"</p>
                  </div>
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
