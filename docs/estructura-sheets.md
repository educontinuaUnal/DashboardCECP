# Estructura recomendada para Google Sheets

La app nueva sigue leyendo el formato 2025 actual, pero conviene migrar a una tabla estable para 2026 y los años siguientes.

## Hoja publicada como CSV

Usa una sola pestaña publicada como CSV con una fila por meta de indicador y año. Esto evita columnas `Meta1`, `Meta2`, `Meta3` que después se quedan cortas.

| Columna | Ejemplo | Uso |
| --- | --- | --- |
| `Anio` | `2026` | Año de seguimiento. |
| `ObjetivoEstrategico` | `Gestión Eficiente` | Agrupador principal. |
| `DescripcionObjetivoEstrategico` | `Fortalecer la gestión...` | Texto del bloque de objetivo. |
| `CodigoIndicador` | `GE-01` | Identificador estable del indicador. |
| `NombreIndicador` | `Cumplimiento del plan operativo` | Nombre visible. |
| `DescripcionGeneral` | `Mide el avance...` | Detalle del indicador. |
| `ObjetivoIndicador` | `Hacer seguimiento...` | Texto corto de propósito. |
| `Formula` | `(Actividades cumplidas / programadas) * 100` | Fórmula visible. |
| `Periodicidad` | `Mensual` | Frecuencia de actualización. |
| `Responsable` | `Coordinación académica` | Responsable. |
| `MetaCodigo` | `M1` | Código de la meta dentro del indicador. |
| `MetaEtiqueta` | `Cumplimiento anual` | Etiqueta de la meta. |
| `MetaValor` | `90%` | Valor esperado. |
| `ValorActual` | `68%` | Valor observado. |
| `Unidad` | `%` | Unidad de lectura. |
| `DireccionMeta` | `mayor_igual` | Usa `mayor_igual`, `menor_igual` o `igual`. |
| `FechaActualizacion` | `2026-03-31` | Fecha del dato. |
| `Fuente` | `Planeación` | Opcional para trazabilidad. |
| `Estado` | `Activo` | Opcional para filtrar en el futuro. |

## Cómo registrar 2026

1. Mantén los códigos de indicadores 2025 cuando el indicador siga existiendo.
2. Crea una fila por cada meta del indicador en `Anio = 2026`.
3. Si un indicador tiene tres metas, registra tres filas con el mismo `CodigoIndicador` y distintos `MetaCodigo`.
4. Usa `DireccionMeta = menor_igual` para metas donde un valor menor cumple mejor, por ejemplo tiempos de respuesta o costos máximos.
5. Publica esa pestaña como CSV y conserva la URL en `src/data/config.js`.

## Datos 2025 Migrados

El archivo local migrado quedó en:

`data/indicadores-cecp-formato-estable.csv`

Ese CSV ya trae una fila por meta y fue la base para la hoja estable publicada.

## Conexión con Google Sheets

1. Crea una hoja nueva en Google Sheets.
2. Importa `data/indicadores-cecp-formato-estable.csv`.
3. Nombra la pestaña principal, por ejemplo `Indicadores`.
4. Agrega las filas de `Anio = 2026` debajo de las de 2025, usando los mismos encabezados.
5. En Google Sheets usa `Archivo > Compartir > Publicar en la web`.
6. Selecciona la pestaña `Indicadores` y formato `Valores separados por comas (.csv)`.
7. Copia la URL publicada.
8. Crea un archivo `.env` a partir de `.env.example` si quieres sobreescribir la URL por ambiente:

```bash
VITE_GOOGLE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/e/2PACX-1vSg39tjFlLiqkdZPC07c6sapUEjJXL2I77KaX8ubsiCbEQIz0TQLaIT6AtPg8XU-sYRKRi1EqszxNWE/pub?gid=1802520333&single=true&output=csv
```

Luego reinicia `npm run dev`.

## Compatibilidad

Mientras migras, el sistema acepta el esquema 2025 con:

`ID`, `ObjetivoEstrategico`, `Meta1_Etiqueta`, `Meta1_Valor`, `ValorActual1`, `Meta2_Etiqueta`, `Meta2_Valor`, `ValorActual2`, `Meta3_Etiqueta`, `Meta3_Valor`, `ValorActual3`.

Si no existe columna `Anio`, esas filas se interpretan como `2025`.
