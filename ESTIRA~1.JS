/* ============================================================
   estiramientos.js — CATÁLOGO DE ESTIRAMIENTOS POR ZONAS
   y RUTINAS de mañana y noche.
   ============================================================ */
'use strict';

const ZONAS = [
  { id:'cu', nombre:'Cuello y nuca',          icono:'◠' },
  { id:'ho', nombre:'Hombros y pecho',        icono:'⌒' },
  { id:'to', nombre:'Espalda alta',           icono:'∩' },
  { id:'lu', nombre:'Espalda baja',           icono:'∪' },
  { id:'ca', nombre:'Cadera y glúteo',        icono:'◇' },
  { id:'is', nombre:'Detrás del muslo',       icono:'│' },
  { id:'cd', nombre:'Delante del muslo',      icono:'╱' },
  { id:'tb', nombre:'Gemelo y tobillo',       icono:'⌐' },
  { id:'ma', nombre:'Manos y antebrazos',     icono:'✋' },
  { id:'po', nombre:'Postura y respiración',  icono:'○' }
];

/* lienzo base para las manos */
function _antebrazo(w, largo){ return `<path d="M${w.x-largo} ${w.y}L${w.x} ${w.y}" stroke="var(--fig)" stroke-width="13" stroke-linecap="round"/>`; }

EJERCICIOS.push(

/* ═════════════════════════ CUELLO Y NUCA ═════════════════════════ */

{ id:'cu-craneo', grupo:'estiramiento', zona:'cu', nombre:'Flexión craneocervical', tiempo:'10 × 5 s',
  que:'Reentrena los flexores profundos del cuello, los músculos que sostienen la cabeza desde dentro. Con la cabeza adelantada se quedan dormidos y el trabajo lo hacen los de fuera, que son los que se contracturan.',
  montaje:'Tumbado boca arriba, rodillas dobladas, pies apoyados. Una toalla doblada bajo la cabeza, del grosor justo para que la cara quede mirando al techo y no hacia atrás.',
  pasos:[
    'Haz un asentimiento mínimo, como si dijeras "sí" muy despacio: la barbilla se desliza hacia el cuello y la nuca se alarga sobre la toalla.',
    'La cabeza no se levanta. Solo rueda un poco sobre la toalla.',
    'Aguanta 5 segundos, suelta. Diez veces.',
    'Pon dos dedos a los lados del cuello, sobre los músculos de delante: no deberían endurecerse.'
  ],
  respira:'Normal y por la nariz durante el aguante. No contengas el aire.',
  errores:[
    'Levantar la cabeza de la toalla: eso ya es otro ejercicio y trabaja los músculos equivocados.',
    'Meter la barbilla con fuerza. Es un gesto pequeño; si tiembla o te cuesta, aprietas demasiado.',
    'Notar los músculos de delante del cuello marcarse como cuerdas.'
  ],
  senal:'Una sensación muy suave en la parte profunda del cuello, por delante. Casi nada. Si se nota mucho, es que lo hacen los músculos superficiales.',
  siduele:'Reduce el gesto a la mitad y el aguante a 3 segundos.',
  alternativa:'Sentado contra una pared, con la nuca apoyada: el mismo asentimiento mínimo.',
  fases:['Cabeza apoyada, nuca neutra','Asentimiento mínimo: la nuca se alarga'],
  caja:'48 104 115 92',
  poses:[
    { x:148,y:150,tr:-90,cu:-90,cara:180, mFx:124,mFy:154, mBx:120,mBy:154, tFx:180,tFy:153,tBx:176,tBy:153 },
    { x:148,y:150,tr:-90,cu:-93,cara:148, mFx:124,mFy:154, mBx:120,mBy:154, tFx:180,tFy:153,tBx:176,tBy:153 }
  ],
  fondo:()=>AT.suelo(157)+AT.toalla(84,158,34),
  frente:(q,p,t)=>AT.siente({x:q.cb.x+2,y:q.cb.y-4},7,t)
},

{ id:'cu-retraccion', grupo:'estiramiento', zona:'cu', nombre:'Retracción cervical', tiempo:'10 × 3 s',
  que:'Devuelve la cabeza a su sitio, encima de los hombros. Es el gesto contrario a la cabeza adelantada y se puede hacer en cualquier parte, vestido, en diez segundos.',
  montaje:'De pie con la espalda contra una pared, o sentado con la espalda recta. Mirada al frente, horizontal.',
  pasos:[
    'Lleva la cabeza hacia atrás en horizontal, como si alguien te empujara suavemente la barbilla con un dedo.',
    'La mirada sigue horizontal: no mires al techo ni al suelo.',
    'Te sale papada. Es buena señal: quiere decir que lo haces bien.',
    'Aguanta 3 segundos y suelta.'
  ],
  respira:'Normal.',
  errores:['Inclinar la cabeza hacia abajo en vez de llevarla hacia atrás.','Echar los hombros hacia atrás a la vez: los hombros no se mueven.'],
  senal:'Estiramiento en la base del cráneo, por detrás.',
  siduele:'Menos recorrido. Si da mareo u hormigueo, para y coméntalo con tu fisio.',
  alternativa:'No necesita nada.',
  fases:['Cabeza adelantada','Atrás en horizontal, mirada al frente'],
  caja:'46 14 125 100',
  poses:[
    { x:100,y:112,tr:177,cu:158,cara:92, mFx:104,mFy:160, mBx:98,mBy:160 },
    { x:100,y:112,tr:180,cu:183,cara:90, mFx:104,mFy:160, mBx:98,mBy:160 }
  ],
  fondo:()=>AT.pared(84),
  frente:(q,p,t)=>AT.siente({x:q.cab.x-8,y:q.cab.y+8},7,t)+AT.flecha(124,46,112,46)
},

{ id:'cu-trapecio', grupo:'estiramiento', zona:'cu', nombre:'Estiramiento de trapecio superior', tiempo:'30 s por lado',
  que:'Estira el músculo que va del cuello al hombro, el que más se te carga. Es el que más alivio inmediato da en una tarde mala.',
  montaje:'Sentado, con una mano agarrada al borde de la silla por debajo del culo. Esa mano ancla el hombro abajo. De pie también vale, dejando caer ese brazo.',
  pasos:[
    'Con la otra mano, por encima de la cabeza, sujeta suavemente el lado contrario de la cabeza.',
    'Deja caer la cabeza hacia el hombro de la mano que sujeta. La mano solo acompaña el peso de la cabeza: no tira.',
    'Mantén la mirada al frente.',
    'Aguanta 30 segundos y cambia de lado.'
  ],
  respira:'Exhala largo y deja que en cada exhalación la cabeza caiga un poco más por su propio peso.',
  errores:['Tirar con la mano. El estiramiento lo hace el peso de la cabeza.','Subir el hombro del lado que se estira: por eso la otra mano agarra la silla.'],
  senal:'En el lado contrario a donde inclinas, entre el cuello y el hombro.',
  siduele:'Quita la mano de la cabeza y deja solo la inclinación.',
  alternativa:'No necesita nada.',
  vistaTxt:'Vista de frente',
  vista:'frente',
  fases:['Mano sobre la cabeza, la otra abajo','Deja caer la cabeza: la mano solo acompaña'],
  caja:'40 18 125 100',
  poses:[
    { x:100,y:113, cu:180, mIx:72,mIy:128, mDx:90,mDy:42 },
    { x:100,y:113, cu:155, mIx:72,mIy:130, mDx:97,mDy:46 }
  ],
  frente:(q,p,t)=>AT.siente({x:(q.cb.x+q.hI.x)/2-2,y:(q.cb.y+q.hI.y)/2},9,t)
},

{ id:'cu-elevador', grupo:'estiramiento', zona:'cu', nombre:'Estiramiento del elevador de la escápula', tiempo:'30 s por lado',
  que:'Estira el músculo que va de la escápula a las vértebras del cuello, por detrás. Suele estar detrás del dolor en la base del cuello y en la parte alta de la escápula.',
  montaje:'Sentado, una mano agarrada al borde de la silla por debajo del culo.',
  pasos:[
    'Gira la cabeza unos 45° hacia el lado contrario a la mano que agarra la silla, como si fueras a mirarte la axila.',
    'Ahora inclina la cabeza hacia abajo, siguiendo esa dirección: nariz hacia la axila.',
    'Con la otra mano en la parte de atrás de la cabeza, acompaña el peso sin tirar.',
    'Aguanta 30 segundos y cambia.'
  ],
  respira:'Exhalaciones largas, dejando caer la cabeza un poco más en cada una.',
  errores:['Tirar con la mano.','Encoger el hombro del lado que estiras.'],
  senal:'Detrás, en el lado contrario, desde la base del cráneo hasta la punta de arriba de la escápula.',
  siduele:'Sin la mano: solo el peso de la cabeza.',
  alternativa:'No necesita nada.',
  vistaTxt:'Vista de frente',
  vista:'frente',
  fases:['Gira la cabeza hacia la axila','Baja la nariz hacia la axila'],
  caja:'40 18 125 100',
  poses:[
    { x:100,y:113, cu:180, gira:0, mIx:72,mIy:128, mDx:90,mDy:42 },
    { x:100,y:113, cu:162, gira:0.9, mIx:72,mIy:130, mDx:100,mDy:42 }
  ],
  frente:(q,p,t)=>AT.siente({x:(q.cb.x+q.hI.x)/2+3,y:q.cb.y+2},9,t)
},

{ id:'cu-rotacion', grupo:'estiramiento', zona:'cu', nombre:'Rotación cervical activa', tiempo:'8 por lado',
  que:'Movilidad del cuello sin forzar. Útil en el recreo o después de un rato corrigiendo: mueve lo que lleva una hora quieto.',
  montaje:'Sentado o de pie, espalda recta, hombros abajo. Antes de empezar, haz una retracción cervical suave (cabeza atrás en horizontal).',
  pasos:[
    'Gira la cabeza despacio hacia un lado, como si miraras por encima del hombro.',
    'Llega hasta donde llegues sin forzar. Aguanta 2 segundos.',
    'Vuelve al centro y gira al otro lado.',
    'Ocho veces por lado.'
  ],
  respira:'Normal.',
  errores:['Girar con la cabeza adelantada: primero colócala, luego gira.','Acompañar con los hombros.'],
  senal:'Ligera tensión en el lado contrario al que giras.',
  siduele:'Menos recorrido. Si aparece mareo, para.',
  alternativa:'No necesita nada.',
  vistaTxt:'Vista de frente',
  vista:'frente',
  fases:['Mira a un lado','Y al otro, despacio'],
  caja:'50 14 100 80',
  poses:[ { x:100,y:113, gira:-1 }, { x:100,y:113, gira:1 } ],
  ritmo:[1800,700,1800,700]
},

/* ═════════════════════════ HOMBROS Y PECHO ═════════════════════════ */

{ id:'ho-puerta', grupo:'estiramiento', zona:'ho', nombre:'Apertura de pecho en el marco de la puerta', tiempo:'20-30 s por lado',
  que:'Estira el pectoral menor, el músculo que tira de la escápula hacia delante. Con la escápula adelantada, el trapecio inferior no tiene palanca para trabajar: es el mismo problema que ataca el prone Y, por el otro lado.',
  montaje:'Ponte en el hueco de una puerta. Apoya el antebrazo en el marco, con el codo a la altura del hombro y doblado a 90°, como si saludaras.',
  pasos:[
    'Con el antebrazo pegado al marco, da un paso pequeño hacia delante con el pie del mismo lado.',
    'Gira suavemente el pecho hacia el lado contrario, alejándolo del brazo.',
    'Hombro abajo, lejos de la oreja.',
    'Aguanta 20-30 segundos y cambia de brazo.'
  ],
  respira:'Exhala largo al girar el pecho.',
  errores:['Encoger el hombro del brazo apoyado.','Adelantar la cabeza al avanzar.','Forzar hasta notar pinchazo en la parte delantera del hombro.'],
  senal:'En el pecho, cerca de la axila, por delante del hombro.',
  siduele:'Codo más bajo, por debajo del hombro. Si notas hormigueo en la mano, baja aún más el codo.',
  alternativa:'Sin puerta: en una esquina de pared, o con las manos entrelazadas detrás de la espalda.',
  vistaTxt:'Vista desde arriba',
  fases:['Antebrazo en el marco, codo a la altura del hombro','Avanza y gira el pecho hacia el otro lado'],
  caja:'18 70 140 112',
  dibujo(t){
    const s=suave(t);
    const cx=_lerp(100,110,s), cy=_lerp(124,106,s), rot=_lerp(0,-22,s);
    const c={x:cx,y:cy}, hI=desde(c,rot+90,-22), hD=desde(c,rot+90,22);
    const codo={x:50,y:122};
    const otra=desde(hD, rot, 20);
    let o = `<path d="M-20 112H58M142 112H220" stroke="var(--fig-line)" stroke-width="9" stroke-linecap="butt"/>`;
    o += `<rect x="54" y="106" width="8" height="12" fill="var(--fig-line)"/>`;
    o += AT.siente({x:_lerp(hI.x,c.x,0.45),y:_lerp(hI.y,c.y,0.45)-6},10,t);
    o += `<path d="${Lp(hI,codo)}${Lp(hD,otra)}" stroke="var(--fig)" stroke-width="7.5" stroke-linecap="round" fill="none"/>`;
    o += `<circle cx="${codo.x}" cy="${codo.y}" r="6.5" fill="var(--fig)"/>`;
    o += `<path d="${Lp(hI,hD)}" stroke="var(--fig)" stroke-width="17" stroke-linecap="round"/>`;
    o += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="12.5" fill="var(--fig)" stroke="var(--fig-fill)" stroke-width="3"/>`;
    o += `<path d="${Lp(desde(c,rot+180,9),desde(c,rot+180,18))}" stroke="var(--fig)" stroke-width="5.5" stroke-linecap="round"/>`;
    o += `<text x="30" y="100" fill="var(--fig-dim)" font-size="11" text-anchor="middle">marco</text>`;
    return o;
  }
},

{ id:'ho-entrelazadas', grupo:'estiramiento', zona:'ho', nombre:'Manos entrelazadas detrás de la espalda', tiempo:'20-30 s',
  que:'Abre el pecho y la parte delantera de los hombros de golpe. La versión rápida del marco de la puerta, para cuando no hay puerta.',
  montaje:'De pie, pies a la anchura de la cadera. Entrelaza los dedos detrás de la espalda, a la altura del culo.',
  pasos:[
    'Estira los brazos y junta las escápulas.',
    'Lleva las manos un poco hacia atrás y hacia arriba, alejándolas del cuerpo, sin inclinarte hacia delante.',
    'Pecho arriba, mirada al frente, barbilla ligeramente metida.',
    'Aguanta 20-30 segundos.'
  ],
  respira:'Inhala abriendo el pecho y mantén respiraciones lentas.',
  errores:['Echar la cabeza hacia atrás.','Arquear la zona lumbar para subir más las manos.'],
  senal:'En el pecho y en la parte delantera de los hombros.',
  siduele:'Usa una toalla entre las manos si no llegas a entrelazar los dedos.',
  alternativa:'Con una toalla o un cinturón sujeto con las dos manos.',
  fases:['Manos entrelazadas atrás','Brazos atrás y arriba, pecho abierto'],
  poses:[
    { x:100,y:112,tr:180,cu:180, mFx:86,mFy:118, mBx:84,mBy:118 },
    { x:100,y:112,tr:181,cu:180, mFx:66,mFy:106, mBx:64,mBy:106 }
  ],
  fondo:()=>AT.suelo(),
  frente:(q,p,t)=>AT.siente({x:q.hom.x+7,y:q.hom.y+6},9,t)
},

{ id:'ho-cruzado', grupo:'estiramiento', zona:'ho', nombre:'Brazo cruzado por delante del pecho', tiempo:'30 s por lado',
  que:'Estira la parte trasera del hombro. Útil si notas el hombro "tirante" al levantar el brazo.',
  montaje:'De pie o sentado, hombros abajo.',
  pasos:[
    'Lleva un brazo estirado cruzado por delante del pecho, a la altura del hombro.',
    'Con la otra mano, sujeta el brazo por encima del codo y acércalo al pecho.',
    'El hombro del brazo estirado se queda abajo, lejos de la oreja.',
    'Aguanta 30 segundos y cambia.'
  ],
  respira:'Exhalaciones largas.',
  errores:['Subir el hombro.','Girar el tronco para acompañar el brazo: el tronco mira al frente.'],
  senal:'En la parte de atrás del hombro.',
  siduele:'Brazo un poco más bajo.',
  alternativa:'No necesita nada.',
  vistaTxt:'Vista de frente',
  vista:'frente',
  fases:['Brazo hacia el otro lado','Acércalo al pecho por encima del codo'],
  caja:'34 22 140 112',
  poses:[
    { x:100,y:113, mIx:94,mIy:92, mDx:100,mDy:90, signos:{codoI:1,codoD:-1} },
    { x:100,y:113, mIx:94,mIy:80, mDx:62,mDy:80 }
  ],
  frente:(q,p,t)=>AT.siente({x:q.hD.x+4,y:q.hD.y-2},8,t)
},

{ id:'ho-lateral', grupo:'estiramiento', zona:'ho', nombre:'Estiramiento lateral con brazo arriba', tiempo:'20 s por lado',
  que:'Estira el dorsal ancho y todo el costado. Libera los hombros por abajo, que es por donde se quedan "cogidos" cuando el brazo no sube del todo.',
  montaje:'De pie, pies a la anchura de la cadera. Una mano en la cadera.',
  pasos:[
    'Sube el otro brazo estirado por encima de la cabeza.',
    'Inclina el tronco hacia el lado de la mano en la cadera, como si te alargaras por encima de un barril.',
    'La cadera no se desplaza hacia el otro lado más de lo necesario.',
    'Aguanta 20 segundos y cambia.'
  ],
  respira:'Inhala alargándote, exhala inclinándote.',
  errores:['Inclinarte hacia delante en vez de hacia el lado.','Encoger el hombro del brazo que sube: alarga, no encojas.'],
  senal:'En todo el costado del brazo que sube, desde la cadera hasta la axila.',
  siduele:'Inclínate menos.',
  alternativa:'Sentado, con la mano agarrando el borde de la silla.',
  vistaTxt:'Vista de frente',
  vista:'frente',
  fases:['Brazo arriba','Inclínate hacia el otro lado'],
  poses:[
    { x:100,y:113, mIx:88,mIy:110, mDx:122,mDy:22, signos:{codoI:1} },
    { x:100,y:113, tr:198, mIx:84,mIy:110, mDx:72,mDy:28 }
  ],
  fondo:()=>AT.suelo(),
  frente:(q,p,t)=>AT.siente({x:q.hD.x+2,y:(q.hD.y+q.cD.y)/2},11,t)
},

{ id:'ho-pared', grupo:'estiramiento', zona:'ho', nombre:'Deslizamiento escapular en la pared', tiempo:'10 repeticiones',
  que:'Moviliza las escápulas hacia arriba y hacia abajo con el apoyo de la pared. Activa el trapecio inferior y el serrato a la vez que estira el pecho.',
  montaje:'De espaldas a una pared, talones a un palmo de ella. Culo, espalda alta y, si llegas sin forzar, la cabeza tocan la pared. Brazos en "W": codos doblados a la altura de los hombros, dorso de antebrazos y manos contra la pared.',
  pasos:[
    'Desliza los brazos hacia arriba, sin perder el contacto con la pared, hasta formar una Y.',
    'Para cuando los antebrazos se despeguen o los hombros empiecen a subir hacia las orejas: ese es tu recorrido de hoy.',
    'Baja de nuevo a la W tirando de los codos hacia abajo, hacia los bolsillos.',
    'Diez repeticiones lentas.'
  ],
  respira:'Exhala al subir.',
  errores:['Encoger los hombros para subir más.','Arquear la zona lumbar y separarla de la pared.','Adelantar la cabeza.'],
  senal:'Entre las escápulas y en el pecho. Nada en el cuello.',
  siduele:'Recorrido más corto. Si la cabeza no llega a la pared sin forzar, no la fuerces: es normal con tu postura y mejora con las semanas.',
  alternativa:'Tumbado boca arriba en el suelo, el mismo movimiento ("ángel en el suelo").',
  vistaTxt:'Vista de frente',
  vista:'frente',
  fases:['Brazos en W, contra la pared','Sube en Y sin despegar ni encoger'],
  poses:[
    { x:100,y:113, mIx:56,mIy:46, mDx:144,mDy:46 },
    { x:100,y:113, mIx:62,mIy:20, mDx:138,mDy:20 }
  ],
  incluir:[[100,186]],
  fondo:()=>AT.suelo()+`<rect x="36" y="-40" width="128" height="226" rx="6" fill="var(--fig-box)"/>`,
  frente:(q,p,t)=> t<0.4 ? AT.flecha(q.codoI.x-8,q.codoI.y-4,q.codoI.x-8,q.codoI.y-22) : '',
  mal:{ texto:'Encoger los hombros para subir más: el trapecio superior toma el mando.',
        poses:[{ x:100,y:113, encoge:1, mIx:62,mIy:12, mDx:138,mDy:12 }] }
},

/* ═════════════════════════ ESPALDA ALTA ═════════════════════════ */

{ id:'to-libro', grupo:'estiramiento', zona:'to', nombre:'Apertura en libro', tiempo:'8 por lado',
  que:'Rotación de la columna torácica y apertura del pecho. Es la zona que más se bloquea con la postura de hombros adelantados, y cuando no gira, el cuello gira por ella.',
  montaje:'Tumbado de lado, con la cabeza apoyada en un cojín o en el brazo de abajo. Rodillas dobladas a 90°, una encima de otra. Brazos estirados al frente, juntos, a la altura del pecho.',
  pasos:[
    'Abre el brazo de arriba en un arco por encima del cuerpo, hacia el otro lado, como si abrieras un libro.',
    'Sigue la mano con la mirada: la cabeza gira con el pecho.',
    'Las rodillas no se mueven. Si se separan, has girado la cadera en vez de la espalda.',
    'Llega hasta donde llegues sin forzar, aguanta 2 segundos y vuelve. Ocho por lado.'
  ],
  respira:'Exhala largo al abrir, inhala al cerrar.',
  errores:['Separar las rodillas.','Forzar el brazo hasta el suelo: llegar o no llegar da igual.','Ir rápido.'],
  senal:'En el pecho y entre las escápulas.',
  siduele:'Abre menos. Pon un cojín más alto bajo la cabeza.',
  alternativa:'Sentado: brazos cruzados sobre el pecho, gira el tronco con la cadera quieta.',
  vistaTxt:'Vista desde la cabeza',
  fases:['De lado, rodillas juntas, brazos al frente','Abre el brazo de arriba siguiéndolo con la mirada'],
  caja:'22 50 156 125',
  dibujo(t){
    const s=suave(t);
    const Sb={x:92,y:160};
    const th=_lerp(180,232,s);                 /* el hombro de arriba rota hacia atrás */
    const St=desde(Sb,th,38);
    const M={x:(Sb.x+St.x)/2,y:(Sb.y+St.y)/2};
    const aT=_lerp(74,282,s);                  /* el brazo de arriba barre por encima */
    const mT=desde(St,aT,52);
    const mira=_lerp(80,268,s);
    let o=AT.suelo(172);
    /* recorrido de la mano: arco tenue */
    const St0=desde(Sb,180,38), a0=desde(St0,74,52), a1=desde(St0,282,52);
    o+=`<path d="M${f1(a0.x)} ${f1(a0.y)}A52 52 0 1 0 ${f1(a1.x)} ${f1(a1.y)}" fill="none" stroke="var(--fig-acc)" stroke-width="2.2" stroke-dasharray="4 6" opacity=".55"/>`;
    /* rodillas, al fondo y quietas */
    o+=`<path d="M100 166L132 166M100 156L132 157" stroke="var(--fig-dim)" stroke-width="9" stroke-linecap="round"/>`;
    o+=`<text x="136" y="146" fill="var(--fig-dim)" font-size="10">rodillas</text><text x="136" y="157" fill="var(--fig-dim)" font-size="10">quietas</text>`;
    o+=AT.siente({x:_lerp(Sb.x,St.x,0.62)+5,y:_lerp(Sb.y,St.y,0.62)+2},12,t);
    /* brazo de abajo, en el suelo */
    o+=`<path d="M${Sb.x} ${Sb.y}L146 166" stroke="var(--fig)" stroke-width="7" stroke-linecap="round"/>`;
    /* hombros y cabeza */
    o+=`<path d="${Lp(Sb,St)}" stroke="var(--fig)" stroke-width="15" stroke-linecap="round"/>`;
    o+=`<circle cx="${f1(M.x)}" cy="${f1(M.y)}" r="11.5" fill="var(--fig)"/>`;
    o+=`<path d="${Lp(desde(M,mira,7),desde(M,mira,16))}" stroke="var(--fig)" stroke-width="5" stroke-linecap="round"/>`;
    /* brazo de arriba */
    o+=`<path d="${Lp(St,mT)}" stroke="var(--fig)" stroke-width="7" stroke-linecap="round"/>`;
    o+=`<circle cx="${f1(mT.x)}" cy="${f1(mT.y)}" r="4.5" fill="var(--fig-acc)"/>`;
    return o;
  }
},

{ id:'to-silla', grupo:'estiramiento', zona:'to', nombre:'Extensión torácica en la silla', tiempo:'8 repeticiones',
  que:'Extiende la parte alta de la espalda, que con tantas horas de pie y mirando hacia abajo se queda redondeada. Se puede hacer en el colegio en treinta segundos.',
  montaje:'Sentado en una silla con respaldo que te llegue a la mitad de la espalda. Manos entrelazadas detrás de la nuca, codos al frente.',
  pasos:[
    'Apoya la mitad de la espalda en el borde del respaldo.',
    'Echa la espalda alta hacia atrás por encima del respaldo, abriendo los codos.',
    'La zona lumbar no se arquea: el movimiento es solo de la mitad de la espalda para arriba.',
    'Vuelve y repite ocho veces.'
  ],
  respira:'Exhala al ir hacia atrás.',
  errores:['Echar la cabeza hacia atrás: las manos la sujetan y va con el tronco.','Arquear la lumbar.'],
  senal:'En la espalda alta, a la altura del respaldo.',
  siduele:'Menos recorrido.',
  alternativa:'Tumbado sobre una toalla enrollada a lo largo de la columna.',
  fases:['Sentado, manos en la nuca','Espalda alta hacia atrás sobre el respaldo'],
  poses:[
    { x:90,y:134,tr:178,cu:178, mFx:82,mFy:68, mBx:80,mBy:68, tFx:126,tFy:182,tBx:122,tBy:182 },
    { x:90,y:134,tr:202,cu:206, mFx:56,mFy:80, mBx:54,mBy:80, tFx:126,tFy:182,tBx:122,tBy:182 }
  ],
  fondo:()=>AT.suelo()+AT.silla(70,140,40,46,44,'izq'),
  frente:(q,p,t)=>AT.siente({x:q.hom.x+2,y:q.hom.y+12},9,t)
},

{ id:'to-rodillo', grupo:'estiramiento', zona:'to', nombre:'Extensión torácica sobre rodillo o toalla', tiempo:'8 respiraciones por zona',
  que:'Lo mismo que en la silla pero más profundo, con el suelo como apoyo. Muy bueno al final del día.',
  montaje:'Tumbado boca arriba con un rodillo de espuma o una toalla bien enrollada atravesada bajo la espalda, a la altura de las escápulas. Rodillas dobladas. Manos entrelazadas detrás de la cabeza, sujetándola.',
  pasos:[
    'Con la cabeza sujeta por las manos, deja que la espalda alta se arquee sobre el rodillo.',
    'Aguanta ahí 8 respiraciones.',
    'Levanta un poco la cadera, mueve el rodillo un par de dedos hacia arriba y repite. Tres zonas.',
    'Nunca por debajo de las costillas: la zona lumbar no se trabaja así.'
  ],
  respira:'Respiraciones lentas. En cada exhalación, deja caer la espalda un poco más.',
  errores:['Poner el rodillo bajo la zona lumbar.','Soltar la cabeza y dejarla colgar hacia atrás.'],
  senal:'En la columna, a la altura del rodillo.',
  siduele:'Usa una toalla más fina.',
  alternativa:'Extensión torácica en la silla.',
  fases:['Rodillo bajo las escápulas, cabeza sujeta','Deja que la espalda alta se arquee'],
  poses:[
    { x:130,y:147,tr:-93,cu:-110,cara:170, mFx:70,mFy:136, mBx:68,mBy:138, tFx:162,tFy:153,tBx:158,tBy:153, signos:{codoF:1,codoB:1} },
    { x:130,y:147,tr:-84,cu:-96,cara:185,curva:-3, mFx:70,mFy:146, mBx:68,mBy:148, tFx:162,tFy:153,tBx:158,tBy:153 }
  ],
  fondo:()=>AT.suelo(157)+AT.rodillo(98,150,7),
  frente:(q,p,t)=>AT.siente({x:98,y:141},9,t)
},

{ id:'to-gato', grupo:'estiramiento', zona:'to', nombre:'Gato-camello', tiempo:'10 ciclos',
  que:'Mueve toda la columna, vértebra a vértebra, en las dos direcciones. Es el despertador de la espalda.',
  montaje:'A cuatro patas: manos bajo los hombros, rodillas bajo las caderas.',
  pasos:[
    'Redondea la espalda hacia el techo empujando el suelo, y deja caer la cabeza mirándote el ombligo.',
    'Después arquea suavemente: el pecho baja, la mirada va al suelo un poco por delante de las manos.',
    'Por la mañana, rango medio: sin llegar al final del recorrido en ninguna de las dos direcciones.',
    'Diez ciclos lentos.'
  ],
  respira:'Exhala al redondear, inhala al arquear.',
  errores:['Echar la cabeza hacia atrás al arquear: la mirada va al suelo, no al frente.','Hacerlo rápido.'],
  senal:'Movimiento en toda la espalda, sin dolor.',
  siduele:'Menos recorrido, sobre todo al arquear.',
  alternativa:'Sentado en una silla con las manos en las rodillas: el mismo movimiento.',
  fases:['Gato: espalda redonda, mirada al ombligo','Camello suave: el pecho baja, mirada al suelo'],
  poses:[
    { x:110,y:136,tr:100,cu:30,cara:-60,curva:9, mFx:170,mFy:172, mBx:166,mBy:172, tFx:76,tFy:172,tBx:72,tBy:172, piF:-90,piB:-90 },
    { x:110,y:138,tr:102,cu:118,cara:60,curva:-5, mFx:170,mFy:172, mBx:166,mBy:172, tFx:76,tFy:172,tBx:72,tBy:172, piF:-90,piB:-90 }
  ],
  fondo:()=>AT.suelo(176)
},

{ id:'to-rotacion', grupo:'estiramiento', zona:'to', nombre:'Rotación torácica a cuatro patas', tiempo:'8 por lado',
  que:'Rotación de la espalda alta con la cadera bloqueada, así que solo gira lo que tiene que girar.',
  montaje:'A cuatro patas, rodillas bajo las caderas. Para bloquear más la cadera, siéntate un poco hacia los talones.',
  pasos:[
    'Lleva una mano detrás de la nuca.',
    'Baja ese codo hacia el brazo de apoyo, por debajo del pecho.',
    'Ahora gíralo hacia arriba, hacia el techo, siguiéndolo con la mirada.',
    'Ocho por lado, despacio.'
  ],
  respira:'Exhala al abrir hacia el techo.',
  errores:['Mover la cadera.','Empujar la cabeza con la mano.'],
  senal:'Entre las escápulas y en el pecho.',
  siduele:'Menos recorrido.',
  alternativa:'Apertura en libro.',
  fases:['A cuatro patas, mano en el suelo','Mano a la nuca y abre el codo al techo'],
  poses:[
    { x:110,y:136,tr:100,cu:100, mFx:170,mFy:172, mBx:166,mBy:172, tFx:76,tFy:172,tBx:72,tBy:172, piF:-90,piB:-90, signos:{codoF:1,codoB:-1} },
    { x:110,y:136,tr:100,cu:140,cara:70, mFx:160,mFy:116, mBx:166,mBy:172, tFx:76,tFy:172,tBx:72,tBy:172, piF:-90,piB:-90 }
  ],
  fondo:()=>AT.suelo(176),
  frente:(q,p,t)=>AT.siente({x:q.hom.x-14,y:q.hom.y-4},9,t)
},

/* ═════════════════════════ ESPALDA BAJA ═════════════════════════ */

{ id:'lu-nino', grupo:'estiramiento', zona:'lu', nombre:'Postura del niño', tiempo:'30-60 s',
  que:'Descomprime la zona lumbar y estira la espalda entera. Es una postura de descanso: se aguanta sin esfuerzo.',
  montaje:'De rodillas en el suelo, rodillas algo separadas, empeines apoyados.',
  pasos:[
    'Lleva el culo hacia los talones.',
    'Deja caer el pecho hacia el suelo, entre o sobre los muslos.',
    'Estira los brazos al frente sobre el suelo. La frente apoyada, o sobre un cojín.',
    'Quédate ahí respirando.'
  ],
  respira:'Respira llevando el aire hacia la espalda: notarás cómo se ensancha.',
  errores:['Dejar la cabeza colgando sin apoyo: pon un cojín si no llega.'],
  senal:'En la zona lumbar y en los costados de la espalda.',
  siduele:'Si molestan las rodillas, pon una toalla doblada entre los talones y el culo.',
  alternativa:'Rodillas al pecho, tumbado boca arriba.',
  fases:['A cuatro patas','Culo a los talones, brazos al frente'],
  poses:[
    { x:110,y:136,tr:100,cu:100, mFx:170,mFy:172, mBx:166,mBy:172, tFx:76,tFy:172,tBx:72,tBy:172, piF:-90,piB:-90 },
    { x:84,y:150,tr:76,cu:84,cara:-10, mFx:170,mFy:172, mBx:166,mBy:172, tFx:76,tFy:172,tBx:72,tBy:172, piF:-90,piB:-90 }
  ],
  fondo:()=>AT.suelo(176),
  frente:(q,p,t)=> t>0.5 ? AT.siente({x:q.cad.x+12,y:q.cad.y-6},11,t) : ''
},

{ id:'lu-rodillas', grupo:'estiramiento', zona:'lu', nombre:'Rodillas al pecho', tiempo:'30 s',
  que:'Estira suavemente la zona lumbar y los glúteos. La forma más sencilla de aliviar la espalda baja al final del día.',
  montaje:'Tumbado boca arriba, rodillas dobladas, pies apoyados. Cabeza apoyada.',
  pasos:[
    'Sube las rodillas hacia el pecho.',
    'Abrázalas con las manos por debajo de las rodillas, sobre las espinillas.',
    'Acércalas suavemente al pecho. Puedes balancearte un poco de lado a lado.',
    'La cabeza se queda en el suelo.'
  ],
  respira:'Exhala acercando las rodillas.',
  errores:['Levantar la cabeza para acercarte a las rodillas.'],
  senal:'En la zona lumbar y los glúteos.',
  siduele:'Una rodilla cada vez.',
  alternativa:'Postura del niño.',
  fases:['Tumbado, pies apoyados','Rodillas al pecho, cabeza en el suelo'],
  poses:[
    { x:130,y:150,tr:-90,cu:-90,cara:180, mFx:132,mFy:154, mBx:128,mBy:154, tFx:160,tFy:153,tBx:156,tBy:153 },
    { x:130,y:150,tr:-90,cu:-90,cara:180, mFx:114,mFy:118, mBx:110,mBy:120, tFx:140,tFy:118,tBx:136,tBy:120, piF:150,piB:150 }
  ],
  fondo:()=>AT.suelo(157),
  frente:(q,p,t)=>AT.siente({x:q.cad.x-6,y:q.cad.y-2},10,t)
},

{ id:'lu-giro', grupo:'estiramiento', zona:'lu', nombre:'Giro lumbar tumbado', tiempo:'30 s por lado',
  que:'Rotación suave de la zona lumbar y estiramiento de los glúteos y el costado.',
  montaje:'Tumbado boca arriba, rodillas dobladas y juntas, pies apoyados. Brazos abiertos en cruz, en el suelo.',
  pasos:[
    'Deja caer las dos rodillas juntas hacia un lado, despacio.',
    'Los dos hombros se quedan en el suelo.',
    'Si quieres más, gira la cabeza hacia el lado contrario.',
    'Aguanta 30 segundos y cambia.'
  ],
  respira:'Exhalaciones largas, dejando que las rodillas caigan solas.',
  errores:['Despegar el hombro del lado contrario.','Forzar las rodillas hasta el suelo.'],
  senal:'En la zona lumbar, el glúteo y el costado.',
  siduele:'Pon un cojín donde caen las rodillas para que no bajen tanto.',
  alternativa:'Sentado: cruza una pierna y gira el tronco hacia ella.',
  vistaTxt:'Vista desde arriba',
  fases:['Boca arriba, rodillas juntas arriba','Deja caer las rodillas a un lado'],
  caja:'4 8 190 152',
  dibujo(t){
    const s=suave(t);
    let o='';
    const gira=_lerp(0,-1,s);
    o+=AT.siente({x:_lerp(100,96,s),y:104},12,t);
    o+=`<path d="M74 54L30 58M126 54L170 58" stroke="var(--fig)" stroke-width="7.5" stroke-linecap="round"/>`;
    o+=`<path d="M100 54L100 100" stroke="var(--fig)" stroke-width="20" stroke-linecap="round"/>`;
    o+=`<path d="M74 54L126 54" stroke="var(--fig)" stroke-width="17" stroke-linecap="round"/>`;
    o+=`<path d="M88 104L112 104" stroke="var(--fig)" stroke-width="15" stroke-linecap="round"/>`;
    const r1={x:_lerp(92,140,s),y:_lerp(122,110,s)}, r2={x:_lerp(108,140,s),y:_lerp(122,122,s)};
    const p1={x:_lerp(92,124,s),y:_lerp(138,134,s)}, p2={x:_lerp(108,124,s),y:_lerp(138,146,s)};
    o+=`<path d="M90 106L${f1(r1.x)} ${f1(r1.y)}L${f1(p1.x)} ${f1(p1.y)}" stroke="var(--fig-dim)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    o+=`<path d="M110 106L${f1(r2.x)} ${f1(r2.y)}L${f1(p2.x)} ${f1(p2.y)}" stroke="var(--fig)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    o+=`<circle cx="100" cy="32" r="12.5" fill="var(--fig)" stroke="var(--fig-fill)" stroke-width="3"/>`;
    const nz=desde({x:100,y:32}, 180+gira*60, 9), nz2=desde({x:100,y:32},180+gira*60,17);
    o+=`<path d="${Lp(nz,nz2)}" stroke="var(--fig)" stroke-width="5" stroke-linecap="round"/>`;
    return o;
  }
},

{ id:'lu-esfinge', grupo:'estiramiento', zona:'lu', nombre:'Esfinge suave', tiempo:'30-60 s',
  que:'Extensión suave de la zona lumbar, apoyado en los antebrazos. Compensa las horas sentado y las flexiones del día.',
  montaje:'Tumbado boca abajo. Antebrazos en el suelo, codos bajo los hombros.',
  pasos:[
    'Empuja suavemente el suelo con los antebrazos y deja que el pecho suba.',
    'La pelvis y las piernas se quedan en el suelo, relajadas.',
    'Mirada al suelo, un poco por delante de las manos. Nuca larga.',
    'Quédate ahí respirando.'
  ],
  respira:'Respiraciones lentas, soltando la zona lumbar.',
  errores:['Mirar al frente o al techo: el cuello se va a extensión.','Apretar los glúteos. Relájalos.'],
  senal:'Ligera compresión agradable en la zona lumbar. No dolor.',
  siduele:'Apóyate menos alto, con los codos más adelantados. Si molesta la lumbar, déjalo.',
  alternativa:'Gato-camello.',
  fases:['Boca abajo, sobre los antebrazos','El pecho sube, la mirada al suelo'],
  poses:[
    { x:82,y:150,tr:96,cu:100,cara:20, mFx:148,mFy:156, mBx:144,mBy:156, tFx:14,tFy:154,tBx:12,tBy:154, piF:-90,piB:-90, signos:{codoF:-1,codoB:-1} },
    { x:82,y:150,tr:114,cu:116,cara:30, mFx:146,mFy:156, mBx:142,mBy:156, tFx:14,tFy:154,tBx:12,tBy:154, piF:-90,piB:-90 }
  ],
  fondo:()=>AT.suelo(160),
  frente:(q,p,t)=>AT.siente({x:q.cad.x+10,y:q.cad.y-6},10,t),
  mal:{ texto:'Mirar al frente o al techo: el cuello se va a extensión.',
        poses:[{ x:82,y:150,tr:114,cu:170,cara:110, mFx:146,mFy:156, mBx:142,mBy:156, tFx:14,tFy:154,tBx:12,tBy:154, piF:-90,piB:-90 }] }
},

/* ═════════════════════════ CADERA Y GLÚTEO ═════════════════════════ */

{ id:'ca-cuclillas', grupo:'estiramiento', zona:'ca', nombre:'Cuclillas profundas', tiempo:'45-60 s', thumb:0,
  que:'La postura de cuclillas que se usa en buena parte de Asia para descansar. Recupera de golpe la movilidad de tobillo, cadera y zona lumbar baja, y es la más específica contra ocho horas entre estar de pie y la silla.',
  montaje:'De pie, pies a la anchura de los hombros o algo más, puntas un poco hacia fuera.',
  pasos:[
    'Baja hasta abajo del todo manteniendo los talones en el suelo.',
    'Codos por dentro de las rodillas, empujándolas suavemente hacia fuera. Manos juntas delante del pecho.',
    'Pecho arriba, mirada al frente.',
    'Si quieres más: una mano al suelo y abre el otro brazo hacia el techo, girando el tronco. Tres por lado.'
  ],
  respira:'Respiraciones lentas. Con cada exhalación, baja un poco más.',
  errores:['Levantar los talones. Si se levantan, usa la regresión.','Dejar que las rodillas se cierren hacia dentro.'],
  senal:'En las ingles, los tobillos y la zona lumbar baja.',
  siduele:'Regresión: un libro de 3-4 cm bajo los talones, y agárrate al marco de una puerta o a un pomo para repartir el peso. Agarrado se puede desde el primer día.',
  alternativa:'Sentado en un taburete muy bajo, con las rodillas abiertas.',
  fases:['Abajo, talones en el suelo, codos empujando','Una mano al suelo y abre el otro brazo'],
  poses:[
    { x:96,y:164,tr:162,cu:172, mFx:128,mFy:137, mBx:126,mBy:139, tFx:112,tFy:182,tBx:106,tBy:182, signos:{codoF:-1,codoB:-1} },
    { x:96,y:164,tr:160,cu:176,cara:120, mFx:114,mFy:76, mBx:122,mBy:174, tFx:112,tFy:182,tBx:106,tBy:182 }
  ],
  fondo:()=>AT.suelo(),
  frente:(q,p,t)=>AT.siente({x:q.cad.x+6,y:q.cad.y+4},10,t)
},

{ id:'ca-figura4', grupo:'estiramiento', zona:'ca', nombre:'Figura 4 sentado', tiempo:'30 s por lado',
  que:'Estira el glúteo y el piriforme, el músculo profundo de la cadera. Se puede hacer en la silla del colegio sin que parezca raro.',
  montaje:'Sentado en el borde de una silla, pies en el suelo. Cruza una pierna apoyando el tobillo sobre la rodilla contraria, de forma que la rodilla de la pierna cruzada caiga hacia fuera.',
  pasos:[
    'Pon una mano sobre la rodilla cruzada y la otra sobre el tobillo.',
    'Con la espalda larga, inclínate hacia delante desde la cadera.',
    'Para cuando lo notes en el glúteo de la pierna cruzada.',
    'Aguanta 30 segundos y cambia.'
  ],
  respira:'Exhala al inclinarte.',
  errores:['Redondear la espalda para bajar más.','Empujar la rodilla con fuerza.'],
  senal:'En el glúteo de la pierna cruzada.',
  siduele:'No te inclines: solo cruzar la pierna ya estira.',
  alternativa:'Tumbado boca arriba, con el tobillo sobre la rodilla contraria, tirando del muslo hacia ti.',
  fases:['Tobillo sobre la rodilla contraria','Espalda larga, inclínate desde la cadera'],
  poses:[
    { x:84,y:146,tr:178,cu:178, mFx:98,mFy:120, mBx:114,mBy:138, tFx:118,tFy:140, tBx:120,tBy:180, piF:150, piB:95 },
    { x:84,y:146,tr:148,cu:148, mFx:104,mFy:124, mBx:118,mBy:140, tFx:118,tFy:140, tBx:120,tBy:180, piF:150, piB:95 }
  ],
  fondo:()=>AT.suelo(184)+AT.silla(62,150,40,34,46,'izq'),
  frente:(q,p,t)=>AT.siente({x:q.cad.x-8,y:q.cad.y+2},10,t)
},

{ id:'ca-mariposa', grupo:'estiramiento', zona:'ca', nombre:'Mariposa', tiempo:'30-60 s',
  que:'Estira los aductores, la cara interna del muslo, y abre la cadera.',
  montaje:'Sentado en el suelo. Junta las plantas de los pies y deja caer las rodillas hacia fuera. Sujeta los pies con las manos.',
  pasos:[
    'Siéntate alto, con la espalda larga.',
    'Deja que las rodillas caigan solas hacia el suelo, sin empujarlas.',
    'Si quieres más, inclínate hacia delante desde la cadera con la espalda recta.',
    'Quédate ahí respirando.'
  ],
  respira:'Exhalaciones largas.',
  errores:['Rebotar las rodillas como alas.','Redondear la espalda.'],
  senal:'En la cara interna de los muslos y las ingles.',
  siduele:'Aleja los pies del cuerpo. Siéntate sobre un cojín.',
  alternativa:'Aductor lateral de pie.',
  vistaTxt:'Vista de frente',
  vista:'frente',
  fases:['Sentado alto, plantas juntas'],
  poses:[
    { x:100,y:158, mIx:90,mIy:166, mDx:110,mDy:166, tIx:86,tIy:168, tDx:114,tDy:168, signos:{rodI:-1,rodD:1,codoI:1,codoD:-1} }
  ],
  fondo:()=>AT.suelo(174),
  frente:(q,p,t)=>AT.siente({x:(q.cI.x+q.rodI.x)/2,y:(q.cI.y+q.rodI.y)/2},9,t)+AT.siente({x:(q.cD.x+q.rodD.x)/2,y:(q.cD.y+q.rodD.y)/2},9,t)
},

{ id:'ca-aductor', grupo:'estiramiento', zona:'ca', nombre:'Aductor lateral de pie', tiempo:'20 s por lado',
  que:'Estira la cara interna del muslo de pie, sin tener que tumbarte.',
  montaje:'De pie con las piernas muy separadas, puntas de los pies mirando al frente o un poco hacia fuera.',
  pasos:[
    'Desplaza el peso hacia un lado doblando esa rodilla.',
    'La otra pierna se queda estirada, con el pie entero apoyado.',
    'Cadera atrás, como si fueras a sentarte de lado. Pecho arriba.',
    'Aguanta 20 segundos y cambia.'
  ],
  respira:'Exhala al bajar.',
  errores:['Que la rodilla doblada se vaya hacia dentro: apunta a la punta del pie.','Redondear la espalda.'],
  senal:'En la cara interna del muslo de la pierna estirada.',
  siduele:'Baja menos y separa menos los pies.',
  alternativa:'Mariposa.',
  vistaTxt:'Vista de frente',
  vista:'frente',
  fases:['Piernas muy separadas','Peso a un lado, la otra pierna estirada'],
  poses:[
    { x:100,y:124, mIx:96,mIy:98, mDx:104,mDy:98, tIx:54,tIy:182, tDx:146,tDy:182, signos:{codoI:1,codoD:-1} },
    { x:78,y:140, mIx:74,mIy:114, mDx:82,mDy:114, tIx:54,tIy:182, tDx:146,tDy:182 }
  ],
  fondo:()=>AT.suelo(),
  frente:(q,p,t)=> t>0.4 ? AT.siente({x:(q.cD.x+q.rodD.x)/2+4,y:(q.cD.y+q.rodD.y)/2},9,t) : ''
},

/* ═════════════════════════ DETRÁS DEL MUSLO ═════════════════════════ */

{ id:'is-escalon', grupo:'estiramiento', zona:'is', nombre:'Isquios con el pie en alto', tiempo:'30 s por lado',
  que:'Estira la parte de atrás del muslo. Isquios cortos tiran de la pelvis y cambian la postura de toda la columna, cuello incluido.',
  montaje:'De pie frente a una silla, un escalón o el borde del sofá. Apoya el talón de una pierna encima, con esa pierna estirada y la punta del pie hacia arriba.',
  pasos:[
    'Pon las manos en la cadera.',
    'Con la espalda larga, inclínate hacia delante llevando la cadera hacia atrás, como en el peso muerto.',
    'Para cuando notes tensión detrás del muslo.',
    'Aguanta 30 segundos y cambia.'
  ],
  respira:'Exhala al inclinarte.',
  errores:['Redondear la espalda para llegar con las manos al pie.','Bloquear la rodilla de la pierna de apoyo.'],
  senal:'Detrás del muslo de la pierna en alto.',
  siduele:'Apoyo más bajo.',
  alternativa:'Tumbado con una toalla.',
  fases:['Talón en alto, pierna estirada','Inclínate desde la cadera, espalda larga'],
  poses:[
    { x:98,y:112,tr:178,cu:178, mFx:104,mFy:110, mBx:96,mBy:110, tFx:160,tFy:128, tBx:96,tBy:182, piF:170,piB:95 },
    { x:92,y:114,tr:140,cu:142, mFx:128,mFy:122, mBx:124,mBy:124, tFx:160,tFy:128, tBx:96,tBy:182, piF:170,piB:95 }
  ],
  fondo:()=>AT.suelo()+AT.caja(150,132,46,54),
  frente:(q,p,t)=>AT.siente({x:(q.cad.x+q.rodF.x)/2+4,y:(q.cad.y+q.rodF.y)/2+5},10,t)
},

{ id:'is-toalla', grupo:'estiramiento', zona:'is', nombre:'Isquios tumbado con toalla', tiempo:'30 s por lado',
  que:'La forma más segura de estirar los isquios: la espalda y la cabeza están apoyadas en el suelo.',
  montaje:'Tumbado boca arriba. Una pierna doblada con el pie apoyado. Pasa una toalla o un cinturón por la planta del otro pie y sujétala con las dos manos.',
  pasos:[
    'Sube la pierna de la toalla estirada hacia el techo.',
    'Tira suavemente de la toalla hasta notar tensión detrás del muslo.',
    'La cabeza y los hombros se quedan en el suelo.',
    'Aguanta 30 segundos y cambia.'
  ],
  respira:'Exhalaciones largas, ganando un poco en cada una.',
  errores:['Levantar la cabeza.','Doblar mucho la rodilla de la pierna que se estira.'],
  senal:'Detrás del muslo, a veces hasta la pantorrilla.',
  siduele:'Dobla un poco la rodilla.',
  alternativa:'Isquios con el pie en alto.',
  fases:['Toalla en la planta, pierna arriba','Tira suave hasta notar tensión'],
  poses:[
    { x:120,y:150,tr:-90,cu:-90,cara:180, mFx:104,mFy:110, mBx:100,mBy:112, tFx:150,tFy:94, tBx:150,tBy:153, piF:150,piB:95, signos:{codoF:-1,codoB:-1} },
    { x:120,y:150,tr:-90,cu:-90,cara:180, mFx:100,mFy:112, mBx:96,mBy:114, tFx:128,tFy:83, tBx:150,tBy:153, piF:170,piB:95 }
  ],
  fondo:()=>AT.suelo(157),
  frente:(q,p,t)=>AT.cuerda(q.manoF,{x:q.pieF.x-2,y:q.pieF.y-2},-4)+AT.siente({x:(q.cad.x+q.rodF.x)/2+5,y:(q.cad.y+q.rodF.y)/2},9,t)
},

{ id:'is-silla', grupo:'estiramiento', zona:'is', nombre:'Isquios sentado en la silla', tiempo:'30 s por lado',
  que:'Versión de silla, para el colegio o el sofá.',
  montaje:'Sentado en el borde de una silla. Estira una pierna al frente con el talón en el suelo y la punta del pie hacia arriba. La otra, doblada.',
  pasos:[
    'Manos sobre el muslo de la pierna doblada.',
    'Inclínate hacia delante desde la cadera, con la espalda recta.',
    'Para al notar tensión detrás del muslo estirado.',
    'Aguanta 30 segundos y cambia.'
  ],
  respira:'Exhala al inclinarte.',
  errores:['Redondear la espalda.'],
  senal:'Detrás del muslo de la pierna estirada.',
  siduele:'Inclínate menos.',
  alternativa:'Isquios tumbado con toalla.',
  fases:['Sentado al borde, una pierna estirada','Inclínate desde la cadera'],
  poses:[
    { x:88,y:140,tr:178,cu:178, mFx:106,mFy:142, mBx:104,mBy:144, tFx:146,tFy:180, tBx:118,tBy:182, piF:165,piB:95 },
    { x:88,y:140,tr:140,cu:142, mFx:122,mFy:150, mBx:120,mBy:152, tFx:146,tFy:180, tBx:118,tBy:182, piF:165,piB:95 }
  ],
  fondo:()=>AT.suelo()+AT.silla(60,146,40,40,46,'izq'),
  frente:(q,p,t)=>AT.siente({x:(q.cad.x+q.rodF.x)/2+6,y:(q.cad.y+q.rodF.y)/2+6},9,t)
},

/* ═════════════════════════ DELANTE DEL MUSLO ═════════════════════════ */

{ id:'cd-flexor', grupo:'estiramiento', zona:'cd', nombre:'Flexor de cadera en medio arrodillado', tiempo:'30 s por lado',
  que:'Estira el psoas y los flexores de la cadera, que se acortan con la silla y tiran de la pelvis hacia delante. Contrarresta la pelvis basculada.',
  montaje:'De rodillas sobre una pierna, con el otro pie plantado delante y la rodilla a 90°. Pon una toalla bajo la rodilla de apoyo. Manos en la cadera.',
  pasos:[
    'Antes de moverte, mete la pelvis: como si escondieras el coxis entre las piernas. Ese gesto es el estiramiento.',
    'Con la pelvis así, desplaza la cadera un poco hacia delante.',
    'El tronco sigue vertical.',
    'Aguanta 30 segundos y cambia.'
  ],
  respira:'Exhala al meter la pelvis.',
  errores:['Arquear la zona lumbar en vez de meter la pelvis: así no estiras nada.','Llevar la rodilla de delante mucho más allá del pie.'],
  senal:'En la ingle de la pierna de atrás, por delante.',
  siduele:'Si molesta la rodilla de apoyo, pon un cojín más grueso.',
  alternativa:'De pie: un paso largo, rodilla de atrás un poco doblada, y mete la pelvis.',
  fases:['Medio arrodillado, manos en la cadera','Mete la pelvis y avanza un poco la cadera'],
  poses:[
    { x:98,y:146,tr:180,cu:180, mFx:104,mFy:140, mBx:96,mBy:140, tFx:128,tFy:182, tBx:58,tBy:182, piF:95,piB:-90 },
    { x:108,y:148,tr:180,cu:180, mFx:114,mFy:142, mBx:106,mBy:142, tFx:128,tFy:182, tBx:58,tBy:182, piF:95,piB:-90 }
  ],
  fondo:()=>AT.suelo(),
  frente:(q,p,t)=>AT.siente({x:q.cad.x-6,y:q.cad.y+8},10,t)
},

{ id:'cd-cuadriceps', grupo:'estiramiento', zona:'cd', nombre:'Cuádriceps de pie', tiempo:'30 s por lado',
  que:'Estira la parte de delante del muslo.',
  montaje:'De pie junto a una pared, con una mano apoyada en ella.',
  pasos:[
    'Dobla una rodilla y coge ese pie por el empeine con la mano del mismo lado.',
    'Lleva el talón hacia el culo.',
    'Las dos rodillas juntas, y mete un poco la pelvis.',
    'Aguanta 30 segundos y cambia.'
  ],
  respira:'Normal.',
  errores:['Separar la rodilla hacia delante o hacia fuera.','Arquear la zona lumbar.'],
  senal:'Delante del muslo.',
  siduele:'Si no llegas al pie, usa una toalla.',
  alternativa:'Tumbado de lado, el mismo gesto.',
  fases:['De pie, mano en la pared','Talón al culo, rodillas juntas'],
  poses:[
    { x:100,y:112,tr:180,cu:180, mFx:104,mFy:122, mBx:148,mBy:72, tFx:102,tFy:182, tBx:97,tBy:182, piF:95,piB:95 },
    { x:100,y:112,tr:180,cu:180, mFx:86,mFy:116, mBx:148,mBy:72, tFx:88,tFy:114, tBx:97,tBy:182, piF:190,piB:95 }
  ],
  fondo:()=>AT.suelo()+AT.pared(152),
  frente:(q,p,t)=> t>0.4 ? AT.siente({x:(q.cad.x+q.rodF.x)/2+4,y:(q.cad.y+q.rodF.y)/2},9,t) : ''
},

/* ═════════════════════════ GEMELO Y TOBILLO ═════════════════════════ */

{ id:'tb-gemelo', grupo:'estiramiento', zona:'tb', nombre:'Gemelo en la pared', tiempo:'30 s por lado',
  que:'Estira el gemelo. Gemelos cortos limitan el tobillo, y un tobillo rígido es lo que te impide bajar en cuclillas con los talones en el suelo.',
  montaje:'De frente a una pared, manos apoyadas a la altura del pecho. Un pie adelantado con la rodilla doblada; el otro atrás, con la pierna estirada.',
  pasos:[
    'El talón de la pierna de atrás, en el suelo. La punta del pie, recta hacia la pared.',
    'Lleva la cadera hacia la pared sin despegar ese talón.',
    'La pierna de atrás sigue estirada.',
    'Aguanta 30 segundos y cambia.'
  ],
  respira:'Normal.',
  errores:['Levantar el talón de atrás.','Girar el pie de atrás hacia fuera.'],
  senal:'En la pantorrilla de la pierna de atrás.',
  siduele:'Acerca el pie de atrás.',
  alternativa:'En un escalón, dejando caer el talón.',
  fases:['Manos en la pared, pierna de atrás estirada','Cadera a la pared, talón abajo'],
  poses:[
    { x:100,y:124,tr:160,cu:160, mFx:156,mFy:74, mBx:154,mBy:76, tFx:126,tFy:182, tBx:66,tBy:182 },
    { x:108,y:128,tr:156,cu:156, mFx:156,mFy:76, mBx:154,mBy:78, tFx:126,tFy:182, tBx:66,tBy:182 }
  ],
  fondo:()=>AT.suelo()+AT.pared(160),
  frente:(q,p,t)=>AT.siente({x:(q.rodB.x+q.tobB.x)/2,y:(q.rodB.y+q.tobB.y)/2},9,t)
},

{ id:'tb-soleo', grupo:'estiramiento', zona:'tb', nombre:'Sóleo en la pared', tiempo:'30 s por lado',
  que:'El músculo de debajo del gemelo. Es el que más limita la cuclilla profunda.',
  montaje:'Igual que el gemelo, pero con la pierna de atrás más cerca.',
  pasos:[
    'Dobla la rodilla de atrás manteniendo el talón en el suelo.',
    'Baja la cadera en vertical.',
    'Aguanta 30 segundos y cambia.'
  ],
  respira:'Normal.',
  errores:['Levantar el talón.'],
  senal:'En la parte baja de la pantorrilla, cerca del tobillo.',
  siduele:'Menos recorrido.',
  alternativa:'Rodilla a la pared.',
  fases:['Rodilla de atrás doblada, talón abajo'],
  poses:[
    { x:102,y:134,tr:166,cu:166, mFx:156,mFy:84, mBx:154,mBy:86, tFx:126,tFy:182, tBx:78,tBy:182 }
  ],
  fondo:()=>AT.suelo()+AT.pared(160),
  frente:(q,p,t)=>AT.siente({x:q.tobB.x+3,y:q.tobB.y-10},8,t)
},

{ id:'tb-rodilla', grupo:'estiramiento', zona:'tb', nombre:'Rodilla a la pared', tiempo:'10 por lado',
  que:'Movilidad activa de tobillo. Mejora la cuclilla y la sentadilla más rápido que cualquier estiramiento pasivo.',
  montaje:'Medio arrodillado frente a una pared, con el pie de delante a un palmo de ella. Manos en la pared.',
  pasos:[
    'Lleva la rodilla de delante hacia la pared, sin despegar el talón.',
    'Toca la pared con la rodilla (o acércate todo lo que puedas) y vuelve.',
    'Si tocas fácil, aleja el pie un dedo.',
    'Diez por lado.'
  ],
  respira:'Normal.',
  errores:['Levantar el talón.','Que la rodilla se vaya hacia dentro: apunta al dedo gordo y al segundo.'],
  senal:'En el tobillo y la parte baja de la pantorrilla.',
  siduele:'Menos recorrido.',
  alternativa:'Sóleo en la pared.',
  fases:['Pie a un palmo de la pared','Rodilla a la pared, talón abajo'],
  poses:[
    { x:110,y:146,tr:176,cu:176, mFx:160,mFy:104, mBx:158,mBy:106, tFx:146,tFy:182, tBx:72,tBy:182, piF:95,piB:-90 },
    { x:122,y:148,tr:172,cu:172, mFx:160,mFy:104, mBx:158,mBy:106, tFx:146,tFy:182, tBx:72,tBy:182, piF:95,piB:-90 }
  ],
  fondo:()=>AT.suelo()+AT.pared(166),
  frente:(q,p,t)=>AT.siente({x:q.tobF.x-2,y:q.tobF.y-8},8,t)
},

/* ═════════════════════════ MANOS Y ANTEBRAZOS ═════════════════════════ */

{ id:'ma-extension', grupo:'estiramiento', zona:'ma', nombre:'Extensión de muñeca', tiempo:'15 s por lado',
  que:'Estira los músculos de la parte interna del antebrazo, los que cierran la mano. Con los hombros hacia delante, el brazo gira hacia dentro y la mano se queda cerrada: esto la abre.',
  montaje:'Brazo estirado al frente, palma hacia fuera, dedos hacia arriba, como diciendo "para".',
  pasos:[
    'Con la otra mano, coge los dedos y tira de ellos suavemente hacia ti.',
    'El codo, estirado.',
    'Aguanta 15 segundos y cambia.'
  ],
  respira:'Normal.',
  errores:['Tirar fuerte: es un estiramiento suave.'],
  senal:'En la parte interna del antebrazo, la de la palma.',
  siduele:'Codo un poco doblado.',
  alternativa:'Apoya la palma en una mesa con los dedos hacia ti y echa el peso hacia atrás.',
  vistaTxt:'Vista de lado',
  fases:['Brazo al frente, palma relajada','Dedos hacia ti con la otra mano'],
  caja:'46 42 136 109',
  dibujo(t){
    const s=suave(t), w={x:112,y:110};
    const a=_lerp(90,168,s);
    let o=AT.siente({x:86,y:118},10,t)+_antebrazo(w,56)+manoLado(w,a,-4,{pulgar:-50});
    const punta=desde(desde(w,a,19),a,16);
    o+=`<g opacity="${(0.35+0.65*s).toFixed(2)}">`+manoLado({x:punta.x+30,y:punta.y-4},-110,18,{dim:true,pulgar:60})+`</g>`;
    if(t>0.4) o+=AT.flecha(f1(punta.x+18),f1(punta.y-14),f1(punta.x+4),f1(punta.y-22));
    return o;
  }
},

{ id:'ma-flexion', grupo:'estiramiento', zona:'ma', nombre:'Flexión de muñeca', tiempo:'10 s por lado',
  que:'Estira la parte de fuera del antebrazo, la que más se carga escribiendo y con el ratón.',
  montaje:'Brazo estirado al frente, palma hacia abajo.',
  pasos:[
    'Deja caer la mano hacia abajo, dedos hacia el suelo.',
    'Con la otra mano, empuja suavemente el dorso de la mano hacia ti.',
    'Aguanta 10 segundos y cambia.'
  ],
  respira:'Normal.',
  errores:['Doblar el codo.'],
  senal:'En la parte de fuera del antebrazo.',
  siduele:'Menos presión.',
  alternativa:'Puño cerrado y dobla la muñeca hacia abajo, sin ayuda.',
  vistaTxt:'Vista de lado',
  fases:['Brazo al frente, palma abajo','Mano hacia abajo con la otra mano'],
  caja:'46 46 136 109',
  dibujo(t){
    const s=suave(t), w={x:112,y:96};
    const a=_lerp(90,12,s);
    let o=AT.siente({x:86,y:88},10,t)+_antebrazo(w,56)+manoLado(w,a,6,{pulgar:-60});
    const dorso=desde(w,a,12);
    o+=`<g opacity="${(0.35+0.65*s).toFixed(2)}">`+manoLado({x:dorso.x+34,y:dorso.y+4},-80,22,{dim:true,pulgar:50})+`</g>`;
    if(t>0.4) o+=AT.flecha(f1(dorso.x+22),f1(dorso.y+10),f1(dorso.x+8),f1(dorso.y+14));
    return o;
  }
},

{ id:'ma-dedos', grupo:'estiramiento', zona:'ma', nombre:'Apertura de dedos', tiempo:'8 repeticiones',
  que:'Movilidad activa de la mano: abre lo que pasa el día cerrado.',
  montaje:'Manos delante, a la altura del pecho, palmas hacia ti.',
  pasos:[
    'Abre las manos al máximo, separando todos los dedos, incluido el pulgar.',
    'Aguanta 3 segundos.',
    'Cierra en puño, sin apretar fuerte.',
    'Ocho veces.'
  ],
  respira:'Normal.',
  errores:['Hacerlo rápido.'],
  senal:'En la palma y entre los dedos.',
  siduele:'Abre menos.',
  alternativa:'No necesita nada.',
  vistaTxt:'Vista de la palma',
  fases:['Puño suave','Dedos estirados y separados'],
  caja:'40 22 120 96',
  dibujo(t){ return manoFrente({x:100,y:88}, suave(t)); }
},

{ id:'ma-rotacion', grupo:'estiramiento', zona:'ma', nombre:'Rotación de antebrazo', tiempo:'5 × 5 s',
  que:'Lleva el antebrazo a la posición contraria a la que se queda con los hombros adelantados: palma hacia arriba.',
  montaje:'De pie o sentado. Brazos pegados al cuerpo, codos doblados a 90°, antebrazos al frente, palmas hacia abajo.',
  pasos:[
    'Gira las palmas hacia arriba al máximo, sin despegar los codos del cuerpo.',
    'Aguanta 5 segundos con las palmas arriba.',
    'Vuelve y repite cinco veces.'
  ],
  respira:'Normal.',
  errores:['Separar los codos del cuerpo para girar más.'],
  senal:'En el antebrazo, cerca del codo.',
  siduele:'Menos recorrido.',
  alternativa:'Con una botella de agua en la mano para dar algo de peso.',
  vistaTxt:'Vista desde arriba',
  fases:['Palma hacia abajo','Gira hasta palma arriba'],
  caja:'30 20 140 112',
  dibujo(t){
    const s=suave(t), k=Math.cos(Math.PI*s);
    const palma = k < 0;
    const col = palma ? 'var(--fig)' : 'var(--fig-dim)';
    let o=`<path d="M100 132L100 92" stroke="var(--fig)" stroke-width="16" stroke-linecap="round"/>`;
    o+=`<g transform="translate(100 0) scale(${Math.max(Math.abs(k),0.06)*(k<0?-1:1)} 1) translate(-100 0)">`;
    o+=`<rect x="84" y="50" width="32" height="38" rx="9" fill="${col}"/>`;
    [88,96,104,112].forEach((x,i)=>{ const L=[18,22,21,16][i]; o+=`<path d="M${x} 52V${52-L}" stroke="${col}" stroke-width="7" stroke-linecap="round"/>`; });
    o+=`<path d="M84 74L70 60" stroke="${col}" stroke-width="7.5" stroke-linecap="round"/>`;
    if(palma) o+=`<path d="M90 70Q100 78 110 68" stroke="var(--fig-fill)" stroke-width="2" fill="none"/>`;
    else o+=`<g fill="var(--fig-fill)"><circle cx="88" cy="55" r="1.6"/><circle cx="96" cy="54" r="1.6"/><circle cx="104" cy="54" r="1.6"/><circle cx="112" cy="55" r="1.6"/></g>`;
    o+=`</g>`;
    o+=`<text x="100" y="128" fill="var(--fig-dim)" font-size="11" text-anchor="middle">${palma?'palma':'dorso'}</text>`;
    return o;
  }
},

{ id:'ma-rezo', grupo:'estiramiento', zona:'ma', nombre:'Palmas juntas', tiempo:'20 s',
  que:'Estira las muñecas y los antebrazos por dentro, las dos a la vez.',
  montaje:'Palmas juntas delante del pecho, dedos hacia arriba, codos abiertos.',
  pasos:[
    'Sin separar las palmas, baja las manos despacio hacia la cintura.',
    'Para cuando las palmas empiecen a separarse.',
    'Aguanta 20 segundos.'
  ],
  respira:'Normal.',
  errores:['Separar la base de las palmas.'],
  senal:'En las muñecas y la parte interna de los antebrazos.',
  siduele:'Baja menos.',
  alternativa:'Extensión de muñeca, una mano cada vez.',
  vistaTxt:'Vista de frente',
  fases:['Palmas juntas delante del pecho','Baja las manos sin separarlas'],
  caja:'20 0 160 128',
  dibujo(t){
    const s=suave(t), my=_lerp(64,100,s);
    const hI={x:66,y:46}, hD={x:134,y:46};
    const cI={x:58,y:96}, cD={x:142,y:96};
    let o='';
    o+=AT.siente({x:(cI.x+100)/2,y:(cI.y+my)/2+4},9,t)+AT.siente({x:(cD.x+100)/2,y:(cD.y+my)/2+4},9,t);
    o+=`<path d="M66 46L134 46" stroke="var(--fig)" stroke-width="17" stroke-linecap="round"/>`;
    o+=`<circle cx="100" cy="20" r="12.5" fill="var(--fig)"/><path d="M100 28V40" stroke="var(--fig)" stroke-width="7"/>`;
    o+=`<path d="${Lp(hI,cI)}L95 ${my}M${hD.x} ${hD.y}L${cD.x} ${cD.y}L105 ${my}" stroke="var(--fig)" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    o+=`<path d="M100 ${my+6}C92 ${my} 93 ${my-30} 100 ${my-34}C107 ${my-30} 108 ${my} 100 ${my+6}Z" fill="var(--fig)"/>`;
    return o;
  }
},

/* ═════════════════════════ POSTURA Y RESPIRACIÓN ═════════════════════════ */

{ id:'po-postura', grupo:'estiramiento', zona:'po', nombre:'Postura alta', tiempo:'3 respiraciones',
  que:'El cierre de la rutina de mañana: ponerte en la postura que quieres llevar todo el día y respirar en ella.',
  montaje:'De pie, pies paralelos a la anchura de la cadera.',
  pasos:[
    'Coronilla hacia el techo, como si un hilo tirara de ella.',
    'Hombros abajo y atrás, sin forzar.',
    'Barbilla ligeramente metida: la cabeza encima de los hombros, no por delante.',
    'Tres respiraciones nasales lentas, con la exhalación el doble de larga que la inhalación.'
  ],
  respira:'Por la nariz. Inhala en 3, exhala en 6.',
  errores:['Sacar pecho y arquear la lumbar: es alargarse, no ponerse firme.'],
  senal:'Sensación de estar más alto, sin tensión en ningún sitio.',
  siduele:'—',
  alternativa:'Sentado, igual.',
  fases:['Así se queda el cuerpo','Así lo quieres: alto, cabeza encima de los hombros'],
  poses:[
    { x:100,y:114,tr:174,cu:154,cara:96,curva:4, mFx:110,mFy:162, mBx:104,mBy:162 },
    { x:100,y:112,tr:180,cu:181,cara:90,curva:0, mFx:106,mFy:160, mBx:100,mBy:160 }
  ],
  fondo:()=>AT.suelo(),
  frente:(q,p,t)=> t>0.6 ? AT.flecha(f1(q.cab.x),f1(q.cab.y-16),f1(q.cab.x),f1(q.cab.y-30)) : '',
  ritmo:[2200,1400,2200,1000]
},

{ id:'po-respiracion', grupo:'estiramiento', zona:'po', nombre:'Respiración 4-6', tiempo:'5 ciclos',
  que:'Baja revoluciones antes de dormir. La exhalación larga activa el sistema que relaja, y el diafragma trabajando le quita trabajo a los músculos del cuello, que en la respiración por la boca y por el pecho hacen de respiradores de reserva.',
  montaje:'Tumbado boca arriba, rodillas dobladas. Una mano en la tripa.',
  pasos:[
    'Inhala por la nariz en 4 segundos, llevando el aire a la tripa: la mano sube, el pecho casi no se mueve.',
    'Exhala por la nariz o con los labios entreabiertos en 6 segundos.',
    'Cinco ciclos.'
  ],
  respira:'4 dentro, 6 fuera. La animación va a ese ritmo: sigue la tripa.',
  errores:['Respirar subiendo el pecho y los hombros.','Forzar el aire.'],
  senal:'La mano de la tripa sube y baja. Los hombros, quietos.',
  siduele:'—',
  alternativa:'Sentado, igual.',
  fases:['Inhala en 4: la tripa sube','Exhala en 6'],
  poses:[
    { x:126,y:150,tr:-90,cu:-90,cara:180,curva:0, mFx:116,mFy:142, mBx:120,mBy:154, tFx:156,tFy:153,tBx:152,tBy:153 },
    { x:126,y:150,tr:-90,cu:-90,cara:180,curva:-5, mFx:116,mFy:136, mBx:120,mBy:154, tFx:156,tFy:153,tBx:152,tBy:153 }
  ],
  fondo:()=>AT.suelo(157),
  ritmo:[4000,200,6000,200]
},

{ id:'po-piernas', grupo:'estiramiento', zona:'po', nombre:'Piernas en la pared', tiempo:'90 s',
  que:'Descarga piernas y espalda y ayuda a bajar revoluciones. Ideal para empezar la rutina de noche.',
  montaje:'Siéntate de lado junto a una pared, túmbate girando y sube las piernas apoyándolas en la pared. El culo, lo más cerca de la pared que puedas sin que tire.',
  pasos:[
    'Piernas estiradas apoyadas en la pared, relajadas.',
    'Brazos abiertos en el suelo, palmas hacia arriba.',
    'Quédate ahí respirando por la nariz.'
  ],
  respira:'Lenta y por la nariz.',
  errores:['Forzar la posición si tira detrás de los muslos: aléjate un poco de la pared.'],
  senal:'Relajación. Ligera tensión detrás de las piernas, como mucho.',
  siduele:'Aléjate de la pared.',
  alternativa:'Piernas sobre el sofá, con las rodillas dobladas.',
  fases:['Piernas apoyadas en la pared, brazos abiertos'],
  poses:[
    { x:132,y:150,tr:-90,cu:-90,cara:180, mFx:118,mFy:146, mBx:114,mBy:148, tFx:136,tFy:82, tBx:134,tBy:84, piF:175,piB:175 }
  ],
  fondo:()=>AT.suelo(157)+AT.pared(146)
}
);

/* ═════════════════════════ RUTINAS ═════════════════════════ */

const RUTINAS = {
  manana: {
    nombre:'Rutina de mañana', duracion:'7 min 35 s',
    intro:'Un solo pase, en este orden, del suelo a de pie. En la primera media hora tras levantarte los discos de la columna están más hidratados y son más sensibles a la flexión forzada: por eso los movimientos de espalda van a rango medio.',
    pasos:[
      { id:'cu-craneo',    t:60, nota:'10 asentimientos de 5 s' },
      { id:'to-gato',      t:45, nota:'10 ciclos, rango medio' },
      { id:'to-libro',     t:60, nota:'30 s por lado' },
      { id:'cd-flexor',    t:60, nota:'30 s por lado' },
      { id:'ca-cuclillas', t:60, nota:'con 3 rotaciones por lado' },
      { id:'ho-puerta',    t:45, nota:'20 s por lado' },
      { ids:['ma-extension','ma-flexion','ma-dedos','ma-rotacion'], nombre:'Manos y antebrazos', t:60,
        nota:'Extensión 15 s por lado · flexión 10 s por lado · dedos ×8 · rotación 5 × 5 s' },
      { id:'ho-pared',     t:45, nota:'10 repeticiones' },
      { id:'po-postura',   t:20, nota:'3 respiraciones' }
    ]
  },
  noche: {
    nombre:'Rutina de noche', duracion:'4 min',
    intro:'Distinta de la de la mañana a propósito: la de la mañana moviliza y activa; esta descomprime y baja revoluciones.',
    pasos:[
      { id:'po-piernas',     t:90, nota:'respiración nasal' },
      { id:'cu-trapecio',    t:60, nota:'30 s por lado, muy suave' },
      { id:'to-libro',       t:60, nota:'30 s por lado' },
      { id:'po-respiracion', t:30, nota:'5 ciclos' }
    ]
  }
};
