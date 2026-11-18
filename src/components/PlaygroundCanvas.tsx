import { useEffect, useMemo, useRef, useState } from 'react'
import { Box } from '@mui/material'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { Dataset, Model, Point } from '../core/types.ts'
import { classColor, withAlpha } from '../core/colors.ts'

const RES = 56 // células por lado no mapa de regiões
const HIT_PX = 12 // raio de captura de um ponto

interface Props {
  data: Dataset
  model: Model | null
  supervised: boolean
  /** Classe usada ao clicar num espaço vazio. */
  brush: number
  onPointsChange?: (points: Point[]) => void
}

const clamp = (v: number) => Math.min(0.99, Math.max(0.01, v))

export function PlaygroundCanvas({ data, model, supervised, brush, onPointsChange }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const dragging = useRef<number | null>(null)
  const [size, setSize] = useState(0)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize(el.clientWidth))
    ro.observe(el)
    setSize(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Classe prevista em cada célula do plano (o "mapa de decisão").
  const cells = useMemo(() => {
    if (!model) return null
    const arr = new Int16Array(RES * RES)
    for (let gy = 0; gy < RES; gy++) {
      for (let gx = 0; gx < RES; gx++) {
        arr[gy * RES + gx] = model.predict((gx + 0.5) / RES, 1 - (gy + 0.5) / RES)
      }
    }
    return arr
  }, [model])

  useEffect(() => {
    const c = canvas.current
    if (!c || !size) return
    const dpr = window.devicePixelRatio || 1
    c.width = Math.round(size * dpr)
    c.height = Math.round(size * dpr)
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)

    if (cells) {
      const cell = size / RES
      for (let gy = 0; gy < RES; gy++) {
        for (let gx = 0; gx < RES; gx++) {
          ctx.fillStyle = withAlpha(classColor(cells[gy * RES + gx]), 0.17)
          ctx.fillRect(gx * cell, gy * cell, cell + 0.6, cell + 0.6)
        }
      }
    }

    for (const o of model?.overlays ?? []) {
      const color = classColor(o.cls)
      if (o.kind === 'rect') {
        const x = o.x0 * size
        const y = (1 - o.y1) * size
        const w = Math.max((o.x1 - o.x0) * size, 1)
        const h = Math.max((o.y1 - o.y0) * size, 1)
        ctx.fillStyle = withAlpha(color, 0.1)
        ctx.fillRect(x, y, w, h)
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.strokeRect(x, y, w, h)
      } else {
        ctx.beginPath()
        ctx.arc(o.x * size, (1 - o.y) * size, 9, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
        ctx.lineWidth = 3.5
        ctx.strokeStyle = color
        ctx.stroke()
      }
    }

    for (const p of data.points) {
      const cx = p.x * size
      const cy = (1 - p.y) * size
      const predicted = model ? model.predict(p.x, p.y) : p.label
      const fill = supervised ? classColor(p.label) : model ? classColor(predicted) : '#8a96a3'
      ctx.beginPath()
      ctx.arc(cx, cy, 4.6, 0, Math.PI * 2)
      ctx.fillStyle = fill
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.strokeStyle = '#fff'
      ctx.stroke()
      if (supervised && model && predicted !== p.label) {
        // anel escuro nos pontos que o modelo errou
        ctx.beginPath()
        ctx.arc(cx, cy, 8, 0, Math.PI * 2)
        ctx.lineWidth = 1.6
        ctx.strokeStyle = '#14202B'
        ctx.stroke()
      }
    }
  }, [size, cells, model, data, supervised])

  const toDomain = (e: ReactPointerEvent | { clientX: number; clientY: number }) => {
    const r = canvas.current!.getBoundingClientRect()
    return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height }
  }

  const nearest = (x: number, y: number): number => {
    let best = -1
    let bestD = HIT_PX
    data.points.forEach((p, i) => {
      const d = Math.hypot((p.x - x) * size, (p.y - y) * size)
      if (d <= bestD) {
        bestD = d
        best = i
      }
    })
    return best
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!onPointsChange || !size) return
    const { x, y } = toDomain(e)
    const hit = nearest(x, y)
    if (hit >= 0) {
      dragging.current = hit
      e.currentTarget.setPointerCapture(e.pointerId)
    } else {
      onPointsChange([...data.points, { x: clamp(x), y: clamp(y), label: brush }])
    }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const i = dragging.current
    if (i === null || !onPointsChange) return
    const { x, y } = toDomain(e)
    const next = data.points.slice()
    next[i] = { ...next[i], x: clamp(x), y: clamp(y) }
    onPointsChange(next)
  }

  const endDrag = () => {
    dragging.current = null
  }

  const onDoubleClick = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!onPointsChange) return
    const { x, y } = toDomain(e)
    const hit = nearest(x, y)
    if (hit >= 0) onPointsChange(data.points.filter((_, i) => i !== hit))
  }

  return (
    <Box ref={wrap} sx={{ width:'100%', maxWidth:680, aspectRatio:'1', mx:'auto', borderRadius:3, bgcolor:'#F8FAFD', border:'1px solid', borderColor:'divider', overflow:'hidden' }}>
      <canvas
        ref={canvas}
        style={{ width: size, height: size, display:'block', touchAction:'none', cursor:onPointsChange?'crosshair':'default' }}
        role="img"
        aria-label="Gráfico com os pontos e as regiões que a técnica atribui a cada classe"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={onDoubleClick}
      />
    </Box>
  )
}
