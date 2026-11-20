# AdaBoost — Atlas IA

- `adaModel.ts`: simulação discreta binária com stumps e pesos por exemplo; sem dependência da interface.
- `AdaBoostLesson.tsx`: aula visual, laboratório e parâmetros exclusivos do AdaBoost.
- `pythonCells.ts`: notebook para scikit-learn, não executado no navegador.

O conjunto de frutas vem de `../decision-tree/fruitExamples.ts`, preservando os mesmos exemplos da família.
A simulação usa a convenção binária alpha = 1/2 log((1-error)/error), e não promete reproduzir o scikit-learn exatamente.

## Refinamento do laboratório

- `AdaBoostLesson.tsx`: `OneStump` centraliza a representação SVG de uma árvore simples, com rótulos SIM/NÃO fora das folhas.
- `VoteExplanation` explica `alpha` a partir do erro ponderado e do `learning_rate`.
- `CompactVotes` resume os votos acumulados de todas as árvores em uma tabela, sem repetir diagramas verticalmente.
- O laboratório mostra a árvore da rodada selecionada, os pesos das 8 frutas antes/depois e o placar para a fruta escolhida.
- A árvore de profundidade 2, apresentada como exemplo opcional no passo 4, usa o diagrama de Decision Tree e **não** faz parte do treinamento AdaBoost com stumps da aula.
