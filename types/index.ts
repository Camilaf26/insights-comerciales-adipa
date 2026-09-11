export interface Insights {
  objeciones: string[]
  requerimientos: string[]
  vocabulario: string[]
}

export type Screen = 'ingreso' | 'carga' | 'revision' | 'exito'
export type InputMode = 'text' | 'file' | 'gdocs'
