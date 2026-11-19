# Gradient Boosting — pasta da técnica

- `GradientBoostingLesson.tsx`: aula progressiva, SVG das árvores, laboratório, tabela de parâmetros, indicações e notebook.
- `boostingModel.ts`: simulador puro e determinístico de gradient boosting binário logístico (frutas categóricas, gradiente + Newton regularizado). Mudar as etapas faz os cálculos mudarem.
- `pythonCells.ts`: células editáveis e explicadas, renderizadas por `components/learning/CodeNotebook.tsx`.
- `../../techniques/gradient-boosting/index.ts`: registro `ready` e implementação para o playground numérico genérico e comparações.
- `../../pages/TechniquePage.tsx`: mapa de rotas de páginas especiais (uma entrada para esta técnica).

O simulador do Atlas é uma implementação educativa, não uma reprodução exata dos parâmetros e decisões do `GradientBoostingClassifier` do scikit-learn. Ambos otimizam uma perda logística usando árvores sequenciais. As árvores do Atlas exibem **correções numéricas**, não votos de classes.

O exemplo usa as mesmas dez frutas das páginas de Decision Tree e Random Forest, com oito de treino e duas de teste.
