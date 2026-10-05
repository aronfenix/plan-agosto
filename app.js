/* ============================================================
   app.js — lógica y pantallas. Sin dependencias, sin compilación.
   Contenido: ejercicios.js, estiramientos.js, textos.js
   ============================================================ */
'use strict';

/* ---------- 1. Fechas ---------- */
const DIAS  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const DIASC = ['D','L','M','X','J','V','S'];
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const p2 = n => String(n).padStart(2,'0');
const ds = d => d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const pd = s => { const [a,b,c]=s.split('-').map(Number); return new Date(a,b-1,c); };
const addD = (s,n) => { const d=pd(s); d.setDate(d.getDate()+n); return ds(d); };
const diffD = (a,b) => Math.round((pd(a)-pd(b))/864e5);
const mondayOf = s => { const d=pd(s); d.setDate(d.getDate()-((d.getDay()+6)%7)); return ds(d); };
const hoy = () => ds(new Date());
const cap = s => s.charAt(0).toUpperCase()+s.slice(1);
const fmtLargo = s => { const d=pd(s); return cap(DIAS[d.getDay()])+' '+d.getDate()+' de '+MESES[d.getMonth()]; };
const fmtCorto = s => { const d=pd(s); return d.getDate()+' '+MESES[d.getMonth()].slice(0,3); };
const esc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ---------- 2. Datos ---------- */
const KEY = 'plan-v3';
const vacio = () => ({ v:3, dias:{}, ajustes:{ hora:22, basal:6 }, flags:{} });
let S = cargar();

function cargar(){
  try{
    const r = localStorage.getItem(KEY);
    if(!r) return vacio();
    const o = JSON.parse(r), b = vacio();
    return Object.assign(b, o, { ajustes:Object.assign(b.ajustes, o.ajustes||{}), flags:o.flags||{}, dias:o.dias||{} });
  }catch(e){ return vacio(); }
}
function guardar(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){ toast('No se ha podido guardar en este navegador.'); } }

function dia(f, crear){
  if(!S.dias[f] && crear) S.dias[f] = { f:{}, dolor:null, energia:null, nota:'', comodin:false };
  return S.dias[f] || null;
}
const hecho = (f,k) => !!(S.dias[f] && S.dias[f].f[k]);
const nHechos = f => FACTORES.filter(x => hecho(f,x.k)).length;
const sueloOk = f => SUELO.every(k => hecho(f,k));
const cumplido = f => nHechos(f) >= UMBRAL_DIA || sueloOk(f);
const comodin = f => !!(S.dias[f] && S.dias[f].comodin);
function registrado(f){
  const d=S.dias[f]; if(!d) return false;
  return d.comodin || d.dolor!=null || d.energia!=null || !!d.nota || Object.values(d.f).some(Boolean);
}
function limpiaDia(f){ if(S.dias[f] && !registrado(f)) delete S.dias[f]; }

/* ---------- 3. Métricas ---------- */
function primerDia(){ return Object.keys(S.dias).filter(registrado).sort()[0] || null; }

function metricas(){
  const ini=primerDia(), h=hoy();
  if(!ini) return { hay:false, racha:0, mejor:0, peor:0, ini:null };
  let racha=0, c = (cumplido(h)||comodin(h)) ? h : addD(h,-1);
  while(c >= ini){
    if(comodin(c)){ c=addD(c,-1); continue; }
    if(cumplido(c)){ racha++; c=addD(c,-1); } else break;
  }
  let peor=0, run=0, mejor=0, r2=0;
  for(let d=ini; d<=h; d=addD(d,1)){
    if(comodin(d)) continue;
    if(d===h && !cumplido(d)) break;          // hoy todavía no es un fallo
    if(cumplido(d)){ r2++; if(r2>mejor) mejor=r2; run=0; }
    else { run++; if(run>peor) peor=run; r2=0; }
  }
  return { hay:true, racha, mejor, peor, ini };
}
function mesStats(ym){
  const h=hoy(), ini=primerDia();
  const [a,m]=ym.split('-').map(Number);
  const n=new Date(a,m,0).getDate();
  let ok=0, total=0, com=0;
  for(let i=1;i<=n;i++){
    const f=ym+'-'+p2(i);
    if(f>h || !ini || f<ini) continue;
    if(comodin(f)){ com++; continue; }
    if(f===h && !cumplido(f)) continue;
    total++; if(cumplido(f)) ok++;
  }
  return { ok, total, com };
}
function fuerzaSemana(f){
  const lun=mondayOf(f); let n=0;
  for(let i=0;i<7;i++) if(hecho(addD(lun,i),'fuerza')) n++;
  return n;
}

/* ---------- 4. Iconos ---------- */
const IC = {
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  ir:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  atras:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  ajustes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  pausa:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z"/></svg>',
  lupa:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>'
};

/* ---------- 5. Router ---------- */
const app = document.getElementById('app');
let FIGS = [];                 // figuras animadas montadas en pantalla
const SCROLL = {};             // posición de scroll por ruta
let RUTA_ACTUAL = '';

function ruta(){
  const h = location.hash.replace(/^#\/?/,'');
  const [path, qs] = h.split('?');
  return { partes: path.split('/').filter(Boolean), q: new URLSearchParams(qs||''), raw: h };
}
function ir(h, reemplazar){ if(reemplazar) location.replace(h); else location.hash = h; }

window.addEventListener('hashchange', () => { render(); });

function render(){
  FIGS.forEach(f => f.parar()); FIGS = [];
  const r = ruta();
  if(RUTA_ACTUAL) SCROLL[RUTA_ACTUAL] = window.scrollY;
  RUTA_ACTUAL = r.raw;
  const [a,b,c] = r.partes;
  let html, pest;
  switch(a){
    case 'entrenar': html = vEntrenar(b); pest='entrenar'; break;
    case 'estirar':  html = vEstirar(b,c); pest='estirar'; break;
    case 'ej':       html = vEj(b, r.q.get('l')); pest = (r.q.get('l')||'').startsWith('ses') ? 'entrenar' : 'estirar'; break;
    case 'progreso': html = vProgreso(b); pest='progreso'; break;
    case 'ajustes':  html = vAjustes(); pest='progreso'; break;
    default:         html = vHoy(b); pest='hoy';
  }
  app.innerHTML = html;
  montarFiguras();
  document.querySelectorAll('#nav a').forEach(x => x.classList.toggle('on', x.dataset.p === pest));
  const y = (a==='ej') ? 0 : (SCROLL[r.raw] || 0);
  window.scrollTo(0, y);
  const sel = app.querySelector('.chips.fila .sel'); if(sel && sel.scrollIntoView) sel.scrollIntoView({inline:'center', block:'nearest'});
}

/* ---------- 6. Figuras ---------- */
const POR_ID = {}; EJERCICIOS.forEach(e => { POR_ID[e.id] = e; });

function fig(id, modo, extra){ return `<div class="fx" data-fig="${id}" data-modo="${modo||'thumb'}" ${extra||''}></div>`; }

function montarFiguras(){
  app.querySelectorAll('[data-fig]').forEach(el => {
    const ej = POR_ID[el.dataset.fig]; if(!ej) return;
    const modo = el.dataset.modo;
    let h;
    if(modo === 'full'){
      h = crearFigura(ej, { onFase: i => {
        app.querySelectorAll('.fase div').forEach((d,k) => d.classList.toggle('on', k===i));
      }});
      FIGS.push(h);
      el.replaceWith(h.svg);
      const pp = app.querySelector('[data-pp]');
      if(pp && !h.animada) pp.hidden = true;
      window._figActual = h;
    } else if(modo === 'mal'){
      const e2 = Object.assign({}, ej, { poses:ej.mal.poses, dibujo:null, caja:null, nombre:'error' });
      h = crearFigura(e2, { estatico:true });
      el.replaceWith(h.svg);
    } else {
      h = crearFigura(ej, { estatico:true, t: ej.thumb==null ? 1 : ej.thumb });
      el.replaceWith(h.svg);
    }
  });
}

/* ---------- 7. Listas de navegación entre ejercicios ---------- */
function lista(clave){
  if(!clave) return [];
  if(clave.startsWith('ses-')){
    const s = SESIONES[clave.slice(4)]; if(!s) return [];
    const out=[]; s.bloques.forEach(b => b.ids.forEach(id => { if(!out.includes(id)) out.push(id); })); return out;
  }
  if(clave.startsWith('rut-')){
    const r = RUTINAS[clave.slice(4)]; if(!r) return [];
    const out=[]; r.pasos.forEach(p => (p.ids||[p.id]).forEach(id => { if(!out.includes(id)) out.push(id); })); return out;
  }
  if(clave.startsWith('zona-')){
    const z = clave.slice(5);
    return EJERCICIOS.filter(e => e.grupo==='estiramiento' && (z==='todas' || e.zona===z)).map(e => e.id);
  }
  return [];
}
function nombreLista(clave){
  if(!clave) return '';
  if(clave.startsWith('ses-')) return SESIONES[clave.slice(4)].nombre;
  if(clave.startsWith('rut-')) return RUTINAS[clave.slice(4)].nombre;
  if(clave.startsWith('zona-')){ const z=ZONAS.find(x=>x.id===clave.slice(5)); return z ? z.nombre : 'Estiramientos'; }
  return '';
}

/* ---------- 8. HOY ---------- */
let AVISO_NUEVA = false;

function colDolor(v){ return v<=3 ? '#4cc38a' : v<=6 ? '#e2a95e' : '#ff7a59'; }

function anillo(n, total, ok){
  const r=19, C=2*Math.PI*r, f=Math.min(1,n/total);
  return `<svg class="anillo" viewBox="0 0 46 46"><circle cx="23" cy="23" r="${r}" fill="none" stroke="var(--s3)" stroke-width="5"/>
    <circle cx="23" cy="23" r="${r}" fill="none" stroke="${ok?'var(--ok)':'var(--blue)'}" stroke-width="5" stroke-linecap="round"
      stroke-dasharray="${(C*f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 23 23)"/>
    ${ok?`<path d="M15.5 23.5l5 5 10-10" fill="none" stroke="var(--ok)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`
       :`<text x="23" y="28" text-anchor="middle" font-size="14" font-weight="750" fill="var(--text)">${n}</text>`}</svg>`;
}

function vHoy(fecha){
  const h = hoy();
  const F = (fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) && fecha<=h) ? fecha : h;
  const d = S.dias[F];
  const n = nHechos(F), ok = cumplido(F), com = comodin(F), suelo = sueloOk(F);
  const fz = fuerzaSemana(F);

  let estado;
  if(com) estado = `<div class="card estado comodin">
      <svg class="anillo" viewBox="0 0 46 46"><circle cx="23" cy="23" r="19" fill="none" stroke="#2a3a4f" stroke-width="5"/><text x="23" y="29" text-anchor="middle" font-size="17" fill="#bcd8f5">✦</text></svg>
      <div style="flex:1"><div class="t">Día comodín</div><div class="s">No suma ni rompe la racha. Para días de enfermedad, viaje o fuerza mayor.</div></div>
      <button class="btn sm ghost" data-comodin>Quitar</button></div>`;
  else estado = `<div class="card estado">
      ${anillo(suelo&&n<UMBRAL_DIA?UMBRAL_DIA:n, UMBRAL_DIA, ok)}
      <div style="flex:1"><div class="t">${ok ? (suelo && n<UMBRAL_DIA ? 'Día cumplido con el mínimo' : 'Día cumplido') : 'Faltan '+(UMBRAL_DIA-n)+' para cumplir'}</div>
      <div class="s">${ok ? (n>UMBRAL_DIA ? n+' cosas hechas.' : 'Lo que venga ahora, suma.') : 'O caminata + rutina de mañana, que también vale.'}</div></div>
      <button class="btn sm ghost" data-comodin title="Día comodín">Comodín</button></div>`;

  const dolor = d ? d.dolor : null;
  const escala = Array.from({length:11},(_,i)=>`<button data-dolor="${i}" class="${dolor===i?'on':''}" ${dolor===i?`style="background:${colDolor(i)}"`:''}>${i}</button>`).join('');

  const fila = x => {
    const on = hecho(F,x.k);
    let hint = x.hint;
    if(x.k==='fuerza') hint = `Sesión A o B · <span class="q">${fz} de ${OBJETIVO_FUERZA}</span> esta semana`;
    return `<div class="fac${on?' on':''}${x.extra?' extra':''}" data-tog="${x.k}" role="button" aria-pressed="${on}">
      <div class="ck">${IC.check}</div>
      <div class="tx"><div class="n">${x.nombre}</div>${hint?`<div class="h">${hint}</div>`:''}</div>
      ${x.ir?`<a class="ir" href="${x.ir}" aria-label="Ver ${x.nombre}">${IC.ir}</a>`:''}
    </div>`;
  };

  const primeraVez = !primerDia();
  const ayer = addD(F,-1), man = addD(F,1);

  return `
  ${AVISO_NUEVA ? `<div class="aviso"><div style="flex:1">Hay una versión nueva de la app.</div><button class="btn sm prim" data-accion="actualizar">Actualizar</button></div>` : ''}
  <div class="top"><div><h1>${F===h?'Hoy':F===addD(h,-1)?'Ayer':'Registro'}</h1><div class="sub">${(()=>{ const m=metricas(); return !m.hay ? 'Empezamos' : F!==h ? 'Puedes cambiar cualquier día' : (m.racha ? 'Racha: '+m.racha+(m.racha===1?' día':' días') : 'Hoy empieza otra racha'); })()}</div></div>
    <a class="ibtn" href="#/ajustes" aria-label="Ajustes">${IC.ajustes}</a></div>

  <div class="fecha">
    <a class="nav" href="#/hoy/${ayer}" aria-label="Día anterior">‹</a>
    <button class="d" data-accion="calendario"><b>${fmtLargo(F)}</b><span>${F===h?'hoy · toca para elegir otro día':'toca para elegir otro día'}</span></button>
    ${F<h ? `<a class="nav" href="#/hoy/${man}" aria-label="Día siguiente">›</a>` : `<button class="nav" disabled>›</button>`}
  </div>

  ${primeraVez ? `<div class="card small muted">Empezamos de cero. Marca lo que hayas hecho; si un día se te olvida, vuelve atrás cuando quieras: todos los días se pueden rellenar.</div>` : ''}
  ${estado}

  <div class="card">
    <div class="spread"><h2>Dolor de cuello</h2><span class="tiny ${dolor==null?'faint':'muted'}">${dolor==null?'sin registrar':'toca otra vez para borrar'}</span></div>
    <div class="dolor-esc">${escala}<div class="leyenda"><span>nada</span><span>tu basal: ${S.ajustes.basal}</span><span>el peor</span></div></div>
    <details class="mas" ${d && (d.energia!=null||d.nota) ? 'open':''}><summary>Energía y nota</summary>
      <div class="ener">${[1,2,3,4,5].map(i=>`<button data-ener="${i}" class="${d&&d.energia===i?'on':''}">${i}</button>`).join('')}</div>
      <div class="tiny faint" style="display:flex;justify-content:space-between;margin:3px 2px 10px"><span>agotado</span><span>a tope</span></div>
      <input id="nota" placeholder="Una línea, si quieres: qué ha pasado hoy" value="${esc(d?d.nota:'')}" maxlength="200">
    </details>
  </div>

  <div class="sec">Cuerpo</div>
  ${FACTORES.filter(x=>x.grupo==='cuerpo').map(fila).join('')}
  <div class="sec">El día</div>
  ${FACTORES.filter(x=>x.grupo==='dia').map(fila).join('')}
  <div style="height:8px"></div>`;
}

/* ---------- 9. ENTRENAR ---------- */
function filaEj(id, lista, extra){
  const e = POR_ID[id]; if(!e) return '';
  const meta = [e.series && `<b>${e.series}</b>`, e.tiempo && `<b>${e.tiempo}</b>`, extra].filter(Boolean).join(' · ');
  return `<a class="ex" href="#/ej/${e.id}?l=${lista}">
    <div class="th">${fig(e.id)}</div>
    <div class="tx"><div class="n">${e.nombre}</div><div class="m">${meta}</div></div>
    <span class="flecha">›</span></a>`;
}

function vEntrenar(cual){
  const k = (cual==='A'||cual==='B') ? cual : (S.flags.ses || (new Date().getDay()===4 ? 'B' : 'A'));
  if(S.flags.ses !== k){ S.flags.ses = k; guardar(); }
  const s = SESIONES[k], fz = fuerzaSemana(hoy());
  const bloques = s.bloques.map(b => {
    let cab = b.titulo, det = '';
    if(b.tipo==='superserie') det = `${b.rondas} rondas · ${b.descanso} de descanso`;
    if(b.tipo==='calentamiento') det = b.nota;
    if(b.tipo==='cierre') det = 'al final';
    return `<div class="bloque"><div class="bt"><b>${cab}</b><span>${det}</span></div>
      <div class="${b.tipo==='superserie'?'ss':''}">${b.ids.map(id => filaEj(id,'ses-'+k)).join('')}</div></div>`;
  }).join('');

  return `
  <div class="top"><div><h1>Entrenar</h1><div class="sub">Lunes A · Jueves B · Sábado A, opcional</div></div>
    <span class="chip ${fz>=OBJETIVO_FUERZA?'ok':''}"><b>${fz}</b> de ${OBJETIVO_FUERZA} esta semana</span></div>
  <div class="seg"><a href="#/entrenar/A" class="${k==='A'?'on':''}">Sesión A</a><a href="#/entrenar/B" class="${k==='B'?'on':''}">Sesión B</a></div>
  <div class="card"><div class="spread"><div><h2>${s.nombre} · ${s.sub}</h2><div class="small muted">${s.duracion}. Toca un ejercicio para ver cómo se hace.</div></div></div></div>
  ${bloques}
  <div class="sec">Cómo funciona</div>
  ${REGLAS.map((r,i)=>`<details class="regla${r.alerta?' alerta':''}" ${i===0&&!S.flags.reglasVistas?'open':''}><summary>${r.t}</summary><div class="c">${r.c}</div></details>`).join('')}
  <div style="height:8px"></div>`;
}

/* ---------- 10. ESTIRAR ---------- */
function vEstirar(modo, zona){
  const m = ['manana','noche','zonas'].includes(modo) ? modo : 'manana';
  const seg = `<div class="seg"><a href="#/estirar/manana" class="${m==='manana'?'on':''}">Mañana</a><a href="#/estirar/noche" class="${m==='noche'?'on':''}">Noche</a><a href="#/estirar/zonas" class="${m==='zonas'?'on':''}">Por zonas</a></div>`;
  let cuerpo = '';

  if(m==='manana' || m==='noche'){
    const r = RUTINAS[m], L = 'rut-'+m;
    cuerpo = `<div class="card"><div class="spread"><h2>${r.nombre}</h2><span class="chip"><b>${r.duracion}</b></span></div>
      <p class="small muted" style="margin:6px 0 0">${r.intro}</p></div>`;
    cuerpo += r.pasos.map((p,i) => {
      const t = p.t>=60 ? (p.t%60 ? Math.floor(p.t/60)+' min '+p.t%60+' s' : p.t/60+' min') : p.t+' s';
      if(p.ids){
        return `<div class="card" style="padding:12px">
          <div class="paso"><span class="tiempo">${i+1}</span><div style="flex:1"><div style="font-weight:650">${p.nombre}</div><div class="small muted">${t} · ${p.nota}</div></div></div>
          <div class="grupo-manos">${p.ids.map(id=>`<a href="#/ej/${id}?l=${L}" aria-label="${POR_ID[id].nombre}">${fig(id)}</a>`).join('')}</div>
          <div class="tiny faint" style="margin-top:6px">Toca cada uno para ver cómo se hace.</div></div>`;
      }
      const e = POR_ID[p.id];
      return `<a class="ex" href="#/ej/${e.id}?l=${L}"><div class="th">${fig(e.id)}</div>
        <div class="tx"><div class="n"><span class="tag">${i+1}</span>${e.nombre}</div><div class="m"><b>${t}</b> · ${p.nota}</div></div><span class="flecha">›</span></a>`;
    }).join('');
  } else {
    const z = ZONAS.some(x=>x.id===zona) ? zona : 'todas';
    const items = EJERCICIOS.filter(e => e.grupo==='estiramiento' && (z==='todas' || e.zona===z));
    cuerpo = `<p class="small muted" style="margin:0 2px 10px">Alternativas por zona, para el día que algo pida estiramiento. Cada uno lleva su dibujo y dónde lo tienes que notar.</p>
      <div class="buscar">${IC.lupa}<input id="buscar" type="search" placeholder="Buscar un estiramiento" autocomplete="off"></div>
      <div class="chips fila" style="margin-bottom:12px">
        <a class="chip ${z==='todas'?'sel':''}" href="#/estirar/zonas">Todas</a>
        ${ZONAS.map(x=>`<a class="chip ${z===x.id?'sel':''}" href="#/estirar/zonas/${x.id}">${x.nombre}</a>`).join('')}
      </div>
      <div id="lista-est">${
        z==='todas'
          ? ZONAS.map(x => { const its=items.filter(e=>e.zona===x.id); return its.length ? `<div class="sec" data-sec>${x.nombre}</div>`+its.map(e=>filaEj(e.id,'zona-'+x.id)).join('') : ''; }).join('')
          : items.map(e=>filaEj(e.id,'zona-'+z)).join('')
      }</div>
      <div class="vacio-txt" id="sin-res" hidden>No hay ninguno con ese nombre.</div>`;
  }
  return `<div class="top"><div><h1>Estirar</h1><div class="sub">Rutinas y catálogo por zonas</div></div></div>${seg}${cuerpo}<div style="height:8px"></div>`;
}

/* ---------- 11. FICHA DE EJERCICIO ---------- */
function vEj(id, clave){
  const e = POR_ID[id];
  if(!e) return `<div class="vacio-txt">No encuentro ese ejercicio.</div>`;
  const L = lista(clave), i = L.indexOf(id);
  const prev = i>0 ? POR_ID[L[i-1]] : null, sig = (i>=0 && i<L.length-1) ? POR_ID[L[i+1]] : null;
  const ctx = clave ? `${nombreLista(clave)}${i>=0?` · ${i+1} de ${L.length}`:''}` : (e.grupo==='estiramiento'?'Estiramiento':'Ejercicio');
  const usaSiente = [e.fondo,e.frente,e.dibujo].some(fn => fn && String(fn).includes('siente'));
  const fases = e.fases || [];

  const chips = [
    e.series && `<span class="chip ok"><b>${e.series}</b></span>`,
    e.tiempo && `<span class="chip ok"><b>${e.tiempo}</b></span>`,
    e.descanso && `<span class="chip">descanso <b>${e.descanso}</b></span>`,
    ...(e.material||[]).map(m => `<span class="chip amber">${m}</span>`)
  ].filter(Boolean).join('');

  return `
  <div class="dt-top">
    <button class="ibtn" data-accion="atras" aria-label="Volver">${IC.atras}</button>
    <div class="tt"><b>${esc(ctx)}</b><h1>${e.nombre}</h1></div>
  </div>

  <div class="lienzo">
    ${fig(e.id,'full')}
    ${e.vistaTxt?`<span class="chip vista">${e.vistaTxt}</span>`:''}
    <button class="pp" data-pp aria-label="Pausar o seguir">${IC.pausa}</button>
  </div>
  ${fases.length ? `<div class="fase">${fases.map((f,k)=>`<div class="${k===0?'on':''}"><b>${fases.length>1?(k===0?'Inicio':'Final'):'Posición'}</b>${f}</div>`).join('')}</div>` : ''}
  ${usaSiente ? `<div class="leyenda-fig"><span><i style="background:var(--hot);opacity:.7"></i>Dónde lo tienes que notar</span>${e.vista==='frente'&&e.mal?'<span><i style="background:var(--amber)"></i>Hombro encogido</span>':''}</div>` : ''}

  <div class="chips" style="margin-top:12px">${chips}</div>

  <div class="bloq"><h3>Para qué</h3><p>${e.que}</p></div>
  <div class="bloq"><h3>Colócate</h3><p>${e.montaje}</p></div>
  <div class="bloq"><h3>Paso a paso</h3><ol class="pasos">${e.pasos.map(p=>`<li>${p}</li>`).join('')}</ol></div>
  ${e.respira?`<div class="bloq"><h3>Respiración</h3><p>${e.respira}</p></div>`:''}
  <div class="bloq"><h3>Errores típicos</h3>
    <div class="caja-err"><ul>${e.errores.map(x=>`<li>${x}</li>`).join('')}</ul></div>
    ${e.mal?`<div class="asino"><div class="th">${fig(e.id,'mal')}</div><p><b>Así no.</b> ${e.mal.texto}</p></div>`:''}
  </div>
  <div class="bloq"><h3>Cómo saber que lo haces bien</h3><div class="caja-ok">${e.senal}</div></div>
  <div class="bloq dosc">
    ${e.siduele && e.siduele!=='—'?`<div class="card"><h3>Si molesta</h3><p>${e.siduele}</p></div>`:''}
    ${e.alternativa?`<div class="card"><h3>Alternativa</h3><p>${e.alternativa}</p></div>`:''}
  </div>
  <div class="bloq"><a class="btn ghost sm" style="width:100%" href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.nombre+' ejercicio')}" target="_blank" rel="noopener">Buscar un vídeo de ejemplo</a></div>

  ${L.length>1 ? `<div class="pie-nav">
    <a class="${prev?'':'vacio'}" ${prev?`href="#/ej/${prev.id}?l=${clave}" data-reemplaza`:''}><span>‹ Anterior</span><b>${prev?prev.nombre:''}</b></a>
    <a class="sig ${sig?'':'vacio'}" ${sig?`href="#/ej/${sig.id}?l=${clave}" data-reemplaza`:''}><span>Siguiente ›</span><b>${sig?sig.nombre:''}</b></a>
  </div>` : ''}
  <div style="height:6px"></div>`;
}

/* ---------- 12. PROGRESO ---------- */
function calendario(ym, destino){
  const [a,m] = ym.split('-').map(Number);
  const primero = new Date(a,m-1,1), n = new Date(a,m,0).getDate();
  const off = (primero.getDay()+6)%7, h = hoy(), ini = primerDia();
  let s = DIASC.slice(1).concat('D').map(x=>`<div class="dw">${x}</div>`).join('');
  for(let i=0;i<off;i++) s+='<div></div>';
  for(let i=1;i<=n;i++){
    const f = ym+'-'+p2(i);
    let cls = '';
    if(f>h) cls='fut';
    else if(comodin(f)) cls='com';
    else if(cumplido(f)) cls='ok';
    else if(registrado(f)) cls='part';
    if(f===h) cls+=' hoy';
    const d = S.dias[f], dot = d && d.dolor!=null && d.dolor>=8 ? '<span class="pt"></span>' : '';
    s += `<a class="${cls}" href="#/hoy/${f}" ${destino==='sheet'?'data-cerrar':''}>${i}${dot}</a>`;
  }
  return `<div class="cal">${s}</div>`;
}

function grafDolor(){
  const h=hoy(), N=30, dias=[]; for(let i=N-1;i>=0;i--) dias.push(addD(h,-i));
  const v = dias.map(f => S.dias[f] && S.dias[f].dolor!=null ? S.dias[f].dolor : null);
  if(v.filter(x=>x!=null).length < 2) return `<div class="small muted">Con un par de días registrados aparece aquí la curva de los últimos 30 días.</div>`;
  const med = v.map((_,i)=>{ const w=[]; for(let k=Math.max(0,i-6);k<=i;k++) if(v[k]!=null) w.push(v[k]); return w.length?w.reduce((a,b)=>a+b,0)/w.length:null; });
  const W=320,H=150,px=22,py=12, x=i=>px+i*(W-px-8)/(N-1), y=val=>py+(10-val)*(H-py-22)/10;
  const camino = arr => { let p='', on=false; arr.forEach((val,i)=>{ if(val==null){on=false;return;} p+=(on?'L':'M')+x(i).toFixed(1)+' '+y(val).toFixed(1); on=true; }); return p; };
  const b=S.ajustes.basal;
  return `<div class="grafico"><svg viewBox="0 0 ${W} ${H}">
    ${[0,5,10].map(t=>`<line x1="${px}" x2="${W-8}" y1="${y(t)}" y2="${y(t)}" stroke="var(--line)"/><text x="4" y="${y(t)+4}" font-size="10" fill="var(--faint)">${t}</text>`).join('')}
    <line x1="${px}" x2="${W-8}" y1="${y(b)}" y2="${y(b)}" stroke="var(--faint)" stroke-dasharray="4 5"/>
    <path d="${camino(v)}" fill="none" stroke="#56606e" stroke-width="1.6"/>
    ${v.map((val,i)=>val==null?'':`<circle cx="${x(i).toFixed(1)}" cy="${y(val).toFixed(1)}" r="2.6" fill="${colDolor(val)}"/>`).join('')}
    <path d="${camino(med)}" fill="none" stroke="var(--text)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${px}" y="${H-4}" font-size="10" fill="var(--faint)">${fmtCorto(dias[0])}</text>
    <text x="${W-8}" y="${H-4}" font-size="10" fill="var(--faint)" text-anchor="end">hoy</text>
  </svg>
  <div class="leyenda"><span><i style="background:var(--text)"></i>media de 7 días</span><span><i style="background:#56606e"></i>cada día</span><span><i style="background:var(--faint)"></i>tu basal (${b})</span></div></div>`;
}

function grafFuerza(){
  const lun = mondayOf(hoy()), sem=[]; for(let i=7;i>=0;i--) sem.push(addD(lun,-7*i));
  const n = sem.map(s => { let c=0; for(let k=0;k<7;k++) if(hecho(addD(s,k),'fuerza')) c++; return c; });
  const W=320,H=110, max=Math.max(3,...n), bw=(W-30)/8;
  const y = v => 10+(max-v)*(H-34)/max;
  return `<div class="grafico"><svg viewBox="0 0 ${W} ${H}">
    <line x1="22" x2="${W}" y1="${y(OBJETIVO_FUERZA)}" y2="${y(OBJETIVO_FUERZA)}" stroke="var(--ok)" stroke-dasharray="4 4" opacity=".6"/>
    <text x="2" y="${y(OBJETIVO_FUERZA)+4}" font-size="10" fill="var(--ok)">${OBJETIVO_FUERZA}</text>
    ${n.map((v,i)=>`<rect x="${(26+i*bw+4).toFixed(1)}" y="${y(v).toFixed(1)}" width="${(bw-8).toFixed(1)}" height="${(H-24-y(v)).toFixed(1)}" rx="5" fill="${v>=OBJETIVO_FUERZA?'var(--ok)':'var(--s3)'}"/>
      <text x="${(26+i*bw+bw/2).toFixed(1)}" y="${H-8}" font-size="10" fill="var(--faint)" text-anchor="middle">${pd(sem[i]).getDate()}/${pd(sem[i]).getMonth()+1}</text>`).join('')}
  </svg><div class="leyenda"><span>Entrenos por semana (lunes de cada semana). La línea es el objetivo.</span></div></div>`;
}

function rejillaSemana(){
  const h=hoy(), dias=[]; for(let i=6;i>=0;i--) dias.push(addD(h,-i));
  return `<table class="rejilla"><tr><th></th>${dias.map(f=>`<th>${DIASC[pd(f).getDay()]}</th>`).join('')}</tr>
    ${FACTORES.map(x=>`<tr><td class="l">${x.nombre.length>18?x.nombre.slice(0,17)+'…':x.nombre}</td>${dias.map(f=>`<td><i class="${hecho(f,x.k)?'on':comodin(f)?'x':''}"></i></td>`).join('')}</tr>`).join('')}
  </table>`;
}

function vProgreso(ymArg){
  const h=hoy(), ym = (ymArg && /^\d{4}-\d{2}$/.test(ymArg)) ? ymArg : h.slice(0,7);
  const m = metricas(), ms = mesStats(ym);
  const [a,mm] = ym.split('-').map(Number);
  const prevYM = ds(new Date(a,mm-2,1)).slice(0,7), nextYM = ds(new Date(a,mm,1)).slice(0,7);
  const dol7 = (()=>{ const v=[]; for(let i=0;i<7;i++){ const d=S.dias[addD(h,-i)]; if(d&&d.dolor!=null) v.push(d.dolor);} return v.length?(v.reduce((x,y)=>x+y,0)/v.length).toFixed(1):'—'; })();

  const cab = !m.hay ? `<div class="card"><h2>Aún no hay datos</h2><p class="small muted" style="margin:4px 0 0">En cuanto registres algunos días, aquí verás tus rachas, el calendario y cómo evoluciona el dolor.</p></div>`
    : `<div class="card" style="background:linear-gradient(180deg,#17251f,#141a19);border-color:#25453a">
        <div style="font-size:21px;font-weight:760;line-height:1.2">${m.peor===0?'Aún no has fallado ningún día':`Nunca has fallado más de ${m.peor} ${m.peor===1?'día seguido':'días seguidos'}`}</div>
        <div class="small" style="color:#a9e9c9;margin-top:4px">Racha actual: ${m.racha} · mejor racha: ${m.mejor}</div></div>`;

  return `
  <div class="top"><div><h1>Progreso</h1><div class="sub">Tendencia, no días sueltos</div></div>
    <a class="ibtn" href="#/ajustes" aria-label="Ajustes">${IC.ajustes}</a></div>
  ${cab}
  <div class="metricas">
    <div class="card"><div class="v">${ms.ok}<span class="small muted">/${ms.total}</span></div><div class="l">días cumplidos en ${MESES[mm-1]}</div></div>
    <div class="card"><div class="v">${fuerzaSemana(h)}<span class="small muted">/${OBJETIVO_FUERZA}</span></div><div class="l">entrenos esta semana</div></div>
    <div class="card"><div class="v">${dol7}</div><div class="l">dolor medio, 7 días</div></div>
  </div>

  <div class="card">
    <div class="spread" style="margin-bottom:10px">
      <a class="ibtn" href="#/progreso/${prevYM}" aria-label="Mes anterior">‹</a>
      <h2>${cap(MESES[mm-1])} ${a}</h2>
      ${nextYM<=h.slice(0,7)?`<a class="ibtn" href="#/progreso/${nextYM}" aria-label="Mes siguiente">›</a>`:'<span style="width:44px"></span>'}
    </div>
    ${calendario(ym)}
    <div class="leyenda" style="margin-top:10px"><span><i style="background:var(--ok-2);height:10px;width:10px;border-radius:3px"></i>cumplido</span><span><i style="background:#243029;height:10px;width:10px;border-radius:3px"></i>registrado</span><span><i style="background:#1f2a38;height:10px;width:10px;border-radius:3px"></i>comodín</span><span><i style="background:var(--amber);height:6px;width:6px;border-radius:50%"></i>dolor 8+</span></div>
    <div class="tiny faint" style="margin-top:6px">Toca un día para verlo o cambiarlo.${ms.com?` Comodines este mes: ${ms.com}.`:''}</div>
  </div>

  <div class="card"><h2 style="margin-bottom:10px">Dolor de cuello</h2>${grafDolor()}
    <p class="tiny faint" style="margin:8px 0 0">En dolor persistente lo primero que mejora no es la media: son los picos, y luego cuánto duran los brotes. Mira los puntos naranjas antes que la línea.</p></div>
  <div class="card"><h2 style="margin-bottom:10px">Últimos 7 días</h2>${rejillaSemana()}</div>
  <div class="card"><h2 style="margin-bottom:10px">Fuerza</h2>${grafFuerza()}</div>
  <a class="btn ghost" href="#/ajustes" style="margin-bottom:8px">Ajustes, copia de seguridad y actualizar</a>`;
}

/* ---------- 13. AJUSTES ---------- */
let SWREG = null, PROMPT_INST = null;

function vAjustes(){
  const instalada = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  return `
  <div class="dt-top"><button class="ibtn" data-accion="atras" aria-label="Volver">${IC.atras}</button><div class="tt"><h1>Ajustes</h1></div></div>

  <div class="card">
    <div class="spread"><div><h2>Versión</h2><div class="small muted">${VERSION}</div></div>
      ${AVISO_NUEVA?`<button class="btn sm prim" data-accion="actualizar">Actualizar ahora</button>`:`<button class="btn sm" data-accion="buscar">Buscar actualizaciones</button>`}</div>
    <details class="mas"><summary>Novedades de esta versión</summary><ul class="small muted" style="margin:8px 0 0;padding-left:18px">${CHANGELOG.map(c=>`<li>${c}</li>`).join('')}</ul></details>
  </div>

  ${!instalada ? `<div class="card"><h2>Instalar en el móvil</h2>
    <p class="small muted" style="margin:4px 0 10px">Icono propio, pantalla completa y funciona sin conexión.</p>
    <button class="btn sm" data-accion="instalar">${PROMPT_INST?'Instalar':'Cómo instalarla'}</button></div>` : ''}

  <div class="card"><h2>Tu dolor basal</h2>
    <p class="small muted" style="margin:4px 0 10px">Tu dolor de un día normal. Se dibuja como referencia en la gráfica.</p>
    <select id="basal">${Array.from({length:11},(_,i)=>`<option value="${i}" ${S.ajustes.basal===i?'selected':''}>${i} / 10</option>`).join('')}</select></div>

  <div class="card"><h2>Recordatorio diario</h2>
    <p class="small muted" style="margin:4px 0 10px">Una app web no puede avisarte con fiabilidad con el móvil bloqueado. Lo que sí funciona: añadir un evento diario a tu calendario.</p>
    <div class="row"><select id="hora" style="flex:1">${Array.from({length:24},(_,i)=>`<option value="${i}" ${S.ajustes.hora===i?'selected':''}>${p2(i)}:00</option>`).join('')}</select>
    <button class="btn sm" data-accion="ics">Añadir al calendario</button></div></div>

  <div class="card"><h2>Copia de seguridad</h2>
    <p class="small muted" style="margin:4px 0 10px">Todo vive en este móvil, sin cuenta ni nube. Si borras los datos del navegador, se van. Haz una copia de vez en cuando.</p>
    <div class="row" style="flex-wrap:wrap">
      <button class="btn sm" data-accion="json">Exportar copia</button>
      <button class="btn sm" data-accion="csv">Exportar CSV</button>
      <label class="btn sm ghost" for="importar">Importar copia</label>
      <input id="importar" type="file" accept=".json,application/json" hidden>
    </div>
    <div class="tiny faint" style="margin-top:8px">${S.flags.ultimaCopia?'Última copia: '+fmtCorto(S.flags.ultimaCopia):'Aún no has hecho ninguna copia.'} · Días registrados: ${Object.keys(S.dias).filter(registrado).length}</div>
  </div>

  <div class="card"><h2>Empezar de cero</h2>
    <p class="small muted" style="margin:4px 0 10px">Borra todos los días registrados de este móvil.</p>
    <button class="btn sm ghost" data-accion="borrar">Borrar todos los datos</button></div>
  <div style="height:8px"></div>`;
}

/* ---------- 14. Interacción ---------- */
function fechaVista(){ const r=ruta(); return (r.partes[0]==='hoy' && r.partes[1] && r.partes[1]<=hoy()) ? r.partes[1] : hoy(); }

document.addEventListener('click', ev => {
  const t = ev.target;

  if(t.closest('[data-cerrar]')){ cerrarSheet(); if(t.closest('a')) return; return; }

  const rep = t.closest('a[data-reemplaza]');
  if(rep){ ev.preventDefault(); ir(rep.getAttribute('href'), true); return; }

  if(t.closest('a')) return;   // los enlaces navegan solos

  const tog = t.closest('[data-tog]');
  if(tog){
    const F=fechaVista(), d=dia(F,true), k=tog.dataset.tog;
    d.f[k] = !d.f[k]; if(!d.f[k]) delete d.f[k];
    limpiaDia(F); guardar();
    const yaCumplido = cumplido(F);
    render();
    if(d.f[k] && yaCumplido && nHechos(F)===UMBRAL_DIA) toast('Día cumplido.');
    return;
  }
  const dl = t.closest('[data-dolor]');
  if(dl){ const F=fechaVista(), d=dia(F,true), v=Number(dl.dataset.dolor); d.dolor = d.dolor===v ? null : v; limpiaDia(F); guardar(); render(); return; }
  const en = t.closest('[data-ener]');
  if(en){ const F=fechaVista(), d=dia(F,true), v=Number(en.dataset.ener); d.energia = d.energia===v ? null : v; limpiaDia(F); guardar(); render(); return; }
  if(t.closest('[data-comodin]')){
    const F=fechaVista(), d=dia(F,true); d.comodin=!d.comodin; limpiaDia(F); guardar(); render();
    if(d.comodin) toast('Día comodín: no suma ni rompe la racha.');
    return;
  }
  const pp = t.closest('[data-pp]');
  if(pp){
    const f = window._figActual; if(!f || !f.animada) return;
    if(f.estaPausada()){ f.sigue(); pp.innerHTML = IC.pausa; } else { f.pausa(); pp.innerHTML = IC.play; }
    return;
  }
  const ac = t.closest('[data-accion]');
  if(ac && ACCIONES[ac.dataset.accion]) ACCIONES[ac.dataset.accion](ac);
});

document.addEventListener('change', ev => {
  const t = ev.target;
  if(t.id==='nota'){ const F=fechaVista(), d=dia(F,true); d.nota=t.value.slice(0,200); limpiaDia(F); guardar(); }
  if(t.id==='hora'){ S.ajustes.hora=Number(t.value); guardar(); }
  if(t.id==='basal'){ S.ajustes.basal=Number(t.value); guardar(); }
  if(t.id==='importar') importar(t.files[0]);
});
document.addEventListener('input', ev => {
  if(ev.target.id !== 'buscar') return;
  const q = ev.target.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  let n=0;
  app.querySelectorAll('#lista-est .ex').forEach(a => {
    const txt = a.textContent.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
    const ok = !q || txt.includes(q); a.hidden = !ok; if(ok) n++;
  });
  app.querySelectorAll('#lista-est [data-sec]').forEach(s => { s.hidden = !!q; });
  const sr = document.getElementById('sin-res'); if(sr) sr.hidden = n>0;
});

/* deslizar en la ficha: siguiente / anterior */
let tx0=null, ty0=null;
app.addEventListener('touchstart', e => { if(!location.hash.startsWith('#/ej/')) return; tx0=e.touches[0].clientX; ty0=e.touches[0].clientY; }, {passive:true});
app.addEventListener('touchend', e => {
  if(tx0==null) return;
  const dx=e.changedTouches[0].clientX-tx0, dy=e.changedTouches[0].clientY-ty0; tx0=null;
  if(Math.abs(dx)<70 || Math.abs(dy)>45) return;
  const a = app.querySelector(dx<0 ? '.pie-nav .sig[href]' : '.pie-nav a:not(.sig)[href]');
  if(a) ir(a.getAttribute('href'), true);
}, {passive:true});

const ACCIONES = {
  atras(){ if(history.length>1) history.back(); else ir('#/hoy'); },
  calendario(){
    const F=fechaVista();
    abrirSheet(`<h2 style="margin-bottom:12px">Elige un día</h2>${selectorMes(F.slice(0,7))}`);
  },
  mes(el){ abrirSheet(`<h2 style="margin-bottom:12px">Elige un día</h2>${selectorMes(el.dataset.ym)}`); },
  buscar(){ buscarActualizacion(); },
  actualizar(){ aplicarActualizacion(); },
  instalar(){ instalar(); },
  json(){ descargar('plan-copia-'+hoy()+'.json', JSON.stringify(S,null,1), 'application/json'); S.flags.ultimaCopia=hoy(); guardar(); render(); },
  csv(){ descargar('plan-'+hoy()+'.csv', csv(), 'text/csv'); },
  ics(){ descargar('recordatorio-plan.ics', ics(), 'text/calendar'); },
  borrar(){ if(confirm('¿Borrar todos los días registrados en este móvil? No se puede deshacer.')){ S.dias={}; guardar(); render(); toast('Datos borrados.'); } }
};

function selectorMes(ym){
  const [a,m]=ym.split('-').map(Number);
  const prev=ds(new Date(a,m-2,1)).slice(0,7), next=ds(new Date(a,m,1)).slice(0,7);
  return `<div class="spread" style="margin-bottom:10px">
      <button class="ibtn" data-accion="mes" data-ym="${prev}">‹</button><b>${cap(MESES[m-1])} ${a}</b>
      ${next<=hoy().slice(0,7)?`<button class="ibtn" data-accion="mes" data-ym="${next}">›</button>`:'<span style="width:44px"></span>'}</div>
    ${calendario(ym,'sheet')}
    <a class="btn ghost" href="#/hoy" data-cerrar style="margin-top:12px">Ir a hoy</a>`;
}

/* ---------- 15. Hoja, aviso ---------- */
const sheet = document.getElementById('sheet');
function abrirSheet(html){ document.getElementById('sheet-c').innerHTML = html; sheet.hidden = false; }
function cerrarSheet(){ sheet.hidden = true; }
let toastT=null;
function toast(msg){ const el=document.getElementById('toast'); el.textContent=msg; el.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>{el.hidden=true;},2600); }

/* ---------- 16. Exportar / importar ---------- */
function descargar(nombre, texto, tipo){
  const url = URL.createObjectURL(new Blob([texto],{type:tipo+';charset=utf-8'}));
  const a = document.createElement('a'); a.href=url; a.download=nombre; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000); toast('Archivo descargado.');
}
function csv(){
  const cols=['fecha',...FACTORES.map(f=>f.k),'dolor','energia','comodin','cumplido','nota'];
  const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  const filas=Object.keys(S.dias).sort().filter(registrado).map(f=>{ const d=S.dias[f];
    return [f,...FACTORES.map(x=>d.f[x.k]?1:0),d.dolor,d.energia,d.comodin?1:0,cumplido(f)?1:0,d.nota].map(q).join(','); });
  return [cols.map(q).join(','),...filas].join('\r\n');
}
function importar(file){
  if(!file) return;
  const fr=new FileReader();
  fr.onload=()=>{ try{
      const o=JSON.parse(fr.result); if(!o||!o.dias) throw 0;
      if(!confirm('Vas a sustituir los datos de este móvil por los de la copia. ¿Sigo?')) return;
      localStorage.setItem(KEY, JSON.stringify(o)); S=cargar(); render(); toast('Copia importada.');
    }catch(e){ toast('Ese archivo no es una copia de esta app.'); } };
  fr.readAsText(file);
}
function ics(){
  const h=S.ajustes.hora, d=hoy().replace(/-/g,'');
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Plan//ES','BEGIN:VEVENT','UID:plan-recordatorio-diario',
    'DTSTAMP:'+d+'T000000Z','DTSTART:'+d+'T'+p2(h)+'0000','DURATION:PT5M','RRULE:FREQ=DAILY',
    'SUMMARY:Registrar el día','DESCRIPTION:Son 20 segundos. Y si se te pasa\\, mañana lo rellenas.',
    'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Registrar el día','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
}

/* ---------- 17. Actualizar e instalar ---------- */
function buscarActualizacion(){
  if(!SWREG){ toast('Las actualizaciones solo funcionan con la app publicada.'); return; }
  if(!navigator.onLine){ toast('Sin conexión. Inténtalo cuando tengas datos.'); return; }
  toast('Buscando…');
  SWREG.update().then(()=>{
    setTimeout(()=>{
      if(SWREG.waiting || SWREG.installing){ AVISO_NUEVA=true; render(); toast('Hay una versión nueva.'); }
      else toast('Ya tienes la última versión.');
    }, 1500);
  }).catch(()=>toast('No he podido comprobarlo ahora.'));
}
function aplicarActualizacion(){
  if(SWREG && SWREG.waiting) SWREG.waiting.postMessage('SKIP_WAITING');
  else location.reload();
}
if('serviceWorker' in navigator){
  window.addEventListener('load', async () => {
    try{
      SWREG = await navigator.serviceWorker.register('sw.js', { updateViaCache:'none' });
      if(SWREG.waiting && navigator.serviceWorker.controller){ AVISO_NUEVA=true; render(); }
      SWREG.addEventListener('updatefound', () => {
        const n = SWREG.installing; if(!n) return;
        n.addEventListener('statechange', () => { if(n.state==='installed' && navigator.serviceWorker.controller){ AVISO_NUEVA=true; render(); } });
      });
    }catch(e){}
  });
  let recargando=false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if(recargando) return; recargando=true; location.reload(); });
}
let ultimaComprob = 0;
document.addEventListener('visibilitychange', () => {
  if(document.hidden) return;
  if(SWREG && navigator.onLine && Date.now()-ultimaComprob > 6*3600e3){ ultimaComprob=Date.now(); SWREG.update().catch(()=>{}); }
  if(!location.hash.startsWith('#/ej/')) render();
});
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); PROMPT_INST=e; });
async function instalar(){
  if(PROMPT_INST){ PROMPT_INST.prompt(); try{ await PROMPT_INST.userChoice; }catch(e){} PROMPT_INST=null; render(); return; }
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  abrirSheet(`<h2 style="margin-bottom:8px">Instalar en el móvil</h2>` + (ios
    ? `<p>En Safari: botón <b>Compartir</b> (el cuadrado con la flecha) → <b>Añadir a pantalla de inicio</b>.</p>`
    : `<p>En Chrome: menú <b>⋮</b> arriba a la derecha → <b>Instalar aplicación</b> o <b>Añadir a pantalla de inicio</b>.</p>`)
    + `<p class="small muted">Ábrela siempre desde el icono. La primera vez, con conexión: a partir de ahí funciona sin ella.</p>`);
}

/* ---------- 18. Arranque ---------- */
if(!location.hash) location.replace('#/hoy');
render();
if(S.flags.version && S.flags.version !== VERSION){
  setTimeout(()=>abrirSheet(`<h2 style="margin-bottom:8px">Novedades</h2><ul style="padding-left:18px;margin:0">${CHANGELOG.map(c=>`<li style="margin:6px 0">${c}</li>`).join('')}</ul><button class="btn prim" data-cerrar style="margin-top:14px">Vale</button>`), 400);
}
S.flags.version = VERSION; guardar();
