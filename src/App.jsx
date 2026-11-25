import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PlusCircle, FileText, BarChart2, Sliders, Save, Pencil, Trash2,
  ChevronDown, ChevronUp, Check, ArrowRight, RotateCcw,
  TrendingUp, Package, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { computePlate, desviacion, summarizePlates } from './weightMath.js';

// ─────────────────────────────────────────────────────────────────────────────
// Sistema de estado
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  idle: '#7FA8FF',
  ok: '#2EE6A8',
  warn: '#FFC24B',
  danger: '#FF5C7A',
};

const STATUS_CHIP = {
  idle: 'border-line/40 bg-white/5 text-mist',
  ok: 'border-ok/30 bg-ok/10 text-ok',
  warn: 'border-warn/30 bg-warn/10 text-warn',
  danger: 'border-danger/30 bg-danger/10 text-danger',
};

const STATUS_DOT = {
  idle: 'bg-steel',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
};

const STATUS_LABEL = {
  idle: 'Esperando peso',
  ok: 'Dentro de tolerancia',
  warn: 'Cerca del límite',
  danger: 'Fuera de tolerancia',
};

const statusOf = (pct, tol) => {
  const abs = Math.abs(Number(pct));
  if (abs <= tol) return 'ok';
  if (abs <= tol * 2) return 'warn';
  return 'danger';
};

const signed = (value, digits = 1) => {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n > 0 ? '+' : ''}${n.toFixed(digits)}`;
};

const dialScale = (tol) => Math.max(Number(tol) * 3, 6);

// ─────────────────────────────────────────────────────────────────────────────
// Piezas de interfaz
// ─────────────────────────────────────────────────────────────────────────────

const Logomark = ({ className = '' }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="lc-mark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3FD0FF" />
        <stop offset="100%" stopColor="#2457FF" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="46" height="46" rx="14" fill="rgba(36, 87, 255, 0.16)" stroke="url(#lc-mark)" strokeWidth="1.5" />
    <path
      d="M24 12v7M12.5 19h23M17 19l-5.5 10.5a5.5 5.5 0 0 0 11 0L17 19Zm14 0-5.5 10.5a5.5 5.5 0 0 0 11 0L31 19Z"
      fill="none"
      stroke="url(#lc-mark)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M16.5 35h15" stroke="#3FD0FF" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
  </svg>
);

const StatusPill = ({ pct, tol, children }) => {
  const status = pct === null || pct === undefined ? 'idle' : statusOf(pct, tol);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tabular-nums ${STATUS_CHIP[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} aria-hidden="true" />
      {children}
    </span>
  );
};

const Metric = ({ label, value, unit, tone = 'text-frost' }) => (
  <div className="px-3 py-4 sm:px-6">
    <p className="min-h-[2.4em] text-[10px] font-medium uppercase leading-tight tracking-[0.16em] text-steel">{label}</p>
    <p className={`mt-1.5 font-display text-[22px] font-semibold leading-none tabular-nums sm:text-3xl ${tone}`}>
      {value ?? '—'}
      {unit && <span className="ml-1 font-sans text-[11px] font-medium text-steel">{unit}</span>}
    </p>
  </div>
);

const StepSegments = ({ step }) => {
  const labels = ['Molde', 'Etapa 1', 'Etapa 2'];
  return (
    <div
      className="mt-5 grid grid-cols-3 gap-2"
      role="progressbar"
      aria-label="Paso de medición"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={3}
    >
      {labels.map((label, index) => {
        const number = index + 1;
        const active = number === step;
        const done = number < step;
        return (
          <div
            key={label}
            className={`rounded-xl border px-2 py-2 text-center transition-colors duration-200 ${
              active
                ? 'border-cyan/50 bg-cyan/10'
                : done
                  ? 'border-ok/25 bg-ok/5'
                  : 'border-line/15 bg-void/40'
            }`}
          >
            <span className={`flex items-center justify-center gap-1 font-display text-[11px] font-semibold tabular-nums ${
              active ? 'text-cyan' : done ? 'text-ok' : 'text-steel'
            }`}>
              {done ? <Check size={12} strokeWidth={3} /> : `0${number}`}
            </span>
            <span className={`mt-0.5 block text-[9px] uppercase tracking-[0.1em] ${
              active ? 'text-frost' : done ? 'text-ok/80' : 'text-steel'
            }`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const WeightField = ({ inputRef, label, hint, value, placeholder, onChange, onKeyDown, readOnly, unit = 'g' }) => (
  <div className="mt-6">
    <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
      <label htmlFor="peso-actual" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-steel">
        {label}
      </label>
      {hint && <span className="text-[11px] text-steel/80">{hint}</span>}
    </div>
    <div className={`mt-3 flex items-end justify-center gap-3 rounded-2xl border border-line/20 bg-void/60 px-4 py-5 transition-[border-color,box-shadow] duration-200 sm:py-7 ${
      readOnly ? '' : 'focus-within:border-cyan/60 focus-within:shadow-glow-cyan'
    }`}>
      <input
        id="peso-actual"
        ref={inputRef}
        type="number"
        inputMode="decimal"
        className={`w-full bg-transparent text-center font-display text-[clamp(2.5rem,11vw,4.25rem)] font-semibold leading-none tracking-[-0.03em] tabular-nums outline-none placeholder:text-steel ${
          readOnly ? 'pointer-events-none cursor-default text-mist' : 'text-frost'
        }`}
        tabIndex={readOnly ? -1 : undefined}
        aria-readonly={readOnly || undefined}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        readOnly={readOnly}
        aria-describedby="peso-ayuda"
      />
      <span className="pb-1.5 font-display text-xl font-medium text-steel">{unit}</span>
    </div>
  </div>
);

const Dial = ({ pct, tolerancia }) => {
  const hasValue = pct !== null && pct !== undefined && Number.isFinite(Number(pct));
  const realTol = Math.max(Number(tolerancia) || 0, 0);
  const tol = Math.max(realTol, 0.5);
  const scale = dialScale(tol);
  const ratio = hasValue ? Math.max(-1, Math.min(1, Number(pct) / scale)) : 0;
  const angle = ratio * 78;
  const status = hasValue ? statusOf(pct, realTol) : 'idle';
  const color = STATUS_COLOR[status];
  const okHalf = (tol / scale) * 50;
  const warnHalf = (Math.min(tol * 2, scale) / scale) * 50;

  const ticks = Array.from({ length: 25 }, (_, i) => {
    const deg = 180 - i * 7.5;
    const rad = (deg * Math.PI) / 180;
    const major = i % 4 === 0;
    const outer = 102;
    const inner = major ? 90 : 95;
    return {
      key: i,
      x1: 160 + Math.cos(rad) * outer,
      y1: 168 - Math.sin(rad) * outer,
      x2: 160 + Math.cos(rad) * inner,
      y2: 168 - Math.sin(rad) * inner,
      major,
    };
  });

  return (
    <div className="flex flex-col">
      <div className="relative order-2 mx-auto w-full max-w-[300px] sm:order-1 sm:max-w-[340px]">
        <svg
          viewBox="0 0 320 212"
          className="w-full"
          role="img"
          aria-label={`Desviación ${hasValue ? `${signed(pct)} por ciento` : 'sin datos'}, ${STATUS_LABEL[status]}`}
        >
          <defs>
            <filter id="lc-needle-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="lc-dial-halo" cx="50%" cy="66%" r="62%">
              <stop offset="0%" stopColor="#3FD0FF" stopOpacity="0.16" />
              <stop offset="55%" stopColor="#2457FF" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#04081A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lc-plate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3FD0FF" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#050A1C" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="lc-track" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7FA8FF" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#A9C0E8" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#7FA8FF" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="lc-ok-zone" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#14B98A" />
              <stop offset="50%" stopColor="#2EE6A8" />
              <stop offset="100%" stopColor="#14B98A" />
            </linearGradient>
            <linearGradient id="lc-warn-zone" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F0A21A" />
              <stop offset="50%" stopColor="#FFC24B" />
              <stop offset="100%" stopColor="#F0A21A" />
            </linearGradient>
          </defs>

          {/* Halo del instrumento: volumen por debajo del arco */}
          <ellipse cx="160" cy="132" rx="150" ry="104" fill="url(#lc-dial-halo)" />

          {/* Base elíptica: el plato de la báscula en perspectiva */}
          <ellipse cx="160" cy="174" rx="122" ry="27" fill="url(#lc-plate)" stroke="rgba(127, 168, 255, 0.22)" />
          <ellipse cx="160" cy="174" rx="96" ry="20" fill="none" stroke="rgba(63, 208, 255, 0.18)" />
          <ellipse cx="160" cy="174" rx="70" ry="14" fill="none" stroke="rgba(127, 168, 255, 0.12)" />

          {/* Pista del arco */}
          <path d="M 58 168 A 102 102 0 0 1 262 168" pathLength="100" fill="none" stroke="url(#lc-track)" strokeWidth="10" strokeLinecap="round" />

          {/* Zonas de tolerancia */}
          <path
            d="M 58 168 A 102 102 0 0 1 262 168"
            pathLength="100"
            fill="none"
            stroke="url(#lc-warn-zone)"
            strokeOpacity="0.82"
            strokeWidth="10"
            strokeDasharray={`${warnHalf * 2} 100`}
            strokeDashoffset={-(50 - warnHalf)}
          />
          <path
            d="M 58 168 A 102 102 0 0 1 262 168"
            pathLength="100"
            fill="none"
            stroke="url(#lc-ok-zone)"
            strokeOpacity="0.95"
            strokeWidth="10"
            strokeDasharray={`${okHalf * 2} 100`}
            strokeDashoffset={-(50 - okHalf)}
          />

          {/* Marcas */}
          {ticks.map((tick) => (
            <line
              key={tick.key}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={tick.major ? 'rgba(169, 192, 232, 0.5)' : 'rgba(169, 192, 232, 0.2)'}
              strokeWidth={tick.major ? 1.6 : 1}
              strokeLinecap="round"
            />
          ))}

          {/* Aguja */}
          <g
            transform={`rotate(${angle} 160 168)`}
            style={{ transition: 'transform 520ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            filter="url(#lc-needle-glow)"
          >
            <line x1="160" y1="168" x2="160" y2="86" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="160" y1="166" x2="160" y2="92" stroke="#F2F6FF" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
            <circle cx="160" cy="86" r="4.5" fill={color} />
          </g>
          <circle cx="160" cy="168" r="13" fill="none" stroke={color} strokeOpacity="0.22" strokeWidth="6" />
          <circle cx="160" cy="168" r="9" fill="#050A1C" stroke={color} strokeWidth="2.5" />
          <circle cx="160" cy="168" r="3" fill={color} />
        </svg>
      </div>

      <div className="order-1 mb-3 text-center sm:order-2 sm:mb-0 sm:mt-1">
        <p className="font-display text-[34px] font-semibold leading-none tabular-nums sm:text-[40px]" style={{ color }}>
          {hasValue ? `${signed(pct)}%` : '—'}
        </p>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: hasValue ? color : '#7C93BC' }} aria-live="polite">
          {STATUS_LABEL[status]}
        </p>
      </div>

      {/* Barra de tolerancia: lectura de un vistazo */}
      <div className="order-3 mt-4">
        <div className="relative h-2.5 overflow-hidden rounded-full border border-line/20 bg-void/70">
          <div
            className="absolute inset-y-0 bg-warn/15"
            style={{ left: `${50 - warnHalf}%`, width: `${warnHalf * 2}%` }}
          />
          <div
            className="absolute inset-y-0 bg-ok/20"
            style={{ left: `${50 - okHalf}%`, width: `${okHalf * 2}%` }}
          />
          {hasValue && (
            <div
              className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2"
              style={{
                left: `calc(${50 + ratio * 50}% - 7px)`,
                background: color,
                borderColor: '#050A1C',
                boxShadow: `0 0 14px ${color}`,
                transition: 'left 520ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          )}
        </div>
        <div className="mt-2 flex justify-between font-sans text-[10px] tabular-nums text-steel">
          <span>−{scale}%</span>
          <span>0</span>
          <span>+{scale}%</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// App principal
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'medir', label: 'Medir', icon: PlusCircle },
  { id: 'historial', label: 'Historial', icon: FileText },
  { id: 'estadisticas', label: 'Estadísticas', icon: BarChart2 },
  { id: 'ajustes', label: 'Ajustes', icon: Sliders },
];

const plateVacio = () => ({ molde: '', acumE1: '', acumE2: '' });

export default function App() {
  const [activeTab, setActiveTab] = useState('medir');
  const [productoSel, setProductoSel] = useState(0);
  const [step, setStep] = useState(1);
  const [platoActual, setPlatoActual] = useState(1);
  const [pesos, setPesos] = useState(plateVacio);
  const [platos, setPlatos] = useState(() => [plateVacio(), plateVacio(), plateVacio()]);
  const [historial, setHistorial] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [tolerancia, setTolerancia] = useState(2);
  const [editingIdx, setEditingIdx] = useState(null);
  const [showRecipeDash, setShowRecipeDash] = useState(false);
  const [expandedRegistro, setExpandedRegistro] = useState(null);
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const inputRefs = [useRef(null), useRef(null), useRef(null)];

  // ───────────────────────────────────────────────────────────────────────────
  // Persistencia
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lactcontrol-historial');
      if (saved) setHistorial(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lactcontrol-catalogo');
      if (saved) setCatalogo(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lactcontrol-tolerancia');
      if (saved) setTolerancia(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem('lactcontrol-historial', JSON.stringify(historial));
  }, [historial]);

  useEffect(() => {
    localStorage.setItem('lactcontrol-catalogo', JSON.stringify(catalogo));
  }, [catalogo]);

  useEffect(() => {
    localStorage.setItem('lactcontrol-tolerancia', JSON.stringify(tolerancia));
  }, [tolerancia]);

  // Catálogo por defecto (idéntico a la versión anterior)
  const CATALOGO_OFICIAL = [
    { nombre: 'Pan Chico vainilla', ideal: 660, etapa1: 415, etapa2: 245 },
    { nombre: 'Pan Mediano vainilla', ideal: 815, etapa1: 440, etapa2: 375 },
    { nombre: 'Pan Grande vainilla', ideal: 575, etapa1: 315, etapa2: 260 },
    { nombre: 'Rosca Chica vainilla', ideal: 570, etapa1: 315, etapa2: 255 },
    { nombre: 'Rosca Grande vainilla', ideal: 950, etapa1: 525, etapa2: 425 },
    { nombre: 'Pan Mediano Chocolate', ideal: 900, etapa1: 540, etapa2: 360 },
    { nombre: 'Pan 4 Leches', ideal: 815, etapa1: 440, etapa2: 375 },
    { nombre: 'Rosca Nutella', ideal: 570, etapa1: 315, etapa2: 255 },
    { nombre: 'Bambino', ideal: 352, etapa1: 215, etapa2: 137 },
  ];

  useEffect(() => {
    if (catalogo.length === 0) {
      setCatalogo(CATALOGO_OFICIAL);
      setProductoSel(0);
      return;
    }
    // Migración: actualiza gramajes de recetas oficiales que coincidan por nombre,
    // preservando recetas personalizadas añadidas por el usuario.
    const oficialesPorNombre = new Map(CATALOGO_OFICIAL.map((r) => [r.nombre, r]));
    let cambio = false;
    const migrado = catalogo.map((receta) => {
      const oficial = oficialesPorNombre.get(receta.nombre);
      if (oficial && (
        receta.ideal !== oficial.ideal ||
        receta.etapa1 !== oficial.etapa1 ||
        receta.etapa2 !== oficial.etapa2
      )) {
        cambio = true;
        return { ...receta, ideal: oficial.ideal, etapa1: oficial.etapa1, etapa2: oficial.etapa2 };
      }
      return receta;
    });
    if (cambio) setCatalogo(migrado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogo]);

  const currentProduct = catalogo[productoSel];

  // ───────────────────────────────────────────────────────────────────────────
  // Cálculos
  // ───────────────────────────────────────────────────────────────────────────
  const getDesviacion = (actual, objetivo) => {
    const pct = desviacion(actual, objetivo);
    return pct === null ? '0.0' : String(pct);
  };

  const getStatusColor = (pct, tol) => {
    const abs = Math.abs(Number(pct));
    if (abs <= tol) return 'text-ok';
    if (abs <= tol * 2) return 'text-warn';
    return 'text-danger';
  };

  // La balanza acumula: molde -> molde + E1 -> molde + E1 + E2.
  // La desviación se mide contra el objetivo de la etapa que se está pesando.
  const live = computePlate(pesos);
  const livePct =
    step === 2
      ? desviacion(live.etapa1, currentProduct?.etapa1)
      : step === 3
        ? desviacion(live.etapa2, currentProduct?.etapa2)
        : null;

  // Compatibilidad con registros antiguos: derivar gramos desde los detalles.
  const getRegistroResumen = (reg) => {
    if (reg.pesoE1 !== undefined && reg.pesoE2 !== undefined && reg.total !== undefined) {
      return { pesoE1: Number(reg.pesoE1), pesoE2: Number(reg.pesoE2), total: Number(reg.total) };
    }
    const detalles = reg.detalles || [];
    const media = (valores) => {
      const validos = valores.map(Number).filter((v) => Number.isFinite(v) && v > 0);
      if (!validos.length) return null;
      return Math.round((validos.reduce((acc, v) => acc + v, 0) / validos.length) * 10) / 10;
    };
    const pesoE1 = media(detalles.map((d) => d.etapa1));
    const pesoE2 = media(detalles.map((d) => d.etapa2));
    return {
      pesoE1,
      pesoE2,
      total: pesoE1 !== null && pesoE2 !== null ? Math.round((pesoE1 + pesoE2) * 10) / 10 : null,
    };
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Navegación de teclado y foco
  // ───────────────────────────────────────────────────────────────────────────
  const handleRegistrarPlato = () => {
    const nuevosPlatos = [...platos];
    nuevosPlatos[platoActual - 1] = { ...pesos };
    setPlatos(nuevosPlatos);
    if (platoActual < 3) {
      setPlatoActual(platoActual + 1);
      setStep(1);
      setPesos(plateVacio());
    }
  };

  const handleFinalizar = () => {
    // Guarda también el plato en curso (el tercero nunca pasaba por "Registrar")
    const platosFinales = platos.map((p, i) => (i === platoActual - 1 ? { ...pesos } : p));
    const recipe = catalogo[productoSel] || {};
    const resumen = summarizePlates(platosFinales, recipe);

    const registro = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      producto: recipe.nombre,
      platos: platosFinales.map((p) => ({ ...p })),
      pesoE1: resumen.pesoE1,
      pesoE2: resumen.pesoE2,
      total: resumen.total,
      d1: resumen.d1,
      d2: resumen.d2,
      dTotal: resumen.dTotal,
      targetE1: Number(recipe.etapa1) || 0,
      targetE2: Number(recipe.etapa2) || 0,
      targetTotal: Number(recipe.ideal) || 0,
      detalles: resumen.detalles,
    };

    setHistorial([registro, ...historial]);
    setPlatos([plateVacio(), plateVacio(), plateVacio()]);
    setPesos(plateVacio());
    setPlatoActual(1);
    setStep(1);
    setActiveTab('historial');
  };

  // Para avanzar hace falta el molde y el acumulado de la etapa en curso.
  const stepReady =
    Boolean(pesos.molde) &&
    (step < 2 || Boolean(pesos.acumE1)) &&
    (step < 3 || Boolean(pesos.acumE2));

  const advance = () => {
    if (!stepReady) return;
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (platoActual < 3) handleRegistrarPlato();
    else handleFinalizar();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      advance();
    }
  };

  useEffect(() => {
    // El paso 1 también es un campo real: el peso del molde vacío.
    inputRefs[step - 1]?.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, platoActual]);

  const handleCancelar = () => {
    setPlatos([plateVacio(), plateVacio(), plateVacio()]);
    setPesos(plateVacio());
    setPlatoActual(1);
    setStep(1);
    setActiveTab('medir');
  };

  const handleBorrarRegistro = (id) => {
    if (window.confirm('¿Eliminar este registro del historial?')) {
      setHistorial(historial.filter((r) => r.id !== id));
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Catálogo
  // ───────────────────────────────────────────────────────────────────────────
  const patchRecipe = (idx, data) => {
    const nuevo = [...catalogo];
    nuevo[idx] = { ...nuevo[idx], ...data };
    setCatalogo(nuevo);
  };

  const startEditing = (idx) => setEditingIdx(idx);
  const cancelEditing = () => setEditingIdx(null);

  // ───────────────────────────────────────────────────────────────────────────
  // Estadísticas derivadas
  // ───────────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const n = historial.length;
    const dentro = historial.filter((r) => Math.abs(Number(r.dTotal)) <= tolerancia).length;
    const warn = historial.filter((r) => {
      const abs = Math.abs(Number(r.dTotal));
      return abs > tolerancia && abs <= tolerancia * 2;
    }).length;
    const fuera = n - dentro - warn;
    const media = n ? historial.reduce((acc, r) => acc + Math.abs(Number(r.dTotal)), 0) / n : 0;

    const byProduct = {};
    historial.forEach((r) => {
      const key = r.producto || 'Sin producto';
      if (!byProduct[key]) byProduct[key] = { nombre: key, n: 0, suma: 0 };
      byProduct[key].n += 1;
      byProduct[key].suma += Math.abs(Number(r.dTotal));
    });

    const ranking = Object.values(byProduct)
      .map((p) => ({ ...p, media: p.suma / p.n }))
      .sort((a, b) => a.media - b.media);

    return {
      n,
      dentro,
      warn,
      fuera,
      media,
      ranking,
      pctDentro: n ? Math.round((dentro / n) * 100) : 0,
    };
  }, [historial, tolerancia]);

  const statusNow = livePct === null ? 'idle' : statusOf(livePct, tolerancia);

  const primaryDisabled = !stepReady;
  const cancelDisabled = platoActual === 1 && step === 1 && !pesos.molde && !pesos.acumE1 && !pesos.acumE2;

  const stepLabels = ['Molde', 'Etapa 1', 'Etapa 2'];
  const sliderOk = Math.min(100, (tolerancia / 20) * 100);
  const sliderWarn = Math.min(100, (tolerancia * 2 / 20) * 100);
  const primaryLabel =
    step < 3
      ? `Continuar a ${stepLabels[step]}`
      : platoActual < 3
        ? `Registrar plato ${platoActual}`
        : 'Finalizar medición';

  const fieldLabel =
    step === 1 ? 'Peso del molde vacío' : step === 2 ? 'Molde + leche etapa 1' : 'Molde + etapa 1 + etapa 2';

  const fieldPlaceholder =
    step === 1 ? 'Molde (g)' : step === 2 ? 'Molde + E1 (g)' : 'Total acumulado (g)';

  const fieldValue = step === 1 ? pesos.molde : step === 2 ? pesos.acumE1 : pesos.acumE2;

  const fieldHint =
    step === 2 && live.etapa1 !== null
      ? `Etapa 1: ${live.etapa1} g`
      : step === 3 && live.etapa2 !== null
        ? `Etapa 2: ${live.etapa2} g · Total: ${live.total} g`
        : showRecipeDash && step === 2
          ? `Objetivo ${currentProduct?.etapa1} g`
          : showRecipeDash && step === 3
            ? `Objetivo ${currentProduct?.etapa2} g`
            : null;

  const ayuda =
    step === 1
      ? 'Pesa el molde solo, sin leche, y pulsa Continuar'
      : step === 2
        ? `Pesa el molde con la leche de la etapa 1${live.etapa1 !== null ? ` · ${live.etapa1} g reales` : ''}`
        : `Pesa el molde con las dos etapas${live.total !== null ? ` · Total ${live.total} g` : ''}`;

  const fieldOnChange = (e) => {
    const value = e.target.value;
    if (step === 1) setPesos({ ...pesos, molde: value });
    else if (step === 2) setPesos({ ...pesos, acumE1: value });
    else setPesos({ ...pesos, acumE2: value });
  };

  const liveMetrics = [
    { label: 'Etapa 1', value: live.etapa1, pct: desviacion(live.etapa1, currentProduct?.etapa1) },
    { label: 'Etapa 2', value: live.etapa2, pct: desviacion(live.etapa2, currentProduct?.etapa2) },
    { label: 'Total', value: live.total, pct: desviacion(live.total, currentProduct?.ideal) },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Aura ambiente */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-40 -top-52 h-[560px] w-[560px] rounded-full bg-electric/20 blur-[150px] animate-drift" />
        <div className="absolute -left-56 bottom-[-14rem] h-[520px] w-[520px] rounded-full bg-cyan/10 blur-[150px] animate-drift" style={{ animationDirection: 'reverse' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-line/10 bg-deep/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
            <Logomark className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
            <div className="min-w-0">
              <p className="font-display text-[15px] font-semibold leading-none tracking-tight text-frost">
                Lact<span className="text-cyan">Control</span>
              </p>
              <p className="mt-1 hidden text-[9px] uppercase tracking-[0.22em] text-steel sm:block">
                Estación de pesaje
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-line/20 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-steel lg:inline-flex">
                Tolerancia ±{tolerancia}%
              </span>

              {/* Selector de producto */}
              <div
                className="relative"
                ref={dropdownRef}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsDropdownOpen(false);
                }}
              >
                <button
                  onClick={() => setIsDropdownOpen((open) => !open)}
                  className="flex min-h-[44px] w-full items-center gap-2 rounded-xl border border-line/20 bg-panel/50 px-3 py-2 text-left transition-colors duration-150 hover:border-cyan/40 hover:bg-panel/70"
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  aria-label="Seleccionar producto"
                >
                  <span className="hidden text-[9px] uppercase tracking-[0.16em] text-steel sm:block">Producto</span>
                  <span className="max-w-[38vw] truncate font-display text-[13px] font-semibold text-frost sm:max-w-[220px]">
                    {currentProduct?.nombre || '—'}
                  </span>
                  <ChevronDown
                    size={15}
                    strokeWidth={2.5}
                    className={`shrink-0 text-steel transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-cyan' : ''}`}
                  />
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} aria-hidden="true" />
                    <ul
                      className="absolute right-0 z-50 mt-2 max-h-80 w-[min(90vw,340px)] overflow-auto rounded-2xl border border-line/25 bg-[#081228]/95 p-1.5 shadow-dock backdrop-blur-2xl"
                      role="listbox"
                      aria-label="Productos"
                    >
                      {catalogo.map((p, i) => {
                        const selected = i === productoSel;
                        return (
                          <li key={`${p.nombre}-${i}`}>
                            <button
                              onClick={() => {
                                setProductoSel(i);
                                setPesos(plateVacio());
                                setIsDropdownOpen(false);
                              }}
                              role="option"
                              aria-selected={selected}
                              className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ${
                                selected ? 'bg-cyan/10 text-cyan' : 'text-mist hover:bg-white/5 hover:text-frost'
                              }`}
                            >
                              <span className="min-w-0 flex-1 truncate font-display text-[13px] font-medium">{p.nombre}</span>
                              <span className="shrink-0 text-[11px] tabular-nums text-steel">{p.ideal} g</span>
                              {selected && <Check size={14} strokeWidth={3} className="shrink-0 text-cyan" />}
                            </button>
                          </li>
                        );
                      })}
                      {catalogo.length === 0 && (
                        <li className="px-3 py-6 text-center text-xs text-steel">Sin productos en el catálogo</li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-6 sm:pt-6">
          <div key={activeTab} className="animate-rise">
            {/* ───────────── MEDIR ───────────── */}
            {activeTab === 'medir' && (
              <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
                  {/* Instrumento */}
                  <section className="glass-panel glass-panel--lit p-4 sm:p-6" aria-label="Medición en curso">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h1 className="font-display text-base font-semibold text-frost">Medición en curso</h1>
                        <p className="mt-0.5 text-xs text-steel">
                          Plato {platoActual} de 3 · {stepLabels[step - 1]}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span
                          className="inline-flex items-center rounded-full border border-line/25 bg-white/[0.04] px-2 py-1 font-display text-[10px] font-semibold tabular-nums text-mist lg:hidden"
                          aria-label={`Tolerancia más menos ${tolerancia} por ciento`}
                        >
                          ±{tolerancia}%
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-line/25 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-mist">
                          {platoActual}/3
                        </span>
                      </div>
                    </div>

                    <StepSegments step={step} />

                    <WeightField
                      inputRef={inputRefs[step - 1]}
                      label={fieldLabel}
                      hint={fieldHint}
                      value={fieldValue}
                      placeholder={fieldPlaceholder}
                      onChange={fieldOnChange}
                      onKeyDown={handleKeyDown}
                    />

                    <p id="peso-ayuda" className="mt-3 text-center text-[11px] text-steel">
                      {ayuda}
                    </p>

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse sm:items-center sm:justify-between">
                      <button onClick={advance} disabled={primaryDisabled} className="btn-primary px-6 sm:min-w-[230px]">
                        {step === 3 && platoActual === 3 ? (
                          <CheckCircle2 size={18} strokeWidth={2.5} />
                        ) : (
                          <ArrowRight size={18} strokeWidth={2.5} className="order-2" />
                        )}
                        <span className={step === 3 && platoActual === 3 ? '' : 'order-1'}>{primaryLabel}</span>
                      </button>
                      <button onClick={handleCancelar} disabled={cancelDisabled} className="btn-ghost justify-center sm:justify-start">
                        <RotateCcw size={16} strokeWidth={2.5} />
                        Cancelar medición
                      </button>
                    </div>
                  </section>

                  {/* Dial */}
                  <section className="glass-panel p-4 sm:p-6" aria-label="Desviación en vivo">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-display text-sm font-semibold text-frost">Desviación en vivo</h2>
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
                        statusNow === 'ok' ? 'text-ok' : statusNow === 'warn' ? 'text-warn' : statusNow === 'danger' ? 'text-danger' : 'text-steel'
                      }`}>
                        {step === 1 ? 'Molde' : `Etapa ${step - 1}`}
                      </span>
                    </div>
                    <Dial pct={livePct} tolerancia={tolerancia} />

                    <div className="mt-4 grid grid-cols-3 divide-x divide-line/15 border-t border-line/10 pt-3">
                      {liveMetrics.map((item) => (
                        <div key={item.label} className="px-1 text-center">
                          <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-steel">{item.label}</p>
                          <p className={`mt-1 font-display text-sm font-semibold tabular-nums ${
                            item.pct === null ? 'text-steel' : getStatusColor(item.pct, tolerancia)
                          }`}>
                            {item.value === null ? '—' : item.value}
                            <span className="ml-0.5 text-[10px] font-medium text-steel">g</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Tira de objetivos */}
                <section className="glass-panel grid grid-cols-3 divide-x divide-line/15" aria-label="Objetivos de la receta">
                  <Metric label="Objetivo" value={currentProduct?.ideal} unit="g" />
                  <Metric label="Etapa 1" value={currentProduct?.etapa1} unit="g" tone="text-cyan" />
                  <Metric label="Etapa 2" value={currentProduct?.etapa2} unit="g" tone="text-cyan" />
                </section>
              </div>
            )}

            {/* ───────────── HISTORIAL ───────────── */}
            {activeTab === 'historial' && (
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h1 className="font-display text-xl font-semibold text-frost">Historial</h1>
                    <p className="mt-0.5 text-xs text-steel">Pesajes guardados en este dispositivo</p>
                  </div>
                  <span className="rounded-full border border-line/20 bg-white/[0.03] px-3 py-1 text-[11px] font-medium tabular-nums text-mist">
                    {historial.length} {historial.length === 1 ? 'registro' : 'registros'}
                  </span>
                </div>

                <div className="glass-panel grid grid-cols-3 divide-x divide-line/15">
                  <Metric label="Registros" value={historial.length} />
                  <Metric
                    label="En tolerancia"
                    value={historial.length ? `${stats.pctDentro}%` : '—'}
                    tone={historial.length ? (stats.pctDentro >= 80 ? 'text-ok' : stats.pctDentro >= 50 ? 'text-warn' : 'text-danger') : 'text-frost'}
                  />
                  <Metric
                    label="Desv. media abs."
                    value={historial.length ? `${stats.media.toFixed(1)}%` : '—'}
                    tone={historial.length ? getStatusColor(stats.media, tolerancia) : 'text-frost'}
                  />
                </div>

                {historial.length === 0 ? (
                  <div className="glass-panel flex flex-col items-center px-6 py-16 text-center">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl border border-line/20 bg-void/50 text-cyan">
                      <FileText size={26} strokeWidth={1.5} />
                    </div>
                    <h2 className="mt-5 font-display text-lg font-semibold text-frost">Todavía no hay pesajes</h2>
                    <p className="mt-1.5 max-w-xs text-sm text-steel">
                      Cada medición finalizada se guarda aquí con sus desviaciones y su estado.
                    </p>
                    <button onClick={() => setActiveTab('medir')} className="btn-secondary mt-6">
                      Ir a medir
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {historial.map((reg) => {
                      const expanded = expandedRegistro === reg.id;
                      const resumen = getRegistroResumen(reg);
                      return (
                        <article key={reg.id} className="glass-panel overflow-hidden">
                          <div className="flex items-center gap-3 p-4 sm:px-5">
                            <div className="min-w-0 flex-1">
                              <p title={reg.producto} className="font-display text-[15px] font-semibold leading-snug text-frost sm:truncate">{reg.producto}</p>
                              <p className="mt-0.5 text-[11px] tabular-nums text-steel">
                                {new Date(reg.fecha).toLocaleString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="font-display text-[15px] font-semibold leading-none tabular-nums text-frost">
                                {resumen.total === null ? '—' : resumen.total}
                                <span className="ml-0.5 text-[10px] font-medium text-steel">g</span>
                              </p>
                              <div className="mt-1 flex justify-end">
                                <StatusPill pct={reg.dTotal} tol={tolerancia}>
                                  {signed(reg.dTotal)}%
                                </StatusPill>
                              </div>
                            </div>

                            <button
                              onClick={() => setExpandedRegistro(expanded ? null : reg.id)}
                              className="btn-icon"
                              aria-label={expanded ? 'Contraer detalle' : 'Expandir detalle'}
                              aria-expanded={expanded}
                            >
                              {expanded ? <ChevronUp size={18} strokeWidth={2.5} /> : <ChevronDown size={18} strokeWidth={2.5} />}
                            </button>
                            <button
                              onClick={() => handleBorrarRegistro(reg.id)}
                              className="btn-icon hover:text-danger"
                              aria-label="Eliminar registro"
                            >
                              <Trash2 size={17} strokeWidth={2.5} />
                            </button>
                          </div>

                          {expanded && (
                            <div className="border-t border-line/10 px-4 pb-4 pt-4 sm:px-5">
                              <div className="grid grid-cols-3 divide-x divide-line/15 border-y border-line/10">
                                {[
                                  { label: 'Etapa 1', grams: resumen.pesoE1, pct: reg.d1 },
                                  { label: 'Etapa 2', grams: resumen.pesoE2, pct: reg.d2 },
                                  { label: 'Total', grams: resumen.total, pct: reg.dTotal },
                                ].map((item) => (
                                  <div key={item.label} className="px-2 py-3 text-center">
                                    <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-steel">{item.label}</p>
                                    <p className="mt-1 font-display text-lg font-semibold tabular-nums text-frost">
                                      {item.grams === null || item.grams === undefined ? '—' : item.grams}
                                      <span className="ml-0.5 text-[10px] font-medium text-steel">g</span>
                                    </p>
                                    <p className={`mt-0.5 text-[10px] font-semibold tabular-nums ${
                                      item.pct === null || item.pct === undefined ? 'text-steel' : getStatusColor(item.pct, tolerancia)
                                    }`}>
                                      {signed(item.pct)}%
                                    </p>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4">
                                <table className="w-full text-[12px] sm:text-sm">
                                  <thead>
                                    <tr className="border-b border-line/15 text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-steel">
                                      <th className="pb-2 pr-2 font-medium sm:pr-3">Plato</th>
                                      <th className="pb-2 pr-2 text-right font-medium sm:pr-3">
                                        <span className="sm:hidden">E1 (g)</span>
                                        <span className="hidden sm:inline">Etapa 1 (g)</span>
                                      </th>
                                      <th className="pb-2 pr-2 text-right font-medium sm:pr-3">
                                        <span className="sm:hidden">E2 (g)</span>
                                        <span className="hidden sm:inline">Etapa 2 (g)</span>
                                      </th>
                                      <th className="pb-2 pr-2 text-right font-medium sm:pr-3">Total (g)</th>
                                      <th className="pb-2 pr-2 text-right font-medium sm:pr-3">Desv. E1</th>
                                      <th className="pb-2 text-right font-medium">Desv. E2</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {reg.detalles.map((d, i) => {
                                      const totalPlato =
                                        d.total !== undefined && d.total !== null
                                          ? d.total
                                          : Number.isFinite(Number(d.etapa1)) && Number.isFinite(Number(d.etapa2))
                                            ? Math.round((Number(d.etapa1) + Number(d.etapa2)) * 10) / 10
                                            : null;
                                      return (
                                      <tr key={i} className="border-b border-line/10 last:border-0">
                                        <td className="py-2 pr-2 font-medium text-mist sm:pr-3">
                                          {d.plato}
                                          {d.molde !== null && d.molde !== undefined && (
                                            <span className="block text-[9px] font-normal text-steel">molde {d.molde} g</span>
                                          )}
                                        </td>
                                        <td className="py-2 pr-2 text-right tabular-nums text-mist sm:pr-3">{d.etapa1 ?? '—'}</td>
                                        <td className="py-2 pr-2 text-right tabular-nums text-mist sm:pr-3">{d.etapa2 ?? '—'}</td>
                                        <td className={`py-2 pr-2 text-right font-semibold tabular-nums sm:pr-3 ${
                                          totalPlato === null ? 'text-steel' : getStatusColor(d.dTotal, tolerancia)
                                        }`}>
                                          {totalPlato === null ? '—' : totalPlato}
                                          <span className="mt-0.5 block text-[9px] font-medium sm:hidden">
                                            {d.dTotal === null ? '' : `${signed(d.dTotal)}%`}
                                          </span>
                                        </td>
                                        <td className="py-2 pr-2 text-right tabular-nums sm:pr-3">
                                          <span className={d.d1 === null ? 'text-steel' : getStatusColor(d.d1, tolerancia)}>
                                            {d.d1 === null ? '—' : `${signed(d.d1)}%`}
                                          </span>
                                        </td>
                                        <td className="py-2 text-right tabular-nums">
                                          <span className={d.d2 === null ? 'text-steel' : getStatusColor(d.d2, tolerancia)}>
                                            {d.d2 === null ? '—' : `${signed(d.d2)}%`}
                                          </span>
                                        </td>
                                      </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ───────────── ESTADÍSTICAS ───────────── */}
            {activeTab === 'estadisticas' && (
              <div className="space-y-4">
                <div>
                  <h1 className="font-display text-xl font-semibold text-frost">Estadísticas</h1>
                  <p className="mt-0.5 text-xs text-steel">Desempeño de dosificación de los pesajes guardados</p>
                </div>

                {stats.n === 0 ? (
                  <div className="glass-panel flex flex-col items-center px-6 py-16 text-center">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl border border-line/20 bg-void/50 text-cyan">
                      <BarChart2 size={26} strokeWidth={1.5} />
                    </div>
                    <h2 className="mt-5 font-display text-lg font-semibold text-frost">Sin datos todavía</h2>
                    <p className="mt-1.5 max-w-xs text-sm text-steel">
                      Cuando registres pesajes verás aquí la desviación media absoluta por producto y cuántos quedaron dentro de tolerancia.
                    </p>
                    <button onClick={() => setActiveTab('medir')} className="btn-secondary mt-6">
                      Empezar a medir
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="glass-panel grid grid-cols-2 divide-line/15 sm:grid-cols-4 sm:divide-x">
                      <Metric label="Pesajes" value={stats.n} />
                      <Metric label="En tolerancia" value={`${stats.pctDentro}%`} tone="text-ok" />
                      <Metric label="Desv. media abs." value={`${stats.media.toFixed(1)}%`} tone={getStatusColor(stats.media, tolerancia)} />
                      <Metric label="Fuera de rango" value={stats.fuera} tone={stats.fuera > 0 ? 'text-danger' : 'text-frost'} />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <section className="glass-panel p-4 sm:p-5" aria-label="Desviación media absoluta por producto">
                        <div className="flex items-center justify-between">
                          <h2 className="font-display text-sm font-semibold text-frost">Desviación media abs. por producto</h2>
                          <TrendingUp size={16} className="text-cyan" strokeWidth={2} />
                        </div>
                        <ul className="mt-4 space-y-3.5">
                          {stats.ranking.map((p) => {
                            const tone = STATUS_COLOR[statusOf(p.media, tolerancia)];
                            const width = Math.min(100, (p.media / Math.max(tolerancia * 2, 1)) * 100);
                            return (
                              <li key={p.nombre}>
                                <div className="flex items-baseline justify-between gap-3">
                                  <span className="truncate text-[13px] font-medium text-mist">{p.nombre}</span>
                                  <span className="shrink-0 font-display text-[13px] font-semibold tabular-nums" style={{ color: tone }}>
                                    {p.media.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-void/70">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${width}%`, background: tone, boxShadow: `0 0 12px ${tone}` }}
                                  />
                                </div>
                                <p className="mt-1 text-[10px] text-steel">{p.n} {p.n === 1 ? 'pesaje' : 'pesajes'}</p>
                              </li>
                            );
                          })}
                        </ul>
                      </section>

                      <section className="glass-panel p-4 sm:p-5" aria-label="Distribución de resultados">
                        <h2 className="font-display text-sm font-semibold text-frost">Distribución de resultados</h2>

                        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-void/70">
                          {[
                            { key: 'ok', value: stats.dentro, color: STATUS_COLOR.ok },
                            { key: 'warn', value: stats.warn, color: STATUS_COLOR.warn },
                            { key: 'danger', value: stats.fuera, color: STATUS_COLOR.danger },
                          ].map((seg) => (
                            <div
                              key={seg.key}
                              style={{ width: `${(seg.value / stats.n) * 100}%`, background: seg.color }}
                              className="h-full"
                            />
                          ))}
                        </div>

                        <ul className="mt-4 space-y-2.5">
                          {[
                            { label: 'Dentro de tolerancia', value: stats.dentro, color: STATUS_COLOR.ok },
                            { label: 'Cerca del límite', value: stats.warn, color: STATUS_COLOR.warn },
                            { label: 'Fuera de tolerancia', value: stats.fuera, color: STATUS_COLOR.danger },
                          ].map((row) => (
                            <li key={row.label} className="flex items-center gap-2.5">
                              <span className="h-2 w-2 rounded-full" style={{ background: row.color }} aria-hidden="true" />
                              <span className="flex-1 text-[13px] text-mist">{row.label}</span>
                              <span className="font-display text-[13px] font-semibold tabular-nums text-frost">{row.value}</span>
                              <span className="w-10 text-right text-[11px] tabular-nums text-steel">
                                {Math.round((row.value / stats.n) * 100)}%
                              </span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-5 border-t border-line/10 pt-3">
                          <p className="text-[11px] text-steel">
                            Mejor producto: <span className="font-medium text-mist">{stats.ranking[0]?.nombre}</span>{' '}
                            ({stats.ranking[0]?.media.toFixed(1)}%)
                          </p>
                        </div>
                      </section>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ───────────── AJUSTES ───────────── */}
            {activeTab === 'ajustes' && (
              <div className="space-y-4">
                <div>
                  <h1 className="font-display text-xl font-semibold text-frost">Ajustes</h1>
                  <p className="mt-0.5 text-xs text-steel">Tolerancia, vista de receta y catálogo de productos</p>
                </div>

                {/* Tolerancia */}
                <section className="glass-panel p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-sm font-semibold text-frost">Tolerancia de desviación</h2>
                      <p className="mt-1 max-w-sm text-[12px] text-steel">
                        Umbral para estado correcto. El aviso llega al doble de este valor.
                      </p>
                    </div>
                    <span className="font-display text-2xl font-semibold tabular-nums text-cyan">±{tolerancia}%</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={tolerancia}
                    onChange={(e) => setTolerancia(Number(e.target.value))}
                    className="range-cyan mt-5"
                    aria-label="Tolerancia porcentual"
                    style={{
                      background: `linear-gradient(90deg, rgba(46,230,168,0.55) 0%, rgba(46,230,168,0.55) ${sliderOk}%, rgba(255,194,75,0.5) ${sliderOk}%, rgba(255,194,75,0.5) ${sliderWarn}%, rgba(127,168,255,0.16) ${sliderWarn}%, rgba(127,168,255,0.16) 100%)`,
                      backgroundSize: '100% 8px',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                  <div className="mt-1 flex justify-between text-[10px] tabular-nums text-steel">
                    <span>0%</span>
                    <span>20%</span>
                  </div>
                  <p className="mt-2 text-[11px] text-steel">
                    Zona OK hasta ±{tolerancia}% · aviso hasta ±{tolerancia * 2}%
                  </p>
                </section>

                {/* Vista rápida */}
                <section className="glass-panel flex items-center justify-between gap-4 p-4 sm:p-5">
                  <div>
                    <h2 className="font-display text-sm font-semibold text-frost">Vista rápida de receta</h2>
                    <p className="mt-1 text-[12px] text-steel">Muestra el peso objetivo junto al campo de medición.</p>
                  </div>
                  <button
                    onClick={() => setShowRecipeDash((v) => !v)}
                    className="relative inline-flex h-11 w-[60px] shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-deep"
                    role="switch"
                    aria-checked={showRecipeDash}
                    aria-label="Vista rápida de receta"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-7 w-12 items-center rounded-full border px-1 transition-colors duration-200 ${
                        showRecipeDash ? 'border-cyan/60 bg-cyan/25' : 'border-line/25 bg-void/70'
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          showRecipeDash ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </span>
                  </button>
                </section>

                {/* Catálogo */}
                <section className="glass-panel p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-sm font-semibold text-frost">Catálogo de productos</h2>
                      <p className="mt-1 text-[12px] text-steel">{catalogo.length} recetas disponibles</p>
                    </div>
                    {editingIdx === null && (
                      <button
                        onClick={() => {
                          const nuevo = { nombre: 'Nuevo producto', ideal: 100, etapa1: 60, etapa2: 35 };
                          setCatalogo([...catalogo, nuevo]);
                          setEditingIdx(catalogo.length);
                        }}
                        className="btn-secondary px-3 text-[13px]"
                      >
                        <PlusCircle size={15} strokeWidth={2.5} />
                        Añadir
                      </button>
                    )}
                  </div>

                  <div className="mt-4 max-h-[420px] space-y-2 overflow-auto pr-1">
                    {catalogo.map((p, i) => (
                      <div
                        key={i}
                        className={`rounded-xl border p-3 transition-colors duration-150 ${
                          editingIdx === i ? 'border-cyan/40 bg-cyan/[0.06]' : 'border-line/15 bg-void/30 hover:border-line/30'
                        }`}
                      >
                        {editingIdx === i ? (
                          <div className="space-y-2.5">
                            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                              <input
                                type="text"
                                value={p.nombre}
                                onChange={(e) => patchRecipe(i, { ...p, nombre: e.target.value })}
                                className="field font-display font-semibold"
                                placeholder="Nombre del producto"
                                autoFocus
                              />
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { key: 'ideal', label: 'Ideal' },
                                  { key: 'etapa1', label: 'Etapa 1' },
                                  { key: 'etapa2', label: 'Etapa 2' },
                                ].map((field) => (
                                  <label key={field.key} className="block">
                                    <span className="mb-1 block text-[9px] uppercase tracking-[0.1em] text-steel">{field.label}</span>
                                    <input
                                      type="number"
                                      value={p[field.key]}
                                      onChange={(e) => patchRecipe(i, { ...p, [field.key]: Number(e.target.value) || 0 })}
                                      className="field text-center tabular-nums"
                                      min="1"
                                    />
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-line/10 pt-2.5">
                              <button onClick={cancelEditing} className="btn-ghost text-[13px]">Cancelar</button>
                              <button onClick={() => setEditingIdx(null)} className="btn-primary min-h-[40px] px-4 py-1.5 text-[13px]">
                                <Save size={14} strokeWidth={2.5} />
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <button
                              onClick={() => startEditing(i)}
                              className="min-w-0 flex-1 text-left"
                              aria-label={`Editar ${p.nombre}`}
                            >
                              <p className="truncate font-display text-[14px] font-medium text-frost">{p.nombre}</p>
                              <p className="mt-0.5 text-[11px] tabular-nums text-steel">
                                Ideal {p.ideal} g · E1 {p.etapa1} g · E2 {p.etapa2} g
                              </p>
                            </button>
                            <div className="flex shrink-0 items-center gap-1">
                              <button onClick={() => startEditing(i)} className="btn-icon" aria-label={`Editar ${p.nombre}`}>
                                <Pencil size={15} strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Eliminar "${p.nombre}"?`)) {
                                    const nuevo = catalogo.filter((_, idx) => idx !== i);
                                    setCatalogo(nuevo);
                                    if (editingIdx === i) setEditingIdx(null);
                                    if (productoSel >= nuevo.length) setProductoSel(Math.max(0, nuevo.length - 1));
                                  }
                                }}
                                className="btn-icon hover:text-danger"
                                aria-label={`Eliminar ${p.nombre}`}
                              >
                                <Trash2 size={15} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {catalogo.length === 0 && (
                      <div className="py-10 text-center text-steel">
                        <Package size={28} strokeWidth={1.5} className="mx-auto mb-2" />
                        <p className="text-sm">No hay productos. Añade uno para comenzar.</p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="glass-panel p-4 text-center">
                  <p className="text-[11px] text-steel">LactControl v2.0.1 · Estación de pesaje</p>
                  <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-steel">
                    <AlertCircle size={12} strokeWidth={2} />
                    Los datos se guardan localmente en este navegador
                  </p>
                </section>
              </div>
            )}
          </div>
        </main>

        {/* Dock de navegación */}
        <nav
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2"
          aria-label="Navegación principal"
        >
          <div className="dock mx-auto flex max-w-md items-center gap-1 rounded-2xl p-1.5 sm:rounded-full">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition-colors duration-150 ${
                    active ? 'bg-cyan/10 text-cyan' : 'text-steel hover:bg-white/5 hover:text-mist'
                  }`}
                  aria-current={active ? 'page' : undefined}
                  aria-label={tab.label}
                >
                  <Icon size={20} strokeWidth={2.2} />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.1em]">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
