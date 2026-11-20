# Capítulo: Redes neurais

Esta pasta contém a introdução à ideia de redes neurais, antes da página específica de MLP.

- `NeuralNetworksChapter.tsx`: **uma aula** com seis etapas, um único diagrama progressivo, parâmetros resumidos e links para as arquiteturas.
- `neuralDemoModel.ts`: representação de cinco entradas (quatro cores em one-hot + casca lisa), dois neurônios ocultos e uma saída sigmoide. Inclui propagação para frente, perda logística e treinamento SGD por retropropagação.
- O conjunto de frutas e a divisão de **8 para treino + 2 para teste** são importados de `features/decision-tree/fruitExamples.ts`. O desenho da tabela é o mesmo `DataTable` da Decision Tree.
- A interface não tenta ensinar a MLP completa. O exemplo é uma rede pequena para ilustrar **entradas → camada oculta → saída → ajuste dos pesos**.
- O botão “Treinar 10 épocas” passa somente pelos **oito exemplos de treino**. Ele não usa as respostas do teste nem garante melhoria fora do treino.

## Como editar

- Textos das etapas: `chapters` em `NeuralNetworksChapter.tsx`.
- Desenho da rede: `NetworkSketch` no mesmo arquivo.
- Pesos iniciais, entradas e rotina de treinamento: `neuralDemoModel.ts`.
- Modelos relacionados: `nextTopics` em `NeuralNetworksChapter.tsx`.
- A rota é selecionada por `src/pages/KnowledgePage.tsx` quando o conceito é `Redes neurais`.
