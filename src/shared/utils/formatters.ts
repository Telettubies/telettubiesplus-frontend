/**
 * Formateadores de dominio de contratación pública colombiana (SECOP, SMMLV, porcentajes, numerales)
 */
export function formatSmmlv(value: number): string {
  return `${new Intl.NumberFormat('es-CO').format(value)} SMMLV`;
}

export function formatPercentage(ratioOrPercent: number, isRatio = false): string {
  const pct = isRatio ? Math.round(ratioOrPercent * 100) : Math.round(ratioOrPercent);
  return `${pct}%`;
}

export function formatNumeral(numeral: string): string {
  const clean = numeral.replace(/^numeral\s+/i, '').trim();
  return `Numeral ${clean}`;
}

export function formatDaysRemaining(days?: number): { text: string; isUrgent: boolean } {
  if (days === undefined || days === null) {
    return { text: 'Sin fecha límite', isUrgent: false };
  }
  return {
    text: `${days} días restantes`,
    isUrgent: days <= 15,
  };
}

