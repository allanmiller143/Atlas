import type { Param, ParamValues } from './types.ts'

export function defaultsOf(params: Param[]): ParamValues {
  return Object.fromEntries(params.map((p) => [p.key, p.default]))
}

export const num = (values: ParamValues, key: string): number => Number(values[key])
export const str = (values: ParamValues, key: string): string => String(values[key])
