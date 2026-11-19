# Atlas de IA

Caderno interativo para estudar Inteligência Artificial do intuitivo ao técnico. O projeto usa React, TypeScript, Vite e Material UI.

## Rodar

```bash
npm install
npm run dev
npm run build
```

## Como o projeto está organizado

```text
src/
  core/          tipos, dados, métricas e lógica compartilhada
  techniques/    uma pasta por técnica; registry automático
  components/    navegação, cartões, canvas e controles MUI
  pages/         Home, biblioteca, estudo da técnica e comparação
  state/         comparação, dados, treino e anotações
  theme.ts       identidade visual global do Material UI
```

## Adicionar uma técnica pronta

1. Copie `src/techniques/_template/` para `src/techniques/<id>/`.
2. Renomeie `index.ts.example` para `index.ts`.
3. Preencha os campos do modelo, principalmente: `id`, `name`, `summary`, `hierarchy`, `compareGroups`, `traits`, `params`, `fit` e `explain`.
4. Pronto: `src/techniques/registry.ts` descobre a pasta automaticamente. Não é necessário editar a Home, a biblioteca ou o menu.

### Como organizar a hierarquia

`hierarchy` tem três níveis:

- `area`: área macro, por exemplo `Aprendizado de máquina`.
- `concept`: conceito mais amplo, por exemplo `Redes neurais` ou `Aprendizado supervisionado`.
- `family`: família de modelos, por exemplo `Redes convolucionais` ou `Modelos baseados em árvores`.

A técnica em si é o nível seguinte: `CNN`, `Decision Tree`, `Random Forest` etc. O menu lateral monta a árvore automaticamente com esses campos.

### Como organizar comparações

`compareGroups` é independente da hierarquia. Uma técnica pode aparecer em mais de um grupo. Por exemplo, SOM pode pertencer à navegação de redes neurais e também ao grupo de comparação `Agrupamento`. Isso permite comparar por tarefa ou por família, sem duplicar a técnica no catálogo.

## Técnicas em preparação

Cadastre conceitos sem playground em `src/techniques/planned.ts`. Quando a implementação pronta com o mesmo `id` for criada em sua própria pasta, o catálogo substitui a entrada planejada automaticamente.

## Limitações atuais

- Os playgrounds existentes são 2D, com dois atributos e classes coloridas. Imagens, textos e séries temporais precisarão de componentes de demonstração próprios.
- A métrica de acerto atual é calculada nos mesmos pontos usados no treino; não representa desempenho em dados novos.
- Anotações e seleção de comparação são armazenadas no `localStorage` do navegador.

## Páginas de conhecimento e comparação

- `/conceito/:id`: páginas de **área**, **conceito** e **família** com introdução, fluxo visual, explicação do aprendizado, modelos relacionados, matemática e exemplo Python.
- A árvore do menu é montada a partir de `hierarchy` das técnicas e agora cada nível possui um link para sua página.
- `src/core/knowledge.ts` mantém os textos didáticos e a composição dos nós. Adicione conteúdo específico no objeto `lessons` para substituir a explicação introdutória padrão de um conceito.
- `src/components/LearningDemo.tsx` oferece uma demonstração didática de um neurônio com entrada, peso, viés, alvo e passo de gradiente. **Não** é o mesmo algoritmo usado no playground de MLP.
- `/tecnica/:id` continua sendo a página de cada técnica, incluindo itens ainda em preparação.
- `compareGroups` são etiquetas de tarefa/família **independentes** da navegação. O laboratório permite seleção transversal e traz uma ficha comparativa qualitativa. As demos compartilham os pontos, mas o acerto exibido é de treino, não um benchmark.

### Adicionar uma técnica

Crie `src/techniques/<id>/index.ts` exportando um `ReadyTechnique` como padrão. Preencha `hierarchy: { area, concept, family }` para posicionar na árvore e `compareGroups` para disponibilizar comparações por tarefa e arquitetura. Não é preciso registrar a técnica manualmente em uma lista. Para uma explicação didática exclusiva de uma nova área ou conceito, acrescente-a em `src/core/knowledge.ts`.

## Experiência de estudo (revisão editorial)

- **Início**: introdução e roteiro progressivo, sem catálogo de cards.
- **Trilha lateral**: áreas e capítulos. As famílias e técnicas são descobertas dentro dos capítulos, para evitar quatro níveis de acordeões simultâneos.
- **Páginas de conceitos**: leitura contínua, exemplo contextualizado, etapas, demonstração quando disponível, subcapítulos, matemática e Python.
- **Ordem**: definida em `src/core/course.ts`; conteúdo aprofundado em `src/pages/KnowledgePage.tsx` (objeto `editorial`).
- **Conteúdo ainda introdutório**: assuntos sem texto editorial específico continuam usando as explicações de `src/core/knowledge.ts`. Antes de publicar como curso completo, substituir esses roteiros genéricos por capítulos escritos para cada conceito.

## Versão: mini curso conectado

A interface agora tem **duas maneiras de entrar**:

- **Aprender na ordem**: abra `Aprendizado de máquina`, depois `Aprendizado supervisionado`, `Aprendizado não supervisionado`, `Árvores de decisão`, `Redes neurais` e `Agrupamento` no menu lateral.
- **Ir direto à técnica**: use a busca no menu (que mostra todas as técnicas ao clicar em “Ver todas”) ou procure na Home e na biblioteca.

A página `Aprendizado de máquina` compara supervisionado e não supervisionado usando a **mesma banca de frutas**. Os capítulos seguintes continuam o exemplo e trazem diagramas SVG com três etapas controladas pelo leitor. As páginas de conceito têm links diretos para os algoritmos (inclusive os ainda sem playground), uma pequena tabela comparativa e indicações explícitas de conexão com outros assuntos. As páginas dos modelos preservam seus playgrounds originais.

### Arquivos principais do novo conteúdo

- `src/core/studyGuide.ts`: textos para iniciantes, ordem dos capítulos, explicações rápidas e vínculos entre técnicas e conceitos.
- `src/core/advancedExamples.ts`: pequenos exemplos opcionais e ilustrativos em Python, usando os mesmos dados sintéticos de frutas. Requer `scikit-learn` para executar.
- `src/components/FruitJourney.tsx`: ilustração SVG e demonstrações em etapas; o desenho é código vetorial, não uma imagem estática externa.
- `src/pages/KnowledgePage.tsx`: capítulos conectados, comparação entre modos de aprendizado, chips de acesso às técnicas e aprofundamento opcional.
- `src/components/Header.tsx`: percurso reduzido e busca direta por algoritmos.

**Importante:** As frutas são apenas um exemplo didático, não um conjunto confiável para classificar frutas de verdade. Os playgrounds usam coordenadas de pontos sintéticos, não medidas reais de frutas. As técnicas “em preparação” possuem uma introdução e um link ao conceito, mas não uma demo própria.

## Revisão didática: Decision Tree (novembro de 2026)

- Aula de frutas com conjunto consistente: maçãs vermelhas ou amareladas, laranjas alaranjadas ou amareladas, sem a combinação incorreta "alaranjada + lisa = maçã". As oito frutas de treino são distintas das duas reservadas para teste.
- No terceiro passo, a escolha da divisão por Gini aparece junto com a primeira árvore parcial.
- Na página de Decision Tree, o antigo laboratório de pontos genéricos foi substituído por um laboratório específico com as mesmas frutas da aula. Os controles `max_depth` e `min_samples_split` recalculam a árvore e as previsões de teste.
- O desenho profundo na seção de limitações é apenas ilustrativo: não representa uma árvore ajustada às dez frutas.
- A tabela de vantagens, limites e casos de uso fica na própria página individual.

**Nota de avaliação:** o conjunto de teste da aula tem somente dois exemplos, para visualização do fluxo; não é evidência de desempenho estatístico. A aula e o laboratório recalculam as divisões com impureza de Gini. Os demais algoritmos ainda mantêm seus laboratórios anteriores.

## Organização das aulas por técnica

A tela de **Decision Tree** foi separada em `src/features/decision-tree/` (veja o README dessa pasta): aula, laboratório, dados, prós/contras e células Python. O componente de notebook visual fica em `src/components/learning/CodeNotebook.tsx` e pode ser reutilizado por qualquer outra técnica passando um array de células. Para editar somente o conteúdo de Python da Decision Tree, abra `src/features/decision-tree/pythonCells.ts`; para editar apenas as frutas, abra `fruitExamples.ts`.

O notebook é **visual, não um interpretador Python**: os botões copiam código para um ambiente como Google Colab. Atualmente `TechniquePage.tsx` ainda referencia explicitamente os componentes específicos de Decision Tree; uma futura extensão poderá adotar um registro de páginas próprias por técnica.


## Página de modelos baseados em árvores

A navegação de **Aprendizado de máquina → Aprendizado supervisionado → Modelos baseados em árvores** reúne Decision Tree, Random Forest, Gradient Boosting, XGBoost e AdaBoost. As técnicas mantêm pastas e aulas independentes.

A introdução dessa família fica em `src/features/tree-models/TreeModelsChapter.tsx`. Para editar a comparação de uso, altere `src/components/TreeFamilyGuide.tsx`. Para inserir uma técnica nova nessa família, use `hierarchy.family: 'Modelos baseados em árvores'` no cadastro da técnica (ou em `src/techniques/planned.ts` para conteúdos em preparação).
