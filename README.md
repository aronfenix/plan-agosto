# Plan agosto

PWA de seguimiento diario para el plan de fuerza, movilidad y natación del **7 de agosto al 4 de septiembre de 2026**.

Sin cuentas, sin backend, sin nube, sin dependencias. Todo vive en el móvil (`localStorage`) y funciona sin conexión.

---

## Estructura del proyecto

```
plan-agosto/
├── index.html      Esqueleto: navegación, contenedor y hoja modal. Casi vacío a propósito.
├── app.css         Tema oscuro, móvil primero. Aquí están todos los colores.
├── data.js         ►► TODO EL CONTENIDO DEL PLAN. Es el archivo que vas a editar.
├── app.js          Lógica: métricas, pantallas, gráficos, exportación, avisos.
├── manifest.json   Metadatos de la PWA (nombre, iconos, color, standalone).
├── sw.js           Service worker: cachea todo para funcionar offline.
├── icon-192.png    Icono de la app.
└── icon-512.png    Icono de la app (y versión maskable).
```

### Reparto de responsabilidades

| Quiero cambiar…                              | Toco…       |
|----------------------------------------------|-------------|
| Ejercicios, avisos de técnica, textos, calendario | `data.js`   |
| Colores, tamaños, espaciados                 | `app.css`   |
| Cómo se calcula algo o cómo se ve una pantalla | `app.js`    |

**Regla:** si editas solo `data.js`, no puedes romper la lógica.

---

## Cómo editar el contenido del plan

Todo lo editable está en `data.js`. Después de cualquier cambio, **sube el número de versión de la caché** (ver más abajo) o el móvil seguirá mostrando la versión antigua.

### Cambiar un ejercicio

Busca `const SESIONES` y edita el objeto que quieras. Cada ejercicio tiene cinco campos:

```js
{ id: 'M1',                                  // NO lo cambies: es la clave del historial de cargas
  nombre: 'Peso muerto rumano con mancuernas',
  series: '2-3 × 8-12',
  como: 'Dos a cuatro frases de cómo se hace.',
  aviso: 'Lo que sale en el recuadro destacado de técnica.' }
```

> Si cambias un `id`, pierdes el histórico de cargas de ese ejercicio. Cambia el `nombre` todo lo que quieras; el `id` déjalo quieto.

Para **añadir** un ejercicio, copia una línea entera dentro del array `ejercicios` y dale un `id` nuevo que no exista (`M7`, `P1.8`…). Para **quitarlo**, borra el bloque entero, de `{` a `},`.

### Cambiar los factores diarios

`const FACTORES`. El `key` es la clave interna (no lo cambies o pierdes el histórico); `nombre` es lo que se ve; `def` y `min` son lo que sale al pulsar la ⓘ.

`condicional: true` significa "solo aplica los días asignados en el plan de la semana" (es el caso de `fuerza` y `piscina`).

### Cambiar el calendario por defecto

`const SEMANA_TIPO`, indexado por día de la semana (`0` = domingo, `1` = lunes … `6` = sábado):

```js
1: { fuerza: 'P1', piscina: 'regenerativa' },   // lunes
```

Valores válidos: `fuerza` → `'M'`, `'P1'`, `'P2'` o `null`. `piscina` → `'larga'`, `'regenerativa'` o `null`.

Esto es solo la **plantilla**. El calendario real de cada semana se guarda al usar la pantalla *Planificar semana* y manda sobre la plantilla. La plantilla se aplica a cualquier semana que aún no hayas planificado, también después de septiembre.

### Cambiar la progresión de la piscina

`const NADO_ATADO`, con una entrada por lunes en formato ISO:

```js
'2026-08-17': { series: '6 × 2 min', descanso: '60 s', reparto: '4 espalda / 2 crol' },
```

Para semanas sin entrada, la app usa la del 10 de agosto.

### Cambiar los protocolos y las siete reglas

`const PROTOCOLOS`. Tres formatos: `tipo: 'lista'` (array `items`), `tipo: 'texto'` (campo `texto`) y `tipo: 'bloques'` (array `bloques` con `cabecera` y `texto`, más `banderas`).

### Cambiar hitos del calendario

`PLAN.hitos`: fecha ISO → texto. Aparece destacado en la pantalla de Hoy ese día.

```js
'2026-09-04': 'REVISIÓN — perímetros, fotos, prendas, tests'
```

### Cambiar movilidad y cervicales

`const MOVILIDAD` (dos menús con sus listas) y `const CERVICAL` (niveles, descripción e isométrico a partir del 24 de agosto).

---

## Después de cada cambio: subir la versión de la caché

El service worker sirve desde caché primero, así que un archivo editado **no llega al móvil** hasta que cambia el nombre de la caché. En `sw.js`, primera línea:

```js
const CACHE = 'plan-agosto-v2';   // súbelo a v3, v4…
```

Sube el número, sube los cambios a GitHub, y al abrir la app en el móvil (con conexión) se actualiza sola. Si tienes prisa: cerrar la app del todo y volver a abrirla.

---

## Publicar en GitHub Pages desde cero

1. Crea el repositorio en <https://github.com/new>. Nombre: `plan-agosto`. Público. **Sin** README, **sin** .gitignore, **sin** licencia (el repo tiene que quedar vacío).
2. En el ordenador, dentro de la carpeta `plan-agosto`:

```bash
git init -b main
git add .
git commit -m "Plan agosto: PWA de seguimiento diario"
git remote add origin https://github.com/TU-USUARIO/plan-agosto.git
git push -u origin main
```

3. En GitHub: pestaña **Settings** → menú lateral **Pages** → en *Build and deployment*, *Source*: **Deploy from a branch**; *Branch*: **main** y carpeta **/ (root)** → **Save**.
4. Espera un minuto y recarga esa página: arriba aparece la URL.

```
https://TU-USUARIO.github.io/plan-agosto/
```

Para publicar cambios más adelante:

```bash
git add . && git commit -m "Cambio X" && git push
```

> HTTPS es obligatorio para que funcionen el service worker y la instalación. GitHub Pages ya lo da.

## Instalar en el móvil

1. Abre la URL en **Chrome** (Android).
2. Arriba sale una tira: **«Llévala en el móvil» → botón Instalar**. Un toque y Chrome abre su diálogo de instalación. Confirma.
3. Queda un icono como el de cualquier app. Ábrela siempre desde ahí: pantalla completa, sin barra del navegador.
4. Entra una vez con conexión para que se cachee todo. A partir de ahí funciona en modo avión.

La tira desaparece sola en cuanto la instalas, y con la **✕** la ocultas para siempre. El botón sigue estando en *Ajustes → Llévala en el móvil*.

En iPhone (Safari) no existe ese diálogo: el botón abre las instrucciones para hacerlo con **Compartir → Añadir a pantalla de inicio**. (En iOS las notificaciones solo funcionan si la abres desde el icono instalado.)

---

## Copias de seguridad

Los datos viven **solo** en el navegador de ese móvil. Si borras los datos de navegación o desinstalas, se van.

*Ajustes → Exportar JSON* descarga una copia completa; *Importar JSON* la restaura. La app avisa sola una vez al mes. El CSV es para mirar los datos en una hoja de cálculo, no sirve para restaurar.

---

## Modelo de datos

Una única clave en `localStorage`: `plan-agosto-v1`.

```js
{
  version: 1,
  settings: { reminderHour, painBaseline, walkMinTarget },
  weekPlans: { '2026-08-10': { '2026-08-10': { fuerza:'P1', piscina:'regenerativa' }, … } },
  days: { '2026-08-10': { factors:{…}, pain, energy, painkiller, note, createdAt, lockedAt } },
  loads: { 'M1': [{ date, value, reps }] },
  sessions: { '2026-08-10': { 'M1': true } },   // ejercicios marcados en la pantalla de sesión
  flags: { … },                                  // avisos ya mostrados, fecha de la última exportación
  cervicalLevel: 1
}
```

Estados de cada factor: `2` completo · `1` mínimo · `0` no hecho · ausente = no aplica.
**2 y 1 cuentan igual** para días cumplidos, semanas y porcentajes.

## Reglas de cálculo

| Métrica                      | Definición |
|------------------------------|------------|
| Día cumplido                 | ≥ 5 factores **aplicables** con estado ≥ 1 |
| Semana cumplida              | ≥ 5 de 7 días cumplidos |
| Peor cadena de fallos        | Máximo histórico de días consecutivos no cumplidos |
| Días desde el último doble fallo | Días desde la última vez que hubo 2 días seguidos no cumplidos |

Las métricas empiezan a contar **el primer día que registraste algo**, nunca antes: los días anteriores a estrenar la app no son fallos.

## Ventana de gracia

Hoy siempre es editable. Ayer, hasta las 12:00 del día siguiente. Después, el día queda bloqueado (`lockedAt`) y solo se puede consultar. Los días más antiguos no se editan.

---

## Probar en local

Hace falta servirlo por HTTP (con `file://` no funcionan el service worker ni la instalación):

```bash
python -m http.server 8000
```

Y abrir <http://localhost:8000>. `localhost` cuenta como origen seguro, así que la PWA funciona entera.
