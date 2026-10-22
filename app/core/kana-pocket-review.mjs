import {kana} from '../content/kana.mjs';
import {coachQuestion} from '../content/kana-coach.mjs';

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
