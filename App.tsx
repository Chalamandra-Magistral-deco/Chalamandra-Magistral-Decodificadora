
import React, { useState, useEffect, useRef, Component, ErrorInfo, useMemo } from 'react';
import { PEDAGOGIES_DATA, PORTFOLIO_DATA, ABOUT_DATA, Pedagogy } from './constants';
import FlowMalandro from './components/FlowMalandro';
import { AuthProvider, useAuth } from './AuthContext';

// --- AUTH UI CONTROL ---
const AuthControl: React.FC = () => {
  const { user, signIn, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-mono animate-pulse text-gray-300">
        🔥 Cargando...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 bg-gray-900/90 border border-emerald-500/40 rounded-full px-3 py-1 shadow-lg">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-5 h-5 rounded-full border border-emerald-400" />
        ) : (
          <span className="text-xs">🔥</span>
        )}
        <span className="text-xs font-medium text-emerald-300 truncate max-w-[100px] sm:max-w-[140px]">
          {user.displayName || user.email}
        </span>
        <button
          onClick={signOut}
          className="text-[10px] bg-red-900/40 hover:bg-red-800/60 text-red-300 px-2 py-0.5 rounded-full font-mono transition-colors ml-1"
          title="Cerrar sesión"
        >
          Salir
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signIn}
      className="px-3 py-1.5 rounded-full font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md hover:scale-105 transition-all flex items-center gap-1.5 border border-amber-300/30"
    >
      <span>🔥</span>
      <span>Conectar Firebase</span>
    </button>
  );
};

// --- UTILS & HOOKS ---

/**
 * Custom Hook: useRadarChart
 * Encapsulates Chart.js logic to keep the UI clean and handle cleanup automatically.
 */
const useRadarChart = (canvasRef: React.RefObject<HTMLCanvasElement>, data: Pedagogy) => {
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || !(window as any).Chart) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Cleanup previous instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Initialize new chart
    try {
      chartInstanceRef.current = new (window as any).Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['🎭 Simbólico', '🎨 Creativo', '💬 Colaborativo'],
          datasets: [{
            label: 'Intensidad de Alquimia',
            data: data.scores,
            backgroundColor: 'rgba(234, 179, 8, 0.3)',
            borderColor: '#92400e',
            borderWidth: 2,
            pointBackgroundColor: '#92400e',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#92400e'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              beginAtZero: true,
              min: 0,
              max: 5,
              ticks: { stepSize: 1, backdropColor: 'transparent', color: '#78716c' },
              pointLabels: { font: { size: 14, weight: '700' }, color: '#44403c' },
              grid: { color: 'rgba(0,0,0,0.1)' },
              angleLines: { color: 'rgba(0,0,0,0.1)' }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    } catch (e) {
      console.error("Chart initialization failed", e);
    }

    // Strict cleanup on unmount or data change
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data]); // Only re-run if specific data changes
};

// --- COMPONENTS ---

// Error Boundary: The Safety Net against #31 and other rendering crashes
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("System Failure:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-900 text-white p-8 font-mono">
          <div className="max-w-md bg-red-950 p-6 rounded-lg border border-red-500 shadow-2xl">
            <h2 className="text-xl font-bold mb-2 text-red-400">⚠️ CRITICAL SYSTEM FAILURE</h2>
            <p className="text-sm mb-4 text-red-200">The dialectical engine collapsed under a paradox (Error #31 prevented).</p>
            <pre className="bg-black/50 p-3 rounded text-xs overflow-auto mb-4 border border-red-900/50">
              {this.state.error ? String(this.state.error) : "Unknown Error"}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-red-500 transition-colors"
            >
              Initiate Reboot Protocol
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Tooltip: Memoized and hardened to ensure content is always a string
const Tooltip = React.memo(({ content, children }: { content: string; children: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div 
      className="relative flex h-full" 
      onMouseEnter={() => setShow(true)} 
      onMouseLeave={() => setShow(false)}
    >
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-48 z-50 animate-[fadeIn_0.2s_ease-out] pointer-events-none">
          <div className="bg-gray-900 text-white text-xs font-medium rounded-lg py-2 px-3 shadow-xl text-center border border-amber-900/30">
            {/* Explicitly cast to String to prevent Error #31 if an object slips in */}
            {String(content)}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
});

const AboutView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl overflow-hidden border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
        
        {/* Hero Section */}
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center border-b border-violet-900/50">
          
          {/* Avatar / Identity */}
          <div className="relative shrink-0">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 p-1 shadow-[0_0_20px_rgba(167,139,250,0.5)]">
              <div className="w-full h-full rounded-full bg-gray-950 flex items-center justify-center overflow-hidden relative group">
                {/* Fallback Initials / Placeholder Image Logic */}
                <div className="absolute inset-0 bg-[url('https://api.dicebear.com/7.x/bottts/svg?seed=Chalamandra&baseColor=252a34')] bg-cover opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                <span className="relative z-10 text-4xl md:text-5xl">🦎</span>
              </div>
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase shadow-lg whitespace-nowrap">
              System Architect
            </div>
          </div>

          {/* Intro Text */}
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mb-2">
              {String(ABOUT_DATA.name)}
            </h2>
            <h3 className="text-xl text-violet-200 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
              <span className="text-fuchsia-500">⚡</span> {String(ABOUT_DATA.alias)}
            </h3>
            <p className="text-lg text-gray-300 italic border-l-4 border-violet-600 pl-4 bg-violet-900/10 p-2 rounded-r">
              "{String(ABOUT_DATA.tagline)}"
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          
          {/* Left Column: Skills & Role */}
          <div className="col-span-1 bg-gray-950/50 p-8 border-r border-violet-900/30">
            <div className="mb-8">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Core Skills</h4>
              <div className="flex flex-wrap gap-2">
                {ABOUT_DATA.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-md bg-violet-900/30 text-violet-300 text-xs font-mono border border-violet-800">
                    {String(skill)}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Primary Role</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {String(ABOUT_DATA.role)}
              </p>
            </div>
          </div>

          {/* Right Column: Bio & Philosophy */}
          <div className="col-span-1 md:col-span-2 p-8 md:p-12">
            
            <div className="mb-10 space-y-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-violet-500">01.</span> El Origen
              </h3>
              {ABOUT_DATA.bio.map((paragraph, i) => (
                <p key={i} className="text-gray-400 leading-relaxed text-sm md:text-base">
                  {String(paragraph)}
                </p>
              ))}
            </div>

            <div className="bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 p-6 rounded-xl border border-violet-500/20 relative">
              <div className="absolute -top-3 left-6 bg-gray-900 px-2 text-violet-400 text-xs font-bold uppercase">
                {String(ABOUT_DATA.philosophy.title)}
              </div>
              <p className="text-gray-200 font-medium leading-relaxed">
                {String(ABOUT_DATA.philosophy.content)}
              </p>
            </div>

          </div>
        </div>
        
        {/* Footer of Card */}
        <div className="bg-black/40 p-4 text-center border-t border-violet-900/50">
           <p className="text-xs text-violet-500/50 font-mono">ID: DECOX-V1 // STATUS: ONLINE</p>
        </div>

      </div>
    </div>
  );
};

const MandalaView: React.FC = () => {
  const [activeId, setActiveId] = useState<number | null>(null);
  
  // Memoize the active data search
  const activeData = useMemo(() => 
    PORTFOLIO_DATA.find(p => p.id === activeId), 
  [activeId]);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-gray-800 rounded-xl shadow-2xl border-2 border-[#FF2E63] neon-border relative z-10">
      {/* Core Manifest */}
      <div className="text-center mb-8">
        <div className="group bg-gradient-to-br from-red-500 to-pink-600 text-white p-6 rounded-full w-40 h-40 flex items-center justify-center mx-auto shadow-lg ring-4 ring-offset-4 ring-offset-gray-800 ring-yellow-400 transform hover:scale-110 transition duration-300 cursor-pointer">
          <p className="font-bold text-xl leading-tight group-hover:animate-pulse">
            El Flow del Malandro
          </p>
        </div>
        <h2 className="text-3xl font-bold mt-6 text-yellow-400">Manifiesto Chalamandra</h2>
        <p className="mt-3 text-lg text-gray-300">
          Decodificando el juego del contenido: monetizar lo profundo (metodologías) mientras se regala el gancho narrativo (historias).
        </p>
      </div>

      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF2E63] to-transparent my-8"></div>

      {/* Interactive Grid - UPDATED to 3 columns for 9 items (3x3 Matrix) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {PORTFOLIO_DATA.map((item) => (
          <div 
            key={item.id}
            onClick={() => setActiveId(item.id)}
            className={`
              transition-all duration-300 ease-in-out cursor-pointer rounded-full relative z-10 p-4 text-center flex flex-col items-center justify-center aspect-square
              ${activeId === item.id 
                ? 'bg-[#08D9D6] text-gray-900 scale-105 shadow-[0_0_15px_#08D9D6]' 
                : 'bg-gray-700 text-gray-200 hover:scale-105 hover:bg-[#08D9D6] hover:text-gray-900 hover:shadow-[0_0_15px_#08D9D6]'}
            `}
          >
            <span className="text-3xl block mb-2">{String(item.icon)}</span>
            <p className="text-sm font-semibold leading-tight">{item.id}. {String(item.title)}</p>
          </div>
        ))}
      </div>

      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF2E63] to-transparent my-12"></div>

      {/* Reactive Details Panel */}
      <h3 className="text-2xl font-bold text-center mb-6 text-[#08D9D6] min-h-[32px]">
        {activeData ? String(activeData.title) : "Selecciona un Pétalo para Activar el Insight"}
      </h3>

      <div className="bg-gray-700 p-6 rounded-lg text-gray-200 min-h-[200px] transition-all duration-500 relative overflow-hidden">
        {!activeData ? (
          <div className="flex items-center justify-center h-full min-h-[150px]">
            <p className="text-center italic opacity-70 max-w-md">
              El mandala espera tu intención. Cada pétalo revela la metodología y el insight estratégico detrás de la narrativa.
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-[fadeIn_0.5s_ease-in]">
            {/* Section: Anecdote */}
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-[#FF2E63] mb-1">Anécdota (Hook)</p>
              <p className="pl-4 border-l-4 border-[#FF2E63] italic text-gray-200 text-sm sm:text-base leading-relaxed bg-black/30 p-3 rounded-r">{String(activeData.anecdote)}</p>
            </div>

            {/* Section: Methodology */}
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-[#08D9D6] mb-1">Metodología (Product)</p>
              <p className="pl-4 border-l-4 border-[#08D9D6] text-white bg-black/20 p-2 rounded-r">{String(activeData.methodology)}</p>
            </div>

            {/* Section: Insight */}
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-yellow-400 mb-1">Strategic Insight</p>
              <p className="pl-4 border-l-4 border-yellow-400 font-medium text-yellow-100 bg-yellow-900/20 p-2 rounded-r">{String(activeData.insight)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SrapView: React.FC = () => {
  const [selectedId, setSelectedId] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Safe fallback
  const selectedPedagogy = useMemo(() => 
    PEDAGOGIES_DATA.find(p => p.id === selectedId) || PEDAGOGIES_DATA[0], 
  [selectedId]);

  // Hook handles the chart lifecycle
  useRadarChart(canvasRef, selectedPedagogy);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-900 mb-2 tracking-tight">
          <span className="inline-block animate-pulse">🌀</span> Manifiesto SRAP
        </h1>
        <p className="text-lg md:text-xl text-stone-600 font-medium">
          El Arte de la Decodificación Simbólica y la Innovación Vital
        </p>
      </header>

      <section className="text-center bg-white/70 backdrop-blur-sm rounded-3xl p-6 mb-12 shadow-xl border border-amber-100 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">La Alquimia del Saber</h2>
        <p className="text-stone-700 leading-relaxed">
          Este catálogo decodifica metodologías interactivas. Cada práctica combina 
          <strong className="text-amber-900"> Templo (Simbólico)</strong>, 
          <strong className="text-amber-900"> Ritual (Creativo)</strong>, y 
          <strong className="text-amber-900"> Tribu (Colaborativo)</strong>.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-bold text-yellow-900 mb-4 text-center lg:text-left border-b-2 border-amber-200 pb-2">
            Selecciona un Portal
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
            {PEDAGOGIES_DATA.map(p => (
              <Tooltip key={p.id} content={p.details.Tipo}>
                <button
                  onClick={() => setSelectedId(p.id)}
                  className={`
                    w-full h-full group p-4 rounded-xl shadow-md border-2 transition-all duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden
                    ${selectedId === p.id 
                      ? 'bg-amber-100 border-amber-800 scale-105 shadow-lg' 
                      : 'bg-white border-transparent hover:border-amber-200 hover:-translate-y-1'}
                  `}
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform relative z-10">{String(p.emoji)}</span>
                  <span className={`text-xs font-bold relative z-10 ${selectedId === p.id ? 'text-amber-900' : 'text-stone-600'}`}>
                    {String(p.title)}
                  </span>
                  {selectedId === p.id && (
                    <div className="absolute inset-0 bg-yellow-500/5 z-0"></div>
                  )}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-amber-200">
          <div className="flex flex-col xl:flex-row gap-8 h-full">
            <div className="flex-1">
              <h3 className="text-3xl font-extrabold text-yellow-900 mb-6 border-b pb-4 border-amber-100 flex items-center gap-3">
                <span className="text-4xl">{String(selectedPedagogy.emoji)}</span> 
                {String(selectedPedagogy.title)}
              </h3>
              <ul className="space-y-6 text-stone-700 text-base">
                {Object.entries(selectedPedagogy.details).map(([key, value]) => (
                  <li key={key} className="flex items-start group">
                    <span className="mr-3 text-yellow-800 text-xl leading-none mt-1 group-hover:scale-125 transition-transform">•</span> 
                    <div>
                      <strong className="block font-bold text-yellow-900 text-sm uppercase tracking-wider mb-1 opacity-80">
                        {key.replace('_', ' ')}
                      </strong>
                      <span className="text-stone-800 leading-relaxed">{String(value)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] border-t xl:border-t-0 xl:border-l border-amber-100 pt-8 xl:pt-0 xl:pl-8">
              <p className="text-center text-stone-500 text-xs font-bold tracking-widest uppercase mb-4">Análisis Espectral de Impacto</p>
              <div className="relative w-full h-[300px]">
                <canvas ref={canvasRef}></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ENTRY ---

const App: React.FC = () => {
  const [view, setView] = useState<'mandala' | 'srap' | 'about' | 'malandro'>('mandala');

  // Theme Sync
  useEffect(() => {
    const body = document.body;
    const doc = document.documentElement;
    
    // Mandala, About & Malandro share the "Dark" aesthetic base
    if (view === 'mandala' || view === 'about' || view === 'malandro') {
      body.style.backgroundColor = '#252A34';
      body.classList.add('dark');
      doc.classList.add('dark');
    } else {
      // SRAP uses Light/Amber theme
      body.style.backgroundColor = '#fffbeb'; // amber-50
      body.classList.remove('dark');
      doc.classList.remove('dark');
    }
  }, [view]);

  return (
    <ErrorBoundary>
      <div className={`min-h-screen transition-colors duration-700 ${view !== 'srap' ? 'text-white' : 'text-stone-800'}`}>
        
        {/* Navigation Switcher */}
        <nav className="fixed top-4 right-4 z-50 flex flex-wrap gap-2 justify-end items-center max-w-[95%]">
          <AuthControl />

          <button
            onClick={() => setView('mandala')}
            className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all shadow-lg border border-transparent ${
              view === 'mandala' 
                ? 'bg-[#FF2E63] text-white neon-border border-pink-500' 
                : 'bg-white/10 backdrop-blur text-gray-400 hover:bg-white/20 hover:text-white'
            }`}
          >
            CHALAMANDRA
          </button>

          <button
            onClick={() => setView('malandro')}
            className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all shadow-lg border border-transparent ${
              view === 'malandro' 
                ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] border-yellow-450' 
                : 'bg-white/10 backdrop-blur text-gray-400 hover:bg-white/20 hover:text-white'
            }`}
          >
            FLOW MALANDRO
          </button>
          
          <button
            onClick={() => setView('about')}
            className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all shadow-lg border border-transparent ${
              view === 'about' 
                ? 'bg-violet-600 text-white shadow-[0_0_15px_#8b5cf6] border-violet-400' 
                : 'bg-white/10 backdrop-blur text-gray-400 hover:bg-white/20 hover:text-white'
            }`}
          >
            DECOX™
          </button>

          <button
            onClick={() => setView('srap')}
            className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all shadow-lg border border-transparent ${
              view === 'srap' 
                ? 'bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.5)] border-yellow-400' 
                : 'bg-white/10 backdrop-blur text-gray-400 hover:bg-white/20 hover:text-white'
            }`}
          >
            SRAP
          </button>
        </nav>

        {/* Dynamic Viewport */}
        <main className="p-4 sm:p-8 pt-20 max-w-[1600px] mx-auto">
          {view === 'mandala' && (
            <div className="animate-[fadeIn_0.5s_ease-out]">
              <header className="text-center mb-12">
                <h1 className="text-5xl sm:text-7xl font-black neon-text tracking-tighter mb-4">
                  CHALAMANDRA™
                </h1>
              </header>
              <MandalaView />
            </div>
          )}

          {view === 'malandro' && (
            <div className="animate-[fadeIn_0.5s_ease-out]">
              <FlowMalandro />
            </div>
          )}

          {view === 'about' && (
             <AboutView />
          )}

          {view === 'srap' && (
            <div className="animate-[fadeIn_0.5s_ease-out]">
              <SrapView />
            </div>
          )}
        </main>

        <footer className={`text-center mt-12 py-8 text-xs font-mono tracking-widest uppercase opacity-50 ${view !== 'srap' ? 'text-gray-500' : 'text-stone-500'}`}>
          <p>© 2025 Chalamandra Magistral DecoX™ — System v2.1.0 [DecoX Active]</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

const AppWithProvider: React.FC = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWithProvider;
