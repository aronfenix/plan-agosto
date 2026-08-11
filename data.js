/* ============================================================
   data.js — TODO EL CONTENIDO EDITABLE DEL PLAN
   Aquí viven ejercicios, textos, protocolos y calendario.
   Puedes tocar este archivo sin entender app.js.
   ============================================================ */

/* --- Rango del plan --------------------------------------- */
const PLAN = {
  inicio: '2026-08-07',
  fin: '2026-09-04',
  hitos: {
    '2026-09-04': 'REVISIÓN — perímetros, fotos, prendas, tests',
    '2026-08-24': 'Desde hoy: añade el isométrico suave después de la flexión craneocervical'
  }
};

/* --- Los 10 factores diarios ------------------------------ */
const FACTORES = [
  { key: 'caminata',  nombre: 'Caminata',            def: 'Al menos 20 minutos continuos.', min: '10 min' },
  { key: 'fuerza',    nombre: 'Fuerza',              def: 'Sesión M, P1 o P2 completada.', min: 'Un ejercicio, una serie', condicional: true },
  { key: 'movilidad', nombre: 'Movilidad',           def: 'Al menos 2 bloques de microdosis.', min: '1 bloque de 90 s' },
  { key: 'cervicales',nombre: 'Cervicales',          def: 'Ronda de flexión craneocervical.', min: '3 repeticiones' },
  { key: 'piscina',   nombre: 'Piscina',             def: 'Sesión de agua completada.', min: '10 min suaves', condicional: true },
  { key: 'comida',    nombre: 'Comí según lo decidido', def: 'Seguí el plan, o cumplí las reglas nómadas, o era una comida libre planificada.', min: '—' },
  { key: 'sueno',     nombre: 'Me acosté a mi hora', def: 'Antes de las 23:30.', min: 'Antes de la 1:00' },
  { key: 'social',    nombre: 'Vi a alguien',        def: 'Interacción real, no mensajes.', min: '—' },
  { key: 'pausa',     nombre: 'Pausa mental',        def: '10 min sin pantalla.', min: '3 min' },
  { key: 'postura',   nombre: 'Pantalla y postura',  def: 'Ni móvil en la cama ni una hora seguida con el cuello flexionado.', min: '—' }
];

/* --- Plantilla semanal por defecto (0=domingo … 6=sábado) --- */
const SEMANA_TIPO = {
  1: { fuerza: 'P1', piscina: 'regenerativa' },  // lunes
  2: { fuerza: null, piscina: 'larga' },         // martes
  3: { fuerza: 'M',  piscina: 'regenerativa' },  // miércoles
  4: { fuerza: null, piscina: 'larga' },         // jueves
  5: { fuerza: 'P2', piscina: 'regenerativa' },  // viernes
  6: { fuerza: null, piscina: null },            // sábado (libre)
  0: { fuerza: null, piscina: null }             // domingo (descanso)
};

/* Semana parcial de arranque (el plan empieza el viernes 7) */
const SEMANA_ARRANQUE = {
  '2026-08-07': { fuerza: 'P1', piscina: 'regenerativa' },
  '2026-08-08': { fuerza: null, piscina: 'larga' },
  '2026-08-09': { fuerza: null, piscina: null }
};

/* --- Sesiones de fuerza ------------------------------------ */
const SESIONES = {
  M: {
    nombre: 'Sesión M — mancuernas y kettlebell',
    formato: 'Formato agosto: 2-3 series, parando 4-5 repeticiones antes del fallo. Nunca al fallo.',
    ejercicios: [
      { id: 'M1', nombre: 'Peso muerto rumano con mancuernas', series: '2-3 × 8-12',
        como: 'De pie, mancuernas a los lados. Lleva la cadera atrás manteniendo la espalda larga y las rodillas casi rectas. Baja hasta notar tensión en los isquiotibiales y vuelve empujando la cadera adelante.',
        aviso: 'Mancuernas a los lados del cuerpo, no delante. Mirada al suelo a 2 metros, nunca al frente: mirar al frente extiende el cuello.' },
      { id: 'M2', nombre: 'Remo a una mano con apoyo en banco o silla', series: '2-3 × 8-12 por lado',
        como: 'Apoya una mano y la rodilla del mismo lado en el banco. El tronco queda paralelo al suelo. Deja colgar la mancuerna, baja primero la escápula y luego lleva el codo hacia la cadera.',
        aviso: 'El mejor ejercicio del plan. Apoya mano y rodilla, cabeza en línea con la columna mirando al suelo. Baja la escápula antes de tirar con el codo.' },
      { id: 'M3', nombre: 'Split squat con mancuernas colgando a los lados', series: '2-3 × 8-10 por pierna',
        como: 'Un pie delante y otro detrás, separados un paso largo. Baja vertical hasta que la rodilla de atrás casi toca el suelo. Sube empujando con el talón delantero.',
        aviso: 'La carga cuelga: cero compresión sobre el cuello. Semanas 1-2, mano libre apoyada en la pared.' },
      { id: 'M4', nombre: 'Floor press con mancuernas', series: '2-3 × 8-12',
        como: 'Tumbado boca arriba con las rodillas dobladas. Baja las mancuernas hasta que los tríceps tocan el suelo, haz una pausa breve y empuja arriba.',
        aviso: 'Tumbado en el suelo. La cabeza apoyada en todo momento. Es el sustituto de la flexión.' },
      { id: 'M5', nombre: 'Hip thrust con mancuerna', series: '2 × 10-15',
        como: 'Espalda alta apoyada en un sofá o banco, mancuerna sobre la cadera. Sube hasta alinear tronco y muslos apretando el glúteo arriba un segundo.',
        aviso: 'Barbilla metida, mirada a las rodillas. No dejes caer la cabeza hacia atrás en el apoyo.' },
      { id: 'M6', nombre: 'Paseo del granjero con kettlebell', series: '3 × 30 m',
        como: 'Camina con la carga colgando, pasos cortos y controlados, abdomen firme, sin balancear el tronco.',
        aviso: 'En agosto, peso repartido en ambas manos. Hombros abajo, nuca larga, sin inclinarte.' }
    ]
  },
  P1: {
    nombre: 'Sesión P1 — pueblo, tirón y escapular (solo bandas)',
    formato: '2 series por ejercicio. Control en cada repetición, sin buscar el fallo.',
    ejercicios: [
      { id: 'P1.1', nombre: 'Remo con banda sentado', series: '2 × 10-14',
        como: 'Sentado en el suelo con la banda anclada al frente o pasada por los pies. Tira llevando los codos hacia atrás y junta las escápulas. Vuelve despacio.',
        aviso: 'Codos pegados al cuerpo. Aprieta 1 segundo al final de cada repetición.' },
      { id: 'P1.2', nombre: 'Jalón con banda anclada arriba', series: '2 × 10-14',
        como: 'Banda anclada por encima de la cabeza. De rodillas o sentado, tira hacia abajo hasta la altura del pecho manteniendo el tronco quieto.',
        aviso: 'Inicia bajando la escápula, luego tiran los codos. No tires del cuello hacia delante.' },
      { id: 'P1.3', nombre: 'Prone Y de pie con banda (brazos en V ascendente)', series: '2 × 10-12',
        como: 'Banda baja anclada al suelo. Sube los brazos rectos en diagonal formando una Y, con los pulgares hacia arriba, sin encoger los hombros.',
        aviso: 'Trapecio inferior. Si tienes que encoger el hombro para subir, la banda tiene demasiada tensión. Sin peso añadido en todo agosto.' },
      { id: 'P1.4', nombre: 'Face pull con banda a la altura de la cara', series: '2 × 12-15',
        como: 'Banda anclada a la altura de la cara. Tira separando las manos hacia las sienes y termina girando los antebrazos hacia atrás.',
        aviso: 'Codos altos pero sin encoger los hombros. Termina con rotación externa.' },
      { id: 'P1.5', nombre: 'Serratus wall slide con toalla o rodillo', series: '2 × 8-10',
        como: 'Antebrazos sobre una toalla contra la pared. Desliza hacia arriba manteniendo el contacto y, arriba del todo, empuja alejando el pecho de la pared.',
        aviso: 'Al llegar arriba, empuja alejando el pecho de la pared. Esa protracción final es el serrato.' },
      { id: 'P1.6', nombre: 'Remo invertido bajo una mesa robusta', series: '2 × 8-12',
        como: 'Túmbate bajo la mesa, agarra el borde y tira del pecho hacia arriba con el cuerpo recto como una tabla.',
        aviso: 'Cuanto más vertical el cuerpo, más fácil. Progresas bajando el ángulo, no añadiendo peso.' },
      { id: 'P1.7', nombre: 'Dead bug', series: '2 × 8 por lado',
        como: 'Boca arriba, brazos al techo y caderas y rodillas a 90°. Estira a la vez un brazo y la pierna contraria sin despegar la lumbar del suelo.',
        aviso: 'Sustituto de la plancha. Cabeza apoyada en el suelo, lumbar pegada.' }
    ]
  },
  P2: {
    nombre: 'Sesión P2 — pueblo, empuje, pierna y transporte',
    formato: '2 series por ejercicio. Control en cada repetición, sin buscar el fallo.',
    ejercicios: [
      { id: 'P2.1', nombre: 'Floor press con banda (banda por detrás de la espalda)', series: '2 × 10-14',
        como: 'Tumbado boca arriba con la banda pasada por detrás de la espalda y los extremos en las manos. Empuja arriba y baja hasta que los tríceps tocan el suelo.',
        aviso: 'Cabeza apoyada en el suelo.' },
      { id: 'P2.2', nombre: 'Press unilateral con banda, sentado o inclinado', series: '2 × 10 por lado',
        como: 'Banda anclada detrás a la altura del pecho. Empuja al frente con un brazo manteniendo el tronco firme y sin rotar.',
        aviso: 'Nada de press por encima de la cabeza durante estas semanas.' },
      { id: 'P2.3', nombre: 'Split squat búlgaro, pie de atrás en una silla', series: '2 × 8-10 por pierna',
        como: 'Empeine de atrás sobre la silla, pie delantero a un paso largo. Baja vertical y sube con el talón delantero.',
        aviso: 'Empieza sin carga. Cuando progreses, garrafas de agua colgando de las manos.' },
      { id: 'P2.4', nombre: 'Puente de glúteo a una pierna', series: '2 × 10 por lado',
        como: 'Boca arriba, un pie apoyado y la otra pierna estirada o con la rodilla al pecho. Sube la cadera apretando el glúteo del lado que apoya.',
        aviso: 'Barbilla metida.' },
      { id: 'P2.5', nombre: 'Push-up plus en encimera', series: '2 × 12',
        como: 'Manos en la encimera, cuerpo recto. Baja el pecho, sube, y al final empuja separando las escápulas.',
        aviso: 'Al final, empuja separando las escápulas sin doblar más los codos. Ese es el "plus".' },
      { id: 'P2.6', nombre: 'Pallof press con banda', series: '2 × 8 por lado',
        como: 'De pie, banda anclada a un lado a la altura del pecho. Lleva las manos al frente resistiendo la rotación y vuelve al pecho.',
        aviso: 'Antirrotación de pie. Sustituto de la plancha sin carga cervical.' },
      { id: 'P2.7', nombre: 'Paseo del granjero con garrafas de agua', series: '2 × 30 m',
        como: 'Camina con una garrafa en cada mano, pasos cortos, abdomen firme y hombros bajos.',
        aviso: 'Hombros abajo, nuca larga. Nunca con mochila puesta: las correas tiran de los hombros hacia delante.' },
      { id: 'P2.8', nombre: 'Bird dog', series: '2 × 8 por lado',
        como: 'A cuatro patas, estira a la vez un brazo y la pierna contraria sin que se mueva la cadera. Vuelve despacio.',
        aviso: 'Mirada al suelo, nuca larga. No levantes la cabeza.' }
    ]
  }
};

/* --- Piscina ---------------------------------------------- */
const PISCINA_AVISOS = [
  'Sin tubo frontal no se hace crol. Ese día se nada solo a espalda. Nadar a crol atado sin tubo obliga a rotar el cuello en cada respiración contra resistencia constante.',
  'En crol: mirada al fondo, no al frente. Estás atado, no hace falta comprobar si sigues en el sitio.',
  'En espalda: barbilla ligeramente metida, orejas dentro del agua. No eches la cabeza hacia atrás.',
  'Braza: nunca. Mantiene el cuello en extensión todo el ciclo.',
  'Si notas quemazón en la base del cuello o en los trapecios, se acaba el intervalo.'
];

const PISCINA_BLOQUES = {
  marcha: {
    nombre: 'Marcha acuática (calentamiento, 5 min)',
    detalle: 'Andar adelante 4 × 7 m · andar hacia atrás 4 × 7 m · lateral 2 × 7 m por lado · rodillas altas 2 × 7 m.'
  },
  escapular: {
    nombre: 'Escapular acuático (agua al pecho, 5 min)',
    detalle: 'Aperturas invertidas 15 · tirón en "W" 15 · empuje al frente alejando el pecho 15 · sculling 30 s · círculos de hombro lentos 10 por sentido.'
  },
  descompresion: {
    nombre: 'Descompresión (final de toda sesión de agua, 3-4 min)',
    detalle: 'Flotar boca arriba con un churro bajo el cuello y otro bajo las rodillas, cuerpo suelto, respiración nasal con la exhalación el doble de larga que la inhalación.'
  }
};

/* Progresión del nado atado, por lunes de la semana */
const NADO_ATADO = {
  '2026-08-03': { series: '5 × 90 s', descanso: '60 s', reparto: '3 espalda / 2 crol con tubo' },
  '2026-08-10': { series: '5 × 90 s', descanso: '60 s', reparto: '3 espalda / 2 crol con tubo' },
  '2026-08-17': { series: '6 × 2 min', descanso: '60 s', reparto: '4 espalda / 2 crol' },
  '2026-08-24': { series: '6 × 3 min', descanso: '60 s', reparto: '3 espalda / 3 crol' },
  '2026-08-31': { series: '5 × 4 min', descanso: '60 s', reparto: '3 espalda / 2 crol, uno a ritmo alto' }
};

/* --- Flexión craneocervical -------------------------------- */
const CERVICAL = {
  titulo: 'Flexión craneocervical',
  cuando: 'Todos los días, al despertar, antes de levantarte.',
  como: [
    'Tumbado boca arriba, rodillas dobladas, una toalla doblada bajo la cabeza para que el cuello quede neutro.',
    'El movimiento es un asentimiento muy pequeño: la barbilla se desliza suavemente hacia el cuello alargando la nuca.',
    'No levantes la cabeza del apoyo. No metas la barbilla con fuerza.',
    'Coloca dos dedos a los lados del cuello: si notas los músculos marcarse como cuerdas, es demasiado.'
  ],
  niveles: [
    { nivel: 1, aguante: '5 s', reps: '10 repeticiones', semanas: 'Semanas 1-2' },
    { nivel: 2, aguante: '10 s', reps: '10 repeticiones', semanas: 'Semanas 3-4' }
  ],
  descanso: 'Descanso de 5-10 s entre repeticiones.',
  subir: 'Se sube de nivel solo si completas las 10 repeticiones sin activación visible del músculo del frente del cuello, en dos sesiones consecutivas.',
  isometrico: {
    desde: '2026-08-24',
    texto: 'Isométrico suave sentado: mano en la frente / sien derecha / sien izquierda / nuca, empujando al 10-20% de tu fuerza, 5 s cada dirección, 3 rondas.'
  }
};

/* --- Movilidad en microdosis ------------------------------- */
const MOVILIDAD = {
  intro: '3 bloques de 2-3 min al día.',
  menus: [
    { nombre: 'Menú A (suelo, mañana y noche)', items: [
      'Extensión torácica sobre rodillo o toalla enrollada: 8 respiraciones por segmento, 3 segmentos',
      'Apertura en libro tumbado de lado: 8 por lado, lento',
      'Gato-camello a cuatro patas: 10 ciclos',
      'Respiración diafragmática nasal, mano en el abdomen: 10 respiraciones, exhalación el doble de larga'
    ]},
    { nombre: 'Menú B (de pie, sirve vestido y en cualquier sitio)', items: [
      'Retracción cervical contra la pared: 10 × 3 s',
      'Rotación cervical activa lenta, nuca larga: 8 por lado',
      'Inclinación lateral con tracción muy suave de la mano: 30 s por lado',
      'Deslizamiento escapular en pared, brazos de W a Y: 10 reps',
      'Extensión torácica en silla, manos en la nuca: 8 reps'
    ]}
  ]
};

/* --- Protocolos (texto literal) ---------------------------- */
const PROTOCOLOS = {
  roto: {
    id: 'roto',
    titulo: 'Protocolo del día roto',
    tipo: 'lista',
    items: [
      'Registro el día como está, incluidos los ceros.',
      'Escribo una línea con qué pasó. Sin adjetivos, sin juicio.',
      'Miro si era evitable. La mayoría no lo son.',
      'Decido ahora la hora exacta de mañana. No "mañana lo hago": "mañana a las 8:15 salgo a caminar".',
      'Cierro el tema.'
    ]
  },
  reglas: {
    id: 'reglas',
    titulo: 'Las siete reglas',
    tipo: 'lista',
    items: [
      'Nunca dos días seguidos.',
      'Nunca compensar.',
      'El suelo mínimo cuenta como cumplido.',
      'El registro no tiene día libre.',
      '5/7 es el objetivo, no 7/7.',
      'Bajar un nivel, nunca a cero.',
      'La crisis de noviembre está en el calendario desde agosto.'
    ]
  },
  brote: {
    id: 'brote',
    titulo: 'Protocolo de brote de dolor',
    subtitulo: 'Basal declarado: 6/10',
    tipo: 'bloques',
    bloques: [
      { cabecera: 'Sube ≤2 puntos y vuelve en menos de 24 h',
        texto: 'No cambies nada. Es normal y esperable.' },
      { cabecera: 'Sube >2 puntos y persiste 24-48 h',
        texto: 'Sigue entrenando, pero reduce la carga un 30-40%, sustituye 2 sesiones el ejercicio sospechoso, y duplica movilidad y cervicales. No pares.' },
      { cabecera: 'Persiste más de 48 h, o supera 8/10',
        texto: 'Baja al suelo mínimo 3-5 días, anota qué cambió esa semana, contacta con el fisio. Reincorpora un ejercicio por sesión al 60%.' }
    ],
    banderas: {
      titulo: 'Banderas rojas — para y consulta el mismo día',
      items: [
        'Hormigueo o pérdida de fuerza en brazo o mano',
        'Mareo o vértigo al mover el cuello',
        'Alteraciones visuales',
        'Dificultad para tragar',
        'Cefalea de inicio brusco distinta a las habituales'
      ]
    }
  },
  suelo: {
    id: 'suelo',
    titulo: 'El suelo mínimo',
    tipo: 'texto',
    texto: 'Caminata 20 min + una ronda de flexión craneocervical + un bloque de movilidad. 27 minutos. Cuenta como día cumplido.'
  }
};
