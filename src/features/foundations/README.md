# Fundamentos do Atlas

`FoundationsChapters.tsx` contém três capítulos introdutórios independentes:

- `ml`: apresenta observações, características, tarefa, algoritmo, modelo e avaliação.
- `supervised`: mostra conjunto completo, divisão treino/teste, treinamento ilustrativo, previsão e conferência.
- `unsupervised`: mostra a ausência de rótulos, diferentes critérios de semelhança, agrupamentos ilustrativos e interpretação.

As três páginas compartilham a **estrutura visual** e os exemplos de frutas de `../decision-tree/fruitExamples.ts`, mas cada uma contém cenas e explicações próprias. O conjunto de frutas não deve ser alterado numa página isolada.

Edite os textos no objeto `chapters`, e os desenhos em `MlScene`, `SupervisedScene` e `UnsupervisedScene`.

O exemplo supervisionado é explicitamente ilustrativo, e o agrupamento por textura/cor não é apresentado como resultado executado por K-means. O componente é chamado em `pages/KnowledgePage.tsx` por uma escolha de capítulo, sem alterar o registro de técnicas especializadas.
