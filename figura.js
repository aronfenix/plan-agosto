/* ============================================================
   figura.js — motor de ilustraciones animadas.

   Dos vistas:
     · 'lado'   (por defecto) — la figura mira a la derecha.
     · 'frente' — la figura mira al espectador.
   Una pose dice dónde están la cadera, el ángulo del tronco y del
   cuello, y dónde van manos y pies. Codos y rodillas se resuelven
   solos (cinemática inversa). El encuadre se ajusta solo.

   Ángulos en grados, coordenadas de mundo:
     0 = abajo · 90 = derecha · 180 = arriba · -90 = izquierda
   ============================================================ */
'use strict';

const SEG = { tronco:48, cuello:14, cabeza:11, brazo:26, antebrazo:24, muslo:36, tibia:34, pie:14,
              hombros:37, caderas:22 };

const rad = a => a*Math.PI/180, grd = a => a*180/Math.PI;
const desde = (p,a,l) => ({ x:p.x+Math.sin(rad(a))*l, y:p.y+Math.cos(rad(a))*l });
const f1 = n => (Math.round(n*10)/10);

function ik(a, b, l1, l2, signo){
  const dx=b.x-a.x, dy=b.y-a.y;
  let d=Math.hypot(dx,dy)||0.001;
  const ux=dx/d, uy=dy/d;
  d = Math.min((l1+l2)*0.999, Math.max(Math.abs(l1-l2)+0.4, d));
  const fin={ x:a.x+ux*d, y:a.y+uy*d };
  const base=grd(Math.atan2(ux,uy));
  const c=(d*d+l1*l1-l2*l2)/(2*d*l1);
  const ang=grd(Math.acos(Math.max(-1,Math.min(1,c))));
  return { j:desde(a, base+signo*ang, l1), fin };
}

/* ---------- poses por defecto ---------- */
const BASE_LADO = {
  x:100, y:112, tr:180, cu:180, cara:null, curva:0,
  mFx:110, mFy:160, mBx:92, mBy:160,
  tFx:102, tFy:182, tBx:97, tBy:182,
  piF:95, piB:95
};
const BASE_FRENTE = {
  x:100, y:113, tr:180, cu:180, gira:0, encoge:0,
  mIx:66, mIy:158, mDx:134, mDy:158,
  tIx:90, tIy:182, tDx:110, tDy:182
};
const SIG_LADO = { codoF:-1, codoB:-1, rodF:1, rodB:1 };
const SIG_FRENTE = { codoI:1, codoD:-1, rodI:-1, rodD:1 };

function normaliza(o, vista){
  const base = vista==='frente' ? BASE_FRENTE : BASE_LADO;
  const sig  = vista==='frente' ? SIG_FRENTE : SIG_LADO;
  const p = Object.assign({}, base, o||{});
  p._s = Object.assign({}, sig, (o&&o.signos)||{});
  return p;
}

/* ---------- vista de lado ---------- */
function puntosLado(p){
  const s=p._s;
  const cad={x:p.x,y:p.y};
  const cb=desde(cad,p.tr,SEG.tronco), hom=desde(cad,p.tr,SEG.tronco*0.86);
  /* la curva desplaza hombro y cuello perpendicularmente un poco para que la cabeza acompañe */
  const cab=desde(cb,p.cu,SEG.cuello);
  const bF=ik(hom,{x:p.mFx,y:p.mFy},SEG.brazo,SEG.antebrazo,s.codoF);
  const bB=ik(hom,{x:p.mBx,y:p.mBy},SEG.brazo,SEG.antebrazo,s.codoB);
  const pF=ik(cad,{x:p.tFx,y:p.tFy},SEG.muslo,SEG.tibia,s.rodF);
  const pB=ik(cad,{x:p.tBx,y:p.tBy},SEG.muslo,SEG.tibia,s.rodB);
  const caraA = p.cara==null ? p.cu-90 : p.cara;
  return { cad, cb, hom, cab, nariz:desde(cab,caraA,SEG.cabeza*1.45),
    codoF:bF.j, manoF:bF.fin, codoB:bB.j, manoB:bB.fin,
    rodF:pF.j, tobF:pF.fin, rodB:pB.j, tobB:pB.fin,
    pieF:desde(pF.fin,p.piF,SEG.pie), pieB:desde(pB.fin,p.piB,SEG.pie) };
}
const Lp=(a,b)=>`M${f1(a.x)} ${f1(a.y)}L${f1(b.x)} ${f1(b.y)}`;

function troncoCurvo(a, b, curva){
  if(!curva) return Lp(a,b);
  const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
  const ang=grd(Math.atan2(b.x-a.x,b.y-a.y));
  const c=desde({x:mx,y:my}, ang+90, curva*2);   // control perpendicular
  return `M${f1(a.x)} ${f1(a.y)}Q${f1(c.x)} ${f1(c.y)} ${f1(b.x)} ${f1(b.y)}`;
}

function dibujaLado(p){
  const q=puntosLado(p);
  const lej='stroke="var(--fig-dim)" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  const cer='stroke="var(--fig)" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  let s='';
  s+=`<path d="${Lp(q.cad,q.rodB)}${Lp(q.rodB,q.tobB)}${Lp(q.tobB,q.pieB)}" ${lej}/>`;
  s+=`<path d="${Lp(q.hom,q.codoB)}${Lp(q.codoB,q.manoB)}" ${lej}/>`;
  s+=`<path d="${troncoCurvo(q.cad,q.cb,p.curva)}" stroke="var(--fig)" stroke-width="12.5" stroke-linecap="round" fill="none"/>`;
  s+=`<path d="${Lp(q.cb,q.cab)}" stroke="var(--fig)" stroke-width="6.5" stroke-linecap="round"/>`;
  s+=`<circle cx="${f1(q.cab.x)}" cy="${f1(q.cab.y)}" r="${SEG.cabeza}" fill="var(--fig)"/>`;
  s+=`<path d="${Lp(q.cab,q.nariz)}" stroke="var(--fig)" stroke-width="4.2" stroke-linecap="round"/>`;
  s+=`<path d="${Lp(q.cad,q.rodF)}${Lp(q.rodF,q.tobF)}${Lp(q.tobF,q.pieF)}" ${cer}/>`;
  s+=`<path d="${Lp(q.hom,q.codoF)}${Lp(q.codoF,q.manoF)}" ${cer}/>`;
  return { svg:s, q };
}

/* ---------- vista de frente ---------- */
function puntosFrente(p){
  const s=p._s;
  const cad={x:p.x,y:p.y};
  const cb=desde(cad,p.tr,SEG.tronco);
  const hc=desde(cad,p.tr,SEG.tronco*0.84);
  const lat=p.tr-90;                       // eje transversal (hacia la derecha de la imagen)
  const sube=p.encoge*9;
  const hI=desde(desde(hc,lat,-SEG.hombros/2),p.tr,sube);
  const hD=desde(desde(hc,lat, SEG.hombros/2),p.tr,sube);
  const cI=desde(cad,lat,-SEG.caderas/2), cD=desde(cad,lat,SEG.caderas/2);
  const cab=desde(cb,p.cu,SEG.cuello);
  const bI=ik(hI,{x:p.mIx,y:p.mIy},SEG.brazo,SEG.antebrazo,s.codoI);
  const bD=ik(hD,{x:p.mDx,y:p.mDy},SEG.brazo,SEG.antebrazo,s.codoD);
  const pI=ik(cI,{x:p.tIx,y:p.tIy},SEG.muslo,SEG.tibia,s.rodI);
  const pD=ik(cD,{x:p.tDx,y:p.tDy},SEG.muslo,SEG.tibia,s.rodD);
  return { cad, cb, hc, hI, hD, cI, cD, cab,
    codoI:bI.j, manoI:bI.fin, codoD:bD.j, manoD:bD.fin,
    rodI:pI.j, tobI:pI.fin, rodD:pD.j, tobD:pD.fin };
}

function dibujaFrente(p){
  const q=puntosFrente(p);
  const m='stroke="var(--fig)" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  let s='';
  /* piernas */
  s+=`<path d="${Lp(q.cI,q.rodI)}${Lp(q.rodI,q.tobI)}" ${m}/>`;
  s+=`<path d="${Lp(q.cD,q.rodD)}${Lp(q.rodD,q.tobD)}" ${m}/>`;
  s+=`<path d="M${f1(q.tobI.x)} ${f1(q.tobI.y)}l-9 1M${f1(q.tobD.x)} ${f1(q.tobD.y)}l9 1" ${m}/>`;
  /* tronco: un trapecio relleno */
  s+=`<path d="M${f1(q.hI.x)} ${f1(q.hI.y)}L${f1(q.hD.x)} ${f1(q.hD.y)}L${f1(q.cD.x)} ${f1(q.cD.y)}L${f1(q.cI.x)} ${f1(q.cI.y)}Z"
        fill="var(--fig)" stroke="var(--fig)" stroke-width="5" stroke-linejoin="round"/>`;
  /* trapecio superior: línea cuello-hombro, se marca si encoge */
  const tc = p.encoge>0.3 ? 'var(--fig-err)' : 'var(--fig)';
  s+=`<path d="${Lp(q.cb,q.hI)}${Lp(q.cb,q.hD)}" stroke="${tc}" stroke-width="7" stroke-linecap="round"/>`;
  /* brazos */
  s+=`<path d="${Lp(q.hI,q.codoI)}${Lp(q.codoI,q.manoI)}" ${m}/>`;
  s+=`<path d="${Lp(q.hD,q.codoD)}${Lp(q.codoD,q.manoD)}" ${m}/>`;
  /* cuello y cabeza */
  s+=`<path d="${Lp(q.cb,q.cab)}" stroke="var(--fig)" stroke-width="7" stroke-linecap="round"/>`;
  s+=`<circle cx="${f1(q.cab.x)}" cy="${f1(q.cab.y)}" r="${SEG.cabeza}" fill="var(--fig)"/>`;
  /* cara: ojos y nariz, desplazados si gira */
  const gx=p.gira*5.5, ax=grd(0), cx=q.cab.x+gx, cy=q.cab.y;
  s+=`<g fill="var(--fig-fill)"><circle cx="${f1(cx-3.8)}" cy="${f1(cy-2)}" r="1.7"/><circle cx="${f1(cx+3.8)}" cy="${f1(cy-2)}" r="1.7"/></g>`;
  s+=`<path d="M${f1(cx+p.gira*2)} ${f1(cy+0.5)}l${f1(p.gira*2.2)} 3.2" stroke="var(--fig-fill)" stroke-width="1.8" stroke-linecap="round"/>`;
  return { svg:s, q };
}

/* ---------- vista cenital (desde arriba) ----------
   La persona mira hacia arriba de la imagen. rot gira el tronco:
   negativo = gira hacia su derecha. */
function dibujaArriba(o){
  const rot=o.rot||0, c={x:o.cx,y:o.cy};
  const eje=rot+90;
  const hI=desde(c,eje,-22), hD=desde(c,eje,22);
  const bI=ik(hI,o.mI,SEG.brazo,SEG.antebrazo,o.cI==null?1:o.cI);
  const bD=ik(hD,o.mD,SEG.brazo,SEG.antebrazo,o.cD==null?-1:o.cD);
  const m='stroke="var(--fig)" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  let s='';
  s+=`<path d="${Lp(hI,bI.j)}${Lp(bI.j,bI.fin)}" ${m}/>`;
  s+=`<path d="${Lp(hD,bD.j)}${Lp(bD.j,bD.fin)}" ${m}/>`;
  s+=`<path d="${Lp(hI,hD)}" stroke="var(--fig)" stroke-width="17" stroke-linecap="round"/>`;
  s+=`<circle cx="${f1(c.x)}" cy="${f1(c.y)}" r="12.5" fill="var(--fig)" stroke="var(--fig-fill)" stroke-width="3"/>`;
  s+=`<path d="${Lp(desde(c,rot+180,9),desde(c,rot+180,18))}" stroke="var(--fig)" stroke-width="5.5" stroke-linecap="round"/>`;
  return { svg:s, q:{ c, hI, hD, codoI:bI.j, manoI:bI.fin, codoD:bD.j, manoD:bD.fin } };
}

/* ---------- mano vista de lado ----------
   w = muñeca, a = dirección de la palma, dob = flexión de dedos (grados) */
function manoLado(w, a, dob, opts){
  opts=opts||{};
  const col = opts.dim ? 'var(--fig-dim)' : 'var(--fig)';
  const p=desde(w,a,19), d1=desde(p,a+(dob||0),9), d2=desde(d1,a+(dob||0)*1.6,8);
  const pul=desde(desde(w,a,5), a+(opts.pulgar||-55), 12);
  return `<g stroke="${col}" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="${Lp(w,p)}" stroke-width="12"/>
    <path d="${Lp(p,d1)}${Lp(d1,d2)}" stroke-width="7.5"/>
    <path d="${Lp(desde(w,a,5),pul)}" stroke-width="6.5"/></g>`;
}

/* ---------- mano vista de frente (palma) ---------- */
function manoFrente(c, abre){       /* abre: 0 puño · 1 dedos estirados y separados */
  const L=5+abre*18, sep=4+abre*11;
  const ang=[-2*sep,-sep*0.75,0,sep*0.9,2*sep].map(v=>180+v);
  let s=`<g stroke="var(--fig)" stroke-linecap="round" fill="none">`;
  ang.forEach((a,i)=>{
    const base=desde(c,a,12), fin=desde(base,a,L*(i===2?1.08:i===0||i===4?0.82:1));
    s+=`<path d="${Lp(base,fin)}" stroke-width="7"/>`;
  });
  const pb=desde(c,-75,10), pf=desde(pb,-75-abre*25,6+abre*12);
  s+=`<path d="${Lp(pb,pf)}" stroke-width="7.5"/>`;
  s+=`</g><circle cx="${f1(c.x)}" cy="${f1(c.y)}" r="15" fill="var(--fig)"/>`;
  return s;
}

/* ---------- atrezo ---------- */
const AT = {
  suelo:(y=186) => `<line x1="-200" y1="${y}" x2="400" y2="${y}" stroke="var(--fig-line)" stroke-width="3"/>`,
  pared:(x) => `<line x1="${x}" y1="-200" x2="${x}" y2="400" stroke="var(--fig-line)" stroke-width="3"/>`,
  caja:(x,y,w,h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="var(--fig-box)" stroke="var(--fig-line)" stroke-width="3"/>`,
  mancuerna(p, h){
    const r=4.8, g=10;
    if(h) return `<g stroke="var(--fig-obj)" stroke-width="4.4" stroke-linecap="round">
      <line x1="${f1(p.x-r)}" y1="${f1(p.y-g/2)}" x2="${f1(p.x+r)}" y2="${f1(p.y-g/2)}"/>
      <line x1="${f1(p.x-r)}" y1="${f1(p.y+g/2)}" x2="${f1(p.x+r)}" y2="${f1(p.y+g/2)}"/>
      <line x1="${f1(p.x)}" y1="${f1(p.y-g/2)}" x2="${f1(p.x)}" y2="${f1(p.y+g/2)}"/></g>`;
    return `<g stroke="var(--fig-obj)" stroke-width="4.4" stroke-linecap="round">
      <line x1="${f1(p.x-g/2)}" y1="${f1(p.y-r)}" x2="${f1(p.x-g/2)}" y2="${f1(p.y+r)}"/>
      <line x1="${f1(p.x+g/2)}" y1="${f1(p.y-r)}" x2="${f1(p.x+g/2)}" y2="${f1(p.y+r)}"/>
      <line x1="${f1(p.x-g/2)}" y1="${f1(p.y)}" x2="${f1(p.x+g/2)}" y2="${f1(p.y)}"/></g>`;
  },
  kettle:(p) => `<g fill="var(--fig-obj)" stroke="var(--fig-obj)" stroke-width="3.6">
      <path d="M${f1(p.x-5)} ${f1(p.y+3)}a5 5 0 0 1 10 0" fill="none"/>
      <circle cx="${f1(p.x)}" cy="${f1(p.y+11)}" r="7"/></g>`,
  garrafa:(p) => `<g fill="none" stroke="var(--fig-obj)" stroke-width="3.2" stroke-linejoin="round">
      <path d="M${f1(p.x-2)} ${f1(p.y)}h4M${f1(p.x)} ${f1(p.y)}v4"/>
      <rect x="${f1(p.x-7)}" y="${f1(p.y+4)}" width="14" height="18" rx="3" fill="var(--fig-obj)" fill-opacity=".25"/></g>`,
  banda(a, b, comba=0){
    const mx=(a.x+b.x)/2, my=(a.y+b.y)/2+comba;
    return `<path d="M${f1(a.x)} ${f1(a.y)}Q${f1(mx)} ${f1(my)} ${f1(b.x)} ${f1(b.y)}"
      fill="none" stroke="var(--fig-band)" stroke-width="3.4" stroke-linecap="round"/>`;
  },
  ancla:(x,y) => `<circle cx="${x}" cy="${y}" r="4.5" fill="var(--fig-line)"/>`,
  /* zona donde se nota el estiramiento: brillo suave que late */
  siente(p, r=11, t=0){
    const k = 0.75 + 0.25*Math.sin((t||0)*Math.PI);
    return `<g pointer-events="none"><circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(r*1.55)}" fill="var(--fig-hot)" fill-opacity="${(0.13*k).toFixed(3)}"/>
      <circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(r)}" fill="var(--fig-hot)" fill-opacity="${(0.30*k).toFixed(3)}"/></g>`;
  },
  cuerda:(a,b,comba=6) => { const mx=(a.x+b.x)/2, my=(a.y+b.y)/2+comba;
    return `<path d="M${f1(a.x)} ${f1(a.y)}Q${f1(mx)} ${f1(my)} ${f1(b.x)} ${f1(b.y)}" fill="none" stroke="var(--fig-obj)" stroke-width="4.5" stroke-linecap="round"/>`; },
  rodillo:(x,y,r=8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="var(--fig-obj)" fill-opacity=".35" stroke="var(--fig-obj)" stroke-width="3"/>`,
  silla(x,y,w=40,alto=48,resp=42,lado='izq'){
    const xr = lado==='izq' ? x : x+w;
    return `<g stroke="var(--fig-line)" stroke-width="5" stroke-linecap="round" fill="none">
      <path d="M${x} ${y}H${x+w}"/><path d="M${x+3} ${y}V${y+alto}M${x+w-3} ${y}V${y+alto}"/>
      <path d="M${xr} ${y}V${y-resp}"/></g>`;
  },
  disco:(p,r=7) => `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${r}" fill="var(--fig-obj)" fill-opacity=".35" stroke="var(--fig-obj)" stroke-width="3.4"/>`,
  toalla:(x,y,w=26) => `<rect x="${x-w/2}" y="${y-4}" width="${w}" height="8" rx="4" fill="var(--fig-obj)" fill-opacity=".55"/>`,
  flecha(x1,y1,x2,y2){
    const a=Math.atan2(y2-y1,x2-x1), k=8;
    return `<g stroke="var(--fig-acc)" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M${x1} ${y1}L${x2} ${y2}"/>
      <path d="M${f1(x2-k*Math.cos(a-0.5))} ${f1(y2-k*Math.sin(a-0.5))}L${x2} ${y2}L${f1(x2-k*Math.cos(a+0.5))} ${f1(y2-k*Math.sin(a+0.5))}"/></g>`;
  },
  arcoFlecha(cx,cy,r,a1,a2){       /* arco de a1 a a2 (ángulos de mundo) con punta */
    const p1=desde({x:cx,y:cy},a1,r), p2=desde({x:cx,y:cy},a2,r);
    const barrido = ((a2-a1)%360+360)%360 > 180 ? 1 : 0;
    const dirFin=a2 + (barrido? -90: 90);
    const t=desde(p2,dirFin,-1), k=7;
    const aa=Math.atan2(p2.y-t.y,p2.x-t.x);
    return `<g stroke="var(--fig-acc)" stroke-width="2.6" fill="none" stroke-linecap="round">
      <path d="M${f1(p1.x)} ${f1(p1.y)}A${r} ${r} 0 0 ${barrido?1:0} ${f1(p2.x)} ${f1(p2.y)}" stroke-dasharray="5 4"/>
      <path d="M${f1(p2.x-k*Math.cos(aa-0.5))} ${f1(p2.y-k*Math.sin(aa-0.5))}L${f1(p2.x)} ${f1(p2.y)}L${f1(p2.x-k*Math.cos(aa+0.5))} ${f1(p2.y-k*Math.sin(aa+0.5))}"/></g>`;
  },
  marca:(p,txt) => `<g><circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="9" fill="none" stroke="var(--fig-acc)" stroke-width="2.4" stroke-dasharray="3 3"/></g>`
};

/* ---------- encuadre automático ---------- */
function cajaDe(q){
  const xs=[], ys=[];
  for(const k in q){ const v=q[k]; if(v && typeof v==='object' && 'x' in v){ xs.push(v.x); ys.push(v.y); } }
  return { x0:Math.min(...xs), y0:Math.min(...ys), x1:Math.max(...xs), y1:Math.max(...ys) };
}
function unir(a,b){ return { x0:Math.min(a.x0,b.x0), y0:Math.min(a.y0,b.y0), x1:Math.max(a.x1,b.x1), y1:Math.max(a.y1,b.y1) }; }

const ASPECTO = 1.25;   // ancho / alto del recuadro
function encuadre(caja, extra){
  let { x0,y0,x1,y1 } = caja;
  (extra||[]).forEach(([x,y]) => { x0=Math.min(x0,x); y0=Math.min(y0,y); x1=Math.max(x1,x); y1=Math.max(y1,y); });
  const pad=17;
  x0-=pad; y0-=pad; x1+=pad; y1+=pad;
  let w=x1-x0, h=y1-y0;
  if(w/h < ASPECTO){ const nw=h*ASPECTO; x0-=(nw-w)/2; w=nw; }
  else { const nh=w/ASPECTO; y0-=(nh-h)/2; h=nh; }
  return `${f1(x0)} ${f1(y0)} ${f1(w)} ${f1(h)}`;
}

/* ---------- animación ---------- */
function mezcla(a,b,t){
  const o={};
  for(const k in a){
    if(k==='_s') continue;
    const va=a[k], vb=b[k];
    o[k] = (typeof va==='number' && typeof vb==='number') ? va+(vb-va)*t : va;
  }
  o._s=a._s; return o;
}
const suave = t => t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;

/* ej: { vista, poses:[A,B?], fondo(q,p), frente(q,p), incluir:[[x,y]...], fases:['texto inicio','texto final'] } */
function crearFigura(ej, op){
  op=op||{};
  const vista = ej.vista || 'lado';
  const dib = vista==='frente' ? dibujaFrente : dibujaLado;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','figura');
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label','Ilustración: '+(ej.nombre||'ejercicio'));
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');

  let A, B, pinta;

  if(ej.dibujo){
    /* dibujo a medida: ej.dibujo(t) devuelve el SVG para t∈[0,1] */
    A={t:0}; B=ej.estatico ? null : {t:1};
    svg.setAttribute('viewBox', ej.caja || '0 0 200 160');
    pinta = (p,t) => { svg.innerHTML = ej.dibujo(t||0); };
  } else {
    A=normaliza(ej.poses[0], vista);
    B=ej.poses[1] ? normaliza(Object.assign({signos:(ej.poses[0]||{}).signos}, ej.poses[1]), vista) : null;
    if(ej.caja) svg.setAttribute('viewBox', ej.caja);
    else {
      let caja=cajaDe(dib(A).q);
      if(B){ caja=unir(caja,cajaDe(dib(B).q)); caja=unir(caja,cajaDe(dib(mezcla(A,B,0.5)).q)); }
      svg.setAttribute('viewBox', encuadre(caja, ej.incluir));
    }
    pinta = (p,t) => {
      const r=dib(p);
      svg.innerHTML = (ej.fondo?ej.fondo(r.q,p,t):'') + r.svg + (ej.frente?ej.frente(r.q,p,t):'');
    };
  }

  let fase=-1;
  const avisaFase = t => {
    const f = t>0.5 ? 1 : 0;
    if(f!==fase){ fase=f; if(op.onFase) op.onFase(f); }
  };

  if(!B){ pinta(A,0); avisaFase(0); return { svg, animada:false, parar(){}, pausa(){}, sigue(){} }; }
  if(op.estatico){
    const t = op.t==null ? 1 : op.t;
    pinta(mezcla(A,B,t),t);
    return { svg, animada:false, parar(){}, pausa(){}, sigue(){} };
  }

  const [IDA,ESP1,VUELTA,ESP2] = ej.ritmo || [1600,700,1300,550]; const TOT=IDA+ESP1+VUELTA+ESP2;
  let raf=null, t0=null, vivo=true, pausada=false, tPausa=0, tActual=0;

  function paso(ts){
    if(!vivo || pausada) return;
    if(t0===null) t0=ts;
    const m=(ts-t0)%TOT;
    let t;
    if(m<IDA) t=suave(m/IDA);
    else if(m<IDA+ESP1) t=1;
    else if(m<IDA+ESP1+VUELTA) t=1-suave((m-IDA-ESP1)/VUELTA);
    else t=0;
    tActual=t;
    pinta(mezcla(A,B,t),t); avisaFase(t);
    raf=requestAnimationFrame(paso);
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches && !op.forzar;
  pinta(A,0); avisaFase(0);
  if(!reduce) raf=requestAnimationFrame(paso);
  else pausada=true;

  return {
    svg, animada:true,
    parar(){ vivo=false; if(raf) cancelAnimationFrame(raf); },
    pausa(){ if(pausada) return; pausada=true; tPausa=performance.now(); if(raf) cancelAnimationFrame(raf); },
    sigue(){ if(!pausada||!vivo) return; pausada=false; if(t0!==null) t0+=performance.now()-tPausa; raf=requestAnimationFrame(paso); },
    estaPausada(){ return pausada; },
    irA(t){ pausada=true; if(raf) cancelAnimationFrame(raf); tPausa=performance.now(); pinta(mezcla(A,B,t),t); avisaFase(t); }
  };
}
