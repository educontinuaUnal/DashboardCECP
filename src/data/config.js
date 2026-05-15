export const googleSheetUrl =
  import.meta.env?.VITE_GOOGLE_SHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSg39tjFlLiqkdZPC07c6sapUEjJXL2I77KaX8ubsiCbEQIz0TQLaIT6AtPg8XU-sYRKRi1EqszxNWE/pub?gid=1802520333&single=true&output=csv';

export const lookerStudioUrl =
  'https://lookerstudio.google.com/embed/reporting/eced3bb4-5c58-4246-aff2-4256077757bd/page/DCWcF';

export const objectiveThemes = {
  'Gestión Eficiente': {
    accent: '#4f46e5',
    soft: '#eef2ff',
    text: '#3730a3'
  },
  'Oferta Pertinente': {
    accent: '#059669',
    soft: '#ecfdf5',
    text: '#047857'
  },
  'Articulación Institucional': {
    accent: '#e11d48',
    soft: '#fff1f2',
    text: '#be123c'
  },
  Posicionamiento: {
    accent: '#0284c7',
    soft: '#f0f9ff',
    text: '#0369a1'
  },
  'Gestión Financiera': {
    accent: '#d97706',
    soft: '#fffbeb',
    text: '#b45309'
  },
  General: {
    accent: '#4b5563',
    soft: '#f3f4f6',
    text: '#374151'
  }
};
