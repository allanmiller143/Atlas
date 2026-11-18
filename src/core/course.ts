import { KNOWLEDGE, knowledgeById, type KnowledgeNode } from './knowledge.ts'

const priority = ['Aprendizado de máquina','Aprendizado supervisionado','Aprendizado não supervisionado','Redes neurais','Árvores de decisão','Agrupamento','Modelos lineares','Ensembles de árvores','Perceptrons multicamadas']
export const ordered = (nodes: KnowledgeNode[]) => [...nodes].sort((a,b) => {
 const ia=priority.indexOf(a.name),ib=priority.indexOf(b.name)
 if(ia>=0||ib>=0) return (ia<0?999:ia)-(ib<0?999:ib)
 return a.name.localeCompare(b.name,'pt')
})
export const mainCourse = ordered(KNOWLEDGE.filter(n=>n.level==='area')).flatMap(area => [area,...ordered(KNOWLEDGE.filter(n=>n.parent===area.id))])
export const nextLesson = (id:string) => {const i=mainCourse.findIndex(n=>n.id===id);return i>=0?mainCourse[i+1]:undefined}
export const previousLesson = (id:string) => {const i=mainCourse.findIndex(n=>n.id===id);return i>0?mainCourse[i-1]:undefined}
export const firstLesson = mainCourse.find(n=>n.name==='Aprendizado de máquina') ?? mainCourse[0]
export const rootOf = (node:KnowledgeNode):KnowledgeNode => node.parent ? rootOf(knowledgeById(node.parent)!) : node
