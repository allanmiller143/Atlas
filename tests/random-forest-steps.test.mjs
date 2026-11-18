import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source=readFileSync(new URL('../src/features/random-forest/RandomForestLesson.tsx',import.meta.url),'utf8')
test('a aula apresenta seis etapas visuais distintas',()=>{
 const block=source.slice(source.indexOf('const lessons=['),source.indexOf('\nfunction LabelTag'))
 assert.equal((block.match(/\{title:/g)||[]).length,6)
 for(const step of [0,1,2,3,4,5]) assert.ok(source.includes(`step===${step}&&`))
})
test('o passo do Gini mostra a impureza de cada árvore a partir da amostra',()=>{
 assert.match(source,/function GiniTrees/)
 assert.match(source,/root\.samples/)
 assert.match(source,/Gini inicial/)
 assert.match(source,/Após dividir/)
 assert.match(source,/max_features = 1/)
})
