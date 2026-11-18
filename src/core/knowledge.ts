import { ALL } from '../techniques/registry.ts'

export type KnowledgeLevel = 'area' | 'concept' | 'family'
export interface KnowledgeNode { id: string; level: KnowledgeLevel; name: string; parent?: string; description: string }
export interface Lesson { analogy: string; steps: string[]; learning: string; math: string; mathNote: string; python: string; codeNotes: string[]; example: string }
const slug = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const knowledgeId = (level: KnowledgeLevel, name: string, parent = '') => `${level}-${slug(parent)}-${slug(name)}`
const descriptions: Record<string,string> = {
 'Aprendizado de máquina': 'Sistemas que identificam padrões nos dados para realizar previsões, descobrir estruturas ou tomar decisões.',
 'Aprendizado supervisionado': 'Aprender a partir de exemplos com respostas conhecidas: o modelo compara sua previsão com a resposta correta e tenta reduzir os erros.',
 'Aprendizado não supervisionado': 'Investigar dados sem respostas prontas, encontrando grupos, estruturas e representações úteis.',
 'Redes neurais': 'Modelos formados por unidades conectadas que transformam informações em camadas e ajustam parâmetros durante o treinamento.',
 'Agrupamento': 'Reunir observações semelhantes sem receber antecipadamente a classe correta de cada uma.',
 'Árvores de decisão': 'Separar dados com perguntas sucessivas até chegar a uma previsão ou decisão.',
 'Ensembles de árvores': 'Combinar várias árvores para produzir previsões mais robustas ou precisas.',
 'Perceptrons multicamadas': 'Redes de camadas densas que aprendem relações não lineares por meio de pesos e ativações.',
 'Aprendizado por reforço': 'Aprender ações por tentativa, consequência e recompensa em interação com um ambiente.',
 'Computação evolutiva': 'Buscar soluções por processos inspirados em seleção, variação e evolução.',
 'Sistemas inteligentes': 'Combinar modelos, dados e regras para compreender ou acompanhar sistemas do mundo real.',
}
const nodes = new Map<string,KnowledgeNode>()
for (const t of ALL) {
 const {area,concept,family} = t.hierarchy
 const a = knowledgeId('area',area)
 const c = knowledgeId('concept',concept,area)
 const f = knowledgeId('family',family,`${area}/${concept}`)
 nodes.set(a,{id:a,level:'area',name:area,description:descriptions[area]??`Conheça as ideias centrais de ${area.toLowerCase()} e suas aplicações.`})
 nodes.set(c,{id:c,level:'concept',name:concept,parent:a,description:descriptions[concept]??`Entenda ${concept.toLowerCase()}, seus princípios e os modelos relacionados.`})
 nodes.set(f,{id:f,level:'family',name:family,parent:c,description:descriptions[family]??`Estude os modelos da família ${family.toLowerCase()} e como eles se relacionam.`})
}
export const KNOWLEDGE = [...nodes.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt'))
export const knowledgeById = (id?:string) => KNOWLEDGE.find(n=>n.id===id)
export const childrenOf = (id:string) => KNOWLEDGE.filter(n=>n.parent===id)
export const ancestorsOf = (node:KnowledgeNode) => { const arr:KnowledgeNode[]=[]; let n:KnowledgeNode|undefined=node; while(n){arr.unshift(n);n=n.parent?knowledgeById(n.parent):undefined}return arr }
export const techniquesOf = (node:KnowledgeNode) => ALL.filter(t=>{
 const {area,concept,family}=t.hierarchy
 return node.id===knowledgeId('area',area)||node.id===knowledgeId('concept',concept,area)||node.id===knowledgeId('family',family,`${area}/${concept}`)
})
export const nodeForTechnique = (id:string,level:KnowledgeLevel='family') => {const t=ALL.find(t=>t.id===id);if(!t)return undefined;const {area,concept,family}=t.hierarchy;return knowledgeById(level==='area'?knowledgeId('area',area):level==='concept'?knowledgeId('concept',concept,area):knowledgeId('family',family,`${area}/${concept}`))}

const generic:Lesson={
 analogy:'Pense em uma coleção de exemplos: a técnica transforma observações em uma regra ou representação que ajuda a compreender novos casos.',
 steps:['Observe os dados e identifique a tarefa.','Escolha uma representação e um modelo apropriado.','Ajuste o modelo ou seus parâmetros.','Analise os resultados, limitações e comportamento com dados novos.'],
 learning:'Nem todo método aprende por gradiente: alguns calculam estatísticas, outros dividem dados ou procuram soluções. Veja as técnicas desta página para identificar o processo de cada uma.',
 math:'resultado = f(dados, parâmetros)',mathNote:'Esquema conceitual, não uma equação específica da família.',
 python:'from sklearn.model_selection import train_test_split\n\n# 1. Separe os dados em treino e teste\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\n# 2. Escolha um estimador compatível com a tarefa\n# 3. Ajuste com .fit(...) e avalie com dados de teste',
 codeNotes:['X representa as variáveis de entrada; y representa as respostas, quando existem.','Este trecho é um roteiro para tarefas supervisionadas; outras áreas exigem outros procedimentos.'],
 example:'Ao estudar um modelo, pergunte: quais dados entram, o que sai e como verifico se o resultado é útil?'
}
const lessons:Record<string,Partial<Lesson>>={
 'Aprendizado supervisionado':{
 analogy:'É como estudar com um gabarito: você tenta responder, confere o resultado e ajusta sua estratégia.',
 steps:['Reúna exemplos com entradas (X) e respostas (y).','Treine o modelo para aproximar uma função que liga X a y.','Meça o erro em exemplos não usados no ajuste.','Use o modelo para prever novos casos.'],
 learning:'O treinamento procura parâmetros que reduzam uma função de perda. Árvores escolhem divisões; redes neurais geralmente ajustam pesos por gradiente. Os mecanismos são diferentes, embora ambos usem exemplos rotulados.',
 math:'θ* = argminθ (1/n) Σᵢ L(fθ(xᵢ), yᵢ)',mathNote:'A ideia é escolher parâmetros θ que minimizem a perda média entre previsões e respostas conhecidas.',
 python:'from sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.metrics import accuracy_score\n\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\nmodelo = DecisionTreeClassifier(max_depth=3, random_state=42)\nmodelo.fit(X_treino, y_treino)\nprevisoes = modelo.predict(X_teste)\nprint(accuracy_score(y_teste, previsoes))',
 codeNotes:['train_test_split reserva dados que não participam do treinamento.','fit aprende com entradas e rótulos; predict faz previsões.','accuracy_score mede acertos em classificação; regressão requer métricas diferentes.'],
 example:'Prever se uma mensagem é spam usando mensagens já classificadas como spam ou não spam.'},
 'Aprendizado não supervisionado':{
 analogy:'É como organizar uma caixa de objetos sem etiquetas, procurando semelhanças e padrões.',
 steps:['Colete observações sem classes conhecidas.','Defina uma medida de semelhança, distância ou variação.','Aplique um método para encontrar grupos ou reduzir dimensões.','Inspecione se a estrutura encontrada faz sentido no contexto.'],
 learning:'Algoritmos como K-means alternam entre atribuir pontos a centros e atualizar esses centros. Outros, como DBSCAN, usam densidade; PCA calcula direções de maior variância.',
 math:'J = Σᵢ minₖ ||xᵢ − μₖ||²',mathNote:'Objetivo do K-means: reduzir a distância quadrática dos pontos aos centros μ. Não representa todos os métodos não supervisionados.',
 python:'from sklearn.cluster import KMeans\n\nmodelo = KMeans(n_clusters=3, random_state=42, n_init=10)\ngrupo = modelo.fit_predict(X)\nprint(modelo.cluster_centers_)',
 codeNotes:['n_clusters define quantos grupos o K-means tentará formar.','fit_predict ajusta os centros e devolve um grupo por observação.','Os números dos grupos não representam classes verdadeiras.'],
 example:'Agrupar clientes por padrões de comportamento sem saber antecipadamente seus perfis.'},
 'Redes neurais':{
 analogy:'Imagine vários filtros de informação em sequência: cada camada combina sinais e passa adiante uma nova representação.',
 steps:['A entrada fornece valores numéricos à primeira camada.','Cada neurônio calcula uma combinação ponderada e aplica uma ativação.','A saída produz uma previsão.','Durante o treinamento, o erro orienta atualizações dos pesos.'],
 learning:'Em redes treinadas por retropropagação, calculamos como cada peso contribuiu para o erro e usamos um otimizador para atualizá-lo. O playground abaixo demonstra intuitivamente como pesos alteram uma saída.',
 math:'z = w·x + b    |    a = σ(z)    |    w ← w − η∂L/∂w',mathNote:'Soma ponderada, ativação e atualização por gradiente. η é a taxa de aprendizado.',
 python:'from sklearn.neural_network import MLPClassifier\n\nmodelo = MLPClassifier(\n    hidden_layer_sizes=(8, 8), max_iter=1000, random_state=42\n)\nmodelo.fit(X_treino, y_treino)\nprint(modelo.predict(X_teste))',
 codeNotes:['hidden_layer_sizes=(8, 8) cria duas camadas ocultas com oito unidades cada.','fit ajusta os pesos; predict calcula a classe prevista.','É um exemplo de MLP para classificação, não de todas as arquiteturas neurais.'],
 example:'Uma rede aprende a distinguir categorias a partir de combinações de características.'},
 'Agrupamento':{
 analogy:'Imagine separar bolinhas espalhadas em uma mesa de acordo com sua proximidade.',
 steps:['Escolha características relevantes para representar os pontos.','Defina a noção de proximidade ou densidade.','Aplique o algoritmo para formar grupos.','Compare estabilidade e interpretabilidade dos grupos.'],
 learning:'No K-means, cada iteração recalcula centros. No DBSCAN, vizinhanças densas conectam pontos. No SOM, protótipos vizinhos se ajustam em conjunto.',
 math:'J = Σᵢ minₖ ||xᵢ − μₖ||²',mathNote:'Função objetivo do K-means; métodos baseados em densidade não otimizam necessariamente esta função.',
 python:'from sklearn.cluster import KMeans\n\nmodelo = KMeans(n_clusters=3, n_init=10, random_state=42)\nrotulos = modelo.fit_predict(X)\nprint(rotulos)',
 codeNotes:['fit_predict atribui um identificador de grupo a cada ponto.','O valor de n_clusters é uma hipótese sobre quantos grupos procurar.'],
 example:'Descobrir padrões de agrupamento em dados geográficos ou de consumo.'},
 'Árvores de decisão':{
 analogy:'Um jogo de perguntas de sim ou não: cada resposta conduz a outra pergunta até chegar a uma conclusão.',
 steps:['Escolha uma característica e um ponto de corte.','Divida os exemplos em dois subconjuntos.','Repita a divisão nos ramos até atingir um critério de parada.','Use o caminho percorrido para prever a classe.'],
 learning:'A árvore avalia divisões candidatas e prefere as que deixam os grupos resultantes mais homogêneos. A profundidade controla parte da complexidade.',
 math:'Gini = 1 − Σₖ pₖ²',mathNote:'Impureza de Gini: quanto menor, mais homogêneo é o nó em problemas de classificação.',
 python:'from sklearn.tree import DecisionTreeClassifier\n\nmodelo = DecisionTreeClassifier(max_depth=3, random_state=42)\nmodelo.fit(X_treino, y_treino)\nprint(modelo.predict(X_teste))',
 codeNotes:['max_depth limita a quantidade de níveis da árvore.','A árvore escolhe automaticamente as perguntas a partir dos dados de treino.'],
 example:'Decidir se uma amostra pertence à classe A ou B a partir de perguntas sobre suas características.'},
 'Ensembles de árvores':{
 analogy:'Em vez de confiar em uma única opinião, combine as decisões de várias árvores.',
 steps:['Crie várias árvores com variações nos dados ou no treinamento.','Cada árvore faz uma previsão.','Combine as previsões por voto ou média.','Avalie o conjunto em dados não vistos.'],
 learning:'Random Forest usa amostras e características aleatórias para diversificar árvores. Gradient Boosting constrói modelos sequencialmente para corrigir erros.',
 math:'ŷ = moda(T₁(x), T₂(x), …, Tₘ(x))',mathNote:'Votação em uma floresta de classificação; boosting usa uma combinação diferente.',
 python:'from sklearn.ensemble import RandomForestClassifier\n\nmodelo = RandomForestClassifier(n_estimators=100, random_state=42)\nmodelo.fit(X_treino, y_treino)\nprint(modelo.predict(X_teste))',
 codeNotes:['n_estimators define quantas árvores são treinadas.','As previsões são agregadas para produzir a classificação final.'],
 example:'Classificar observações tabulares combinando muitas árvores.'}
}
export function lessonFor(node:KnowledgeNode):Lesson {return {...generic,...(lessons[node.name]??{})}}
