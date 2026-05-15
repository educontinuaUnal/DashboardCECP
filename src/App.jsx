import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  ExternalLink,
  LayoutDashboard,
  Search,
  Target,
  UserRound
} from 'lucide-react';
import { googleSheetUrl, lookerStudioUrl } from './data/config.js';
import { parseCSV } from './utils/csv.js';
import { calculateCompletion, getYearSummary, normalizeIndicators } from './utils/indicators.js';

const formatPercent = (value) => `${Math.round(value)}%`;

function getIndicatorStatus(goals) {
  if (goals.length === 0) {
    return {
      label: 'Sin metas',
      detail: 'Pendiente',
      tone: 'neutral'
    };
  }

  const completions = goals.map((goal) => calculateCompletion(goal));
  const allCompleted = completions.every((completion) => completion >= 100);
  const hasProgress = completions.some((completion) => completion > 0);

  if (allCompleted) {
    return {
      label: 'Cumplido',
      detail: `${goals.length}/${goals.length} metas`,
      tone: 'success'
    };
  }

  return {
    label: hasProgress ? 'En avance' : 'Pendiente',
    detail: `${completions.filter((completion) => completion >= 100).length}/${goals.length} metas`,
    tone: hasProgress ? 'progress' : 'neutral'
  };
}

function ProgressBar({ goal, theme }) {
  const completion = calculateCompletion(goal);
  const width = Math.min(100, Math.round(completion));

  return (
    <div className="goal-row">
      <div className="goal-head">
        <span>{goal.label}</span>
        <strong style={{ color: theme.text }}>{formatPercent(completion)}</strong>
      </div>
      <div className="goal-meta">
        <span>Meta: {goal.target || 'N/A'}</span>
        <span>Actual: {goal.current || 'N/A'}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${width}%`, background: theme.accent }} />
      </div>
    </div>
  );
}

function IndicatorCard({ indicator, theme }) {
  const [open, setOpen] = useState(false);
  const status = getIndicatorStatus(indicator.goals);

  return (
    <article className="indicator-card">
      <div className="card-top">
        <div>
          <span className="indicator-code" style={{ background: theme.accent }}>
            {indicator.id}
          </span>
          <h3>{indicator.name}</h3>
        </div>
        <div className={`status-badge ${status.tone}`} style={{ '--status-accent': theme.accent }}>
          <CheckCircle2 size={16} />
          <span>{status.label}</span>
          <small>{status.detail}</small>
        </div>
      </div>

      <p className="purpose">{indicator.purpose || 'Objetivo del indicador no registrado.'}</p>

      <div className="goals-list">
        {indicator.goals.length > 0 ? (
          indicator.goals.map((goal) => <ProgressBar key={`${indicator.id}-${goal.code}`} goal={goal} theme={theme} />)
        ) : (
          <p className="empty-goals">No hay metas definidas.</p>
        )}
      </div>

      <div className="card-footer">
        <span>
          <Clock3 size={14} />
          {indicator.updatedAt || 'Sin actualización'}
        </span>
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          {open ? 'Ocultar' : 'Detalles'}
          <ChevronDown size={16} className={open ? 'rotate' : ''} />
        </button>
      </div>

      {open && (
        <div className="details-panel">
          <p>
            <strong>Descripción</strong>
            {indicator.description || 'No registrada.'}
          </p>
          <p>
            <strong>Fórmula</strong>
            {indicator.formula || 'No registrada.'}
          </p>
          <p>
            <strong>Periodicidad</strong>
            {indicator.periodicity || 'No registrada.'}
          </p>
          <p>
            <strong>Responsable</strong>
            {indicator.responsible || 'No registrado.'}
          </p>
        </div>
      )}
    </article>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="summary-card">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ObjectiveSection({ objective }) {
  return (
    <section className="objective-section" id={objective.name.replace(/\s+/g, '-').toLowerCase()}>
      <div className="section-heading" style={{ borderColor: objective.theme.accent }}>
        <div>
          <span style={{ color: objective.theme.text }}>Objetivo estratégico</span>
          <h2>{objective.name}</h2>
          <p>{objective.description || 'Descripción pendiente en la hoja de datos.'}</p>
        </div>
        <strong style={{ background: objective.theme.soft, color: objective.theme.text }}>
          {objective.indicators.length} indicadores
        </strong>
      </div>

      <div className="indicators-grid">
        {objective.indicators.map((indicator) => (
          <IndicatorCard key={indicator.id} indicator={indicator} theme={objective.theme} />
        ))}
      </div>
    </section>
  );
}

function DashboardEmbed() {
  return (
    <section className="looker-panel">
      <div>
        <span>Vista consolidada</span>
        <h2>Dashboard general CECP</h2>
      </div>
      <a href={lookerStudioUrl} target="_blank" rel="noreferrer">
        Abrir
        <ExternalLink size={16} />
      </a>
      <iframe
        title="Dashboard general CECP en Looker Studio"
        src={lookerStudioUrl}
        allowFullScreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />
    </section>
  );
}

export function App() {
  const [status, setStatus] = useState({ state: 'loading', message: 'Cargando datos de indicadores...' });
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [activeView, setActiveView] = useState('resumen');
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(googleSheetUrl);
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const csvText = await response.text();
        const normalized = normalizeIndicators(parseCSV(csvText));
        if (normalized.length === 0) throw new Error('El Sheet no tiene filas válidas.');

        setYears(normalized);
        setSelectedYear(normalized[0].year);
        setStatus({ state: 'ready', message: '' });
      } catch (error) {
        setStatus({ state: 'error', message: error.message });
      }
    }

    loadData();
  }, []);

  const yearData = years.find((item) => item.year === selectedYear);
  const summary = yearData ? getYearSummary(yearData) : null;

  const filteredObjectives = useMemo(() => {
    if (!yearData) return [];
    const term = query.trim().toLowerCase();
    if (!term) return yearData.objectives;

    return yearData.objectives
      .map((objective) => ({
        ...objective,
        indicators: objective.indicators.filter((indicator) =>
          [indicator.id, indicator.name, indicator.purpose, objective.name].join(' ').toLowerCase().includes(term)
        )
      }))
      .filter((objective) => objective.indicators.length > 0);
  }, [query, yearData]);

  if (status.state === 'loading') {
    return (
      <main className="loading-state">
        <div className="spinner" />
        <p>{status.message}</p>
      </main>
    );
  }

  if (status.state === 'error') {
    return (
      <main className="error-state">
        <CircleAlert size={34} />
        <h1>No se pudieron cargar los datos</h1>
        <p>Revisa la URL publicada del Google Sheet y sus encabezados.</p>
        <small>{status.message}</small>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">Seguimiento en vivo</span>
          <h1>Dashboard de Indicadores CECP</h1>
          <p>Indicadores estratégicos organizados por año, objetivo y meta para sostener la trazabilidad desde 2025 en adelante.</p>
        </div>

        <div className="year-switcher" aria-label="Seleccionar año">
          {years.map((year) => (
            <button
              type="button"
              key={year.year}
              className={selectedYear === year.year ? 'active' : ''}
              onClick={() => setSelectedYear(year.year)}
            >
              {year.year}
            </button>
          ))}
        </div>
      </header>

      <section className="toolbar">
        <nav className="view-tabs" aria-label="Vistas del dashboard">
          <button type="button" className={activeView === 'resumen' ? 'active' : ''} onClick={() => setActiveView('resumen')}>
            <BarChart3 size={18} />
            Resumen
          </button>
          <button type="button" className={activeView === 'looker' ? 'active' : ''} onClick={() => setActiveView('looker')}>
            <LayoutDashboard size={18} />
            Datos Relevantes
          </button>
        </nav>

        <label className="search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar indicador u objetivo" />
        </label>
      </section>

      {activeView === 'looker' ? (
        <DashboardEmbed />
      ) : (
        <>
          <section className="summary-grid">
            <SummaryCard icon={CalendarDays} label="Año activo" value={selectedYear} />
            <SummaryCard icon={Target} label="Objetivos" value={summary.objectiveCount} />
            <SummaryCard icon={BarChart3} label="Indicadores" value={summary.indicatorCount} />
            <SummaryCard icon={UserRound} label="Metas completas" value={`${summary.completed}/${summary.goalCount}`} />
          </section>

          <section className="annual-progress">
            <div>
              <span>Avance general</span>
              <strong>{summary.average}%</strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${summary.average}%` }} />
            </div>
          </section>

          <div className="objective-nav">
            {yearData.objectives.map((objective) => (
              <a key={objective.name} href={`#${objective.name.replace(/\s+/g, '-').toLowerCase()}`}>
                {objective.name}
              </a>
            ))}
          </div>

          {filteredObjectives.length > 0 ? (
            filteredObjectives.map((objective) => <ObjectiveSection key={objective.name} objective={objective} />)
          ) : (
            <p className="no-results">No hay indicadores que coincidan con la búsqueda.</p>
          )}
        </>
      )}
    </main>
  );
}
