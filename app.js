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
  version: 2,
  settings: { reminderHour: 22, painBaseline: 6, walkMinTarget: 20 },
  weekPlans: {},
  days: {},
  loads: {},
  sessions: {},      // marcas de ejercicios y bloques hechos, por fecha
  material: {},      // inventario: qué tienes de verdad
  ubic: {},          // dónde estás cada día: madrid | pueblo | fuera
  flags: {},         // avisos ya mostrados, última exportación
  cervicalLevel: 1
});

let S = cargar();

function cargar(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return semilla(VACIO());
    const o = JSON.parse(raw);
    return semilla(migrar(o));
  }catch(e){ console.warn('Datos ilegibles, empiezo de cero', e); return semilla(VACIO()); }
}

/* Migración: NUNCA se descartan datos. Se rellena lo que falta y se
   deja intacto todo lo que ya estaba, aunque sea de una versión vieja. */
function migrar(o){
  const base = VACIO();
  const s = Object.assign(base, o);
  s.settings = Object.assign(base.settings, o.settings || {});
  ['weekPlans','days','loads','sessions','material','ubic','flags'].forEach(k => {
    if(!s[k] || typeof s[k] !== 'object') s[k] = {};
  });
  if(typeof s.cervicalLevel !== 'number') s.cervicalLevel = 1;
  /* v1 → v2: los días existentes se dan por tocados (ya tenían datos) */
  if(!o.version || o.version < 2){
    Object.keys(s.days).forEach(d => {
      const dd = s.days[d];
      if(dd && dd.touched == null){
        dd.touched = (dd.pain != null) || Object.keys(dd.factors||{}).length > 0;
      }
    });
  }
  s.version = 2;
  return s;
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
    S.days[date] = { factors:{}, pain:null, energy:null, painkiller:false, note:'',
                     touched:true, createdAt:new Date().toISOString(), lockedAt:null };
  }
  const d = S.days[date] || null;
  if(d && crear) d.touched = true;   // un día con todo a cero es un día registrado
  return d;
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
const SUELO = ['caminata','movilidad','cervicales'];

function haySuelo(date){
  const d = S.days[date];
  if(!d) return false;
  return SUELO.every(k => (d.factors[k]||0) >= 1);
}
function cumplido(date){
  const d = S.days[date];
  if(!d) return false;
  /* Regla del suelo mínimo: los tres hábitos núcleo hechos = día cumplido,
     aunque no se lleguen a 5 factores. */
  if(haySuelo(date)) return true;
  let n = 0;
  aplicables(date).forEach(f => { if((d.factors[f.key]||0) >= 1) n++; });
  return n >= 5;
}
/* Cuánto falta, por la vía más corta que quede */
function loQueFalta(date){
  if(cumplido(date)) return haySuelo(date) ? 'día cumplido (suelo mínimo)' : 'día cumplido';
  const d = S.days[date] || { factors:{} };
  const faltanSuelo = SUELO.filter(k => (d.factors[k]||0) < 1).length;
  const n = aplicables(date).filter(f => (d.factors[f.key]||0) >= 1).length;
  const faltanCinco = Math.max(0, 5 - n);
  if(faltanSuelo <= faltanCinco)
    return 'faltan ' + faltanSuelo + (faltanSuelo===1?' del suelo mínimo':' del suelo mínimo') + ' para cumplir';
  return 'faltan ' + faltanCinco + ' para cumplir';
}
function registrado(date){
  const d = S.days[date];
  if(!d) return false;
  if(d.touched) return true;
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

/* ---------- 4a. Actualización de la app ---------- */
let SWREG = null, HAY_ACTUALIZACION = false, BUSCANDO = false, RECARGAR = false;

if('serviceWorker' in navigator){
  window.addEventListener('load', async () => {
    try{
      SWREG = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
      if(SWREG.waiting && navigator.serviceWorker.controller){ HAY_ACTUALIZACION = true; render(); }
      SWREG.addEventListener('updatefound', () => {
        const nuevo = SWREG.installing;
        if(!nuevo) return;
        nuevo.addEventListener('statechange', () => {
          if(nuevo.state === 'installed' && navigator.serviceWorker.controller){
            HAY_ACTUALIZACION = true; render();
          }
        });
      });
    }catch(e){}
  });
  /* Solo recarga si la actualización la has pedido tú. En la primera
     instalación el sw también toma el control, y ahí una recarga sobra. */
  navigator.serviceWorker.addEventListener('controllerchange', () => { if(RECARGAR) location.reload(); });
}

function aplicarActualizacion(){
  if(SWREG && SWREG.waiting){
    RECARGAR = true;
    SWREG.waiting.postMessage('SKIP_WAITING');   // controllerchange recarga solo
    toast('Actualizando…');
  } else { location.reload(); }
}
async function buscarActualizacion(manual){
  if(!SWREG){ if(manual) toast('Este navegador no permite actualizar así.'); return; }
  if(!navigator.onLine){ if(manual) sheet('Sin conexión', '<p>Sin conexión. Inténtalo cuando tengas datos.</p>'); return; }
  BUSCANDO = true; if(manual) render();
  try{
    await SWREG.update();
    S.flags.ultimaBusqueda = Date.now(); guardar();
    /* la instalación es asíncrona: damos margen a updatefound */
    setTimeout(() => {
      BUSCANDO = false;
      if(manual){
        render();
        if(!HAY_ACTUALIZACION) sheet('Actualizaciones', '<p>Ya tienes la última versión.</p><p class="muted small">Versión '+VERSION+' · '+VERSION_FECHA+'</p>');
      }
    }, 1800);
  }catch(e){
    BUSCANDO = false;
    if(manual){ render(); sheet('Sin conexión', '<p>Sin conexión. Inténtalo cuando tengas datos.</p>'); }
  }
}
/* Novedades de la versión: una vez y ya está */
function verNovedades(){
  const c = CHANGELOG.find(x => x.v === VERSION);
  if(!c) return false;
  if(S.flags['changelog:'+VERSION]) return false;
  S.flags['changelog:'+VERSION] = true; guardar();
  sheet('Novedades · '+c.v, `<p class="muted small">${fmtLong(c.fecha)}</p>
    <ul>${c.cambios.map(x=>`<li style="margin:8px 0">${x}</li>`).join('')}</ul>
    <p class="tiny faint">Tus datos siguen intactos: una actualización nunca los toca.</p>`);
  return true;
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
  const f = { hoy:vHoy, semana:vSemana, plan:vPlan, tendencias:vTendencias, protocolos:vProtocolos, ajustes:vAjustes, planificar:vPlanificar }[VIEW] || vHoy;
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

/* ---------- 5b. Cuota semanal, ubicación y movimiento de sesiones ---------- */
const CUOTA_FUERZA = 3, CUOTA_LARGA = 2;

function cuota(mon){
  const dias = rango(mon, addD(mon,6));
  const fh = dias.filter(d => planDia(d).fuerza && estado(d,'fuerza') >= 1).length;
  const lh = dias.filter(d => planDia(d).piscina === 'larga' && estado(d,'piscina') >= 1).length;
  return { fh, ft: CUOTA_FUERZA, lh, lt: CUOTA_LARGA };
}
function chipsCuota(fecha){
  const c = cuota(mondayOf(fecha));
  return `<div class="row" style="gap:6px;margin-bottom:8px">
    <span class="pill ${c.fh>=c.ft?'ok':''}">Fuerza: ${c.fh} de ${c.ft} esta semana</span>
    <span class="pill ${c.lh>=c.lt?'ok':''}">Piscina larga: ${c.lh} de ${c.lt}</span>
  </div>`;
}
function ubicacion(fecha){ return S.ubic[fecha] || null; }
function asegurarSemana(mon){
  if(!S.weekPlans[mon]) S.weekPlans[mon] = semanaDesdePlantilla(mon);
  rango(mon, addD(mon,6)).forEach(d => { if(!S.weekPlans[mon][d]) S.weekPlans[mon][d] = { fuerza:null, piscina:null }; });
  return S.weekPlans[mon];
}
/* Bloqueo duro: el pasado no se reescribe */
function movible(fecha){ return fecha >= hoy(); }
function moverSesion(campo, desde, hasta){
  if(desde < hoy() || hasta < hoy()){ toast('Solo se mueven sesiones de hoy en adelante.'); return false; }
  const wa = asegurarSemana(mondayOf(desde)), wb = asegurarSemana(mondayOf(hasta));
  const tmp = wb[hasta][campo];
  wb[hasta][campo] = wa[desde][campo];
  wa[desde][campo] = tmp;            // si el destino estaba libre, esto es un movimiento simple
  guardar();
  return true;
}
/* Qué sesión de fuerza lleva más tiempo sin hacerse. A igualdad, la que
   no esté ya puesta en otro día de esta semana. */
function fuerzaMasOlvidada(candidatas, fecha){
  const ult = {};
  candidatas.forEach(id => { ult[id] = ''; });
  Object.keys(S.days).sort().forEach(d => {
    const f = planDia(d).fuerza;
    if(f && candidatas.indexOf(f) >= 0 && estado(d,'fuerza') >= 1) ult[f] = d;
  });
  const mon = mondayOf(fecha || hoy());
  const yaPuesta = {};
  rango(mon, addD(mon,6)).forEach(d => { if(d !== fecha) yaPuesta[planDia(d).fuerza] = true; });
  return candidatas.slice().sort((a,b) => {
    if(ult[a] !== ult[b]) return ult[a] < ult[b] ? -1 : 1;      // la menos reciente primero
    return (yaPuesta[a] ? 1 : 0) - (yaPuesta[b] ? 1 : 0);        // y la que no esté ya esta semana
  })[0];
}

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
  if(!m.hayDatos || (m.peor === 0 && m.desdeDoble === 0)){
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
  if(p.fuerza) partes.push(p.fuerza==='R' ? 'Sesión reducida' : 'Fuerza '+p.fuerza);
  if(p.piscina) partes.push('piscina '+p.piscina);
  const quetoca = partes.length ? partes.join(' + ') : 'Caminata, cervicales y movilidad';

  const cu = cuota(mondayOf(FECHA));
  const hito = PLAN.hitos[FECHA] ? `<div class="hito"><b>${PLAN.hitos[FECHA]}</b></div>` : '';
  const revision = FECHA === REVISION.fecha
    ? `<button class="btn primary" data-accion="revision" style="margin-bottom:10px">Abrir la revisión de hoy</button>` : '';

  /* dolor */
  const prev = ultimoDolorAntes(FECHA);
  const valor = (d && d.pain != null) ? d.pain : (prev != null ? prev : S.settings.painBaseline);
  const sinDolor = !(d && d.pain != null);

  /* factores */
  const cells = FACTORES.map(f => {
    const na = !aplica(FECHA, f.key);
    const s = estado(FECHA, f.key);
    const glyph = s === 2 ? '✓' : s === 1 ? '◐' : '';
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
  ${bannerActualizar()}
  ${record}
  ${hito}
  ${revision}
  ${avisoExp}
  ${bannerInstalar()}
  <div class="dayhead">
    <div style="min-width:0">
      <div class="d1">${fmtLong(FECHA)}${FECHA!==h?' <span class="pill">ayer</span>':''}</div>
      <div class="d2">${quetoca} <span class="faint">· Fuerza: ${cu.fh} de ${cu.ft} esta semana</span></div>
    </div>
    <div class="row" style="gap:6px;flex:none">
      <button class="chip" data-accion="ubicSheet">${ubicacion(FECHA) ? cap(ubicacion(FECHA)) : '¿Dónde?'}</button>
      <button class="chip" data-go="ajustes" aria-label="Ajustes">⚙</button>
    </div>
  </div>

  ${propuestaUbicacion(FECHA)}

  ${puedeAyer ? `<button class="chip ${FECHA===ayer?'on':''}" data-fecha="${FECHA===ayer?h:ayer}" style="margin-bottom:8px">${FECHA===ayer?'Volver a hoy':'Editar ayer'}</button>` : ''}

  ${!ed ? `<div class="card small muted">Este día está cerrado. Puedes verlo, pero ya no se edita. No pasa nada: lo registrado, registrado está.</div>` : ''}

  <div class="card painwrap">
    <div class="spread">
      <div><span class="painval${sinDolor?' sugerido':''}">${valor}</span><span class="muted"> /10 dolor${sinDolor?' <span class="tiny">sugerido: ayer</span>':''}</span></div>
      ${ed ? (sinDolor
        ? `<button class="chip prim" data-accion="confirmarDolor" style="flex:none">Confirmar ${valor}</button>`
        : `<span class="pill ok">registrado</span>`) : ''}
    </div>
    <input type="range" min="0" max="10" step="1" value="${valor}" id="pain" ${ed?'':'disabled'}>
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

  <div class="tiny muted" style="margin:0 2px 4px;line-height:1.2">${nCumple} de ${aplicables(FECHA).length} factores · ${loQueFalta(FECHA)}</div>

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

function bannerActualizar(){
  if(!HAY_ACTUALIZACION) return '';
  return `<div class="hito spread" style="align-items:center">
    <span>Hay una versión nueva de la app</span>
    <button class="btn sm primary" data-accion="actualizar" style="flex:none">Actualizar</button>
  </div>`;
}

/* El conmutador vive en una hoja para no robarle altura al registro diario */
function hojaUbicacion(){
  const fecha = editable(FECHA) ? FECHA : hoy();
  const u = ubicacion(fecha);
  const bot = (v,l,d) => `<button class="btn ${u===v?'primary':''}" data-ubic="${v}" style="margin-bottom:8px;justify-content:flex-start">
    <b>${l}</b><span class="tiny muted" style="margin-left:8px">${d}</span></button>`;
  sheet('Hoy estoy en', bot('madrid','Madrid','mancuernas, kettlebell y banco')
    + bot('pueblo','Pueblo','bandas, garrafas y piscina')
    + bot('fuera','Fuera','sin material: sesión reducida y sin piscina')
    + '<p class="tiny faint">Marcarlo no cambia nada por sí solo: la app te propone el ajuste y tú decides con un botón.</p>');
}

/* Propuestas que hacen el cambio, no que solo informan */
function propuestaUbicacion(fecha){
  if(!editable(fecha)) return '';
  const u = ubicacion(fecha);
  const p = planDia(fecha);

  let propuesta = '';
  if(u === 'madrid' && p.fuerza !== 'M'){
    const dias = rango(fecha, addD(mondayOf(fecha),6)).filter(d => d > fecha && planDia(d).fuerza === 'M');
    if(dias.length) propuesta = `<div class="hito small spread" style="align-items:center">
      <span>La M está el ${DIAS[dow(dias[0])]} y hoy estás en Madrid.</span>
      <button class="btn sm" data-accion="traerM" data-d="${dias[0]}" style="flex:none">Traerla a hoy</button></div>`;
  }
  if(u === 'pueblo' && p.fuerza === 'M'){
    const dias = rango(addD(fecha,1), addD(mondayOf(fecha),6)).filter(d => ubicacion(d) === 'madrid');
    propuesta = dias.length
      ? `<div class="hito small spread" style="align-items:center">
          <span>Hoy toca la M y estás en el pueblo. El ${DIAS[dow(dias[0])]} estás en Madrid.</span>
          <button class="btn sm" data-accion="moverM" data-d="${dias[0]}" style="flex:none">Intercambiar</button></div>`
      : `<div class="hito small spread" style="align-items:center">
          <span>Hoy toca la M y estás en el pueblo, sin mancuernas.</span>
          <button class="btn sm" data-accion="nopuedo" style="flex:none">Ver salidas</button></div>`;
  }
  if(u === 'fuera' && (p.fuerza && p.fuerza !== 'R' || p.piscina)){
    propuesta = `<div class="hito small spread" style="align-items:center">
      <span>Estás fuera: sesión reducida sin material y la piscina sale del día.</span>
      <button class="btn sm" data-accion="modoFuera" style="flex:none">Ajustar el día</button></div>`;
  }

  return propuesta;
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
  const bq = t.closest('[data-blq]');           if(bq){ toggleBloque(bq.dataset.blq); return; }
  const ab = t.closest('[data-abrir]');         if(ab){ toggleAbrir('planAbierto', ab.dataset.abrir); return; }
  const ae = t.closest('[data-abrirex]');       if(ae){ toggleAbrirEx(ae.dataset.abrirex); return; }
  const vd = t.closest('[data-video]');         if(vd){ buscarVideo(vd.dataset.video); return; }
  const ub = t.closest('[data-ubic]');          if(ub){ setUbicacion(ub.dataset.ubic); return; }
  const mv = t.closest('[data-mover]');         if(mv){ hacerMovimiento(mv.dataset.mover); return; }
  const mt = t.closest('[data-mat]');           if(mt){ toggleMaterial(mt.dataset.mat); return; }
  const ud = t.closest('[data-ubicdia]');       if(ud){ const [f,v] = ud.dataset.ubicdia.split('|');
                                                       S.ubic[f] = (S.ubic[f]===v)?null:v; guardar(); render(); return; }
  const dp = t.closest('[data-desplazar]');     if(dp){ desplazar(dp.dataset.desplazar); return; }
  const sm = t.closest('[data-semana]');        if(sm){ SEM = sm.dataset.semana; render(); return; }
  const ac = t.closest('[data-accion]');        if(ac){ acciones[ac.dataset.accion](ac); return; }
});
/* La hoja modal también necesita responder a los botones que dibuja */
document.getElementById('sheet').addEventListener('click', e => {
  const mv = e.target.closest('[data-mover]');  if(mv){ hacerMovimiento(mv.dataset.mover); return; }
  const ub = e.target.closest('[data-ubic]');   if(ub){ setUbicacion(ub.dataset.ubic);
                                                       document.getElementById('sheet').hidden = true; return; }
  const ac = e.target.closest('[data-accion]'); if(ac && acciones[ac.dataset.accion]){ acciones[ac.dataset.accion](ac); return; }
});
function guardarDolor(v){
  if(!editable(FECHA)) return;
  const d = dia(FECHA,true); d.pain = v; guardar();
}
app.addEventListener('input', e => {
  if(e.target.id === 'pain'){
    const v = Number(e.target.value);
    guardarDolor(v);
    const pv = app.querySelector('.painval');
    if(pv){ pv.textContent = v; pv.classList.remove('sugerido'); }
    const pill = app.querySelector('.painwrap .pill'); if(pill) pill.remove();
    const bc = app.querySelector('[data-accion="confirmarDolor"]'); if(bc) bc.textContent = 'Confirmar dolor '+v;
  }
});
/* Un dolor igual al de ayer no dispara 'input': hay que cazarlo al soltar */
['pointerup','touchend','keyup'].forEach(ev => {
  app.addEventListener(ev, e => {
    if(e.target && e.target.id === 'pain'){ guardarDolor(Number(e.target.value)); render(); }
  });
});
app.addEventListener('change', e => {
  /* al soltar el slider, no en cada píxel del arrastre */
  if(e.target.id === 'pain'){ revisarAvisos(); }
  if(e.target.id === 'nota'){ setCampo('note', e.target.value.slice(0,200), true); }
  if(e.target.dataset && e.target.dataset.plan){ guardarPlanCelda(e.target); }
  if(e.target.dataset && e.target.dataset.load){ guardarCarga(e.target); }
  if(e.target.dataset && e.target.dataset.matnota){ S.material[e.target.dataset.matnota+'_nota'] = e.target.value.slice(0,80); guardar(); }
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

/* ---------- 9. Pantalla PLAN: el día entero ---------- */
function tieneMaterial(k){
  if(MATERIAL_POR_DEFECTO.indexOf(k) >= 0) return S.material[k] !== false;
  return !!S.material[k];
}
function faltaMaterial(lista){ return (lista||[]).filter(k => !tieneMaterial(k)); }
function nombresMaterial(ks){ return ks.map(k => MATERIAL_NOMBRES[k] || k).join(', '); }
/* Las alternativas se escriben como "Sin banda: haz X". Dentro del recuadro
   de "te falta" ya lo decimos nosotros, así que quitamos el prefijo. */
function soloAlternativa(t){ return String(t||'').replace(/^Sin [^:]{1,40}:\s*/i, ''); }

function marcado(fecha, id){ return !!(S.sessions[fecha] && S.sessions[fecha][id]); }

function vPlan(){
  const fecha = editable(FECHA) ? FECHA : hoy();
  const p = planDia(fecha);
  const abierto = S.flags.planAbierto || {};

  let out = `<div class="dayhead"><div style="min-width:0">
      <div class="d1">${fmtLong(fecha)}</div>
      <div class="d2">El día entero, en orden</div></div>
    <button class="chip" data-go="hoy">Volver</button></div>
    ${chipsCuota(fecha)}
    <p class="tiny faint" style="margin:0 2px 10px">Las horas son sugerencias, no obligaciones. Lo que importa es que ocurran.</p>`;

  BLOQUES_DIA.forEach(b => {
    if(b.tipo === 'fuerza' && !p.fuerza) return;
    if(b.tipo === 'piscina' && !p.piscina) return;
    out += bloquePlan(b, fecha, p, !!abierto[b.id]);
  });

  out += `<div class="card tiny muted" style="margin-bottom:24px">
    Un día sin fuerza ni piscina no es un día vacío: siguen quedando cinco bloques y el día cuenta igual.
  </div>`;
  return out;
}

function bloquePlan(b, fecha, p, open){
  const hecho = marcado(fecha, b.id);
  let cuerpo = '', sub = '';

  if(b.tipo === 'cervical'){
    const n = CERVICAL.niveles.find(x => x.nivel === S.cervicalLevel) || CERVICAL.niveles[0];
    sub = `Nivel ${n.nivel} · ${n.aguante} × ${n.reps}`;
    cuerpo = detalleCervical(fecha);
  }
  if(b.tipo === 'caminata'){ const c = infoCaminata(fecha); sub = c.sub; cuerpo = c.html; }
  if(b.tipo === 'fuerza'){
    const s = SESIONES[p.fuerza];
    sub = s ? s.nombre : '';
    cuerpo = detalleFuerza(p.fuerza, fecha);
  }
  if(b.tipo === 'movilidad'){
    const m = MOVILIDAD.menus[b.menu];
    sub = m.nombre;
    cuerpo = `<ul class="small" style="padding-left:18px;margin:6px 0 0">${m.items.map(i=>`<li style="margin:6px 0">${i}</li>`).join('')}</ul>
      ${b.id==='BL-mov3' ? '<button class="btn sm ghost" data-go="hoy" style="margin-top:10px">Ir a registrar el día</button>' : ''}`;
  }
  if(b.tipo === 'piscina'){
    sub = 'Piscina ' + p.piscina;
    cuerpo = detallePiscina(p.piscina, fecha, !!p.fuerza);
  }

  return `<div class="blq${hecho?' done':''}">
    <div class="blqhead">
      <button class="check" data-blq="${b.id}" aria-label="Marcar ${b.titulo}">✓</button>
      <button class="blqtxt" data-abrir="${b.id}">
        <span class="hora">${b.hora}${b.dur?' · '+b.dur:''}</span>
        <span class="tit">${b.titulo}</span>
        <span class="sub">${sub}</span>
      </button>
      <button class="blqarrow" data-abrir="${b.id}" aria-label="Desplegar">${open?'▴':'▾'}</button>
    </div>
    ${open ? `<div class="blqbody">${cuerpo}</div>` : ''}
  </div>`;
}

function detalleCervical(fecha){
  const n = CERVICAL.niveles.find(x => x.nivel === S.cervicalLevel) || CERVICAL.niveles[0];
  const iso = fecha >= CERVICAL.isometrico.desde;
  return `<p class="small muted" style="margin:0 0 8px">${CERVICAL.cuando}</p>
    <div class="kv"><span>Aguante</span><b>${n.aguante}</b></div>
    <div class="kv"><span>Repeticiones</span><b>${n.reps}</b></div>
    <div class="kv"><span>Descanso</span><b>5-10 s</b></div>
    <ul class="small" style="padding-left:18px">${CERVICAL.como.map(x=>`<li style="margin:6px 0">${x}</li>`).join('')}</ul>
    ${iso ? `<div class="aviso"><b>Desde el 24 de agosto:</b> ${CERVICAL.isometrico.texto}</div>` : ''}
    <p class="tiny muted">${CERVICAL.subir}</p>
    <div class="row" style="gap:8px">
      <button class="btn sm" data-accion="nivelCervical" data-v="${Math.min(2,S.cervicalLevel+1)}" style="flex:1">Subir a nivel ${Math.min(2,S.cervicalLevel+1)}</button>
      <button class="btn sm ghost" data-accion="nivelCervical" data-v="${Math.max(1,S.cervicalLevel-1)}" style="flex:1">Bajar</button>
    </div>`;
}

function minutosCaminata(fecha){
  return CAMINATA.progresion[mondayOf(fecha)] || CAMINATA.minimo;
}
function infoCaminata(fecha){
  const min = minutosCaminata(fecha);
  return {
    sub: min + ' min · mínimo ' + CAMINATA.minimo + ' · suelo ' + CAMINATA.suelo,
    html: `<div class="grande">${min}<span> min esta semana</span></div>
      <div class="row" style="gap:8px;margin:8px 0">
        ${CAMINATA.ventanas.map(v=>`<span class="chip" style="flex:1;justify-content:center">${v}</span>`).join('')}
      </div>
      <details><summary>Por qué, el calor y cómo</summary>
        <p class="small"><b>Por qué.</b> ${CAMINATA.porque}</p>
        <p class="small"><b>El calor.</b> ${CAMINATA.calor}</p>
        <ul class="small" style="padding-left:18px">${CAMINATA.como.map(x=>`<li style="margin:6px 0">${x}</li>`).join('')}</ul>
      </details>`
  };
}

function formatoSesion(fecha){
  return FORMATO_SEMANA[mondayOf(fecha)] || FORMATO_POR_DEFECTO;
}
/* ¿Es la primera vez que ve este ejercicio? Sin cargas y sin marcas previas. */
function primeraVez(exId, fecha){
  if((S.loads[exId]||[]).some(x => x.date !== fecha)) return false;
  return !Object.keys(S.sessions).some(d => d !== fecha && S.sessions[d] && S.sessions[d][exId]);
}
function fichaEjercicio(e, fecha){
  const done = marcado(fecha, e.id);
  const last = ultimaCarga(e.id, fecha);
  const cur = cargaDe(e.id, fecha);
  const falta = faltaMaterial(e.material);
  const nueva = primeraVez(e.id, fecha);
  const abierto = (S.flags.exAbierto && S.flags.exAbierto[e.id]) || (nueva && !done) || falta.length > 0;
  const ph = e.unidad === 'banda' ? 'Banda y posición (p. ej. verde, pos. 2)'
           : e.unidad === 'peso corporal' ? 'Apoyo o ángulo usado'
           : 'Carga (p. ej. 2×10 kg)';

  return `<div class="ex${done?' done':''}${falta.length?' sinmat':''}">
    <div class="exhead">
      <button class="check" data-ex="${e.id}" aria-label="Marcar ${e.nombre}">✓</button>
      <button class="exname" data-abrirex="${e.id}">
        ${e.nombre}
        ${nueva?'<span class="tag">primera vez</span>':''}
        ${falta.length?`<span class="tag falta">te falta: ${nombresMaterial(falta)}</span>`:''}
        <span class="exser">${e.series}</span>
        <span class="exque">${e.que}</span>
      </button>
      <button class="blqarrow" data-abrirex="${e.id}" aria-label="Desplegar">${abierto?'▴':'▾'}</button>
    </div>
    ${abierto ? `<div class="body">
      ${falta.length ? `<div class="aviso"><b>Hoy no tienes ${nombresMaterial(falta)}.</b> Haz esto en su lugar: ${soloAlternativa(e.alternativa)}</div>` : ''}
      <p class="small muted" style="margin:0 0 8px"><b>Montaje.</b> ${e.montaje}</p>
      <ol class="pasos">${e.pasos.map(x=>`<li>${x}</li>`).join('')}</ol>
      <p class="small"><b>Respiración.</b> ${e.respiracion}</p>
      <div class="aviso"><b>En qué te vas a equivocar</b>
        <ul style="margin:6px 0 0;padding-left:18px">${e.errores.map(x=>`<li style="margin:5px 0">${x}</li>`).join('')}</ul>
      </div>
      <p class="small senal"><b>Señal de que va bien.</b> ${e.senal}</p>
      <details><summary>Si duele, y alternativa sin material</summary>
        <p class="small"><b>Si duele.</b> ${e.siduele}</p>
        <p class="small"><b>Alternativa.</b> ${e.alternativa}</p>
      </details>
      <div class="loadrow" style="margin-top:10px">
        <input data-load="${e.id}|value" placeholder="${ph}" value="${esc(cur.value)}">
        <input data-load="${e.id}|reps" placeholder="Reps" value="${esc(cur.reps)}" style="max-width:34%">
      </div>
      <div class="lastload">${last ? 'Última vez: '+fmtShort(last.date)+' — '+esc(last.value||'—')+(last.reps?' · '+esc(last.reps):'') : 'Primera vez que registras este ejercicio.'}</div>
      <button class="btn sm ghost" data-video="${esc(e.nombre)}" style="margin-top:8px">Buscar vídeo</button>
    </div>` : ''}
  </div>`;
}

function detalleFuerza(id, fecha){
  const s = SESIONES[id];
  if(!s) return '<p class="muted">Sesión no encontrada.</p>';
  const ejs = s.ejercicios.map(e => fichaEjercicio(e, fecha)).join('');
  const todos = s.ejercicios.every(e => marcado(fecha, e.id));

  const cabBanda = s.banda ? `<div class="aviso"><b>Progresión con bandas.</b> ${PROGRESION_BANDA.montaje}
      <ol style="margin:6px 0 0;padding-left:18px">${PROGRESION_BANDA.escalones.map(x=>`<li style="margin:5px 0">${x}</li>`).join('')}</ol>
      <p class="tiny" style="margin:6px 0 0">${PROGRESION_BANDA.escapulares}</p></div>` : '';
  const cabGarrafas = s.garrafas ? `<div class="aviso"><b>${GARRAFAS.titulo}.</b> ${GARRAFAS.texto}
      <p style="margin:6px 0 0"><b>Regla:</b> ${GARRAFAS.regla}</p></div>` : '';

  return `<p class="small muted" style="margin:0 0 8px">${formatoSesion(fecha)}</p>
    <div class="row" style="gap:8px;margin-bottom:10px">
      <button class="btn sm ghost" data-accion="moverFuerza" style="flex:1">Mover a otro día</button>
      <button class="btn sm ghost" data-accion="nopuedo" style="flex:1">Hoy no puedo con esto</button>
    </div>
    ${cabBanda}${cabGarrafas}
    ${ejs}
    <button class="btn ${todos && estado(fecha,'fuerza')<1?'primary':''}" data-accion="marcarFuerza" style="margin-bottom:6px">
      ${estado(fecha,'fuerza')>=1 ? 'Fuerza ya marcada como hecha' : 'Marcar Fuerza como completa'}</button>`;
}

function detallePiscina(tipo, fecha, hayFuerza){
  const nado = NADO_ATADO[mondayOf(fecha)] || NADO_ATADO['2026-08-10'];
  const hayTubo = tieneMaterial('tubo');

  const bloque = (b, detalle) => {
    const falta = faltaMaterial(b.material);
    return `<div class="ex${marcado(fecha,b.id)?' done':''}${falta.length?' sinmat':''}">
      <div class="exhead"><button class="check" data-ex="${b.id}" aria-label="Marcar ${b.nombre}">✓</button>
      <div class="exname">${b.nombre}
        ${falta.length?`<span class="tag falta">te falta: ${nombresMaterial(falta)}</span>`:''}
        <span class="exser">${detalle}</span></div></div>
      ${falta.length?`<div class="body"><div class="aviso"><b>Sin ${nombresMaterial(falta)}:</b> ${soloAlternativa(b.alternativa)}</div></div>`:''}
    </div>`;
  };

  const B = PISCINA_BLOQUES;
  let cuerpo;
  if(tipo === 'larga'){
    const detalleNado = hayTubo
      ? `${nado.series} · descanso ${nado.descanso} · ${nado.reparto}`
      : `${nado.espalda} · descanso ${nado.descanso} · solo espalda`;
    cuerpo = bloque(B.marcha, B.marcha.detalle)
      + bloque(B.nado, detalleNado)
      + bloque(B.escapular, B.escapular.detalle)
      + bloque(B.descompresion, B.descompresion.detalle);
  } else {
    cuerpo = bloque(B.suave, B.suave.detalle)
      + bloque(B.escapular, B.escapular.detalle)
      + bloque(B.descompresion, B.descompresion.detalle);
  }

  return `<p class="small muted" style="margin:0 0 8px">${tipo==='larga'?'30-40 min.':'15-20 min. No es entrenamiento, es recuperación.'}</p>
    ${hayFuerza ? `<div class="aviso"><b>${REGLA_SOLAPE}</b></div>` : ''}
    ${!hayTubo ? `<div class="aviso"><b>Regla del tubo.</b> ${REGLA_TUBO}</div>` : ''}
    ${tipo==='larga' ? `<div class="row" style="gap:8px;margin-bottom:10px">
        <button class="btn sm ghost" data-accion="moverPiscina" style="flex:1">Mover a otro día</button></div>` : ''}
    <div class="aviso"><b>Avisos de técnica</b>
      <ul style="margin:6px 0 0;padding-left:18px">${PISCINA_AVISOS.map(a=>`<li style="margin:5px 0">${a}</li>`).join('')}</ul>
    </div>
    ${cuerpo}
    <button class="btn ${estado(fecha,'piscina')>=1?'':'primary'}" data-accion="marcarPiscina" style="margin-bottom:6px">
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
function toggleAbrir(bolsa, id){
  S.flags[bolsa] = S.flags[bolsa] || {};
  S.flags[bolsa][id] = !S.flags[bolsa][id];
  guardar(); render();
}
/* Los ejercicios tienen apertura por defecto (primera vez, o falta material),
   así que el toggle guarda true/false explícito. */
function toggleAbrirEx(id){
  const fecha = editable(FECHA) ? FECHA : hoy();
  S.flags.exAbierto = S.flags.exAbierto || {};
  const e = ejercicioPorId(id);
  const pordefecto = e ? (primeraVez(id,fecha) && !marcado(fecha,id)) || faltaMaterial(e.material).length>0 : false;
  const actual = S.flags.exAbierto[id] == null ? pordefecto : S.flags.exAbierto[id];
  S.flags.exAbierto[id] = !actual;
  guardar(); render();
}
function ejercicioPorId(id){
  let out = null;
  Object.keys(SESIONES).forEach(k => {
    const e = SESIONES[k].ejercicios.find(x => x.id === id);
    if(e) out = e;
  });
  return out;
}
function buscarVideo(nombre){
  const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(nombre);
  window.open(url, '_blank', 'noopener');
}

/* Marcar un bloque del día marca también su factor. Solo por acción
   explícita sobre ese bloque: nunca pisa lo que hayas puesto a mano. */
function toggleBloque(id){
  const fecha = editable(FECHA) ? FECHA : hoy();
  if(!editable(fecha)) return toast('Ese día ya está cerrado.');
  S.sessions[fecha] = S.sessions[fecha] || {};
  const nuevo = !S.sessions[fecha][id];
  S.sessions[fecha][id] = nuevo;
  const d = dia(fecha, true);
  const mapa = { 'BL-cervical':'cervicales', 'BL-caminata':'caminata', 'BL-fuerza':'fuerza', 'BL-piscina':'piscina' };
  if(mapa[id] && aplica(fecha, mapa[id])) d.factors[mapa[id]] = nuevo ? 2 : 0;
  if(id.indexOf('BL-mov') === 0){
    const n = ['BL-mov1','BL-mov2','BL-mov3'].filter(b => S.sessions[fecha][b]).length;
    d.factors.movilidad = n >= 2 ? 2 : n === 1 ? 1 : 0;
  }
  guardar(); render();
}

/* --- Material --- */
function toggleMaterial(k){
  S.material[k] = !tieneMaterial(k);
  guardar(); render();
}

/* --- Mover sesiones de día --- */
function hojaMover(campo){
  const fecha = editable(FECHA) ? FECHA : hoy();
  const mon = mondayOf(fecha);
  const actual = planDia(fecha)[campo];
  if(!actual) return toast('Hoy no hay nada que mover.');
  const dias = rango(fecha, addD(mon,6)).filter(d => d > fecha);
  if(!dias.length) return sheet('Mover a otro día',
    `<p>No quedan días en esta semana. El pasado no se reescribe: lo de hoy se queda como está.</p>
     <p class="muted small">${TEXTO_FLEXIBILIDAD}</p>`);

  const filas = dias.map(d => {
    const p = planDia(d);
    const ocupado = p[campo];
    const u = ubicacion(d);
    const otros = [];
    if(p.fuerza) otros.push(p.fuerza === 'R' ? 'reducida' : 'Fuerza '+p.fuerza);
    if(p.piscina) otros.push('piscina '+p.piscina);
    /* ¿quedaría fuerza en dos días seguidos? */
    let aviso = '';
    if(campo === 'fuerza'){
      const prev = planDia(addD(d,-1)).fuerza, sig = planDia(addD(d,1)).fuerza;
      if((prev && addD(d,-1) !== fecha) || (sig && addD(d,1) !== fecha))
        aviso = '<div class="tiny warm">Quedaría fuerza en dos días seguidos.</div>';
    }
    return `<div class="card" style="padding:10px 12px;margin-bottom:8px">
      <div class="spread">
        <div style="min-width:0">
          <b>${cap(DIAS[dow(d)])} ${pd(d).getDate()}</b>
          ${u?`<span class="pill">${u}</span>`:''}
          <div class="tiny muted">${otros.length?otros.join(' + '):'día libre'}</div>
          ${aviso}
        </div>
        <button class="btn sm ${ocupado?'':'primary'}" data-mover="${campo}|${fecha}|${d}" style="flex:none">
          ${ocupado?'Intercambiar':'Mover aquí'}</button>
      </div>
    </div>`;
  }).join('');

  sheet('Mover a otro día', `<p class="muted small">${campo==='fuerza'?'Fuerza '+actual:'Piscina '+actual} → elige día.</p>
    ${filas}<p class="tiny faint">${TEXTO_FLEXIBILIDAD}</p>`);
}
function hacerMovimiento(spec){
  const [campo, desde, hasta] = spec.split('|');
  if(moverSesion(campo, desde, hasta)){
    document.getElementById('sheet').hidden = true;
    render();
    toast('Movido al ' + DIAS[dow(hasta)] + '. La cuota sigue en ' + (campo==='fuerza'?CUOTA_FUERZA:CUOTA_LARGA) + '.');
  }
}

/* --- "Hoy no puedo con esto": cuatro salidas, todas válidas --- */
function hojaNoPuedo(){
  const fecha = editable(FECHA) ? FECHA : hoy();
  const p = planDia(fecha);
  const alt = p.fuerza === 'M' ? fuerzaMasOlvidada(['P1','P2'], fecha) : (p.fuerza === 'P1' ? 'P2' : 'P1');
  sheet('Hoy no puedo con esto', `
    <p class="muted small">Cuatro salidas. Las cuatro son parte del plan, no excusas.</p>
    <div class="pblock"><b>1. Moverla a otro día</b>
      <button class="btn sm" data-accion="moverFuerza" style="margin-top:6px">Elegir día</button></div>
    <div class="pblock"><b>2. Cambiarla por otra sesión</b>
      Si hoy no tienes el material de la ${p.fuerza||'sesión'}, cambia por la ${alt}, que es la que lleva más tiempo sin hacerse.
      <button class="btn sm" data-accion="cambiarSesion" data-v="${alt}" style="margin-top:6px">Cambiar por ${alt}</button></div>
    <div class="pblock"><b>3. Hacer la versión reducida</b>
      20-25 minutos, sin material, con lo que haya en cualquier habitación.
      <button class="btn sm" data-accion="versionReducida" style="margin-top:6px">Pasar a la reducida</button></div>
    <div class="pblock"><b>4. Suelo mínimo</b>
      Caminata, cervicales y movilidad. El día cuenta como cumplido.
      <button class="btn sm" data-accion="sueloDesdeHoja" style="margin-top:6px">Suelo mínimo</button></div>`);
}

/* --- Ubicación --- */
function setUbicacion(u){
  const fecha = editable(FECHA) ? FECHA : hoy();
  if(!editable(fecha)) return;
  S.ubic[fecha] = (S.ubic[fecha] === u) ? null : u;
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
  const dias = rango(mon, addD(mon,6));
  const filas = dias.map((d,i) => {
    const c = w[d] || { fuerza:null, piscina:null };
    const pasado = d < hoy();
    const u = ubicacion(d);
    const ubot = (v,l) => `<button class="chip ${u===v?'on':''}" data-ubicdia="${d}|${v}" style="flex:1;justify-content:center;min-height:40px;font-size:13px">${l}</button>`;
    return `<div class="card" style="padding:10px 12px;margin-bottom:8px${pasado?';opacity:.55':''}">
      <div class="spread" style="margin-bottom:8px">
        <b>${cap(DIAS[dow(d)])} ${pd(d).getDate()}</b>
        <div class="row" style="gap:4px;flex:none">
          ${pasado?'<span class="tiny faint">cerrado</span>':`
            <button class="chip" data-desplazar="${d}|-1" aria-label="Mover al día anterior" style="min-height:40px">↑</button>
            <button class="chip" data-desplazar="${d}|1" aria-label="Mover al día siguiente" style="min-height:40px">↓</button>`}
        </div>
      </div>
      <div class="row" style="margin-bottom:6px">
        <select data-plan="${d}|fuerza" style="flex:1" ${pasado?'disabled':''}>
          ${opt(c.fuerza, [['','Sin fuerza'],['M','Fuerza M'],['P1','Fuerza P1'],['P2','Fuerza P2'],['R','Reducida']])}
        </select>
        <select data-plan="${d}|piscina" style="flex:1" ${pasado?'disabled':''}>
          ${opt(c.piscina, [['','Sin piscina'],['larga','Piscina larga'],['regenerativa','Regenerativa']])}
        </select>
      </div>
      <div class="row" style="gap:4px"><span class="tiny muted" style="flex:none">Dónde:</span>${ubot('madrid','Madrid')}${ubot('pueblo','Pueblo')}${ubot('fuera','Fuera')}</div>
    </div>`;
  }).join('');

  const avisos = revisarPlan(mon).map(a => `<div class="hito small">${a}</div>`).join('');
  const c = cuota(mon);

  return `<div class="dayhead"><div><div class="d1">Planificar semana</div>
      <div class="d2">Semana del ${fmtShort(mon)}</div></div>
      <button class="chip" data-go="hoy">Volver</button></div>
    <div class="row" style="gap:8px;margin-bottom:12px">
      <button class="chip ${mon===monActual?'on':''}" data-semana="${monActual}" style="flex:1;justify-content:center">Esta semana</button>
      <button class="chip ${mon!==monActual?'on':''}" data-semana="${addD(monActual,7)}" style="flex:1;justify-content:center">La que viene</button>
    </div>
    <div class="row" style="gap:6px;margin-bottom:10px">
      <span class="pill">Fuerza: ${c.fh} de ${c.ft} hechas</span>
      <span class="pill">Piscina larga: ${c.lh} de ${c.lt}</span>
    </div>
    <button class="btn sm" data-accion="repartir" style="margin-bottom:10px">Repartir automáticamente</button>
    ${avisos}
    ${filas}
    <div class="card small muted" style="margin-bottom:24px">${TEXTO_FLEXIBILIDAD}</div>`;
}

/* Desplaza la asignación de un día al anterior o al siguiente,
   intercambiando con lo que hubiera. Más fiable en móvil que arrastrar. */
function desplazar(spec){
  const [d, dir] = spec.split('|');
  const destino = addD(d, Number(dir));
  if(mondayOf(destino) !== mondayOf(d)) return toast('Ese día se sale de la semana.');
  if(d < hoy() || destino < hoy()) return toast('El pasado no se reescribe.');
  const w = asegurarSemana(mondayOf(d));
  const tmp = w[destino];
  w[destino] = w[d]; w[d] = tmp;
  guardar(); render();
}
/* Reparto automático: respeta las tres reglas y dice cuál se ha saltado si no puede */
function repartirSemana(){
  const mon = SEM;
  const w = asegurarSemana(mon);
  const dias = rango(mon, addD(mon,6));
  const editables = dias.filter(d => d >= hoy());
  if(!editables.length) return toast('Esta semana ya está cerrada.');

  const saltadas = [];
  const sesiones = ['P1','P2','M'];
  /* lo ya hecho se respeta; se reparte solo sobre los días editables */
  const fijas = dias.filter(d => d < hoy() && w[d].fuerza).map(d => w[d].fuerza);
  const pendientes = sesiones.filter(s => fijas.indexOf(s) < 0);
  editables.forEach(d => { w[d].fuerza = null; });

  const esMadrid = d => ubicacion(d) === 'madrid';
  const libre = d => !w[d].fuerza;
  const sinVecino = d => !((w[addD(d,-1)] && w[addD(d,-1)].fuerza) || (w[addD(d,1)] && w[addD(d,1)].fuerza));

  pendientes.forEach(s => {
    let cand = editables.filter(d => libre(d) && sinVecino(d) && (s !== 'M' || esMadrid(d)));
    if(!cand.length && s === 'M'){
      cand = editables.filter(d => libre(d) && sinVecino(d));
      if(cand.length) saltadas.push('La M no ha caído en un día marcado como Madrid: no hay ninguno libre esta semana.');
    }
    if(!cand.length){
      cand = editables.filter(libre);
      if(cand.length) saltadas.push('La '+s+' ha quedado pegada a otra sesión de fuerza: no caben tres con un día de descanso entre medias.');
    }
    if(!cand.length){ saltadas.push('No he podido colocar la '+s+': no quedan días libres.'); return; }
    w[cand[0]].fuerza = s;
  });

  /* los días de fuerza, piscina regenerativa; el resto conserva lo que tuviera */
  editables.forEach(d => {
    if(w[d].fuerza && w[d].piscina === 'larga') w[d].piscina = 'regenerativa';
  });
  /* si faltan piscinas largas, se ponen en días sin fuerza */
  let largas = dias.filter(d => w[d].piscina === 'larga').length;
  editables.forEach(d => {
    if(largas >= CUOTA_LARGA) return;
    if(!w[d].fuerza && w[d].piscina !== 'larga' && dow(d) !== 0){ w[d].piscina = 'larga'; largas++; }
  });

  guardar(); render();
  if(saltadas.length) sheet('Repartido, con avisos',
    `<p>He colocado lo que he podido. Esto es lo que no ha salido:</p>
     <ul>${saltadas.map(x=>`<li style="margin:8px 0">${x}</li>`).join('')}</ul>
     <p class="muted small">Puedes moverlo a mano con las flechas. ${TEXTO_FLEXIBILIDAD}</p>`);
  else toast('Repartido: 3 de fuerza, sin días seguidos.');
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
  const monActual = mondayOf(hoy());
  /* La semana en curso está a medias: nunca llega a ≥5 días de nada y
     sesgaría todas las comparaciones a la baja. Fuera. */
  Object.keys(S.days).forEach(d => { const m = mondayOf(d); if(m < monActual) mons[m] = true; });
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
const MIN_SEMANAS = 4;   // con 6 no vería una comparación hasta diciembre
function comparaciones(){
  const ws = semanasConDatos();
  const bloques = COMPARACIONES.map(c => {
    const A = ws.filter(c.f);
    const B = ws.filter(c.g ? c.g : (w => !c.f(w)));
    const faltan = Math.max(MIN_SEMANAS-A.length, MIN_SEMANAS-B.length, 0);
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
  const sobreBasal = dolores.filter(v => v >= base+1).length;
  const picos = dolores.filter(v => v >= 8).length;
  const pastillas = dias.filter(d => S.days[d].painkiller).length;
  const fu = dias.filter(d => aplica(d,'fuerza') && estado(d,'fuerza')>=1).length;
  const pi = dias.filter(d => aplica(d,'piscina') && estado(d,'piscina')>=1).length;
  const med = dolores.length ? (dolores.reduce((a,b)=>a+b,0)/dolores.length).toFixed(1) : '—';
  const pico = dolores.length ? Math.max.apply(null,dolores) : '—';
  return `<div class="card"><h2 style="font-size:17px;margin-bottom:6px">${cap(MESES[h.getMonth()])}</h2>
    <div class="kv"><span>Días por encima de mi basal (≥ ${base+1})</span><b>${sobreBasal}</b></div>
    <div class="kv"><span>Días en 8 o más</span><b>${picos}</b></div>
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
      ${['roto','reglas','brote','recaida','suelo'].map(id => `<button class="btn ghost" data-proto="${id}" style="justify-content:flex-start;margin-bottom:8px">${PROTOCOLOS[id].titulo}</button>`).join('')}
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
      (p.banderas ? `<div class="flags"><h3>${p.banderas.titulo}</h3><ul>${p.banderas.items.map(i=>`<li>${i}</li>`).join('')}</ul></div>` : '');
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

  /* tres días seguidos sin registrar: señal de recaída, no de pereza */
  if(ini){
    const tres = [ayer, antes, addD(h,-3)];
    if(tres.every(d => d >= ini && !registrado(d)) && !S.flags['recaida:'+h]){
      S.flags['recaida:'+h] = true; guardar();
      sheet(PROTOCOLOS.recaida.titulo,
        `<p class="muted small">Tres días sin registrar. No es un juicio, es el momento en el que este texto sirve para algo.</p>
         <button class="btn sm primary" data-accion="registrarHoy" style="margin-bottom:12px">Registrar solo hoy</button>
         <p class="tiny faint">No hay que rellenar los días perdidos. Se sigue desde hoy.</p>`
        + htmlProtocolo('recaida'));
      return;
    }
  }

  /* dos días consecutivos no cumplidos, ya cerrados */
  if(ini && antes >= ini && !cumplido(ayer) && !cumplido(antes)){
    if(!S.flags['roto:'+h]){
      S.flags['roto:'+h] = true; guardar();
      abrirProtocolo('roto', `<p class="muted small">Dos días seguidos sin cumplir. No es un juicio: es el momento en el que este texto sirve para algo.</p>`);
      return;
    }
  }

  /* dolor en basal+2 o más, dos días seguidos */
  const b = S.settings.painBaseline;
  const dh = S.days[h], da = S.days[ayer];
  if(dh && da && dh.pain != null && da.pain != null && dh.pain >= b+2 && da.pain >= b+2){
    if(!S.flags['brote:'+h]){
      S.flags['brote:'+h] = true; guardar();
      abrirProtocolo('brote', `<p class="muted small">Dos días en ${b+2} o más. Esto es lo que toca hacer.</p>`);
      return;
    }
  }

  /* acumulación: la media de 7 días sube 1 punto o más respecto a los 7 anteriores */
  const semKey = 'subida:' + mondayOf(h);
  if(!S.flags[semKey]){
    const m1 = mediaDolor(addD(h,-6), h), m0 = mediaDolor(addD(h,-13), addD(h,-7));
    if(m1 != null && m0 != null && m1 - m0 >= 1){
      S.flags[semKey] = true; guardar();
      sheet('Tu dolor medio está subiendo',
        `<p>Tu dolor medio está subiendo semana a semana. Eso no es un brote puntual, es acumulación: revisa carga y volumen.</p>
         <p class="muted small">Últimos 7 días: ${m1.toFixed(1)} · los 7 anteriores: ${m0.toFixed(1)}.</p>
         <p class="tiny faint">Lo más probable es que sobre volumen, no que falte. Baja una marca de banda o un 20% de carga durante una semana.</p>`);
    }
  }
}
function mediaDolor(desde, hasta){
  const v = rango(desde, hasta).map(d => S.days[d] && S.days[d].pain != null ? S.days[d].pain : null).filter(x => x != null);
  return v.length >= 3 ? v.reduce((a,b)=>a+b,0)/v.length : null;
}

/* ---------- 13. AJUSTES ---------- */
function vAjustes(){
  const nt = ('Notification' in window) ? Notification.permission : 'no-soportado';
  const ultima = S.flags.lastExport;
  return `<div class="dayhead"><div><div class="d1">Ajustes</div></div><button class="chip" data-go="hoy">Volver</button></div>

    <div class="card">
      <div class="spread" style="margin-bottom:8px">
        <div><b>Versión de la app</b><div class="tiny muted">${VERSION} · ${VERSION_FECHA}</div></div>
        <button class="chip" data-accion="novedades" style="flex:none">Novedades</button>
      </div>
      ${HAY_ACTUALIZACION
        ? `<button class="btn sm primary" data-accion="actualizar">Actualizar ahora</button>`
        : `<button class="btn sm" data-accion="buscarAct">${BUSCANDO?'Buscando…':'Buscar actualizaciones'}</button>`}
      <div class="tiny muted" style="margin-top:8px">Actualizar nunca toca tus datos.</div>
    </div>

    ${puedeInstalarse() ? `<div class="card">
      <h2 style="font-size:17px;margin-bottom:6px">Llévala en el móvil</h2>
      <div class="tiny muted" style="margin-bottom:10px">Icono propio, pantalla completa y funciona sin conexión.</div>
      <button class="btn sm primary" data-accion="instalar">${promptInstalar?'Instalar aplicación':'Cómo instalarla'}</button>
    </div>` : `<div class="card tiny muted">Ya está instalada en este móvil.</div>`}

    <div class="card">
      <h2 style="font-size:17px;margin-bottom:8px">Material que tengo</h2>
      <div class="tiny muted" style="margin-bottom:10px">Lo que no marques aquí, la app deja de pedírtelo: te ofrece la alternativa sin ese material.</div>
      ${MATERIAL.map(g => `<h3 style="font-size:14px;color:var(--muted);margin:12px 0 6px">${g.grupo}</h3>
        <div class="mats">${g.items.map(i => `<button class="mat ${tieneMaterial(i.key)?'on':''}" data-mat="${i.key}">
          <span class="mk">${tieneMaterial(i.key)?'✓':''}</span>${i.nombre}</button>`).join('')}</div>
        ${g.items.filter(i=>i.nota && tieneMaterial(i.key)).map(i=>`<input id="mat-nota-${i.key}" data-matnota="${i.key}" placeholder="${i.nota}" value="${esc(S.material[i.key+'_nota']||'')}" style="margin-top:8px">`).join('')}`).join('')}
    </div>

    <div class="card">
      <label class="lab">Hora del recordatorio</label>
      <select id="set-hour">${Array.from({length:24},(_,i)=>`<option value="${i}" ${S.settings.reminderHour===i?'selected':''}>${p2(i)}:00</option>`).join('')}</select>
      <div class="hito small" style="margin:10px 0">El aviso solo salta si la app ha quedado abierta en segundo plano. Para que sea fiable, pon una alarma repetida en el reloj del móvil a esta hora.</div>
      <button class="btn sm" data-accion="permiso" style="margin-bottom:8px">${nt==='granted'?'Notificaciones activadas':nt==='no-soportado'?'Este navegador no las soporta':'Activar notificaciones'}</button>
      <button class="btn sm ghost" data-accion="ics">Descargar recordatorio para el calendario</button>
      <div class="tiny muted" style="margin-top:8px">El archivo .ics crea un evento diario a esa hora en el calendario del móvil. Eso sí es fiable.</div>
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

  /* actualización */
  actualizar(){ aplicarActualizacion(); },
  buscarAct(){ buscarActualizacion(true); },
  novedades(){ const c = CHANGELOG.find(x => x.v === VERSION);
    sheet('Novedades · '+VERSION, `<ul>${c.cambios.map(x=>`<li style="margin:8px 0">${x}</li>`).join('')}</ul>`); },

  /* dolor */
  confirmarDolor(){
    const fecha = editable(FECHA) ? FECHA : hoy();
    if(!editable(fecha)) return;
    const sl = document.getElementById('pain');
    const v = sl ? Number(sl.value) : (ultimoDolorAntes(fecha) ?? S.settings.painBaseline);
    const d = dia(fecha, true); d.pain = v; guardar(); render(); revisarAvisos();
    toast('Dolor '+v+' registrado.');
  },

  /* flexibilidad */
  moverFuerza(){ hojaMover('fuerza'); },
  moverPiscina(){ hojaMover('piscina'); },
  nopuedo(){ hojaNoPuedo(); },
  cambiarSesion(el){
    const fecha = editable(FECHA) ? FECHA : hoy();
    if(!movible(fecha)) return toast('El pasado no se reescribe.');
    const w = asegurarSemana(mondayOf(fecha));
    const nueva = el.dataset.v, vieja = w[fecha].fuerza;
    const resto = rango(addD(fecha,1), addD(mondayOf(fecha),6));
    /* Si la nueva ya estaba en otro día futuro, se intercambian y la cuota
       sigue en 3. Si no, se sustituye sin recolocar: recolocar crearía una
       cuarta sesión, y aquí no se arrastra deuda. */
    const otro = resto.find(d => planDia(d).fuerza === nueva);
    w[fecha].fuerza = nueva;
    if(otro) asegurarSemana(mondayOf(otro))[otro].fuerza = vieja;
    guardar(); document.getElementById('sheet').hidden = true; render();
    toast(otro ? 'Hoy: '+nueva+'. La '+vieja+' pasa al '+DIAS[dow(otro)]+'.'
               : 'Hoy: '+nueva+'. La '+vieja+' se queda fuera de esta semana, sin deuda.');
  },
  versionReducida(){
    const fecha = editable(FECHA) ? FECHA : hoy();
    if(!movible(fecha)) return toast('El pasado no se reescribe.');
    asegurarSemana(mondayOf(fecha))[fecha].fuerza = 'R';
    guardar(); document.getElementById('sheet').hidden = true; VIEW = 'plan'; render();
    toast('Sesión reducida: 20-25 min, sin material.');
  },
  sueloDesdeHoja(){
    document.getElementById('sheet').hidden = true;
    sueloMinimo();
    setTimeout(() => abrirProtocolo('roto', '<p class="muted small">Día de suelo mínimo. Cuenta como cumplido. Esto es lo que toca ahora.</p>'), 350);
  },
  traerM(el){
    const fecha = editable(FECHA) ? FECHA : hoy();
    if(moverSesion('fuerza', el.dataset.d, fecha)){ render(); toast('La M es hoy.'); }
  },
  moverM(el){
    const fecha = editable(FECHA) ? FECHA : hoy();
    if(moverSesion('fuerza', fecha, el.dataset.d)){ render(); toast('La M pasa al '+DIAS[dow(el.dataset.d)]+'.'); }
  },
  modoFuera(){
    const fecha = editable(FECHA) ? FECHA : hoy();
    if(!movible(fecha)) return toast('El pasado no se reescribe.');
    const w = asegurarSemana(mondayOf(fecha));
    if(w[fecha].fuerza) w[fecha].fuerza = 'R';
    w[fecha].piscina = null;      // sale del día: no aplica, no cuenta como fallo
    guardar(); render();
    toast('Día ajustado. La piscina no cuenta como fallo.');
  },

  /* revisión y material */
  revision(){
    sheet(REVISION.titulo, `<p class="muted small">${REVISION.intro}</p>
      ${REVISION.bloques.map(b => `<h3>${b.titulo}</h3>
        <ul>${b.items.map(i=>`<li>${i}</li>`).join('')}</ul>
        ${b.nota?`<p class="tiny faint">${b.nota}</p>`:''}`).join('')}`);
  },
  registrarHoy(){ document.getElementById('sheet').hidden = true; FECHA = hoy(); ir('hoy'); },
  ics(){ descargarICS(); },
  repartir(){ repartirSemana(); },
  ubicSheet(){ hojaUbicacion(); },
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
/* Recordatorio de verdad: un evento diario en el calendario del móvil */
function descargarICS(){
  const hh = p2(S.settings.reminderHour);
  const dtstamp = new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
  const inicio = PLAN.inicio.replace(/-/g,'');
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//plan-agosto//ES','CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:plan-agosto-registro@local',
    'DTSTAMP:'+dtstamp,
    'DTSTART:'+inicio+'T'+hh+'0000',
    'DTEND:'+inicio+'T'+hh+'1000',
    'RRULE:FREQ=DAILY',
    'SUMMARY:Registrar el día (plan agosto)',
    'DESCRIPTION:Son 20 segundos. Aunque sea un día de ceros: el registro no tiene día libre.',
    'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Registrar el día','END:VALARM',
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  descargar('recordatorio-plan-agosto.ics', ics, 'text/calendar');
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
    /* comprobación silenciosa de actualizaciones, como mucho cada 6 h */
    const ult = S.flags.ultimaBusqueda || 0;
    if(navigator.onLine && Date.now() - ult > 6*3600*1000) buscarActualizacion(false);
  }
});
render();
if(!verNovedades()) revisarAvisos();
programarAviso();
