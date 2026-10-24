import {memoryEvidence} from './memory-evidence.mjs';
import {resolveLearningQuestion} from '../content/catalog.mjs';
import {coachQuestion} from '../content/kana-coach.mjs';
import {studyDay} from './v3-state.mjs';
import {beginV3Session} from './v3-learning.mjs';
const ordinal=t=>Date.parse(studyDay(t))/86400000,day=n=>new Date(n*86400000).toISOString().slice(0,10);
const rank={review:2,uncertain:1,waiting:0,retained:0,week:0};
const goals=['K','L','N5','N4','N3','N2'],modes=['week','check','repair'];
export const dailyMemoryReference=(goal,mode,time)=>goal==='K'||goal==='L'?studyDay(time):goal+':'+studyDay(time);
export const dailyMemorySource=(goal,mode)=>(goal==='K'?'kana':goal==='L'?'life':'jlpt')+'-'+mode;
export function dailyMemoryParam(param=''){const [goal,mode,...extra]=param.split(':');return goals.includes(goal)&&modes.includes(mode)&&!extra.length?{goal,mode}:null;}

/** Never persist a recommendation or treat viewing this result as a learning event. */
export function dailyMemory(state,goal,time,{mode=null,evidence=memoryEvidence(state,time)}={}){
 const track=evidence.tracks.find(t=>t.goal===goal);if(!track)throw Error('找不到這個學習方向。');
 const today=ordinal(time),rows=track.items.filter(r=>goal!=='K'||['recognition','listening'].includes(r.dimension)).map(r=>{
  const last=Math.max(Date.parse(r.lastAt),Date.parse(r.lastCueAt||r.lastAt));
  const next=ordinal(new Date(last).toISOString())+1,week=next+6;
  return {...r,next,week,q:goal==='K'?coachQuestion('kc:check:'+r.item+':'+(r.dimension==='recognition'?'pair':'listen')):resolveLearningQuestion(r.item)};
 }).filter(r=>r.q);
 const done=m=>m!=='repair'&&state.v3.sessions.some(s=>s.source===dailyMemorySource(goal,m)&&s.reference===dailyMemoryReference(goal,m,time)&&Date.parse(s.createdAt)<=Date.parse(time));
 const select=m=>{
  if(done(m))return [];
  const eligible=rows.filter(r=>m==='repair'?rank[r.status]>0&&r.next>today:m==='week'?r.week<=today:r.next<=today);
  eligible.sort((a,b)=>rank[b.status]-rank[a.status]||Date.parse(a.lastAt)-Date.parse(b.lastAt)||a.item.localeCompare(b.item)||a.dimension.localeCompare(b.dimension));
  const seen=new Set(),out=[];for(const r of eligible){const key=goal==='K'?r.item:r.unitId;if(seen.has(key))continue;seen.add(key);out.push(r);if(out.length===(state.settings.dailyMinutes===5?1:3))break;}return out;
 };
 let chosen=mode,items=[];if(chosen&&modes.includes(chosen))items=select(chosen);else for(const m of modes){items=select(m);if(items.length){chosen=m;break;}}
 if(!items.length)chosen=rows.some(r=>r.next>today)?'wait':null;
 const upcoming=rows.filter(r=>r.next>today),history=Object.fromEntries(['hint','feedback','reference','legacy','answer'].map(k=>[k,track.items.reduce((n,r)=>n+r.history[k],0)]));
 // Kana abilities share one glyph timeline, so count a timeline once per item.
 if(goal==='K'){const unique=new Map(track.items.map(r=>[r.item,r.history]));for(const k of Object.keys(history))history[k]=[...unique.values()].reduce((n,h)=>n+h[k],0);}
 return {goal,mode:chosen,questionIds:items.map(r=>r.q.id),items:items.map(({q,next,week,...r})=>({...r,nextDay:day(next),weekDay:day(week)})),summary:{...track.current},history,priority:items.reduce((n,r)=>Math.max(n,rank[r.status]),0),waiting:upcoming.length,nextDay:upcoming.length?day(Math.min(...upcoming.map(r=>r.next))):null,weekDay:rows.length?day(Math.min(...rows.map(r=>r.week))):null};
}

/** Called inside the existing storage transaction, after protecting pending work. */
export function startDailyMemory(state,{goal,mode,id,time}){
 if(!goals.includes(goal)||!modes.includes(mode))return state;
 const r=dailyMemory(state,goal,time,{mode});if(r.mode!==mode||!r.questionIds.length)return state;
 return beginV3Session(state,r.questionIds,{id,time,source:dailyMemorySource(goal,mode),reference:goal==='K'&&mode==='repair'?r.items.map(r=>r.item).join(':'):dailyMemoryReference(goal,mode,time)});
}
