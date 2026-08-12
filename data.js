/* ============================================================
   data.js — TODO EL CONTENIDO EDITABLE DEL PLAN
   Ejercicios, textos, protocolos, calendario y material.
   Puedes tocar este archivo sin entender app.js.
   ============================================================ */

/* --- Versión de la app (se muestra en Ajustes) -------------- */
const VERSION = 'v3';
const VERSION_FECHA = '12 ago 2026';

const CHANGELOG = [
  { v:'v3', fecha:'2026-08-12', cambios:[
    'Pantalla Plan con el día entero, no solo la sesión',
    'Inventario de material y sustituciones automáticas',
    'Los 21 ejercicios explicados a fondo, con errores y señal',
    'Mover sesiones de día sin romper la cuota semanal',
    'Botón para actualizar la app desde el móvil',
    'El suelo mínimo ya cuenta como día cumplido'
  ]}
];

/* --- Rango del plan --------------------------------------- */
const PLAN = {
  inicio: '2026-08-07',
  fin: '2026-09-04',
  hitos: {
    '2026-08-07': 'Montaje: basal, comprar tubo frontal, poner fechas en el calendario',
    '2026-08-08': 'Probar el arnés sin cronómetro. Solo estás aprendiendo el aparato',
    '2026-08-24': 'Desde hoy: añade el isométrico suave después de la flexión craneocervical',
    '2026-08-31': 'Última semana del bloque: puedes subir a 3 series en M1-M4',
    '2026-09-01': 'Rediseño del horario de curso escolar',
    '2026-09-04': 'REVISIÓN — perímetros, fotos, prendas, tests'
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

/* --- Plantilla semanal por defecto (0=domingo … 6=sábado) ---
   La M va el viernes por defecto, pero se mueve al día que
   estés en Madrid: es la única sesión que necesita mancuernas. */
const SEMANA_TIPO = {
  1: { fuerza: 'P1', piscina: 'regenerativa' },  // lunes
  2: { fuerza: null, piscina: 'larga' },         // martes
  3: { fuerza: 'P2', piscina: 'regenerativa' },  // miércoles
  4: { fuerza: null, piscina: 'larga' },         // jueves
  5: { fuerza: 'M',  piscina: 'regenerativa' },  // viernes (día de Madrid por defecto)
  6: { fuerza: null, piscina: 'regenerativa' },  // sábado: piscina libre
  0: { fuerza: null, piscina: null }             // domingo: descanso
};

/* Días 7, 8 y 9: montaje, no entrenamiento */
const SEMANA_ARRANQUE = {
  '2026-08-07': { fuerza: null, piscina: null },
  '2026-08-08': { fuerza: null, piscina: 'regenerativa' },
  '2026-08-09': { fuerza: null, piscina: null }
};

/* --- Inventario de material -------------------------------- */
const MATERIAL = [
  { grupo: 'Madrid', items: [
    { key:'mancuernas', nombre:'Mancuernas' },
    { key:'kettlebell', nombre:'Kettlebell' },
    { key:'banco',      nombre:'Banco' },
    { key:'anclaje_puerta', nombre:'Anclaje de puerta' }
  ]},
  { grupo: 'Pueblo', items: [
    { key:'bandas',       nombre:'Bandas', nota:'¿Cuántas y de qué dureza?' },
    { key:'anclaje_bajo', nombre:'Anclaje bajo (puerta, pie)' },
    { key:'anclaje_alto', nombre:'Anclaje alto' },
    { key:'mesa',         nombre:'Mesa robusta' },
    { key:'silla',        nombre:'Silla firme' },
    { key:'encimera',     nombre:'Encimera' },
    { key:'garrafas',     nombre:'Garrafas de agua' },
    { key:'piscina',      nombre:'Piscina' },
    { key:'arnes',        nombre:'Arnés de nado' },
    { key:'tubo',         nombre:'Tubo frontal' },
    { key:'churro',       nombre:'Churro' },
    { key:'cinturon',     nombre:'Cinturón de flotación' }
  ]},
  { grupo: 'Siempre', items: [
    { key:'toalla', nombre:'Toalla' },
    { key:'pared',  nombre:'Pared' },
    { key:'suelo',  nombre:'Suelo' }
  ]}
];
/* Lo que se da por hecho aunque no lo marques */
const MATERIAL_POR_DEFECTO = ['toalla','pared','suelo','silla'];
const MATERIAL_NOMBRES = {};
MATERIAL.forEach(g => g.items.forEach(i => { MATERIAL_NOMBRES[i.key] = i.nombre.toLowerCase(); }));

/* --- Caminata ---------------------------------------------- */
const CAMINATA = {
  progresion: { '2026-08-10':30, '2026-08-17':35, '2026-08-24':40, '2026-08-31':45 },
  minimo: 20,
  suelo: 10,
  ventanas: ['7:30 – 9:30', 'después de las 21:30'],
  porque: 'Es el hábito que tiene que estar automatizado el 7 de septiembre, cuando ya no haya piscina ni vacaciones. Por eso se hace también los días de piscina, aunque parezca redundante.',
  calor: 'Madrid en agosto tiene más de 10 horas por encima de 35°. Las horas centrales no existen para esto. Si fallan las dos ventanas, el plan B es interior: centro comercial, metro con transbordos a pie, o 40 min de cinta o bici estática. El plan B vale. Saltarse el día, no.',
  como: [
    'Ritmo vivo pero conversacional: podrías hablar, no cantar.',
    'Nuca larga y mirada al frente. Si vas mirando el móvil, la caminata deja de ser neutra para tu cuello y pasa a sumar carga.',
    'Botella de agua encima. La deshidratación leve es un disparador conocido de cefalea.',
    'Si llevas mochila: ajustada corta y alta, pegada a la espalda, con el cinturón de cadera abrochado.'
  ]
};

/* --- Progresión con bandas (P1 y P2) ------------------------ */
const PROGRESION_BANDA = {
  montaje: 'Marca tres posiciones en el suelo con cinta adhesiva, a 20 cm una de otra. Cuanto más lejos del anclaje, más tensión. Anota siempre banda + posición.',
  escalones: [
    'Sube repeticiones hasta el tope del rango con la misma banda y la misma marca.',
    'Retrocede una marca de cinta y vuelve al principio del rango.',
    'Cuando ya estés en la marca más lejana y en el tope del rango: banda más dura.'
  ],
  escapulares: 'En los escapulares (prone Y, face pull, serratus) hay un escalón intermedio antes de subir tensión: aguanta 2 segundos en la posición final de cada repetición.'
};

/* --- Las garrafas (cabecera de P2) -------------------------- */
const GARRAFAS = {
  titulo: 'Las garrafas',
  texto: 'Dos garrafas de 8 litros son 16 kg colgando de las manos: más de lo que mueve mucha gente en el gimnasio. Se progresa llenándolas más o menos, así que tienes toda una escala de peso en la cocina.',
  regla: 'Todo lo que se cargue en el pueblo va colgando de las manos, nunca en mochila puesta. Las correas de la mochila tiran de los hombros hacia delante, que es justo el patrón que estamos corrigiendo.'
};

/* --- Formato de las sesiones, por semana -------------------- */
const FORMATO_SEMANA = {
  '2026-08-03': '2 series, RIR 4-5. Deliberadamente fácil: el objetivo es que las sesiones ocurran, no el estímulo.',
  '2026-08-10': '2 series, RIR 4-5. Deliberadamente fácil: el objetivo es que las sesiones ocurran, no el estímulo.',
  '2026-08-17': '2 series, RIR 4-5. Deliberadamente fácil: el objetivo es que las sesiones ocurran, no el estímulo.',
  '2026-08-24': '2 series, RIR 4-5. Deliberadamente fácil: el objetivo es que las sesiones ocurran, no el estímulo.',
  '2026-08-31': 'Puedes subir a 3 series en M1-M4 si las tres semanas anteriores han ido limpias.'
};
const FORMATO_POR_DEFECTO = '2 series, parando 4-5 repeticiones antes del fallo. Nunca al fallo.';

/* --- Bloques del día, en orden cronológico ------------------
   Las horas son sugerencias, no obligaciones. */
const BLOQUES_DIA = [
  { id:'BL-cervical', hora:'Al despertar', dur:'4 min',    tipo:'cervical', titulo:'Flexión craneocervical' },
  { id:'BL-caminata', hora:'8:00',         dur:'',         tipo:'caminata', titulo:'Caminata' },
  { id:'BL-fuerza',   hora:'9:30',         dur:'40-50 min',tipo:'fuerza',   titulo:'Sesión de fuerza' },
  { id:'BL-mov1',     hora:'~12:00',       dur:'2-3 min',  tipo:'movilidad',titulo:'Movilidad · bloque 1', menu:0 },
  { id:'BL-mov2',     hora:'~17:30',       dur:'2-3 min',  tipo:'movilidad',titulo:'Movilidad · bloque 2', menu:1 },
  { id:'BL-piscina',  hora:'19:30',        dur:'',         tipo:'piscina',  titulo:'Piscina' },
  { id:'BL-mov3',     hora:'22:30',        dur:'2-3 min',  tipo:'movilidad',titulo:'Movilidad · bloque 3 + registro del día', menu:0 }
];

/* --- Sesiones de fuerza ------------------------------------ */
const SESIONES = {

  M: {
    nombre: 'Sesión M — mancuernas y kettlebell',
    ubicacion: 'Madrid',
    ejercicios: [

      { id:'M1', nombre:'Peso muerto rumano con mancuernas', series:'2-3 × 8-12',
        unidad:'mancuerna', material:['mancuernas'],
        que:'Cadena posterior: isquiotibiales y glúteo. Además es el ejercicio que enseña a tu espalda a moverse desde la cadera en vez de desde las lumbares, y te obliga a mantener la posición de cuello que quieres para todo lo demás.',
        montaje:'De pie, una mancuerna a cada lado del cuerpo (no delante). Pies a la anchura de la cadera. Rodillas casi rectas, sin bloquear.',
        pasos:[
          'Antes de empezar, elige un punto del suelo a unos dos metros por delante y no lo sueltes con la mirada en toda la serie. La cabeza acompaña a la columna: cuando el tronco baja, la mirada baja con él. Mirar al frente aquí te extiende el cuello con carga en las manos.',
          'Lleva la cadera hacia atrás, como si cerraras un cajón con el culo. Las mancuernas bajan rozando las piernas.',
          'Baja hasta que notes tirar en la parte de atrás del muslo, normalmente a media espinilla. Ahí se para, aunque puedas seguir.',
          'Sube empujando la cadera hacia delante y apretando el glúteo arriba. No eches los hombros hacia atrás al final.'
        ],
        respiracion:'Inhala arriba, mantén el aire durante la bajada, exhala al subir. Por la nariz.',
        errores:[
          'Mirar al frente. Es el error que más te va a costar quitar y el más caro para tu cuello: extensión cervical sostenida con peso colgando.',
          'Doblar las rodillas hasta convertirlo en una sentadilla. Es una bisagra de cadera; las rodillas casi no se mueven.',
          'Redondear la zona baja de la espalda en el último tramo. Ahí termina el recorrido, no se busca más.',
          'Separar las mancuernas del cuerpo: te obliga a compensar con la espalda alta y los hombros.'
        ],
        senal:'Se nota en la parte de atrás del muslo, y al día siguiente ahí. Si lo notas en la zona lumbar baja, has bajado de más o has redondeado.',
        siduele:'Si el cuello se enciende: baja el peso a la mitad y reduce el recorrido a media bajada durante dos sesiones. Antes de nada comprueba la mirada, que es la causa nueve de cada diez veces.',
        alternativa:'Sin mancuernas: peso muerto rumano a una pierna sin carga, con la mano libre apoyada en la pared, 2×8 por lado bajando en tres segundos.'
      },

      { id:'M2', nombre:'Remo a una mano con apoyo', series:'2-3 × 8-12 por lado',
        unidad:'mancuerna', material:['mancuernas','banco'],
        que:'El mejor ejercicio del plan para ti. Trabaja dorsal y espalda media, que es la musculatura que sostiene la posición de tu cuello durante las otras quince horas del día.',
        montaje:'Mano y rodilla del mismo lado apoyadas en el banco o en una silla firme. El otro pie en el suelo, un paso atrás. Tronco paralelo al suelo.',
        pasos:[
          'Coloca la cabeza en línea con la columna, mirando al suelo justo debajo de la cara. No mires hacia delante: en esta posición, levantar la vista es extender el cuello con la espalda horizontal.',
          'Deja colgar la mancuerna con el brazo estirado y el hombro suelto hacia abajo.',
          'Primero baja la escápula: llévala hacia la cadera del lado contrario, sin doblar todavía el codo. Ese medio segundo es el ejercicio de verdad.',
          'Ahora lleva el codo hacia la cadera, pegado al cuerpo, y aprieta un segundo arriba.',
          'Baja en tres segundos hasta estirar el brazo del todo y dejar que la escápula se suelte.'
        ],
        respiracion:'Exhala al tirar, inhala al bajar. Por la nariz.',
        errores:[
          'Empezar tirando con el brazo: entonces el trabajo se lo lleva el bíceps y el trapecio superior, que es el que te duele.',
          'Rotar el tronco para subir más la mancuerna.',
          'Levantar la cabeza para mirar al frente o al espejo.',
          'Encoger el hombro hacia la oreja al final del tirón.'
        ],
        senal:'Se nota entre la escápula y la columna, y en el costado bajo la axila. Si lo notas en el cuello o arriba del trapecio, estás tirando con el hombro encogido.',
        siduele:'Reduce el peso un 30% y haz dos sesiones centrándote solo en bajar la escápula antes de tirar. No lo elimines: es el ejercicio que más te conviene de todo el plan.',
        alternativa:'Sin material: pasa una toalla por el pomo de una puerta cerrada, agárrala con una mano y tira llevando el codo a la cadera, aguantando 5 segundos por repetición. 2×8 por lado.'
      },

      { id:'M3', nombre:'Split squat con mancuernas colgando', series:'2-3 × 8-10 por pierna',
        unidad:'mancuerna', material:['mancuernas'],
        que:'Pierna con la carga colgando de las manos. Cero compresión sobre la columna y el cuello: por eso en este plan no hay sentadilla con barra a la espalda.',
        montaje:'Un pie delante y otro detrás, separados un paso largo. Una mancuerna en cada mano, colgando a los lados. Semanas 1 y 2, sin carga y con la mano libre en la pared.',
        pasos:[
          'Mirada a un punto fijo a tres o cuatro metros, a la altura de los ojos, con la nuca larga. Ni al techo ni a los pies.',
          'Baja vertical, como si el cuerpo corriera por un raíl, hasta que la rodilla de atrás casi toque el suelo.',
          'El peso del pie delantero repartido entre talón y planta, no en la punta.',
          'Sube empujando con el talón delantero, sin dar un tirón con el tronco.'
        ],
        respiracion:'Inhala al bajar, exhala al subir.',
        errores:[
          'Paso demasiado corto: la rodilla delantera se va muy adelante y la de atrás no llega abajo.',
          'Inclinar el tronco al frente para no perder el equilibrio. Si pasa, agárrate a la pared y baja carga.',
          'Mirar al suelo justo delante de los pies: hunde la cabeza y con ella el cuello.',
          'Rebotar abajo en vez de parar y subir.'
        ],
        senal:'Se nota en el glúteo y el cuádriceps de la pierna de delante. Si solo lo notas en la rodilla, el paso es corto.',
        siduele:'Si molesta la rodilla, alarga el paso y reduce el recorrido a la mitad. Si molesta el cuello, es que estás agarrando las mancuernas con los hombros encogidos: suelta los hombros y baja peso.',
        alternativa:'Sin mancuernas: la misma zancada sin carga con una mano en la pared, 2×12 por pierna, bajando en tres segundos.'
      },

      { id:'M4', nombre:'Floor press con mancuernas', series:'2-3 × 8-12',
        unidad:'mancuerna', material:['mancuernas'],
        que:'Empuje horizontal con la cabeza apoyada todo el rato y el recorrido limitado por el suelo. Es el sustituto de la flexión y del press de banca, que te dejan el cuello colgando o metido contra el banco.',
        montaje:'Tumbado boca arriba en el suelo, rodillas dobladas, pies apoyados. Una mancuerna en cada mano, brazos estirados hacia el techo.',
        pasos:[
          'La cabeza apoyada en el suelo de principio a fin. No la levantes para mirarte las manos ni para comprobar si bajas recto: si no lo ves, no pasa nada.',
          'Baja los codos hacia el suelo, a unos 45° del cuerpo, no abiertos del todo.',
          'Cuando los tríceps toquen el suelo, para medio segundo. Ese es el punto en que se corta el recorrido.',
          'Empuja hacia arriba sin bloquear los codos de golpe.'
        ],
        respiracion:'Inhala al bajar, exhala al empujar.',
        errores:[
          'Levantar la cabeza del suelo. Es el error que convierte un ejercicio seguro en uno que te da cefalea.',
          'Abrir los codos a 90°: castiga el hombro sin dar nada a cambio.',
          'Arquear la zona lumbar para empujar más.',
          'Juntar las mancuernas arriba chocándolas.'
        ],
        senal:'Se nota en el pecho y el tríceps. Si notas tirón en la parte delantera del hombro, los codos están demasiado abiertos.',
        siduele:'Baja el peso y reduce a un recorrido de medio camino durante dos sesiones. Comprueba que la cabeza no se despega.',
        alternativa:'Sin mancuernas: push-up plus en la encimera o contra la pared, 2×12, cuanto más vertical más fácil.'
      },

      { id:'M5', nombre:'Hip thrust con mancuerna', series:'2 × 10-15',
        unidad:'mancuerna', material:['mancuernas','banco'],
        que:'Glúteo con la columna en horizontal y sin carga axial. El único riesgo aquí es el cuello: al empujar fuerte la cadera se tiende a echar la cabeza hacia atrás contra el apoyo.',
        montaje:'Espalda alta apoyada en el borde de un sofá o un banco, justo bajo los omóplatos. Pies separados a la anchura de la cadera. Mancuerna sobre el pliegue de la cadera, sujeta con las dos manos.',
        pasos:[
          'Barbilla ligeramente metida y mirada fija en las rodillas durante todo el movimiento. Si acabas mirando al techo, has echado la cabeza atrás: para la serie.',
          'Sube la cadera hasta que tronco y muslos formen una línea, no más.',
          'Aprieta el glúteo un segundo arriba, sin arquear la lumbar para ganar altura.',
          'Baja controlando, sin dejar caer el peso.'
        ],
        respiracion:'Exhala al subir, inhala al bajar.',
        errores:[
          'Dejar caer la cabeza hacia atrás en el apoyo. Es el error de este ejercicio.',
          'Buscar más altura arqueando la espalda baja en vez de apretando el glúteo.',
          'Apoyar la espalda demasiado alta, a la altura del cuello.',
          'Pies demasiado cerca del cuerpo: entonces trabaja el cuádriceps.'
        ],
        senal:'Se nota en el glúteo, arriba y en el centro. Si lo notas en la zona lumbar, estás arqueando.',
        siduele:'Quita la mancuerna y hazlo a peso corporal dos sesiones, vigilando la barbilla. Si el cuello sigue, pasa al puente de glúteo en el suelo, donde la cabeza está apoyada.',
        alternativa:'Sin mancuerna ni banco: puente de glúteo a una pierna en el suelo, 2×10 por lado.'
      },

      { id:'M6', nombre:'Paseo del granjero con kettlebell', series:'3 × 30 m',
        unidad:'kettlebell', material:['kettlebell'],
        que:'Transporte cargado: el ejercicio que más se parece a la vida real. Enseña a llevar peso sin que los hombros se vayan hacia delante, que es exactamente el patrón que te carga el cuello cuando vuelves de la compra.',
        montaje:'En agosto, el peso repartido en las dos manos: dos cargas iguales, una a cada lado. Nada de paseo a una mano todavía.',
        pasos:[
          'Antes de andar: hombros abajo y ligeramente atrás, nuca larga, mirada al frente y al horizonte.',
          'No mires al suelo ni saques la barbilla. Si tienes que mirar dónde pisas, gira los ojos, no la cabeza.',
          'Pasos cortos y seguidos, abdomen firme, sin balancear el tronco.',
          'Si los hombros empiezan a subirse hacia las orejas, se acabó la serie aunque queden metros.'
        ],
        respiracion:'Respiración normal, nasal, sin aguantar el aire.',
        errores:[
          'Encoger los hombros hacia las orejas: es acumular tensión en el trapecio superior durante 30 metros seguidos.',
          'Inclinar el tronco hacia el lado de la carga.',
          'Ponerse una mochila cargada para aprovechar el paseo. Las correas tiran de los hombros hacia delante: es el patrón lesivo exacto que estamos corrigiendo.',
          'Pasos largos y rápidos, que obligan a compensar arriba.'
        ],
        senal:'Se nota en los antebrazos y en el abdomen, y al día siguiente en la espalda media. Si al terminar notas ardor en la base del cuello, el peso era demasiado.',
        siduele:'Baja el peso un 40% y haz 3 × 20 m. Si aun así aparece, cambia a caminar con las manos vacías y los hombros activamente bajos, dos sesiones, y vuelve a cargar después.',
        alternativa:'Sin kettlebell: dos garrafas de agua o dos bolsas de la compra bien cargadas, mismo recorrido y mismas reglas.'
      }
    ]
  },

  P1: {
    nombre: 'Sesión P1 — pueblo, tirón y escapular',
    ubicacion: 'Pueblo',
    banda: true,
    ejercicios: [

      { id:'P1.1', nombre:'Remo con banda sentado', series:'2 × 10-14',
        unidad:'banda', material:['bandas'],
        que:'El tirón horizontal de la sesión. Espalda media y romboides: los músculos que sostienen las escápulas donde deben estar y le quitan trabajo al trapecio superior.',
        montaje:'Sentado en el suelo con las piernas estiradas, la banda pasada por las plantas de los pies o anclada al frente a la altura del pecho. Un extremo en cada mano.',
        pasos:[
          'Siéntate alto, con el pecho abierto y la nuca larga. La mirada al frente, no al techo.',
          'Empieza bajando y juntando las escápulas, antes de doblar los codos.',
          'Tira llevando los codos hacia atrás pegados al cuerpo, hasta que las manos lleguen al abdomen.',
          'Aprieta un segundo al final de cada repetición y vuelve en tres segundos.'
        ],
        respiracion:'Exhala al tirar, inhala al volver.',
        errores:[
          'Echar el tronco hacia atrás para ayudarse: el remo lo hacen los brazos y la espalda, no el balanceo.',
          'Abrir los codos hacia fuera, que sube el trabajo al trapecio superior.',
          'Encoger los hombros al tirar.',
          'Soltar de golpe en la vuelta.'
        ],
        senal:'Se nota entre las escápulas, a media espalda. Si lo notas arriba, junto al cuello, estás encogiendo los hombros.',
        siduele:'Baja una marca de cinta y haz dos sesiones a la mitad de recorrido, parando donde la escápula todavía manda.',
        alternativa:'Sin banda: remo isométrico con una toalla pasada por el pomo de una puerta cerrada, 8 repeticiones de 5 segundos.'
      },

      { id:'P1.2', nombre:'Jalón con banda anclada arriba', series:'2 × 10-14',
        unidad:'banda', material:['bandas','anclaje_alto'],
        que:'Tirón vertical. Trabaja el dorsal, que es el gran estabilizador de la espalda y el que permite que el hombro no compense con el cuello al bajar el brazo.',
        montaje:'Banda anclada por encima de la cabeza (marco de puerta, viga, rama). De rodillas o sentado justo debajo, un extremo en cada mano, brazos estirados arriba.',
        pasos:[
          'Nuca larga y mirada al frente. No adelantes la cabeza para acompañar el tirón: es el reflejo automático y el que hay que quitar.',
          'Inicia bajando la escápula, como si la metieras en el bolsillo trasero.',
          'Después tiran los codos hacia abajo y hacia el costado, hasta la altura del pecho.',
          'Vuelve arriba en tres segundos dejando que la escápula suba al final.'
        ],
        respiracion:'Exhala al bajar los codos, inhala al subir.',
        errores:[
          'Sacar la barbilla hacia delante mientras tiras. Es el error principal y el más cervical de la sesión.',
          'Arquear la espalda hacia atrás para ganar recorrido.',
          'Tirar solo con los brazos, sin mover la escápula.',
          'Tensión tan alta que la vuelta te arrastra.'
        ],
        senal:'Se nota en el costado, bajo la axila, y en la espalda media. Si notas la nuca o la base del cráneo, has adelantado la cabeza.',
        siduele:'Baja tensión y haz solo el primer tercio del recorrido (bajar la escápula, sin doblar el codo) durante dos sesiones.',
        alternativa:'Sin anclaje alto: túmbate boca arriba con la banda bajo el sofá y haz un pullover corto, o repite el remo sentado con más repeticiones.'
      },

      { id:'P1.3', nombre:'Prone Y de pie con banda', series:'2 × 10-12',
        unidad:'banda', material:['bandas','anclaje_bajo'],
        que:'Trapecio inferior. Es, con el remo, el ejercicio que de verdad trata tu cuello: cuando el trapecio inferior no trabaja, lo hace el superior, y ese es el que te duele.',
        montaje:'Ancla la banda a ras de suelo (bajo una puerta cerrada o pisándola con los dos pies). De pie, un paso por delante del anclaje, un extremo en cada mano, brazos colgando al frente, pulgares hacia arriba.',
        pasos:[
          'Antes de mover los brazos, desliza las escápulas hacia abajo y hacia dentro, como si te las metieras en los bolsillos traseros del pantalón contrario. Ese es el movimiento de verdad; los brazos solo lo acompañan.',
          'Manteniendo esa posición, sube los brazos rectos en diagonal hacia fuera, formando una Y, hasta unos 120°. No hasta arriba del todo.',
          'Aguanta un segundo arriba.',
          'Baja en tres segundos, controlando. La bajada importa más que la subida.'
        ],
        respiracion:'Exhala al subir, inhala al bajar. Por la nariz. Si te descubres apretando la mandíbula o aguantando el aire, la banda tiene demasiada tensión.',
        errores:[
          'Encoger el hombro hacia la oreja para llegar más arriba. Es el error principal y anula el ejercicio entero: si tienes que encogerlo, la banda tiene demasiada tensión.',
          'Subir demasiado alto: por encima de 120° entra el trapecio superior.',
          'Arquear la zona lumbar para ayudarte a subir.',
          'Ir rápido. Este ejercicio no se hace con impulso.'
        ],
        senal:'Lo estás haciendo bien si notas trabajo en la zona baja del omóplato, entre la columna y la escápula, a media espalda. Si lo notas arriba, en el trapecio o en el cuello, para y baja tensión.',
        siduele:'Si el cuello o el trapecio se encienden: reduce el recorrido a la mitad, baja una marca de cinta, y quédate ahí dos sesiones. No lo elimines: es de los que más te conviene.',
        alternativa:'Sin banda: túmbate boca abajo en un banco inclinado a 45° y haz el mismo movimiento solo con el peso del brazo. Si no hay banco, de pie inclinado hacia delante apoyando la frente en una pared acolchada.'
      },

      { id:'P1.4', nombre:'Face pull con banda', series:'2 × 12-15',
        unidad:'banda', material:['bandas','anclaje_alto'],
        que:'Rotadores externos del hombro y trapecio medio. Es el contrapeso directo de las horas de pantalla: deshace la posición de hombros adelantados y cabeza avanzada.',
        montaje:'Banda anclada a la altura de la cara. De pie, un paso atrás, un extremo en cada mano con los pulgares hacia atrás, brazos estirados al frente.',
        pasos:[
          'Nuca larga, barbilla ligeramente metida, mirada al anclaje. La cabeza no se mueve en todo el ejercicio.',
          'Tira separando las manos hacia las sienes, con los codos altos y abiertos.',
          'Al final, gira los antebrazos hacia atrás como si enseñaras los bíceps: esa rotación externa es la mitad del ejercicio.',
          'Vuelve despacio, sin que la banda te lleve.'
        ],
        respiracion:'Exhala al tirar, inhala al volver.',
        errores:[
          'Encoger los hombros al subir los codos. Codos altos, hombros bajos: parecen incompatibles y no lo son.',
          'Saltarse la rotación final y quedarse en un remo alto.',
          'Adelantar la cabeza para acercarse a las manos.',
          'Demasiada tensión, que impide terminar el giro.'
        ],
        senal:'Se nota en la parte de atrás del hombro y entre las escápulas. Si lo notas en el cuello, has encogido.',
        siduele:'Baja una marca y quédate solo con la rotación externa, sin tirón, dos sesiones.',
        alternativa:'Sin banda ni anclaje: tumbado boca abajo, brazos en cruz con los codos a 90°, gira los antebrazos hacia arriba sin despegar los codos. 2×12.'
      },

      { id:'P1.5', nombre:'Serratus wall slide con toalla', series:'2 × 8-10',
        unidad:'peso corporal', material:['toalla','pared'],
        que:'Serrato anterior, el músculo que pega la escápula a la caja torácica. Sin él, la escápula se despega y el cuello acaba haciendo de estabilizador.',
        montaje:'De pie frente a la pared, antebrazos apoyados sobre una toalla doblada, codos a la altura del pecho y separados a la anchura de los hombros.',
        pasos:[
          'Nuca larga y mirada a la pared, sin sacar la barbilla ni apoyar la frente.',
          'Desliza los antebrazos hacia arriba manteniendo el contacto con la toalla, sin encoger los hombros.',
          'Al llegar arriba del todo, empuja alejando el pecho de la pared: la espalda alta se redondea un poco. Esa protracción final es el serrato y es el objetivo del ejercicio.',
          'Baja despacio deshaciendo el camino.'
        ],
        respiracion:'Exhala al subir y al empujar, inhala al bajar.',
        errores:[
          'Saltarse el empujón final, que es exactamente el ejercicio.',
          'Encoger los hombros a mitad de la subida.',
          'Arquear la lumbar para llegar más arriba.',
          'Despegar los antebrazos de la toalla.'
        ],
        senal:'Se nota en el costado, por debajo y por delante de la axila, sobre las costillas. Si lo notas en el cuello, estás subiendo con el trapecio.',
        siduele:'Reduce el recorrido a la mitad y quédate solo con el empujón final, sin deslizar. Dos sesiones.',
        alternativa:'A cuatro patas: empuja el suelo separando las escápulas sin doblar los codos, 2×10.'
      },

      { id:'P1.6', nombre:'Remo invertido bajo una mesa', series:'2 × 8-12',
        unidad:'peso corporal', material:['mesa'],
        que:'El tirón más completo que puedes hacer sin material. Trabaja toda la espalda con el propio cuerpo y enseña a mantener la línea de la cabeza bajo carga.',
        montaje:'Túmbate boca arriba bajo una mesa robusta. Agarra el borde con las manos a la anchura de los hombros. Cuerpo recto como una tabla, talones apoyados.',
        pasos:[
          'Mete ligeramente la barbilla y mantén la cabeza en línea con el tronco. No la eches hacia atrás ni la adelantes para llegar antes al borde.',
          'Aprieta glúteo y abdomen para que el cuerpo suba de una pieza.',
          'Baja primero la escápula y luego tira hasta que el pecho llegue cerca del borde.',
          'Baja en tres segundos hasta estirar del todo.'
        ],
        respiracion:'Exhala al subir, inhala al bajar.',
        errores:[
          'Sacar la barbilla para que el cuello llegue antes que el pecho.',
          'Romper la línea del cuerpo por la cadera.',
          'Tirar solo con los brazos.',
          'Hacerlo demasiado horizontal el primer día: se progresa bajando el ángulo, no añadiendo peso.'
        ],
        senal:'Se nota en la espalda media y en el dorsal. Si el cuello se adelanta, lo notarás en la nuca al terminar.',
        siduele:'Ponte más vertical (pies más cerca del cuerpo) para que pese menos, o pasa al remo con banda dos sesiones.',
        alternativa:'Sin mesa: remo con banda sentado, o el remo con toalla en el pomo de la puerta, 2×10 por lado.'
      },

      { id:'P1.7', nombre:'Dead bug', series:'2 × 8 por lado',
        unidad:'peso corporal', material:['suelo'],
        que:'Control del centro con la cabeza apoyada. Es el sustituto de la plancha, que en tu caso es mala idea: la plancha obliga a sostener la cabeza en el aire durante un minuto.',
        montaje:'Boca arriba, brazos estirados hacia el techo, caderas y rodillas a 90°. La zona lumbar pegada al suelo.',
        pasos:[
          'La cabeza apoyada en el suelo todo el tiempo. No la levantes para mirarte la barriga ni las piernas.',
          'Estira a la vez un brazo hacia atrás y la pierna contraria hacia delante, despacio.',
          'Llega solo hasta donde puedas mantener la lumbar pegada al suelo. Ni un centímetro más.',
          'Vuelve al centro y cambia de lado.'
        ],
        respiracion:'Exhala al estirar, inhala al volver. Sin aguantar el aire.',
        errores:[
          'Despegar la lumbar del suelo: en cuanto pasa, el ejercicio ha terminado.',
          'Levantar la cabeza.',
          'Ir rápido, alternando como si pedalearas.',
          'Estirar la pierna hasta el suelo aunque la espalda se arquee.'
        ],
        senal:'Se nota en la parte baja del abdomen, a los lados. Si notas la lumbar, has perdido la posición.',
        siduele:'Reduce el recorrido: mueve solo el brazo, o solo la pierna, hasta que puedas mantener la lumbar pegada.',
        alternativa:'La misma posición moviendo solo las piernas, sin brazos, 2×10 por lado.'
      }
    ]
  },

  P2: {
    nombre: 'Sesión P2 — pueblo, empuje, pierna y transporte',
    ubicacion: 'Pueblo',
    banda: true,
    garrafas: true,
    ejercicios: [

      { id:'P2.1', nombre:'Floor press con banda', series:'2 × 10-14',
        unidad:'banda', material:['bandas','suelo'],
        que:'Empuje horizontal con la cabeza apoyada y el recorrido cortado por el suelo. La versión de pueblo del M4.',
        montaje:'Tumbado boca arriba con la banda pasada por detrás de la espalda alta y un extremo en cada mano, junto al pecho. Rodillas dobladas.',
        pasos:[
          'La cabeza apoyada en el suelo de principio a fin.',
          'Empuja hacia el techo llevando las manos ligeramente hacia dentro.',
          'Baja hasta que los tríceps toquen el suelo y para medio segundo.',
          'Vuelve a empujar sin rebotar.'
        ],
        respiracion:'Exhala al empujar, inhala al bajar.',
        errores:[
          'Levantar la cabeza para ver las manos.',
          'Dejar que la banda se escurra hacia el cuello: va por la espalda alta, por debajo de los omóplatos.',
          'Abrir los codos a 90°.',
          'Arquear la lumbar.'
        ],
        senal:'Pecho y tríceps. Si la banda te aprieta en las costillas, colócala un poco más abajo.',
        siduele:'Baja una marca de tensión y haz medio recorrido dos sesiones.',
        alternativa:'Sin banda: push-up plus en la encimera, 2×12.'
      },

      { id:'P2.2', nombre:'Press unilateral con banda', series:'2 × 10 por lado',
        unidad:'banda', material:['bandas','anclaje_bajo'],
        que:'Empuje a una mano con antirrotación: mientras un brazo empuja, todo el tronco tiene que resistirse a girar. Nada de press por encima de la cabeza durante estas semanas.',
        montaje:'Banda anclada detrás de ti a la altura del pecho. De pie o sentado, un extremo en la mano, esa mano junto al hombro.',
        pasos:[
          'Nuca larga, mirada al frente y fija. La cabeza no acompaña al brazo.',
          'Empuja al frente hasta estirar el brazo, sin que el tronco gire ni el hombro se adelante de golpe.',
          'Al final, deja que la escápula se separe un poco: ese último centímetro es serrato.',
          'Vuelve en tres segundos.'
        ],
        respiracion:'Exhala al empujar, inhala al volver.',
        errores:[
          'Rotar el tronco para ayudar al brazo.',
          'Subir la mano por encima del hombro: nada de press vertical estas semanas.',
          'Encoger el hombro al empujar.',
          'Inclinar la cabeza hacia el lado que trabaja.'
        ],
        senal:'Pecho, hombro delantero y costado del lado contrario, que es el que aguanta la rotación.',
        siduele:'Hazlo sentado en una silla con respaldo y baja tensión; así el tronco no tiene que estabilizar.',
        alternativa:'Sin banda: push-up plus a una mano en la encimera, con la otra mano apoyada, 2×8 por lado.'
      },

      { id:'P2.3', nombre:'Split squat búlgaro', series:'2 × 8-10 por pierna',
        unidad:'peso corporal', material:['silla'],
        que:'La pierna más exigente del plan sin cargar nada sobre la columna. El pie de atrás elevado obliga a la de delante a trabajar sola.',
        montaje:'Empeine del pie de atrás sobre el asiento de una silla. El pie de delante a un paso largo. Empieza sin carga.',
        pasos:[
          'Mirada al frente a un punto fijo, nuca larga. No mires abajo a la pierna que trabaja.',
          'Baja vertical hasta que la rodilla de atrás apunte al suelo, con el tronco casi recto.',
          'Sube empujando con el talón del pie delantero.',
          'Cuando esto sea fácil, añade garrafas colgando de las manos, nunca peso sobre los hombros.'
        ],
        respiracion:'Inhala al bajar, exhala al subir.',
        errores:[
          'Poner el pie delantero demasiado cerca de la silla.',
          'Perder el equilibrio y compensar con el tronco: apóyate en la pared con una mano.',
          'Cargar peso a la espalda o en mochila.',
          'Bajar hasta donde la cadera se descoloca.'
        ],
        senal:'Glúteo y cuádriceps de la pierna de delante, y estiramiento en la parte delantera de la cadera de atrás.',
        siduele:'Vuelve al split squat normal, con los dos pies en el suelo, hasta que la rodilla lo lleve bien.',
        alternativa:'Sin silla: zancada estática sin elevación, 2×12 por pierna.'
      },

      { id:'P2.4', nombre:'Puente de glúteo a una pierna', series:'2 × 10 por lado',
        unidad:'peso corporal', material:['suelo'],
        que:'Glúteo unilateral con la cabeza apoyada en el suelo: cero riesgo cervical y mucho trabajo de cadera.',
        montaje:'Boca arriba, un pie apoyado cerca del glúteo, la otra pierna estirada o con la rodilla al pecho. Brazos a los lados.',
        pasos:[
          'Barbilla ligeramente metida, cabeza apoyada, sin empujar con la nuca contra el suelo.',
          'Sube la cadera apretando el glúteo del lado que apoya.',
          'Mantén la cadera nivelada: los dos lados suben a la vez, sin que uno se caiga.',
          'Baja controlando sin apoyar del todo entre repeticiones.'
        ],
        respiracion:'Exhala al subir, inhala al bajar.',
        errores:[
          'Empujar con la cabeza y los hombros para ganar altura. Es el error cervical de este ejercicio.',
          'Dejar caer un lado de la cadera.',
          'Arquear la lumbar en vez de apretar el glúteo.',
          'Apoyar el pie demasiado lejos: entonces trabaja el isquiotibial y suele dar calambre.'
        ],
        senal:'Glúteo del lado que apoya. Si notas calambre detrás del muslo, acerca el pie al cuerpo.',
        siduele:'Hazlo con los dos pies apoyados hasta que no haya molestia, y vuelve a una pierna después.',
        alternativa:'Puente de glúteo con los dos pies, 2×15, apretando dos segundos arriba.'
      },

      { id:'P2.5', nombre:'Push-up plus en encimera', series:'2 × 12',
        unidad:'peso corporal', material:['encimera'],
        que:'Empuje y serrato en el mismo movimiento. En encimera, el cuello queda en línea y no colgando como en la flexión en el suelo.',
        montaje:'Manos en el borde de la encimera a la anchura de los hombros, cuerpo recto en diagonal, pies atrás.',
        pasos:[
          'Mete ligeramente la barbilla y mira a la encimera, no al frente. La cabeza sigue la línea del cuerpo.',
          'Baja el pecho hacia el borde con los codos a 45°.',
          'Sube hasta estirar los brazos.',
          'Arriba del todo, empuja separando las escápulas sin doblar más los codos. Ese es el "plus" y es la mitad del ejercicio.'
        ],
        respiracion:'Inhala al bajar, exhala al subir y empujar.',
        errores:[
          'Saltarse el empujón final.',
          'Dejar caer la cadera y arquear la espalda.',
          'Adelantar la cabeza hacia la encimera antes que el pecho.',
          'Abrir los codos en cruz.'
        ],
        senal:'Pecho, tríceps y, en el empujón final, el costado bajo la axila.',
        siduele:'Ponte más vertical (manos en la pared) para que pese menos.',
        alternativa:'Push-up plus contra la pared, 2×15.'
      },

      { id:'P2.6', nombre:'Pallof press con banda', series:'2 × 8 por lado',
        unidad:'banda', material:['bandas','anclaje_bajo'],
        que:'Antirrotación de pie. Es el otro sustituto de la plancha: trabaja el centro sin poner nada de carga sobre el cuello.',
        montaje:'Banda anclada a un lado, a la altura del pecho. De pie, de lado al anclaje, con las dos manos juntas sobre el esternón.',
        pasos:[
          'Pies a la anchura de la cadera, nuca larga, mirada al frente. La cabeza no gira en todo el ejercicio.',
          'Estira los brazos al frente resistiendo el tirón que quiere girarte.',
          'Aguanta dos segundos con los brazos estirados sin dejar que el tronco rote.',
          'Vuelve las manos al pecho, despacio.'
        ],
        respiracion:'Exhala al estirar, inhala al volver.',
        errores:[
          'Dejar que el tronco gire hacia el anclaje: ahí desaparece el ejercicio.',
          'Girar la cabeza para mirar el anclaje.',
          'Inclinarse hacia el lado contrario para compensar en vez de sujetar con el abdomen.',
          'Tensión demasiado alta para poder aguantar los dos segundos.'
        ],
        senal:'Se nota en el abdomen y en el oblicuo del lado contrario al anclaje.',
        siduele:'Acércate al anclaje para bajar tensión y aguanta solo un segundo.',
        alternativa:'Sin banda: bird dog, 2×8 por lado, que trabaja lo mismo desde el suelo.'
      },

      { id:'P2.7', nombre:'Paseo del granjero con garrafas', series:'2 × 30 m',
        unidad:'garrafas', material:['garrafas'],
        que:'Transporte cargado con lo que hay en la cocina. Dos garrafas de 8 litros son 16 kg, y se progresa llenándolas más.',
        montaje:'Una garrafa en cada mano, colgando. Nunca con mochila puesta.',
        pasos:[
          'Hombros abajo y atrás, nuca larga, mirada al frente y al horizonte.',
          'Pasos cortos, abdomen firme, sin balancearse.',
          'Si los hombros se suben hacia las orejas, se acabó la serie.',
          'Al soltar, deja las garrafas en el suelo doblando las rodillas, no la espalda.'
        ],
        respiracion:'Normal y nasal, sin aguantar el aire.',
        errores:[
          'Mochila puesta. Nunca. Las correas tiran de los hombros hacia delante.',
          'Encoger los hombros.',
          'Inclinar el tronco.',
          'Cargar de golpe más de lo que puedes llevar 30 metros con los hombros bajos.'
        ],
        senal:'Antebrazos y abdomen, y espalda media al día siguiente.',
        siduele:'Vacía medio litro de cada garrafa y reduce a 2 × 20 m.',
        alternativa:'Dos bolsas de la compra bien cargadas, o dos mochilas cogidas de las asas con las manos, nunca a la espalda.'
      },

      { id:'P2.8', nombre:'Bird dog', series:'2 × 8 por lado',
        unidad:'peso corporal', material:['suelo'],
        que:'Control de la columna en cuadrupedia. Enseña a mover brazo y pierna sin que se mueva la espalda, que es lo que necesitas para levantar cosas del suelo sin pagarlo.',
        montaje:'A cuatro patas, manos bajo los hombros y rodillas bajo las caderas. Espalda plana.',
        pasos:[
          'Mirada al suelo entre las manos, con la nuca larga. No levantes la cabeza para mirar al frente: en cuadrupedia eso es extensión cervical pura.',
          'Estira a la vez un brazo al frente y la pierna contraria hacia atrás, sin pasar de la altura de la cadera.',
          'Mantén la cadera cuadrada: no dejes que se abra hacia el lado de la pierna que sube.',
          'Aguanta dos segundos y vuelve despacio.'
        ],
        respiracion:'Exhala al estirar, inhala al volver.',
        errores:[
          'Levantar la cabeza. Es el error de este ejercicio.',
          'Subir la pierna por encima de la cadera arqueando la lumbar.',
          'Girar la cadera al subir la pierna.',
          'Ir deprisa alternando lados.'
        ],
        senal:'Se nota en el glúteo y en toda la espalda como estabilización, no como ardor localizado.',
        siduele:'Mueve solo el brazo, o solo la pierna, hasta que la espalda se quede quieta.',
        alternativa:'Dead bug, 2×8 por lado, tumbado boca arriba.'
      }
    ]
  },

  /* Sesión reducida: días fuera de casa, sin material, 20-25 min */
  R: {
    nombre: 'Sesión reducida — sin material',
    ubicacion: 'Fuera',
    reducida: true,
    ejercicios: [
      { id:'R1', nombre:'Flexión craneocervical', series:'1 ronda',
        unidad:'peso corporal', material:['suelo'],
        que:'Lo primero y lo que nunca se salta. Es el ejercicio que trata directamente el cuello.',
        montaje:'Tumbado boca arriba, rodillas dobladas, una toalla o prenda doblada bajo la cabeza.',
        pasos:['Asentimiento muy pequeño, la barbilla se desliza hacia el cuello alargando la nuca.','No levantes la cabeza del apoyo.','Aguanta según tu nivel y descansa entre repeticiones.'],
        respiracion:'Nasal y tranquila, sin aguantar el aire.',
        errores:['Levantar la cabeza.','Meter la barbilla con fuerza.','Apretar la mandíbula.'],
        senal:'No debe notarse nada tenso en la parte delantera del cuello. Si notas cuerdas, es demasiado.',
        siduele:'Baja el aguante a 3 segundos y haz menos repeticiones.',
        alternativa:'Sentado contra el respaldo de una silla, con la cabeza apoyada, mismo asentimiento.'
      },
      { id:'R2', nombre:'Sentadilla a silla', series:'3 × 15',
        unidad:'peso corporal', material:['silla'],
        que:'Pierna básica con un punto de referencia detrás para no tener que pensar en la profundidad.',
        montaje:'De pie delante de una silla, pies a la anchura de los hombros.',
        pasos:['Mirada al frente a un punto fijo, nuca larga.','Baja llevando la cadera atrás hasta rozar el asiento.','Sube sin dejarte caer del todo en la silla.'],
        respiracion:'Inhala al bajar, exhala al subir.',
        errores:['Sentarte del todo y perder la tensión.','Mirar al suelo.','Juntar las rodillas al subir.'],
        senal:'Cuádriceps y glúteo.',
        siduele:'Usa una silla más alta o reduce el recorrido.',
        alternativa:'Sentarte y levantarte de la cama o del sofá, 3×12.'
      },
      { id:'R3', nombre:'Zancada estática', series:'3 × 10 por pierna',
        unidad:'peso corporal', material:['suelo'],
        que:'Pierna a una sola, sin material y sin carga en la columna.',
        montaje:'Un pie delante y otro detrás, un paso largo.',
        pasos:['Mirada al frente, nuca larga.','Baja vertical hasta que la rodilla de atrás casi toque.','Sube con el talón delantero.'],
        respiracion:'Inhala al bajar, exhala al subir.',
        errores:['Paso corto.','Inclinar el tronco.','Mirar a los pies.'],
        senal:'Glúteo y cuádriceps de la pierna de delante.',
        siduele:'Apóyate en la pared y reduce el recorrido.',
        alternativa:'Subir y bajar un escalón, 3×12 por pierna.'
      },
      { id:'R4', nombre:'Puente de glúteo a una pierna', series:'3 × 10 por lado',
        unidad:'peso corporal', material:['suelo'],
        que:'Glúteo con la cabeza apoyada.',
        montaje:'Boca arriba, un pie apoyado, la otra pierna estirada.',
        pasos:['Barbilla metida, cabeza apoyada sin empujar con la nuca.','Sube la cadera apretando el glúteo.','Cadera nivelada.'],
        respiracion:'Exhala al subir.',
        errores:['Empujar con la cabeza.','Dejar caer un lado.','Arquear la lumbar.'],
        senal:'Glúteo del lado que apoya.',
        siduele:'Con los dos pies apoyados.',
        alternativa:'Puente con los dos pies, 3×15.'
      },
      { id:'R5', nombre:'Push-up plus en pared o encimera', series:'3 × 12',
        unidad:'peso corporal', material:['pared'],
        que:'Empuje y serrato. Cuanto más vertical, más fácil: en un hotel, la pared siempre está.',
        montaje:'Manos en la pared o en un mueble estable, cuerpo recto.',
        pasos:['Barbilla ligeramente metida, cabeza en línea con el cuerpo.','Baja el pecho, codos a 45°.','Arriba, empuja separando las escápulas.'],
        respiracion:'Exhala al empujar.',
        errores:['Saltarse el empujón final.','Adelantar la cabeza.','Dejar caer la cadera.'],
        senal:'Pecho y costado bajo la axila.',
        siduele:'Más vertical.',
        alternativa:'Contra el marco de la puerta.'
      },
      { id:'R6', nombre:'Remo con toalla en el pomo', series:'3 × 10 por lado',
        unidad:'peso corporal', material:['toalla'],
        que:'El tirón cuando no hay ni banda ni mesa. Isométrico, pero cuenta.',
        montaje:'Toalla pasada por el pomo de una puerta cerrada, un extremo en cada mano o solo uno.',
        pasos:['Nuca larga, mirada al frente.','Baja la escápula y tira llevando el codo a la cadera.','Aguanta 5 segundos por repetición.'],
        respiracion:'Exhala al tirar, sin bloquear el aire.',
        errores:['Encoger el hombro.','Tirar solo con el brazo.','Adelantar la cabeza.'],
        senal:'Espalda media, entre la escápula y la columna.',
        siduele:'Menos fuerza, mismos segundos.',
        alternativa:'Agarrar el marco de la puerta y tirar del cuerpo hacia atrás con los brazos estirados.'
      },
      { id:'R7', nombre:'Prone Y en el suelo', series:'3 × 12',
        unidad:'peso corporal', material:['suelo','toalla'],
        que:'Trapecio inferior sin banda: solo el peso del brazo, que es suficiente cuando se hace despacio.',
        montaje:'Boca abajo con la frente apoyada en una toalla doblada, brazos en diagonal formando una Y, pulgares arriba.',
        pasos:['La frente apoyada en todo momento: así no puedes levantar la cabeza.','Baja las escápulas y despega los brazos unos centímetros.','Aguanta un segundo y baja en tres.'],
        respiracion:'Exhala al subir.',
        errores:['Levantar la cabeza para mirar al frente.','Encoger los hombros.','Subir mucho los brazos.'],
        senal:'Zona baja del omóplato.',
        siduele:'Solo un brazo cada vez, sin despegarlo apenas.',
        alternativa:'De pie inclinado con la frente apoyada en la pared, mismo movimiento.'
      },
      { id:'R8', nombre:'Serratus wall slide con toalla', series:'3 × 10',
        unidad:'peso corporal', material:['pared','toalla'],
        que:'Serrato con lo que hay en cualquier habitación.',
        montaje:'Antebrazos sobre una toalla contra la pared, codos a la altura del pecho.',
        pasos:['Nuca larga, sin apoyar la frente.','Desliza arriba sin encoger los hombros.','Arriba, empuja alejando el pecho de la pared.'],
        respiracion:'Exhala al subir y empujar.',
        errores:['Saltarse el empujón.','Encoger los hombros.','Arquear la lumbar.'],
        senal:'Costado, bajo la axila.',
        siduele:'Medio recorrido.',
        alternativa:'A cuatro patas, empujando el suelo.'
      },
      { id:'R9', nombre:'Dead bug', series:'3 × 8 por lado',
        unidad:'peso corporal', material:['suelo'],
        que:'Centro con la cabeza apoyada.',
        montaje:'Boca arriba, brazos al techo, caderas y rodillas a 90°.',
        pasos:['Cabeza apoyada todo el tiempo.','Estira brazo y pierna contraria sin despegar la lumbar.','Vuelve al centro.'],
        respiracion:'Exhala al estirar.',
        errores:['Despegar la lumbar.','Levantar la cabeza.','Ir rápido.'],
        senal:'Abdomen bajo.',
        siduele:'Solo brazos o solo piernas.',
        alternativa:'Bird dog a cuatro patas.'
      },
      { id:'R10', nombre:'Paseo del granjero con lo que haya', series:'3 × 40 pasos',
        unidad:'lo que haya', material:[],
        que:'Transporte cargado con la maleta, las bolsas o las botellas de agua del minibar. Cuenta igual.',
        montaje:'Peso repartido en las dos manos, colgando.',
        pasos:['Hombros abajo, nuca larga, mirada al frente.','Pasos cortos.','Si los hombros suben, se acabó la serie.'],
        respiracion:'Normal y nasal.',
        errores:['Mochila puesta.','Encoger los hombros.','Cargar a un solo lado.'],
        senal:'Antebrazos y abdomen.',
        siduele:'Menos peso, mismos pasos.',
        alternativa:'Dos botellas de litro y medio en cada mano.'
      }
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
    id:'PIS-marcha', nombre: 'Marcha acuática (calentamiento, 5 min)',
    material:['piscina'],
    detalle: 'Andar adelante 4 × 7 m · andar hacia atrás 4 × 7 m · lateral 2 × 7 m por lado · rodillas altas 2 × 7 m.',
    alternativa: 'Sin espacio para andar: marcha en el sitio con las rodillas altas, 4 × 45 s.'
  },
  nado: {
    id:'PIS-nado', nombre: 'Nado atado con arnés',
    material:['piscina','arnes'],
    alternativa: 'Sin arnés: largos normales a espalda al mismo tiempo total, parando en cada pared sin apoyar el cuello en el bordillo.'
  },
  escapular: {
    id:'PIS-escap', nombre: 'Escapular acuático (agua al pecho, 5 min)',
    material:['piscina'],
    detalle: 'Aperturas invertidas 15 · tirón en "W" 15 · empuje al frente alejando el pecho 15 · sculling 30 s · círculos de hombro lentos 10 por sentido.',
    alternativa: 'Se puede hacer de pie en la parte poco profunda, sin material.'
  },
  descompresion: {
    id:'PIS-desc', nombre: 'Descompresión (final de toda sesión de agua, 3-4 min)',
    material:['piscina','churro'],
    detalle: 'Flotar boca arriba con un churro bajo el cuello y otro bajo las rodillas, cuerpo suelto, respiración nasal con la exhalación el doble de larga que la inhalación.',
    alternativa: 'Sin churros: de espaldas al bordillo, apoya los dos brazos abiertos en el borde y deja las piernas sueltas colgando en el agua. Cuerpo flojo, misma respiración: exhalación el doble de larga. 3-4 min.'
  },
  suave: {
    id:'PIS-suave', nombre: 'Nado suave a espalda',
    material:['piscina'],
    detalle: '5-8 min, sin intervalos, sin reloj.',
    alternativa: 'Si no puedes nadar: flotar y andar por el agua 8 min, mismo efecto de descarga.'
  }
};

/* Progresión del nado atado, por lunes de la semana */
const NADO_ATADO = {
  '2026-08-03': { series: '5 × 90 s', descanso: '60 s', reparto: '3 espalda / 2 crol con tubo', espalda:'5 × 90 s a espalda' },
  '2026-08-10': { series: '5 × 90 s', descanso: '60 s', reparto: '3 espalda / 2 crol con tubo', espalda:'5 × 90 s a espalda' },
  '2026-08-17': { series: '6 × 2 min', descanso: '60 s', reparto: '4 espalda / 2 crol', espalda:'6 × 2 min a espalda' },
  '2026-08-24': { series: '6 × 3 min', descanso: '60 s', reparto: '3 espalda / 3 crol', espalda:'6 × 3 min a espalda' },
  '2026-08-31': { series: '5 × 4 min', descanso: '60 s', reparto: '3 espalda / 2 crol, uno a ritmo alto', espalda:'5 × 4 min a espalda, uno a ritmo alto' }
};

const REGLA_TUBO = 'Sin tubo frontal no se hace crol: atado, cada respiración es una rotación cervical forzada contra resistencia constante. Hoy, todo a espalda.';
const REGLA_SOLAPE = 'Hoy hay fuerza. Esta sesión de agua es recuperación, no entrenamiento. Sin intervalos y sin reloj.';

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

/* --- Revisión del 4 de septiembre --------------------------- */
const REVISION = {
  fecha: '2026-09-04',
  titulo: 'Revisión de bloque',
  intro: 'Cuatro semanas. Esto no es un examen: es tomar datos para decidir el bloque siguiente.',
  bloques: [
    { titulo:'Perímetros', items:['Brazo','Cuello','Pecho','Abdomen en el ombligo','Cintura inferior','Cadera','Muslo'] },
    { titulo:'Fotos', items:['Frontal','Perfil derecho','Perfil izquierdo','Espalda','Perfil de cuello y hombros'], nota:'Cinco ángulos, misma luz, misma hora. No las mires hoy: se comparan dentro de tres meses.' },
    { titulo:'Prendas de control', items:['Prenda 1','Prenda 2','Prenda 3','Prenda 4','Prenda 5'], nota:'Cómo entran, sin más.' },
    { titulo:'Tests', items:['Test de la pared','Aguante de prone Y','Nivel craneocervical alcanzado'] },
    { titulo:'Cargas', items:['M1 peso muerto rumano','M2 remo a una mano','M3 split squat','M6 paseo del granjero'] }
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
  recaida: {
    id: 'recaida',
    titulo: 'Protocolo de recaída',
    subtitulo: 'El de medio plazo. Este es el que hará falta en noviembre.',
    tipo: 'bloques',
    bloques: [
      { cabecera: 'Señales tempranas',
        texto: 'Tres días seguidos sin registrar · el entrenamiento se mueve de hora dos veces en una semana · pensar "mañana lo compenso" más de una vez por semana · dejar de preparar el táper la noche anterior · abrir la app da rechazo · empezar a pensar en cambiar de plan. Dos señales a la vez, o "tres días sin registrar" ella sola, disparan el protocolo el mismo día.' },
      { cabecera: 'Nivel 1 — semana floja',
        texto: 'Una o dos señales, o una semana por debajo de 4/7. Declaro la semana como floja: la fuerza baja de 3 sesiones a 2, todo lo demás pasa al suelo mínimo y cuenta como cumplido, y el registro se mantiene al 100%. Vuelvo automáticamente en una semana, sin decidir nada más.' },
      { cabecera: 'Nivel 2 — mantenimiento declarado',
        texto: 'Dos semanas seguidas por debajo de 4/7, o un periodo que ya sé que va a ser malo. Escribo la fecha de salida antes de entrar. El plan se reduce a caminata diaria de 20 min + craneocervical + una sesión de fuerza a la semana. El objetivo declarado del mes es cero progreso, y eso es un éxito completo.' },
      { cabecera: 'Nivel 3 — reinicio programado',
        texto: 'Un mes o más perdido. NO empiezo de cero, NO cambio de plan, NO hago un mes duro para recuperar. Día 1: registro. Días 1-3: solo suelo mínimo. Días 4-14: dos sesiones por semana con un 20% menos de carga de la que movía antes de parar. Semana 3: plan completo. Tiempo total de recuperación desde un mes perdido: tres semanas.' }
    ]
  },
  suelo: {
    id: 'suelo',
    titulo: 'El suelo mínimo',
    tipo: 'texto',
    texto: 'Caminata 20 min + una ronda de flexión craneocervical + un bloque de movilidad. 27 minutos. Cuenta como día cumplido.'
  }
};

const TEXTO_FLEXIBILIDAD = 'Cambiar el día no es saltarse el plan. La cuota es tres sesiones por semana con sus series y sus repeticiones; qué día caen es tuyo. Lo único que no se mueve es la cuota.';
