export const DEFAULT_MINIMUM_ORDER = 24;
export const orderStatuses = ["pendente", "pago", "enviado", "entregue", "cancelado"] as const;
export function meetsMinimumOrder(total: number, minimum: number) {
  return Number.isFinite(total) && total >= minimum;
}
export function isTripleClick(clicks: number) { return clicks === 3; }