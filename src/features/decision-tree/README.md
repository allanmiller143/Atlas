# Decision Tree — conteúdo isolado

- `DecisionTreeLesson.tsx`: os cinco passos da aula e os textos didáticos.
- `DecisionTreeFruitLab.tsx`: laboratório interativo, algoritmo de divisão (`grow`) e diagrama SVG (`TreeDiagram`).
- `DecisionTreeTradeoffs.tsx`: quando usar, limitações e árvore grande.
- `fruitExamples.ts`: única fonte dos dados de frutas usados na aula e no laboratório.
- `pythonCells.ts`: cinco células Python (título, explicação, código e resultado esperado).

A página é montada em `src/pages/TechniquePage.tsx`. O componente de notebook está em `src/components/learning/CodeNotebook.tsx` para ser reaproveitado por outros algoritmos.

Para criar uma técnica nova, registre sua definição em `src/techniques/`, adicione uma pasta em `src/features/<slug>/` para as demonstrações exclusivas e reaproveite `CodeNotebook` e os demais componentes compartilhados. A área da técnica é carregada em `TechniquePage`; a extração para um registro de páginas plugáveis é uma evolução posterior, não uma funcionalidade já pronta.
