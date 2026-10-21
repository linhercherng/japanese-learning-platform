import {kana} from './content/kana.mjs';
import {coachQuestion,coachSources,confusionQuestions,validCoachReference} from './content/kana-coach.mjs';
import {startKanaCheck,kanaConfusions} from './core/kana-coach.mjs';
import {beginV3Session} from './core/v3-learning.mjs';
import {studyDay} from './core/v3-state.mjs';
import {kanaMapView,kanaConfusionsView,kanaCheckView} from './ui/kana-coach.mjs';
export function createKanaCoach({getState,getContext,update,render,toast,now,id}){
 const selection=()=>getContext().session.kanaCoach??={script:'hira',group:'basic',ability:'recognition',status:'all'};
 async function action(d){
  if(d.coachAction==='check-start'){
   const time=now(),sessionId=id();let destination;
   await update(s=>{const next=startKanaCheck(s,{id:sessionId,time});destination=next.v3.sessions.find(p=>p.source==='kana-check'&&p.reference===studyDay(time))?.id;return next;});
   if(!destination){toast('目前沒有尚未作答的跨日項目，可以先做少量加練。');render(false);return;}location.hash=`v3-practice/${destination}`;return;
  }
  let questions,source,reference;
  if(d.coachAction==='confusion-start'){
   if(!kanaConfusions(getState()).some(p=>p.reference===d.coachPair))throw new Error('請先選擇已保存的混淆字組。');
   source='kana-confusion';reference=d.coachPair;questions=confusionQuestions(reference);
  }else if(d.coachAction==='map-practice'){
   if(!kana.some(k=>k.id===d.coachItem)||!['recognition','listening'].includes(d.coachDimension))throw new Error('請選擇有效的字卡與能力。');
   source='kana-map';reference=d.coachItem;questions=[coachQuestion(`kc:check:${reference}:${d.coachDimension==='recognition'?'pair':'listen'}`)];
  }else return;
  const sessionId=id(),time=now(),questionIds=questions.map(q=>q.id);let destination;
  await update(s=>{const next=beginV3Session(s,questionIds,{id:sessionId,source,reference,time});destination=next.v3.sessions.find(p=>p.source===source&&p.reference===reference&&!p.completedAt&&JSON.stringify(p.questionIds)===JSON.stringify(questionIds)).id;return next;});location.hash=`v3-practice/${destination}`;
 }
 function click(event){const button=event.target.closest('button');if(!button)return;const d={...button.dataset};if(d.coachScript){if(['hira','kata'].includes(d.coachScript)){selection().script=d.coachScript;render(false);}return;}if(!d.coachAction)return;button.disabled=true;action(d).catch(error=>toast(error.message)).finally(()=>{if(button.isConnected)button.disabled=false;});}
 function change(event){const key=event.target.dataset.coachFilter,value=event.target.value,allowed={script:['hira','kata'],group:['all','basic','voiced','semivoiced','contracted'],ability:['recognition','listening','writing'],status:['all','review','unseen']};if(!allowed[key]?.includes(value))return;selection()[key]=value;render(false);}
 document.addEventListener('click',click);document.addEventListener('change',change);
 return {views:{'kana-map':item=>kanaMapView(getContext(),item,now()),'kana-confusions':pair=>kanaConfusionsView(getContext(),pair),'kana-check':()=>kanaCheckView(getContext(),now())},validateCatalog(state){
  for(const a of state.attempts)if(a.kanaConfusion&&(!kana.some(k=>k.id===a.kanaConfusion.target)||!kana.some(k=>k.id===a.kanaConfusion.chosen)))throw new Error('備份含未知假名混淆字');
  for(const s of state.v3.sessions)if(coachSources.includes(s.source)&&(!validCoachReference(s.source,s.reference,s.queue.map(q=>q.questionId))||s.source==='kana-check'&&s.reference!==studyDay(s.createdAt)))throw new Error('備份含不一致的五十音教練輪次');
 },dispose(){document.removeEventListener('click',click);document.removeEventListener('change',change);}};
}
