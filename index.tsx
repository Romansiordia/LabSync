
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

  const [googleUrl, setGoogleUrl] = useState<string>(() => localStorage.getItem('lab_google_url') || '');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
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

  const handleLogin = async