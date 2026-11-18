import { useEffect, useState } from 'react'

/** Anotação pessoal por técnica, guardada no navegador. */
export function useNote(id: string): [string, (v: string) => void] {
  const key = `atlas:nota:${id}`
  const [text, setText] = useState('')

  useEffect(() => {
    try {
      setText(localStorage.getItem(key) ?? '')
    } catch {
      setText('')
    }
  }, [key])

  const save = (v: string) => {
    setText(v)
    try {
      localStorage.setItem(key, v)
    } catch {
      /* sem armazenamento: a nota vale só nesta sessão */
    }
  }
  return [text, save]
}
