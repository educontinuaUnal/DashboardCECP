import { objectiveThemes } from '../data/config.js';

const DEFAULT_YEAR = '2025';

function valueOf(row, aliases) {
  const key = aliases.find((name) => row[name] !== undefined && row[name] !== '');
  return key ? String(row[key]).trim() : '';
}

export function parseNumber(value) {
  if (typeof value !== 'string' || !value.trim()) return 0;
  return Number.parseFloat(value.replace(/,/g, '.').replace(/[^\d.-]/g, '')) || 0;
}

function inferDirection(label, goal) {
  const text = `${label} ${goal}`.toLowerCase();
  if (text.includes('≤') || text.includes('menor') || text.includes('max')) return 'menor_igual';
  if (text.includes('=') || text.includes('igual')) return 'igual';
  return 'mayor_igual';
}

export function calculateCompletion(goal) {
  const target = parseNumber(goal.target);
  const current = parseNumber(goal.current);
  if (target <= 0) return 0;

  if (goal.direction === 'menor_igual') {
    return Math.max(0, (1 - (current - target) / target) * 100);
  }

  if (goal.direction === 'igual') {
    const distance = Math.abs(current - target);
    return Math.max(0, (1 - distance / target) * 100);
  }

  return (current / target) * 100;
}

function createIndicator(row, year, objectiveName) {
  return {
    id: valueOf(row, ['CodigoIndicador', 'ID', 'IndicadorID']),
    name: valueOf(row, ['NombreIndicador', 'Indicador']),
    description: valueOf(row, ['DescripcionGeneral', 'DescripcionIndicador']),
    purpose: valueOf(row, ['ObjetivoIndicador']),
    formula: valueOf(row, ['Formula', 'Fórmula']),
    periodicity: valueOf(row, ['Periodicidad']),
    responsible: valueOf(row, ['Responsable']),
    year,
    objectiveName,
    updatedAt: valueOf(row, ['FechaActualizacion', 'FechaActualización']),
    goals: []
  };
}

function pushGoal(indicator, goal) {
  if (!goal.target && !goal.current && !goal.label) return;
  indicator.goals.push({
    code: goal.code || `M${indicator.goals.length + 1}`,
    label: goal.label || 'Cumplimiento',
    target: goal.target || '0',
    current: goal.current || '0',
    unit: goal.unit || '',
    direction: goal.direction || inferDirection(goal.label, goal.target),
    updatedAt: goal.updatedAt || indicator.updatedAt
  });
}

export function normalizeIndicators(rows) {
  const years = new Map();

  rows.forEach((row) => {
    const year = valueOf(row, ['Anio', 'Año', 'Year']) || DEFAULT_YEAR;
    const objectiveName = valueOf(row, ['ObjetivoEstrategico', 'Objetivo Estratégico']) || 'General';
    const objectiveDescription = valueOf(row, ['DescripcionObjetivoEstrategico', 'Descripcion Objetivo Estratégico']);
    const indicatorId = valueOf(row, ['CodigoIndicador', 'ID', 'IndicadorID']);
    if (!indicatorId) return;

    if (!years.has(year)) years.set(year, new Map());
    const objectives = years.get(year);
    if (!objectives.has(objectiveName)) {
      objectives.set(objectiveName, {
        name: objectiveName,
        description: objectiveDescription,
        theme: objectiveThemes[objectiveName] || objectiveThemes.General,
        indicators: new Map()
      });
    }

    const objective = objectives.get(objectiveName);
    if (!objective.indicators.has(indicatorId)) {
      objective.indicators.set(indicatorId, createIndicator(row, year, objectiveName));
    }

    const indicator = objective.indicators.get(indicatorId);
    const modernGoal = valueOf(row, ['MetaCodigo', 'Meta Código', 'MetaEtiqueta', 'Meta Etiqueta']);

    if (modernGoal) {
      pushGoal(indicator, {
        code: valueOf(row, ['MetaCodigo', 'Meta Código']),
        label: valueOf(row, ['MetaEtiqueta', 'Meta Etiqueta']),
        target: valueOf(row, ['MetaValor', 'Meta Valor']),
        current: valueOf(row, ['ValorActual', 'Valor Actual']),
        unit: valueOf(row, ['Unidad']),
        direction: valueOf(row, ['DireccionMeta', 'DirecciónMeta', 'Direccion Meta']),
        updatedAt: valueOf(row, ['FechaActualizacion', 'FechaActualización'])
      });
      return;
    }

    for (let index = 1; index <= 3; index += 1) {
      pushGoal(indicator, {
        code: `M${index}`,
        label: valueOf(row, [`Meta${index}_Etiqueta`]),
        target: valueOf(row, [`Meta${index}_Valor`]),
        current: valueOf(row, [`ValorActual${index}`])
      });
    }
  });

  return Array.from(years.entries())
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, objectives]) => ({
      year,
      objectives: Array.from(objectives.values()).map((objective) => ({
        ...objective,
        indicators: Array.from(objective.indicators.values())
      }))
    }));
}

export function getYearSummary(yearData) {
  const indicators = yearData.objectives.flatMap((objective) => objective.indicators);
  const goals = indicators.flatMap((indicator) => indicator.goals);
  const completed = goals.filter((goal) => calculateCompletion(goal) >= 100).length;
  const average =
    goals.length === 0
      ? 0
      : goals.reduce((sum, goal) => sum + Math.min(100, calculateCompletion(goal)), 0) / goals.length;

  return {
    objectiveCount: yearData.objectives.length,
    indicatorCount: indicators.length,
    goalCount: goals.length,
    completed,
    average: Math.round(average)
  };
}
