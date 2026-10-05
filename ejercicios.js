/* ============================================================
   ejercicios.js — FUERZA y CALENTAMIENTO
   Cada ejercicio: texto completo + ilustración animada.
   Los estiramientos y las rutinas están en estiramientos.js.
   ============================================================ */
'use strict';

/* vista desde arriba con brazos a ángulo fijo (para movimientos en arco) */
function _brazoArco(h, a, l){ return desde(h, a, l||49.5); }
const _lerp = (a,b,t) => a+(b-a)*t;

const EJERCICIOS = [

/* ───────────────────────── CALENTAMIENTO ───────────────────────── */

{ id:'C1', grupo:'calentamiento', nombre:'Band pull-apart', series:'15 repeticiones',
  material:['banda'],
  que:'Despierta el trapecio medio y los romboides, los músculos que juntan las escápulas. Es la mejor forma de avisar a la espalda alta de que va a trabajar.',
  montaje:'De pie, pies a la anchura de la cadera. Coge una banda ligera con las dos manos, a la anchura de los hombros, palmas hacia abajo. Brazos estirados al frente a la altura del pecho.',
  pasos:[
    'Antes de abrir, baja los hombros: aléjalos de las orejas.',
    'Abre los brazos hacia los lados, rectos o con el codo apenas flexionado, hasta que la banda toque el pecho.',
    'Junta las escápulas al final, como si quisieras pellizcar un lápiz entre ellas. Aguanta un segundo.',
    'Vuelve despacio, en dos segundos, sin dejar que la banda te arrastre.'
  ],
  respira:'Exhala al abrir, inhala al volver.',
  errores:[
    'Encoger los hombros hacia las orejas para abrir. Si pasa, la banda es demasiado dura o estás cogiéndola demasiado cerca.',
    'Echar la cabeza hacia delante al final del movimiento.',
    'Arquear la zona lumbar y sacar costillas para ayudarte.'
  ],
  senal:'Lo notas entre las escápulas, en el centro de la espalda alta. No en el cuello ni en la parte de arriba de los hombros.',
  siduele:'Coge la banda más separada (menos tensión) o abre solo hasta la mitad del recorrido.',
  alternativa:'Sin banda: el mismo movimiento con los brazos vacíos, apretando fuerte las escápulas al final y aguantando 3 segundos.',
  vistaTxt:'Vista desde arriba', thumb:0.55,
  fases:['Brazos al frente, a la altura del pecho','Abre hasta que la banda toque el pecho'],
  caja:'22 40 156 125',
  dibujo(t){
    const c={x:100,y:108}, hI={x:78,y:108}, hD={x:122,y:108};
    const s=suave(t);
    const aI=_lerp(180,264,s), aD=_lerp(180,96,s);
    const mI=_brazoArco(hI,aI), mD=_brazoArco(hD,aD);
    const r=dibujaArriba({cx:100,cy:108,mI,mD});
    return r.svg + AT.banda(r.q.manoI, r.q.manoD, 0)
      + (t>0.6 ? AT.flecha(100,88,100,96) : '');
  }
},

{ id:'C2', grupo:'calentamiento', nombre:'Serratus wall slide', series:'10 repeticiones',
  material:['pared','toalla'],
  que:'Activa el serrato anterior, el músculo que pega la escápula a las costillas y la hace rotar hacia arriba. Con el trapecio inferior, es el que te falta para que el trapecio superior deje de hacer el trabajo de todos.',
  montaje:'De pie frente a una pared, a un palmo de distancia. Apoya los antebrazos en la pared, paralelos, con los codos a la altura de los hombros y las palmas mirándose. Si tienes una toalla, ponla doblada entre los antebrazos y la pared para que deslice.',
  pasos:[
    'Presiona suavemente los antebrazos contra la pared. Esa presión no se pierde en ningún momento.',
    'Desliza los antebrazos hacia arriba, despacio, hasta donde llegues sin encoger los hombros.',
    'Arriba del todo, empuja la pared y aleja un poco el pecho de ella: las escápulas se separan. Ese empujón final es el ejercicio.',
    'Baja controlando, en tres segundos.'
  ],
  respira:'Exhala al subir y empujar, inhala al bajar.',
  errores:[
    'Subir encogiendo los hombros. Para ahí: ese es tu rango por ahora.',
    'Dejar de presionar la pared y limitarte a deslizar los brazos.',
    'Arquear la zona lumbar y sacar tripa al subir.',
    'Olvidar el empujón final.'
  ],
  senal:'Lo notas en el costado, bajo la axila, sobre las costillas. Es una sensación rara al principio porque es un músculo que casi nunca usas.',
  siduele:'Sube solo hasta la mitad y quédate ahí dos semanas.',
  alternativa:'Sin pared libre: tumbado boca arriba, brazos al techo, empuja los puños hacia arriba separando las escápulas del suelo sin doblar los codos. Es el "plus" sin pared.',
  fases:['Antebrazos en la pared, a la altura de la cara','Desliza arriba y empuja la pared al final'],
  poses:[
    { x:124,y:112,tr:180,cu:180, mFx:144,mFy:62,mBx:141,mBy:64, tFx:126,tFy:182,tBx:120,tBy:182 },
    { x:122,y:112,tr:179,cu:179, mFx:146,mFy:30,mBx:143,mBy:32, tFx:126,tFy:182,tBx:120,tBy:182 }
  ],
  fondo:()=>AT.suelo()+AT.pared(153),
  frente:(q,p,t)=> t>0.6 ? AT.flecha(140,44,140,30) : AT.flecha(162,90,162,62)
},

{ id:'C3', grupo:'calentamiento', nombre:'Puente de glúteo', series:'12 repeticiones',
  material:[],
  que:'Despierta los glúteos y enseña a la pelvis a colocarse. Tienes la pelvis basculada hacia delante: los glúteos fuertes la recolocan, y eso se nota hasta en el cuello.',
  montaje:'Tumbado boca arriba, rodillas dobladas, pies apoyados en el suelo a la anchura de la cadera y a un palmo del culo. Brazos estirados en el suelo junto al cuerpo. Cabeza apoyada.',
  pasos:[
    'Aprieta los glúteos antes de subir. Primero se aprieta, luego se sube.',
    'Sube la cadera hasta que rodillas, cadera y hombros queden en línea.',
    'Aguanta un segundo arriba apretando fuerte.',
    'Baja vértebra a vértebra hasta apoyar.'
  ],
  respira:'Exhala al subir, inhala al bajar.',
  errores:[
    'Subir arqueando la zona lumbar en vez de apretar glúteo: lo notarás en los riñones.',
    'Empujar con la cabeza contra el suelo para ayudarte.',
    'Separar las rodillas hacia fuera o juntarlas hacia dentro.'
  ],
  senal:'Lo notas en los glúteos. Si lo notas sobre todo detrás de los muslos, acerca los pies al culo.',
  siduele:'Sube menos. La mitad del recorrido apretando bien vale más que el recorrido entero con la lumbar.',
  alternativa:'No necesita nada.',
  fases:['Tumbado, rodillas dobladas, pies apoyados','Sube hasta alinear rodillas, cadera y hombros'],
  poses:[
    { x:120,y:150,tr:-90,cu:-90,cara:180, mFx:126,mFy:153,mBx:122,mBy:153, tFx:150,tFy:153,tBx:146,tBy:153, piF:95,piB:95 },
    { x:118,y:131,tr:-62,cu:-88,cara:180, mFx:124,mFy:153,mBx:120,mBy:153, tFx:150,tFy:153,tBx:146,tBy:153, piF:95,piB:95 }
  ],
  fondo:()=>AT.suelo(157)
},

{ id:'C4', grupo:'calentamiento', nombre:'Bisagra de cadera sin peso', series:'10 repeticiones',
  material:[],
  que:'Ensaya el movimiento del peso muerto rumano sin carga. Si este gesto sale bien, el A1 sale bien.',
  montaje:'De pie, pies a la anchura de la cadera, manos en la cadera. Rodillas apenas flexionadas, no bloqueadas.',
  pasos:[
    'Lleva la cadera hacia atrás, como si quisieras cerrar una puerta con el culo.',
    'El tronco se inclina solo, como consecuencia. La espalda queda larga, sin redondearse.',
    'Baja hasta notar tensión detrás de los muslos. No más.',
    'Vuelve empujando la cadera hacia delante y aprieta glúteo arriba.'
  ],
  respira:'Inhala al bajar, exhala al subir.',
  errores:[
    'Doblar las rodillas como en una sentadilla. Esto no es una sentadilla: las rodillas casi no se mueven.',
    'Redondear la espalda para bajar más.',
    'Levantar la cabeza para mirar al frente.'
  ],
  senal:'Tensión detrás de los muslos, nada en la zona lumbar.',
  siduele:'Baja menos.',
  alternativa:'Con un palo de escoba pegado a la espalda tocando cabeza, espalda alta y sacro: si al bajar pierdes alguno de los tres contactos, estás redondeando.',
  fases:['De pie, manos en la cadera','Cadera atrás, espalda larga, mirada al suelo'],
  poses:[
    { x:100,y:112,tr:177,cu:177, mFx:105,mFy:110,mBx:97,mBy:110, tFx:103,tFy:182,tBx:97,tBy:182, signos:{codoF:-1,codoB:-1} },
    { x:85,y:116,tr:120,cu:122, mFx:90,mFy:113,mBx:83,mBy:113, tFx:103,tFy:182,tBx:97,tBy:182 }
  ],
  fondo:()=>AT.suelo()
},

/* ───────────────────────── SESIÓN A ───────────────────────── */

{ id:'A1', grupo:'fuerza', nombre:'Peso muerto rumano con mancuernas', series:'3 × 8-12', descanso:'75 s',
  material:['mancuernas'],
  que:'Trabaja toda la cadena posterior: glúteos, isquiotibiales y erectores. Es el ejercicio que más contrarresta la pelvis basculada hacia delante, y por esa vía también descarga el cuello.',
  montaje:'De pie, pies a la anchura de la cadera. Una mancuerna en cada mano, colgando a los lados del cuerpo, palmas mirando hacia ti. Rodillas un poco flexionadas, no bloqueadas.',
  pasos:[
    'Lleva la cadera hacia atrás como si cerraras una puerta con el culo. Las rodillas casi no se mueven.',
    'Las mancuernas bajan pegadas a los muslos y luego a las piernas, siempre a los lados.',
    'Baja hasta notar tensión clara detrás de los muslos. Suele ser a media espinilla o algo antes. No más.',
    'Vuelve empujando la cadera hacia delante y aprieta los glúteos arriba. 3 segundos bajando, 2 subiendo.'
  ],
  respira:'Inhala arriba antes de bajar, exhala al terminar de subir.',
  errores:[
    'Mirar al frente mientras estás inclinado. Es el error que más te afecta: deja el cuello en extensión toda la serie. Mirada al suelo, a unos dos metros por delante de los pies.',
    'Redondear la espalda para bajar más. El recorrido lo marca la tensión de los isquios, no la distancia al suelo.',
    'Convertirlo en una sentadilla doblando mucho las rodillas.',
    'Llevar las mancuernas por delante del cuerpo: cargan la zona lumbar.'
  ],
  senal:'Lo notas detrás de los muslos al bajar y en los glúteos al subir. Si lo notas en la zona lumbar, estás redondeando o bajando demasiado.',
  siduele:'Si molesta la lumbar, baja menos y reduce peso. Si molesta el cuello, comprueba la mirada: casi siempre es eso.',
  alternativa:'Sin mancuernas: garrafas de agua o una mochila llevada en la mano. Nunca la mochila puesta: las correas tiran de los hombros hacia delante.',
  fases:['Arriba: de pie, mancuernas a los lados','Abajo: cadera atrás hasta notar los isquios'],
  poses:[
    { x:100,y:112,tr:177,cu:177, mFx:105,mFy:124, mBx:99,mBy:124, tFx:103,tFy:182,tBx:97,tBy:182 },
    { x:85,y:116,tr:120,cu:122, mFx:123,mFy:150, mBx:118,mBy:150, tFx:103,tFy:182,tBx:97,tBy:182 }
  ],
  fondo:()=>AT.suelo(),
  frente:q=>AT.mancuerna(q.manoB)+AT.mancuerna(q.manoF),
  mal:{ texto:'Mirar al frente estando inclinado: el cuello queda en extensión toda la serie.',
        poses:[{ x:85,y:116,tr:120,cu:168,cara:95, mFx:123,mFy:150, mBx:118,mBy:150, tFx:103,tFy:182,tBx:97,tBy:182 }] }
},

{ id:'A2', grupo:'fuerza', nombre:'Floor press con mancuernas', series:'3 × 8-12', descanso:'75 s',
  material:['mancuernas'],
  que:'Empuje horizontal para pecho, hombro anterior y tríceps. Sustituye a las flexiones: aquí la cabeza está apoyada en el suelo, y en una flexión tienes que sostenerla contra la gravedad con el cuello adelantado, que es justo lo que te ha dejado peor otras veces.',
  montaje:'Tumbado boca arriba en el suelo, rodillas dobladas, pies apoyados. Una mancuerna en cada mano, a los lados del pecho, con los codos apoyados en el suelo a unos 45° del tronco (ni pegados ni abiertos en cruz).',
  pasos:[
    'Antes de empujar, junta un poco las escápulas y "clávalas" en el suelo. Se quedan así toda la serie.',
    'Empuja las mancuernas hacia arriba hasta estirar los brazos sobre el pecho.',
    'Baja despacio, en tres segundos, hasta que los tríceps toquen el suelo.',
    'Pausa de medio segundo con los brazos apoyados, sin rebotar, y vuelve a empujar.'
  ],
  respira:'Inhala al bajar, exhala al empujar.',
  errores:[
    'Levantar la cabeza para mirarte las manos. La cabeza no se despega del suelo en toda la serie.',
    'Abrir los codos en cruz, a 90° del tronco: carga el hombro.',
    'Rebotar los codos contra el suelo.'
  ],
  senal:'Lo notas en el pecho y los tríceps. Nada en la parte delantera del hombro.',
  siduele:'Si molesta el hombro, pega más los codos al cuerpo y gira las palmas una hacia otra.',
  alternativa:'Con banda: pásala por detrás de la espalda, un extremo en cada mano, y empuja igual tumbado.',
  fases:['Abajo: tríceps apoyados en el suelo','Arriba: brazos estirados sobre el pecho'],
  poses:[
    { x:124,y:150,tr:-90,cu:-90,cara:180, mFx:108,mFy:131, mBx:104,mBy:133, tFx:154,tFy:153,tBx:150,tBy:153 },
    { x:124,y:150,tr:-90,cu:-90,cara:180, mFx:87,mFy:101, mBx:84,mBy:103, tFx:154,tFy:153,tBx:150,tBy:153 }
  ],
  fondo:()=>AT.suelo(157),
  frente:q=>AT.disco(q.manoB)+AT.disco(q.manoF),
  mal:{ texto:'Levantar la cabeza para mirarte las manos: el cuello sostiene la cabeza contra la gravedad.',
        poses:[{ x:124,y:150,tr:-90,cu:-140,cara:140, mFx:87,mFy:101, mBx:84,mBy:103, tFx:154,tFy:153,tBx:150,tBy:153 }] }
},

{ id:'A3', grupo:'fuerza', nombre:'Remo a una mano con apoyo', series:'3 × 8-12 por lado', descanso:'75 s',
  material:['mancuernas','silla o sofá'],
  que:'Dorsal, romboides y trapecio medio. Es el ejercicio más importante de tu plan: tira de las escápulas hacia atrás y hacia abajo, justo al revés de como se te quedan. Si un día tienes que recortar, este no se recorta.',
  montaje:'Apoya una mano en un sofá, una silla firme o un banco, con el brazo estirado. Pies en el suelo, separados, uno un poco más atrasado. Inclina el tronco hasta que quede casi paralelo al suelo. La mancuerna cuelga de la otra mano, palma mirando hacia ti.',
  pasos:[
    'Con el brazo todavía estirado, baja la escápula: llévala hacia el bolsillo trasero del pantalón contrario. Ese pequeño gesto es lo primero, antes de doblar el codo.',
    'Ahora tira llevando el codo hacia la cadera, no hacia el techo. El codo roza el costado.',
    'Arriba, aprieta un segundo la escápula contra la columna.',
    'Baja en tres segundos hasta estirar el brazo del todo.'
  ],
  respira:'Exhala al tirar, inhala al bajar.',
  errores:[
    'Adelantar la cabeza o mirar al frente en cada repetición. La cabeza va en línea con la columna, mirando al suelo, quieta.',
    'Girar el tronco para subir más la mancuerna. El pecho mira al suelo todo el rato.',
    'Tirar con el bíceps sin haber bajado antes la escápula.',
    'Encoger el hombro hacia la oreja al subir.'
  ],
  senal:'Lo notas en la espalda, debajo y alrededor de la escápula. Si lo notas sobre todo en el bíceps, no estás bajando la escápula primero.',
  siduele:'Reduce el peso y acorta el recorrido de arriba. Mantén siempre el primer gesto de bajar la escápula.',
  alternativa:'Con banda: pisa la banda con el pie del mismo lado, inclínate igual con la otra mano apoyada en la rodilla, y haz el mismo movimiento.',
  fases:['Abajo: brazo estirado, escápula baja','Arriba: el codo va hacia la cadera'],
  poses:[
    { x:100,y:116,tr:100,cu:100, mFx:141,mFy:160, mBx:163,mBy:147, tFx:104,tFy:182,tBx:95,tBy:182 },
    { x:100,y:116,tr:100,cu:100, mFx:118,mFy:127, mBx:163,mBy:147, tFx:104,tFy:182,tBx:95,tBy:182 }
  ],
  fondo:()=>AT.suelo()+AT.caja(152,150,46,36),
  frente:q=>AT.mancuerna(q.manoF),
  mal:{ texto:'Adelantar la cabeza para mirar al frente: tracción cervical en cada repetición.',
        poses:[{ x:100,y:116,tr:100,cu:150,cara:100, mFx:118,mFy:127, mBx:163,mBy:147, tFx:104,tFy:182,tBx:95,tBy:182 }] }
},

{ id:'A4', grupo:'fuerza', nombre:'Split squat con mancuernas', series:'3 × 8-10 por pierna', descanso:'75 s',
  material:['mancuernas'],
  que:'Pierna completa —cuádriceps, glúteo y aductores— y equilibrio. Sustituye a la sentadilla con barra: aquí el peso cuelga de las manos en lugar de apoyarse sobre los hombros, así que no hay ninguna compresión sobre el cuello.',
  montaje:'De pie, da un paso largo: un pie delante y otro detrás, separados también un poco a lo ancho (como si estuvieras sobre dos raíles, no sobre una cuerda). Talón de atrás levantado. Una mancuerna en cada mano, colgando. Las dos primeras semanas, sin mancuernas o con una sola y la mano libre en la pared.',
  pasos:[
    'Baja en vertical, como un ascensor: la rodilla de atrás va hacia el suelo.',
    'Para cuando la rodilla de atrás casi toque el suelo, a un par de dedos.',
    'Sube empujando con el talón del pie de delante.',
    'Haz todas las repeticiones de una pierna y luego cambia. 2 segundos bajando, 2 subiendo.'
  ],
  respira:'Inhala al bajar, exhala al subir.',
  errores:[
    'Ir hacia delante en vez de hacia abajo: la rodilla de delante se pasa mucho de la punta del pie.',
    'Pies en línea, uno detrás de otro: te desequilibras y el trapecio se tensa para compensar.',
    'Dejar caer el tronco hacia delante. Va recto o muy ligeramente inclinado.'
  ],
  senal:'Lo notas en el muslo y el glúteo de la pierna de delante.',
  siduele:'Si molesta la rodilla, acorta el recorrido. Si te cuesta el equilibrio, apoya una mano en la pared: el equilibrio forzado se paga en tensión de cuello.',
  alternativa:'Sin mancuernas: garrafas de agua colgando, o solo con tu peso, que con 110 kg ya es carga de sobra para empezar.',
  fases:['Arriba: paso largo, peso repartido','Abajo: la rodilla de atrás casi toca el suelo'],
  poses:[
    { x:100,y:116,tr:178,cu:178, mFx:105,mFy:124, mBx:96,mBy:124, tFx:122,tFy:182,tBx:74,tBy:176, piF:95,piB:55 },
    { x:99,y:146,tr:176,cu:176, mFx:104,mFy:155, mBx:95,mBy:155, tFx:122,tFy:182,tBx:74,tBy:176, piF:95,piB:55 }
  ],
  fondo:()=>AT.suelo(),
  frente:q=>AT.mancuerna(q.manoB)+AT.mancuerna(q.manoF)
},

{ id:'A5', grupo:'fuerza', nombre:'Prone Y de pie con banda', series:'2 × 10-12', descanso:'60 s',
  material:['banda','anclaje bajo'],
  que:'Trapecio inferior. Es, con el remo, el ejercicio que de verdad trata tu cuello: cuando el trapecio inferior no trabaja, lo hace el superior, y el superior es el que te duele.',
  montaje:'Ancla la banda a ras de suelo: bajo una puerta cerrada, o pisándola con los dos pies. De pie, un extremo en cada mano, brazos colgando por delante, pulgares hacia arriba.',
  pasos:[
    'Antes de mover los brazos, desliza las escápulas hacia abajo y hacia dentro, como si te las metieras en los bolsillos traseros del pantalón. Ese es el movimiento de verdad; los brazos solo lo acompañan.',
    'Sin perder eso, sube los brazos rectos en diagonal hacia fuera, formando una Y.',
    'Para en unos 120°: más o menos 30° por encima de la horizontal. No hasta arriba del todo.',
    'Aguanta un segundo arriba y baja en tres segundos.'
  ],
  respira:'Exhala al subir, inhala al bajar. Por la nariz. Si aprietas la mandíbula o aguantas el aire, la banda tiene demasiada tensión.',
  errores:[
    'Encoger los hombros hacia las orejas para llegar más arriba. Es el error principal y anula el ejercicio entero.',
    'Subir por encima de 120°: ahí entra el trapecio superior.',
    'Arquear la zona lumbar para ayudarte a subir.',
    'Hacerlo con impulso. Este ejercicio va lento.'
  ],
  senal:'Lo notas en la parte baja del omóplato, entre la columna y la escápula, a media espalda. Si lo notas arriba, en el trapecio o en el cuello, para y baja tensión.',
  siduele:'Reduce el recorrido a la mitad y usa la banda más floja. No lo elimines: es de los que más te convienen.',
  alternativa:'Sin banda: el mismo movimiento con los brazos vacíos, aguantando 3 segundos arriba. O tumbado boca abajo en un banco inclinado, solo con el peso del brazo.',
  vistaTxt:'Vista de frente',
  fases:['Brazos abajo, escápulas abajo y atrás','Sube en Y hasta unos 120°, sin encoger hombros'],
  vista:'frente',
  poses:[
    { x:100,y:113, mIx:90,mIy:122, mDx:110,mDy:124, tIx:91,tIy:182, tDx:109,tDy:182 },
    { x:100,y:113, mIx:37,mIy:47,  mDx:163,mDy:50,  tIx:91,tIy:182, tDx:109,tDy:182 }
  ],
  incluir:[[100,186]],
  fondo:()=>AT.suelo(),
  frente:(q,p,t)=> AT.banda({x:100,y:184},q.manoI,0)+AT.banda({x:100,y:184},q.manoD,0)
     + (t>0.55 ? AT.flecha(q.hI.x-12,q.hI.y-16,q.hI.x-12,q.hI.y-2)+AT.flecha(q.hD.x+12,q.hD.y-16,q.hD.x+12,q.hD.y-2) : ''),
  mal:{ texto:'Encoger los hombros para subir más: trabaja el trapecio superior, el que te duele.',
        poses:[{ x:100,y:113, encoge:1, mIx:37,mIy:37, mDx:163,mDy:40, tIx:91,tIy:182, tDx:109,tDy:182 }] }
},

{ id:'A6', grupo:'fuerza', nombre:'Pallof press', series:'2 × 8 por lado', descanso:'60 s',
  material:['banda','anclaje a media altura'],
  que:'Antirrotación: el tronco aprende a no girar cuando algo tira de él. Sustituye a la plancha con el mismo objetivo, pero de pie y sin sostener la cabeza contra la gravedad.',
  montaje:'Ancla la banda a la altura del pecho (pomo de una puerta, barandilla). Ponte de perfil al anclaje, a un paso largo de distancia, con la banda tensa. Las dos manos juntas sujetando la banda contra el esternón. Pies a la anchura de los hombros, rodillas un poco flexionadas.',
  pasos:[
    'Aprieta el abdomen como si fueran a darte un golpe suave en la tripa.',
    'Estira los brazos al frente, despacio, en línea recta desde el esternón.',
    'Con los brazos estirados, aguanta 2 segundos. La banda intenta girarte hacia el anclaje: no la dejes.',
    'Vuelve las manos al pecho en dos segundos. Termina las repeticiones de un lado y cambia de perfil.'
  ],
  respira:'Exhala al estirar los brazos, inhala al volver.',
  errores:[
    'Dejar que el tronco o la cadera giren hacia el anclaje. El trabajo es precisamente no girar.',
    'Ir rápido. No buscas recorrido, buscas quietud.',
    'Encoger los hombros al estirar los brazos.'
  ],
  senal:'Lo notas en el abdomen y en los costados, sobre todo en el lado más lejano al anclaje.',
  siduele:'Acércate al anclaje para tener menos tensión.',
  alternativa:'Sin anclaje: dead bug (B7) o bird dog. Cualquiera de los dos cumple la función.',
  vistaTxt:'Vista desde arriba',
  fases:['Manos en el esternón, de perfil al anclaje','Estira los brazos sin dejar que el tronco gire'],
  caja:'0 38 160 128',
  dibujo(t){
    const s=suave(t);
    const mI={x:106,y:_lerp(90,64,s)}, mD={x:114,y:_lerp(90,64,s)};
    const r=dibujaArriba({cx:110,cy:112,mI,mD,cI:1,cD:-1});
    const manos={x:110,y:(r.q.manoI.y+r.q.manoD.y)/2};
    return AT.ancla(12,112) + AT.banda({x:12,y:112},manos,0) + r.svg
      
      + (t>0.6 ? `<text x="140" y="56" fill="var(--fig-acc)" font-size="13" text-anchor="middle" font-weight="700">quieto</text>` : '');
  }
},

{ id:'A7', grupo:'fuerza', nombre:'Paseo del granjero', series:'2 × 30 metros', descanso:'60 s',
  material:['mancuernas o kettlebell'],
  que:'Fuerza de agarre, hombros estables y tronco firme. Es el gesto de coger a tu sobrino en brazos, pero con peso controlado y progresivo. En vez de evitarlo, lo entrenas.',
  montaje:'Una mancuerna o kettlebell en cada mano, colgando a los lados. De pie, erguido.',
  pasos:[
    'Antes de echar a andar: hombros abajo y atrás, coronilla hacia el techo, abdomen firme.',
    'Camina con pasos cortos y normales, sin prisa.',
    'Los brazos no se balancean: cuelgan quietos con el peso.',
    'Al llegar a los 30 metros, deja el peso con cuidado: cadera atrás, espalda larga, como en el A1.'
  ],
  respira:'Normal, por la nariz. Si tienes que contener la respiración para caminar, pesa demasiado.',
  errores:[
    'Dejar que el peso tire de los hombros hacia abajo y adelante: los hombros los colocas tú.',
    'Adelantar la cabeza al caminar.',
    'Inclinarte hacia un lado.'
  ],
  senal:'Lo notas en el agarre, en los hombros "anclados" y en el abdomen.',
  siduele:'Menos peso y menos distancia. Si molesta el cuello, revisa que los hombros no estén encogidos.',
  alternativa:'Garrafas de agua, bolsas de la compra llenas o una mochila en cada mano. Nunca la mochila puesta.',
  fases:['Hombros abajo, nuca larga','Pasos cortos, sin inclinarte'],
  poses:[
    { x:100,y:113,tr:180,cu:180, mFx:103,mFy:122, mBx:97,mBy:122, tFx:118,tFy:182,tBx:84,tBy:179, piF:95,piB:70 },
    { x:102,y:113,tr:180,cu:180, mFx:105,mFy:122, mBx:99,mBy:122, tFx:88,tFy:179,tBx:120,tBy:182, piF:70,piB:95 }
  ],
  fondo:()=>AT.suelo(),
  frente:q=>AT.kettle({x:q.manoB.x,y:q.manoB.y-3})+AT.kettle({x:q.manoF.x,y:q.manoF.y-3})
},

/* ───────────────────────── SESIÓN B ───────────────────────── */

{ id:'B1', grupo:'fuerza', nombre:'Hip thrust con mancuerna', series:'3 × 10-15', descanso:'75 s',
  material:['mancuerna','sofá o banco'],
  que:'Glúteo mayor, el más grande del cuerpo. No es un ejercicio "de culo" sin más: con la pelvis basculada hacia delante, una cadena posterior fuerte es parte del tratamiento de tu cuello, por la vía de la postura.',
  montaje:'Siéntate en el suelo con la espalda alta (la parte de debajo de las escápulas) apoyada en el borde del sofá o de un banco. Rodillas dobladas, pies apoyados a la anchura de la cadera. Mancuerna atravesada sobre la cadera, sujeta con las dos manos. Pon una toalla doblada debajo para que no te clave.',
  pasos:[
    'Mete un poco la barbilla y mira hacia las rodillas. La mirada se queda ahí toda la serie.',
    'Aprieta glúteos y sube la cadera hasta que tronco y muslos queden en línea, paralelos al suelo.',
    'Arriba, las espinillas quedan verticales. Aprieta un segundo.',
    'Baja controlando hasta casi tocar el suelo con el culo.'
  ],
  respira:'Exhala al subir, inhala al bajar.',
  errores:[
    'Dejar caer la cabeza hacia atrás sobre el sofá. Es la forma más fácil de salir de aquí con dolor de nuca.',
    'Arquear la zona lumbar arriba en vez de terminar con el glúteo.',
    'Pies demasiado lejos: lo notarás en los isquios en vez de en el glúteo.'
  ],
  senal:'Lo notas en los glúteos, muy localizado.',
  siduele:'Si molesta la nuca, comprueba la mirada. Si molesta la lumbar, sube menos.',
  alternativa:'Puente de glúteo en el suelo (C3) con la mancuerna en la cadera. Para el cuello es todavía más cómodo.',
  fases:['Abajo: espalda alta en el sofá, cadera cerca del suelo','Arriba: tronco y muslos en línea, barbilla metida'],
  poses:[
    { x:100,y:172,tr:-139,cu:-152, mFx:101,mFy:165, mBx:97,mBy:166, tFx:142,tFy:182,tBx:136,tBy:182 },
    { x:118,y:142,tr:-90,cu:-114, mFx:119,mFy:135, mBx:115,mBy:136, tFx:142,tFy:182,tBx:136,tBy:182 }
  ],
  fondo:()=>AT.suelo()+AT.caja(18,148,56,38),
  frente:q=>AT.disco({x:q.cad.x,y:q.cad.y-9},8),
  mal:{ texto:'Dejar caer la cabeza hacia atrás sobre el sofá: la nuca queda colgando toda la serie.',
        poses:[{ x:118,y:142,tr:-90,cu:-28,cara:-120, mFx:119,mFy:135, mBx:115,mBy:136, tFx:142,tFy:182,tBx:136,tBy:182 }] }
},

{ id:'B2', grupo:'fuerza', nombre:'Jalón con banda', series:'3 × 10-14', descanso:'75 s',
  material:['banda','anclaje alto'],
  que:'Dorsal ancho y trapecio inferior. Enseña a bajar las escápulas, que es el gesto contrario a encogerlas.',
  montaje:'Ancla la banda por encima de la cabeza: en lo alto de una puerta, una barandilla o una barra. De rodillas o de pie, frente al anclaje, un extremo en cada mano, brazos estirados hacia arriba y algo abiertos.',
  pasos:[
    'Con los brazos aún estirados, baja las escápulas. Notarás que los brazos bajan un par de centímetros sin doblar los codos.',
    'Ahora tira llevando los codos hacia abajo y hacia los costados, hasta que las manos queden a la altura de los hombros.',
    'Aprieta un segundo abajo, con el pecho abierto.',
    'Vuelve arriba en tres segundos, dejando que los brazos se estiren del todo.'
  ],
  respira:'Exhala al tirar, inhala al volver.',
  errores:[
    'Echarte hacia atrás para tirar más. El tronco no se mueve.',
    'Tirar con los brazos sin haber bajado antes las escápulas.',
    'Adelantar la cabeza al final del tirón.'
  ],
  senal:'Lo notas en los costados de la espalda, bajo las axilas.',
  siduele:'Alejarte menos del anclaje para tener menos tensión, o abrir menos los brazos.',
  alternativa:'Sin anclaje alto: siéntate en el suelo con las piernas estiradas, pasa la banda por los pies y haz un remo bajo, con el mismo gesto de bajar escápulas primero.',
  vistaTxt:'Vista de frente',
  vista:'frente',
  fases:['Brazos arriba, banda anclada por encima','Escápulas abajo y codos a los costados'],
  poses:[
    { x:100,y:113, mIx:58,mIy:27, mDx:142,mDy:30, tIx:91,tIy:182, tDx:109,tDy:182 },
    { x:100,y:113, mIx:62,mIy:67, mDx:138,mDy:70, tIx:91,tIy:182, tDx:109,tDy:182 }
  ],
  incluir:[[100,6],[100,186]],
  fondo:()=>AT.suelo()+AT.ancla(100,8),
  frente:(q)=>AT.banda({x:100,y:8},q.manoI,0)+AT.banda({x:100,y:8},q.manoD,0)
},

{ id:'B3', grupo:'fuerza', nombre:'Press unilateral en banco inclinado', series:'3 × 8-12 por lado', descanso:'75 s',
  material:['mancuerna','banco inclinado o sofá con cojines'],
  que:'Pecho alto, hombro y tríceps, de uno en uno. Sustituye al press por encima de la cabeza, que hace trabajar sobre todo al trapecio superior y te obliga a extender el cuello para compensar. Ese queda fuera hasta que un fisio te vea moverte.',
  montaje:'Recostado en un banco inclinado bajo (unos 30°) o en el sofá con cojines detrás, de forma que el tronco quede algo inclinado hacia atrás. Una mancuerna en una mano, a la altura del pecho, con el codo bajo. El otro brazo descansa sobre la tripa.',
  pasos:[
    'Pega las escápulas contra el respaldo.',
    'Empuja la mancuerna hacia arriba hasta estirar el brazo.',
    'Baja en tres segundos hasta que la mancuerna quede a la altura del pecho.',
    'Todas las repeticiones de un brazo y luego el otro.'
  ],
  respira:'Inhala al bajar, exhala al empujar.',
  errores:[
    'Separar el hombro del respaldo al empujar: la escápula se va hacia delante.',
    'Encoger el hombro del lado que trabaja.',
    'Girar el tronco hacia el lado del brazo que empuja.'
  ],
  senal:'Lo notas en el pecho y la parte delantera del hombro.',
  siduele:'Reduce la inclinación del respaldo: cuanto más tumbado, más cómodo para el hombro.',
  alternativa:'Floor press a una mano (como A2 con una sola mancuerna).',
  fases:['Abajo: mancuerna a la altura del pecho','Arriba: brazo estirado, el otro quieto'],
  poses:[
    { x:120,y:150,tr:-120,cu:-130, mFx:94,mFy:112, mBx:112,mBy:142, tFx:152,tFy:182,tBx:148,tBy:182 },
    { x:120,y:150,tr:-120,cu:-130, mFx:96,mFy:82,  mBx:112,mBy:142, tFx:152,tFy:182,tBx:148,tBy:182 }
  ],
  fondo:()=>AT.suelo()
    +`<path d="M130 162L54 118" stroke="var(--fig-line)" stroke-width="7" stroke-linecap="round"/>`
    +`<path d="M128 162H160M134 162V186M66 126V186" stroke="var(--fig-line)" stroke-width="5" stroke-linecap="round"/>`,
  frente:q=>AT.disco(q.manoF)
},

{ id:'B4', grupo:'fuerza', nombre:'Zancada inversa con mancuernas', series:'3 × 8-10 por pierna', descanso:'75 s',
  material:['mancuernas'],
  que:'Pierna y glúteo, con un componente de equilibrio. La zancada hacia atrás es bastante más amable con la rodilla que la zancada hacia delante y más fácil de controlar.',
  montaje:'De pie, pies juntos a la anchura de la cadera, una mancuerna colgando en cada mano.',
  pasos:[
    'Da un paso largo hacia atrás con una pierna, apoyando la punta del pie.',
    'Baja en vertical hasta que la rodilla de atrás casi toque el suelo.',
    'Empuja con el talón del pie de delante para volver a la posición inicial.',
    'Alterna piernas o haz todas de un lado y luego del otro, como prefieras.'
  ],
  respira:'Inhala al bajar, exhala al volver.',
  errores:[
    'Dar un paso demasiado corto: la rodilla de delante se va muy hacia delante.',
    'Volver impulsándote con la pierna de atrás en vez de empujar con la de delante.',
    'Inclinar el tronco hacia delante o a un lado.'
  ],
  senal:'Lo notas en el glúteo y el muslo de la pierna de delante.',
  siduele:'Sin peso, o haz split squat (A4), que es lo mismo sin tener que dar el paso.',
  alternativa:'Garrafas de agua, o sin peso.',
  fases:['De pie, mancuernas colgando','Paso atrás y abajo: la rodilla de atrás casi toca el suelo'],
  poses:[
    { x:100,y:112,tr:179,cu:179, mFx:105,mFy:123, mBx:97,mBy:123, tFx:103,tFy:182,tBx:97,tBy:182, piF:95,piB:95 },
    { x:92,y:146,tr:176,cu:176, mFx:97,mFy:155, mBx:89,mBy:155, tFx:104,tFy:182,tBx:50,tBy:176, piF:95,piB:55 }
  ],
  fondo:()=>AT.suelo(),
  frente:q=>AT.mancuerna(q.manoB)+AT.mancuerna(q.manoF)
},

{ id:'B5', grupo:'fuerza', nombre:'Face pull con banda', series:'3 × 12-15', descanso:'60 s',
  material:['banda','anclaje a la altura de la cara'],
  que:'Parte trasera del hombro, trapecio medio y rotadores externos. Tira de los hombros hacia atrás y los gira hacia fuera: exactamente lo contrario de la postura de hombros adelantados.',
  montaje:'Ancla la banda a la altura de la cara (marco de la puerta, barandilla). De pie, frente al anclaje, un paso atrás, un extremo en cada mano, brazos estirados al frente, palmas hacia abajo.',
  pasos:[
    'Baja los hombros antes de empezar.',
    'Tira de la banda hacia la cara separando las manos, con los codos altos, a la altura de los hombros.',
    'Al final, gira los antebrazos hacia atrás hasta que las manos queden junto a las sienes, como haciendo un "doble bíceps".',
    'Aguanta un segundo y vuelve en dos.'
  ],
  respira:'Exhala al tirar, inhala al volver.',
  errores:[
    'Subir los codos encogiendo los hombros hacia las orejas. Codos altos, sí; hombros arriba, no.',
    'Adelantar la cabeza hacia las manos al final.',
    'Echarte hacia atrás con el tronco.'
  ],
  senal:'Lo notas en la parte de atrás de los hombros y entre las escápulas.',
  siduele:'Menos tensión, y acaba el gesto un poco antes.',
  alternativa:'Band pull-apart (C1) con tres series de 15.',
  fases:['Brazos estirados hacia el anclaje','Manos a las sienes, codos altos y abiertos'],
  poses:[
    { x:90,y:112,tr:180,cu:180, mFx:138,mFy:62, mBx:136,mBy:64, tFx:94,tFy:182,tBx:86,tBy:182, signos:{codoF:1,codoB:1} },
    { x:90,y:112,tr:180,cu:180, mFx:100,mFy:46, mBx:98,mBy:48,  tFx:94,tFy:182,tBx:86,tBy:182 }
  ],
  fondo:()=>AT.suelo()+AT.pared(186)+AT.ancla(184,56),
  frente:q=>AT.banda({x:184,y:56},q.manoF,0)
},

{ id:'B6', grupo:'fuerza', nombre:'Push-up plus en encimera', series:'3 × 10-12', descanso:'60 s',
  material:['encimera o mesa firme'],
  que:'Serrato anterior, gracias al "plus" del final, y algo de pecho y tríceps. Sin el plus, es solo una flexión inclinada. Con el plus, es tratamiento para la escápula.',
  montaje:'De pie frente a la encimera de la cocina, a un paso y medio. Manos en el borde, a la anchura de los hombros. El cuerpo inclinado y recto, de los talones a la cabeza.',
  pasos:[
    'Baja el pecho hacia el borde de la encimera doblando los codos hacia atrás, no abiertos en cruz.',
    'Sube estirando los brazos.',
    'Con los brazos ya estirados, sigue empujando: separa las escápulas y aleja la espalda alta de la encimera unos centímetros, sin doblar los codos. Ese es el "plus".',
    'Aguanta un segundo en el plus y vuelve a bajar.'
  ],
  respira:'Inhala al bajar, exhala al empujar.',
  errores:[
    'Olvidar el plus. Es lo que convierte esto en un ejercicio para el serrato.',
    'Dejar caer la cadera: el cuerpo es una tabla.',
    'Adelantar la cabeza hacia la encimera. Baja el pecho, no la cara.'
  ],
  senal:'Lo notas en el pecho al bajar y, en el plus, en el costado bajo la axila.',
  siduele:'Ponte más vertical (más cerca de la encimera). No progreses a flexiones en el suelo: no es un objetivo de este plan.',
  alternativa:'En una pared, de pie: más fácil, mismo plus.',
  fases:['Baja el pecho hacia el borde','Sube y empuja separando las escápulas'],
  poses:[
    { x:105,y:122,tr:140,cu:140, mFx:159,mFy:104, mBx:157,mBy:105, tFx:60,tFy:176,tBx:56,tBy:176, piF:40,piB:40 },
    { x:95,y:115,tr:150,cu:150, mFx:159,mFy:104, mBx:157,mBy:105, tFx:60,tFy:176,tBx:56,tBy:176, piF:40,piB:40 }
  ],
  fondo:()=>AT.suelo()+AT.caja(154,108,44,78),
  frente:(q,p,t)=> t>0.6 ? AT.flecha(q.hom.x-2,q.hom.y-6,q.hom.x-16,q.hom.y-20) : ''
},

{ id:'B7', grupo:'fuerza', nombre:'Dead bug', series:'2 × 8 por lado', descanso:'60 s',
  material:[],
  que:'Estabilidad del tronco con la zona lumbar protegida. Es el otro sustituto de la plancha: trabaja lo mismo con la cabeza apoyada en el suelo.',
  montaje:'Tumbado boca arriba. Brazos estirados hacia el techo. Caderas y rodillas dobladas a 90°, espinillas paralelas al suelo. Zona lumbar pegada al suelo: si cabe la mano entre la lumbar y el suelo, aprieta el abdomen hasta que no quepa.',
  pasos:[
    'Estira a la vez un brazo hacia atrás, por encima de la cabeza, y la pierna contraria hacia delante.',
    'Para justo antes de que la zona lumbar se despegue del suelo. Ese es tu recorrido.',
    'Vuelve despacio al centro.',
    'Cambia de lado. Cada ida y vuelta de un lado es una repetición.'
  ],
  respira:'Exhala largo mientras estiras, inhala al volver. Exhalar mientras estiras es lo que hace que funcione.',
  errores:[
    'Despegar la zona lumbar del suelo para llegar más lejos.',
    'Levantar la cabeza del suelo.',
    'Ir rápido.'
  ],
  senal:'Lo notas en el abdomen, por delante y por los lados.',
  siduele:'Mueve solo las piernas, con los brazos quietos al techo. O solo los brazos.',
  alternativa:'Bird dog: a cuatro patas, estira a la vez un brazo y la pierna contraria, con la mirada al suelo.',
  fases:['Brazos al techo, caderas y rodillas a 90°','Estira un brazo y la pierna contraria'],
  poses:[
    { x:120,y:150,tr:-90,cu:-90,cara:180, mFx:81,mFy:101, mBx:77,mBy:103, tFx:154,tFy:114, tBx:150,tBy:117, piF:180,piB:180 },
    { x:120,y:150,tr:-90,cu:-90,cara:180, mFx:33,mFy:142, mBx:77,mBy:103, tFx:154,tFy:114, tBx:186,tBy:146, piF:180,piB:120 }
  ],
  fondo:()=>AT.suelo(157)
}
];

/* ───────────────────────── SESIONES ───────────────────────── */

const SESIONES = {
  A: {
    nombre:'Sesión A', sub:'Bisagra y tirón', duracion:'30-32 min',
    bloques:[
      { tipo:'calentamiento', titulo:'Calentamiento', nota:'3 minutos, sin descanso entre ejercicios', ids:['C1','C2','C3','C4'] },
      { tipo:'superserie', titulo:'Superserie 1', rondas:3, descanso:'75 s', ids:['A1','A2'] },
      { tipo:'superserie', titulo:'Superserie 2', rondas:3, descanso:'75 s', ids:['A3','A4'] },
      { tipo:'superserie', titulo:'Superserie 3', rondas:2, descanso:'60 s', ids:['A5','A6'] },
      { tipo:'cierre', titulo:'Cierre', ids:['A7'] }
    ]
  },
  B: {
    nombre:'Sesión B', sub:'Empuje y pierna a una pierna', duracion:'30-32 min',
    bloques:[
      { tipo:'calentamiento', titulo:'Calentamiento', nota:'3 minutos, sin descanso entre ejercicios', ids:['C1','C2','C3','C4'] },
      { tipo:'superserie', titulo:'Superserie 1', rondas:3, descanso:'75 s', ids:['B1','B2'] },
      { tipo:'superserie', titulo:'Superserie 2', rondas:3, descanso:'75 s', ids:['B3','B4'] },
      { tipo:'superserie', titulo:'Superserie 3', rondas:3, descanso:'60 s', ids:['B5','B6'] },
      { tipo:'cierre', titulo:'Cierre', ids:['B7'] }
    ]
  }
};
