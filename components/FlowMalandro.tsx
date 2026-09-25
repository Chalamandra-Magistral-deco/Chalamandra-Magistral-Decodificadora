import React, { useState, useEffect, useRef } from 'react';
import { 
  Trash, 
  MapPin, 
  RotateCcw, 
  Wrench, 
  Download, 
  Grid
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// --- TS INTERFACES ---
interface ChaosMarker {
  id: string;
  x: number; // percentage
  y: number; // percentage
  label: string;
  zone: 'danger' | 'safety' | 'exit';
}

interface SoccerRoles {
  conductor: string;
  definidor: string;
  muralla: string;
  enlace: string;
}

interface HatThoughts {
  blanco: string;
  rojo: string;
  negro: string;
  amarillo: string;
  verde: string;
  azul: string;
}

interface finalAnswers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
}

const FlowMalandro: React.FC = () => {
  const { user } = useAuth();

  // Navigation & Page State
  const [activeStep, setActiveStep] = useState<number>(1);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // 1. El Messi del Malandro State
  const [soccerRoles, setSoccerRoles] = useState<SoccerRoles>({
    conductor: '',
    definidor: '',
    muralla: '',
    enlace: ''
  });
  const [activeSoccerPlayer, setActiveSoccerPlayer] = useState<string>('conductor');
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({ x: 50, y: 75 }); // Initial center-bottom

  // 2. El Kit del Malandro State
  const [equippedTools, setEquippedTools] = useState<string[]>(['bomb', 'shades', 'heart']);
  const [toolIntensity, setToolIntensity] = useState<{ [key: string]: number }>({
    bomb: 70,
    shades: 50,
    heart: 80,
    key: 30,
    bandage: 60
  });

  // 3. Los 6 Sombreros State
  const [selectedHat, setSelectedHat] = useState<keyof HatThoughts>('blanco');
  const [hatThoughts, setHatThoughts] = useState<HatThoughts>({
    blanco: '',
    rojo: '',
    negro: '',
    amarillo: '',
    verde: '',
    azul: ''
  });

  // 4. Cartografía del Caos State
  const [chaosMarkers, setChaosMarkers] = useState<ChaosMarker[]>([
    { id: '1', x: 25, y: 35, label: 'Mensajes fríos de madrugada', zone: 'danger' },
    { id: '2', x: 75, y: 80, label: 'Café aliado en esquina neutral', zone: 'safety' },
    { id: '3', x: 50, y: 55, label: 'Crear prototipo rápido sin permiso', zone: 'exit' }
  ]);
  const [newMarkerText, setNewMarkerText] = useState<string>('');
  const [newMarkerZone, setNewMarkerZone] = useState<'danger' | 'safety' | 'exit'>('danger');
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // 5. El Pastelote Emocional State
  const [emotionSlices, setEmotionSlices] = useState<{ [key: string]: number }>({
    rabia: 30,
    tristeza: 20,
    alegria: 35,
    miedo: 15
  });

  // 6. El Ritual de la Herramienta Rota State
  const [toolBroken, setToolBroken] = useState<boolean>(false);
  const [altarCandles, setAltarCandles] = useState<boolean[]>([false, false, false]);
  const [brokenTribute, setBrokenTribute] = useState<string>('');
  const [ritualCompleted, setRitualCompleted] = useState<boolean>(false);

  // 7. El Mapa de la Trampa State
  const [pawnPosition, setPawnPosition] = useState<number>(1);
  const [diceRolling, setDiceRolling] = useState<boolean>(false);
  const [lastDiceRoll, setLastDiceRoll] = useState<number | null>(null);
  const [gameMessage, setGameMessage] = useState<string>('¡Saca los dados para iniciar tu aventura!');

  // Final Reflexions State
  const [reflections, setReflections] = useState<finalAnswers>({
    q1: '',
    q2: '',
    q3: '',
    q4: ''
  });

  // Toast Helper
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Sync with LocalStorage on Mount
  useEffect(() => {
    const cachedData = localStorage.getItem('flow_malandro_v1');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed.soccerRoles) setSoccerRoles(parsed.soccerRoles);
        if (parsed.equippedTools) setEquippedTools(parsed.equippedTools);
        if (parsed.toolIntensity) setToolIntensity(parsed.toolIntensity);
        if (parsed.hatThoughts) setHatThoughts(parsed.hatThoughts);
        if (parsed.chaosMarkers) setChaosMarkers(parsed.chaosMarkers);
        if (parsed.emotionSlices) setEmotionSlices(parsed.emotionSlices);
        if (parsed.brokenTribute) setBrokenTribute(parsed.brokenTribute);
        if (parsed.ritualCompleted) setRitualCompleted(parsed.ritualCompleted);
        if (parsed.toolBroken) setToolBroken(parsed.toolBroken);
        if (parsed.altarCandles) setAltarCandles(parsed.altarCandles);
        if (parsed.pawnPosition) setPawnPosition(parsed.pawnPosition);
        if (parsed.reflections) setReflections(parsed.reflections);
      } catch (err) {
        console.error('Error restoring cache', err);
      }
    }
  }, []);

  // Sync reflections from Firestore when user is authenticated
  useEffect(() => {
    if (!user) return;
    const fetchCloudReflections = async () => {
      try {
        const docRef = doc(db, 'reflections', user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setReflections(prev => ({
            q1: data.q1 || prev.q1,
            q2: data.q2 || prev.q2,
            q3: data.q3 || prev.q3,
            q4: data.q4 || prev.q4
          }));
        }
      } catch (err) {
        console.warn('Could not fetch cloud reflections:', err);
      }
    };
    fetchCloudReflections();
  }, [user]);

  // Save changes to localStorage helper
  const saveState = (updatedFields: any) => {
    const cachedData = localStorage.getItem('flow_malandro_v1');
    let current: any = {};
    if (cachedData) {
      try {
        current = JSON.parse(cachedData);
      } catch (e) {}
    }
    const next = { ...current, ...updatedFields };
    localStorage.setItem('flow_malandro_v1', JSON.stringify(next));
  };

  // --- ACTIONS ---

  // Handle Soccer Pitch Select Player
  const selectSoccerPlayer = (player: string, ballCoordinates: { x: number; y: number }) => {
    setActiveSoccerPlayer(player);
    setBallPosition(ballCoordinates);
  };

  const handleSoccerRoleChange = (role: keyof SoccerRoles, val: string) => {
    const updated = { ...soccerRoles, [role]: val };
    setSoccerRoles(updated);
    saveState({ soccerRoles: updated });
  };

  // Handle Kit Add/Remove
  const toggleTool = (toolId: string) => {
    let nextTools = [...equippedTools];
    if (nextTools.includes(toolId)) {
      if (nextTools.length <= 1) {
        triggerToast('⚠️ ¡Necesitas al menos una herramienta en tu kit!');
        return;
      }
      nextTools = nextTools.filter(t => t !== toolId);
    } else {
      nextTools.push(toolId);
    }
    setEquippedTools(nextTools);
    saveState({ equippedTools: nextTools });
  };

  const handleIntensityChange = (toolId: string, val: number) => {
    const nextIntensity = { ...toolIntensity, [toolId]: val };
    setToolIntensity(nextIntensity);
    saveState({ toolIntensity: nextIntensity });
  };

  // Handle Hat Writing
  const handleHatThoughtChange = (text: string) => {
    const nextThoughts = { ...hatThoughts, [selectedHat]: text };
    setHatThoughts(nextThoughts);
    saveState({ hatThoughts: nextThoughts });
  };

  // Handle Chaos Map Click
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current || !newMarkerText.trim()) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newMarker: ChaosMarker = {
      id: Date.now().toString(),
      x,
      y,
      label: newMarkerText.trim(),
      zone: newMarkerZone
    };

    const nextMarkers = [...chaosMarkers, newMarker];
    setChaosMarkers(nextMarkers);
    setNewMarkerText('');
    saveState({ chaosMarkers: nextMarkers });
    triggerToast('📍 Marcador callejero anclado al mapa.');
  };

  const deleteMarker = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMarkers = chaosMarkers.filter(m => m.id !== id);
    setChaosMarkers(nextMarkers);
    saveState({ chaosMarkers: nextMarkers });
  };

  // Handle Emotion Slice Adjust
  const handleSliceChange = (emotion: string, val: number) => {
    const nextSlices = { ...emotionSlices, [emotion]: val };
    setEmotionSlices(nextSlices);
    saveState({ emotionSlices: nextSlices });
  };

  // Handle Candles
  const toggleCandle = (idx: number) => {
    const nextCandles = [...altarCandles];
    nextCandles[idx] = !nextCandles[idx];
    setAltarCandles(nextCandles);
    saveState({ altarCandles: nextCandles });
    if (nextCandles.every(c => c) && toolBroken && brokenTribute.trim()) {
      setRitualCompleted(true);
      saveState({ ritualCompleted: true });
    }
  };

  // Complete Ritual
  const handleCompleteRitualAction = () => {
    if (!toolBroken) {
      triggerToast('🔥 Primero debes romper simbólicamente la herramienta defectuosa.');
      return;
    }
    if (!brokenTribute.trim()) {
      triggerToast('✍️ Escribe primero tu tributo de aprendizaje para consagrar tu ritual.');
      return;
    }
    if (!altarCandles.some(c => c)) {
      triggerToast('🕯️ Enciende al menos una vela por respeto callejero.');
      return;
    }
    setRitualCompleted(true);
    saveState({ ritualCompleted: true });
    triggerToast('🕯️ Ritual completado con honor. Lección integrada.');
  };

  const resetRitual = () => {
    setToolBroken(false);
    setAltarCandles([false, false, false]);
    setBrokenTribute('');
    setRitualCompleted(false);
    saveState({
      toolBroken: false,
      altarCandles: [false, false, false],
      brokenTribute: '',
      ritualCompleted: false
    });
  };

  // Game Board (Snakes & Ladders)
  const boardCells = [
    { num: 1, type: 'start', label: 'Inicio del Barrio' },
    { num: 2, type: 'neutral', label: 'Estrategia' },
    { num: 3, type: 'trap', label: 'Trampa: Procrastinación (Miedo)' },
    { num: 4, type: 'power', label: 'Poder: Aliado del Café (+2 Flow)' },
    { num: 5, type: 'neutral', label: 'Alineación' },
    { num: 6, type: 'trap', label: 'Trampa: El Cliente Fantasma' },
    { num: 7, type: 'neutral', label: 'Intuición' },
    { num: 8, type: 'power', label: 'Poder: Hackeo Inteligente (+3 pasos)' },
    { num: 9, type: 'trap', label: 'Trampa: Síndrome del Impostor' },
    { num: 10, type: 'neutral', label: 'Límites Claros' },
    { num: 11, type: 'power', label: 'Poder: Decisión Rápida' },
    { num: 12, type: 'trap', label: 'Trampa: El Paro Técnico' },
    { num: 13, type: 'neutral', label: 'Enfoque Puro' },
    { num: 14, type: 'power', label: 'Poder: Dominio del Negocio' },
    { num: 15, type: 'destination', label: 'El Desbloqueo del Flow Malandro' }
  ];

  const rollDiceAction = () => {
    if (diceRolling) return;
    setDiceRolling(true);
    setLastDiceRoll(null);

    let rolls = 0;
    const interval = setInterval(() => {
      setLastDiceRoll(Math.floor(Math.random() * 4) + 1); // 1 to 4 steps
      rolls++;
      if (rolls > 8) {
        clearInterval(interval);
        const rolled = Math.floor(Math.random() * 4) + 1;
        setLastDiceRoll(rolled);
        setDiceRolling(false);

        let nextPos = pawnPosition + rolled;
        if (nextPos >= 15) {
          nextPos = 15;
          setGameMessage(`🎲 ¡Sacaste un ${rolled}! Llegaste a la cima. ¡Nivel Malandro Desbloqueado! 🏆🔥`);
        } else {
          const landedCell = boardCells.find(c => c.num === nextPos);
          if (landedCell?.type === 'trap') {
            nextPos = Math.max(1, nextPos - 2);
            setGameMessage(`🎲 ¡Sacaste ${rolled} y caíste en "${landedCell.label}"! Retrocedes 2 casillas.`);
          } else if (landedCell?.type === 'power') {
            nextPos = Math.min(15, nextPos + 2);
            setGameMessage(`🎲 ¡Increíble! Sacaste ${rolled} y caíste en "${landedCell.label}". ¡Avanzas 2 casillas extra! 🚀`);
          } else {
            setGameMessage(`🎲 Sacaste un ${rolled} y te mueves a "${landedCell?.label || 'A salvo'}".`);
          }
        }
        setPawnPosition(nextPos);
        saveState({ pawnPosition: nextPos });
      }
    }, 100);
  };

  const resetGame = () => {
    setPawnPosition(1);
    setLastDiceRoll(null);
    setGameMessage('Tablero reiniciado. ¡Prepárate para tirar los dados!');
    saveState({ pawnPosition: 1 });
  };

  // Final Reflections Form
  const handleReflexChange = (field: keyof finalAnswers, text: string) => {
    const updated = { ...reflections, [field]: text };
    setReflections(updated);
    saveState({ reflections: updated });

    if (user) {
      setDoc(doc(db, 'reflections', user.uid), {
        id: user.uid,
        userId: user.uid,
        userEmail: user.email || '',
        q1: updated.q1 || '',
        q2: updated.q2 || '',
        q3: updated.q3 || '',
        q4: updated.q4 || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => {
        console.warn('Firestore reflection sync error:', err);
      });
    }
  };

  // Export Progress Markdown
  const handleExportMarkdown = () => {
    let md = `# MAPA OPERATIVO DEL FLOW MALANDRO\n`;
    md += `Generado el: ${new Date().toLocaleDateString()}\n\n`;
    md += `El Caos no es ruido: es información codificada. Este documento contiene tu mapa estratégico del flow urbano contra tus desafíos actuales.\n\n`;
    
    md += `## 1. El Messi del Malandro (Posiciones de Juego)\n`;
    md += `- Conductor / Pensador: ${soccerRoles.conductor || 'No definido'}\n`;
    md += `- Definidor / Ejecutor: ${soccerRoles.definidor || 'No definido'}\n`;
    md += `- Muralla / Límites: ${soccerRoles.muralla || 'No definido'}\n`;
    md += `- Enlace / Flow Colectivo: ${soccerRoles.enlace || 'No definido'}\n\n`;

    md += `## 2. El Kit del Malandro (Herramientas Activas)\n`;
    equippedTools.forEach(tool => {
      md += `- Tool [${tool.toUpperCase()}]: Intensive scale at ${toolIntensity[tool]}%\n`;
    });
    md += `\n`;

    md += `## 3. Los 6 Sombreros de Jorge (Pensamiento Lateral)\n`;
    Object.entries(hatThoughts).forEach(([hat, thought]) => {
      md += `- Sombrero ${hat.toUpperCase()}: ${thought || 'Sin pensamientos registrados.'}\n`;
    });
    md += `\n`;

    md += `## 4. Cartografía del Caos (Coordenadas Activas)\n`;
    chaosMarkers.forEach(m => {
      md += `- [${m.zone.toUpperCase()}] Coor (${m.x}%, ${m.y}%): ${m.label}\n`;
    });
    md += `\n`;

    md += `## 5. El Pastelote Emocional (Balance Gestalt)\n`;
    Object.entries(emotionSlices).forEach(([emotion, val]) => {
      md += `- ${emotion.toUpperCase()}: ${val}%\n`;
    });
    md += `\n`;

    md += `## 6. Integración del Ritual (Herramienta Rota)\n`;
    md += `- ¿Ritual Completado?: ${ritualCompleted ? 'SÍ, CON HONOR' : 'AÚN EN PROCESO'}\n`;
    md += `- Lección del Fracaso: ${brokenTribute || 'Sin registrar'}\n\n`;

    md += `## PREGUNTAS DE REFLEXIÓN FINAL\n\n`;
    md += `### 1. ¿Qué anécdota te pega más y por qué?\n`;
    md += `> ${reflections.q1 || 'Sin respuesta'}\n\n`;
    md += `### 2. ¿Cuál te invita a crear tu propio mapa, ritual o kit callejero?\n`;
    md += `> ${reflections.q2 || 'Sin respuesta'}\n\n`;
    md += `### 3. ¿Qué metáfora inventarías para procesar tu conflicto actual?\n`;
    md += `> ${reflections.q3 || 'Sin respuesta'}\n\n`;
    md += `### 4. ¿Qué visual de los propuestos usarías hoy como herramienta de claridad y flow?\n`;
    md += `> ${reflections.q4 || 'Sin respuesta'}\n\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mapa_Operativo_Malandro_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    triggerToast('💾 ¡Mapa y reflexiones exportadas como Archivo Markdown!');
  };

  return (
    <div className="max-w-6xl mx-auto py-2 px-1 text-gray-100 font-sans relative z-10">
      
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-[#08D9D6] text-gray-900 border-2 border-white px-5 py-3 rounded-lg shadow-2xl font-bold flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
          <span className="text-xl">⚡</span> {successToast}
        </div>
      )}

      {/* Header Info */}
      <div className="bg-gray-900/90 rounded-2xl p-6 border border-red-500/30 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🦎</span>
              <h2 className="text-2xl sm:text-3xl font-black billing-title tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                MAPEANDO EL FLOW DEL MALANDRO
              </h2>
            </div>
            <p className="mt-2 text-gray-400 text-sm max-w-3xl italic">
              Un mapa inmersivo y workbook interactivo para navegar el conflicto con flow extremo. Combina la sabiduría lúdica de Jorge, Edward de Bono y la cartografía simbólica de Chalamandra.
            </p>
          </div>
          <button
            onClick={handleExportMarkdown}
            className="w-full md:w-auto px-5 py-3 bg-[#FF2E63] hover:bg-pink-600 active:scale-95 text-white font-bold rounded-full text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-transform"
          >
            <Download className="w-4 h-4" /> Exportar Plan (.md)
          </button>
        </div>

        {/* Step Indicator Badges (1 to 6 + reflections) */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-6">
          {[
            { id: 1, em: '⚽', label: 'El Messi' },
            { id: 2, em: '🛠️', label: 'El Kit' },
            { id: 3, em: '🎩', label: 'Sombreros' },
            { id: 4, em: '🗺️', label: 'Caos' },
            { id: 5, em: '🎂', label: 'Pastelote' },
            { id: 6, em: '🕯️', label: 'Ritual' },
            { id: 8, em: '🧠', label: 'Reflexión' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveStep(item.id)}
              className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center ${
                activeStep === item.id
                  ? 'bg-gradient-to-b from-[#08D9D6] to-cyan-700 text-gray-950 border-white font-bold scale-105 shadow-[0_0_10px_#08D9D6]'
                  : 'bg-gray-800/40 text-gray-400 border-gray-700/60 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.em}</span>
              <span className="text-[10px] uppercase font-mono mt-1 tracking-wider truncate w-full">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Playable Board Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive Zone */}
        <div className="lg:col-span-8 bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 border border-gray-800 shadow-2xl min-h-[500px]">
          
          {/* STEP 1: EL MESSI DEL MALANDRO */}
          {activeStep === 1 && (
            <div className="animate-[fadeIn_0.4s_ease-out] space-y-6">
              <div>
                <span className="text-xs font-mono font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-3 py-1 rounded-full uppercase">
                  Paso 1: El Messi del Malandro
                </span>
                <h3 className="text-2xl font-bold text-white mt-3 flex items-center gap-2">
                  <span>⚽💥</span> Sabiduría Táctica en Primera Persona
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Jorge compartía su sabiduría como una jugada maestra de barrio. Para entrar en su juego, asigna una persona, tarea u obstáculo real de tu vida a cada posición de tu cancha de fútbol de cemento.
                </p>
              </div>

              {/* Soccer Court Grid Interface */}
              <div className="relative bg-gradient-to-b from-emerald-950/40 to-emerald-900/30 border-4 border-emerald-500/20 rounded-2xl p-6 h-[280px] overflow-hidden flex flex-col justify-between">
                
                {/* Visual Court Dividers */}
                <div className="absolute inset-x-0 top-0 h-[4px] bg-white/10"></div>
                <div className="absolute inset-x-0 bottom-0 h-[4px] bg-white/10"></div>
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/10 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/10 rounded-full"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-10 border-b border-x border-white/10"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-10 border-t border-x border-white/10"></div>

                {/* Simulated Ball */}
                <div 
                  className="absolute z-30 text-2xl transition-all duration-700 ease-out p-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none"
                  style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  ⚽
                </div>

                {/* Player Nodes clickable */}
                <div className="flex justify-center z-10">
                  {/* DELANTERO: EL DEFINIDOR */}
                  <button
                    onClick={() => selectSoccerPlayer('definidor', { x: 50, y: 18 })}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono font-black border transition-all flex items-center gap-1.5 ${
                      activeSoccerPlayer === 'definidor' 
                        ? 'bg-[#FF2E63] text-white border-white scale-110 shadow-[0_0_15px_#FF2E63]' 
                        : 'bg-gray-950/80 text-[#FF2E63] border-[#FF2E63]/40'
                    }`}
                  >
                    <span>🎯</span> Delantero Definidor
                  </button>
                </div>

                <div className="flex justify-between px-4 z-10">
                  {/* MEDIO IZQUIERA: EL CONDUCTOR */}
                  <button
                    onClick={() => selectSoccerPlayer('conductor', { x: 22, y: 48 })}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono font-black border transition-all flex items-center gap-1.5 ${
                      activeSoccerPlayer === 'conductor' 
                        ? 'bg-[#08D9D6] text-gray-950 border-white scale-110 shadow-[0_0_15px_#08D9D6]' 
                        : 'bg-gray-950/80 text-[#08D9D6] border-[#08D9D6]/40'
                    }`}
                  >
                    <span>🧠</span> El Conductor
                  </button>

                  {/* MEDIO DERECHA: EL ENLACE */}
                  <button
                    onClick={() => selectSoccerPlayer('enlace', { x: 78, y: 48 })}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono font-black border transition-all flex items-center gap-1.5 ${
                      activeSoccerPlayer === 'enlace' 
                        ? 'bg-yellow-400 text-gray-950 border-white scale-110 shadow-[0_0_15px_yellow]' 
                        : 'bg-gray-950/80 text-yellow-400 border-yellow-400/40'
                    }`}
                  >
                    <span>🤝</span> El Enlace
                  </button>
                </div>

                <div className="flex justify-center z-10">
                  {/* CENTRAL: LA MURALLA */}
                  <button
                    onClick={() => selectSoccerPlayer('muralla', { x: 50, y: 76 })}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono font-black border transition-all flex items-center gap-1.5 ${
                      activeSoccerPlayer === 'muralla' 
                        ? 'bg-violet-600 text-white border-white scale-110 shadow-[0_0_15px_#8b5cf6]' 
                        : 'bg-gray-950/80 text-violet-400 border-violet-400/40'
                    }`}
                  >
                    <span>🧱</span> Defensa Muralla
                  </button>
                </div>
              </div>

              {/* Context Details */}
              <div className="bg-gray-950/60 p-5 rounded-xl border border-gray-800 space-y-4">
                {activeSoccerPlayer === 'conductor' && (
                  <div>
                    <h4 className="text-[#08D9D6] font-bold text-sm uppercase tracking-wide">EL CONDUCTOR: Cartografía mental</h4>
                    <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                      "Planifica el partido. Lee los huecos de la defensa rival antes de acelerar." Es quien estructura el mapa, anticipando peligros y canalizando recursos.
                    </p>
                    <div className="mt-3">
                      <label className="block text-gray-400 text-[11px] uppercase font-mono font-bold">¿Quién/Qué es el Conductor de tu plan actual?</label>
                      <input
                        type="text"
                        value={soccerRoles.conductor}
                        onChange={(e) => handleSoccerRoleChange('conductor', e.target.value)}
                        placeholder="Ej: Mi mentalidad de diseño, agenda estricta..."
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs mt-1 text-white focus:outline-none focus:border-[#08D9D6]"
                      />
                    </div>
                  </div>
                )}

                {activeSoccerPlayer === 'definidor' && (
                  <div>
                    <h4 className="text-[#FF2E63] font-bold text-sm uppercase tracking-wide">EL DEFINIDOR: Gol de Barrio</h4>
                    <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                      "No baila con el balón. Si ve puerta, dispara." Es pura ejecución sin rodeos. Minimiza flitros innecesarios y concreta el valor de golpe arrollador.
                    </p>
                    <div className="mt-3">
                      <label className="block text-gray-400 text-[11px] uppercase font-mono font-bold">¿Quién/Qué tiene el rol de disparar al arco (Ejecutor)?</label>
                      <input
                        type="text"
                        value={soccerRoles.definidor}
                        onChange={(e) => handleSoccerRoleChange('definidor', e.target.value)}
                        placeholder="Ej: Lanzar la web este viernes, llamar al decisor..."
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs mt-1 text-white focus:outline-none focus:border-[#FF2E63]"
                      />
                    </div>
                  </div>
                )}

                {activeSoccerPlayer === 'muralla' && (
                  <div>
                    <h4 className="text-violet-400 font-bold text-sm uppercase tracking-wide">LA MURALLA: Límites y Defensa</h4>
                    <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                      "Nadie pasa de la mitad de cancha si no hay respeto." Pone límites intransigentes, protege tu tiempo, tu código de ética y tus secretos estratégicos.
                    </p>
                    <div className="mt-3">
                      <label className="block text-gray-400 text-[11px] uppercase font-mono font-bold">¿Qué es tu Muralla defensiva contra abusos/fugas?</label>
                      <input
                        type="text"
                        value={soccerRoles.muralla}
                        onChange={(e) => handleSoccerRoleChange('muralla', e.target.value)}
                        placeholder="Ej: No responder e-mails después de las 7pm, depósito de pago..."
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs mt-1 text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                )}

                {activeSoccerPlayer === 'enlace' && (
                  <div>
                    <h4 className="text-yellow-400 font-bold text-sm uppercase tracking-wide">EL ENLACE: Flow y Distribución</h4>
                    <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                      "Une a los creativos con los ingenieros. Reparte juego rápido." Resuelve tensiones internas, comunica de manera simple y agiliza las conexiones operativas.
                    </p>
                    <div className="mt-3">
                      <label className="block text-gray-400 text-[11px] uppercase font-mono font-bold">¿Qué sirve como tu medio de enlace/comunicación?</label>
                      <input
                        type="text"
                        value={soccerRoles.enlace}
                        onChange={(e) => handleSoccerRoleChange('enlace', e.target.value)}
                        placeholder="Ej: Mi boletín semanal, café informal con los socios..."
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs mt-1 text-white focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: EL KIT DEL MALANDRO */}
          {activeStep === 2 && (
            <div className="animate-[fadeIn_0.4s_ease-out] space-y-6">
              <div>
                <span className="text-xs font-mono font-bold bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-3 py-1 rounded-full uppercase">
                  Paso 2: El Kit del Malandro
                </span>
                <h3 className="text-2xl font-bold text-white mt-3 flex items-center gap-2">
                  <span>🛠️💎</span> Tu Mochila de Supervivencia Estratégica
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Jorge decía: <em>"Pa' sobrevivir en la calle tienes que tener tu propio kit."</em> Diseña tu cartera de herramientas ajustando la intensidad de cada componente.
                </p>
              </div>

              {/* Equippable grid */}
              <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <span className="p-2 bg-gray-900 rounded-lg text-lg">🎒</span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-200">Equipamiento de Mochila Abierta</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Modula tus recursos antes de salir</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tool List */}
                  <div className="space-y-3">
                    {[
                      { id: 'bomb', name: '💣 Truth Bomb', desc: 'Saca a la luz verdades crudas para romper el fingimiento corporativo.' },
                      { id: 'shades', name: '🕶️ Barrio Shades', desc: 'Detecta intereses ocultos detrás de discursos bonitos.' },
                      { id: 'heart', name: '❤️ Empathy Blade', desc: 'Construye lealtad extrema mediante respeto mutuo e intuición.' },
                      { id: 'key', name: '🔑 Master Key', desc: 'Atajos estratégicos inteligentes para evadir barreras burocráticas.' },
                      { id: 'bandage', name: '🩹 Duct Tape (Cinta)', desc: 'Soluciones rápidas e inteligentes para incendios imprevistos.' }
                    ].map((tool) => {
                      const isEquipped = equippedTools.includes(tool.id);
                      return (
                        <div 
                          key={tool.id}
                          onClick={() => toggleTool(tool.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-start ${
                            isEquipped 
                              ? 'bg-gray-900 border-cyan-500/80 shadow-[0_0_8px_rgba(8,217,214,0.1)]' 
                              : 'bg-black/20 border-gray-800 text-gray-500 hover:border-gray-700'
                          }`}
                        >
                          <div className="pr-3">
                            <h5 className={`text-xs font-bold ${isEquipped ? 'text-white' : 'text-gray-500'}`}>{tool.name}</h5>
                            <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{tool.desc}</p>
                          </div>
                          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                            isEquipped ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30' : 'bg-gray-900 text-gray-600'
                          }`}>
                            {isEquipped ? 'EQUIPADO' : 'INACTIVO'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Range Adjust Module */}
                  <div className="bg-black/30 p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#08D9D6] uppercase tracking-wider mb-2">Modulador de Carga de Herramienta</h4>
                      <p className="text-[11px] text-gray-400 leading-normal">
                        Altera la potencia de tus herramientas equipadas. Un exceso de "Truth Bomb" explota las relaciones; un defecto de "Empathy Blade" rompe el flow con el barrio.
                      </p>
                    </div>

                    <div className="space-y-4 mt-4">
                      {equippedTools.map((toolId) => {
                        const nameMap: any = { bomb: '💣 Truth Bomb', shades: '🕶️ Shades', heart: '❤️ Empathy', key: '🔑 Master Key', bandage: '🩹 Duct Tape' };
                        return (
                          <div key={toolId} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-gray-300">{nameMap[toolId]}</span>
                              <span className="text-cyan-400 font-mono font-bold">{toolIntensity[toolId]}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={toolIntensity[toolId] || 50} 
                              onChange={(e) => handleIntensityChange(toolId, parseInt(e.target.value))}
                              className="w-full accent-[#08D9D6]" 
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-800 text-center">
                      <span className="text-[10px] text-yellow-400/80 uppercase font-mono">
                        🔥 Peso Total: {equippedTools.length * 20}kg / 100kg máximo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LOS 6 SOMBREROS DE JORGE */}
          {activeStep === 3 && (
            <div className="animate-[fadeIn_0.4s_ease-out] space-y-6">
              <div>
                <span className="text-xs font-mono font-bold bg-[#8b5cf6]/20 text-violet-300 border border-violet-500/20 px-3 py-1 rounded-full uppercase">
                  Paso 3: Los 6 Sombreros de Jorge
                </span>
                <h3 className="text-2xl font-bold text-white mt-3 flex items-center gap-2">
                  <span>🎩🌈</span> Role-play Callejero de Edward de Bono
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Enfrenta una bronca o conflicto actual utilizando pensamiento lateral de barrio. Selecciona un sombrero graffiti y plasma el análisis de tu situación desde ese rol.
                </p>
              </div>

              {/* Hat Slider Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {[
                  { id: 'blanco', title: 'Blanco', em: '⚪', tint: 'border-white text-white bg-white/5' },
                  { id: 'rojo', title: 'Rojo', em: '🔴', tint: 'border-red-500 text-red-400 bg-red-500/5' },
                  { id: 'negro', title: 'Negro', em: '⚫', tint: 'border-gray-500 text-stone-300 bg-stone-500/5' },
                  { id: 'amarillo', title: 'Amarillo', em: '🟡', tint: 'border-yellow-500 text-yellow-400 bg-yellow-500/5' },
                  { id: 'verde', title: 'Verde', em: '🟢', tint: 'border-emerald-500 text-emerald-400 bg-emerald-500/5' },
                  { id: 'azul', title: 'Azul', em: '🔵', tint: 'border-blue-500 text-cyan-400 bg-cyan-500/5' }
                ].map((hat) => (
                  <button
                    key={hat.id}
                    onClick={() => setSelectedHat(hat.id as keyof HatThoughts)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedHat === hat.id 
                        ? 'scale-105 shadow-md border-solid ring-2 ring-[#08D9D6]' 
                        : 'opacity-70 border-gray-800'
                    } ${hat.tint}`}
                  >
                    <span className="text-2xl block">{hat.em}</span>
                    <span className="text-xs font-mono font-bold uppercase block mt-1">{hat.title}</span>
                  </button>
                ))}
              </div>

              {/* Hat Content Panel */}
              <div className="bg-gray-950 p-5 rounded-2xl border border-gray-800 space-y-4">
                {selectedHat === 'blanco' && (
                  <div>
                    <h4 className="text-white font-bold flex items-center gap-2">
                      <span>⚪</span> Sombrero Blanco (Hechos Puros de la Calle)
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">
                      Analiza datos crudos, hechos irrevocables y números directos. ¿Qué silencios, mensajes, transferencias u horas exactas marcan tu situación actual?
                    </p>
                  </div>
                )}
                {selectedHat === 'rojo' && (
                  <div>
                    <h4 className="text-red-400 font-bold flex items-center gap-2">
                      <span>🔴</span> Sombrero Rojo (El Barrio Interior / Corazonadas)
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">
                      Conecta con tu corazonada visceral, ira corporal y desintoxicación sensorial sin justificar lógica alguna. ¿Qué te quema en el estómago actualmente?
                    </p>
                  </div>
                )}
                {selectedHat === 'negro' && (
                  <div>
                    <h4 className="text-stone-300 font-bold flex items-center gap-2">
                      <span>⚫</span> Sombrero Negro (La Trampa y Riesgos)
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">
                      Analiza los peligros inmanentes, amenazas de parálisis y puntos de falla. ¿Dónde está la trampa camuflada de tu plan o cliente?
                    </p>
                  </div>
                )}
                {selectedHat === 'amarillo' && (
                  <div>
                    <h4 className="text-yellow-400 font-bold flex items-center gap-2">
                      <span>🟡</span> Sombrero Amarillo (El Botín / Ganancia)
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">
                      La recompensa de oro. ¿Cuál es el máximo beneficio, el aprendizaje estratégico y el flow de éxito oculto en este embrollo?
                    </p>
                  </div>
                )}
                {selectedHat === 'verde' && (
                  <div>
                    <h4 className="text-emerald-400 font-bold flex items-center gap-2">
                      <span>🟢</span> Sombrero Verde (El Hackeo Lateral)
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">
                      Opciones bizarras, pensamiento disruptivo y trucos lúdicos alternativos. Si pudieras inventar una regla ridícula para salir de esto, ¿cuál sería?
                    </p>
                  </div>
                )}
                {selectedHat === 'azul' && (
                  <div>
                    <h4 className="text-cyan-400 font-bold flex items-center gap-2">
                      <span>🔵</span> Sombrero Azul (La Orden Técnica del Director)
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">
                      Control del proceso, visión aérea y definición del siguiente paso práctico. ¿Cuál es el próximo movimiento inmediato de tu ficha en el tablero?
                    </p>
                  </div>
                )}

                <textarea
                  value={hatThoughts[selectedHat]}
                  onChange={(e) => handleHatThoughtChange(e.target.value)}
                  placeholder={`Escribe aquí tu pensamiento del Sombrero ${selectedHat.toUpperCase()}...`}
                  rows={4}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs mt-2 text-white focus:outline-none focus:border-[#08D9D6]"
                ></textarea>

                <p className="text-[10px] text-gray-500 font-mono text-right italic">
                  💡 Autoguardado activo. Haz click en otros sombreros para complementar el diagnóstico.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: CARTOGRAFÍA DEL CAOS */}
          {activeStep === 4 && (
            <div className="animate-[fadeIn_0.4s_ease-out] space-y-6">
              <div>
                <span className="text-xs font-mono font-bold bg-[#FF2E63]/20 text-pink-300 border border-pink-500/20 px-3 py-1 rounded-full uppercase">
                  Paso 4: Cartografía del Caos
                </span>
                <h3 className="text-2xl font-bold text-white mt-3 flex items-center gap-2">
                  <span>🗺️💀</span> Convierte Mensajes y Silencios en Estrategia
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Escribe un obstáculo o hito, selecciona su tipo de zona y **haz click en el mapa** de abajo para posicionar un marcador geográfico interactivo de tu panorama.
                </p>
              </div>

              {/* Marker Adder Form */}
              <div className="flex flex-col sm:flex-row gap-3 bg-gray-950 p-4 rounded-xl border border-gray-850">
                <div className="flex-1">
                  <label className="block text-gray-400 text-[10px] uppercase font-mono font-bold mb-1">Nombre del Marcador Callejero</label>
                  <input
                    type="text"
                    value={newMarkerText}
                    onChange={(e) => setNewMarkerText(e.target.value)}
                    placeholder="Ej: Silencio de 2 días del cliente"
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white focus:outline-none focus:border-[#FF2E63]"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <label className="block text-gray-400 text-[10px] uppercase font-mono font-bold mb-1">Zona Territorial</label>
                  <select
                    value={newMarkerZone}
                    onChange={(e) => setNewMarkerZone(e.target.value as any)}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white focus:outline-none focus:border-[#FF2E63]"
                  >
                    <option value="danger">🔴 Peligro (Detonantes)</option>
                    <option value="safety">🟢 Seguridad (Anclas)</option>
                    <option value="exit">🔵 Salida (Acción/Pivote)</option>
                  </select>
                </div>
                <p className="self-end text-[10px] text-gray-400 italic py-2">
                  👈 Ahora pulsa el plano
                </p>
              </div>

              {/* Web Map UI */}
              <div 
                ref={mapContainerRef}
                onClick={handleMapClick}
                className="relative h-[300px] bg-gray-950 border-2 border-gray-800 rounded-2xl overflow-hidden cursor-crosshair shadow-inner"
                style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '16px 16px' }}
              >
                {/* Visual grid highlights */}
                <div className="absolute inset-0 border border-[#FF2E63]/10 pointer-events-none"></div>
                <div className="absolute top-0 bottom-0 left-1/3 w-[1px] bg-gray-800/50 pointer-events-none"></div>
                <div className="absolute top-0 bottom-0 left-2/3 w-[1px] bg-gray-800/50 pointer-events-none"></div>
                <div className="absolute left-0 right-0 top-1/3 h-[1px] bg-gray-800/50 pointer-events-none"></div>
                <div className="absolute left-0 right-0 top-2/3 h-[1px] bg-gray-800/50 pointer-events-none"></div>

                {/* Suburbs Tags */}
                <span className="absolute top-3 left-4 text-[9px] font-mono uppercase bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded">ZONA ROJA (Peligro)</span>
                <span className="absolute bottom-3 left-4 text-[9px] font-mono uppercase bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">ANCLA DE PISO (Seguridad)</span>
                <span className="absolute top-3 right-4 text-[9px] font-mono uppercase bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded">SALIDA TÁCTICA (Exit)</span>

                {/* Render markers */}
                {chaosMarkers.map((m) => {
                  let colorClass = 'bg-[#FF2E63] text-white shadow-[#FF2E63]';
                  if (m.zone === 'safety') colorClass = 'bg-[#08D9D6] text-gray-990 shadow-[#08D9D6]';
                  if (m.zone === 'exit') colorClass = 'bg-yellow-400 text-gray-950 shadow-yellow-400';

                  return (
                    <div
                      key={m.id}
                      className="absolute group z-10"
                      style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      {/* Anchor Pin Icon */}
                      <div className={`p-1 rounded-full relative shadow-md transition-transform scale-100 hover:scale-125 ${colorClass}`}>
                        <MapPin className="w-4 h-4 cursor-pointer" />
                      </div>

                      {/* Tooltip Hover content */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-44 bg-gray-900 border border-gray-800 text-white text-[10px] p-2 rounded-lg shadow-xl pointer-events-none group-hover:block hidden z-30">
                        <p className="font-bold uppercase tracking-wider text-gray-400">{m.zone === 'danger' ? '⚠️ Riesgo' : m.zone === 'safety' ? '⚓ Ancla' : '⚡ Desvío'}</p>
                        <p className="text-gray-200 font-medium mt-0.5 leading-tight">{m.label}</p>
                        <span className="text-[8px] text-gray-500 block mt-1 font-mono">Click basurero para remover</span>
                      </div>

                      {/* Immediate Small Trash Badge */}
                      <button
                        onClick={(e) => deleteMarker(m.id, e)}
                        className="absolute -top-3 -right-3 p-0.5 bg-red-600 rounded-full text-white hover:bg-red-500 scale-0 group-hover:scale-100 transition-all z-20"
                      >
                        <Trash className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}

                {chaosMarkers.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <p className="text-gray-500 text-xs text-center max-w-sm italic">
                      El mapa está vacío. Escribe arriba, selecciona zona y cliquea en los cuadrantes para dibujar tu red estratégica corporativa.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: EL PASTELOTE EMOCIONAL */}
          {activeStep === 5 && (
            <div className="animate-[fadeIn_0.4s_ease-out] space-y-6">
              <div>
                <span className="text-xs font-mono font-bold bg-amber-500/20 text-yellow-300 border border-yellow-500/20 px-3 py-1 rounded-full uppercase">
                  Paso 5: El Pastelote Emocional
                </span>
                <h3 className="text-2xl font-bold text-white mt-3 flex items-center gap-2">
                  <span>🎂😂</span> Integración de Gestalt en Rebanadas
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Jorge llegó con un pastel de disculpas después de pelearse. La Gestalt nos enseña a valorar tus porciones emocionales sin juzgarlas. Ajusta las dosis de tu pastel actual y lee el veredicto del barrio.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Slices controls */}
                <div className="space-y-4 bg-gray-950 p-5 rounded-xl border border-gray-800">
                  <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Ajustar Ingredientes Emocionales</h4>
                  
                  {[
                    { key: 'rabia', name: '😡 Rabia / Mala Ostia', color: 'accent-red-500' },
                    { key: 'tristeza', name: '😢 Tristeza / Bajón', color: 'accent-blue-500' },
                    { key: 'alegria', name: '😍 Alegría / Flow Lúdico', color: 'accent-yellow-500' },
                    { key: 'miedo', name: '😱 Miedo / Alerta Callejera', color: 'accent-violet-500' }
                  ].map((emo) => (
                    <div key={emo.key} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-gray-300">{emo.name}</span>
                        <span className="font-mono text-gray-400">{emotionSlices[emo.key] || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={emotionSlices[emo.key] || 0}
                        onChange={(e) => handleSliceChange(emo.key, parseInt(e.target.value))}
                        className={`w-full ${emo.color}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Simulated SVG Pie Chart representation */}
                <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-xl border border-gray-850 h-[260px]">
                  <div className="relative w-36 h-36">
                    {/* Multi-layered SVG circle rings for simple reactive pie proxy */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                      {/* Circle 1 - Background */}
                      <circle cx="16" cy="16" r="14" fill="transparent" stroke="#1f2937" strokeWidth="4" />
                      
                      {/* Slice: Rabia */}
                      <circle cx="16" cy="16" r="14" fill="transparent" stroke="#ef4444" strokeWidth="4"
                        strokeDasharray={`${emotionSlices.rabia} 100`} 
                        strokeDashoffset="0"
                      />
                      
                      {/* Slice: Tristeza */}
                      <circle cx="16" cy="16" r="14" fill="transparent" stroke="#3b82f6" strokeWidth="4"
                        strokeDasharray={`${emotionSlices.tristeza} 100`} 
                        strokeDashoffset={`-${emotionSlices.rabia}`}
                      />

                      {/* Slice: Alegría */}
                      <circle cx="16" cy="16" r="14" fill="transparent" stroke="#eab308" strokeWidth="4"
                        strokeDasharray={`${emotionSlices.alegria} 100`} 
                        strokeDashoffset={`-${(emotionSlices.rabia || 0) + (emotionSlices.tristeza || 0)}`}
                      />

                      {/* Slice: Miedo */}
                      <circle cx="16" cy="16" r="14" fill="transparent" stroke="#8b5cf6" strokeWidth="4"
                        strokeDasharray={`${emotionSlices.miedo} 100`} 
                        strokeDashoffset={`-${(emotionSlices.rabia || 0) + (emotionSlices.tristeza || 0) + (emotionSlices.alegria || 0)}`}
                      />
                    </svg>

                    {/* Center details */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl">🎂</span>
                      <span className="text-[10px] uppercase font-mono font-black text-gray-400">Total Mix</span>
                    </div>
                  </div>

                  {/* Reactive sensory feedback */}
                  <div className="mt-4 text-center">
                    <p className="text-[11px] text-yellow-300 italic max-w-sm leading-normal">
                      {(emotionSlices.rabia || 0) > 60 
                        ? '🔥 Alta dosis de Rabia: Es combustible, úsalo para definir límites con tu "Defensa Muralla", no para prender fuego las cosechas.'
                        : (emotionSlices.alegria || 0) > 50 
                        ? '✨ Elevado flow lúdico: Invita al barrio a un festejo. Recuerda guardar un 1% de sobriedad bajo la manga.'
                        : '🧩 Tu dieta emotiva está equilibrada. El pastel nutre el barrio interior con risas sin heridas corporales.'}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 6: EL RITUAL DE LA HERRAMIENTA ROTA */}
          {activeStep === 6 && (
            <div className="animate-[fadeIn_0.4s_ease-out] space-y-6">
              <div>
                <span className="text-xs font-mono font-bold bg-amber-700/20 text-orange-200 border border-orange-500/20 px-3 py-1 rounded-full uppercase">
                  Paso 6: El Ritual de la Herramienta Rota
                </span>
                <h3 className="text-2xl font-bold text-white mt-3 flex items-center gap-2">
                  <span>🛠️🕯️</span> Cierre Simbólico de Pérdidas y Ensayos
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Cuando algo se rompe, el barrio no llora eternamente: lo honra y asimila la lección. Haz click para "Romper la Herramienta Primitiva", enciende las tres velas de ofrenda y escribe lo que la pérdida te enseñó.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Altar interactivo */}
                <div className="bg-gradient-to-t from-gray-950 to-gray-900 border border-gray-800 p-5 rounded-2xl flex flex-col justify-between items-center text-center min-h-[290px] relative">
                  
                  {/* Decorative Cross/Graffiti outline */}
                  <div className="absolute top-4 left-6 text-stone-700 font-mono text-[9px] uppercase tracking-widest pointer-events-none">Altar Chalamandra v2</div>
                  <div className="absolute top-4 right-6 text-stone-700 font-mono text-[9px] pointer-events-none">[RESPECT]</div>

                  {/* Tool item state */}
                  <div className="my-3 relative">
                    <button
                      onClick={() => { setToolBroken(true); triggerToast('💥 ¡Ruptura simbólica efectuada!'); }}
                      disabled={toolBroken}
                      className={`relative p-8 rounded-full border-4 flex items-center justify-center transition-all ${
                        toolBroken 
                          ? 'border-gray-800 bg-gray-900 text-gray-500 scale-90 rotate-45 animate-pulse' 
                          : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                      }`}
                    >
                      <Wrench className={`w-12 h-12 ${toolBroken ? 'stroke-neutral-600' : 'animate-[bounce_2s_infinite]'}`} />
                      {toolBroken && (
                        <span className="absolute text-red-500 font-black text-xl uppercase tracking-widest neon-text font-mono">
                          ROTO
                        </span>
                      )}
                    </button>
                    {!toolBroken && (
                      <p className="text-stone-500 text-[10px] uppercase font-mono mt-2">PINCHA PARA ROMPER</p>
                    )}
                  </div>

                  {/* Interactive candles */}
                  <div className="flex gap-6 mt-4">
                    {altarCandles.map((lit, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleCandle(idx)}
                        className="flex flex-col items-center focus:outline-none focus:ring-0"
                      >
                        <span className={`text-2xl transition-all duration-300 ${lit ? 'animate-pulse scale-125 brightness-125' : 'grayscale opacity-40 hover:opacity-70'}`}>
                          {lit ? '🕯️' : '🕯️'}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider font-mono text-gray-500 mt-1">
                          {lit ? 'ENCENDIDA' : 'PULSAR'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Altar Text Tribute */}
                <div className="bg-gray-950 p-5 rounded-2xl border border-gray-800 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-1">Escribe tu Ofrenda de Aprendizaje</h4>
                    <p className="text-[11px] text-gray-400 leading-normal">
                      Introduce con honestidad qué te enseñó este fracaso operativo, contrato fallido o error metodológico del pasado. No dejes que se pudra en silencio.
                    </p>
                    <textarea
                      value={brokenTribute}
                      onChange={(e) => { setBrokenTribute(e.target.value); saveState({ brokenTribute: e.target.value }); }}
                      placeholder="Ej: Romper este acuerdo me enseñó que debo cobrar siempre el 50% de anticipo sin excepciones simbólicas..."
                      rows={4}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs mt-3 text-white focus:outline-none focus:border-yellow-500"
                    ></textarea>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-900 flex justify-between gap-3">
                    <button
                      onClick={resetRitual}
                      className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-[11px] font-mono text-gray-400 hover:text-white rounded-lg border border-gray-800 transition-colors"
                    >
                      Renovar Ritual
                    </button>
                    <button
                      onClick={handleCompleteRitualAction}
                      disabled={ritualCompleted}
                      className={`px-4 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wide transition-all ${
                        ritualCompleted 
                          ? 'bg-neutral-800 text-stone-500 border border-stone-800 cursor-not-allowed' 
                          : 'bg-yellow-500 hover:bg-yellow-600 text-gray-950 active:scale-95'
                      }`}
                    >
                      {ritualCompleted ? '🔒 Consagrado con Honor' : 'Consagrar Ofrenda'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 7: EL MAPA DE LA TRAMPA (Snakes & Ladders style) */}
          {false && activeStep === 7 && (
            <div className="animate-[fadeIn_0.4s_ease-out] space-y-6">
              <div>
                <span className="text-xs font-mono font-bold bg-[#08D9D6]/20 text-[#08D9D6] border border-[#08D9D6]/20 px-3 py-1 rounded-full uppercase">
                  Paso 7: El Mapa de la Trampa
                </span>
                <h3 className="text-2xl font-bold text-white mt-3 flex items-center gap-2">
                  <span>🎲🕵️‍♀️</span> Tablero de Juego "Snakes & Ladders" Urbano
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Muchas trampas del laberinto son miedos y bloqueos internos. Tira los dados virtuales para mover tu ficha de "Flow" por el barrio. Evita las **Trampas rojas** y pásate a los **Poderes verdes** para desbloquear niveles.
                </p>
              </div>

              {/* Rolling Module bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-950 p-4 rounded-xl border border-gray-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={rollDiceAction}
                    disabled={diceRolling}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-600 font-extrabold text-gray-950 hover:from-cyan-300 hover:to-cyan-500 active:scale-95 text-xs uppercase tracking-widest rounded-xl shadow-lg transition-transform flex items-center gap-2 disabled:opacity-50"
                  >
                    🎲 {diceRolling ? 'Tirando...' : 'Tirar Dados'}
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400 uppercase">Resultado:</span>
                    {lastDiceRoll !== null ? (
                      <span className="w-8 h-8 rounded bg-gray-900 border border-gray-700 flex items-center justify-center font-black text-cyan-400 text-sm animate-bounce">
                        {lastDiceRoll}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-xs">-</span>
                    )}
                  </div>
                </div>

                <div className="text-center sm:text-right font-medium text-xs text-[#08D9D6] max-w-sm italic">
                  {gameMessage}
                </div>

                <button 
                  onClick={resetGame}
                  className="p-1 hover:bg-gray-800 rounded group"
                  title="Reiniciar Juego"
                >
                  <RotateCcw className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Game board display */}
              <div className="grid grid-cols-5 gap-2.5">
                {boardCells.map((cell) => {
                  const isOccupied = pawnPosition === cell.num;
                  let colorClass = 'bg-gray-950 border-gray-850 text-gray-400';
                  
                  if (cell.type === 'start') colorClass = 'bg-stone-900 border-yellow-500/30 text-yellow-400';
                  if (cell.type === 'trap') colorClass = 'bg-red-950/20 border-red-900/40 text-red-400';
                  if (cell.type === 'power') colorClass = 'bg-emerald-950/20 border-emerald-900/40 text-[#08D9D6]';
                  if (cell.type === 'destination') colorClass = 'bg-yellow-500/10 border-yellow-500 text-yellow-100';

                  return (
                    <div
                      key={cell.num}
                      className={`relative min-h-[75px] border-2 rounded-xl p-2 flex flex-col justify-between transition-all group ${colorClass} ${
                        isOccupied ? 'ring-2 ring-white scale-105 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] z-10' : ''
                      }`}
                    >
                      <div className="flex justify-between text-[10px] font-mono font-bold tracking-tight">
                        <span>#{cell.num}</span>
                        {cell.type === 'trap' ? (
                          <span className="text-[8px] bg-red-950 border border-red-900 px-1 rounded">TRAP</span>
                        ) : cell.type === 'power' ? (
                          <span className="text-[8px] bg-emerald-950 border border-emerald-900 px-1 rounded">UP</span>
                        ) : null}
                      </div>

                      <p className="text-[10px] mt-1 uppercase font-bold leading-tight line-clamp-2">
                        {cell.label}
                      </p>

                      {/* Animated Pawn overlay */}
                      {isOccupied && (
                        <div className="absolute inset-x-0 bottom-1 flex justify-center animate-pulse">
                          <span className="bg-white text-gray-950 font-mono font-black text-[9px] px-2 py-0.5 rounded-full shadow-lg border border-black uppercase tracking-widest leading-none">
                            TÚ AQUÍ 🕹️
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 8: REFLEXIÓN DE SÍNTESIS */}
          {activeStep === 8 && (
            <div className="animate-[fadeIn_0.4s_ease-out] space-y-6">
              <div>
                <span className="text-xs font-mono font-bold bg-[#FF2E63]/20 text-[#FF2E63] border border-[#FF2E63]/20 px-3 py-1 rounded-full uppercase">
                  Paso Final: Síntesis Estratégica
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  Preguntas de Reflexión Final
                </h3>
                <p className="text-gray-400 text-sm">
                  Consolida tu sabiduría callejera autoevaluándote en esta bitácora. Tus respuestas se guardan automáticamente en tu navegador y se pueden exportar como bitácora de acción.
                </p>
              </div>

              <div className="space-y-4 bg-gray-950 p-6 rounded-2xl border border-gray-800">
                <div className="space-y-1">
                  <label className="block text-gray-300 text-xs font-bold font-mono">
                    ❓ 1. ¿Qué anécdota te pega más y por qué?
                  </label>
                  <textarea
                    value={reflections.q1}
                    onChange={(e) => handleReflexChange('q1', e.target.value)}
                    placeholder="Escribe tu respuesta aquí. Ej: La de los 6 sombreros de Edward de Bono, me ayudó a mediar con mi socio sin levantar la voz."
                    rows={2}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#08D9D6]"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-300 text-xs font-bold font-mono">
                    ❓ 2. ¿Cuál te invita a crear tu propio mapa, ritual o kit callejero?
                  </label>
                  <textarea
                    value={reflections.q2}
                    onChange={(e) => handleReflexChange('q2', e.target.value)}
                    placeholder="Escribe tu respuesta aquí. Ej: El Kit del Malandro, necesito cargar mejor mi 'Truth Bomb' para el lanzamiento."
                    rows={2}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#08D9D6]"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-300 text-xs font-bold font-mono">
                    ❓ 3. ¿Qué metáfora inventarías para procesar tu conflicto actual?
                  </label>
                  <textarea
                    value={reflections.q3}
                    onChange={(e) => handleReflexChange('q3', e.target.value)}
                    placeholder="Escribe tu respuesta aquí. Ej: El Semáforo del Socio: un código de luces de colores para evitar paros técnicos."
                    rows={2}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#08D9D6]"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-300 text-xs font-bold font-mono">
                    ❓ 4. ¿Qué visual de los propuestos usarías hoy como herramienta de claridad y flow?
                  </label>
                  <textarea
                    value={reflections.q4}
                    onChange={(e) => handleReflexChange('q4', e.target.value)}
                    placeholder="Escribe tu respuesta aquí. Ej: La Cartografía del Caos para marcar las zonas calientes de mi equipo o el Pastelote."
                    rows={2}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#08D9D6]"
                  ></textarea>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleExportMarkdown}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 active:scale-95 text-gray-950 font-black rounded-full text-xs uppercase tracking-widest shadow-xl transition-all"
                >
                  Confirmar y Guardar Bitácora Completa
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar Guide (Telling stories of Danna / Jorge) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Guide card detailing active story */}
          <div className="bg-gray-950 border border-gray-800 p-5 rounded-2xl relative overflow-hidden">
            <span className="absolute top-2 right-4 text-3xl opacity-20 pointer-events-none">📖</span>
            <h4 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-3">La Historia Detrás</h4>
            
            {activeStep === 1 && (
              <div className="space-y-3">
                <blockquote className="border-l-2 border-yellow-500 pl-3 italic text-gray-300 text-xs leading-relaxed bg-[#252A34]/50 p-2 rounded">
                  "El Messi del Malandro"
                </blockquote>
                <p className="text-gray-300 text-xs leading-relaxed">
                  En la cancha de concreto del barrio, Jorge no corría detrás del balón; se paraba en el centro del terreno con los brazos cruzados y decía: "En la calle y en el negocio, la jugada no la hace el que patea más fuerte, sino el que sabe dónde va a rebotar el balón tres segundos antes de que toque el suelo." Jorge transformaba la bronca en táctica pura. Nos enseñó a mapear cada movimiento como un partido de liguilla: quién conduce el ritmo, quién remata sin dudar, quién es la muralla inamovible que aguanta los golpes y quién enlaza las partes divididas.
                </p>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 text-[10px] space-y-1 font-mono text-yellow-500">
                  <p className="font-bold">METODOLOGÍA:</p>
                  <p className="text-gray-300">Cartografía mental + metáfora deportiva callejera.</p>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-3">
                <blockquote className="border-l-2 border-cyan-500 pl-3 italic text-gray-300 text-xs leading-relaxed bg-[#252A34]/50 p-2 rounded">
                  "El Kit del Malandro"
                </blockquote>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Una noche de llovizna, sentados en las escaleras del callejón, Jorge abrió su vieja mochila desgastada y sacó sus cosas una por una: una llave oxidada, una cinta negra, una lámpara sorda y una navaja sin filo. "Mira morra," me dijo mirándome a los ojos, "en la calle no sobrevive el más fuerte ni el más letrado. Sobrevive el que trae su kit calibrado a la mano. Cada herramienta tiene su momento: hay momentos para soltar la bomba de verdad, momentos para ponerse los lentes oscuros y hacerse el ciego, y momentos para ponerle corazón y venda al equipo. Si sales al barrio con la mochila vacía, te comen vivo."
                </p>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 text-[10px] space-y-1 font-mono text-cyan-400">
                  <p className="font-bold">METODOLOGÍA:</p>
                  <p className="text-gray-300">Gamificación + Design Thinking adaptado.</p>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-3">
                <blockquote className="border-l-2 border-[#8b5cf6] pl-3 italic text-gray-300 text-xs leading-relaxed bg-[#252A34]/50 p-2 rounded">
                  "Los 6 Sombreros de Jorge"
                </blockquote>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Cuando la tensión explotó en la esquina por un malentendido de dinero y lealtad, los gritos ya estaban por convertirse en empujones. En lugar de sacar los puños, Jorge sacó seis gorras de colores del maletero de su coche y las aventó a la mesa de plástico. "A ver, cabrones," gritó con voz firme, "aquí nadie se va a partir la madre hasta que todos se pongan el sombrero que les toca. Tú dame datos fríos con la gorra blanca, tú desahoga tu rabia con la roja, tú dime el peor escenario con la negra, y tú búscale la salida creativa con la verde." Ver a los tipos más duros del barrio cambiando de perspectiva a través de gorras imaginarias transformó una pelea violenta en una negociación impecable.
                </p>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 text-[10px] space-y-1 font-mono text-violet-400">
                  <p className="font-bold">METODOLOGÍA:</p>
                  <p className="text-gray-300">Pensamiento lateral + role play callejero.</p>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-3">
                <blockquote className="border-l-2 border-[#FF2E63] pl-3 italic text-gray-300 text-xs leading-relaxed bg-[#252A34]/50 p-2 rounded">
                  "Cartografía del Caos"
                </blockquote>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Durante semanas, el proyecto estuvo sumergido en un silencio tóxico, mensajes cifrados de madrugada y llamadas no contestadas. Me sentía atrapada en un laberinto sin salida donde cualquier paso en falso detonaba una mina. Jorge agarró una pluma sobre una servilleta grasosa en la fonda y dibujó un mapa del barrio: "El caos no es un monstruo invencible; es solo un territorio que no has dibujado. Tienes zonas rojas de peligro donde no debes meterte solo, zonas verdes de seguridad donde puedes respirar con tus aliados, y rutas azules de escape cuando el ambiente se ponga espeso. Dibuja el terreno antes de dar el paso."
                </p>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 text-[10px] space-y-1 font-mono text-pink-400">
                  <p className="font-bold">METODOLOGÍA:</p>
                  <p className="text-gray-300">Cartografía emocional de territorios hostiles.</p>
                </div>
              </div>
            )}

            {activeStep === 5 && (
              <div className="space-y-3">
                <blockquote className="border-l-2 border-yellow-500 pl-3 italic text-gray-300 text-xs leading-relaxed bg-[#252A34]/50 p-2 rounded">
                  "El Pastelote Emocional"
                </blockquote>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Tras una discusión intensa que dejó al equipo en silencio total por tres días, Jorge apareció de la nada en el taller cargando un pastel gigante de chocolate con una vela encendida. Sin decir una sola palabra solemnemente dura, partió el pastel en rebanadas chuecas y dijo: "En el barrio, si te tragas la rabia entera te empachas y mueres. Hay que picar el pastelote emocional en rebanadas: un pedazo de encabronamiento para reírnos, un pedazo de miedo para estar alerta, y una rebanada grande de alegría porque seguimos vivos." Procesar el conflicto con humor negro y chocolate nos devolvió la fluidez operativa inmediatamente.
                </p>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 text-[10px] space-y-1 font-mono text-yellow-500">
                  <p className="font-bold">METODOLOGÍA:</p>
                  <p className="text-gray-300">Gestalt + metáfora sensorial de rebanadas.</p>
                </div>
              </div>
            )}

            {activeStep === 6 && (
              <div className="space-y-3">
                <blockquote className="border-l-2 border-amber-600 pl-3 italic text-gray-300 text-xs leading-relaxed bg-[#252A34]/50 p-2 rounded">
                  "El Ritual de la Herramienta Rota"
                </blockquote>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Se nos rompió la herramienta principal a mitad del trabajo más crítico del año; la frustración nos tenía al borde del colapso. Jorge detuvo todo, recogió los pedazos de metal fracturado con sus manos grasosas, los colocó al centro de una tabla de madera y encendió tres veladoras de San Judas. "Las herramientas no se rompen por mala suerte, morra," dijo en voz baja. "Se rompen porque cumplieron su ciclo y te dieron todo lo que tenían. No le tengas coraje a lo que se rompió; ríndele tributo, aprende la lección que dejó su falla y usa el metal viejo para forjar la herramienta que sigue." Ese ritual transformó el luto por la pérdida en maestría.
                </p>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 text-[10px] space-y-1 font-mono text-orange-400">
                  <p className="font-bold">METODOLOGÍA:</p>
                  <p className="text-gray-300">Ritualización ceremonial de rupturas y pérdidas.</p>
                </div>
              </div>
            )}

            {false && activeStep === 7 && (
              <div className="space-y-3">
                <blockquote className="border-l-2 border-emerald-500 pl-3 italic text-gray-300 text-xs leading-relaxed bg-[#252A34]/50 p-2 rounded">
                  "El Mapa de la Trampa"
                </blockquote>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Sentía que cada decisión que tomaba en el negocio me llevaba directo a una trampa: clientes que no pagaban, colaboradores que saboteaban en silencio y ofertas que parecían oro pero eran veneno. Jorge me hizo sentarme y dibujar un tablero de serpientes y escaleras sobre una tabla de triplay. "Toda calle tiene sus trampas invisibles, mija," explicó mientras tiraba dos dados de madera. "Las trampas no están ahí para destruirte; están ahí para probar si aprendiste a leer los patrones. Si caes en la trampa, pagas la multa, te sacudes el polvo y vuelves a tirar los dados. Reconocer la trampa desde antes es lo que te permite desbloquear el siguiente nivel."
                </p>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 text-[10px] space-y-1 font-mono text-emerald-400">
                  <p className="font-bold">METODOLOGÍA:</p>
                  <p className="text-gray-300">Diseño de juegos cognitivos y street adventure.</p>
                </div>
              </div>
            )}

            {activeStep === 8 && (
              <div className="space-y-3">
                <blockquote className="border-l-2 border-red-500 pl-3 italic text-gray-300 text-xs leading-relaxed bg-[#252A34]/50 p-2 rounded">
                  "Síntesis e Integración"
                </blockquote>
                <p className="text-gray-400 text-xs leading-normal">
                  No hackeamos las reglas, hackeamos los incentivos. Tu bitácora final unifica las 7 piezas analizadas en un reporte robusto y claro para el plan de acción inmediato.
                </p>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 text-[10px] space-y-1 font-mono text-red-400">
                  <p className="font-bold">RESULTADO:</p>
                  <p className="text-gray-300">Mapa mental consolidado y listo para exportar.</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick interactive shortcut stats to feel like a high-end dashboard */}
          <div className="bg-gray-950 border border-gray-800 p-5 rounded-2xl">
            <h4 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-3">Tu Avance Operativo</h4>
            <div className="space-y-3 font-mono text-xs text-gray-300">
              
              <div className="flex justify-between items-center text-[11px] border-b border-gray-850 pb-2">
                <span>⚽ Posición de Juego:</span>
                <span className="text-[#FF2E63] font-bold uppercase">{activeSoccerPlayer}</span>
              </div>

              <div className="flex justify-between items-center text-[11px] border-b border-gray-850 pb-2">
                <span>🎒 Alforjas del Kit:</span>
                <span className="text-cyan-400 font-bold">{equippedTools.length} activas</span>
              </div>

              <div className="flex justify-between items-center text-[11px] border-b border-gray-850 pb-2">
                <span>🗺️ Pines en el plano:</span>
                <span className="text-yellow-400 font-bold">{chaosMarkers.length} geolocalizados</span>
              </div>

              <div className="flex justify-between items-center text-[11px] border-b border-gray-850 pb-2">
                <span>🕯️ Velas Ofrendadas:</span>
                <span className="text-orange-400 font-bold">{altarCandles.filter(c => c).length} de 3 lit</span>
              </div>

              <div className="flex justify-between items-center text-[11px] border-b border-gray-850 pb-2">
                <span>🕹️ Nivel Casillero:</span>
                <span className="text-[#08D9D6] font-bold">{pawnPosition} / 15</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default FlowMalandro;
