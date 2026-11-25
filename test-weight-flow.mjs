import assert from 'node:assert/strict';
import { computePlate, desviacion, summarizePlates } from './src/weightMath.js';

const receta = { nombre: 'Pan Chico vainilla', ideal: 660, etapa1: 415, etapa2: 245 };

// 1. El paso 1 es el molde solo: no genera etapa ni total.
assert.deepEqual(computePlate({ molde: '200', acumE1: '', acumE2: '' }), {
  molde: 200,
  etapa1: null,
  etapa2: null,
  total: null,
});

// 2. Paso 2: molde + leche de etapa 1 -> neto de etapa 1.
assert.deepEqual(computePlate({ molde: '200', acumE1: '615', acumE2: '' }), {
  molde: 200,
  etapa1: 415,
  etapa2: null,
  total: null,
});

// 3. Paso 3: total acumulado -> neto de etapa 2 y total en gramos.
assert.deepEqual(computePlate({ molde: '200', acumE1: '615', acumE2: '860' }), {
  molde: 200,
  etapa1: 415,
  etapa2: 245,
  total: 660,
});

// 4. Sin molde no se puede calcular nada en gramos.
assert.deepEqual(computePlate({ molde: '', acumE1: '615', acumE2: '860' }), {
  molde: null,
  etapa1: null,
  etapa2: null,
  total: null,
});

// 5. Desviación contra el objetivo de la etapa.
assert.equal(desviacion(432, 415), 4.1);
assert.equal(desviacion(415, 415), 0);
assert.equal(desviacion(100, 0), null);

// 6. Resumen de los 3 platos: medias netas, total en gramos y desviaciones.
const resumen = summarizePlates(
  [
    { molde: '200', acumE1: '615', acumE2: '860' },
    { molde: '200', acumE1: '632', acumE2: '890' },
    { molde: '200', acumE1: '598', acumE2: '830' },
  ],
  receta,
);

assert.equal(resumen.pesoE1, 415);
assert.equal(resumen.pesoE2, 245);
assert.equal(resumen.total, 660);
assert.equal(resumen.d1, 0);
assert.equal(resumen.d2, 0);
assert.equal(resumen.dTotal, 0);
assert.equal(resumen.detalles.length, 3);
assert.deepEqual(resumen.detalles[1], {
  plato: 2,
  molde: 200,
  etapa1: 432,
  etapa2: 258,
  total: 690,
  d1: 4.1,
  d2: 5.3,
  dTotal: 4.5,
});

console.log('weight-flow: 6/6 OK');
