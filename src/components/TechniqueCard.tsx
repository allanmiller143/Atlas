import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useCompare } from '../state/compare.tsx'
import type { Technique } from '../core/types.ts'
import { EXPLAIN_LABEL, LEARNING_LABEL, OUTPUT_LABEL } from '../core/taxonomy.ts'

export function TechniqueCard({ t }: { t: Technique }) {
  const ready = t.status === 'ready'
  const { ids, add } = useCompare()
  const inCompare = ids.includes(t.id)
  return <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform .2s,border-color .2s', '&:hover': { transform: 'translateY(-3px)', borderColor: 'primary.light' } }}>
    <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1, gap: 1.4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Chip size="small" label={t.hierarchy.family} sx={{ bgcolor: '#F2F3F8', maxWidth: '78%' }} />
        <Chip size="small" color={ready ? 'success' : 'default'} variant="outlined" label={ready ? 'Interativa' : 'Em breve'} />
      </Stack>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" fontWeight={750} sx={{ mt: 1 }}>{t.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: .8, lineHeight: 1.65 }}>{t.summary}</Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">{t.hierarchy.area} · {t.hierarchy.concept}</Typography>
      <Stack direction="row" flexWrap="wrap" gap={.7}>
        {t.traits.learning.slice(0, 1).map(l => <Chip key={l} size="small" variant="outlined" label={LEARNING_LABEL[l]} />)}
        {t.traits.output.slice(0, 1).map(o => <Chip key={o} size="small" variant="outlined" label={OUTPUT_LABEL[o]} />)}
        <Chip size="small" variant="outlined" label={EXPLAIN_LABEL[t.traits.explainability]} />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
        {ready ? <>
          <Button component={RouterLink} to={`/tecnica/${t.id}`} endIcon={<ArrowOutwardRoundedIcon />} variant="contained" fullWidth>Estudar técnica</Button>
          <Button aria-label="Adicionar à comparação" title="Adicionar à comparação" disabled={inCompare} onClick={() => add(t.id)} variant="outlined"><AddRoundedIcon /></Button>
        </> : <Button fullWidth component={RouterLink} to={`/tecnica/${t.id}`} variant="outlined">Ver introdução</Button>}
      </Stack>
    </CardContent>
  </Card>
}
