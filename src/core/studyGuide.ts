import { KNOWLEDGE, type KnowledgeNode } from './knowledge.ts'
import { ALL } from '../techniques/registry.ts'
import type { Technique } from './types.ts'

/** Uma trilha de estudo é uma ordem de leitura, não a árvore técnica da taxonomia. */
const chapterNames = [
  'Aprendizado de máquina',
  'Aprendizado supervisionado',
  'Aprendizado não supervisionado',
  'Modelos baseados em árvores',
  'Redes neurais',
  'Agrupamento',
]
export const studyChapters: KnowledgeNode[] = chapterNames
  .map(name => KNOWLEDGE.find(node => node.name === name))
  .filter((node): node is KnowledgeNode => Boolean(node))
export const chapterIndex = (id: string) => studyChapters.findIndex(node => node.id === id)
export const chapterAround = (id: string) => {
  const index = chapterIndex(id)
  return { previous: index > 0 ? studyChapters[index - 1] : undefined, next: index >= 0 ? studyChapters[index + 1] : undefined }
}
export const nodeNamed = (name: string) => KNOWLEDGE.find(node => node.name === name)

/** Um modelo pode aparecer em vários caminhos de leitura sem duplicar seu cadastro. */
export function relevantTechniques(node: KnowledgeNode): Technique[] {
  switch (node.name) {
    case 'Aprendizado de máquina': return ALL.filter(t => t.hierarchy.area === node.name)
    case 'Aprendizado supervisionado': return ALL.filter(t => t.traits.learning.includes('supervised'))
    case 'Aprendizado não supervisionado': return ALL.filter(t => t.traits.learning.includes('unsupervised'))
    case 'Redes neurais': return ALL.filter(t => t.hierarchy.concept === 'Redes neurais' || t.compareGroups.includes('Redes neurais'))
    case 'Modelos baseados em árvores':
      return ALL.filter(t => t.hierarchy.family === 'Modelos baseados em árvores')
    case 'Agrupamento': return ALL.filter(t => t.compareGroups.includes('Agrupamento'))
    default:
      return ALL.filter(t => t.hierarchy.family === node.name || t.hierarchy.concept === node.name || t.hierarchy.area === node.name)
  }
}

export interface EasyLesson {
  subtitle: string
  opening: string[]
  question: string
  answer: string
  commonExample: string
  insight: string
  illustration: 'overview' | 'supervised' | 'unsupervised' | 'tree' | 'neural' | 'clusters'
  steps: { title: string; description: string }[]
  sectionTitle: string
}

/**
 * Todos os exemplos principais partem da MESMA situação: uma feira com maçãs e laranjas.
 * Os exemplos são deliberadamente simplificados. Cor e textura não identificam todas as frutas reais.
 */
export const easyLessons: Record<string, EasyLesson> = {
  'Aprendizado de máquina': {
    subtitle: 'Como um computador pode descobrir padrões olhando exemplos?',
    opening: [
      'Imagine que você está ajudando a organizar frutas em uma feira. Depois de observar várias maçãs e laranjas, você começa a perceber algumas pistas: a cor, a textura da casca e o tamanho.',
      'Agora imagine ensinar um computador a observar essas pistas. Em vez de escrever uma regra para cada fruta possível, você entrega exemplos e deixa um algoritmo procurar uma maneira de usá-los. Isso é a ideia central do aprendizado de máquina, ou Machine Learning (ML).',
      'O resultado é um modelo: algo que usa o que encontrou nos dados para fazer uma previsão ou mostrar um padrão. Ele não pensa como uma pessoa; trabalha com números e relações que podem ser úteis — ou falhar.'
    ],
    question: 'Mas o computador sabe o que é uma maçã?',
    answer: 'Não. Para ele, uma fruta pode começar como números: cor, textura e peso. É com essas informações, chamadas características, que o modelo trabalha. Uma das nossas tarefas é escolher características que realmente ajudam.',
    commonExample: 'Vamos usar a mesma banca de frutas ao longo do curso. Em alguns capítulos o computador recebe o nome de cada fruta; em outros, recebe apenas suas características. É isso que muda o tipo de aprendizado.',
    insight: 'Aprendizado de máquina não é uma técnica única. É uma área com diferentes maneiras de aprender a partir de dados.',
    illustration: 'overview',
    sectionTitle: 'Primeiro, veja o que o computador recebe',
    steps: [
      { title: 'Observar', description: 'Reunimos frutas e descrevemos cada uma usando características como cor e textura.' },
      { title: 'Aprender', description: 'Um algoritmo procura relações nessas características. Dependendo do problema, ele pode receber também as respostas corretas.' },
      { title: 'Usar', description: 'Com o modelo construído, tentamos classificar outra fruta ou compreender melhor como as frutas se agrupam.' },
    ],
  },
  'Aprendizado supervisionado': {
    subtitle: 'Aprender com exemplos que já vêm com a resposta.',
    opening: [
      'Volte à feira. Desta vez, cada fruta que mostramos ao computador vem com uma etiqueta: “maçã” ou “laranja”. Assim, ele tem exemplos e também sabe a resposta de cada exemplo.',
      'O algoritmo tenta encontrar uma relação entre as pistas da fruta e sua etiqueta. Depois, recebe uma fruta nova, sem etiqueta, e tenta adivinhar de qual tipo ela é.',
      'Chamamos isso de aprendizado supervisionado. A “supervisão” é o conjunto de respostas conhecidas durante o treinamento. Não significa que uma pessoa precise acompanhar cada cálculo.'
    ],
    question: 'E se eu quiser prever um número, não um nome?',
    answer: 'Também é supervisionado. Se a resposta é uma categoria, como maçã ou laranja, chamamos de classificação. Se é um número, como o preço ou o peso estimado, chamamos de regressão.',
    commonExample: 'Começamos com dez frutas. Reservamos duas para teste e treinamos com as outras oito. Só depois de prever a classe das frutas reservadas revelamos as respostas para avaliar.',
    insight: 'A pergunta-chave é: durante o treinamento, havia uma resposta correta para cada exemplo?',
    illustration: 'supervised',
    sectionTitle: 'Da fruta etiquetada à previsão',
    steps: [
      { title: 'Mostramos exemplos', description: 'O computador recebe características E a resposta: “maçã” ou “laranja”.' },
      { title: 'O algoritmo procura uma regra', description: 'Uma árvore testa perguntas; uma rede neural ajusta pesos. São caminhos diferentes para a mesma tarefa.' },
      { title: 'Testamos com uma fruta nova', description: 'O modelo tenta prever a etiqueta. Conferir apenas frutas usadas no treino não basta: precisamos testar com frutas que ele não viu.' },
    ],
  },
  'Aprendizado não supervisionado': {
    subtitle: 'Encontrar semelhanças mesmo sem ter um gabarito.',
    opening: [
      'Imagine que a feira entregou uma caixa de frutas sem nenhum nome. Você ainda consegue observar a cor e a textura, mas ninguém informou quais são maçãs e quais são laranjas.',
      'Em vez de pedir ao computador que acerte etiquetas que ele nunca recebeu, podemos pedir: “mostre quais frutas se parecem mais entre si”. Ele pode formar grupos usando as características disponíveis.',
      'Esse é um exemplo de aprendizado não supervisionado: o algoritmo procura uma organização nos dados, sem receber uma resposta correta para cada item.'
    ],
    question: 'Se ele encontrou dois grupos, descobriu “maçãs” e “laranjas”?',
    answer: 'Não necessariamente. Ele descobriu uma separação pelos critérios do método, não o significado real dos grupos. Cabe a nós interpretar. Frutas de cores diferentes, por exemplo, podem acabar separadas mesmo sendo da mesma espécie.',
    commonExample: 'Usaremos as mesmas frutas do capítulo anterior, só que sem a coluna com o nome. O algoritmo observa cor e textura e propõe grupos.',
    insight: 'Sem respostas prontas, o objetivo não é adivinhar a etiqueta: é revelar uma estrutura útil nos dados.',
    illustration: 'unsupervised',
    sectionTitle: 'O que acontece quando retiramos as etiquetas?',
    steps: [
      { title: 'Retiramos as respostas', description: 'As características continuam lá, mas não contamos qual é a fruta.' },
      { title: 'Procuramos semelhanças', description: 'O método observa proximidade, densidade ou outros padrões. Cada algoritmo pode organizar os mesmos dados de outro jeito.' },
      { title: 'Interpretamos os resultados', description: 'O computador devolve grupos ou uma nova representação; precisamos decidir se isso ajuda na tarefa.' },
    ],
  },
  'Modelos baseados em árvores': {
    subtitle: 'Um modelo que aprende a fazer perguntas simples, uma de cada vez.',
    opening: [
      'Vamos continuar separando maçãs e laranjas. Talvez você comece perguntando: “a casca é rugosa?”. Se for, a fruta pode ser uma laranja. Se não for, você faz outra pergunta, como “qual é a cor?”.',
      'Uma árvore de decisão é uma sequência organizada dessas perguntas. Durante o treino, o algoritmo procura divisões que ajudem a separar os exemplos. Depois, uma fruta nova percorre esse caminho até chegar a uma previsão.',
      'É uma das formas mais fáceis de enxergar o que um modelo aprendeu. Já o Random Forest combina muitas árvores, que podem discordar entre si, para construir uma decisão conjunta.'
    ],
    question: 'Quem escreve as perguntas da árvore?',
    answer: 'O algoritmo escolhe as perguntas a partir dos dados e de critérios matemáticos. Nós definimos quais características estão disponíveis e limites como a profundidade máxima da árvore.',
    commonExample: 'Se o modelo aprende que certas combinações de cor e textura aparecem mais em maçãs, pode usar essas pistas em uma sequência de perguntas. O desenho abaixo é ilustrativo, não uma regra que sempre vale para frutas reais.',
    insight: 'Árvores usam perguntas e divisões. Florestas combinam várias árvores para reduzir a dependência de uma única sequência de perguntas.',
    illustration: 'tree',
    sectionTitle: 'Acompanhe o caminho de uma decisão',
    steps: [
      { title: 'Fazer uma pergunta', description: 'A árvore escolhe uma característica que ajuda a separar as frutas do treino.' },
      { title: 'Seguir um ramo', description: 'Conforme a resposta, o exemplo segue por um caminho diferente.' },
      { title: 'Chegar a uma previsão', description: 'No fim do caminho, a árvore indica a categoria mais provável segundo os exemplos que chegaram ali.' },
    ],
  },
  'Redes neurais': {
    subtitle: 'Uma forma de combinar pistas e aprender quanto cada uma importa.',
    opening: [
      'Suponha que você olhe uma fruta e use duas pistas para decidir o que ela é: a cor e a textura da casca. Às vezes a cor é mais útil; em outras, a textura faz a diferença.',
      'Uma rede neural faz contas com essas pistas. Ela atribui um valor de importância a cada entrada, combina os resultados e produz uma previsão. Essas importâncias são chamadas pesos.',
      'No começo, os pesos não estão bem ajustados. Quando treinamos uma rede com exemplos e respostas conhecidas, ela compara o que previu com o que deveria prever e ajusta os pesos. Redes maiores repetem essas combinações em várias camadas.'
    ],
    question: 'O que é um neurônio artificial?',
    answer: 'É uma pequena operação matemática: recebe números, combina cada um com um peso e produz um resultado. Não é um cérebro em miniatura. Vários desses cálculos, conectados, formam uma rede.',
    commonExample: 'Nossa rede recebe dois números simplificados: o quanto a cor parece alaranjada e o quanto a casca parece rugosa. Ela combina essas pistas para estimar uma categoria. Isso é apenas uma ilustração; redes reais podem usar muitas mais características.',
    insight: 'A diferença para uma árvore não é o objetivo da previsão, mas o jeito de aprender: perguntas e ramos de um lado, pesos e combinações numéricas do outro.',
    illustration: 'neural',
    sectionTitle: 'Veja duas pistas virarem uma previsão',
    steps: [
      { title: 'Transformar pistas em números', description: 'A cor e a textura da fruta viram valores que o computador pode calcular.' },
      { title: 'Combinar com pesos', description: 'Cada valor influencia a saída de acordo com sua importância. Camadas seguintes combinam resultados anteriores.' },
      { title: 'Ajustar para errar menos', description: 'Em tarefas supervisionadas, o erro ajuda a corrigir os pesos ao longo do treinamento.' },
    ],
  },
  'Agrupamento': {
    subtitle: 'Juntar itens parecidos sem dizer antes a qual grupo pertencem.',
    opening: [
      'Pegue as mesmas frutas sem etiqueta do nosso exemplo. Algumas têm casca mais lisa, outras mais rugosa; algumas são avermelhadas, outras alaranjadas. Podemos pedir ao computador que separe observações parecidas.',
      'Isso se chama agrupamento, ou clustering. O interessante é que existem muitas maneiras de definir “parecido”. O K-means procura centros e junta pontos próximos deles. O DBSCAN procura regiões mais densas.',
      'Dois métodos podem devolver grupos diferentes para a mesma banca de frutas. Nenhum deles sabe automaticamente os nomes reais das frutas.'
    ],
    question: 'Quantos grupos existem?',
    answer: 'Depende dos dados e do método. No K-means, escolhemos quantos grupos procurar. No DBSCAN, escolhemos parâmetros de vizinhança e densidade, e o número de grupos surge como resultado.',
    commonExample: 'As frutas aparecem como pontos com duas características. Ao agrupar, o algoritmo tenta aproximar observações parecidas. As cores dos grupos são atribuídas pelo algoritmo e não equivalem necessariamente a maçãs e laranjas.',
    insight: 'Agrupamento é uma das tarefas possíveis dentro do aprendizado não supervisionado. Não é sinônimo de todo aprendizado não supervisionado.',
    illustration: 'clusters',
    sectionTitle: 'Veja grupos surgirem dos mesmos dados',
    steps: [
      { title: 'Colocar cada fruta no gráfico', description: 'Posicionamos as frutas de acordo com cor e textura.' },
      { title: 'Agrupar pontos próximos', description: 'Um algoritmo propõe grupos usando uma definição de semelhança.' },
      { title: 'Avaliar o que isso significa', description: 'O grupo não recebe um nome verdadeiro automaticamente. Interpretar o resultado faz parte do trabalho.' },
    ],
  },
}

export const techniquePlainLanguage: Record<string, { short: string; compare: string }> = {
  'arvore-de-decisao': {short:'Aprende perguntas de sim ou não, como “a casca é rugosa?”.', compare:'Regras visíveis e fáceis de acompanhar'},
  'random-forest': {short:'Cria várias árvores e combina as decisões delas.',compare:'Combinar árvores para obter previsões mais estáveis'},
  'rede-neural-mlp': {short:'Combina características com pesos que são ajustados no treino.',compare:'Aprender relações que não cabem em poucas perguntas'},
  'hyperbox-fmm': {short:'Aprende regiões que cercam exemplos parecidos.',compare:'Representar classes por regiões nos dados'},
  'k-means': {short:'Coloca centros no gráfico e aproxima cada ponto de um centro.',compare:'Agrupar pontos em torno de centros'},
  'dbscan': {short:'Encontra grupos em regiões cheias de pontos.',compare:'Detectar grupos densos e pontos isolados'},
  'som': {short:'Organiza exemplos parecidos em posições vizinhas de um mapa.',compare:'Explorar semelhanças preservando vizinhanças'},
  'pca': {short:'Resume muitas características em poucas combinações.',compare:'Simplificar dados, não descobrir classes'},
  'regressao-linear': {short:'Procura uma relação aproximada por uma linha para prever números.',compare:'Estimar valores como peso ou preço'},
  'regressao-logistica': {short:'Usa características para estimar a chance de uma categoria.',compare:'Classificar com uma fronteira simples'},
  'knn': {short:'Olha os exemplos mais próximos para decidir.',compare:'Prever usando vizinhos semelhantes'},
  'svm': {short:'Tenta separar categorias com uma fronteira bem posicionada.',compare:'Separar classes com margem'},
  'naive-bayes': {short:'Combina probabilidades para estimar uma categoria.',compare:'Classificar a partir de probabilidades'},
  'gradient-boosting': {short:'Treina árvores em sequência, corrigindo erros anteriores.',compare:'Melhorar previsões com árvores em sequência'},
  'cnn': {short:'Aprende pequenos padrões que se repetem nas imagens.',compare:'Analisar imagens'},
  'lstm': {short:'Trabalha com dados em sequência e guarda parte do contexto.',compare:'Trabalhar com sequências'},
  'transformer': {short:'Aprende relações entre diferentes partes de uma entrada.',compare:'Explorar relações entre partes de textos e outros dados'},
  'q-learning': {short:'Testa ações e aprende quais trazem mais recompensa.',compare:'Aprender decisões por tentativa e recompensa'},
  'algoritmo-genetico': {short:'Cria e modifica soluções para buscar alternativas melhores.',compare:'Procurar soluções por evolução simulada'},
  'gemeo-digital': {short:'Representa um sistema real em uma versão digital.',compare:'Monitorar ou simular sistemas reais'},
}

/** Textos curtos para assuntos ainda fora da trilha principal; sem introduções genéricas automáticas. */
export const shortIntroductions: Record<string, {opening:string; example:string; next:string}> = {
  'Aprendizado por reforço':{
    opening:'Imagine um robô tentando encontrar a saída de um labirinto. Ele escolhe um caminho, observa o resultado e recebe pontos quando se aproxima do objetivo. Depois de várias tentativas, pode aprender quais escolhas costumam funcionar melhor.',
    example:'Em vez de mostrar uma resposta pronta para cada situação, mostramos as consequências das ações. É por isso que aprendizado por reforço é diferente de classificação de frutas.',
    next:'Comece pelo Q-learning para descobrir como uma tabela de recompensas pode orientar escolhas.'},
  'Computação evolutiva':{
    opening:'Imagine tentar encontrar a melhor rota para entregar caixas de frutas. Uma opção é criar várias rotas, escolher as mais promissoras, modificá-las e repetir. Isso lembra a ideia de seleção e variação na natureza.',
    example:'Algoritmos genéticos experimentam muitas soluções possíveis. O objetivo é procurar uma alternativa boa, sem precisar testar todas as combinações.',
    next:'Abra Algoritmo genético para conhecer a ideia de população, mutação e seleção.'},
  'Sistemas inteligentes':{
    opening:'Uma técnica pode fazer uma previsão. Um sistema inteligente costuma reunir várias partes: receber informações, interpretar o que acontece e ajudar em uma ação.',
    example:'Pense no depósito da feira. Sensores medem a temperatura; um modelo acompanha o que está acontecendo e ajuda a antecipar problemas de conservação das frutas.',
    next:'Conheça gêmeos digitais, que representam um sistema real em uma versão computacional.'},
  'Modelos lineares':{
    opening:'Alguns problemas podem começar com uma regra bastante simples. Se a fruta fica maior, seu peso geralmente tende a aumentar. Podemos tentar descrever essa relação usando uma linha.',
    example:'A regressão linear prevê um número, como um peso aproximado. A regressão logística, apesar do nome, é usada para estimar probabilidades de categorias.',
    next:'Explore regressão linear e regressão logística para ver a diferença entre prever valores e classificar.'},
  'Ensembles de árvores':{
    opening:'Uma árvore faz perguntas e chega a uma resposta. Mas e se montarmos várias árvores, cada uma aprendendo um pouco diferente, e combinarmos seus resultados?',
    example:'Na banca de frutas, algumas árvores podem considerar mais a cor; outras, a textura. Uma floresta de árvores combina seus palpites em vez de depender de uma só.',
    next:'Compare Random Forest e Gradient Boosting: ambas usam árvores, mas aprendem de formas diferentes.'},
  'Perceptrons multicamadas':{
    opening:'Uma rede neural simples pode combinar características de uma fruta, como cor e textura, para sugerir uma categoria. Quando agrupamos várias operações dessas em camadas, temos uma rede do tipo MLP.',
    example:'Uma MLP recebe números, passa esses valores por camadas e ajusta as conexões durante o treino. O exemplo do Atlas usa um conjunto pequeno de pontos para visualizar esse processo.',
    next:'Abra a Rede neural (MLP) para alterar parâmetros e observar como a classificação muda.'},
  'Redes neurais incrementais':{
    opening:'Imagine que chegam novas frutas ao longo do dia. Em certos sistemas, queremos que o modelo consiga incorporar novos exemplos sem repetir todo o treinamento do início.',
    example:'Algumas redes aprendem regiões que representam os exemplos que chegam. O Hyperbox é uma abordagem que trabalha com regiões no espaço das características.',
    next:'Abra Hyperbox para explorar o que acontece quando mudamos o tamanho dessas regiões.'},
  'Redução de dimensionalidade':{
    opening:'Uma fruta pode ser descrita por muitas características: peso, cor, textura, tamanho e outras. Fica difícil enxergar tudo ao mesmo tempo. A redução de dimensionalidade tenta resumir essas informações em menos números.',
    example:'O PCA procura novas direções que conservam parte importante da variação dos dados. É como escolher um ângulo de observação que deixa o conjunto mais fácil de entender.',
    next:'Abra PCA para conhecer uma das formas mais comuns de resumir dados.'},
  'Mapas auto-organizáveis':{
    opening:'Imagine colocar frutas parecidas próximas umas das outras em um mapa. Uma rede auto-organizável tenta ajustar esse mapa para que os exemplos com características semelhantes ocupem posições vizinhas.',
    example:'No SOM, unidades vizinhas no mapa se ajustam em conjunto. É uma forma de explorar organização e semelhança sem etiquetas.',
    next:'Abra o SOM para ver como esse método se conecta a redes neurais e agrupamento.'},
  'Métodos baseados em exemplos':{
    opening:'Às vezes, para descobrir se uma fruta nova parece uma maçã, basta olhar quais exemplos conhecidos estão mais perto dela em características como cor e textura.',
    example:'O método k-NN pergunta: entre os exemplos mais parecidos com este, qual resposta aparece mais?',
    next:'Conheça o k-NN e experimente variar a quantidade de vizinhos.'},
  'Métodos de margem':{
    opening:'Se as frutas aparecem como pontos em um gráfico, talvez exista uma linha que ajude a separar os exemplos. Alguns modelos procuram uma fronteira que deixe uma boa distância dos pontos próximos.',
    example:'A SVM tenta criar essa separação; dependendo da configuração, a fronteira pode ser mais complexa que uma linha reta.',
    next:'Conheça a SVM e entenda o que significa uma margem de separação.'},
  'Modelos probabilísticos':{
    opening:'Em vez de decidir com uma pergunta fixa, podemos calcular qual categoria parece mais provável a partir das pistas de uma fruta.',
    example:'Um modelo como o Naive Bayes combina informações de diferentes características para estimar probabilidades, usando hipóteses simplificadoras.',
    next:'Abra Naive Bayes e descubra por que uma hipótese simples pode ajudar na classificação.'},
  'Redes convolucionais':{
    opening:'Até agora usamos dois números para cada fruta. Mas e se a entrada fosse uma foto? Uma rede convolucional foi pensada para explorar pequenos padrões em imagens.',
    example:'Ela pode aprender a reconhecer detalhes locais, como bordas e texturas, e combinar essas pistas para realizar uma tarefa de visão.',
    next:'Conheça as redes CNN e a diferença entre receber números de características e receber uma imagem.'},
  'Redes recorrentes':{
    opening:'Alguns dados chegam em sequência. Imagine registrar a temperatura do depósito da feira hora a hora: para entender o momento atual, os valores anteriores podem ajudar.',
    example:'Redes recorrentes processam sequências; modelos como LSTM usam mecanismos para manter parte do contexto ao longo dos passos.',
    next:'Conheça a LSTM e seus mecanismos de memória.'},
  'Transformers':{
    opening:'Quando processamos uma frase, o significado de uma palavra pode depender de outras palavras da mesma frase. Transformers usam mecanismos de atenção para relacionar partes de uma entrada.',
    example:'Em “a fruta que comprei ontem estava madura”, várias palavras ajudam a interpretar a frase. A atenção permite que uma parte da entrada use informações de outras.',
    next:'Abra Transformer para conhecer a ideia de atenção.'},
}
