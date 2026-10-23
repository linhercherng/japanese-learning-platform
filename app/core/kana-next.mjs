import {kana} from '../content/kana.mjs';
import {initialState,recordAnswers} from './learning.mjs';
import {studyDay} from './v3-state.mjs';
import {nextDayCandidates} from './kana-coach.mjs';
import {weekSchedule} from './kana-recall.mjs';
import {selectRepairQuestions} from './kana-focus.mjs';
import {parseDictation} from './kana-studio-state.mjs';
const ids=new Set(kana.map(k=>k.id)),isKana=s=>s.source==='kana'||s.source.startsWith('kana-');
export function kanaNextStep(state,time){
 const cutoff=Date.parse(time),day=studyDay(time),visible=t=>Date.parse(t)<=cutoff;
 const attempts=state.attempts.filter(a=>visible(a.time)),sessions=state.v3.sessions.filter(s=>visible(s.createdAt)).map(s=>({...s,completedAt:s.completedAt&&visible(s.completedAt)?s.completedAt:null}));
 const snapshot={...state,attempts,reviews:recordAnswers(initialState(),attempts).reviews,v3:{...state.v3,sessions}};
 const today=new Set(attempts.filter(a=>ids.has(a.item)&&['recognition','listening','language'].includes(a.dimension)&&studyDay(a.time)===day).map(a=>a.item)).size;
 const result=(kind,route,title,reason)=>({kind,route,title,reason,today});
 const pending=sessions.filter(s=>isKana(s)&&!s.completedAt).map(s=>({time:s.createdAt,key:s.id,route:'v3-practice/'+s.id,reason:'原題、首答與提示已保存，先完成這輪，再選新練習。'}));
 for(const [key,draft] of Object.entries(state.drafts))if(key.startsWith('write:KS-')){
  const m=parseDictation(key,draft);if(visible(m.createdAt)&&!attempts.some(a=>a.id==='ksw-'+m.id))pending.push({time:m.createdAt,key:m.id,route:'kana-dictation/'+m.item,reason:m.lockedAt&&visible(m.lockedAt)?'原字跡已鎖定，接著對照並保存自評。':'原字跡草稿仍保留，接著寫就好。'});
 }
 pending.sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)||a.key.localeCompare(b.key));
 if(pending.length)return result('resume',pending[0].route,'接續未完成的一小步',pending[0].reason);
 const done=source=>sessions.some(s=>s.source===source&&s.completedAt&&visible(s.completedAt)&&studyDay(s.completedAt)===day);
 if(!done('kana-week')&&weekSchedule(snapshot,time).questions.length)return result('week','kana-week','隔了七天，先回想一次','有符合日期與提示條件的項目；先檢查，再看線索。');
 if(!done('kana-check')&&nextDayCandidates(snapshot,time).length)return result('check','kana-check','先做今天的隔天檢查','從較早練過、今天還沒作答的能力開始；不補新字湊題。');
 if(!done('kana-repair')&&selectRepairQuestions(snapshot,time).length)return result('repair','kana-repair','只補強最多三個字','依已知認字或聽辨弱點，每字先練一種能力。');
 const pocket=Object.values(state.v3.kanaPocket||{}).some(p=>p.active&&visible(p.time));
 if(pocket&&!done('kana-pocket-listen')&&!done('kana-contrast'))return result('pocket','kana-pocket','想起口袋裡的字','先挑最多三字；要自查或收起字卡聽音，都由你決定。');
 if(today)return result('finish','kana-recall','今天可以先收尾','已留下回想紀錄；看看小結，隔天再確認，不必一直重做。');
 return result('new','kana-mini','先從三個字開始','認字、聽辨，再把聲音放回生活詞；每次少量就好。');
}
