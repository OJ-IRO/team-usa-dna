// Display helpers for height (cm ↔ ft/in) and weight (kg ↔ lb).
// All internal storage stays in metric — these only format outputs for US fans.

export function cmToFeetInches(cm: number): { ft: number; in: number; label: string } {
  const totalInches = cm / 2.54;
  let ft = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - ft * 12);
  if (inches === 12) {
    ft += 1;
    inches = 0;
  }
  return { ft, in: inches, label: `${ft}'${inches}"` };
}

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.2046226218);
}

export function formatHeight(cm: number | null | undefined): string {
  if (cm == null) return "—";
  return `${cmToFeetInches(cm).label} · ${cm} cm`;
}

export function formatWeight(kg: number | null | undefined): string {
  if (kg == null) return "—";
  return `${kgToLb(kg)} lb · ${kg} kg`;
}

// Compact variants for tight UI cells.
export function formatHeightShort(cm: number | null | undefined): string {
  if (cm == null) return "—";
  return cmToFeetInches(cm).label;
}

export function formatWeightShort(kg: number | null | undefined): string {
  if (kg == null) return "—";
  return `${kgToLb(kg)} lb`;
}
