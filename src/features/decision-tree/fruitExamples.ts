/** Um único conjunto didático compartilhado pela aula, pelo código e pelo laboratório. */
export type FruitExample = {
  id: number
  color: 'Vermelha' | 'Esverdeada' | 'Alaranjada' | 'Amarelada'
  skin: 'Lisa' | 'Rugosa'
  label: 'Maçã' | 'Laranja'
}
export const fruitExamples: FruitExample[] = [
  {id:1,color:'Vermelha',skin:'Lisa',label:'Maçã'},
  {id:2,color:'Alaranjada',skin:'Rugosa',label:'Laranja'},
  {id:3,color:'Esverdeada',skin:'Lisa',label:'Maçã'},
  {id:4,color:'Vermelha',skin:'Rugosa',label:'Maçã'},
  {id:5,color:'Alaranjada',skin:'Rugosa',label:'Laranja'},
  {id:6,color:'Vermelha',skin:'Lisa',label:'Maçã'},
  {id:7,color:'Amarelada',skin:'Rugosa',label:'Laranja'},
  {id:8,color:'Esverdeada',skin:'Lisa',label:'Maçã'},
  {id:9,color:'Vermelha',skin:'Rugosa',label:'Maçã'},
  {id:10,color:'Alaranjada',skin:'Rugosa',label:'Laranja'},
]
export const trainingFruits = fruitExamples.slice(0,8)
export const testingFruits = fruitExamples.slice(8)
