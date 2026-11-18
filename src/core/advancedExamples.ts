/** Complementos opcionais e executáveis para a narrativa da banca de frutas. */
export interface AdvancedExample { math: string; mathExplanation: string; code: string; notes: string[] }
const supervisedData = `# Cada fruta é descrita por [cor, textura], de 0 a 1.
# São números inventados apenas para ensinar a ideia.
frutas = [
    [0.1, 0.1], [0.2, 0.2], [0.15, 0.25],  # maçãs do exemplo
    [0.8, 0.9], [0.9, 0.8], [0.75, 0.85]   # laranjas do exemplo
]
nomes = ["maçã", "maçã", "maçã", "laranja", "laranja", "laranja"]`
const unsupervisedData = `# A mesma ideia, só que SEM os nomes das frutas.
frutas = [
    [0.1, 0.1], [0.2, 0.2], [0.15, 0.25],
    [0.8, 0.9], [0.9, 0.8], [0.75, 0.85]
]`
const treeCode = `${supervisedData}

from sklearn.tree import DecisionTreeClassifier

arvore = DecisionTreeClassifier(max_depth=2, random_state=42)
arvore.fit(frutas, nomes)  # aprende com exemplos etiquetados

nova_fruta = [[0.82, 0.78]]
print(arvore.predict(nova_fruta))  # palpite para uma fruta nova`
const kmeansCode = `${unsupervisedData}

from sklearn.cluster import KMeans

modelo = KMeans(n_clusters=2, n_init=10, random_state=42)
grupos = modelo.fit_predict(frutas)
print(grupos)  # devolve IDs como 0 e 1; NÃO nomes de frutas`
export const advancedExamples: Record<string,AdvancedExample> = {
 'Aprendizado supervisionado':{
  math:'entrada (cor, textura)  →  modelo  →  previsão (nome)',
  mathExplanation:'Nesta etapa, pense no modelo como uma função que transforma características em uma resposta. Depois você poderá estudar como ele escolhe os parâmetros.',
  code:treeCode,
  notes:['O conjunto nomes funciona como gabarito durante o treino.','fit aprende usando frutas e etiquetas; predict tenta classificar outra fruta.','Este brinquedo tem só seis exemplos. Ele serve para entender o código, não para medir um modelo real.'],
 },
 'Aprendizado não supervisionado':{
  math:'entrada (cor, textura)  →  algoritmo  →  grupo (0, 1, ...)',
  mathExplanation:'Aqui não existe uma coluna com a resposta correta. Um número de grupo identifica uma organização criada pelo algoritmo, não uma categoria verdadeira.',
  code:kmeansCode,
  notes:['Repare que não há lista nomes.','n_clusters=2 pede ao K-means dois grupos neste exemplo.','Os números 0 e 1 não significam automaticamente maçã e laranja.'],
 },
 'Modelos baseados em árvores':{
  math:'casca rugosa? → SIM ou NÃO → próxima pergunta / previsão',
  mathExplanation:'Para escolher perguntas, uma árvore pode calcular uma medida como a impureza de Gini. O cálculo ajuda a preferir divisões em que as respostas conhecidas fiquem mais separadas.',
  code:treeCode,
  notes:['max_depth=2 limita a árvore a, no máximo, dois níveis de perguntas.','O algoritmo escolhe as perguntas a partir dos exemplos rotulados.','Troque a cor ou a textura da fruta nova e veja se o palpite muda.'],
 },
 'Redes neurais':{
  math:'soma = (peso₁ × cor) + (peso₂ × textura) + viés',
  mathExplanation:'Este é o começo do cálculo de um neurônio artificial. Uma função de ativação transforma a soma em uma saída. Durante o treinamento, os pesos e o viés são ajustados para reduzir os erros.',
  code:`${supervisedData}

from sklearn.neural_network import MLPClassifier

rede = MLPClassifier(
    hidden_layer_sizes=(4,),  # uma camada com 4 unidades
    max_iter=2000,
    random_state=42
)
rede.fit(frutas, nomes)
print(rede.predict([[0.82, 0.78]]))`,
  notes:['A rede também usa as respostas conhecidas neste exemplo supervisionado.','Ao contrário da árvore, ela ajusta pesos em conexões numéricas.','Com tão poucos dados, resultados não demonstram que a rede generaliza.'],
 },
 'Agrupamento':{
  math:'frutas próximas → possível grupo em comum',
  mathExplanation:'No K-means, cada fruta é atribuída ao centro mais próximo, e os centros são atualizados até o processo parar. DBSCAN usa vizinhança e densidade em vez de centros fixos.',
  code:kmeansCode,
  notes:['O K-means recebe somente características, sem as respostas.','Ele pode formar dois grupos, mas cabe a nós decidir o que eles representam.','Na página individual do K-means, você pode mover os pontos e observar o resultado.'],
 },
}
