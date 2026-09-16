---
name: Club Alianza
description: Portal institucional y de gestión de socios del Club Alianza, Cutral Có.
colors:
  celeste-escudo: "oklch(74% 0.23 215)"
  celeste-profundo: "oklch(49% 0.24 235)"
  celeste-resplandor: "oklch(82% 0.19 205)"
  celeste-chip: "oklch(95.2% 0.04 212.2)"
  celeste-seccion: "oklch(97% 0.02 212)"
  negro-escudo: "oklch(13% 0.012 250)"
  tinta: "oklch(20% 0.008 250)"
  papel: "oklch(98% 0 0)"
  superficie: "oklch(100% 0 0)"
  gris-dicho: "oklch(47% 0.006 250)"
  gris-fondo: "oklch(96% 0.004 240)"
  borde: "oklch(90% 0.004 240)"
  campo: "oklch(87% 0.006 240)"
  error: "oklch(58% 0.21 25)"
  exito: "oklch(58% 0.14 155)"
  alerta: "oklch(70% 0.15 70)"
  panel-oscuro: "oklch(15% 0.01 250)"
  degrade-celeste-inicio: "oklch(68% 0.24 232)"
  degrade-celeste-fin: "oklch(80% 0.19 200)"
  degrade-oscuro-inicio: "oklch(14% 0.02 250)"
  degrade-oscuro-medio: "oklch(18% 0.045 238)"
  degrade-oscuro-fin: "oklch(26% 0.075 215)"
  resplandor-inferior: "oklch(52% 0.14 205)"
typography:
  display:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 3.6vw, 3.25rem)"
    fontWeight: 900
    lineHeight: 1.06
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 3.4vw, 2.5rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  subtitle:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body-lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  body-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.14em"
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.2em"
rounded:
  xs: "2px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "16px"
spacing:
  seccion-densa: "64px"
  seccion: "80px"
  seccion-amplia: "96px"
  columna: "48px"
components:
  button-primary:
    backgroundColor: "{colors.celeste-escudo}"
    textColor: "{colors.negro-escudo}"
    rounded: "{rounded.lg}"
    padding: "8px 20px"
    height: "40px"
  button-hero:
    backgroundColor: "{colors.celeste-escudo}"
    textColor: "{colors.negro-escudo}"
    rounded: "{rounded.xl}"
    padding: "0 32px"
    height: "48px"
  button-dark:
    backgroundColor: "{colors.negro-escudo}"
    textColor: "{colors.papel}"
    rounded: "{rounded.lg}"
    padding: "8px 20px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.lg}"
    padding: "8px 20px"
    height: "40px"
  button-ghost-hover:
    backgroundColor: "{colors.celeste-chip}"
    textColor: "{colors.celeste-profundo}"
    rounded: "{rounded.lg}"
  card:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.lg}"
    padding: "32px"
  input:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  chip:
    backgroundColor: "{colors.celeste-chip}"
    textColor: "{colors.celeste-profundo}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
---

# Design System: Club Alianza

## Overview

**Creative North Star: "El Club que Funciona"**

Una institución que abre todos los días y no te hace perder tiempo. El sistema
combina la calidez de un club de barrio con la prolijidad de una administración
que anda: el sitio público convence justamente porque se nota que adentro todo
está en orden. Nada acá busca sorprender; busca que el socio entre, resuelva y se
vaya.

La energía viene de dos lugares y de ningún otro. Primero, el **celeste del
escudo**, que aparece poco y siempre con un trabajo concreto: marcar el próximo
paso, encabezar una sección, confirmar un estado. Segundo, las **fotos reales del
club** —la tribuna con humo, la cancha vacía—, que son el activo emocional del
sistema y se muestran enteras, sin velos ni degradados encima. Todo lo demás es
neutro, ordenado y callado para que esas dos cosas se escuchen.

La composición favorece bloques a sangre partidos en dos: un lado de foto, un
lado de color plano con el texto. Esa estructura resuelve de una sola vez el
contraste, la legibilidad y el protagonismo de la imagen, y por eso reemplazó a
las cajas con degradé y esquinas redondeadas que había antes.

**Key Characteristics:**

- Neutros sin croma: gris real, nunca gris celeste.
- El celeste como acento medido, jamás como superficie extendida.
- Fotografía propia mostrada entera, con el texto en un panel sólido al costado.
- Jerarquía por regla, color y aire; la sombra no jerarquiza.
- Movimiento solo cuando el navegador lo soporta, y nunca si el sistema lo desaconseja.

## Colors

Una sola familia cromática —el celeste del escudo, en escala— sobre una base
totalmente acromática.

### Primary

- **Celeste Escudo** (`{colors.celeste-escudo}`): el color de la institución a
  máxima saturación. Rellenos, botones primarios, rótulos y todo lo que va sobre
  superficie oscura. Da 10.3:1 contra el negro del escudo y **1.8:1 contra
  blanco**, así que fuera de fondo oscuro no puede llevar texto.
- **Celeste Profundo** (`{colors.celeste-profundo}`): la contraparte para texto e
  iconos sobre claro, con 5.1:1 contra el papel. Existe únicamente porque el
  Celeste Escudo es ilegible ahí.
- **Celeste Resplandor** (`{colors.celeste-resplandor}`): extremo brillante,
  reservado para degradados y halos sobre oscuro.

### Secondary

- **Celeste Chip** (`{colors.celeste-chip}`): el escalón más claro de la rampa
  oficial. Fondo de chips, estados hover y realces suaves sobre claro.
- **Celeste Sección** (`{colors.celeste-seccion}`): el tinte más liviano, para
  alternar secciones sin que compitan con el contenido.

### Neutral

- **Negro Escudo** (`{colors.negro-escudo}`): el near-black tomado del negro del
  escudo. Bloques oscuros, paneles, tipografía de titulares.
- **Tinta** (`{colors.tinta}`): texto corrido sobre claro.
- **Gris Dicho** (`{colors.gris-dicho}`): texto secundario, metadatos, apoyo.
- **Papel** (`{colors.papel}`) y **Superficie** (`{colors.superficie}`): fondo de
  página y de tarjetas.
- **Borde** (`{colors.borde}`) y **Campo** (`{colors.campo}`): divisiones y
  contornos de formulario.

### Escala oficial del club

La rampa institucional tiene cinco escalones y es la fuente para rellenos y
tintes: `#D2F7FF` · `#9EECFF` · `#69E2FF` · `#35D7FF` · `#00CCFF`. Los cinco
rinden entre 10.6:1 y 17.7:1 sobre el negro del escudo, y **ninguno llega a 4.5:1
sobre blanco**: el mejor da 1.78:1. Es una escala para pintar, no para escribir
sobre claro.

### Paradas de degradé

Tres degradés del sistema aportan seis colores que **solo existen dentro de
ellos** y nunca se usan sueltos: `degrade-celeste-inicio` y `degrade-celeste-fin`
forman el relleno del botón hero; `degrade-oscuro-inicio`, `-medio` y `-fin`
llevan los bloques oscuros de navy casi negro a petróleo; y
`resplandor-inferior` es el halo cyan que se apila abajo a la derecha. Están
nombrados para que el sistema no tenga literales sin dueño, no para que se elijan
como color de relleno.

### Named Rules

**La Regla de los Dos Celestes.** El brillante va sobre oscuro; el profundo, sobre
claro. Nunca al revés. Es la diferencia entre 10.3:1 y 1.8:1, medida, no opinada.

**La Regla del Neutro Sin Croma.** Fondos, bordes, chips neutros y secciones van
con croma cero o casi. Un gris celeste ensucia el acento y hace que el celeste
deje de destacar.

**La Regla del Diez Por Ciento.** El celeste no pinta más de una décima parte de
una pantalla. Su escasez es lo que lo hace funcionar.

## Typography

**Display Font:** Hanken Grotesk (con `system-ui`, `sans-serif`)
**Body Font:** Inter (con `system-ui`, `sans-serif`)

**Character:** Un grotesco de titulares con peso extremo contra una sans de texto
absolutamente neutra. El contraste no está en el estilo sino en la fuerza: los
titulares empujan a 900 con tracking negativo, el cuerpo no hace ruido.

### Hierarchy

- **Display** (900, `clamp(2.25rem, 3.6vw, 3.25rem)`, 1.06): titular de portada.
  Fluido a propósito, para que no salte de golpe al cruzar un breakpoint.
- **Headline** (900, `clamp(1.875rem, 3.4vw, 2.5rem)`, 1.1): apertura de sección.
- **Subtitle** (800, `1.5rem`, 1.25): el escalón intermedio, para títulos que
  encabezan una fila a todo el ancho y no entran en Title sin perder peso.
- **Title** (800, `1.125rem`, 1.4): títulos de tarjeta, columna y bloque.
- **Body Lead** (400, `1.0625rem`, 1.65): el párrafo de apertura dentro de los
  paneles oscuros. Un punto por encima del cuerpo, nada más.
- **Body** (400, `1rem`, 1.65): texto corrido. Ancho útil de 60 a 70 caracteres.
- **Body Small** (400, `0.875rem`, 1.6): texto secundario, descripciones de ficha,
  metadatos. Es el tamaño más frecuente del sitio después del cuerpo.
- **Caption** (600, `0.6875rem`, tracking `0.14em`, VERSALES): pies de foto sobre
  las imágenes del club.
- **Label** (700, `0.75rem`, tracking `0.2em`, VERSALES): el *kicker* que encabeza
  cada sección.

La rampa es corta a propósito: nueve escalones cubren el sitio entero. Un tamaño
que no esté acá es deriva, no una decisión.

### Named Rules

**La Regla del Kicker.** Toda sección abre con un rótulo en versales tracked antes
del titular. Es el elemento que le da ritmo institucional al sitio entero.

**La Regla del Titular Fluido.** Los tamaños de display y headline se interpolan
con `clamp()`, nunca por breakpoints. Un titular que salta de 46 a 52 px al cruzar
1280 delata la grilla.

## Layout

Contenedor máximo de 80rem (`max-w-7xl`) con 1.5rem de aire lateral, centrado.
Las secciones respiran entre 64 y 96 px de padding vertical según su peso, y ese
ritmo se varía a propósito: una sección densa se gana una amplia al lado.

**Bloques partidos.** El patrón estructural característico es la sección a sangre
dividida en dos columnas asimétricas: foto de un lado, panel de color plano del
otro. La proporción es 2fr / 3fr —la imagen es la columna chica— y por debajo de
`lg` apila **con la foto arriba**. Lo que va a sangre es el fondo: desde `lg`
las dos columnas se alinean con el contenedor de la página, porque de borde a
borde, en un monitor ancho, la foto se estiraba y el texto quedaba lejos del
resto del contenido. Hoy lo usa el próximo evento de la agenda,
con la foto a la izquierda y el panel en Negro Escudo a la derecha; la portada
lo usaba espejado, con el panel a la izquierda, antes de pasar a mosaico.

Cuando la imagen es un **flyer** y no una foto del club, no se recorta: va
entera sobre una copia borrosa de sí misma, porque el flyer trae impresos la
hora y el lugar abajo de todo y cualquier `cover` se come justo ese dato. Un
evento sin flyer no estrena media franja de relleno: el panel toma el ancho
completo.

**Columnas de ficha.** Los grupos de tres datos van en grilla de tres con 48 px de
separación, sin caja: solo el aire y una regla superior los agrupa.

Breakpoints: 40rem (`sm`), 48rem (`md`), 64rem (`lg`), 80rem (`xl`).

## Elevation & Depth

El sistema es **ambiental**: la sombra aporta profundidad y calidez, nunca
jerarquía. Lo que ordena la página es el color, la regla y el aire; una tarjeta no
es más importante porque flote más.

### Shadow Vocabulary

- **Suave** (`0 1px 2px oklch(13% 0.012 250 / 0.06), 0 6px 20px -8px oklch(13% 0.012 250 / 0.14)`):
  el asentamiento por defecto de superficies elevadas.
- **Club** (`0 24px 48px -20px oklch(13% 0.012 250 / 0.5)`): caída larga y baja
  para elementos que realmente despegan del plano.
- **Resplandor** (`0 0 36px oklch(74% 0.23 215 / 0.5)`): halo celeste, exclusivo
  de estados hover sobre acciones primarias.

### Named Rules

**La Regla de la Sombra Ambiental.** Si sacás todas las sombras y la pantalla
sigue leyéndose igual de bien, la jerarquía está bien construida. Si se desarma,
estaba apoyada en el lugar equivocado.

**La Regla del Negro Compartido.** Cuando dos bloques oscuros se tocan, el de
abajo arranca en el MISMO valor que el de arriba y recién después cambia. Dos
negros distintos pegados producen una costura que se lee como error de
renderizado; el mismo negro derivando produce una transición que se lee como
intención. Si hace falta marcar el límite, se dibuja un filete encima — pero eso
es una decisión aparte, no el arreglo de la costura.

## Shapes

Radio base de 12 px, con una escala corta: 8 px para lo chico (chips, botones
pequeños), 10 px para campos, 12 px para botones y tarjetas, 16 px para botones
grandes. Nada es circular salvo los avatares.

La excepción es el 2 px (`rounded-xs`), reservado para **marcas chicas de 8 px o
menos**: el cuadradito con el color de una categoría y los puntos del carrusel de
la galería. Con cualquier escalón de la escala un cuadrado de 8 px queda redondo —y
eso sí lo prohíbe la regla de arriba—; sin radio, a ese tamaño el borde vivo se ve
serruchado. No se usa en nada que tenga texto adentro ni que mida más de 8 px.

Las secciones a sangre **no llevan radio**: van de borde a borde de la ventana,
con corte recto. El radio es del componente, nunca del bloque de página.

Los bordes son de 1 px en `Borde`, salvo la regla celeste de 3 px que encabeza las
columnas de ficha, que es un elemento de composición y no un contorno.

## Components

Los componentes se sienten **sólidos y confiables**: con peso, con presencia, con
estados evidentes. Un club que administra plata y accesos tiene que transmitir que
las cosas están firmes.

### Buttons

- **Shape:** esquinas suavemente curvas (12 px; 16 px en tamaño grande).
- **Primary:** relleno Celeste Escudo con texto Negro Escudo, sombra Suave.
  Altura 40 px, 48 px en grande.
- **Hero:** la variante de máxima intención, con degradé celeste y sombra Club; en
  hover suma el Resplandor. Reservada a la acción principal de una superficie.
- **Dark:** relleno Negro Escudo con texto papel, para acciones secundarias sobre
  fondo claro.
- **Outline / Ghost:** contorno o nada, con hover a Celeste Chip y texto Celeste
  Profundo.
- **Focus:** anillo de 3 px en Celeste Profundo al 50%, siempre visible con teclado.

### Chips

- **Style:** fondo Celeste Chip, texto Celeste Profundo, sin borde.
- **State:** el mismo par sirve para hover de items de navegación y para el estado
  activo en menús laterales.

### Cards / Containers

- **Corner Style:** 12 px.
- **Background:** Superficie sobre Papel.
- **Shadow Strategy:** sombra Suave (ver Elevation).
- **Border:** 1 px en Borde.
- **Internal Padding:** 32 px.

### Inputs / Fields

- **Style:** fondo Superficie, contorno 1 px en Campo, radio 10 px, altura 40 px.
- **Focus:** anillo de 3 px en Celeste Profundo al 50%.
- **Error:** contorno y mensaje en Error.

### Navigation

Header pegajoso con fondo Papel al 88% y desenfoque de 12 px. Enlaces en 14 px
semibold: Gris Dicho en reposo, Tinta en hover, **Celeste Profundo** en la ruta
activa. Por debajo de 64rem colapsa a un menú desplegable de ancho completo.

### Footer

El único lugar del sistema con degradé. El fondo abre en el mismo Negro Escudo
que el bloque de arriba y lo sostiene hasta el 30%, para recién derivar al
petróleo al llegar abajo: así el pie se separa por transición y no por corte.
Encima lleva un filete de 1 px en blanco al 15% que marca dónde empieza, y cada
columna se ancla con la regla de marca de 2 px, igual que las fichas.

Los rótulos van en Celeste Escudo, no en blanco atenuado: es lo que hace que el
pie se lea como parte de la misma interfaz y no como un apéndice.

### Bloque partido (componente distintivo)

Sección a sangre en dos columnas: una foto real del club a `object-fit: cover` y
un panel de color plano con el texto. El panel usa Negro Escudo, el kicker en
Celeste Escudo y el cuerpo en blanco al 70%. La foto lleva un pie en versales
tracked sobre una placa oscura al 80%, abajo a la izquierda. Es el patrón que
reemplazó al hero con velo de degradé.

## Do's and Don'ts

### Do:

- **Do** usar Celeste Escudo sobre oscuro y Celeste Profundo sobre claro, siempre.
- **Do** mostrar las fotos del club enteras, con el texto en un panel sólido al
  costado en vez de encima.
- **Do** abrir cada sección con un kicker en versales tracked.
- **Do** agrupar datos con una regla celeste superior de 3 px y 48 px de aire.
- **Do** interpolar los titulares con `clamp()` en lugar de saltar por breakpoints.
- **Do** envolver toda animación ligada al scroll en `@supports` y anularla bajo
  `prefers-reduced-motion`, de modo que el peor caso sea "se ve sin animación" y
  nunca "no se ve".

### Don't:

- **Don't** poner texto encima de una foto tapándola con un velo de degradé.
- **Don't** pegar dos bloques oscuros de distinto valor: el de abajo arranca en
  el negro del de arriba y deriva después.
- **Don't** teñir los neutros de celeste: el gris es gris.
- **Don't** meter un icono dentro de un cuadradito tintado arriba de una tarjeta.
- **Don't** usar la sombra para marcar qué es más importante.
- **Don't** redondear las secciones a sangre; el radio es del componente.
- **Don't** usar ningún escalón de la rampa oficial para texto sobre fondo claro:
  el mejor da 1.78:1 y hacen falta 4.5:1.
