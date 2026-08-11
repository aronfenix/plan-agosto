/* ============================================================
   app.js — lógica. El contenido del plan está en data.js.
   Sin dependencias, sin build, sin red.
   ============================================================ */
'use strict';

/* ---------- 1. Utilidades de fecha ---------- */
const DAY = 86400000;
const DIAS  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const DIASC = ['D','L','M','X','J','V','S'];
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const p2 = n => String(n).padStart(2,'0');

function ds(d){ return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()); }
function pd(s){ const [a,b,c] = s.split('-').map(Number); return new Date(a,b-1,c); }
function addD(s,n){ const d = pd(s); d.setDate(d.getDate()+n); return ds(d); }
function diffD(a,b){ return Math.round((pd(a)-pd(b))/DAY); }
function mondayOf(s){ const d = pd(s); const w = (d.getDay()+6)%7; d.setDate(d.getDate()-w); return ds(d); }
function hoy(){ return ds(new Date()); }
function dow(s){ return pd(s).getDay(); }
function fmtLong(s){ const d = pd(s); return cap(DIAS[d.getDay()])+' '+d.getDate()+' de '+MESES[d.getMonth()]; }
function fmtShort(s){ const d = pd(s); return d.getDate()+' '+MESES[d.getMonth()].slice(0,3); }
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
function rango(a,b){ const out=[]; let c=a; let guard=0; while(c<=b && guard++<2000){ out.push(c); c=addD(c,1);} return out; }

/* ---------- 2. Almacén (localStorage, una sola clave) ---------- */
const KEY = 'plan-agosto-v1';

const VACIO = () => ({
  version: 1,
  settings: { reminderHour: 22, painBaseline: 6, walkMinTarget: 20 },
  weekPlans: {},
  days: {},
  loads: {},
  sessions: {},      // marcas de ejercicios hechos por fecha
  flags: {},         // avisos ya mostrados, última exportación
  cervicalLevel: 1
});

let S = cargar();

function cargar(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return semilla(VACIO());
    const o = JSON.parse(raw);
    const base = VACIO();
    const s = Object.assign(base, o);
    s.settings = Object.assign(base.settings, o.settings||{});
    s.sessions = s.sessions || {};
    s.flags = s.flags || {};
    s.loads = s.loads || {};
    return semilla(s);
  }catch(e){ console.warn('Datos ilegibles, empiezo de cero', e); return semilla(VACIO()); }
}
function guardar(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){ toast('No he podido guardar en este navegador.'); } }

/* Precarga del calendario por defecto (solo la primera vez) */
function semilla(s){
  if(!s.flags) s.flags = {};
  if(!s.flags.seeded){
    ['2026-08-10','2026-08-17','2026-08-24','2026-08-31'].forEach(mon => {
      if(!s.weekPlans[mon]) s.weekPlans[mon] = semanaDesdePlantilla(mon);
    });
    if(!s.weekPlans['2026-08-03']){
      const w = {};
      rango('2026-08-03','2026-08-09').forEach(d => { w[d] = { fuerza:null, piscina:null }; });
      Object.keys(SEMANA_ARRANQUE).forEach(d => { w[d] = Object.assign({}, SEMANA_ARRANQUE[d]); });
      s.weekPlans['2026-08-03'] = w;
    }
    s.flags.seeded = true;
  }
  return s;
}
function semanaDesdePlantilla(mon){
  const w = {};
  for(let i=0;i<7;i++){ const d = addD(mon,i); const t = SEMANA_TIPO[dow(d)]; w[d] = { fuerza:t.fuerza, piscina:t.piscina }; }
  return w;
}
function planSemana(mon){ return S.weekPlans[mon] || semanaDesdePlantilla(mon); }
function planDia(date){
  const w = planSemana(mondayOf(date));
  return (w && w[date]) ? w[date] : { fuerza:null, piscina:null };
}

/* ---------- 3. Días, factores y edición ---------- */
function dia(date, crear){
  if(!S.days[date] && crear){
    S.days[date] = { factors:{}, pain:null, energy:null, painkiller:false, note:'', createdAt:new Date().toISOString(), lockedAt:null };
  }
  return S.days[date] || null;
}
function aplicables(date){
  const p = planDia(date);
  return FACTORES.filter(f => !f.condicional || p[f.key] != null);
}
function aplica(date, key){
  const f = FACTORES.find(x => x.key===key);
  if(!f.condicional) return true;
  return planDia(date)[key] != null;
}
function estado(date, key){
  const d = S.days[date];
  if(!d || d.factors[key]==null) return 0;
  return d.factors[key];
}
function cumplido(date){
  const d = S.days[date];
  if(!d) return false;
  let n = 0;
  aplicables(date).forEach(f => { if((d.factors[f.key]||0) >= 1) n++; });
  return n >= 5;
}
function registrado(date){
  const d = S.days[date];
  if(!d) return false;
  if(d.pain != null) return true;
  return Object.values(d.factors||{}).some(v => v >= 1);
}
/* Ventana de gracia: hoy siempre; ayer hasta las 12:00 */
function editable(date){
  const h = hoy();
  if(date === h) return true;
  if(date === addD(h,-1) && new Date().getHours() < 12) return true;
  return false;
}
function bloquearVencidos(){
  let cambio = false;
  Object.keys(S.days).forEach(d => {
    if(!editable(d) && !S.days[d].lockedAt){ S.days[d].lockedAt = new Date().toISOString(); cambio = true; }
  });
  if(cambio) guardar();
}

/* ---------- 4. Métricas ---------- */
/* Las métricas empiezan el primer día que registraste algo, nunca antes:
   los días anteriores a estrenar la app no son fallos tuyos. */
function inicioMetricas(){
  const regs = Object.keys(S.days).filter(d => registrado(d)).sort();
  if(!regs.length) return null;
  return regs[0] > PLAN.inicio ? regs[0] : PLAN.inicio;
}
function diasEvaluables(){
  const ini = inicioMetricas();
  if(!ini) return [];
  const ayer = addD(hoy(),-1);
  if(ayer < ini) return [];
  return rango(ini, ayer);
}
function metricas(){
  const evs = diasEvaluables();
  const ini = inicioMetricas();
  const h = hoy();
  let peor = 0, run = 0, ultimoDoble = null;
  evs.forEach(d => {
    if(!cumplido(d)){ run++; if(run > peor) peor = run; if(run >= 2) ultimoDoble = d; }
    else run = 0;
  });
  /* racha actual: hacia atrás desde hoy (hoy solo suma si ya está cumplido) */
  let racha = 0, c = cumplido(h) ? h : addD(h,-1);
  while(ini && c >= ini && cumplido(c)){ racha++; c = addD(c,-1); }
  /* mejor racha */
  let mejor = 0, r2 = 0;
  evs.concat(cumplido(h) ? [h] : []).forEach(d => { if(cumplido(d)){ r2++; if(r2>mejor) mejor=r2; } else r2=0; });
  const desdeDoble = ultimoDoble ? diffD(h, ultimoDoble) : (ini ? diffD(h, ini) : 0);
  return { peor, desdeDoble, racha, mejor, hayDatos: !!ini, ultimoDoble, ini };
}
function semanaStats(mon){
  const dias = rango(mon, addD(mon,6));
  const h = hoy();
  let ok = 0, pasados = 0;
  dias.forEach(d => { if(d <= h){ pasados++; if(cumplido(d)) ok++; } });
  return { dias, ok, pasados, verde: ok >= 5 };
}

/* ---------- 4b. Instalación en el móvil ---------- */
let promptInstalar = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();          // usamos nuestro botón, no el aviso del navegador
  promptInstalar = e;
  if(VIEW === 'hoy' || VIEW === 'ajustes') render();
});
window.addEventListener('appinstalled', () => {
  promptInstalar = null;
  S.flags.instalada = true; guardar(); render();
  toast('Instalada. Ábrela desde el icono.');
});
function esStandalone(){
  return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}
function esIOS(){ return /iPhone|iPad|iPod/.test(navigator.userAgent); }
function puedeInstalarse(){ return !esStandalone() && !S.flags.instalada; }

function bannerInstalar(){
  if(!puedeInstalarse() || S.flags.installOculto) return '';
  return `<div class="install">
    <div class="itxt"><b>Llévala en el móvil</b><span class="tiny muted">Icono propio, pantalla completa y sin conexión.</span></div>
    <button class="btn sm primary" data-accion="instalar" style="flex:none">Instalar</button>
    <button class="ix" data-accion="ocultarInstalar" aria-label="Ahora no">✕</button>
  </div>`;
}
function instrucciones(){
  return esIOS()
    ? `<p>En el iPhone, con <b>Safari</b>: toca el botón <b>Compartir</b> (el cuadrado con la flecha hacia arriba), baja y elige <b>«Añadir a pantalla de inicio»</b>.</p>
       <p class="muted small">Ábrela siempre desde ese icono: así va a pantalla completa y funciona sin conexión.</p>`
    : `<p>En Android, con <b>Chrome</b>: menú <b>⋮</b> (arriba a la derecha) → <b>«Instalar aplicación»</b>, o <b>«Añadir a pantalla de inicio»</b>.</p>
       <p class="muted small">Entra una vez con conexión para que se guarde todo. A partir de ahí funciona en modo avión.</p>`;
}

/* ---------- 5. Router y arranque ---------- */
let VIEW = 'hoy';
let FECHA = hoy();               // día que se está editando en HOY
let SEM = mondayOf(hoy());       // semana visible
const app = document.getElementById('app');

function ir(v){ VIEW = v; render(); window.scrollTo(0,0); }
function render(){
  bloquearVencidos();
  const f = { hoy:vHoy, semana:vSemana, sesion:vSesion, tendencias:vTendencias, protocolos:vProtocolos, ajustes:vAjustes, planificar:vPlanificar }[VIEW] || vHoy;
  app.innerHTML = f();
  const mapa = { planificar:'semana', ajustes:'protocolos' };
  const activo = mapa[VIEW] || VIEW;
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.view === activo));
}
document.getElementById('nav').addEventListener('click', e => {
  const b = e.target.closest('button[data-view]'); if(!b) return;
  if(b.dataset.view === 'hoy') FECHA = hoy();
  ir(b.dataset.view);
});

/* ---------- 6. Pantalla HOY ---------- */
function vHoy(){
  const h = hoy();
  const m = metricas();
  const d = S.days[FECHA];
  const ed = editable(FECHA);
  const p = planDia(FECHA);
  const ayer = addD(h,-1);
  const puedeAyer = editable(ayer);

  /* cabecera destacada */
  let record;
  if(!m.hayDatos){
    record = `<div class="record">
      <div class="big">Empiezas hoy.</div>
      <div class="sub">Registra el día y la cuenta arranca. No hay nada que perder todavía.</div></div>`;
  } else if(m.peor === 0){
    record = `<div class="record">
      <div class="big">Aún no has fallado ningún día</div>
      <div class="sub">${m.desdeDoble} ${m.desdeDoble===1?'día':'días'} desde que empezaste</div></div>`;
  } else {
    record = `<div class="record">
      <div class="big">Nunca he fallado más de ${m.peor} ${m.peor===1?'día seguido':'días seguidos'}</div>
      <div class="sub">${m.desdeDoble} ${m.desdeDoble===1?'día':'días'} defendiendo este récord</div></div>`;
  }

  /* qué toca hoy */
  const partes = [];
  if(p.fuerza) partes.push('Fuerza '+p.fuerza);
  if(p.piscina) partes.push('piscina '+p.piscina);
  const quetoca = partes.length ? partes.join(' + ') : 'Sin sesión asignada — movilidad, cervicales y caminata';

  const hito = PLAN.hitos[FECHA] ? `<div class="hito"><b>${PLAN.hitos[FECHA]}</b></div>` : '';

  /* dolor */
  const prev = ultimoDolorAntes(FECHA);
  const valor = (d && d.pain != null) ? d.pain : (prev != null ? prev : S.settings.painBaseline);
  const sinDolor = !(d && d.pain != null);

  /* factores */
  const cells = FACTORES.map(f => {
    const na = !aplica(FECHA, f.key);
    const s = estado(FECHA, f.key);
    const glyph = s === 2 ? '✓' : s === 1 ? '·' : '';
    /* la fila entera es el área táctil (>48 px); el ⓘ va aparte */
    return `<div class="f${na?' na':''}${ed?'':' locked'}" data-s="${s}" data-tog="${f.key}"
        role="button" aria-label="${f.nombre}: ${na?'no aplica':s===2?'completo':s===1?'mínimo':'no hecho'}">
      <button class="i" data-info="${f.key}" aria-label="Definición de ${f.nombre}">ⓘ</button>
      <div class="name">${f.nombre}${na?'<br><span class="tiny faint">no aplica</span>':''}</div>
      <span class="dot">${na?'—':glyph}</span>
    </div>`;
  }).join('');

  const nCumple = aplicables(FECHA).filter(f => estado(FECHA,f.key) >= 1).length;

  const avisoExp = exportacionVencida() ? `<div class="hito small">Toca exportar una copia de los datos. <b>Ajustes → Exportar</b>.</div>` : '';

  return `
  ${record}
  ${hito}
  ${avisoExp}
  ${bannerInstalar()}
  <div class="dayhead">
    <div style="min-width:0">
      <div class="d1">${fmtLong(FECHA)}${FECHA!==h?' <span class="pill">ayer</span>':''}</div>
      <div class="d2">${quetoca}</div>
    </div>
    <div class="row" style="gap:6px;flex:none">
      ${(p.fuerza||p.piscina) ? `<button class="chip" data-go="sesion">Sesión ›</button>` : ''}
      <button class="chip" data-go="ajustes" aria-label="Ajustes">⚙</button>
    </div>
  </div>

  ${puedeAyer ? `<button class="chip ${FECHA===ayer?'on':''}" data-fecha="${FECHA===ayer?h:ayer}" style="margin-bottom:8px">${FECHA===ayer?'Volver a hoy':'Editar ayer'}</button>` : ''}

  ${!ed ? `<div class="card small muted">Este día está cerrado. Puedes verlo, pero ya no se edita. No pasa nada: lo registrado, registrado está.</div>` : ''}

  <div class="card painwrap">
    <div class="spread">
      <div><span class="painval">${valor}</span><span class="muted"> /10 dolor cervical</span></div>
      ${sinDolor ? '<span class="pill">sin registrar</span>' : ''}
    </div>
    <input type="range" min="0" max="10" step="1" value="${valor}" id="pain" ${ed?'':'disabled'}>
    <div class="ticks">${prev!=null ? `<span class="ref" style="left:${(prev/10)*100}%">ayer ${prev}</span>` : '<span class="ref faint" style="left:0">0</span>'}</div>
    <details>
      <summary>Energía, analgésico y nota</summary>
      <div style="margin-top:8px">
        <label class="lab">Energía</label>
        <div class="row" style="gap:6px">
          ${[1,2,3,4,5].map(n => `<button class="chip ${d&&d.energy===n?'on':''}" data-energy="${n}" ${ed?'':'disabled'} style="flex:1;justify-content:center">${n}</button>`).join('')}
        </div>
        <div class="row" style="margin-top:10px">
          <button class="chip ${d&&d.painkiller?'on':''}" data-pk="1" ${ed?'':'disabled'} style="flex:1;justify-content:center">${d&&d.painkiller?'✓ ':''}Analgésico</button>
        </div>
        <div style="margin-top:10px">
          <input id="nota" placeholder="Una línea: qué pasó" value="${esc(d?d.note:'')}" ${ed?'':'disabled'}>
        </div>
      </div>
    </details>
  </div>

  <div class="tiny muted" style="margin:0 2px 5px">
    ${nCumple} de ${aplicables(FECHA).length} factores · ${cumplido(FECHA)?'día cumplido':'faltan '+Math.max(0,5-nCumple)+' para cumplir'}
  </div>

  <div class="factors">${cells}</div>

  <button class="btn" data-suelo="1" ${ed?'':'disabled'} style="margin:8px 0 6px">Día de suelo mínimo</button>

  <div class="card tiny muted">
    Racha actual ${m.racha} · mejor racha ${m.mejor} · 5/7 es el objetivo, no 7/7.
  </div>
  <div class="row" style="gap:8px;margin-bottom:20px">
    <button class="btn sm ghost" data-go="planificar" style="flex:1">Planificar semana</button>
    <button class="btn sm ghost" data-go="protocolos" style="flex:1">Protocolos</button>
  </div>`;
}

function ultimoDolorAntes(date){
  for(let i=1;i<=14;i++){
    const d = S.days[addD(date,-i)];
    if(d && d.pain != null) return d.pain;
  }
  return null;
}

/* ---------- 7. Interacciones globales ---------- */
app.addEventListener('click', e => {
  const t = e.target;
  const go = t.closest('[data-go]');            if(go){ ir(go.dataset.go); return; }
  const fx = t.closest('[data-fecha]');         if(fx){ FECHA = fx.dataset.fecha; render(); return; }
  const info = t.closest('[data-info]');        if(info){ infoFactor(info.dataset.info); return; }
  const tog = t.closest('[data-tog]');          if(tog){ alternar(tog.dataset.tog); return; }
  const en = t.closest('[data-energy]');        if(en){ setCampo('energy', Number(en.dataset.energy)); return; }
  const pk = t.closest('[data-pk]');            if(pk){ const d = dia(FECHA,true); setCampo('painkiller', !d.painkiller); return; }
  const su = t.closest('[data-suelo]');         if(su){ sueloMinimo(); return; }
  const pr = t.closest('[data-proto]');         if(pr){ abrirProtocolo(pr.dataset.proto); return; }
  const ex = t.closest('[data-ex]');            if(ex){ toggleEx(ex.dataset.ex); return; }
  const sm = t.closest('[data-semana]');        if(sm){ SEM = sm.dataset.semana; render(); return; }
  const ac = t.closest('[data-accion]');        if(ac){ acciones[ac.dataset.accion](ac); return; }
});
app.addEventListener('input', e => {
  if(e.target.id === 'pain'){
    const v = Number(e.target.value);
    const d = dia(FECHA,true); d.pain = v; guardar();
    const pv = app.querySelector('.painval'); if(pv) pv.textContent = v;
    const pill = app.querySelector('.painwrap .pill'); if(pill) pill.remove();
  }
});
app.addEventListener('change', e => {
  /* al soltar el slider, no en cada píxel del arrastre */
  if(e.target.id === 'pain'){ revisarAvisos(); }
  if(e.target.id === 'nota'){ setCampo('note', e.target.value.slice(0,200), true); }
  if(e.target.dataset && e.target.dataset.plan){ guardarPlanCelda(e.target); }
  if(e.target.dataset && e.target.dataset.load){ guardarCarga(e.target); }
  if(e.target.id === 'set-hour'){ S.settings.reminderHour = Number(e.target.value); guardar(); programarAviso(); }
  if(e.target.id === 'set-base'){ S.settings.painBaseline = Number(e.target.value); guardar(); }
  if(e.target.id === 'file-import'){ importar(e.target.files[0]); }
});

function setCampo(k, v, silencioso){
  if(!editable(FECHA)) return;
  const d = dia(FECHA,true); d[k] = v; guardar();
  if(!silencioso) render();
}
function alternar(key){
  if(!editable(FECHA)) return;
  if(!aplica(FECHA,key)){ toast('Hoy no toca. No cuenta como fallo.'); return; }
  const d = dia(FECHA,true);
  const s = d.factors[key] || 0;
  d.factors[key] = s === 0 ? 2 : s === 2 ? 1 : 0;
  guardar(); render();
}
function sueloMinimo(){
  if(!editable(FECHA)) return;
  const d = dia(FECHA,true);
  ['caminata','movilidad','cervicales'].forEach(k => { d.factors[k] = 1; });
  guardar(); render();
  toast('Suelo mínimo marcado. Cuenta como hábito cumplido.');
}
function infoFactor(key){
  const f = FACTORES.find(x => x.key===key);
  const na = !aplica(FECHA,key);
  sheet(f.nombre, `<p>${f.def}</p>
    <p class="muted"><b>Mínimo (estado 1):</b> ${f.min}</p>
    ${na?'<p class="muted">Hoy no está asignado en el plan de la semana: se muestra como <i>no aplica</i> y no cuenta como fallo en ninguna métrica.</p>':''}
    <p class="tiny faint">Un toque avanza: no hecho → completo → mínimo → no hecho. Completo y mínimo cuentan exactamente igual.</p>`);
}

/* ---------- 8. Pantalla SEMANA ---------- */
function vSemana(){
  const st = semanaStats(SEM);
  const h = hoy();
  const cabeceras = st.dias.map(d => `<th>${DIASC[dow(d)]}<br><span class="faint">${pd(d).getDate()}</span></th>`).join('');
  const filas = FACTORES.map(f => {
    const tds = st.dias.map(d => {
      const na = !aplica(d,f.key);
      const s = estado(d,f.key);
      const cls = na ? 'na' : (s===2?'s2':s===1?'s1':'');
      return `<td><div class="cell ${cls}${d===h?' today':''}"></div></td>`;
    }).join('');
    return `<tr><td class="lbl">${f.nombre.length>16?f.nombre.slice(0,15)+'…':f.nombre}</td>${tds}</tr>`;
  }).join('');

  const pct = Math.min(100, Math.round(st.ok/7*100));

  return `
  <div class="spread" style="margin-bottom:10px">
    <button class="chip" data-semana="${addD(SEM,-7)}">‹</button>
    <div class="center"><b>Semana del ${fmtShort(SEM)}</b><div class="tiny muted">${fmtShort(SEM)} — ${fmtShort(addD(SEM,6))}</div></div>
    <button class="chip" data-semana="${addD(SEM,7)}">›</button>
  </div>

  <div class="card">
    <table class="grid"><thead><tr><th></th>${cabeceras}</tr></thead><tbody>${filas}</tbody></table>
    <div class="sep"></div>
    <div class="tiny muted" style="margin-bottom:6px">Dolor cervical</div>
    ${curvaSemana(st.dias)}
  </div>

  <div class="card">
    <div class="spread" style="margin-bottom:8px"><b>${st.ok}/7 días cumplidos</b><span class="tiny muted">objetivo 5</span></div>
    <div class="bar ${st.verde?'done':''}"><i style="width:${pct}%"></i></div>
    <div class="tiny muted" style="margin-top:8px">${st.verde?'Semana cumplida.':'Con 5 días la semana ya está cumplida.'}</div>
  </div>

  <button class="btn" data-accion="compartir" style="margin-bottom:10px">Compartir resumen</button>
  <button class="btn ghost" data-go="planificar" style="margin-bottom:24px">Planificar semana</button>`;
}

function curvaSemana(dias){
  const W = 700, H = 150, pad = 18;
  const pts = dias.map((d,i) => {
    const v = S.days[d] && S.days[d].pain != null ? S.days[d].pain : null;
    const x = pad + (i + 0.5) * ((W - pad*2)/7);
    return { x, v, y: v==null ? null : (H-24) - (v/10)*(H-44) };
  });
  const linea = pts.filter(p => p.v != null);
  let path = '';
  linea.forEach((p,i) => { path += (i?' L ':'M ') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); });
  const base = S.settings.painBaseline;
  const yBase = (H-24) - (base/10)*(H-44);
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">
    <line x1="${pad}" y1="${yBase}" x2="${W-pad}" y2="${yBase}" stroke="#3a4049" stroke-dasharray="4 5" stroke-width="1.5"/>
    <text x="${W-pad}" y="${yBase-6}" fill="#5c6472" font-size="14" text-anchor="end">basal ${base}</text>
    ${path?`<path d="${path}" fill="none" stroke="#7fb8e6" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`:''}
    ${linea.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="#7fb8e6"/><text x="${p.x.toFixed(1)}" y="${(p.y-12).toFixed(1)}" fill="#98a0ad" font-size="14" text-anchor="middle">${p.v}</text>`).join('')}
  </svg>`;
}

/* ---------- 9. Pantalla SESIÓN ---------- */
function vSesion(){
  const fecha = editable(FECHA) ? FECHA : hoy();
  const p = planDia(fecha);
  let out = `<div class="dayhead"><div><div class="d1">${fmtLong(fecha)}</div><div class="d2">Sesión de hoy</div></div>
    <button class="chip" data-go="hoy">Volver</button></div>`;

  if(!p.fuerza && !p.piscina){
    out += `<div class="card"><b>Hoy no hay sesión asignada.</b>
      <p class="muted small">Sigue el suelo mínimo: caminata, una ronda de flexión craneocervical y un bloque de movilidad. 27 minutos y el día cuenta.</p>
      <button class="btn ghost" data-go="planificar">Asignar sesión a este día</button></div>`;
  }
  if(p.fuerza) out += bloqueFuerza(p.fuerza, fecha);
  if(p.piscina) out += bloquePiscina(p.piscina, fecha);
  out += bloqueCervical(fecha);
  out += bloqueMovilidad();
  out += '<div style="height:24px"></div>';
  return out;
}

function bloqueFuerza(id, fecha){
  const s = SESIONES[id];
  const marcas = (S.sessions[fecha]||{});
  const ejs = s.ejercicios.map(e => {
    const done = !!marcas[e.id];
    const last = ultimaCarga(e.id, fecha);
    const cur = cargaDe(e.id, fecha);
    return `<div class="ex${done?' done':''}">
      <div class="exhead">
        <button class="check" data-ex="${e.id}">✓</button>
        <div class="exname">${e.nombre}<span class="exser">${e.series}</span></div>
      </div>
      <div class="body">
        <p style="margin:0 0 8px">${e.como}</p>
        <div class="aviso"><b>Técnica:</b> ${e.aviso}</div>
        <div class="loadrow">
          <input data-load="${e.id}|value" placeholder="Carga (p. ej. 2×10 kg)" value="${esc(cur.value)}">
          <input data-load="${e.id}|reps" placeholder="Reps (2×9)" value="${esc(cur.reps)}" style="max-width:38%">
        </div>
        <div class="lastload">${last ? 'Última vez: '+fmtShort(last.date)+' — '+esc(last.value||'—')+(last.reps?' · '+esc(last.reps):'') : 'Primera vez que registras este ejercicio.'}</div>
      </div>
    </div>`;
  }).join('');
  const todos = s.ejercicios.every(e => marcas[e.id]);
  return `<div class="card">
      <h2>${s.nombre}</h2>
      <p class="small muted" style="margin:6px 0 0">${s.formato}</p>
    </div>
    ${ejs}
    <button class="btn ${todos?'primary':''}" data-accion="marcarFuerza" data-f="${fecha}" style="margin-bottom:16px">
      ${estado(fecha,'fuerza')>=1 ? 'Fuerza ya marcada como hecha' : 'Marcar Fuerza como completa'}</button>`;
}

function bloquePiscina(tipo, fecha){
  const nado = NADO_ATADO[mondayOf(fecha)] || NADO_ATADO['2026-08-10'];
  const marcas = (S.sessions[fecha]||{});
  const bloque = (id, nombre, detalle) => `<div class="ex${marcas[id]?' done':''}">
      <div class="exhead"><button class="check" data-ex="${id}">✓</button>
      <div class="exname">${nombre}<span class="exser">${detalle}</span></div></div></div>`;

  let cuerpo;
  if(tipo === 'larga'){
    cuerpo = bloque('PIS-marcha', PISCINA_BLOQUES.marcha.nombre, PISCINA_BLOQUES.marcha.detalle)
      + bloque('PIS-nado', 'Nado atado con arnés', `${nado.series} · descanso ${nado.descanso} · ${nado.reparto}`)
      + bloque('PIS-escap', PISCINA_BLOQUES.escapular.nombre, PISCINA_BLOQUES.escapular.detalle)
      + bloque('PIS-desc', PISCINA_BLOQUES.descompresion.nombre, PISCINA_BLOQUES.descompresion.detalle);
  } else {
    cuerpo = bloque('PIS-suave', 'Nado suave a espalda', '5-8 min, sin intervalos, sin reloj')
      + bloque('PIS-escap', PISCINA_BLOQUES.escapular.nombre, PISCINA_BLOQUES.escapular.detalle)
      + bloque('PIS-desc', PISCINA_BLOQUES.descompresion.nombre, PISCINA_BLOQUES.descompresion.detalle);
  }

  return `<div class="card">
      <h2>Piscina ${tipo}</h2>
      <p class="small muted" style="margin:6px 0 0">${tipo==='larga'?'30-40 min.':'15-20 min. No es entrenamiento, es recuperación.'}</p>
    </div>
    <div class="aviso" style="margin:0 0 10px">
      <b>Avisos de técnica</b>
      <ul style="margin:6px 0 0;padding-left:18px">${PISCINA_AVISOS.map(a=>`<li style="margin:5px 0">${a}</li>`).join('')}</ul>
    </div>
    ${cuerpo}
    <button class="btn ${estado(fecha,'piscina')>=1?'':'primary'}" data-accion="marcarPiscina" data-f="${fecha}" style="margin-bottom:16px">
      ${estado(fecha,'piscina')>=1 ? 'Piscina ya marcada como hecha' : 'Marcar Piscina como completa'}</button>`;
}

function bloqueCervical(fecha){
  const n = CERVICAL.niveles.find(x => x.nivel === S.cervicalLevel) || CERVICAL.niveles[0];
  const iso = fecha >= CERVICAL.isometrico.desde;
  return `<div class="card">
    <h2>${CERVICAL.titulo} — nivel ${n.nivel}</h2>
    <p class="small muted" style="margin:4px 0 8px">${CERVICAL.cuando}</p>
    <div class="kv"><span>Aguante</span><b>${n.aguante}</b></div>
    <div class="kv"><span>Repeticiones</span><b>${n.reps}</b></div>
    <div class="kv"><span>Descanso</span><b>5-10 s</b></div>
    <ul class="small" style="padding-left:18px">${CERVICAL.como.map(x=>`<li style="margin:6px 0">${x}</li>`).join('')}</ul>
    ${iso ? `<div class="aviso"><b>Desde el 24 de agosto:</b> ${CERVICAL.isometrico.texto}</div>` : ''}
    <p class="tiny muted">${CERVICAL.subir}</p>
    <div class="row" style="gap:8px">
      <button class="btn sm" data-accion="nivelCervical" data-v="${Math.min(2,S.cervicalLevel+1)}" style="flex:1">Subir a nivel ${Math.min(2,S.cervicalLevel+1)}</button>
      <button class="btn sm ghost" data-accion="nivelCervical" data-v="${Math.max(1,S.cervicalLevel-1)}" style="flex:1">Bajar</button>
    </div>
  </div>`;
}

function bloqueMovilidad(){
  return `<div class="card">
    <h2>Movilidad en microdosis</h2>
    <p class="small muted" style="margin:4px 0 8px">${MOVILIDAD.intro}</p>
    ${MOVILIDAD.menus.map(m => `<h3 style="font-size:15px;margin:12px 0 4px">${m.nombre}</h3>
      <ul class="small" style="padding-left:18px;margin:0">${m.items.map(i=>`<li style="margin:5px 0">${i}</li>`).join('')}</ul>`).join('')}
  </div>`;
}

function toggleEx(id){
  const fecha = editable(FECHA) ? FECHA : hoy();
  if(!editable(fecha)) return;
  S.sessions[fecha] = S.sessions[fecha] || {};
  S.sessions[fecha][id] = !S.sessions[fecha][id];
  guardar(); render();
}
function ultimaCarga(exId, fecha){
  const arr = (S.loads[exId]||[]).filter(x => x.date !== fecha).sort((a,b)=> a.date<b.date?1:-1);
  return arr[0] || null;
}
function cargaDe(exId, fecha){
  const e = (S.loads[exId]||[]).find(x => x.date === fecha);
  return e || { value:'', reps:'' };
}
function guardarCarga(input){
  const [id, campo] = input.dataset.load.split('|');
  const fecha = editable(FECHA) ? FECHA : hoy();
  if(!editable(fecha)) return;
  S.loads[id] = S.loads[id] || [];
  let e = S.loads[id].find(x => x.date === fecha);
  if(!e){ e = { date:fecha, value:'', reps:'' }; S.loads[id].push(e); }
  e[campo] = input.value.slice(0,60);
  if(!e.value && !e.reps) S.loads[id] = S.loads[id].filter(x => x !== e);
  guardar();
}

/* ---------- 10. PLANIFICAR SEMANA ---------- */
function vPlanificar(){
  const monActual = mondayOf(hoy());
  const mon = (SEM === monActual || SEM === addD(monActual,7)) ? SEM : monActual;
  SEM = mon;
  const w = planSemana(mon);
  const filas = rango(mon, addD(mon,6)).map(d => {
    const c = w[d] || { fuerza:null, piscina:null };
    return `<div class="card" style="padding:10px 12px;margin-bottom:8px">
      <div class="spread" style="margin-bottom:8px"><b>${cap(DIAS[dow(d)])} ${pd(d).getDate()}</b><span class="tiny faint">${d}</span></div>
      <div class="row">
        <select data-plan="${d}|fuerza" style="flex:1">
          ${opt(c.fuerza, [['','Sin fuerza'],['M','Fuerza M'],['P1','Fuerza P1'],['P2','Fuerza P2']])}
        </select>
        <select data-plan="${d}|piscina" style="flex:1">
          ${opt(c.piscina, [['','Sin piscina'],['larga','Piscina larga'],['regenerativa','Regenerativa']])}
        </select>
      </div>
    </div>`;
  }).join('');

  const avisos = revisarPlan(mon).map(a => `<div class="hito small">${a}</div>`).join('');

  return `<div class="dayhead"><div><div class="d1">Planificar semana</div>
      <div class="d2">Semana del ${fmtShort(mon)}</div></div>
      <button class="chip" data-go="hoy">Volver</button></div>
    <div class="row" style="gap:8px;margin-bottom:12px">
      <button class="chip ${mon===monActual?'on':''}" data-semana="${monActual}" style="flex:1;justify-content:center">Esta semana</button>
      <button class="chip ${mon!==monActual?'on':''}" data-semana="${addD(monActual,7)}" style="flex:1;justify-content:center">La que viene</button>
    </div>
    ${avisos}
    ${filas}
    <p class="tiny muted" style="margin-bottom:24px">Los avisos no bloquean nada. Si esta semana las mancuernas solo están el jueves, se cambia y ya está.</p>`;
}
function opt(val, pares){
  return pares.map(([v,l]) => `<option value="${v}" ${String(val||'')===v?'selected':''}>${l}</option>`).join('');
}
function guardarPlanCelda(sel){
  const [fecha, campo] = sel.dataset.plan.split('|');
  const mon = mondayOf(fecha);
  if(!S.weekPlans[mon]) S.weekPlans[mon] = semanaDesdePlantilla(mon);
  if(!S.weekPlans[mon][fecha]) S.weekPlans[mon][fecha] = { fuerza:null, piscina:null };
  S.weekPlans[mon][fecha][campo] = sel.value || null;
  guardar(); render();
}
function revisarPlan(mon){
  const w = planSemana(mon);
  const dias = rango(mon, addD(mon,6));
  const av = [];
  const nf = dias.filter(d => w[d] && w[d].fuerza).length;
  if(nf !== 3) av.push(`Hay ${nf} ${nf===1?'sesión':'sesiones'} de fuerza esta semana. El plan pide 3.`);
  for(let i=0;i<6;i++){
    if(w[dias[i]] && w[dias[i]].fuerza && w[dias[i+1]] && w[dias[i+1]].fuerza){
      av.push(`Fuerza en dos días seguidos (${DIASC[dow(dias[i])]} y ${DIASC[dow(dias[i+1])]}). Mejor dejar un día entre medias.`);
      break;
    }
  }
  dias.forEach(d => {
    if(w[d] && w[d].fuerza && w[d].piscina === 'larga')
      av.push(`El ${DIAS[dow(d)]} hay fuerza y piscina larga. Los días de fuerza la piscina debería ser regenerativa.`);
  });
  return av;
}

/* ---------- 11. TENDENCIAS ---------- */
function vTendencias(){
  const datos = Object.keys(S.days).filter(d => S.days[d].pain != null).sort();
  let grafico = '<div class="card muted small">Todavía no hay dolor registrado. En cuanto haya unos días, aquí aparece la curva con su media móvil.</div>';
  if(datos.length >= 2) grafico = `<div class="card">
      <div class="spread" style="margin-bottom:6px"><b>Evolución del dolor</b><span class="tiny muted">línea clara = media de 7 días</span></div>
      ${curvaDolor(datos)}
    </div>`;

  return `<h1 style="font-size:22px;margin-bottom:12px">Tendencias</h1>
    ${grafico}
    ${comparaciones()}
    ${contadoresMes()}
    <div style="height:24px"></div>`;
}

function curvaDolor(fechas){
  const ini = fechas[0], fin = fechas[fechas.length-1];
  const todos = rango(ini, fin);
  const serie = todos.map(d => (S.days[d] && S.days[d].pain != null) ? S.days[d].pain : null);
  const media = serie.map((_,i) => {
    const v = [];
    for(let k=Math.max(0,i-6);k<=i;k++) if(serie[k]!=null) v.push(serie[k]);
    return v.length ? v.reduce((a,b)=>a+b,0)/v.length : null;
  });
  const W = 700, H = 260, pad = 30;
  const x = i => pad + (todos.length===1?0:(i*(W-pad*2)/(todos.length-1)));
  const y = v => (H-26) - (v/10)*(H-52);
  const seg = (arr, dash) => {
    let p = '', abierto = false;
    arr.forEach((v,i) => { if(v==null){ abierto=false; return; } p += (abierto?' L ':' M ') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); abierto = true; });
    return p ? `<path d="${p}" fill="none" stroke="${dash?'#e9ecf1':'#4b6f8f'}" stroke-width="${dash?3.5:2}" stroke-linejoin="round" stroke-linecap="round" opacity="${dash?1:.75}"/>` : '';
  };
  const base = S.settings.painBaseline;
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">
    ${[0,5,10].map(v=>`<line x1="${pad}" y1="${y(v)}" x2="${W-pad}" y2="${y(v)}" stroke="#252a33" stroke-width="1"/>
      <text x="2" y="${y(v)+5}" fill="#5c6472" font-size="14">${v}</text>`).join('')}
    <line x1="${pad}" y1="${y(base)}" x2="${W-pad}" y2="${y(base)}" stroke="#3a4049" stroke-dasharray="4 6" stroke-width="1.5"/>
    ${seg(serie,false)}
    ${seg(media,true)}
    <text x="${pad}" y="${H-6}" fill="#5c6472" font-size="14">${fmtShort(ini)}</text>
    <text x="${W-pad}" y="${H-6}" fill="#5c6472" font-size="14" text-anchor="end">${fmtShort(fin)}</text>
  </svg>`;
}

/* Agregados por semana */
function semanasConDatos(){
  const mons = {};
  Object.keys(S.days).forEach(d => { mons[mondayOf(d)] = true; });
  return Object.keys(mons).sort().map(mon => {
    const dias = rango(mon, addD(mon,6));
    const dolores = dias.map(d => S.days[d] && S.days[d].pain != null ? S.days[d].pain : null).filter(v => v != null);
    const cuenta = k => dias.filter(d => aplica(d,k) && estado(d,k) >= 1).length;
    return {
      mon,
      dolor: dolores.length ? dolores.reduce((a,b)=>a+b,0)/dolores.length : null,
      nDolor: dolores.length,
      movilidad: cuenta('movilidad'),
      cervicales: cuenta('cervicales'),
      fuerza: cuenta('fuerza'),
      sueno: cuenta('sueno'),
      postura: cuenta('postura')
    };
  }).filter(w => w.dolor != null);
}
const COMPARACIONES = [
  { t:'Movilidad', a:'Semanas con ≥5 días de movilidad', b:'Semanas con <5', f:w => w.movilidad>=5 },
  { t:'Cervicales', a:'Semanas con ≥5 días de cervicales', b:'Semanas con <5', f:w => w.cervicales>=5 },
  { t:'Fuerza', a:'Semanas con 3 sesiones de fuerza', b:'Semanas con 0-1', f:w => w.fuerza>=3, g:w => w.fuerza<=1 },
  { t:'Sueño', a:'Semanas con ≥5 días acostándote a tu hora', b:'Semanas con <5', f:w => w.sueno>=5 },
  { t:'Pantalla y postura', a:'Semanas con ≥5 días cuidando la postura', b:'Semanas con <5', f:w => w.postura>=5 }
];
function comparaciones(){
  const ws = semanasConDatos();
  const bloques = COMPARACIONES.map(c => {
    const A = ws.filter(c.f);
    const B = ws.filter(c.g ? c.g : (w => !c.f(w)));
    const faltan = Math.max(0,6-A.length) + Math.max(0,6-B.length);
    if(faltan > 0){
      return `<div class="cmp"><b>${c.t}</b>
        <div class="muted small" style="margin-top:6px">Faltan ${faltan} ${faltan===1?'semana':'semanas'} de datos.</div>
        <div class="disclaimer">Correlación, no causa. Con pocas semanas, el azar produce diferencias así.</div></div>`;
    }
    const ma = media(A), mb = media(B);
    const max = Math.max(ma,mb,1);
    const dif = (mb-ma);
    return `<div class="cmp"><b>${c.t}</b>
      <div class="cmpbars">
        <div class="cmpbar"><i style="height:${(ma/max*100).toFixed(0)}%"></i><span>${c.a}<br><b>${ma.toFixed(1)}</b></span></div>
        <div class="cmpbar"><i style="height:${(mb/max*100).toFixed(0)}%"></i><span>${c.b}<br><b>${mb.toFixed(1)}</b></span></div>
      </div>
      <div class="small">${Math.abs(dif).toFixed(1)} puntos de dolor ${dif>=0?'menos':'más'} en el primer grupo.</div>
      <div class="disclaimer">Correlación, no causa. Con pocas semanas, el azar produce diferencias así.</div></div>`;
  }).join('<div class="sep"></div>');
  return `<div class="card"><h2 style="font-size:17px">Comparaciones</h2>${bloques}</div>`;
}
function media(arr){ return arr.length ? arr.reduce((a,w)=>a+w.dolor,0)/arr.length : 0; }

function contadoresMes(){
  const h = pd(hoy());
  const mes = h.getFullYear()+'-'+p2(h.getMonth()+1);
  const dias = Object.keys(S.days).filter(d => d.startsWith(mes)).sort();
  const base = S.settings.painBaseline;
  const dolores = dias.map(d => S.days[d].pain).filter(v => v != null);
  const cefalea = dolores.filter(v => v >= base+1).length;
  const pastillas = dias.filter(d => S.days[d].painkiller).length;
  const fu = dias.filter(d => aplica(d,'fuerza') && estado(d,'fuerza')>=1).length;
  const pi = dias.filter(d => aplica(d,'piscina') && estado(d,'piscina')>=1).length;
  const med = dolores.length ? (dolores.reduce((a,b)=>a+b,0)/dolores.length).toFixed(1) : '—';
  const pico = dolores.length ? Math.max.apply(null,dolores) : '—';
  return `<div class="card"><h2 style="font-size:17px;margin-bottom:6px">${cap(MESES[h.getMonth()])}</h2>
    <div class="kv"><span>Días con cefalea (≥ ${base+1})</span><b>${cefalea}</b></div>
    <div class="kv"><span>Analgésicos</span><b>${pastillas}</b></div>
    <div class="kv"><span>Sesiones de fuerza</span><b>${fu}</b></div>
    <div class="kv"><span>Sesiones de piscina</span><b>${pi}</b></div>
    <div class="kv"><span>Dolor medio</span><b>${med}</b></div>
    <div class="kv"><span>Pico máximo</span><b>${pico}</b></div>
  </div>`;
}

/* ---------- 12. PROTOCOLOS ---------- */
function vProtocolos(){
  return `<h1 style="font-size:22px;margin-bottom:12px">Textos</h1>
    <div class="card">
      ${['roto','reglas','brote','suelo'].map(id => `<button class="btn ghost" data-proto="${id}" style="justify-content:flex-start;margin-bottom:8px">${PROTOCOLOS[id].titulo}</button>`).join('')}
    </div>
    <div class="card proto">
      <h2 style="font-size:17px">${PROTOCOLOS.reglas.titulo}</h2>
      <ol>${PROTOCOLOS.reglas.items.map(i=>`<li>${i}</li>`).join('')}</ol>
    </div>
    <div class="card proto">
      <h2 style="font-size:17px">${PROTOCOLOS.suelo.titulo}</h2>
      <p>${PROTOCOLOS.suelo.texto}</p>
    </div>
    ${bloqueCervical(hoy())}
    ${bloqueMovilidad()}
    <div class="card">
      <h2 style="font-size:17px;margin-bottom:8px">Piscina — avisos de técnica</h2>
      <ul class="small" style="padding-left:18px;margin:0">${PISCINA_AVISOS.map(a=>`<li style="margin:6px 0">${a}</li>`).join('')}</ul>
    </div>
    <button class="btn ghost" data-go="ajustes" style="margin-bottom:24px">Ajustes</button>`;
}
function htmlProtocolo(id){
  const p = PROTOCOLOS[id];
  let c = '';
  if(p.tipo === 'lista') c = `<ol>${p.items.map(i=>`<li>${i}</li>`).join('')}</ol>`;
  if(p.tipo === 'texto') c = `<p>${p.texto}</p>`;
  if(p.tipo === 'bloques'){
    c = (p.subtitulo?`<p class="muted small">${p.subtitulo}</p>`:'') +
      p.bloques.map(b => `<div class="pblock"><b>${b.cabecera}</b>${b.texto}</div>`).join('') +
      `<div class="flags"><h3>${p.banderas.titulo}</h3><ul>${p.banderas.items.map(i=>`<li>${i}</li>`).join('')}</ul></div>`;
  }
  return `<div class="proto">${c}</div>`;
}
function abrirProtocolo(id, extra){
  sheet(PROTOCOLOS[id].titulo, (extra||'') + htmlProtocolo(id));
}

/* Aparición automática */
function revisarAvisos(){
  const h = hoy();
  const ayer = addD(h,-1), antes = addD(h,-2);
  const ini = inicioMetricas();
  /* dos días consecutivos no cumplidos, ya cerrados */
  if(ini && antes >= ini && !cumplido(ayer) && !cumplido(antes)){
    if(!S.flags['roto:'+h]){
      S.flags['roto:'+h] = true; guardar();
      abrirProtocolo('roto', `<p class="muted small">Dos días seguidos sin cumplir. No es un juicio: es el momento en el que este texto sirve para algo.</p>`);
      return;
    }
  }
  /* dolor por encima de basal+2 dos días seguidos */
  const b = S.settings.painBaseline;
  const dh = S.days[h], da = S.days[ayer];
  if(dh && da && dh.pain != null && da.pain != null && dh.pain > b+2 && da.pain > b+2){
    if(!S.flags['brote:'+h]){
      S.flags['brote:'+h] = true; guardar();
      abrirProtocolo('brote', `<p class="muted small">Dos días por encima de ${b+2}. Esto es lo que toca hacer.</p>`);
    }
  }
}

/* ---------- 13. AJUSTES ---------- */
function vAjustes(){
  const nt = ('Notification' in window) ? Notification.permission : 'no-soportado';
  const ultima = S.flags.lastExport;
  return `<div class="dayhead"><div><div class="d1">Ajustes</div></div><button class="chip" data-go="hoy">Volver</button></div>
    ${puedeInstalarse() ? `<div class="card">
      <h2 style="font-size:17px;margin-bottom:6px">Llévala en el móvil</h2>
      <div class="tiny muted" style="margin-bottom:10px">Icono propio, pantalla completa y funciona sin conexión.</div>
      <button class="btn sm primary" data-accion="instalar">${promptInstalar?'Instalar aplicación':'Cómo instalarla'}</button>
    </div>` : `<div class="card tiny muted">Ya está instalada en este móvil.</div>`}
    <div class="card">
      <label class="lab">Hora del recordatorio</label>
      <select id="set-hour">${Array.from({length:24},(_,i)=>`<option value="${i}" ${S.settings.reminderHour===i?'selected':''}>${p2(i)}:00</option>`).join('')}</select>
      <div class="tiny muted" style="margin:8px 0 12px">Solo avisa si ese día aún no has registrado nada. Nunca avisa de rachas.</div>
      <button class="btn sm" data-accion="permiso">${nt==='granted'?'Notificaciones activadas':nt==='no-soportado'?'Este navegador no las soporta':'Activar notificaciones'}</button>
    </div>
    <div class="card">
      <label class="lab">Dolor basal declarado</label>
      <select id="set-base">${Array.from({length:11},(_,i)=>`<option value="${i}" ${S.settings.painBaseline===i?'selected':''}>${i}/10</option>`).join('')}</select>
      <div class="tiny muted" style="margin-top:8px">Se usa para contar días con cefalea (≥ basal+1) y para el protocolo de brote (> basal+2).</div>
    </div>
    <div class="card">
      <h2 style="font-size:17px;margin-bottom:8px">Copia de datos</h2>
      ${exportacionVencida()?`<div class="hito small">Hace tiempo que no exportas. ${ultima?'Última copia: '+fmtShort(ultima)+'.':''}</div>`:''}
      <button class="btn sm" data-accion="exportJSON" style="margin-bottom:8px">Exportar JSON</button>
      <button class="btn sm" data-accion="exportCSV" style="margin-bottom:8px">Exportar CSV</button>
      <label class="btn sm ghost" for="file-import" style="margin-bottom:4px">Importar JSON</label>
      <input type="file" id="file-import" accept="application/json,.json" style="display:none">
      <div class="tiny muted" style="margin-top:8px">Todo vive en este móvil. Sin cuenta, sin nube, sin servidor. Si borras los datos del navegador, se van.</div>
    </div>
    <div class="card">
      <div class="kv"><span>Nivel cervical</span><b>${S.cervicalLevel}</b></div>
      <div class="kv"><span>Días registrados</span><b>${Object.keys(S.days).length}</b></div>
      <div class="kv"><span>Versión de datos</span><b>${S.version}</b></div>
    </div>
    <div style="height:24px"></div>`;
}
function exportacionVencida(){
  const u = S.flags.lastExport;
  if(!u) return Object.keys(S.days).length >= 14;
  return diffD(hoy(), u) >= 30;
}

/* ---------- 14. Acciones ---------- */
const acciones = {
  marcarFuerza(){ marcarFactor('fuerza'); },
  marcarPiscina(){ marcarFactor('piscina'); },
  nivelCervical(el){ S.cervicalLevel = Number(el.dataset.v); guardar(); render(); toast('Nivel cervical: '+S.cervicalLevel); },
  compartir(){ compartirSemana(); },
  async instalar(){
    if(promptInstalar){
      try{
        promptInstalar.prompt();
        const res = await promptInstalar.userChoice;
        if(res && res.outcome === 'accepted') promptInstalar = null;   // si dice que no, el botón sigue sirviendo
        render();
        return;
      }catch(e){ promptInstalar = null; }   /* el evento ya se había usado: seguimos a las instrucciones */
    }
    /* iOS y navegadores sin prompt nativo: se explica a mano */
    sheet('Llévala en el móvil', instrucciones());
  },
  ocultarInstalar(){ S.flags.installOculto = true; guardar(); render(); },
  exportJSON(){ descargar('plan-agosto-'+hoy()+'.json', JSON.stringify(S,null,2), 'application/json'); S.flags.lastExport = hoy(); guardar(); },
  exportCSV(){ descargar('plan-agosto-'+hoy()+'.csv', csv(), 'text/csv'); S.flags.lastExport = hoy(); guardar(); },
  permiso(){ pedirPermiso(); }
};
function marcarFactor(k){
  const fecha = editable(FECHA) ? FECHA : hoy();
  if(!editable(fecha)) return toast('Ese día ya está cerrado.');
  if(!aplica(fecha,k)) return toast('Hoy no toca esa sesión.');
  const d = dia(fecha,true);
  d.factors[k] = 2; guardar(); render();
  toast(cap(k)+' marcada. Buen trabajo.');
}

/* ---------- 15. Compartir resumen (canvas → PNG) ---------- */
function compartirSemana(){
  const st = semanaStats(SEM);
  const W = 760, H = 1120, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const css = getComputedStyle(document.documentElement);
  const col = n => css.getPropertyValue(n).trim();
  g.fillStyle = col('--bg'); g.fillRect(0,0,W,H);

  g.fillStyle = col('--text'); g.font = '600 34px system-ui,sans-serif';
  g.fillText('Semana del '+fmtShort(SEM), 40, 64);
  g.fillStyle = col('--muted'); g.font = '22px system-ui,sans-serif';
  g.fillText(fmtShort(SEM)+' — '+fmtShort(addD(SEM,6)), 40, 98);

  const x0 = 300, cw = (W-x0-40)/7, y0 = 150, ch = 46;
  g.font = '20px system-ui,sans-serif'; g.fillStyle = col('--muted');
  st.dias.forEach((d,i) => { g.textAlign='center'; g.fillText(DIASC[dow(d)], x0+cw*i+cw/2, y0-12); });
  g.textAlign = 'left';
  FACTORES.forEach((f,r) => {
    g.fillStyle = col('--muted'); g.font = '19px system-ui,sans-serif';
    const nom = f.nombre.length > 20 ? f.nombre.slice(0,19)+'…' : f.nombre;
    g.fillText(nom, 40, y0 + r*ch + 30);
    st.dias.forEach((d,i) => {
      const na = !aplica(d,f.key), s = estado(d,f.key);
      g.fillStyle = na ? '#1c2129' : s===2 ? col('--ok') : s===1 ? col('--ok-dim') : col('--off');
      rr(g, x0+cw*i+4, y0+r*ch+8, cw-8, ch-16, 7); g.fill();
    });
  });

  /* curva de dolor alineada */
  const yc = y0 + FACTORES.length*ch + 50, hc = 200;
  g.fillStyle = col('--muted'); g.font = '20px system-ui,sans-serif';
  g.fillText('Dolor cervical', 40, yc - 8);
  const base = S.settings.painBaseline;
  const py = v => yc + hc - (v/10)*hc;
  g.strokeStyle = col('--off'); g.setLineDash([6,7]); g.beginPath();
  g.moveTo(x0, py(base)); g.lineTo(W-40, py(base)); g.stroke(); g.setLineDash([]);
  g.strokeStyle = col('--accent'); g.lineWidth = 4; g.beginPath();
  let started = false;
  st.dias.forEach((d,i) => {
    const v = S.days[d] && S.days[d].pain != null ? S.days[d].pain : null;
    if(v == null) return;
    const x = x0+cw*i+cw/2;
    if(started) g.lineTo(x, py(v)); else { g.moveTo(x, py(v)); started = true; }
  });
  g.stroke();
  st.dias.forEach((d,i) => {
    const v = S.days[d] && S.days[d].pain != null ? S.days[d].pain : null;
    if(v == null) return;
    const x = x0+cw*i+cw/2;
    g.fillStyle = col('--accent'); g.beginPath(); g.arc(x, py(v), 7, 0, 7); g.fill();
    g.fillStyle = col('--text'); g.font = '19px system-ui,sans-serif'; g.textAlign = 'center';
    g.fillText(v, x, py(v)-16);
  });
  g.textAlign = 'left';

  /* barra */
  const yb = yc + hc + 70;
  g.fillStyle = col('--text'); g.font = '600 30px system-ui,sans-serif';
  g.fillText(st.ok+'/7 días cumplidos', 40, yb);
  g.fillStyle = col('--surface2'); rr(g, 40, yb+20, W-80, 22, 11); g.fill();
  g.fillStyle = st.verde ? col('--ok') : col('--off');
  rr(g, 40, yb+20, (W-80)*Math.min(1,st.ok/7), 22, 11); g.fill();
  g.fillStyle = col('--muted'); g.font = '20px system-ui,sans-serif';
  g.fillText('Objetivo: 5 de 7. Verde y mínimo cuentan igual.', 40, yb+70);

  c.toBlob(async blob => {
    const nombre = 'semana-'+SEM+'.png';
    const file = new File([blob], nombre, { type:'image/png' });
    try{
      if(navigator.canShare && navigator.canShare({ files:[file] })){
        await navigator.share({ files:[file], title:'Semana del '+fmtShort(SEM) });
        return;
      }
    }catch(e){ /* cancelado o no disponible: descargamos */ }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = nombre; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 4000);
    toast('Imagen descargada.');
  }, 'image/png');
}
function rr(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }

/* ---------- 16. Exportar / importar ---------- */
function descargar(nombre, texto, tipo){
  const blob = new Blob([texto], { type: tipo+';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = nombre; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
  toast('Archivo descargado.');
}
function csv(){
  const cols = ['fecha'].concat(FACTORES.map(f=>f.key), ['dolor','energia','analgesico','nota','cumplido']);
  const q = v => '"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  const filas = Object.keys(S.days).sort().map(d => {
    const day = S.days[d];
    const vals = [d].concat(
      FACTORES.map(f => aplica(d,f.key) ? (day.factors[f.key]==null?0:day.factors[f.key]) : ''),
      [day.pain, day.energy, day.painkiller?1:0, day.note||'', cumplido(d)?1:0]
    );
    return vals.map(q).join(',');
  });
  return [cols.map(q).join(',')].concat(filas).join('\r\n');
}
function importar(file){
  if(!file) return;
  const fr = new FileReader();
  fr.onload = () => {
    try{
      const o = JSON.parse(fr.result);
      if(!o || typeof o !== 'object' || !o.days) throw new Error('formato');
      if(!confirm('Vas a sustituir los datos actuales por los del archivo. ¿Sigo?')) return;
      localStorage.setItem(KEY, JSON.stringify(o));
      S = cargar(); render(); toast('Datos importados.');
    }catch(e){ toast('Ese archivo no tiene el formato esperado.'); }
  };
  fr.readAsText(file);
}

/* ---------- 17. Recordatorio local ---------- */
let timerAviso = null;
function pedirPermiso(){
  if(!('Notification' in window)) return;
  Notification.requestPermission().then(() => { render(); programarAviso(); });
}
function programarAviso(){
  if(timerAviso) clearTimeout(timerAviso);
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  const ahora = new Date();
  const obj = new Date(ahora); obj.setHours(S.settings.reminderHour, 0, 0, 0);
  if(obj <= ahora) obj.setDate(obj.getDate()+1);
  const ms = obj - ahora;
  if(ms > 2147483647) return;
  timerAviso = setTimeout(() => {
    const h = hoy();
    if(!registrado(h) && S.flags['aviso:'+h] !== true){
      S.flags['aviso:'+h] = true; guardar();
      try{
        if(navigator.serviceWorker && navigator.serviceWorker.ready){
          navigator.serviceWorker.ready.then(reg => reg.showNotification('Plan agosto', {
            body: 'Falta registrar el día. Son 20 segundos.',
            icon: 'icon-192.png', badge: 'icon-192.png', tag: 'diario', silent: false
          })).catch(()=>{});
        } else { new Notification('Plan agosto', { body:'Falta registrar el día. Son 20 segundos.' }); }
      }catch(e){ /* degradación silenciosa */ }
    }
    programarAviso();
  }, ms);
}

/* ---------- 18. Sheet, toast, utilidades ---------- */
const sh = document.getElementById('sheet');
function sheet(titulo, html){
  document.getElementById('sheet-title').textContent = titulo;
  document.getElementById('sheet-body').innerHTML = html;
  sh.hidden = false;
}
sh.addEventListener('click', e => { if(e.target.closest('[data-close]')) sh.hidden = true; });

let toastT = null;
function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(()=>{ el.hidden = true; }, 2600);
}
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* ---------- 19. Arranque ---------- */
document.addEventListener('visibilitychange', () => {
  if(!document.hidden){
    if(FECHA !== hoy() && !editable(FECHA)) FECHA = hoy();
    render(); revisarAvisos();
  }
});
if('serviceWorker' in navigator){
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
render();
revisarAvisos();
programarAviso();
