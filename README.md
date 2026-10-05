# Plan — fuerza, movilidad y hábitos

App web para el móvil. Sin cuentas, sin servidor: los datos viven en el propio móvil y funciona sin conexión.

## Qué hay

| Pestaña | Para qué |
|---|---|
| **Hoy** | Marcar los hábitos del día y el dolor. Cualquier día anterior se puede abrir y rellenar, sin límite. |
| **Entrenar** | Sesión A y sesión B. Cada ejercicio tiene ficha con dibujo animado, pasos, errores típicos y "así no". |
| **Estirar** | Rutina de mañana, rutina de noche y catálogo de 39 estiramientos por zonas, con buscador. |
| **Progreso** | Rachas, calendario, curva del dolor y entrenos por semana. |

## Archivos

| Archivo | Qué contiene | ¿Lo tocarías? |
|---|---|---|
| `textos.js` | Hábitos del día, reglas del entreno, versión y novedades | Sí, es el más fácil |
| `ejercicios.js` | Los 18 ejercicios de fuerza y calentamiento, y las sesiones A y B | Sí, para cambiar textos o series |
| `estiramientos.js` | Los 39 estiramientos, las zonas y las rutinas | Sí |
| `figura.js` | El motor que dibuja y anima las figuras | No |
| `app.js` / `app.css` | Pantallas y estilo | No |
| `sw.js` | Hace que funcione sin conexión y que se actualice | Solo el número de versión |

## Publicar (sustituyendo la versión anterior)

1. Entra en `github.com/aronfenix/plan-agosto`.
2. **Add file → Upload files**. Arrastra **todos** los archivos de esta carpeta. Si pregunta, reemplaza.
3. Abajo, **Commit changes**.
4. Puedes borrar el `data.js` antiguo del repositorio: ya no se usa.
5. En un minuto está publicado en la misma dirección de siempre: `https://aronfenix.github.io/plan-agosto/`

**La primera vez**, en el móvil: abre la app con conexión. Si sigues viendo la versión antigua, ciérrala del todo (quítala de las apps recientes) y ábrela otra vez.

Los datos de la versión anterior no se migran: esta empieza de cero. Siguen guardados aparte en el móvil, por si algún día hicieran falta.

## Actualizar en el futuro

Cuando cambies cualquier archivo:

1. En `sw.js`, sube el número de la primera línea: `plan-v3-001` → `plan-v3-002`.
2. En `textos.js`, cambia `VERSION` y apunta lo nuevo en `CHANGELOG`.
3. Sube los archivos como arriba.

En el móvil aparecerá un aviso arriba de **Hoy**: *"Hay una versión nueva"* → **Actualizar**. También puedes forzarlo en **Ajustes → Buscar actualizaciones**.

## Copia de seguridad

**Ajustes → Exportar copia** descarga un archivo con todos tus días. **Importar copia** lo restaura, en este móvil o en otro. Hazla de vez en cuando: si se borran los datos del navegador, se pierden.

## Reglas de cálculo

- **Día cumplido**: 4 hábitos marcados, o caminata + rutina de mañana (el mínimo también cuenta).
- **Fuerza y rutina de noche** son extras: suman si los haces y nunca restan si no.
- **Comodín**: para días de enfermedad o viaje. Ni suma ni rompe la racha.
- **Hoy** no cuenta como fallo hasta que termina.
