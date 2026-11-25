// Cálculo del pesaje por etapas.
//
// El operario nunca pesa la leche sola: pesa el molde vacío (paso 1), luego el
// molde con la leche de la etapa 1 (paso 2) y por último el molde con las dos
// etapas (paso 3). Los gramos reales de cada etapa son diferencias entre esos
// acumulados.

const round1 = (value) => Math.round(value * 10) / 10;

const num = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/**
 * Convierte los acumulados de la balanza en gramos reales por etapa.
 * @returns {{molde: number|null, etapa1: number|null, etapa2: number|null, total: number|null}}
 */
export function computePlate({ molde, acumE1, acumE2 }) {
  const m = num(molde);
  const a1 = num(acumE1);
  const a2 = num(acumE2);

  if (m === null) return { molde: null, etapa1: null, etapa2: null, total: null };

  const etapa1 = a1 === null ? null : round1(a1 - m);
  const etapa2 = a1 === null || a2 === null ? null : round1(a2 - a1);
  const total = etapa1 === null || etapa2 === null ? null : round1(etapa1 + etapa2);

  return { molde: m, etapa1, etapa2, total };
}

/** Desviación porcentual de un peso real contra el objetivo de la receta. */
export function desviacion(actual, objetivo) {
  const a = num(actual);
  const o = num(objetivo);
  if (a === null || o === null || o === 0) return null;
  return round1(((a - o) / o) * 100);
}

const promedio = (values) => {
  const validos = values.filter((v) => v !== null && v !== undefined && Number.isFinite(Number(v)));
  if (!validos.length) return 0;
  return round1(validos.reduce((acc, v) => acc + Number(v), 0) / validos.length);
};

/**
 * Resume los 3 platos de una medición: medias netas por etapa, total en gramos
 * y desviaciones contra los objetivos de la receta.
 */
export function summarizePlates(plates, recipe = {}) {
  const objetivo1 = num(recipe.etapa1);
  const objetivo2 = num(recipe.etapa2);
  const objetivoTotal = num(recipe.ideal);

  const detalles = plates.map((plate, index) => {
    const { molde, etapa1, etapa2, total } = computePlate(plate);
    return {
      plato: index + 1,
      molde,
      etapa1,
      etapa2,
      total,
      d1: desviacion(etapa1, objetivo1),
      d2: desviacion(etapa2, objetivo2),
      dTotal: desviacion(total, objetivoTotal),
    };
  });

  const pesoE1 = promedio(detalles.map((d) => d.etapa1));
  const pesoE2 = promedio(detalles.map((d) => d.etapa2));
  const total = round1(pesoE1 + pesoE2);

  return {
    pesoE1,
    pesoE2,
    total,
    d1: desviacion(pesoE1, objetivo1),
    d2: desviacion(pesoE2, objetivo2),
    dTotal: desviacion(total, objetivoTotal),
    detalles,
  };
}
