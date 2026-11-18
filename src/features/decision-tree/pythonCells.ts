/** Edite cada célula separadamente: código, contexto e resultado esperado. */
import type { NotebookCellData } from '../../components/learning/CodeNotebook.tsx'

export const decisionTreePythonCells: NotebookCellData[] = [
 {
  title: 'Importar as ferramentas',
  why: 'Usaremos uma árvore da biblioteca scikit-learn, um gerador de regras legíveis e uma métrica de avaliação.',
  code: `from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.metrics import accuracy_score`,
  explanation: 'DecisionTreeClassifier aprende perguntas. export_text imprime as perguntas aprendidas. accuracy_score compara previsões e respostas verdadeiras.',
  expected: 'Esta célula apenas importa funções; não imprime nada.'
 },
 {
  title: 'Representar as frutas como números',
  why: 'O algoritmo recebe uma tabela numérica X e uma lista de respostas y. Cada linha de X representa uma fruta.',
  code: `# Colunas: [é_vermelha, tem_casca_rugosa]
# 1 significa sim; 0 significa não.
X_treino = [
    [1, 0],  # vermelha e lisa -> maçã
    [0, 1],  # alaranjada e rugosa -> laranja
    [0, 0],  # esverdeada e lisa -> maçã
    [1, 1],  # vermelha e rugosa -> maçã
    [0, 1],  # amarelada e rugosa -> laranja
    [1, 0],  # vermelha e lisa -> maçã
    [0, 1],  # alaranjada e rugosa -> laranja
    [0, 0],  # esverdeada e lisa -> maçã
]
y_treino = ['maca', 'laranja', 'maca', 'maca',
            'laranja', 'maca', 'laranja', 'maca']`,
  explanation: 'X contém características; y contém a resposta correta. No exemplo usamos apenas duas colunas para facilitar a visualização. Diferentes cores não vermelhas são codificadas como 0 porque, neste conjunto específico, basta distinguir o vermelho para classificar o ramo rugoso.',
  expected: 'Oito linhas em X_treino e oito respostas em y_treino.'
 },
 {
  title: 'Reservar duas frutas para testar',
  why: 'A árvore não pode usar as respostas dos exemplos de teste para escolher perguntas.',
  code: `# Exemplos reservados antes de treinar:
X_teste = [[1, 1], [0, 1]]
y_teste = ['maca', 'laranja']`,
  explanation: 'Nesta aula a divisão é fixa para reproduzir o desenho. Num projeto real, normalmente usamos train_test_split com uma estratégia adequada ao conjunto de dados.',
  expected: 'Duas frutas ficam separadas do treinamento.'
 },
 {
  title: 'Configurar e treinar a Decision Tree',
  why: 'Agora o algoritmo escolhe as divisões que mais reduzem a mistura entre maçãs e laranjas.',
  code: `arvore = DecisionTreeClassifier(
    criterion='gini',
    max_depth=2,
    min_samples_split=2,
    random_state=42
)
arvore.fit(X_treino, y_treino)
print(export_text(arvore, feature_names=['vermelha', 'rugosa']))`,
  explanation: 'criterion escolhe a medida de impureza. max_depth limita quantas perguntas podem aparecer em um caminho. min_samples_split estabelece o número mínimo de amostras para tentar dividir um nó. fit aprende somente com o treino.',
  expected: 'A saída mostra perguntas usando as colunas vermelha e rugosa. A ordem textual pode diferir do desenho pedagógico quando divisões empatam.'
 },
 {
  title: 'Prever e avaliar',
  why: 'Só depois de construir a árvore utilizamos as frutas que ficaram de fora.',
  code: `previsoes = arvore.predict(X_teste)
print('Previsões:', previsoes)
print('Acerto no teste:', accuracy_score(y_teste, previsoes))`,
  explanation: 'predict percorre a árvore sem modificá-la. accuracy_score calcula a fração de acertos comparando as previsões com y_teste.',
  expected: 'O resultado é apenas ilustrativo: duas frutas são insuficientes para estimar o desempenho real de um modelo.'
 }
]
