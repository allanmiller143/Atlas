import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Breadcrumbs, Button, Divider,
  Link, Slider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import { knowledgeId } from '../../core/knowledge.ts'
import { DataTable } from '../decision-tree/DecisionTreeLesson.tsx'
import { fruitExamples, trainingFruits, testingFruits, type FruitExample } from '../decision-tree/fruitExamples.ts'
import { averageLoss, encodeFruit, inputNames, predict, startWeights, trainBlock, type NetworkWeights } from './neuralDemoModel.ts'

const bodyText = { fontSize: { xs: 15.5, md: 17 }, lineHeight: 1.82, maxWidth: 800 }
const percent = (n: number) => `${(n * 100).toFixed(1).replace('.', ',')}%`
const decimal = (n: number) => n.toFixed(2).replace('.', ',')

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return <Box component="section" sx={{ borderTop: '1px solid', borderColor: 'divider', pt: { xs: 4, md: 5 }, mt: 5 }}>
    <Typography color="primary.main" fontSize={12} fontWeight={850} letterSpacing=".08em" sx={{ mb: 1.2 }}>{eyebrow}</Typography>
    <Typography component="h2" sx={{ fontSize: { xs: 26, md: 33 }, fontWeight: 850, letterSpacing: '-.04em', mb: 2 }}>{title}</Typography>
    {children}
  </Box>
}

function FruitIcon({ fruit }: { fruit: FruitExample }) {
  const colors: Record<FruitExample['color'], string> = {
    Vermelha: '#D65F67', Esverdeada: '#89B46E', Alaranjada: '#E8A448', Amarelada: '#E7C15E',
  }
  return <Box component="svg" viewBox="0 0 30 30" role="img" aria-label={`Fruta ${fruit.color.toLowerCase()} com casca ${fruit.skin.toLowerCase()}`} sx={{ width: 29, height: 29, flexShrink: 0 }}>
    <circle cx="15" cy="16" r="11" fill={colors[fruit.color]} stroke="#A6A6A6" strokeWidth=".5" />
    <path d="M15 5 L17 2" stroke="#5B7957" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 5 Q22 1 25 6 Q21 9 17 5" fill="#6B9B71" />
    {fruit.skin === 'Rugosa' && [[8, 12], [15, 10], [21, 16], [12, 21], [18, 23], [9, 17]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.2" fill="#FFF1D6" />)}
  </Box>
}


function NeuralConceptDiagram() {
  const inputs = [
    ['Cor vermelha', 50],
    ['Cor esverdeada', 91],
    ['Cor alaranjada', 132],
    ['Cor amarelada', 173],
    ['Casca lisa', 214],
  ] as const
  const hiddenYs = [88, 173]
  const concepts = [
    { title: 'Pesos', description: 'Indicam a influência de cada conexão.' },
    { title: 'Neurônios', description: 'Combinam entradas, bias e ativação.' },
    { title: 'Bias', description: 'Ajusta o cálculo de cada neurônio.' },
    { title: 'Treinamento', description: 'Ajusta pesos e bias para reduzir o erro.' },
  ]

  return <Box sx={{ bgcolor: '#F3F6FB', border: '1px solid #DEE7F1', p: { xs: 1.5, md: 2.2 }, mb: 3.2, minWidth: 0 }}>
    <Typography fontSize={12} fontWeight={850} color="primary.main" letterSpacing=".08em" sx={{ mb: 2 }}>VISÃO GERAL</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 205px' }, gap: 2.5, alignItems: 'start' }}>
      <Box sx={{ minWidth: 0 }}>
        <svg
          viewBox="0 0 650 255"
          role="img"
          aria-label="Diagrama de uma rede neural: cinco entradas conectadas por pesos a dois neurônios ocultos, que alimentam uma saída"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        >
          <g fontSize="13" fontWeight="800" textAnchor="middle" fill="#536B87">
            <text x="89" y="18">Entradas</text>
            <text x="332" y="18">Camada oculta</text>
            <text x="548" y="18">Saída</text>
          </g>
          <g fill="none" strokeLinecap="round">
            {inputs.flatMap(([, y], i) => hiddenYs.map((hy, j) =>
              <line key={`${i}-${j}`} x1="166" y1={y} x2="296" y2={hy} stroke="#8BAED9" strokeWidth="1.8" opacity="0.8" />
            ))}
            {hiddenYs.map((hy, i) =>
              <line key={i} x1="370" y1={hy} x2="476" y2="132" stroke="#74AE94" strokeWidth="2.3" />
            )}
          </g>
          <g fontSize="12" fontWeight="750" fill="#31567C">
            {inputs.map(([label, y]) => <g key={label}>
              <rect x="12" y={y - 16} width="154" height="32" rx="8" fill="#E9F2FF" stroke="#86A8D5" />
              <text x="89" y={y + 4} textAnchor="middle">{label}</text>
            </g>)}
          </g>
          <g>
            {hiddenYs.map((y, i) => <g key={i}>
              <circle cx="333" cy={y} r="36" fill="#EEF3FC" stroke="#8CA4C3" strokeWidth="2" />
              <text x="333" y={y - 3} fontSize="12" fontWeight="800" textAnchor="middle" fill="#31567C">Neurônio</text>
              <text x="333" y={y + 13} fontSize="11" textAnchor="middle" fill="#456A91">{i + 1}</text>
            </g>)}
          </g>
          <g>
            <rect x="476" y="92" width="161" height="80" rx="10" fill="#EAF5EF" stroke="#8DB9A0" />
            <text x="556" y="115" textAnchor="middle" fontSize="12" fontWeight="800" fill="#42605A">Previsão</text>
            <text x="556" y="138" textAnchor="middle" fontSize="15" fontWeight="800" fill="#42605A">Chance de maçã</text>
            <text x="556" y="157" textAnchor="middle" fontSize="11" fill="#42605A">Saída da rede</text>
          </g>
          <text x="232" y="242" textAnchor="middle" fontSize="12" fill="#60738A">Conexões com pesos aprendidos</text>
        </svg>
        <Typography sx={{ fontSize: 13, lineHeight: 1.65, color: 'text.secondary', mt: 1 }}>
          As entradas levam os sinais; os neurônios ocultos fazem as combinações; a saída produz a previsão.
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gap: 1.1, gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(2, minmax(0, 1fr))', md: 'minmax(0, 1fr)' }, minWidth: 0 }}>
        {concepts.map(concept => <Box key={concept.title} sx={{ bgcolor: '#FFF', border: '1px solid #DCE5F0', borderRadius: 1.5, px: 1.6, py: 1.25, minWidth: 0 }}>
          <Typography fontSize={13} fontWeight={850} color="primary.dark" sx={{ mb: .25 }}>{concept.title}</Typography>
          <Typography fontSize={12.5} lineHeight={1.55} color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{concept.description}</Typography>
        </Box>)}
      </Box>
    </Box>
  </Box>
}

function NetworkSketch({ fruit, weights, phase }: { fruit: FruitExample; weights: NetworkWeights; phase: 'input' | 'hidden' | 'output' }) {
  const result = predict(weights, fruit)
  const ys = [43, 88, 133, 178, 223]
  const neuronY = [90, 185]
  const showHidden = phase !== 'input'
  const showOutput = phase === 'output'
  return <Box sx={{ width: '100%', maxWidth: 780, mx: 'auto' }}>
    <svg viewBox="0 0 760 275" role="img" aria-label="Cinco entradas, dois neurônios em uma camada oculta e uma saída de classificação" style={{ display: 'block', width: '100%', height: 'auto' }}>
      <g fill="none" strokeLinecap="round">
        {showHidden && ys.flatMap((y, i) => neuronY.map((hy, j) => <path key={`${i}-${j}`} d={`M168 ${y} L340 ${hy}`} stroke='#5E8DBE' strokeWidth={result.inputs[i] ? 2 : 1} opacity={result.inputs[i] ? .9 : .35} />))}
        {showOutput && neuronY.map(y => <path key={y} d={`M422 ${y} L587 135`} stroke='#38896B' strokeWidth='2.7' />)}
      </g>
      {ys.map((y, i) => <g key={i}>
        <rect x="12" y={y - 17} width="156" height="34" rx="7" fill={result.inputs[i] ? '#E8F2FF' : '#F3F5F8'} stroke={result.inputs[i] ? '#7FA6D2' : '#DCE3EC'} />
        <text x="24" y={y + 4} fontSize="13" fill="#2E4B6C" fontWeight="700">{inputNames[i]}</text>
        <text x="154" y={y + 4} fontSize="13" textAnchor="end" fill="#2E4B6C">{result.inputs[i]}</text>
      </g>)}
      {showHidden && neuronY.map((y, j) => <g key={j}>
        <circle cx="381" cy={y} r="39" fill="#EAF0F9" stroke="#91A9C6" strokeWidth="1.7" />
        <text x="381" y={y - 5} textAnchor="middle" fontSize="12.5" fontWeight="800" fill="#355778">Neurônio {j + 1}</text>
        <text x="381" y={y + 15} textAnchor="middle" fontSize="13" fill="#355778">{decimal(result.hidden[j])}</text>
      </g>)}
      <rect x="587" y="93" width="160" height="85" rx="9" fill={showOutput ? (result.probability >= .5 ? '#EAF5EF' : '#FFF2E7') : '#F1F4F8'} stroke={showOutput ? (result.probability >= .5 ? '#8BBFA3' : '#E6BA8A') : '#D6E1ED'} />
      <text x="667" y="115" textAnchor="middle" fontSize="12" fontWeight="700" fill="#536479">Saída</text>
      <text x="667" y="144" textAnchor="middle" fontSize="24" fontWeight="800" fill={showOutput ? (result.probability >= .5 ? '#2B7952' : '#A96730') : '#8C99A8'}>{showOutput ? percent(result.probability) : '—'}</text>
      <text x="667" y="164" textAnchor="middle" fontSize="12" fill="#536479">{showOutput ? (result.probability >= .5 ? 'Prevê maçã' : 'Prevê laranja') : 'Ainda não calculada'}</text>
      <g textAnchor="middle" fontSize="12" fontWeight="800" fill="#60738A">
        <text x="85" y="265">Entradas</text>
        <text x="381" y="265">Camada oculta</text>
        <text x="667" y="265">Saída</text>
      </g>
    </svg>
  </Box>
}

const chapters = [
  {
    title: 'Primeiro, olhamos os exemplos',
    explanation: 'Temos frutas com características diferentes. Como em outras aulas do Atlas, sabemos quais são maçãs e quais são laranjas. Ainda não treinamos nenhuma rede.',
    watch: 'Cor e casca são características; o nome da fruta é a resposta que queremos aprender.',
  },
  {
    title: 'Reservamos algumas frutas para o teste',
    explanation: 'Oito frutas serão usadas para aprender. As outras duas ficam guardadas para testar depois, sem influenciar o ajuste dos pesos.',
    watch: 'É a mesma divisão de treino e teste da Decision Tree: oito exemplos para aprender e dois para conferir.',
  },
  {
    title: 'As características entram na rede',
    explanation: 'Cada fruta vira números. As quatro cores possíveis têm entradas próprias, e a textura tem mais uma entrada. A rede ainda não está respondendo: estamos apenas mostrando o que ela recebe.',
    watch: 'A cor não vira um número que vale “mais” ou “menos”: ativamos apenas a entrada correspondente à cor observada.',
  },
  {
    title: 'Os neurônios ocultos combinam as pistas',
    explanation: 'Cada conexão tem um peso. A rede combina os sinais usando esses pesos, produzindo novos valores dentro da camada oculta. É aqui que ela cria uma representação intermediária, não uma resposta pronta.',
    watch: 'Os dois neurônios recebem as mesmas entradas, mas possuem pesos diferentes e, por isso, podem produzir valores diferentes.',
  },
  {
    title: 'A saída faz uma previsão',
    explanation: 'A saída reúne os valores produzidos pelos neurônios ocultos e estima a chance de ser maçã. Os pesos começam com valores iniciais, então a previsão ainda pode estar ruim.',
    watch: 'A previsão aparece aqui. Ela não é a resposta verdadeira: ainda precisamos treinar a rede.',
  },
  {
    title: 'A rede ajusta os pesos durante o treinamento',
    explanation: 'Agora mostramos as respostas de treino e fazemos vários ajustes. A rede calcula o erro e altera suas conexões para tentar errar menos no conjunto de treino. Clique para acompanhar a previsão mudar.',
    watch: 'As frutas permanecem iguais. São os pesos dentro da rede que mudam. Treino não garante que ela acerte as duas frutas reservadas.',
  },
]

const nextTopics = [
  { name: 'MLP', id: 'rede-neural-mlp', description: 'Camadas densas e retropropagação.' },
  { name: 'CNN', id: 'cnn', description: 'Filtros que identificam padrões em imagens.' },
  { name: 'LSTM', id: 'lstm', description: 'Redes que lidam com sequências.' },
  { name: 'Transformer', id: 'transformer', description: 'Atenção entre partes dos dados.' },
  { name: 'SOM', id: 'som', description: 'Organização de padrões por similaridade.' },
]

export default function NeuralNetworksChapter() {
  const [step, setStep] = useState(0)
  const [fruitIndex, setFruitIndex] = useState(0)
  const [weights, setWeights] = useState<NetworkWeights>(startWeights)
  const [learningRate, setLearningRate] = useState(.25)
  const [epochs, setEpochs] = useState(0)
  const [lastTraining, setLastTraining] = useState<null | { before: number; after: number; lossBefore: number; lossAfter: number }>(null)
  const fruitOptions = [trainingFruits[2], trainingFruits[1]]
  const fruit = fruitOptions[fruitIndex]
  const output = predict(weights, fruit)

  function train() {
    const before = output.probability
    const lossBefore = averageLoss(weights, trainingFruits)
    const next = trainBlock(weights, trainingFruits, learningRate, 10)
    setWeights(next)
    setEpochs(current => current + 10)
    setLastTraining({ before, after: predict(next, fruit).probability, lossBefore, lossAfter: averageLoss(next, trainingFruits) })
  }
  function reset() {
    setWeights(startWeights)
    setEpochs(0)
    setLastTraining(null)
  }

  return <Box sx={{ maxWidth: 960, mx: 'auto', pb: 9, minWidth: 0 }}>
    <Breadcrumbs sx={{ mb: 1.5 }}>
      <Link component={RouterLink} underline="hover" color="inherit" to={`/conceito/${knowledgeId('area', 'Aprendizado de máquina')}`}>Aprendizado de máquina</Link>
      <Typography color="text.primary">Redes neurais</Typography>
    </Breadcrumbs>
    <Typography component="h1" sx={{ fontSize: { xs: 34, md: 46 }, fontWeight: 900, letterSpacing: '-.05em', lineHeight: 1.12, mb: 2 }}>Redes neurais</Typography>
    <Typography sx={{ ...bodyText, mb: 2 }}>
      Uma rede neural recebe informações, combina esses sinais e tenta encontrar padrões. No começo, ela não sabe
      {' '}quais características importam mais. <strong>Ela aprende ajustando os pesos das conexões</strong> ao comparar suas previsões com exemplos conhecidos.
    </Typography>
    <NeuralConceptDiagram />
    <Box sx={{ borderLeft: '3px solid #5F88C6', pl: 2, my: 3 }}>
      <Typography fontWeight={850} sx={{ mb: .5 }}>Em outras palavras</Typography>
      <Typography sx={{ ...bodyText, fontSize: 15.5 }}>As entradas trazem os dados; as camadas ocultas fazem combinações; a saída apresenta um resultado. Treinar significa melhorar essas combinações aos poucos.</Typography>
    </Box>

    <Section eyebrow="UMA AULA INTERATIVA" title="Como uma rede transforma dados em uma previsão">
      <Typography sx={{ ...bodyText, mb: 2.5 }}>Vamos acompanhar uma rede pequena: cinco entradas, uma camada oculta com dois neurônios e uma saída. É apenas um exemplo para entender a ideia — não uma arquitetura ideal para classificar frutas.</Typography>
      <Box sx={{ bgcolor: '#F3F6FB', border: '1px solid #DEE7F1', p: { xs: 2, sm: 3 }, minWidth: 0 }}>
        <Stack direction="row" gap={.7} flexWrap="wrap" sx={{ mb: 2 }}>
          {chapters.map((_, i) => <Button key={i} size="small" variant={step === i ? 'contained' : 'outlined'} onClick={() => setStep(i)} sx={{ minWidth: 38, fontWeight: 800 }}>{i + 1}</Button>)}
        </Stack>
        <Typography fontSize={12} color="text.secondary" fontWeight={850}>ETAPA {step + 1} DE {chapters.length}</Typography>
        <Typography component="h3" sx={{ fontSize: { xs: 21, md: 25 }, fontWeight: 850, mt: .5 }}>{chapters[step].title}</Typography>
        <Typography sx={{ ...bodyText, fontSize: 15.5, mt: 1, mb: 2.5 }}>{chapters[step].explanation}</Typography>

        {step === 0 && <Box sx={{ minWidth: 0 }}><Typography fontWeight={800} sx={{ mb: 1 }}>Conjunto completo · 10 frutas</Typography><DataTable items={fruitExamples} /></Box>}
        {step === 1 && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'minmax(0,1.15fr) minmax(0,1fr)' }, gap: 2 }}>
          <Box sx={{ minWidth: 0 }}><Typography fontWeight={800} sx={{ mb: 1 }}>Treino · 8 frutas</Typography><DataTable items={trainingFruits} /></Box>
          <Box sx={{ minWidth: 0 }}><Typography fontWeight={800} sx={{ mb: 1 }}>Teste · 2 frutas</Typography><DataTable items={testingFruits} hideAnswer /></Box>
        </Box>}
        {step >= 2 && <Box>
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
            {fruitOptions.map((item, i) => <Button key={item.id} variant={fruitIndex === i ? 'contained' : 'outlined'} size="small" onClick={() => { setFruitIndex(i); setLastTraining(null) }} sx={{ textTransform: 'none', py: .7 }}>
              <Stack direction="row" alignItems="center" gap={1} textAlign="left"><FruitIcon fruit={item} /><Box><Typography fontSize={13} fontWeight={850}>{item.label} #{item.id}</Typography><Typography fontSize={11.5} color={fruitIndex === i ? 'inherit' : 'text.secondary'} sx={fruitIndex === i ? { opacity: .85 } : undefined}>{item.color.toLowerCase()} · {item.skin.toLowerCase()}</Typography></Box></Stack>
            </Button>)}
          </Stack>
          <Box sx={{ bgcolor: 'white', border: '1px solid #DEE7F1', p: { xs: 1, sm: 2 }, minWidth: 0 }}>
            <NetworkSketch fruit={fruit} weights={weights} phase={step === 2 ? 'input' : step === 3 ? 'hidden' : 'output'} />
          </Box>
          {step === 2 && <Typography sx={{ fontSize: 14.5, mt: 1.5, lineHeight: 1.7 }}>Cor: <strong>{fruit.color.toLowerCase()}</strong> → [{[0, 1, 2, 3].map(i => encodeFruit(fruit)[i]).join(', ')}]. Casca lisa → {encodeFruit(fruit)[4]}. Cada cor tem sua própria entrada; não criamos uma ordem artificial entre as cores.</Typography>}
          {step === 3 && <Typography sx={{ fontSize: 14.5, mt: 1.5, lineHeight: 1.7 }}>Observe os dois valores internos ({decimal(predict(weights, fruit).hidden[0])} e {decimal(predict(weights, fruit).hidden[1])}). Eles surgem de combinações diferentes dos sinais; ainda não são a classificação.</Typography>}
          {step === 4 && <Typography sx={{ fontSize: 14.5, mt: 1.5, lineHeight: 1.7 }}>A saída recebe os valores da camada oculta e estima <strong>{percent(output.probability)}</strong> de chance de maçã. A previsão atual é <strong>{output.probability >= .5 ? 'Maçã' : 'Laranja'}</strong>.</Typography>}
          {step === 5 && <Box sx={{ mt: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2}>
              <Box sx={{ width: { xs: '100%', sm: 210 } }}><Typography fontSize={13} fontWeight={750}>learning_rate: {decimal(learningRate)}</Typography><Slider size="small" value={learningRate} min={.05} max={.7} step={.05} onChange={(_, value) => setLearningRate(value as number)} valueLabelDisplay="auto" /></Box>
              <Stack direction="row" gap={1} flexWrap="wrap"><Button variant="contained" onClick={train}>Treinar 10 épocas</Button><Button startIcon={<RestartAltRoundedIcon />} onClick={reset}>Restaurar</Button></Stack>
            </Stack>
            <Typography fontSize={13.5} color="text.secondary" sx={{ mt: .3 }}>Épocas realizadas: {epochs}. Uma época significa passar pelos oito exemplos de treino.</Typography>
            {lastTraining && <Box sx={{ mt: 1.5, borderLeft: '3px solid #5F88C6', pl: 2 }}>
              <Typography fontWeight={800}>O que mudou após 10 épocas?</Typography>
              <Typography fontSize={14}>Chance de maçã para a fruta escolhida: {percent(lastTraining.before)} → <strong>{percent(lastTraining.after)}</strong>.</Typography>
              <Typography fontSize={14}>Erro médio no treino: {decimal(lastTraining.lossBefore)} → <strong>{decimal(lastTraining.lossAfter)}</strong> (menor é melhor).</Typography>
            </Box>}
          </Box>}
        </Box>}
        <Box sx={{ mt: 2.5, borderTop: '1px solid #D8E2F0', pt: 1.5 }}>
          <Typography color="primary.main" fontSize={12} fontWeight={850}>O QUE OBSERVAR</Typography>
          <Typography sx={{ fontSize: 14.5, lineHeight: 1.7, mt: .5 }}>{chapters[step].watch}</Typography>
        </Box>
        <Stack direction="row" justifyContent="space-between" gap={1} sx={{ mt: 2.5 }}>
          <Button startIcon={<ArrowBackRoundedIcon />} disabled={step === 0} onClick={() => setStep(s => s - 1)}>Anterior</Button>
          <Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={() => setStep(s => s === chapters.length - 1 ? 0 : s + 1)}>{step === chapters.length - 1 ? 'Recomeçar aula' : 'Próxima etapa'}</Button>
        </Stack>
      </Box>
      <Accordion disableGutters elevation={0} sx={{ mt: 2, border: '1px solid #DEE7F1', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}><Typography fontWeight={800}>Quero entender as contas (opcional)</Typography></AccordionSummary>
        <AccordionDetails>
          <Typography fontSize={14.5} lineHeight={1.8}>Cada neurônio soma <strong>entrada × peso</strong> para todas as suas conexões, adiciona um <strong>bias</strong> e aplica uma função de ativação. A camada de saída combina os valores ocultos para produzir a probabilidade.</Typography>
          <Typography fontSize={14.5} lineHeight={1.8} sx={{ mt: 1 }}>Durante o treino, calculamos a diferença entre a probabilidade prevista e a resposta conhecida. A <strong>retropropagação</strong> indica como alterar os pesos da saída e da camada oculta para reduzir esse erro.</Typography>
        </AccordionDetails>
      </Accordion>
    </Section>

    <Section eyebrow="PARÂMETROS" title="O que pode ser ajustado?">
      <Typography sx={{ ...bodyText, mb: 2 }}>Estes são os principais parâmetros e conceitos por trás do exemplo:</Typography>
      <Box sx={{ bgcolor: '#FFF', border: '1px solid #DEE7F1', p: 1.2, overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 540, '& .MuiTableCell-root': { py: 1.4, px: { xs: 1, sm: 1.5 }, verticalAlign: 'top' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 850 }}>Parâmetro</TableCell>
              <TableCell sx={{ fontWeight: 850 }}>O que significa</TableCell>
              <TableCell sx={{ fontWeight: 850 }}>Nesta aula</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              ['Pesos (weights)', 'Definem quanto cada conexão influencia o próximo neurônio.', 'São ajustados durante o treinamento.'],
              ['Bias', 'Desloca o cálculo de um neurônio, além do efeito das entradas.', 'Ajuda a rede a não depender só da soma das entradas.'],
              ['learning_rate', 'Controla o tamanho do ajuste feito a cada atualização.', 'Você altera esse valor no último passo da aula.'],
              ['Épocas (epochs)', 'Indicam quantas vezes a rede percorre o conjunto de treino.', 'O botão de treino executa 10 épocas por vez.'],
              ['Camada oculta', 'É a parte da rede que combina os sinais e cria representações internas.', 'Usamos 2 neurônios para manter a visualização simples.'],
            ].map(([name, meaning, here]) => <TableRow key={String(name)}><TableCell sx={{ fontWeight: 800, width: '26%' }}>{name}</TableCell><TableCell sx={{ lineHeight: 1.72 }}>{meaning}</TableCell><TableCell sx={{ lineHeight: 1.72 }}>{here}</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </Box>
    </Section>

    <Section eyebrow="PARA CONTINUAR" title="Quais redes estudar depois?">
      <Typography sx={{ ...bodyText, mb: 2 }}>A ideia de aprender pesos aparece em muitas redes. O que muda é como cada arquitetura organiza e combina as informações.</Typography>
      <Stack direction="row" gap={1} flexWrap="wrap">{nextTopics.map(topic => <Button key={topic.id} component={RouterLink} to={`/tecnica/${topic.id}`} variant="outlined" size="small" sx={{ textTransform: 'none' }}>{topic.name}</Button>)}</Stack>
      <Typography fontSize={14} color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7 }}>Comece pela <strong>MLP</strong> para aprofundar camadas, propagação e retropropagação.</Typography>
    </Section>
    <Divider sx={{ mt: 5, mb: 2 }} />
    <Button component={RouterLink} to="/tecnica/rede-neural-mlp" variant="contained" endIcon={<ArrowForwardRoundedIcon />}>Próximo: MLP</Button>
  </Box>
}
