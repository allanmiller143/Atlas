import type { NotebookCellData } from '../../components/learning/CodeNotebook.tsx'

export const randomForestPythonCells:NotebookCellData[]=[
 {title:'Importe as ferramentas',why:'Vamos usar a versão pronta do Random Forest disponível no scikit-learn.',code:`from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score`,explanation:'RandomForestClassifier treina várias árvores. accuracy_score calcula a proporção de acertos nos dados que não participaram do treinamento.'},
 {title:'Transforme as frutas em números',why:'O computador recebe características (X) e respostas (y). Uma codificação simples basta para esta demonstração.',code:`# Cor: vermelha=0, verde=1, alaranjada=2, amarelada=3
# Casca: lisa=0, rugosa=1
X = [[0,0], [2,1], [1,0], [0,1],
     [2,1], [0,0], [3,1], [1,0],
     [0,1], [2,1]]
y = ['Maçã','Laranja','Maçã','Maçã',
     'Laranja','Maçã','Laranja','Maçã',
     'Maçã','Laranja']`,explanation:'Cada linha representa uma fruta. O primeiro número representa a cor, o segundo a textura. As respostas são os nomes das frutas. Para bases reais, prefira um pré-processamento adequado para variáveis categóricas.'},
 {title:'Separe treino e teste',why:'As duas últimas frutas serão reservadas para conferir se o modelo consegue prever exemplos não vistos.',code:`X_train, X_test = X[:8], X[8:]
y_train, y_test = y[:8], y[8:]
print('Treino:', len(X_train), 'Teste:', len(X_test))`,explanation:'O modelo só verá os oito primeiros rótulos durante o treinamento. A divisão aqui é fixa para acompanhar a aula; em aplicações reais, use uma estratégia de separação representativa.',expected:'Treino: 8 Teste: 2'},
 {title:'Treine várias árvores',why:'Cada árvore recebe amostras sorteadas com reposição. Em cada divisão, o algoritmo considera apenas parte das características.',code:`forest = RandomForestClassifier(
    n_estimators=5,    # Quantas árvores serão treinadas
    max_depth=2,       # Máximo de perguntas em sequência
    max_features=1,    # Quantas características considerar por divisão
    bootstrap=True,    # Sorteia exemplos com reposição
    random_state=7     # Torna o sorteio reproduzível
)
forest.fit(X_train, y_train)`,explanation:'fit cria e ajusta as árvores. max_features=1 limita cada nó a uma das duas características; isso contribui para que as árvores aprendam regras diferentes. O modelo real do scikit-learn pode não gerar exatamente os mesmos desenhos da simulação didática.'},
 {title:'Veja o voto de cada árvore',why:'Primeiro inspecionamos as previsões individuais; depois comparamos com a decisão conjunta.',code:`for index, tree in enumerate(forest.estimators_, start=1):
    prediction_index = tree.predict(X_test)
    # Árvores internas trabalham com índices das classes:
    prediction = forest.classes_[prediction_index.astype(int)]
    print(f'Árvore {index}:', list(prediction))

predictions = forest.predict(X_test)
print('Floresta:', list(predictions))
print('Corretas:', list(y_test))
print('Acurácia no teste:', accuracy_score(y_test, predictions))`,explanation:'Cada estimador contribui com uma previsão. O Random Forest agrega as previsões individuais para chegar ao resultado final. Na classificação do scikit-learn, a agregação usa a média das probabilidades estimadas pelas árvores, que pode diferir de uma votação simples em alguns casos.',expected:'As previsões de cada árvore podem ser diferentes. Com apenas duas frutas de teste, a acurácia não é uma medida confiável de desempenho geral.'},
]
