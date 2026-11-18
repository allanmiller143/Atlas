// Cores categóricas dos grupos/classes. Distinguíveis entre si e legíveis sobre fundo claro.
export const CLASS_COLORS = ['#2F6BFF', '#F28B30', '#14A58A', '#8B5CF6', '#E5487F', '#8A9A1B']

export const classColor = (i: number): string => CLASS_COLORS[((i % 6) + 6) % 6]

export function withAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}
