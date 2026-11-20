# XGBoost — página didática independente

- `XGBoostLesson.tsx`: narrativa visual em oito passos, diagramas SVG, matemática opcional, laboratório, vantagens e notebook.
- `xgbModel.ts`: aproximação didática calculada de XGBoost binário, com perda logística, gradientes/hessianas, regularização L2 e gamma. Não é substituto do pacote oficial.
- `pythonCells.ts`: células do notebook com o pacote real `xgboost`.
- `../../techniques/xgboost/index.ts`: técnica disponível no catálogo e comparador numérico; modelo numérico separado do laboratório de frutas.

A página é registrada por ID em `src/pages/TechniquePage.tsx`. A navegação hierárquica é alimentada pelo cadastro da técnica.

Para editar os textos, procure o array `lessons`. Para mudar a experiência visual, edite os blocos `step===...`. Para mudar o comportamento do modelo didático, edite `xgbModel.ts` e execute `node --experimental-strip-types --test tests/xgboost.test.ts`.

A fruta esverdeada número 3 faz parte do treinamento e é usada para **explicar** o percurso, nunca como evidência de desempenho fora da amostra. As frutas 9 e 10 são reservadas para teste. A probabilidade inicial da demonstração é a proporção empírica 5/8, uma escolha didática; implementações reais do XGBoost têm convenções de inicialização e otimizações próprias.
