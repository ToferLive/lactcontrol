import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, FileText, BarChart2, Sliders, Save, Edit2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('medicion');
  const [step, setStep] = useState(1);
  const [platoActual, setPlatoActual] = useState(1);
  const [datosTemporales, setDatosTemporales] = useState([]);
  const [moldeVacio, setMoldeVacio] = useState('');
  const [pesoAcumuladoE1, setPesoAcumuladoE1] = useState('');
  const [pesoAcumuladoE2, setPesoAcumuladoE2] = useState('');
  const [historial, setHistorial] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [showRecipeDash, setShowRecipeDash] = useState(false);
  const [tolerancia, setTolerancia] = useState(5);
  
  const [catalogo, setCatalogo] = useState([
    { id: 1, nombre: 'Pan Chico vainilla', ideal: 660, etapa1: 415, etapa2: 245 },
    { id: 2, nombre: 'Pan Mediano vainilla', ideal: 815, etapa1: 440, etapa2: 375 },
    { id: 3, nombre: 'Pan Grande vainilla', ideal: 575, etapa1: 315, etapa2: 255 },
    { id: 4, nombre: 'Rosca Chica vainilla', ideal: 570, etapa1: 315, etapa2: 255 },
    { id: 5, nombre: 'Rosca Grande vainilla', ideal: 950, etapa1: 525, etapa2: 425 },
    { id: 6, nombre: 'Pan Mediano Chocolate', ideal: 900, etapa1: 540, etapa2: 360 },
    { id: 7, nombre: 'Pan 4 Leches', ideal: 815, etapa1: 440, etapa2: 375 },
    { id: 8, nombre: 'Rosca Nutella', ideal: 570, etapa1: 315, etapa2: 255 },
    { id: 9, nombre: 'Bambino', ideal: 352, etapa1: 215, etapa2: 137 }
  ]);
  
  const [producto, setProducto] = useState(catalogo[0]);
  const [editForm, setEditForm] = useState({});

  // Refs para los inputs
  const moldeRef = useRef(null);
  const e1Ref = useRef(null);
  const e2Ref = useRef(null);

  const getDesviacion = (valor, objetivo) => {
    if (!valor || !objetivo || objetivo === 0) return { diff: 0, pct: 0 };
    const diff = Number(valor) - objetivo;
    const pct = (diff / objetivo) * 100;
    return { diff, pct };
  };

  const getStatusColor = (pct) => Math.abs(pct) <= tolerancia ? 'text-emerald-400' : 'text-rose-500';

  const getLiveDesviacion = () => {
    const molde = Number(moldeVacio);
    
    if (step === 2 && moldeVacio && pesoAcumuladoE1) {
      const realE1 = Number(pesoAcumuladoE1) - molde;
      const dev = getDesviacion(realE1, producto.etapa1);
      return {
        label: 'E1',
        real: realE1.toFixed(1),
        objetivo: producto.etapa1,
        diff: dev.diff.toFixed(1),
        pct: dev.pct.toFixed(1),
        isOver: dev.diff > 0
      };
    }
    
    if (step === 3 && moldeVacio && pesoAcumuladoE1 && pesoAcumuladoE2) {
      const realE2 = Number(pesoAcumuladoE2) - Number(pesoAcumuladoE1);
      const dev = getDesviacion(realE2, producto.etapa2);
      return {
        label: 'E2',
        real: realE2.toFixed(1),
        objetivo: producto.etapa2,
        diff: dev.diff.toFixed(1),
        pct: dev.pct.toFixed(1),
        isOver: dev.diff > 0
      };
    }
    
    return null;
  };

  const liveInfo = getLiveDesviacion();

  // Manejar tecla Enter en los inputs
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (step < 3) {
        setStep(step + 1);
      } else if (platoActual < 3) {
        handleRegistrarPlato();
      } else {
        handleFinalizar();
      }
    }
  };

  // Focus automático en el input activo
  useEffect(() => {
    if (step === 1 && moldeRef.current) moldeRef.current.focus();
    if (step === 2 && e1Ref.current) e1Ref.current.focus();
    if (step === 3 && e2Ref.current) e2Ref.current.focus();
  }, [step, platoActual]);

  const handleRegistrarPlato = () => {
    const molde = Number(moldeVacio);
    const acumE1 = Number(pesoAcumuladoE1);
    const acumE2 = Number(pesoAcumuladoE2);
    
    const realE1 = acumE1 - molde;
    const realE2 = acumE2 - acumE1;
    
    const nuevoPlato = {
      molde: molde,
      pesoE1: realE1,
      pesoE2: realE2,
      pctE1: getDesviacion(realE1, producto.etapa1).pct,
      pctE2: getDesviacion(realE2, producto.etapa2).pct,
      total: realE1 + realE2
    };
    
    setDatosTemporales([...datosTemporales, nuevoPlato]);
    setStep(1);
    setMoldeVacio('');
    setPesoAcumuladoE1('');
    setPesoAcumuladoE2('');
    setPlatoActual(platoActual + 1);
  };

  const handleFinalizar = () => {
    const molde = Number(moldeVacio);
    const acumE1 = Number(pesoAcumuladoE1);
    const acumE2 = Number(pesoAcumuladoE2);
    
    const realE1 = acumE1 - molde;
    const realE2 = acumE2 - acumE1;
    
    const todosLosPlatos = [...datosTemporales, {
      molde: molde,
      pesoE1: realE1,
      pesoE2: realE2,
      pctE1: getDesviacion(realE1, producto.etapa1).pct,
      pctE2: getDesviacion(realE2, producto.etapa2).pct,
      total: realE1 + realE2
    }];
    
    const avgE1 = todosLosPlatos.reduce((acc, p) => acc + p.pesoE1, 0) / 3;
    const avgE2 = todosLosPlatos.reduce((acc, p) => acc + p.pesoE2, 0) / 3;
    const avgTotal = avgE1 + avgE2;
    
    const d1 = getDesviacion(avgE1, producto.etapa1);
    const d2 = getDesviacion(avgE2, producto.etapa2);
    const dTotal = getDesviacion(avgTotal, producto.ideal);
    
    const nuevoRegistro = {
      id: Date.now(),
      producto: producto.nombre,
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pesoE1: avgE1.toFixed(1),
      pesoE2: avgE2.toFixed(1),
      total: avgTotal.toFixed(1),
      d1: d1.pct,
      d2: d2.pct,
      dTotal: dTotal.pct,
      targetE1: producto.etapa1,
      targetE2: producto.etapa2,
      targetTotal: producto.ideal,
      detalles: todosLosPlatos 
    };
    
    setHistorial([nuevoRegistro, ...historial]);
    handleCancelar();
    setActiveTab('historial');
  };

  const handleCancelar = () => {
    setStep(1);
    setPlatoActual(1);
    setDatosTemporales([]); 
    setMoldeVacio('');
    setPesoAcumuladoE1('');
    setPesoAcumuladoE2('');
  };

  const updateRecipe = (id) => {
    setCatalogo(catalogo.map(c => c.id === id ? { ...c, ...editForm } : c));
    if (producto.id === id) setProducto({ ...producto, ...editForm });
    setEditingRecipeId(null);
    setEditForm({});
  };

  const startEditing = (p) => {
    setEditingRecipeId(p.id);
    setEditForm({ ...p });
  };

  const cancelEditing = () => {
    setEditingRecipeId(null);
    setEditForm({});
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col font-sans pb-24">
      <header className="px-5 pt-6 pb-4 bg-[#151921] border-b border-[#252b36]">
        <h1 className="text-lg font-bold">LactControl</h1>
        {activeTab === 'medicion' && (
           <select 
             className="mt-2 bg-[#1c222d] text-xs p-2 rounded-lg border border-[#2a3240] w-full text-slate-100" 
             value={producto.nombre} 
             onChange={(e) => setProducto(catalogo.find(p => p.nombre === e.target.value))}
           >
            {catalogo.map(p => <option key={p.id} className="bg-[#1c222d] text-slate-100">{p.nombre}</option>)}
          </select>
        )}
      </header>

      <main className="flex-1 max-w-sm w-full mx-auto p-4">
        {activeTab === 'medicion' && (
          <div className="bg-[#151921] border border-[#252b36] rounded-3xl p-6">
            <div className="mb-6">
                <div className="flex justify-between items-end">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{producto.nombre}</h2>
                    <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-1 rounded-md font-bold">Plato {platoActual}/3</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-[10px]">
                    <div className="bg-[#0f1117] p-2 rounded-lg border border-[#2a3240]">
                      <p className="text-slate-500">Ideal</p>
                      <p className="font-bold">{producto.ideal}g</p>
                    </div>
                    <div className="bg-[#0f1117] p-2 rounded-lg border border-[#2a3240]">
                      <p className="text-slate-500">E1</p>
                      <p className="font-bold">{producto.etapa1}g</p>
                    </div>
                    <div className="bg-[#0f1117] p-2 rounded-lg border border-[#2a3240]">
                      <p className="text-slate-500">E2</p>
                      <p className="font-bold">{producto.etapa2}g</p>
                    </div>
                </div>
            </div>
            
            <h2 className="text-xs font-bold text-slate-400 mb-6 uppercase">Paso {step} de 3</h2>
            
            {step === 1 && (
              <input 
                ref={moldeRef}
                type="number" 
                className="w-full bg-[#0f1117] p-8 text-center text-4xl font-black rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 placeholder-slate-600" 
                placeholder="Molde(g)" 
                value={moldeVacio} 
                onChange={e => setMoldeVacio(e.target.value)} 
                onKeyDown={handleKeyDown}
              />
            )}
            {step === 2 && (
              <input 
                ref={e1Ref}
                type="number" 
                className="w-full bg-[#0f1117] p-8 text-center text-4xl font-black rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 placeholder-slate-600" 
                placeholder="Mold+E1(g)" 
                value={pesoAcumuladoE1} 
                onChange={e => setPesoAcumuladoE1(e.target.value)} 
                onKeyDown={handleKeyDown}
              />
            )}
            {step === 3 && (
              <input 
                ref={e2Ref}
                type="number" 
                className="w-full bg-[#0f1117] p-8 text-center text-4xl font-black rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 placeholder-slate-600" 
                placeholder="Total(g)" 
                value={pesoAcumuladoE2} 
                onChange={e => setPesoAcumuladoE2(e.target.value)} 
                onKeyDown={handleKeyDown}
              />
            )}
            
            {liveInfo && (
              <div className="mt-4 p-3 bg-[#0f1117] rounded-xl border border-[#2a3240]">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{liveInfo.label} en tiempo real</span>
                  <span className="text-xs font-bold text-slate-300">{liveInfo.real}g / {liveInfo.objetivo}g</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-slate-500">Desviación</span>
                  <span className={`text-sm font-bold  ${getStatusColor(Number(liveInfo.pct))} `}>
                    {liveInfo.diff > 0 ? '+' : ''}{liveInfo.diff}g ({liveInfo.pct > 0 ? '+' : ''}{liveInfo.pct}%)
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-[#1c222d] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full  ${Math.abs(Number(liveInfo.pct)) <= tolerancia ? 'bg-emerald-500' : 'bg-rose-500'} `}
                    style={{ width: `${Math.min(Math.abs(Number(liveInfo.pct)) * 5, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <button 
                    className="w-1/3 bg-[#252b36] py-4 rounded-2xl font-bold text-slate-100" 
                    onClick={() => setStep(step - 1)}
                  >
                    Volver
                  </button>
                )}
                <button 
                  className={`py-4 rounded-2xl font-bold text-white  ${step > 1 ? 'w-2/3' : 'w-full'}  bg-blue-600`} 
                  onClick={() => {
                    if (step < 3) setStep(step + 1);
                    else if (platoActual < 3) handleRegistrarPlato();
                    else handleFinalizar();
                  }}
                >
                  {step < 3 ? 'Siguiente' : (platoActual < 3 ? 'Registrar' : 'Finalizar')}
                </button>
            </div>
          </div>
        )}

        {activeTab === 'historial' && (
            <div className="space-y-3">
            <h2 className="text-lg font-bold mb-4">Historial</h2>
            {historial.length === 0 && (
              <p className="text-slate-500 text-center py-10">No hay registros aún</p>
            )}
            {historial.map(reg => (
                <div key={reg.id} className="bg-[#151921] border border-[#252b36] rounded-2xl overflow-hidden">
                <button 
                  className="w-full p-4 flex justify-between items-center text-left" 
                  onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
                >
                    <div>
                      <p className="font-bold text-slate-100">{reg.producto}</p>
                      <p className="text-[10px] text-slate-500">{reg.fecha}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-100">{reg.total}g</span>
                      <p className={`text-[10px]  ${getStatusColor(reg.dTotal)} `}>{reg.dTotal > 0 ? '+' : ''}{reg.dTotal.toFixed(1)}%</p>
                    </div>
                </button>
                {expandedId === reg.id && (
                    <div className="p-4 border-t border-[#252b36] text-[10px] space-y-3">
                        <div className="flex justify-between font-bold border-b border-[#2a3240] pb-2 text-slate-400 uppercase">
                            <span className="w-8">Plato</span>
                            <span className="flex-1 text-center">E1 (Obj: {reg.targetE1}g)</span>
                            <span className="flex-1 text-center">E2 (Obj: {reg.targetE2}g)</span>
                            <span className="flex-1 text-center">Total (Obj: {reg.targetTotal}g)</span>
                        </div>
                        {reg.detalles.map((d, i) => {
                          const totalDev = getDesviacion(d.total, reg.targetTotal);
                          return (
                           <div key={i} className="flex justify-between items-center bg-[#0f1117] p-2 rounded">
                               <span className="font-bold text-slate-100 w-8">#{i+1}</span>
                               <span className={`flex-1 text-center ${getStatusColor(d.pctE1)}`}>{d.pesoE1}g ({d.pctE1 > 0 ? '+' : ''}{d.pctE1.toFixed(1)}%)</span>
                               <span className={`flex-1 text-center ${getStatusColor(d.pctE2)}`}>{d.pesoE2}g ({d.pctE2 > 0 ? '+' : ''}{d.pctE2.toFixed(1)}%)</span>
                               <span className={`flex-1 text-center font-bold ${getStatusColor(totalDev.pct)}`}>
                                 {d.total}g 
                                 <span className="block text-[9px] opacity-80">
                                   ({totalDev.diff > 0 ? '+' : ''}{totalDev.diff.toFixed(1)}g / {totalDev.pct > 0 ? '+' : ''}{totalDev.pct.toFixed(1)}%)
                                 </span>
                               </span>
                           </div>
                          );
                        })}
                        <div className="flex justify-between items-center pt-2 border-t border-[#2a3240] font-bold text-xs">
                          <span className="w-8">Prom</span>
                          <span className={`flex-1 text-center ${getStatusColor(reg.d1)}`}>E1: {reg.pesoE1}g</span>
                          <span className={`flex-1 text-center ${getStatusColor(reg.d2)}`}>E2: {reg.pesoE2}g</span>
                          <span className={`flex-1 text-center ${getStatusColor(reg.dTotal)}`}>Total: {reg.total}g</span>
                        </div>
                    </div>
                )}
                </div>
            ))}
            </div>
        )}

        {activeTab === 'estadisticas' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BarChart2 size={48} className="text-slate-600 mb-4" />
            <h2 className="text-lg font-bold text-slate-400">Estadísticas</h2>
            <p className="text-sm text-slate-600 mt-2">En desarrollo...</p>
          </div>
        )}

        {activeTab === 'ajustes' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Ajustes</h2>
            <div className="bg-[#151921] p-6 rounded-3xl border border-[#252b36]">
              <label className="text-xs text-slate-400 font-bold uppercase">Tolerancia (%)</label>
              <input 
                type="range" 
                min="0" 
                max="20" 
                className="w-full mt-2 accent-blue-500" 
                value={tolerancia} 
                onChange={e => setTolerancia(Number(e.target.value))} 
              />
              <span className="text-sm font-bold text-blue-400">{tolerancia}%</span>
            </div>
            <button 
              onClick={() => setShowRecipeDash(!showRecipeDash)} 
              className="w-full bg-blue-600 py-4 rounded-2xl font-bold text-white"
            >
              {showRecipeDash ? 'Ocultar Dashboard' : 'Dashboard de Recetas'}
            </button>
            {showRecipeDash && (
              <div className="space-y-3">
                {catalogo.map(p => (
                  <div key={p.id} className="bg-[#151921] p-4 rounded-xl border border-[#252b36]">
                    {editingRecipeId === p.id ? (
                        <div className="space-y-2">
                           <input 
                             className="w-full bg-[#0f1117] p-2 rounded text-xs text-slate-100 outline-none border border-[#2a3240]" 
                             value={editForm.nombre ?? ''} 
                             onChange={e => setEditForm({...editForm, nombre: e.target.value})}
                           />
                           <div className="grid grid-cols-3 gap-2">
                             <input 
                               type="number" 
                               className="bg-[#0f1117] p-2 rounded text-xs text-slate-100 outline-none border border-[#2a3240]" 
                               placeholder="Ideal" 
                               value={editForm.ideal ?? ''} 
                               onChange={e => setEditForm({...editForm, ideal: Number(e.target.value) || 0})}
                             />
                             <input 
                               type="number" 
                               className="bg-[#0f1117] p-2 rounded text-xs text-slate-100 outline-none border border-[#2a3240]" 
                               placeholder="E1" 
                               value={editForm.etapa1 ?? ''} 
                               onChange={e => setEditForm({...editForm, etapa1: Number(e.target.value) || 0})}
                             />
                             <input 
                               type="number" 
                               className="bg-[#0f1117] p-2 rounded text-xs text-slate-100 outline-none border border-[#2a3240]" 
                               placeholder="E2" 
                               value={editForm.etapa2 ?? ''} 
                               onChange={e => setEditForm({...editForm, etapa2: Number(e.target.value) || 0})}
                             />
                           </div>
                           <div className="flex gap-2">
                             <button 
                               className="flex-1 bg-emerald-600 p-2 rounded text-xs font-bold text-white" 
                               onClick={() => updateRecipe(p.id)}
                             >
                               <Save className="inline mr-2" size={14}/>Guardar
                             </button>
                             <button 
                               className="flex-1 bg-[#252b36] p-2 rounded text-xs font-bold text-slate-100" 
                               onClick={cancelEditing}
                             >
                               Cancelar
                             </button>
                           </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-sm text-slate-100">{p.nombre}</p>
                              <p className="text-[10px] text-slate-500">I:{p.ideal} | E1:{p.etapa1} | E2:{p.etapa2}</p>
                            </div>
                            <button 
                              onClick={() => startEditing(p)} 
                              className="text-slate-400"
                            >
                              <Edit2 size={16}/>
                            </button>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 w-full bg-[#151921] border-t border-[#252b36] p-4 grid grid-cols-4 text-center">
        <button 
          onClick={() => setActiveTab('medicion')} 
          className={`flex flex-col items-center gap-1  ${activeTab === 'medicion' ? 'text-blue-500' : 'text-slate-600'} `}
        >
          <PlusCircle size={20}/>
          <span className="text-[10px]">Medir</span>
        </button>
        <button 
          onClick={() => setActiveTab('historial')} 
          className={`flex flex-col items-center gap-1  ${activeTab === 'historial' ? 'text-blue-500' : 'text-slate-600'} `}
        >
          <FileText size={20}/>
          <span className="text-[10px]">Historial</span>
        </button>
        <button 
          onClick={() => setActiveTab('estadisticas')} 
          className={`flex flex-col items-center gap-1  ${activeTab === 'estadisticas' ? 'text-blue-500' : 'text-slate-600'} `}
        >
          <BarChart2 size={20}/>
          <span className="text-[10px]">Stats</span>
        </button>
        <button 
          onClick={() => setActiveTab('ajustes')} 
          className={`flex flex-col items-center gap-1  ${activeTab === 'ajustes' ? 'text-blue-500' : 'text-slate-600'} `}
        >
          <Sliders size={20}/>
          <span className="text-[10px]">Ajustes</span>
        </button>
      </footer>
    </div>
  );
}
