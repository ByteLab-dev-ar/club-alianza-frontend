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
  alerta-fuerte: "oklch(62% 0.13 70)"
  panel-oscuro: "oklch(15% 0.01 250)"
  banda-tabla: "oklch(13% 0.012 250)"
  banda-tabla-rotulo: "oklch(80% 0.006 250)"
  dato-rampa-1: "oklch(41% 0.2 235)"
  dato-rampa-2: "oklch(49% 0.24 235)"
  dato-rampa-3: "oklch(66% 0.19 235)"
  dato-deuda-1: "oklch(79% 0.13 25)"
  dato-deuda-2: "oklch(68% 0.18 25)"
  dato-deuda-3: "oklch(58% 0.21 25)"
  dato-deuda-4: "oklch(47% 0.18 25)"
  dato-pagado: "oklch(49% 0.24 235)"
  dato-impago: "oklch(72% 0.006 250)"
  dato-altas: "oklch(49% 0.24 235)"
  dato-bajas: "oklch(58% 0.21 25)"
  dato-serie: "oklch(49% 0.24 235)"
  dato-grilla: "oklch(93% 0.004 240)"
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
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "44px"
  chip:
    backgroundColor: "{colors.celeste-chip}"
    textColor: "{colors.celeste-profundo}"
    rounded: "9999px"
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
sistema y se muestran enteras, sin velos ni degradados encima (salvo la portada de
la galería, que tiene sus condiciones en Components). Todo lo demás es neutro,
ordenado y callado para que esas dos cosas se escuchen.

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
- **Banda de tablas** (`{colors.banda-tabla}`, rótulo en
  `{colors.banda-tabla-rotulo}`; `--table-band`): el encabezado de las tablas va
  en versales sobre una banda oscura, que le da a cada tabla un ancla visual.
  Son tokens propios y no Tinta a propósito: en oscuro la tinta se vuelve casi
  blanca, y la banda en cambio se oscurece un paso más que la tarjeta y pasa el
  rótulo al celeste brillante.

### Estados

- **Error** (`{colors.error}`) y **Éxito** (`{colors.exito}`): rellenos de
  estado con el texto de adentro en blanco.
- **Alerta** (`{colors.alerta}`): el relleno ámbar, con el texto de adentro en
  Tinta. Da 2.75:1 sobre blanco, así que no sirve para marcas sueltas sobre
  claro.
- **Alerta Fuerte** (`{colors.alerta-fuerte}`, `--warning-strong`): el mismo
  ámbar con 8 puntos menos de luz, para **íconos, puntos y marcas sobre claro**
  (3.74:1; un ícono pide 3:1). **No alcanza para texto chico**, que pide 4.5:1:
  en un aviso el ámbar queda en el ícono o el punto, y el texto va en su color
  de siempre (Tinta, o Gris Dicho si es secundario). Los rellenos siguen siendo
  Alerta. En el modo oscuro vale lo mismo que Alerta, que ahí ya da 8.5:1.

### Colores de datos

Los gráficos del Resumen no se pintan con la rampa oficial (su mejor escalón da
1.78:1 sobre blanco y un relleno de gráfico pide 2:1). Sus colores salen del
Celeste Profundo y del Error, subiendo y bajando la luz sobre el mismo tono, más
dos grises neutros; en oscuro tienen pasos propios, no los de claro invertidos.
Están validados contra la tarjeta real de cada tema. Valores en `oklch`:

| Tokens | Claro | Oscuro | Para qué |
| --- | --- | --- | --- |
| `--chart-ramp-1` · `-2` · `-3` | 41% 0.2 235 · 49% 0.24 235 · 66% 0.19 235 | 82% 0.14 222 · 68% 0.17 228 · 52% 0.17 235 | Escala ordinal: el 1 es el que más se despega del fondo (en oscuro, el más claro). Qué significa cada escalón lo dice la leyenda de la tarjeta. |
| `--chart-debt-1` a `-4` | 79% 0.13 25 · 68% 0.18 25 · 58% 0.21 25 · 47% 0.18 25 | 78% 0.14 25 · 67% 0.19 25 · 56% 0.19 25 · 45% 0.16 25 | La deuda, en cuatro escalones del rojo. |
| `--chart-paid` / `--chart-unpaid` | 49% 0.24 235 / 72% 0.006 250 | 78% 0.15 225 / 45% 0.012 250 | Pagado contra sin pagar (en Plantel, la actividad). El gris da 2.5:1 contra la tarjeta: lo compensan la leyenda, el total en la punta y la tabla gemela. |
| `--chart-joined` / `--chart-left` | 49% 0.24 235 / 58% 0.21 25 | 64% 0.17 228 / 56% 0.19 25 | Altas contra bajas: un polo frío y uno cálido. |
| `--chart-single` | 49% 0.24 235 | 64% 0.17 228 | Una sola serie: el color no distingue nada, la posición sí. |
| `--chart-grid` | 93% 0.004 240 | 26% 0.008 250 | Líneas de la grilla. |

### Modo oscuro de los paneles

Existe **solo en los paneles** (gestión y portal del socio). Lo aplica
`PanelShell` con la clase `.dark` sobre `<html>` mientras un panel está montado,
según la preferencia de la persona, y lo saca al salir: el sitio público, el
ingreso y la puerta son siempre claros, porque están diseñados alrededor de las
fotos del club y del veredicto de alto contraste. Es la misma anatomía en otro
modo: la capa redefine los tokens y todo lo tokenizado se adapta solo.

| Token | Claro | Oscuro |
| --- | --- | --- |
| `--background` | Papel | `oklch(14% 0.008 250)` |
| `--card`, `--popover` | Superficie | `oklch(19% 0.008 250)` |
| `--foreground` / `--ink` | Tinta / Negro Escudo | `oklch(97% 0 0)` |
| `--muted` / `--muted-foreground` | Gris Fondo / Gris Dicho | `oklch(24% 0.008 250)` / `oklch(70% 0.006 250)` |
| `--tertiary` | Celeste Sección | `oklch(22% 0.01 250)` |
| `--accent` | Celeste Chip | `oklch(27% 0.01 250)`, texto `oklch(97% 0 0)` |
| `--primary` | Celeste Escudo | `oklch(80% 0.14 222)` |
| `--secondary`, `--brand`, `--ring` | Celeste Escudo / Celeste Profundo | `oklch(78% 0.15 225)` |
| `--border` / `--input` | Borde / Campo | blanco al 12% / al 15% |
| `--destructive` / `--success` / `--warning` | Error / Éxito / Alerta | `oklch(66% 0.19 25)` / `oklch(70% 0.14 155)` / `oklch(76% 0.15 80)` |
| `--warning-strong` | Alerta Fuerte | igual a `--warning` |
| `--table-band` / rótulo | Negro Escudo / `oklch(80% 0.006 250)` | `oklch(11% 0.012 250)` / `oklch(78% 0.15 225)` |

Tres cosas que no son una inversión: el celeste legible sobre oscuro es el
brillante (la Regla de los Dos Celestes vale igual); los estados suben un paso de
luz y el texto de adentro pasa a Negro Escudo, porque a esa luz el blanco deja de
contrastar; y el sidebar no se redefine, así que en oscuro queda casi fundido con
el fondo y lo separa apenas el borde.

### Capas que reapuntan tokens

Antes de escribir un color a mano en un componente, conviene saber que hay dos
capas más que redefinen tokens sobre un nodo y todo su subárbol:

- **`.force-light`, lo que es un objeto físico.** Vuelve a declarar los tokens de
  claro y gana aunque un ancestro tenga `.dark`. La llevan el recibo (es papel),
  su verificación, la credencial (se exporta como PNG) y el lienzo de la firma.
  Nunca se oscurecen.
- **`.chrome-band`, la banda superior del panel.** Reapunta fondo, texto, tarjeta,
  borde, campo, acento y anillo a los tokens del sidebar (con el texto de apoyo
  en `oklch(72% 0.006 250)`). Así un botón `outline` o `dark` que cada pantalla ya
  tenía escrito se dibuja bien sobre la banda oscura, sin variantes nuevas. Como
  el sidebar no cambia con el tema, la banda se ve igual en claro y en oscuro.

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

La única medida propia es el corte de la grilla del Resumen del panel, en
**81rem**: ahí entran dos gráficos de 26rem de ancho mínimo al lado del menú
lateral, y en `xl` justo no entraban porque los 16px de la barra de scroll
dejaban cada columna 2px corta. Un gráfico que se achica no se lee, así que el
corte se corrió un rem en vez de bajarle el mínimo al gráfico.

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
  de estados hover sobre acciones primarias. En reposo no va en ningún lado,
  tampoco en los puntos de la línea de tiempo.

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

Radio base de 12 px, con una escala corta: 8 px para lo chico (las etiquetas
neutras, como la categoría en la galería o los valores de Institucional, los
números de los filtros del panel, las miniaturas y la paginación de la galería),
10 px para lo compacto (el botón chico, los ítems de menú y de select, el botón
que cierra un diálogo), 12 px para botones, campos y tarjetas, 16 px para
botones grandes, diálogos y la caja de las pestañas (cada pestaña, 12 px).

**Lo redondo.** El círculo y la píldora (`rounded-full`) no son un escalón más de
la escala: quedan para cinco familias, y en todas la forma dice qué es la cosa.

- **Avatares**, y lo que ocupa su lugar cuando no hay foto: las iniciales (la
  comisión directiva) y el ícono de persona. Una cara se reconoce en un círculo.
- **Puntos sin texto de 20 px o menos, que marcan un estado o una parada**: el
  punto de aviso sin leer, el de la membresía y el de la credencial (8 px), y en
  la línea de tiempo de Historia el punto de cada hito (12 px, sobre un disco de
  20 px del color del fondo, más el anillo gris de 12 px con el que arranca
  apagado) y la punta que marca hasta dónde llegó la barra (14 px). Un punto
  sobre una línea, o pegado a un rótulo, solo se lee como punto si es redondo:
  con cualquier escalón de la escala queda un cuadradito que parece un error.
  Van en color plano y **sin Resplandor**, que es solo del hover de las acciones
  primarias.
- **Píldoras: etiquetas de un solo renglón con texto de 12 px o menos**, que
  nombran un estado o una categoría o filtran una lista. El Badge (estados de
  socio, de pago y de staff, roles), la categoría y los filtros de Eventos y la
  categoría en la galería del panel, las píldoras de estado del portal del socio
  (la membresía, los pasos de la solicitud, "Firmada") y de la puerta ("Socio",
  "Entrena", "Con seguro"), el "Buscando código…" sobre la cámara, el contador
  de avisos, que se estira con los dígitos, y el contador del menú del panel
  (cuántas sugerencias de grupo esperan), que comparte esa caja. Es la forma convencional de una
  etiqueta —la trae el Badge— y no se confunde con un botón de acción, que
  siempre lleva radio de la escala.
- **Controles que son redondos por convención**: el interruptor (riel en píldora
  y perilla circular) y la barra de progreso. Con esquinas dejan de reconocerse.
- **Íconos solos dentro de un círculo**: las redes del pie (40 px, con contorno)
  y los íconos de los datos de Contacto (44 px). El círculo es el formato con el
  que se reconoce un link a una red, y Contacto usa el mismo para sus datos.

Todo lo demás lleva un escalón de la escala y **nunca es círculo ni píldora**:
tarjetas, botones (también los de solo ícono, como el que cierra un diálogo o un
aviso), campos, selects, menús, diálogos, pestañas, los filtros del panel,
miniaturas, paginación y la placa del escudo, que es cuadrado. Tampoco lo es una
etiqueta de más de un renglón. Y no toda etiqueta es píldora: las neutras de la
galería y de Institucional y los números de los filtros del panel van con 8 px, y
la pastilla de estado de la credencial con 12 px.

La otra excepción es el 2 px (`rounded-xs`), reservado para **marcas chicas de
8 px de alto o menos que no son un punto de estado ni una parada**: el
cuadradito con el color de una categoría y los puntos del carrusel de la galería,
cuyo actual se estira en una barra. Con cualquier escalón de la escala un
cuadrado de 8 px queda redondo —y el círculo es solo para las familias de
arriba—; sin radio, a ese tamaño el borde vivo se ve serruchado. No se usa en
nada que tenga texto adentro ni que mida más de 8 px de alto.

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
  hover suma el Resplandor a la sombra Club (las dos juntas, no una en lugar de
  la otra). Reservada a la acción principal de una superficie.
- **Dark:** relleno Negro Escudo con texto papel, para acciones secundarias sobre
  fondo claro.
- **Outline / Ghost:** contorno o nada, con hover a Celeste Chip y texto Celeste
  Profundo.
- **Focus:** anillo de 3 px en Celeste Profundo al 50%, siempre visible con teclado.

### Chips

- **Style:** fondo Celeste Chip, texto Celeste Profundo, sin borde.
- **Shape:** píldora cuando es etiqueta (ver Shapes, "Lo redondo").
- **State:** el mismo par de colores sirve para hover de items de navegación y
  para el estado activo en menús laterales. Ahí se presta el color y no la
  forma: el item de navegación conserva su radio de la escala.

### Cards / Containers

- **Corner Style:** 12 px.
- **Background:** Superficie sobre Papel.
- **Shadow Strategy:** sombra Suave (ver Elevation).
- **Border:** 1 px en Borde.
- **Internal Padding:** 32 px.

### Inputs / Fields

- **Style:** fondo Superficie, contorno 1 px en Campo, radio 12 px (el base) y
  altura 44 px —el mínimo táctil, cuatro más que el botón—. Es la misma caja en
  `input`, `select` y `textarea`.
- **Focus:** anillo de 3 px en Celeste Profundo al 50%.
- **Error:** contorno y mensaje en Error.

### Navigation

Header pegajoso con fondo Papel al 88% y desenfoque de 12 px. Enlaces en 14 px
semibold: Gris Dicho en reposo, Tinta en hover, **Celeste Profundo** en la ruta
activa. Por debajo de 64rem colapsa a un menú desplegable de ancho completo.

### Footer

La única sección a sangre del sitio público con degradé de fondo. El fondo abre
en el mismo Negro Escudo que el bloque de arriba y lo sostiene hasta el 30%, para
recién derivar al petróleo al llegar abajo: así el pie se separa por transición y
no por corte.
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

### Texto sobre la foto: la portada de la galería

La excepción documentada a mostrar la foto entera con el texto en un panel al
costado es la portada de la galería ("Lo más reciente"), que la pidió el club.

- **Desde `md`** el kicker, el título, la categoría con la fecha y el botón van
  encima de la foto, anclados abajo, sobre `bg-scrim-portada`: Negro Escudo al
  80% en un tramo pleno que mide lo que mide el bloque de texto y crece con el
  título. Solo sus **8rem de arriba** se desvanecen (al 45% a mitad de camino,
  transparente arriba de todo), así que el resto de la foto queda limpio.
- **El título tiene tope de renglones:** 2 entre `md` y `lg`, 3 desde `lg`. El
  panel acepta títulos de hasta 120 caracteres, y sin tope el bloque tapaba la
  foto entera. Entero se lee en la página del momento.
- **En el celular no se superpone:** la foto va arriba, en 4:3, y el texto
  debajo, en un panel sólido de Negro Escudo, como pide el sistema.

Por qué no es el velo que el sistema prohíbe: no oscurece la foto para que se lea
un texto encima, es el fondo del bloque de texto, y solo mide lo que el texto. Y
el contraste no depende de la foto: hasta sobre una foto blanca, el blanco al 70%
da 6.6:1 y el kicker en Celeste Escudo pasa de 5:1.

`bg-scrim-portada` no se usa en ningún otro lugar, y el patrón no se copia sin sus
tres condiciones: fondo que mide lo que el texto, tope de renglones y panel sólido
en el celular. Cuánta foto queda limpia en cada pantalla está medido en el
comentario de `bg-scrim-portada` (`src/index.css`).

## Do's and Don'ts

### Do:

- **Do** usar Celeste Escudo sobre oscuro y Celeste Profundo sobre claro, siempre.
- **Do** mostrar las fotos del club enteras, con el texto en un panel sólido al
  costado en vez de encima (la excepción documentada es la portada de la galería).
- **Do** abrir cada sección con un kicker en versales tracked.
- **Do** agrupar datos con una regla celeste superior de 3 px y 48 px de aire.
- **Do** interpolar los titulares con `clamp()` en lugar de saltar por breakpoints.
- **Do** envolver toda animación ligada al scroll en `@supports` y anularla bajo
  `prefers-reduced-motion`, de modo que el peor caso sea "se ve sin animación" y
  nunca "no se ve".

### Don't:

- **Don't** poner texto encima de una foto tapándola con un velo de degradé
  (salvo la portada de la galería, con las condiciones de "Texto sobre la foto:
  la portada de la galería").
- **Don't** hacer redondo lo que no está en las cinco familias de "Lo redondo", ni
  ponerle Resplandor a algo en reposo.
- **Don't** pegar dos bloques oscuros de distinto valor: el de abajo arranca en
  el negro del de arriba y deriva después.
- **Don't** teñir los neutros de celeste: el gris es gris.
- **Don't** meter un icono dentro de un cuadradito tintado arriba de una tarjeta.
- **Don't** usar la sombra para marcar qué es más importante.
- **Don't** redondear las secciones a sangre; el radio es del componente.
- **Don't** usar ningún escalón de la rampa oficial para texto sobre fondo claro:
  el mejor da 1.78:1 y hacen falta 4.5:1.
