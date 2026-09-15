const UNITS = ['o', 'Ko', 'Mo', 'Go', 'To'];

export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return '—';
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 || value >= 100 ? 0 : 1;
  return `${value.toFixed(digits).replace('.', ',')} ${UNITS[unit]}`;
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** Timestamp Unix (secondes) ou date ISO → "14 sept. 2026, 18:40" */
export function formatDate(value) {
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFmt.format(date);
}

export function extension(name) {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(i + 1).toLowerCase() : '';
}
