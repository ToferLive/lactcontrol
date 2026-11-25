---
name: LactControl
description: Estación de pesaje de dosificación por etapas — un instrumento de precisión sobre vidrio azul marino.
colors:
  void: "#04081A"
  deep: "#050A1C"
  panel: "#0B1A3F"
  electric: "#2457FF"
  cyan: "#3FD0FF"
  frost: "#F2F6FF"
  mist: "#A9C0E8"
  steel: "#7C93BC"
  line: "#7FA8FF"
  ok: "#2EE6A8"
  warn: "#FFC24B"
  danger: "#FF5C7A"
typography:
  display:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 11vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0em"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.16em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  pill: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
components:
  button-primary:
    backgroundColor: "#2457FF"
    textColor: "{colors.frost}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.frost}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.mist}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
  weight-input:
    backgroundColor: "{colors.void}"
    textColor: "{colors.frost}"
    typography: "{typography.display}"
    rounded: "{rounded.lg}"
    padding: "20px 16px"
    height: "112px"
  glass-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.frost}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  dock:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.mist}"
    rounded: "{rounded.xl}"
    padding: "6px"
    height: "64px"
  status-chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.mist}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
    height: "24px"
---

# Design System: LactControl

## Overview

**Creative North Star: "El Instrumento Sumergido"**

LactControl se lee como un instrumento óptico de precisión suspendido en agua azul marino. El chrome desaparece: el dial vivo —no las tarjetas— dice si la masa está en tolerancia. Los paneles son vidrio teñido con la misma luz del fondo, no superficies opacas; la luz eléctrica se acumula arriba a la derecha y el cian marca los datos que importan. La tipografía es técnica sin ser fría: Sora sostiene las cifras y los titulares, Manrope conduce la interfaz.

El mundo aporta solo cuatro cosas —tipografía, paleta, densidad y un gesto firma— y la navegación y los controles se mantienen en su forma conocida. Un operario con guantes debe encontrar el campo de peso, el botón de continuar y el estado de tolerancia sin aprender una interfaz nueva. La familiaridad es una función, no una concesión.

Se rechaza explícitamente el dashboard oscuro genérico de tarjetas flotantes sin jerarquía, el negro puro, los halos de neón sin función y cualquier segundo instrumento que compita con el dial. La estación tiene una sola lectura protagonista por pantalla.

**Key Characteristics:**
- Un instrumento protagonista: campo de peso + dial de desviación.
- Vidrio teñido de azul sobre aura navy; nunca tarjetas grises.
- Datos siempre en Sora con `tabular-nums`; la UI en Manrope.
- Color con función: verde/ámbar/rojo solo para tolerancia; cian para lectura, acción y selección.
- Objetivos táctiles de 44–48 px y contraste AA en texto pequeño.
- Retícula técnica enmascarada, usada como plano de medición.

## Colors

Paleta de profundidad atlántica: navy casi negro, azul eléctrico como energía y cian como señal. Los colores de estado son los únicos saturados fuera de la marca.

### Primary
- **Electric Blue** (#2457FF): acción primaria, aura de fondo y sombra del botón. Es la única superficie grande saturada.
- **Signal Cyan** (#3FD0FF): lectura en vivo, valores de etapa, paso activo, iconografía de acento, foco y selección.

### Secondary
- **Tolerance Green** (#2EE6A8): estado dentro de tolerancia, zonas OK del dial y series positivas.

### Tertiary
- **Warning Amber** (#FFC24B): zona de aviso (hasta el doble de la tolerancia) y estados intermedios.
- **Out-of-Range Red** (#FF5C7A): fuera de tolerancia y acciones destructivas.

### Neutral
- **Abyssal Void** (#04081A): fondo más profundo, campos de entrada y pistas de barras.
- **Deep Atlantic** (#050A1C): base del documento y header translúcido.
- **Hull Panel** (#0B1A3F): tinte de los paneles de vidrio y de los controles secundarios.
- **Frost Light** (#F2F6FF): texto principal y cifras.
- **Sea Mist** (#A9C0E8): texto secundario y etiquetas de navegación.
- **Instrument Steel** (#7C93BC): texto terciario, unidades, ayudas y metadatos.
- **Hairline Blue** (#7FA8FF): bordes, divisores y pistas; siempre entre 15 % y 25 % de opacidad.

### Named Rules
**The Status-Only Saturation Rule.** Verde, ámbar y rojo solo aparecen sobre datos que expresan tolerancia. Nunca son decoración, nunca son fondo de una sección.

**The Steel-Is-Not-Gray Rule.** El texto secundario se tiñe de azul (`steel` o `mist`); el gris neutro está prohibido porque ensucia el vidrio.

## Typography

**Display Font:** Sora (con `ui-sans-serif, system-ui, sans-serif`)
**Body Font:** Manrope (con `ui-sans-serif, system-ui, sans-serif`)

**Character:** Sora aporta geometría de instrumento y cifras con presencia; Manrope suaviza la interfaz sin volverla genérica. El contraste se produce por peso y tamaño, no por cambiar de familia en cada nivel.

### Hierarchy
- **Display** (600, `clamp(2.5rem, 11vw, 4.25rem)`, 1): peso gigante del instrumento y cifra del dial; siempre `tabular-nums` y tracking negativo.
- **Headline** (600, 1.25rem, 1.3): títulos de pantalla (Historial, Estadísticas, Ajustes).
- **Title** (600, 0.875rem, 1.4): encabezados de panel, botones y filas principales.
- **Body** (400, 0.875rem, 1.6): copy de interfaz y ayudas; máximo ~70 ch en párrafos.
- **Label** (600, 0.6875rem, 1.2, tracking 0.16em, mayúsculas): eyebrows de métricas y pasos. En filas densas baja a 9–10 px manteniendo el tracking.

### Named Rules
**The Tabular Data Rule.** Todo peso, porcentaje y conteo usa `tabular-nums`; sin esto el dial y las tablas “bailan” al cambiar de valor.

**The One Display Voice Rule.** Sora solo para cifras y titulares. Las etiquetas y el cuerpo nunca usan la display, aunque sean cortas.

## Layout

Contenedor máximo de 1152 px (`max-w-6xl`), gutters de 16 px en móvil y 24 px desde `sm`. La pantalla Medir usa una retícula de dos columnas en `lg` —instrumento 1.12fr, dial 0.88fr— y una sola columna por debajo. El resto de pantallas es una pila de paneles con 16 px de separación; las métricas se reparten en 3 o 4 columnas con divisores hairline.

El dock de navegación es fijo y flotante, con ancho máximo de 28rem, sobre un `padding-bottom` de 8rem en el contenido para que nada quede inalcanzable. Los objetivos táctiles mínimos son 44 px (ghost, iconos) y 48 px (primario, secundario). Verificado en Android (360 y 412 px) y escritorio (1440 px) sin desbordamiento horizontal: el detalle del historial se adapta a 4 columnas en móvil (plato, E1, E2 y total con su %) y añade las desviaciones por etapa desde `sm`. El dock no tapa el campo de peso ni la acción primaria en el primer viewport.

Ritmo: 4 px de base, 8/12/16 para grupos internos y 24/32 entre bloques. Más aire encima de un título que debajo.

## Elevation & Depth

Sistema híbrido: profundidad tonal de vidrio más una sombra estructural con desplazamiento real. No hay superficies planas sobre negro; el panel se separa con tinte, blur y una sombra larga de offset vertical. Los halos de color se reservan para estados (foco, botón primario) y para el resplandor del dial.

### Shadow Vocabulary
- **Panel** (`0 30px 80px -40px rgba(2,8,30,0.95), inset 0 1px 0 rgba(255,255,255,0.055)`): tarjetas de vidrio en reposo.
- **Dock** (`0 24px 60px -24px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.06)`): navegación flotante.
- **Primary action** (`0 18px 42px -18px rgba(36,87,255,0.95), inset 0 1px 0 rgba(255,255,255,0.18)`): botón primario; crece al hover.
- **Focus glow** (`0 0 0 1px rgba(63,208,255,0.35), 0 0 42px -10px rgba(63,208,255,0.75)`): solo en `focus-within` del campo y en el dial.

### Named Rules
**The Offset Shadow Rule.** Toda sombra en reposo tiene desplazamiento vertical y blur amplio. Un halo de color plano sin offset es decoración y está prohibido fuera del estado de foco.

## Shapes

Lenguaje de esquinas suaves y precisión técnica: paneles a 24 px, campos y controles grandes a 16 px, botones y filas a 12 px, iconos a 8 px y chips completamente redondeados. Los bordes son hairlines de 1 px en `line` al 15–25 %, nunca bordes gruesos ni dobles.

La geometría firma es el dial: un arco semicircular con 25 marcas (mayores cada cuatro), tres anillos elípticos concéntricos que representan el plato de la báscula en perspectiva, y una aguja que nace del pivote con un punto luminoso. La cifra de lectura nunca vive dentro del arco, para que la aguja jamás la cruce: en escritorio se coloca debajo del arco; en móvil se reordena por encima del dial para que valor y estado entren en el primer viewport. No hay clipping decorativo: las tablas del historial se adaptan al ancho en móvil en lugar de desbordar.

## Components

### Buttons
- **Shape:** radio de 12 px (`rounded.md`), altura mínima 48 px; el ghost baja a 44 px.
- **Primary:** gradiente vertical #2F63FF → #1B44D6, borde azul translúcido y sombra azul con offset; texto Frost en Sora 14 px.
- **Hover / Focus:** eleva 1 px y profundiza la sombra; `focus-visible` dibuja un anillo cian de 2 px con offset de 2 px. `active` vuelve al plano con escala 0.99. Deshabilitado: superficie neutra translúcida, texto Frost al 70 %, borde hairline y sin sombra (nunca un azul atenuado que parezca un botón activo sucio).
- **Secondary:** fondo `panel` translúcido con borde hairline; hover sube borde a cian.
- **Ghost:** solo texto Mist; hover con blanco al 5 %.

### Chips
- **Style:** píldora con borde y tinte del color de estado (verde/ámbar/rojo) o borde `line` y fondo blanco al 5 % en reposo; punto de 6 px a la izquierda y cifra en Sora tabular.
- **State:** el estado se deriva de la desviación absoluta contra la tolerancia; nunca se codifica solo con color, siempre lleva texto.

### Cards / Containers
- **Corner Style:** 24 px.
- **Background:** gradiente de vidrio `rgba(19,38,82,0.66) → rgba(6,13,34,0.72)` con `backdrop-filter: blur(18px) saturate(125%)`.
- **Shadow Strategy:** Panel (ver Elevation).
- **Border:** 1 px `rgba(127,168,255,0.16)`; los paneles del instrumento añaden una línea de luz cian superior al 12 % de inset.
- **Internal Padding:** 16 px en móvil, 20–24 px desde `sm`.

### Inputs / Fields
- **Style:** contenedor de 16 px de radio, fondo Void al 60 %, borde `line` al 20 %; el input interno es transparente, centrado, en Sora Display y con la unidad “g” en Steel.
- **Focus:** borde cian al 60 % y `shadow-glow-cyan`; sin outline duplicado.
- **Disabled / ReadOnly:** el flujo no usa campos de solo lectura; los tres pasos (molde, molde + E1, total acumulado) son editables.

### Navigation
- **Style:** dock de vidrio oscuro con blur 22 px, radio 20 px (píldora desde `sm`), cuatro destinos con icono Lucide de 20 px y etiqueta en 9 px mayúsculas.
- **States:** activo con fondo cian al 10 %, texto cian y `aria-current="page"`; inactivo en Steel con hover a Mist. Altura táctil 52 px.

### Signature Component — Live Deviation Dial
Arco de 204 px de radio con zonas verde (tolerancia) y ámbar (hasta 2×), aguja con glow y pivote de dos círculos. La lectura numérica se actualiza con `aria-live="polite"`: en escritorio va debajo del arco, en móvil por encima del dial. La aguja se mueve con transición de 520 ms y easing `cubic-bezier(0.16, 1, 0.3, 1)`; con `prefers-reduced-motion` el movimiento se anula. Debajo, una barra de tolerancia replica la posición para lectura de un vistazo y, más abajo, una tira con los gramos en vivo de Etapa 1, Etapa 2 y Total (coloreados por su desviación). La desviación se calcula contra el objetivo de cada etapa, no contra el peso total; el total en gramos se compara con el `ideal` de la receta en los resultados y el historial. Con tolerancia 0 % el estado sigue la tolerancia real aunque la geometría del dial se escale a un mínimo legible.

## Do's and Don'ts

### Do:
- **Do** usar cian para lectura, acción y selección; el resto del color pertenece al estado de tolerancia.
- **Do** mantener el texto pequeño sobre `steel` o `mist`, nunca gris neutro, y verificar AA a 10 px.
- **Do** poner `tabular-nums` en toda cifra y alinear pesos a la derecha en tablas.
- **Do** mantener el CTA primario visible en el primer viewport móvil, dentro de la tarjeta del instrumento.
- **Do** verificar el render real a 390 px y 1440 px antes de cerrar cualquier cambio.

### Don't:
- **Don't** colocar la cifra del dial dentro del arco: la aguja la cruzaría.
- **Don't** usar negro puro (#000) ni grises sin tinte azul.
- **Don't** añadir una segunda tipografía display ni usar Sora en el cuerpo.
- **Don't** superar 24 px de radio en paneles ni usar sombras sin offset.
- **Don't** dejar que la retícula de fondo aparezca fuera de la máscara radial: es plano de medición, no wallpaper.
