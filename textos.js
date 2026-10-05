/* ============================================================
   textos.js — hábitos y reglas del plan. Editable sin tocar la lógica.
   ============================================================ */
'use strict';

const VERSION = 'v3 · oct 2026';
const CHANGELOG = [
  'Ejercicios ilustrados y animados, con el error típico al lado',
  'Catálogo de estiramientos por zonas',
  'Puedes rellenar cualquier día, sin límite hacia atrás',
  'Pantallas: un sí o un no',
  'Botón para actualizar la app'
];

/* Hábitos del día. extra:true = suma si lo haces, nunca resta si no. */
const FACTORES = [
  { k:'caminata', nombre:'Caminata',               hint:'25 min o más · rescate: 15 min', grupo:'cuerpo' },
  { k:'manana',   nombre:'Rutina de mañana',       hint:'7-8 min de estiramientos',       grupo:'cuerpo', ir:'#/estirar/manana' },
  { k:'fuerza',   nombre:'Entreno de fuerza',      hint:'Sesión A o B',                   grupo:'cuerpo', extra:true, ir:'#/entrenar' },
  { k:'noche',    nombre:'Rutina de noche',        hint:'4 min · opcional',               grupo:'cuerpo', extra:true, ir:'#/estirar/noche' },
  { k:'comida',   nombre:'Comí según lo decidido', hint:'o era una comida libre planificada', grupo:'dia' },
  { k:'sueno',    nombre:'Me acosté a mi hora',    hint:'antes de las 23:30',             grupo:'dia' },
  { k:'social',   nombre:'Vi a alguien',           hint:'en persona, no mensajes',        grupo:'dia' },
  { k:'pausa',    nombre:'Pausa mental',           hint:'10 min sin pantalla',            grupo:'dia' },
  { k:'pantallas',nombre:'Pantallas menos de 4 h', hint:'',                               grupo:'dia' }
];
const UMBRAL_DIA = 4;   // día cumplido: 4 cosas hechas… o caminata + rutina de mañana
const SUELO = ['caminata','manana'];
const OBJETIVO_FUERZA = 2;

/* Reglas del entreno, en la pestaña Entrenar */
const REGLAS = [
  { t:'La semana',
    c:'<b>Lunes: sesión A. Jueves: sesión B. Sábado: A otra vez, opcional.</b> Las semanas de dos y las de tres son semanas completas: el sábado suma cuando aparece y no resta cuando no. La única regla de reparto: nunca dos sesiones en días seguidos. Si quieres afinar, alterna A-B-A una semana y B-A-B la siguiente.' },
  { t:'Cómo se hace una superserie',
    c:'Haces el primer ejercicio, pasas al segundo sin descansar, y entonces descansas lo que indica. Eso es una ronda. Repites las rondas que marca. Así caben seis ejercicios en media hora sin ir con prisa.' },
  { t:'Cuánto apretar',
    c:'Acabas cada serie sintiendo que podrías hacer <b>3 o 4 repeticiones más</b>. Nunca llegas al fallo: el fallo hace que el trapecio superior compense y que aguantes el aire, y eso se paga en cefalea al día siguiente.' },
  { t:'Postura, en todos',
    c:'Nuca larga, mandíbula floja, respiración por la nariz, hombros abajo y atrás sin encogerlos. Si notas que se "enciende" el trapecio de arriba, el peso es demasiado. Bajar el peso ahí no es fallar: es hacerlo bien.' },
  { t:'Cómo progresar',
    c:'Cada ejercicio tiene un rango, por ejemplo 8-12. Empiezas con un peso que te deje hacer 8 limpias. <b>Cada sesión sumas una repetición a una serie</b>: 8/8/8, luego 9/8/8, luego 9/9/8… Cuando llegas a 12/12/12, subes el peso y vuelves a 8. Si dos sesiones seguidas no sumas, repites una semana más. Los ejercicios de escápula (prone Y, face pull, push-up plus) no se cargan: progresan por control.' },
  { t:'Si sube el dolor',
    c:'<b>Sube 2 puntos o menos y vuelve en menos de 24 h:</b> no cambies nada, es normal.<br><b>Sube más de 2 y dura 24-48 h:</b> sigue entrenando, pero baja la carga un 30-40% y quita dos sesiones el ejercicio sospechoso.<br><b>Pasa de 48 h o supera 8/10:</b> unos días solo caminata y rutina de mañana, y habla con tu fisio.' },
  { t:'Banderas rojas', alerta:true,
    c:'Para y consulta el mismo día si aparece: hormigueo o pérdida de fuerza en brazo o mano · mareo o vértigo al mover el cuello · alteraciones visuales · dificultad para tragar · una cefalea brusca y distinta a las habituales.' },
  { t:'Supervisión',
    c:'Llévale estas dos tablas a tu fisio y pídele que revise sobre todo el remo, el peso muerto y el prone Y. Mejor aún si es alguien con formación en dolor persistente. Este plan está pensado con criterio, pero sin haberte visto moverte.' }
];

const CAMINATA_TXT = 'Ritmo vivo pero conversacional. Bájate una parada antes: la caminata que va dentro de un trayecto que ya haces es la que sobrevive a noviembre. Si vuelves a casa primero, ya no sales. Y mirada al frente, no al móvil.';
