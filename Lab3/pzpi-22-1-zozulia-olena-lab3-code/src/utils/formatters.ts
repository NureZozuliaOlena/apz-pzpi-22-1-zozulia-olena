import i18n from '../i18n';

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';

  const lang = i18n.language;

  if (lang === 'en') {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } else {
    return date.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
};

export const formatTemperature = (temp?: number): string => {
  if (temp === undefined || temp === null) return '-';
  const lang = i18n.language;

  if (lang === 'en') {
    const f = temp * 9/5 + 32;
    return `${f.toFixed(1)} °F`;
  } else {
    return `${temp.toFixed(1)} °C`;
  }
};
