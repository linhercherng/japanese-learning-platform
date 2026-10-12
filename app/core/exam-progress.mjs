import {advanceExam} from './exam.mjs';
import {gradeQuestion} from './study.mjs';
import {recordAnswers} from './learning.mjs';
/** Run inside the storage queue, using the latest persisted session. */
export function transitionExamState(state,form,time,{sessionId,sectionIndex,submit=false,abandon=false}={}){
 const current=state.activeExam;
 if(!current||current.id!==sessionId||current.sectionIndex!==sectionIndex)return state;
 const next=advanceExam(current,form,time,{submit,abandon});
 if(next.status==='active')return {...state,activeExam:next,revision:state.revision+1};
 if(state.examAttempts.some(a=>a.id===next.id))return {...state,activeExam:null};
 if(state.examAttempts.length>=100)throw new Error('模擬紀錄已達100次，請先匯出備份。');
 const questions=new Map(form.sections.flatMap(s=>s.questions).map(q=>[q.id,q]));
 const updated=recordAnswers(state,Object.entries(next.answers).map(([qid,a])=>{const q=questions.get(qid);if(!q)throw new Error('試卷題目不正確');return {id:`${next.id}-${qid}`,item:qid,dimension:q.dimension,correct:gradeQuestion(q,a.value),hinted:false,time:a.time};}));
 return {...updated,activeExam:null,examAttempts:[...updated.examAttempts,next],revision:updated.revision+1};
}
