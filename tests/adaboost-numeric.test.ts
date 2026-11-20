import {test} from 'node:test'
import assert from 'node:assert/strict'
import technique from '../src/techniques/adaboost/index.ts'

test('AdaBoost numérico treina e prevê classificação binária',()=>{
 const d={classes:2,points:[{x:.1,y:.1,label:0},{x:.2,y:.2,label:0},{x:.7,y:.8,label:1},{x:.8,y:.9,label:1}]}
 const model=technique.fit(d,{n_estimators:5,learning_rate:1})
 assert.equal(model.predict(.12,.12),0)
 assert.equal(model.predict(.76,.85),1)
})
test('AdaBoost numérico respeita as três classes do comparador',()=>{
 const d={classes:3,points:[{x:.1,y:.1,label:0},{x:.2,y:.2,label:0},{x:.5,y:.5,label:1},{x:.55,y:.55,label:1},{x:.9,y:.9,label:2},{x:.95,y:.95,label:2}]}
 const model=technique.fit(d,{n_estimators:10,learning_rate:1})
 for(const point of d.points){const p=model.predict(point.x,point.y);assert.ok(p>=0&&p<3)}
})
