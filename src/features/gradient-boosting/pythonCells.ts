import type { NotebookCellData } from '../../components/learning/CodeNotebook.tsx'

export const gradientBoostingPythonCells: NotebookCellData[] = [
 {title:'Importe as ferramentas',why:'Usaremos a implementação de classificação de Gradient Boosting do scikit-learn, além de uma métrica de avaliação.',code:`from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score`,explanation:'O GradientBoostingClassifier constrói árvores em sequência, ajustando gradualmente uma função de previsão. Não são árvores votando de maneira independente como no Random Forest.'},
 {title:'Descreva as frutas',why:'Vamos manter o mesmo pequeno conjunto das aulas anteriores, para observar o que muda no algoritmo — não nos dados.',code:`# Codificação apenas para o exercício:
# cor: vermelha=0, verde=1, alaranjada=2, amarelada=3
# casca: lisa=0, rugosa=1
X = [[0,0], [2,1], [1,0], [0,1],
     [2,1], [0,0], [3,1], [1,0],
     [0,1], [2,1]]
y = ['Maçã','Laranja','Maçã','Maçã',
     'Laranja','Maçã','Laranja','Maçã',
     'Maçã','Laranja']`,explanation:'Cada linha contém duas características. A variável y guarda o nome verdadeiro da fruta. Em problemas reais, não trate automaticamente códigos de categorias como distâncias numéricas: avalie OneHotEncoder ou outra codificação adequada.'},
 {title:'Separe treino e teste',why:'O algoritmo deve aprender sem consultar as respostas reservadas para a avaliação.',code:`X_train, X_test = X[:8], X[8:]
y_train, y_test = y[:8], y[8:]
print('Treino:', len(X_train), '| Teste:', len(X_test))`,explanation:'A divisão é fixa apenas para acompanhar o exemplo do Atlas. Em dados reais, é importante definir um particionamento representativo antes de ajustar o modelo.',expected:'Treino: 8 | Teste: 2'},
 {title:'Treine a sequência de árvores',why:'Agora cada árvore corrige a previsão acumulada até a rodada anterior.',code:`model = GradientBoostingClassifier(
    n_estimators=4,     # rodadas de boosting
    learning_rate=0.5,  # tamanho de cada correção
    max_depth=1,        # árvores pequenas (stumps)
    min_samples_leaf=1,
    random_state=7
)
model.fit(X_train, y_train)`,explanation:'Ao contrário do Random Forest, as árvores são adicionadas sequencialmente. Para classificação, a otimização se relaciona à perda logística; não se trata simplesmente de votar nem de trocar etiquetas erradas. O cálculo exato do scikit-learn não precisa coincidir com o simulador didático do Atlas.'},
 {title:'Acompanhe cada rodada',why:'Uma vantagem desse modelo é podermos inspecionar a previsão à medida que novas árvores são acrescentadas.',code:`for rodada, previsoes in enumerate(model.staged_predict(X_test), start=1):
    print(f'Após {rodada} árvore(s):', list(previsoes))

probas = model.predict_proba(X_test)
print('Classes:', model.classes_)
print('Probabilidades:', probas.round(3))`,explanation:'staged_predict mostra as previsões acumuladas: a rodada 3 inclui o efeito das rodadas 1 e 2. predict_proba fornece probabilidades por classe; nunca some probabilidades diretamente como se fossem votos.'},
 {title:'Avalie em dados não vistos',why:'Por fim, comparamos a previsão com a resposta que ficou guardada.',code:`predictions = model.predict(X_test)
print('Previsões:', list(predictions))
print('Respostas reais:', list(y_test))
print('Acurácia:', accuracy_score(y_test, predictions))`,explanation:'Esta avaliação usa só duas frutas e serve apenas para demonstrar o processo. Um teste real precisaria de mais dados, análise de erros e, se houver ajuste de parâmetros, validação separada.'},
]
