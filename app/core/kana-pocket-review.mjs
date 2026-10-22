import {kana} from '../content/kana.mjs';
import {coachQuestion} from '../content/kana-coach.mjs';
import {memoryFor} from '../content/kana-memory.mjs';
import {confusionPairs} from '../content/confusions.mjs';

// Read the saved first answer; a later review must never grade it again.
export function pocketReview(state,id){
 const session=state.v3.sessions.find(s=>s.id===id);
 if(!session?.completedAt||session.source!=='kana-pocket-listen')return null;
 const entries=session.questionIds.map(qid=>{
  const question=coachQuestion(qid),answer=session.answers[qid];
  if(!question||!answer)return null;
  const chosen=Number.isInteger(answer.value)?question.options[answer.value]:undefined;
  return {question,item:question.reviewItem,answer,chosen:chosen??'原選項無法顯示',status:answer.correct?(answer.hinted?'提示後答對':'無提示首答答對'):'首答答錯'};
 });
 return entries.length&&entries.every(Boolean)?{session,entries}:null;
}

export function reviewCueItems(entry,revealed,personalText=''){
 const shown=entry.question.transcript+entry.chosen+(revealed?entry.question.explanation+personalText:'');
 return kana.filter(k=>shown.includes(k.glyph)).map(k=>k.id);
}

export function pocketContrast(entry){
 if(!entry||entry.answer.correct||!Number.isInteger(entry.answer.value))return null;
 const reference=kana.find(k=>k.id===entry.item),chosen=entry.question.options[entry.answer.value],selected=kana.find(k=>k.glyph===chosen);
 if(!reference||!selected||reference.id===selected.id||reference.script!==selected.script)return null;
 const pair=confusionPairs.find(p=>[p.leftId,p.rightId].includes(reference.id)&&[p.leftId,p.rightId].includes(selected.id));
 return {reference:{...reference,tip:memoryFor(reference.id).tip},selected:{...selected,tip:memoryFor(selected.id).tip},difference:pair?.difference||null};
}

export function contrastCueItems(pair){
 if(!pair)return [];
 const shown=[pair.reference,pair.selected].map(k=>k.glyph+k.reading+k.word+k.wordReading+k.meaning+k.tip).join('')+(pair.difference||'');
 return kana.filter(k=>shown.includes(k.glyph)).map(k=>k.id);
}
