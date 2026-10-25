import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  RotateCcw, 
  Download, 
  Save, 
  Plus, 
  Trash2, 
  Move, 
  ArrowRight, 
  Pencil, 
  Layers, 
  Maximize2, 
  HelpCircle, 
  Sparkles, 
  Check, 
  X, 
  Share2, 
  FolderPlus,
  BookOpen,
  Volume2,
  ChevronDown,
  Target
} from 'lucide-react';
import { TacticalPlay, PlayerToken, TacticalLine, CourtType, CourtTheme, TacticalTool } from '../types/tactics';
import { storageService } from '../services/storageService';
import { DEFAULT_HALF_COURT_PLAYERS, DEFAULT_FULL_COURT_PLAYERS } from '../data/tacticsPresets';

export const TacticalCourtDiagram: React.FC = () => {
  // Plays State
  const [plays, setPlays] = useState<TacticalPlay[]>([]);
  const [currentPlayId, setCurrentPlayId] = useState<string>('play-clean-board');
  
  // Board Configuration State
  const [courtType, setCourtType] = useState<CourtType>('half');
  const [courtTheme, setCourtTheme] = useState<CourtTheme>('whiteboard');
  const [activeTool, setActiveTool] = useState<TacticalTool>('select');
  const [penColor, setPenColor] = useState<string>('#0284C7'); // default blue
  
  // Active Play Elements
  const [playTitle, setPlayTitle] = useState<string>('Pizarra en Blanco (Nueva Jugada)');
  const [playCategory, setPlayCategory] = useState<string>('Ataque por Conceptos');
  const [playConcept, setPlayConcept] = useState<string>('Diseño táctico libre');
  const [playNotes, setPlayNotes] = useState<string>('');
  const [players, setPlayers] = useState<PlayerToken[]>(DEFAULT_HALF_COURT_PLAYERS);
  const [lines, setLines] = useState<TacticalLine[]>([]);
  
  // Interaction State
  const [draggedTokenId, setDraggedTokenId] = useState<string | null>(null);
  const [drawingLine, setDrawingLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [freehandPoints, setFreehandPoints] = useState<{ x: number; y: number }[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [isErasing, setIsErasing] = useState(false);

  // Modals & UI Feedback
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isNewPlayModalOpen, setIsNewPlayModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Helper: calculate distance from point (px, py) to line segment (x1, y1) -> (x2, y2)
  const distToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  };

  // Helper: check if a tactical line was hit near (px, py)
  const isLineHit = (line: TacticalLine, px: number, py: number, tolerance = 30): boolean => {
    if (!line || !line.points || line.points.length === 0) return false;
    for (let i = 0; i < line.points.length - 1; i++) {
      const p1 = line.points[i];
      const p2 = line.points[i + 1];
      if (distToSegment(px, py, p1.x, p1.y, p2.x, p2.y) <= tolerance) {
        return true;
      }
    }
    return line.points.some(p => Math.hypot(p.x - px, p.y - py) <= tolerance);
  };

  const deleteLineById = (lineId: string) => {
    setLines(prev => prev.filter(l => l.id !== lineId));
    showNotification('Trazo borrado', 'info');
  };

  // Load plays on initial mount
  useEffect(() => {
    const loaded = storageService.getTacticalPlays();
    setPlays(loaded);
    if (loaded.length > 0) {
      loadPlayIntoBoard(loaded[0]);
    }
  }, []);

  const showNotification = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const loadPlayIntoBoard = (play: TacticalPlay) => {
    setCurrentPlayId(play.id);
    setPlayTitle(play.title);
    setPlayCategory(play.category);
    setPlayConcept(play.concept);
    setPlayNotes(play.notes);
    setCourtType(play.courtType);
    setPlayers(JSON.parse(JSON.stringify(play.players)));
    setLines(JSON.parse(JSON.stringify(play.lines || [])));
    setSelectedTokenId(null);
    setActiveTool('select');
  };

  // Convert client pointer coordinates to SVG coordinate space (800x520)
  const getSvgCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 400, y: 260 };
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 520 / rect.height;
    const x = Math.max(10, Math.min(790, (clientX - rect.left) * scaleX));
    const y = Math.max(10, Math.min(510, (clientY - rect.top) * scaleY));
    return { x: Math.round(x), y: Math.round(y) };
  }, []);

  // --- MOUSE & TOUCH HANDLERS ---
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const { x, y } = getSvgCoordinates(e.clientX, e.clientY);

    // If using SELECT tool: check if a token was clicked
    if (activeTool === 'select') {
      const clickedToken = [...players].reverse().find(t => {
        const dist = Math.hypot(t.x - x, t.y - y);
        return dist <= 24;
      });

      if (clickedToken) {
        setDraggedTokenId(clickedToken.id);
        setSelectedTokenId(clickedToken.id);
        (e.target as Element).setPointerCapture?.(e.pointerId);
      } else {
        setSelectedTokenId(null);
      }
      return;
    }

    // If using ERASER tool: erase line or token touched
    if (activeTool === 'eraser') {
      setIsErasing(true);
      (e.target as Element).setPointerCapture?.(e.pointerId);

      // 1. Check if any line was clicked anywhere along its path
      const hitLine = lines.find(line => isLineHit(line, x, y, 30));
      if (hitLine) {
        setLines(prev => prev.filter(l => l.id !== hitLine.id));
        showNotification('Trazo borrado', 'info');
        return;
      }

      // 2. Also allow clicking on a player, ball or cone to remove it
      const clickedToken = [...players].reverse().find(t => Math.hypot(t.x - x, t.y - y) <= 24);
      if (clickedToken) {
        setPlayers(prev => prev.filter(t => t.id !== clickedToken.id));
        showNotification(`Elemento ${clickedToken.label} eliminado`, 'info');
        return;
      }
      return;
    }

    // If using LINE TOOLS: pass, cut, screen, dribble, shot
    if (['pass', 'cut', 'screen', 'dribble', 'shot'].includes(activeTool)) {
      setDrawingLine({ x1: x, y1: y, x2: x, y2: y });
      (e.target as Element).setPointerCapture?.(e.pointerId);
      return;
    }

    // If using FREEHAND PEN
    if (activeTool === 'pen') {
      setFreehandPoints([{ x, y }]);
      (e.target as Element).setPointerCapture?.(e.pointerId);
      return;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const { x, y } = getSvgCoordinates(e.clientX, e.clientY);

    // Dragging player or ball
    if (activeTool === 'select' && draggedTokenId) {
      setPlayers(prev => prev.map(t => t.id === draggedTokenId ? { ...t, x, y } : t));
      return;
    }

    // Dragging tactical line
    if (drawingLine) {
      setDrawingLine(prev => prev ? { ...prev, x2: x, y2: y } : null);
      return;
    }

    // Drag-erasing lines dynamically (whiteboard sponge behavior)
    if (activeTool === 'eraser' && isErasing) {
      const hitLines = lines.filter(line => isLineHit(line, x, y, 32));
      if (hitLines.length > 0) {
        const hitIds = new Set(hitLines.map(l => l.id));
        setLines(prev => prev.filter(l => !hitIds.has(l.id)));
      }
      return;
    }

    // Freehand drawing
    if (activeTool === 'pen' && freehandPoints.length > 0) {
      setFreehandPoints(prev => [...prev, { x, y }]);
      return;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isErasing) {
      setIsErasing(false);
    }

    // Release dragged token
    if (draggedTokenId) {
      setDraggedTokenId(null);
    }

    // Finalize geometric line (pass, cut, screen, dribble, shot)
    if (drawingLine) {
      const dist = Math.hypot(drawingLine.x2 - drawingLine.x1, drawingLine.y2 - drawingLine.y1);
      if (dist > 15) {
        let color = '#0284C7';
        if (activeTool === 'pass') color = '#F59E0B';
        if (activeTool === 'screen') color = '#E11D48';
        if (activeTool === 'dribble') color = '#EA580C';
        if (activeTool === 'shot') color = '#10B981';

        const newLine: TacticalLine = {
          id: 'line-' + Date.now() + Math.random().toString(36).substring(2, 5),
          type: activeTool as any,
          color,
          points: [
            { x: drawingLine.x1, y: drawingLine.y1 },
            { x: drawingLine.x2, y: drawingLine.y2 }
          ]
        };
        setLines(prev => [...prev, newLine]);
      }
      setDrawingLine(null);
    }

    // Finalize freehand pen line
    if (freehandPoints.length > 2) {
      const newLine: TacticalLine = {
        id: 'pen-' + Date.now(),
        type: 'freehand',
        color: penColor,
        points: freehandPoints
      };
      setLines(prev => [...prev, newLine]);
      setFreehandPoints([]);
    }
  };

  // --- ACTIONS & PLAY CONTROLS ---

  const handleClearDrawings = () => {
    setLines([]);
    showNotification('Se han borrado todos los trazos de la pizarra', 'info');
  };

  // Dedicated button to clean the whole board
  const handleClearWhiteboard = () => {
    setLines([]);
    const freshPlayers = courtType === 'half' 
      ? JSON.parse(JSON.stringify(DEFAULT_HALF_COURT_PLAYERS)) 
      : JSON.parse(JSON.stringify(DEFAULT_FULL_COURT_PLAYERS));
    setPlayers(freshPlayers);
    setSelectedTokenId(null);
    // Also update and persist to storage so lines are permanently wiped
    if (currentPlayId) {
      storageService.saveTacticalPlay({
        id: currentPlayId,
        title: playTitle,
        category: playCategory,
        courtType,
        concept: playConcept,
        notes: playNotes,
        players: freshPlayers,
        lines: []
      });
      setPlays(storageService.getTacticalPlays());
    }
    showNotification('¡Pizarra completamente limpia y guardada!');
  };

  const handleUndoLine = () => {
    setLines(prev => prev.slice(0, -1));
  };

  const handleResetCourtPositions = () => {
    if (courtType === 'half') {
      setPlayers(JSON.parse(JSON.stringify(DEFAULT_HALF_COURT_PLAYERS)));
    } else {
      setPlayers(JSON.parse(JSON.stringify(DEFAULT_FULL_COURT_PLAYERS)));
    }
    showNotification('Posiciones de jugadores reiniciadas');
  };

  const handleAddPlayer = (type: 'offense' | 'defense' | 'cone' | 'ball') => {
    const id = `${type}-${Date.now()}`;
    let label = '1';
    let roleName = 'Jugador';
    let x = 400;
    let y = 260;

    if (type === 'offense') {
      const existing = players.filter(p => p.type === 'offense').length;
      label = String(existing + 1);
      roleName = `Atacante ${label}`;
      x = 360 + Math.random() * 80;
      y = 180 + Math.random() * 80;
    } else if (type === 'defense') {
      const existing = players.filter(p => p.type === 'defense').length;
      label = `X${existing + 1}`;
      roleName = `Defensor ${existing + 1}`;
      x = 360 + Math.random() * 80;
      y = 220 + Math.random() * 80;
    } else if (type === 'cone') {
      label = '🔶';
      roleName = 'Cono de Entrenamiento';
      x = 320 + Math.random() * 160;
      y = 200 + Math.random() * 100;
    } else if (type === 'ball') {
      label = '🏀';
      roleName = 'Balón adicional';
      x = 400;
      y = 260;
    }

    const newPlayer: PlayerToken = { id, type, label, x: Math.round(x), y: Math.round(y), roleName };
    setPlayers(prev => [...prev, newPlayer]);
    setSelectedTokenId(id);
    showNotification(`Elemento ${label} añadido a la cancha`);
  };

  const handleRemoveSelectedToken = () => {
    if (!selectedTokenId) return;
    setPlayers(prev => prev.filter(p => p.id !== selectedTokenId));
    setSelectedTokenId(null);
    showNotification('Elemento eliminado de la pizarra');
  };

  // Create new play (blank slate)
  const handleStartNewPlay = (name: string, category: string, court: CourtType) => {
    const newPlay: TacticalPlay = {
      id: 'custom-' + Date.now(),
      title: name || 'Nueva Jugada de Pizarra',
      category: category || 'Ataque por Conceptos',
      courtType: court,
      concept: 'Diseño propio de la entrenadora',
      notes: '',
      players: court === 'half' ? JSON.parse(JSON.stringify(DEFAULT_HALF_COURT_PLAYERS)) : JSON.parse(JSON.stringify(DEFAULT_FULL_COURT_PLAYERS)),
      lines: [],
      author: 'Coach Leyanis Horta',
      createdAt: new Date().toISOString().split('T')[0],
      isPreset: false
    };

    const saved = storageService.saveTacticalPlay(newPlay);
    const updatedList = storageService.getTacticalPlays();
    setPlays(updatedList);
    loadPlayIntoBoard(saved);
    setIsNewPlayModalOpen(false);
    showNotification(`Pizarra "${saved.title}" lista para diseñar`);
  };

  // Save current play changes
  const handleSaveCurrentPlay = () => {
    const playToSave: Partial<TacticalPlay> & { title: string } = {
      id: currentPlayId,
      title: playTitle.trim() || 'Jugada de Baloncesto',
      category: playCategory,
      courtType,
      concept: playConcept,
      notes: playNotes,
      players,
      lines,
      author: 'Coach Leyanis Horta'
    };

    const saved = storageService.saveTacticalPlay(playToSave);
    const updated = storageService.getTacticalPlays();
    setPlays(updated);
    setCurrentPlayId(saved.id);
    setIsSaveModalOpen(false);
    showNotification('¡Jugada guardada con éxito en tu libreta táctica!');
  };

  // Delete play
  const handleDeletePlay = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta jugada de tu pizarra?')) {
      storageService.deleteTacticalPlay(id);
      const updated = storageService.getTacticalPlays();
      setPlays(updated);
      if (updated.length > 0) {
        loadPlayIntoBoard(updated[0]);
      } else {
        const reset = storageService.resetTacticalPlays();
        setPlays(reset);
        if (reset.length > 0) {
          loadPlayIntoBoard(reset[0]);
        }
      }
      showNotification('Jugada eliminada');
    }
  };

  // Playback Animation Simulation
  const handleToggleAnimation = () => {
    if (isAnimating) {
      setIsAnimating(false);
      setAnimationStep(0);
      return;
    }
    setIsAnimating(true);
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % 4;
      setAnimationStep(step);
    }, 900);

    setTimeout(() => {
      clearInterval(interval);
      setIsAnimating(false);
      setAnimationStep(0);
    }, 7200);
  };

  // Export Board Diagram as PNG
  const handleDownloadPng = () => {
    if (!svgRef.current) return;

    try {
      const svg = svgRef.current;
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svg);

      // Add namespaces
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 1040;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background fill
        ctx.fillStyle = courtTheme === 'hardwood' ? '#B45309' : courtTheme === 'slate' ? '#0F172A' : '#FAF8F5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw court
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Watermark text in bottom corner
        ctx.font = 'bold 24px serif';
        ctx.fillStyle = courtTheme === 'slate' ? 'rgba(255,255,255,0.7)' : 'rgba(30,27,24,0.7)';
        ctx.fillText(`Pizarra & Criterio — Coach Leyanis Horta · ${playTitle}`, 50, 1000);

        URL.revokeObjectURL(url);

        canvas.toBlob(blob => {
          if (!blob) return;
          const a = document.createElement('a');
          const cleanName = playTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_');
          a.download = `pizarra_${cleanName}_coach_horta.png`;
          a.href = URL.createObjectURL(blob);
          a.click();
          showNotification('¡Imagen PNG de la pizarra descargada con éxito!');
        }, 'image/png');
      };

      img.src = url;
    } catch (err) {
      console.error('Error generating PNG from tactical board', err);
      showNotification('No se pudo descargar la imagen. Prueba a tomar una captura de pantalla.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Toolbar: Play selection & Main Actions */}
      <div className="bg-white dark:bg-[#1C1A18] p-4 sm:p-5 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Play Selector Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5 max-w-full">
          <div className="relative max-w-full">
            <select
              value={currentPlayId}
              onChange={e => {
                const found = plays.find(p => p.id === e.target.value);
                if (found) loadPlayIntoBoard(found);
              }}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-stone-100 dark:bg-stone-800 border border-stone-300/80 dark:border-stone-700 text-stone-900 dark:text-white cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-700 max-w-[210px] xs:max-w-[260px] sm:max-w-none truncate"
            >
              {plays.map(p => (
                <option key={p.id} value={p.id}>📋 {p.title}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="text-xs px-2.5 py-1 rounded-md bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-medium shrink-0">
            {playCategory}
          </span>

          <button
            onClick={() => handleDeletePlay(currentPlayId)}
            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
            title="Eliminar esta jugada de la pizarra"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Global Action Buttons (2-col grid on Xiaomi 360-430px, flex row on desktop) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
          
          <button
            onClick={() => setIsNewPlayModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-800 hover:bg-amber-900 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">Crear Jugada</span>
          </button>

          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <span className="truncate">Guardar</span>
          </button>

          <button
            onClick={handleDownloadPng}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Descargar pizarra en imagen PNG de alta resolución"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Descargar PNG</span>
          </button>

          <button
            onClick={handleToggleAnimation}
            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isAnimating 
                ? 'bg-orange-600 text-white animate-pulse' 
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200'
            }`}
            title="Simular secuencia táctica"
          >
            <Play className="w-4 h-4 shrink-0" />
            <span className="truncate">{isAnimating ? 'Animando...' : 'Simular'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {feedbackMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 shadow-md animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* 2. Interactive Board Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left / Center: Interactive SVG Blackboard (Span 9) */}
        <div className="lg:col-span-9 bg-white dark:bg-[#1C1A18] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-3 sm:p-5 shadow-xs flex flex-col items-center">
          
          {/* Secondary Controls: Court Size & Theme */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-stone-100 dark:border-stone-800/80 text-xs">
            
            {/* Court Type: Half / Full */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Cancha:</span>
              <button
                onClick={() => {
                  setCourtType('half');
                  handleResetCourtPositions();
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  courtType === 'half' 
                    ? 'bg-amber-800 text-white shadow-xs' 
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                Media Cancha
              </button>
              <button
                onClick={() => {
                  setCourtType('full');
                  handleResetCourtPositions();
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  courtType === 'full' 
                    ? 'bg-amber-800 text-white shadow-xs' 
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                Toda Pista
              </button>
            </div>

            {/* Board Surface Theme */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Estilo:</span>
              <button
                onClick={() => setCourtTheme('whiteboard')}
                className={`px-2 py-1 rounded-lg font-medium text-[11px] cursor-pointer ${
                  courtTheme === 'whiteboard'
                    ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 font-bold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                Pizarra Blanca
              </button>
              <button
                onClick={() => setCourtTheme('hardwood')}
                className={`px-2 py-1 rounded-lg font-medium text-[11px] cursor-pointer ${
                  courtTheme === 'hardwood'
                    ? 'bg-amber-700 text-white font-bold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                Parqué
              </button>
              <button
                onClick={() => setCourtTheme('slate')}
                className={`px-2 py-1 rounded-lg font-medium text-[11px] cursor-pointer ${
                  courtTheme === 'slate'
                    ? 'bg-sky-800 text-white font-bold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                Pizarra Azul
              </button>
            </div>

            {/* Undo & Clear Board */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleUndoLine}
                disabled={lines.length === 0}
                className="px-2 py-1 text-[11px] rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 transition-colors cursor-pointer"
                title="Deshacer último trazo"
              >
                Deshacer trazo
              </button>
              <button
                onClick={handleClearWhiteboard}
                className="px-2.5 py-1 text-[11px] rounded-lg text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer flex items-center gap-1 font-medium"
                title="Limpiar completamente la pizarra"
              >
                <RotateCcw className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                <span>Limpiar Pizarra</span>
              </button>
            </div>
          </div>

          {/* Tactical Drawing Tools Bar (Horizontal swipeable on Android/mobile) */}
          <div className="w-full mb-3 p-1.5 sm:p-2 bg-stone-100 dark:bg-stone-900/90 rounded-xl border border-stone-200/80 dark:border-stone-800 overflow-hidden">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar sm:flex-wrap pb-0.5">
              
              <button
                onClick={() => setActiveTool('select')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all text-xs shrink-0 cursor-pointer ${
                  activeTool === 'select'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800'
                }`}
                title="Arrastrar y posicionar jugadores o balón"
              >
                <Move className="w-3.5 h-3.5" />
                <span>Mover</span>
              </button>

              <button
                onClick={() => setActiveTool('pass')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all text-xs shrink-0 cursor-pointer ${
                  activeTool === 'pass'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800'
                }`}
                title="Trazar pase con línea discontinua amarilla"
              >
                <span className="w-3 border-b-2 border-dashed border-current inline-block"></span>
                <span>Pase</span>
              </button>

              <button
                onClick={() => setActiveTool('cut')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all text-xs shrink-0 cursor-pointer ${
                  activeTool === 'cut'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800'
                }`}
                title="Trazar desplazamiento o corte con flecha azul"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Corte</span>
              </button>

              <button
                onClick={() => setActiveTool('screen')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all text-xs shrink-0 cursor-pointer ${
                  activeTool === 'screen'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800'
                }`}
                title="Trazar bloqueo con barra perpendicular"
              >
                <span className="font-bold text-xs">⟂</span>
                <span>Bloqueo</span>
              </button>

              <button
                onClick={() => setActiveTool('dribble')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all text-xs shrink-0 cursor-pointer ${
                  activeTool === 'dribble'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800'
                }`}
                title="Trazar avance botando el balón"
              >
                <span className="font-mono text-xs font-bold">~&gt;</span>
                <span>Bote</span>
              </button>

              <button
                onClick={() => setActiveTool('shot')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all text-xs shrink-0 cursor-pointer ${
                  activeTool === 'shot'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800'
                }`}
                title="Trazar tiro a canasta con flecha y diana hacia el aro"
              >
                <Target className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 group-hover:text-emerald-300" />
                <span>Tiro</span>
              </button>

              <button
                onClick={() => setActiveTool('pen')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all text-xs shrink-0 cursor-pointer ${
                  activeTool === 'pen'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800'
                }`}
                title="Dibujar a mano alzada con rotulador táctico"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Lápiz</span>
              </button>

              <button
                onClick={() => setActiveTool('eraser')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all text-xs shrink-0 cursor-pointer ${
                  activeTool === 'eraser'
                    ? 'bg-rose-700 text-white shadow-xs ring-2 ring-rose-400'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800'
                }`}
                title="Toca o arrastra sobre cualquier línea o ficha para borrarla"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Borrar</span>
              </button>

              <button
                onClick={handleClearWhiteboard}
                className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all text-xs shrink-0 cursor-pointer bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200/80 dark:border-rose-900/60 shadow-2xs"
                title="Limpiar completamente la pizarra (trazos y reiniciar fichas)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Limpiar Pizarra</span>
              </button>
            </div>

            {/* Active Eraser Banner */}
            {activeTool === 'eraser' && (
              <div className="flex items-center justify-between text-xs text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/50 px-3 py-2 rounded-xl mt-2 border border-rose-200 dark:border-rose-900/60 animate-fade-in">
                <span className="leading-snug">🧹 <strong>Borrador activo:</strong> Toca cualquier trazo, flecha o ficha para eliminarlo, o arrastra el dedo/ratón para borrar.</span>
                <button
                  onClick={() => setActiveTool('select')}
                  className="px-2.5 py-1 bg-rose-200 hover:bg-rose-300 dark:bg-rose-800 dark:hover:bg-rose-700 rounded-lg font-medium text-xs text-rose-900 dark:text-white transition-colors cursor-pointer shrink-0 ml-2"
                >
                  Listo
                </button>
              </div>
            )}

            {/* Pen Color Palette (when pen active) */}
            {activeTool === 'pen' && (
              <div className="flex items-center gap-1.5 pt-2 mt-1 border-t border-stone-200 dark:border-stone-800">
                <span className="text-[11px] text-stone-500 font-medium">Color:</span>
                {['#0284C7', '#E11D48', '#F59E0B', '#10B981', '#FFFFFF', '#1E293B'].map(col => (
                  <button
                    key={col}
                    onClick={() => setPenColor(col)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                      penColor === col ? 'scale-125 border-stone-900 dark:border-white' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* SVG Court Canvas */}
          <div className="w-full relative select-none rounded-xl overflow-hidden shadow-inner border border-stone-300/80 dark:border-stone-700">
            <svg
              ref={svgRef}
              viewBox="0 0 800 520"
              className="w-full h-auto cursor-crosshair touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => {
                setDraggedTokenId(null);
                setDrawingLine(null);
                setFreehandPoints([]);
              }}
            >
              {/* COURT BACKGROUND */}
              {courtTheme === 'hardwood' ? (
                <rect x="0" y="0" width="800" height="520" fill="#CA8A04" />
              ) : courtTheme === 'slate' ? (
                <rect x="0" y="0" width="800" height="520" fill="#0F172A" />
              ) : (
                <rect x="0" y="0" width="800" height="520" fill="#F8FAFC" />
              )}

              {/* WOOD GRAIN PATTERN / LINES OVERLAY */}
              {courtTheme === 'hardwood' && (
                <g opacity="0.12">
                  {Array.from({ length: 26 }).map((_, i) => (
                    <line key={i} x1="0" y1={i * 20} x2="800" y2={i * 20} stroke="#78350F" strokeWidth="1" />
                  ))}
                </g>
              )}

              {/* --- HALF COURT MARKINGS --- */}
              {courtType === 'half' && (
                <g stroke={courtTheme === 'slate' ? '#94A3B8' : courtTheme === 'hardwood' ? '#FEF08A' : '#1E293B'} strokeWidth="2.5" fill="none">
                  
                  {/* Outer boundary */}
                  <rect x="40" y="40" width="720" height="440" rx="4" />

                  {/* Half court line at the top */}
                  <line x1="40" y1="50" x2="760" y2="50" strokeWidth="3" />
                  
                  {/* Center circle arc at top */}
                  <path d="M 330 50 A 70 70 0 0 0 470 50" strokeWidth="2.5" />

                  {/* Paint area (Key) */}
                  <rect 
                    x="300" 
                    y="260" 
                    width="200" 
                    height="220" 
                    fill={courtTheme === 'hardwood' ? 'rgba(180, 83, 9, 0.25)' : courtTheme === 'slate' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(226, 232, 240, 0.6)'} 
                    strokeWidth="2.5" 
                  />

                  {/* Free throw circle */}
                  <path d="M 300 260 A 100 100 0 0 1 500 260" strokeDasharray="8,6" />
                  <path d="M 300 260 A 100 100 0 0 0 500 260" />

                  {/* Restricted area under rim */}
                  <path d="M 360 450 A 40 40 0 0 1 440 450" strokeWidth="2" />

                  {/* Three point line */}
                  <path
                    d="M 90 480 L 90 380 A 320 320 0 0 1 710 380 L 710 480"
                    strokeWidth="3"
                  />

                  {/* Backboard & Rim */}
                  <line x1="350" y1="462" x2="450" y2="462" stroke={courtTheme === 'slate' ? '#FFFFFF' : '#0F172A'} strokeWidth="4" />
                  <circle cx="400" cy="445" r="14" stroke="#EA580C" strokeWidth="3.5" fill="none" />
                  <line x1="400" y1="462" x2="400" y2="458" strokeWidth="3" />
                </g>
              )}

              {/* --- FULL COURT MARKINGS --- */}
              {courtType === 'full' && (
                <g stroke={courtTheme === 'slate' ? '#94A3B8' : courtTheme === 'hardwood' ? '#FEF08A' : '#1E293B'} strokeWidth="2.5" fill="none">
                  
                  {/* Full Boundary */}
                  <rect x="40" y="40" width="720" height="440" rx="4" />

                  {/* Midcourt line */}
                  <line x1="400" y1="40" x2="400" y2="480" strokeWidth="3" />
                  <circle cx="400" cy="260" r="60" strokeWidth="2.5" />

                  {/* Left Paint & Basket */}
                  <rect 
                    x="40" 
                    y="190" 
                    width="150" 
                    height="140" 
                    fill={courtTheme === 'hardwood' ? 'rgba(180, 83, 9, 0.25)' : courtTheme === 'slate' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(226, 232, 240, 0.6)'} 
                  />
                  <path d="M 190 190 A 70 70 0 0 1 190 330" strokeDasharray="6,4" />
                  <path d="M 190 190 A 70 70 0 0 0 190 330" />
                  <path d="M 40 80 L 90 80 A 190 190 0 0 1 90 440 L 40 440" strokeWidth="2.5" />
                  <line x1="60" y1="230" x2="60" y2="290" stroke="#FFFFFF" strokeWidth="3.5" />
                  <circle cx="74" cy="260" r="10" stroke="#EA580C" strokeWidth="2.5" />

                  {/* Right Paint & Basket */}
                  <rect 
                    x="610" 
                    y="190" 
                    width="150" 
                    height="140" 
                    fill={courtTheme === 'hardwood' ? 'rgba(180, 83, 9, 0.25)' : courtTheme === 'slate' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(226, 232, 240, 0.6)'} 
                  />
                  <path d="M 610 190 A 70 70 0 0 0 610 330" strokeDasharray="6,4" />
                  <path d="M 610 190 A 70 70 0 0 1 610 330" />
                  <path d="M 760 80 L 710 80 A 190 190 0 0 0 710 440 L 760 440" strokeWidth="2.5" />
                  <line x1="740" y1="230" x2="740" y2="290" stroke="#FFFFFF" strokeWidth="3.5" />
                  <circle cx="726" cy="260" r="10" stroke="#EA580C" strokeWidth="2.5" />
                </g>
              )}

              {/* SAVED TACTICAL LINES */}
              {lines.map((line) => {
                const isEraserMode = activeTool === 'eraser';
                const handleEraserClick = (e: React.PointerEvent | React.MouseEvent) => {
                  if (isEraserMode) {
                    e.stopPropagation();
                    deleteLineById(line.id);
                  }
                };

                if (line.type === 'pass') {
                  const p1 = line.points[0];
                  const p2 = line.points[1];
                  return (
                    <g 
                      key={line.id} 
                      className={isEraserMode ? 'cursor-pointer hover:opacity-50 transition-opacity' : 'transition-opacity'}
                      onPointerDown={handleEraserClick}
                    >
                      {/* Fat transparent hit zone for fingertip touch erasing */}
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth="32" />
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={line.color || '#F59E0B'}
                        strokeWidth="3"
                        strokeDasharray="6,5"
                      />
                      <circle cx={p2.x} cy={p2.y} r="5" fill={line.color || '#F59E0B'} />
                    </g>
                  );
                } else if (line.type === 'cut') {
                  const p1 = line.points[0];
                  const p2 = line.points[1];
                  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                  const arrowHeadLength = 12;
                  return (
                    <g 
                      key={line.id} 
                      className={isEraserMode ? 'cursor-pointer hover:opacity-50 transition-opacity' : 'transition-opacity'}
                      onPointerDown={handleEraserClick}
                    >
                      {/* Fat transparent hit zone */}
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth="32" />
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={line.color || '#0284C7'}
                        strokeWidth="3.5"
                      />
                      <polygon
                        points={`
                          ${p2.x},${p2.y}
                          ${p2.x - arrowHeadLength * Math.cos(angle - Math.PI / 6)},${p2.y - arrowHeadLength * Math.sin(angle - Math.PI / 6)}
                          ${p2.x - arrowHeadLength * Math.cos(angle + Math.PI / 6)},${p2.y - arrowHeadLength * Math.sin(angle + Math.PI / 6)}
                        `}
                        fill={line.color || '#0284C7'}
                      />
                    </g>
                  );
                } else if (line.type === 'screen') {
                  const p1 = line.points[0];
                  const p2 = line.points[1];
                  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                  const barLength = 14;
                  const dx = Math.sin(angle) * barLength;
                  const dy = -Math.cos(angle) * barLength;
                  return (
                    <g 
                      key={line.id}
                      className={isEraserMode ? 'cursor-pointer hover:opacity-50 transition-opacity' : ''}
                      onPointerDown={handleEraserClick}
                    >
                      {/* Fat transparent hit zone */}
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth="32" />
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={line.color || '#E11D48'}
                        strokeWidth="3"
                      />
                      <line
                        x1={p2.x - dx}
                        y1={p2.y - dy}
                        x2={p2.x + dx}
                        y2={p2.y + dy}
                        stroke={line.color || '#E11D48'}
                        strokeWidth="5"
                      />
                    </g>
                  );
                } else if (line.type === 'dribble') {
                  const p1 = line.points[0];
                  const p2 = line.points[1];
                  return (
                    <g 
                      key={line.id}
                      className={isEraserMode ? 'cursor-pointer hover:opacity-50 transition-opacity' : ''}
                      onPointerDown={handleEraserClick}
                    >
                      {/* Fat transparent hit zone */}
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth="32" />
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={line.color || '#EA580C'}
                        strokeWidth="3.5"
                        strokeDasharray="4,4"
                      />
                    </g>
                  );
                } else if (line.type === 'shot') {
                  const p1 = line.points[0];
                  const p2 = line.points[1];
                  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                  const arrowHeadLength = 13;
                  return (
                    <g 
                      key={line.id}
                      className={isEraserMode ? 'cursor-pointer hover:opacity-50 transition-opacity' : 'transition-opacity'}
                      onPointerDown={handleEraserClick}
                    >
                      {/* Fat transparent hit zone for touch erasing */}
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth="32" />
                      
                      {/* Shot trajectory line with dash-dot pattern */}
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={line.color || '#10B981'}
                        strokeWidth="3.5"
                        strokeDasharray="8,4"
                      />

                      {/* Arrowhead towards basket */}
                      <polygon
                        points={`
                          ${p2.x},${p2.y}
                          ${p2.x - arrowHeadLength * Math.cos(angle - Math.PI / 6)},${p2.y - arrowHeadLength * Math.sin(angle - Math.PI / 6)}
                          ${p2.x - arrowHeadLength * Math.cos(angle + Math.PI / 6)},${p2.y - arrowHeadLength * Math.sin(angle + Math.PI / 6)}
                        `}
                        fill={line.color || '#10B981'}
                      />

                      {/* Target ring at destination representing basket target */}
                      <circle
                        cx={p2.x}
                        cy={p2.y}
                        r="7"
                        stroke={line.color || '#10B981'}
                        strokeWidth="2.5"
                        fill="rgba(16, 185, 129, 0.25)"
                      />
                    </g>
                  );
                } else if (line.type === 'freehand') {
                  const pathData = line.points.reduce((acc, pt, idx) => {
                    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                  }, '');
                  return (
                    <g 
                      key={line.id}
                      className={isEraserMode ? 'cursor-pointer hover:opacity-50 transition-opacity' : ''}
                      onPointerDown={handleEraserClick}
                    >
                      {/* Fat transparent hit zone */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="32"
                      />
                      <path
                        d={pathData}
                        fill="none"
                        stroke={line.color || penColor}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  );
                }
                return null;
              })}

              {/* CURRENTLY DRAWING LIVE PREVIEW */}
              {drawingLine && (
                <line
                  x1={drawingLine.x1}
                  y1={drawingLine.y1}
                  x2={drawingLine.x2}
                  y2={drawingLine.y2}
                  stroke={
                    activeTool === 'pass' ? '#F59E0B' : 
                    activeTool === 'screen' ? '#E11D48' : 
                    activeTool === 'dribble' ? '#EA580C' : 
                    activeTool === 'shot' ? '#10B981' : 
                    '#0284C7'
                  }
                  strokeWidth="3.5"
                  strokeDasharray={
                    activeTool === 'pass' ? '6,4' : 
                    activeTool === 'shot' ? '8,4' : 
                    activeTool === 'dribble' ? '4,4' : 
                    undefined
                  }
                />
              )}

              {/* CURRENT FREEHAND DRAWING PREVIEW */}
              {freehandPoints.length > 1 && (
                <path
                  d={freehandPoints.reduce((acc, pt, idx) => idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '')}
                  fill="none"
                  stroke={penColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* DRAGGABLE PLAYERS & TOKENS */}
              {players.map((token) => {
                const isSelected = selectedTokenId === token.id;
                const isBeingDragged = draggedTokenId === token.id;

                // Subtle animation offset during simulation
                let animX = token.x;
                let animY = token.y;
                if (isAnimating) {
                  if (token.label === '1') animY += Math.sin(animationStep) * 15;
                  if (token.label === '5') animX += Math.cos(animationStep) * 12;
                  if (token.label === '🏀') animX += Math.sin(animationStep * 1.5) * 18;
                }

                if (token.type === 'offense') {
                  return (
                    <g
                      key={token.id}
                      transform={`translate(${animX}, ${animY})`}
                      className="cursor-grab active:cursor-grabbing transition-transform duration-75"
                    >
                      {/* Selection ring */}
                      {isSelected && (
                        <circle cx="0" cy="0" r="22" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="4,3" />
                      )}
                      <circle
                        cx="0"
                        cy="0"
                        r="17"
                        fill="#EA580C"
                        stroke="#FFEDD5"
                        strokeWidth="2.5"
                        filter="drop-shadow(0 2px 5px rgba(0,0,0,0.35))"
                      />
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="14"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        className="pointer-events-none select-none"
                      >
                        {token.label}
                      </text>
                    </g>
                  );
                }

                if (token.type === 'defense') {
                  return (
                    <g
                      key={token.id}
                      transform={`translate(${animX}, ${animY})`}
                      className="cursor-grab active:cursor-grabbing transition-transform duration-75"
                    >
                      {isSelected && (
                        <circle cx="0" cy="0" r="21" fill="none" stroke="#F43F5E" strokeWidth="2" strokeDasharray="4,3" />
                      )}
                      <circle
                        cx="0"
                        cy="0"
                        r="16"
                        fill="#BE123C"
                        stroke="#FFE4E6"
                        strokeWidth="2"
                        filter="drop-shadow(0 2px 5px rgba(0,0,0,0.35))"
                      />
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="12"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        className="pointer-events-none select-none"
                      >
                        {token.label}
                      </text>
                    </g>
                  );
                }

                if (token.type === 'ball') {
                  return (
                    <g
                      key={token.id}
                      transform={`translate(${animX}, ${animY})`}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <circle cx="0" cy="0" r="14" fill="#C2410C" stroke="#FED7AA" strokeWidth="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))" />
                      {/* Basketball seams */}
                      <circle cx="0" cy="0" r="14" fill="none" stroke="#7C2D12" strokeWidth="1.5" />
                      <line x1="-14" y1="0" x2="14" y2="0" stroke="#7C2D12" strokeWidth="1.5" />
                      <path d="M -10 -10 A 15 15 0 0 1 -10 10" fill="none" stroke="#7C2D12" strokeWidth="1.2" />
                      <path d="M 10 -10 A 15 15 0 0 0 10 10" fill="none" stroke="#7C2D12" strokeWidth="1.2" />
                    </g>
                  );
                }

                if (token.type === 'cone') {
                  return (
                    <g
                      key={token.id}
                      transform={`translate(${animX}, ${animY})`}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <polygon points="0,-16 -12,12 12,12" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                      <line x1="-15" y1="12" x2="15" y2="12" stroke="#B45309" strokeWidth="3" />
                    </g>
                  );
                }

                return null;
              })}
            </svg>
          </div>

          {/* Bottom Court Legend */}
          <div className="w-full mt-3 flex flex-wrap items-center justify-between text-xs text-stone-600 dark:text-stone-400 gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-orange-600 text-white font-bold text-[9px] flex items-center justify-center">1</span>
                <span>Ataque (1-5)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-700 text-white font-bold text-[9px] flex items-center justify-center">X</span>
                <span>Defensa (X1-X5)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-orange-700 text-white text-[10px] flex items-center justify-center">🏀</span>
                <span>Balón</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 border-b-2 border-dashed border-amber-500 inline-block"></span>
                <span>Pase</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 border-b-2 border-sky-500 inline-block"></span>
                <span>Corte</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-bold text-rose-600">⟂</span>
                <span>Bloqueo</span>
              </span>
            </div>

            <span className="text-[11px] text-stone-400 italic">
              💡 Arrastra con el dedo o ratón para mover jugadores y dibujar
            </span>
          </div>
        </div>

        {/* Right Sidebar: Add Tokens, Coach Tactical Notes & Roster (Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Add Pieces to Board */}
          <div className="bg-white dark:bg-[#1C1A18] p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
            <h4 className="text-xs font-serif font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Añadir Fichas a Pista</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleAddPlayer('offense')}
                className="p-2 rounded-xl border border-orange-200 dark:border-orange-950/80 bg-orange-50/60 dark:bg-orange-950/30 text-orange-900 dark:text-orange-200 hover:bg-orange-100 flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer"
              >
                <span className="w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">+</span>
                <span>Atacante</span>
              </button>

              <button
                onClick={() => handleAddPlayer('defense')}
                className="p-2 rounded-xl border border-rose-200 dark:border-rose-950/80 bg-rose-50/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 hover:bg-rose-100 flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer"
              >
                <span className="w-4 h-4 rounded-full bg-rose-700 text-white text-[10px] font-bold flex items-center justify-center">+</span>
                <span>Defensor</span>
              </button>

              <button
                onClick={() => handleAddPlayer('ball')}
                className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer"
              >
                <span>🏀</span>
                <span>Balón</span>
              </button>

              <button
                onClick={() => handleAddPlayer('cone')}
                className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer"
              >
                <span>🔶</span>
                <span>Cono</span>
              </button>
            </div>

            {selectedTokenId && (
              <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <span className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">Ficha seleccionada</span>
                <button
                  onClick={handleRemoveSelectedToken}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Quitar de pista</span>
                </button>
              </div>
            )}
          </div>

          {/* Coach Notes Card */}
          <div className="bg-white dark:bg-[#1C1A18] p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-serif font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>Instrucciones de Banquillo</span>
              </h4>
            </div>

            <div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                {playConcept || 'Concepto Táctico'}
              </p>
              <textarea
                value={playNotes}
                onChange={e => setPlayNotes(e.target.value)}
                placeholder="Escribe aquí las instrucciones de Coach Leyanis para el equipo (ej: lectura del defensor, momento del pase extra, rotaciones)..."
                rows={5}
                className="w-full mt-1.5 p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 leading-relaxed placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <button
              onClick={handleSaveCurrentPlay}
              className="w-full py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Notas y Pizarra</span>
            </button>
          </div>

          {/* Quick Roster List */}
          <div className="bg-white dark:bg-[#1C1A18] p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
            <h4 className="text-xs font-serif font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-2">
              Distribución en Pista ({players.length} fichas)
            </h4>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 text-xs">
              {players.filter(p => p.type === 'offense').map(p => (
                <div key={p.id} className="flex items-center justify-between py-0.5 text-stone-700 dark:text-stone-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-orange-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {p.label}
                    </span>
                    <span className="font-medium">{p.roleName || `Atacante ${p.label}`}</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">({p.x}, {p.y})</span>
                </div>
              ))}
              {players.filter(p => p.type === 'defense').map(p => (
                <div key={p.id} className="flex items-center justify-between py-0.5 text-stone-700 dark:text-stone-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-rose-700 text-white font-bold text-[10px] flex items-center justify-center">
                      {p.label}
                    </span>
                    <span className="font-medium">{p.roleName || `Defensor ${p.label}`}</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">({p.x}, {p.y})</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL 1: CREATE NEW PLAY */}
      {isNewPlayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C1A18] rounded-2xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                Crear Mi Nueva Jugada
              </h3>
              <button
                onClick={() => setIsNewPlayModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem('playName') as HTMLInputElement).value;
                const cat = (form.elements.namedItem('playCat') as HTMLSelectElement).value;
                const court = (form.elements.namedItem('courtSize') as HTMLSelectElement).value as CourtType;
                handleStartNewPlay(name, cat, court);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Nombre o Título de la Jugada *
                </label>
                <input
                  name="playName"
                  type="text"
                  required
                  placeholder="Ej: Saque de Fondo 'Ganador', Puerta Atrás 4-Out..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Categoría
                </label>
                <select
                  name="playCat"
                  defaultValue="Ataque por Conceptos"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white"
                >
                  <option value="Ataque por Conceptos">Ataque por Conceptos</option>
                  <option value="Táctica Defensiva">Táctica Defensiva</option>
                  <option value="Saques de Banda/Fondo">Saques de Banda / Fondo</option>
                  <option value="Salidas de Presión">Salidas de Presión</option>
                  <option value="Transición & Contraataque">Transición & Contraataque</option>
                  <option value="Finales Apretados (Clutch)">Finales Apretados (Clutch)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Tipo de Cancha
                </label>
                <select
                  name="courtSize"
                  defaultValue="half"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white"
                >
                  <option value="half">Media Cancha (Ataque posicional)</option>
                  <option value="full">Toda Pista (Presión y Contraataque)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPlayModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Pizarra</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SAVE PLAY DETAILS */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C1A18] rounded-2xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                Guardar en Mi Libreta de Pizarra
              </h3>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Título de la Jugada *
                </label>
                <input
                  type="text"
                  value={playTitle}
                  onChange={e => setPlayTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Categoría
                </label>
                <select
                  value={playCategory}
                  onChange={e => setPlayCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white"
                >
                  <option value="Ataque por Conceptos">Ataque por Conceptos</option>
                  <option value="Táctica Defensiva">Táctica Defensiva</option>
                  <option value="Saques de Banda/Fondo">Saques de Banda / Fondo</option>
                  <option value="Salidas de Presión">Salidas de Presión</option>
                  <option value="Transición & Contraataque">Transición & Contraataque</option>
                  <option value="Finales Apretados (Clutch)">Finales Apretados (Clutch)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Concepto Clave
                </label>
                <input
                  type="text"
                  value={playConcept}
                  onChange={e => setPlayConcept(e.target.value)}
                  placeholder="Ej: Bloqueo ciego, pase extra, lectura de ayudas..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Consignas e Instrucciones para los Jugadores
                </label>
                <textarea
                  value={playNotes}
                  onChange={e => setPlayNotes(e.target.value)}
                  rows={4}
                  placeholder="Detalla qué debe hacer cada jugador en cada fase del movimiento..."
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCurrentPlay}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Jugada</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
