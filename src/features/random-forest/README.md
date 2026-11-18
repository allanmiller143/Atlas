# Random Forest — página independente

Esta pasta contém apenas o material da técnica Random Forest. Ela **não herda** as animações da Decision Tree.

- `RandomForestLesson.tsx`: conteúdo editorial, as cinco etapas visuais, miniaturas das árvores, controle do laboratório, comparação de votos e seção de uso/limitações.
- `forestModel.ts`: simulação categórica determinística de uma floresta, usando as oito frutas de treino da Decision Tree; inclui bootstrap, sorteio de características por nó, árvores com redução de Gini e voto majoritário didático.
- `pythonCells.ts`: cinco células de Python para o componente compartilhado `CodeNotebook`.

## Como editar

1. Para modificar textos, figuras ou a experiência interativa, abra `RandomForestLesson.tsx`.
2. Para modificar o comportamento da simulação, altere `forestModel.ts` e execute `node --experimental-strip-types --test tests/random-forest-lesson.test.ts`.
3. Para editar as células Python, abra `pythonCells.ts`.
4. Para alterar o cadastro no menu e a implementação numérica existente, veja `src/techniques/random-forest/index.ts`.
5. O componente de página é registrado em `src/pages/TechniquePage.tsx` — há uma ramificação pequena apenas para encaminhar a página de Random Forest para esta pasta.

Nota pedagógica: a simulação usa votação majoritária simples; `RandomForestClassifier` em scikit-learn agrega probabilidades das árvores. Esta diferença é explicitada na aula. O demo tem apenas oito exemplos de treino e dois de teste e não é avaliação de desempenho de produção.
