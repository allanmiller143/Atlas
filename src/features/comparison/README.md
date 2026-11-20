# Comparação de técnicas no Atlas

A rota `/comparar` usa `src/pages/ComparePage.tsx` para a interface.

## Duas camadas independentes

1. **Universal (metadados):** qualquer técnica `ready` registrada em `src/techniques/*/index.ts` aparece automaticamente na seleção da tarefa correspondente (`traits.output`). O quadro comparativo usa as descrições que a própria técnica já fornece, sem fingir que tarefas diferentes produzem resultados comparáveis.
2. **Comparação didática detalhada das árvores:** `treeComparison.ts` reúne os resultados dos simuladores de Decision Tree, Random Forest, Gradient Boosting, AdaBoost e XGBoost, sobre as MESMAS frutas de treino e teste de `features/decision-tree/fruitExamples.ts`. A UI mostra as perguntas, os votos ou as correções acumuladas, de acordo com cada algoritmo. Os parâmetros são fixos para facilitar a comparação.

Para adicionar a comparação detalhada de uma nova família, criar um módulo próprio (por exemplo, `clusteringComparison.ts`) que use os modelos dessa família. Não é necessário converter toda técnica em um mesmo tipo de animação. A seleção e as tabelas universais continuam válidas.

## Observações de rigor

- As árvores da comparação são **modelos didáticos**, e não necessariamente reproduzem todos os detalhes de scikit-learn/xgboost.
- Não existe garantia de que todos os algoritmos vão acertar ou divergir nos 2 exemplos reservados.
- As probabilidades e os placares de boosting não têm a mesma interpretação que os votos do Random Forest.
- Dois exemplos de teste são suficientes para ilustrar o processo, mas não para comparar desempenho real ou afirmar que um algoritmo é melhor.
