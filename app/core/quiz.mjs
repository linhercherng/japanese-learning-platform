const shuffled=list=>[...list].sort(()=>Math.random()-.5);
export function makeKanaQuiz(items,all){
 const questions=[];
 for(const target of items){
  const sameLesson=items.filter(k=>k.script===target.script&&k.reading!==target.reading);
  const pool=sameLesson.length>=2?sameLesson:all.filter(k=>k.script===target.script&&k.group===target.group&&k.reading!==target.reading);
  const different=[...new Map(pool.map(k=>[k.reading,k])).values()];
  if(!different.length)continue;
  for(const dimension of ['recognition','listening']){
   const choices=shuffled([target,...shuffled(different).slice(0,3)]);
   questions.push({item:target.id,dimension,prompt:dimension==='recognition'?'這個字怎麼讀？':'聽一遍，選出對應的字。',glyph:dimension==='recognition'?target.glyph:null,audio:dimension==='listening'?target.glyph:null,options:choices.map(k=>({value:k.id,label:dimension==='recognition'?k.reading:k.glyph})),correct:choices.findIndex(k=>k.id===target.id),explanation:`${target.glyph} 的輔助讀音是 ${target.reading}。把字形與聲音連在一起。`});
  }
 }
 return questions;
}
