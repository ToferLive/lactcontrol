# PRODUCT.md — LactControl

## Product truth

**Name:** LactControl
**Platform:** Web (React 18 + Vite + Tailwind CSS)
**Base path:** `/lactcontrol/` (deployed under subpath)

## Primary user & situation

- **Who:** Operarios de producción en plantas de panadería/lácteos (pesaje de moldes en línea de producción)
- **Situation:** De pie junto a básculas industriales, manos con guantes o húmedas, luz variable (fluorescente, luz natural, penumbra), ruido ambiental alto
- **Job:** Medir tres platos consecutivos —molde → acumulado etapa 1 → acumulado etapa 2—, comparar cada etapa contra su objetivo, ver la desviación en vivo, guardar la medición y consultar el historial y las estadísticas por producto

## Core mechanism

Flujo de 3 platos; cada plato recorre 3 pasos sobre una balanza que acumula peso:

1. **Molde** — captura el peso del molde vacío, solo y sin leche
2. **Etapa 1** — captura el molde con la leche de la etapa 1 → neto `realE1 = acumE1 − molde` → desviación vs `etapa1` de la receta
3. **Etapa 2** — captura el molde con las dos etapas → neto `realE2 = acumE2 − acumE1` y `total = realE1 + realE2` → desviación vs `etapa2` de la receta

La desviación en vivo se calcula **por etapa contra el objetivo de esa etapa**. Los resultados de cada plato muestran los gramos netos de etapa 1, etapa 2 y el total, con color verde/ámbar/rojo según la tolerancia. Al cerrar el plato 3, **Finalizar medición** guarda el plato en curso y crea un registro con timestamp, producto, medias netas (`pesoE1`, `pesoE2`, `total`) y desviaciones (`d1`, `d2`, `dTotal`; `dTotal` compara el total medio contra el `ideal` de la receta).

Estados de tolerancia, siempre sobre el valor absoluto de la desviación: **dentro** (`≤ tolerancia`), **cerca del límite** (`≤ 2 × tolerancia`) y **fuera** (`> 2 × tolerancia`).

## Durable constraints & assets

- **Catálogo de 9 recetas** predefinidas (nombre, ideal, etapa1, etapa2) — CRUD completo en Ajustes: añadir, editar en línea y eliminar
- **Tolerancia global** configurable de 0 % a 20 % (default **2 %**) — define los umbrales verde/ámbar/rojo
- **Persistencia en localStorage** con estas claves exactas:
  - `lactcontrol-historial` — registros de medición
  - `lactcontrol-catalogo` — recetas editadas
  - `lactcontrol-tolerancia` — tolerancia global
- **4 pestañas fijas:** Medir, Historial, Estadísticas, Ajustes
- **Navegación bottom-bar** fija tipo dock flotante — objetivos táctiles de 44 px mínimo (48 px en acciones primarias)
- **Accesibilidad obligatoria:** WCAG AA (contraste ≥ 4.5:1), focus visible, `prefers-reduced-motion`, etiquetas ARIA
- **Responsive real:** mobile-first, breakpoints 640/1024, usable desde 390 px sin desbordamiento horizontal
- **Iconos:** lucide-react (trazo 2–2.5, tamaño consistente)
- **Sin backend** — todo client-side, offline-capable tras la primera carga
- **Idioma:** toda la interfaz en español

## Visual identity

El rediseño está implementado. La referencia autorizada por el usuario fija la dirección: azul marino profundo, azul eléctrico y cian neón, vidrio teñido y un instrumento luminoso como gesto firma. El sistema construido —tokens, tipografía, elevación, formas, componentes y reglas— vive en [DESIGN.md](DESIGN.md); este documento no lo duplica.

Resumen operativo: Sora para cifras y titulares, Manrope para la interfaz; paneles de vidrio sobre aura navy con retícula enmascarada como plano de medición; color reservado a la tolerancia y al cian de lectura/acción.

## Stack

- React 18.3.1
- Vite 5.4.21 (base: `/lactcontrol/`)
- Tailwind CSS 3.4.x
- lucide-react 0.400+
- pnpm via bundled Node.js
- Deploy target: static hosting (Vercel/Netlify/Cloudflare Pages/GitHub Pages) — public HTTPS URL
