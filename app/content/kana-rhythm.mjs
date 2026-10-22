import {rhythmCards,rhythmGroups} from './kana-focus.mjs';
const cards=new Map(rhythmCards.map(c=>[c.id,c]));
export const rhythmQuestions=rhythmCards.map(c=>({id:'kr:'+c.id,reviewItem:'kr:'+c.id,rhythmCard:c.id,kind:'listen',dimension:'listening',level:'K',unitId:({small:'K14',stop:'K15',nasal:'K17',long:'K16'})[c.group],transcript:c.audio,prompt:'聽完整詞，這個詞有幾拍？',options:[c.beats.length,...[1,2,3,4,5].filter(n=>n!==c.beats.length).slice(0,3)].map(n=>n+'拍'),correct:0,explanation:c.jp+'（'+c.reading+'）：'+c.beats.join('・')+'，共'+c.beats.length+'拍。'+c.tip+' '+rhythmGroups.find(g=>g.id===c.group).tip}));
const questions=new Map(rhythmQuestions.map(q=>[q.id,q]));
export const rhythmQuestion=id=>questions.get(id)||null;
export function rhythmIds(card){const c=cards.get(card);if(!c)return [];const group=rhythmCards.filter(k=>k.group===c.group),i=group.indexOf(c);return [1,2,0].map(n=>'kr:'+group[(i+n)%3].id);}
export function validRhythmReference(card,ids){const expected=rhythmIds(card);return expected.length===3&&Array.isArray(ids)&&JSON.stringify(expected)===JSON.stringify(ids);}
export function rhythmCueSeen(hints,q,createdAt,time){const cue=hints?.[q.rhythmCard],day=t=>new Date(t).toLocaleDateString('en-CA',{timeZone:'Asia/Taipei'});return Boolean(cue&&Date.parse(cue)<=Date.parse(time)&&(Date.parse(cue)>=Date.parse(createdAt)||day(cue)===day(time)));}
export function validRhythmHints(hints){return Boolean(hints&&typeof hints==='object'&&!Array.isArray(hints)&&Object.entries(hints).every(([id,t])=>cards.has(id)&&typeof t==='string'&&/^\d{4}-\d\d-\d\dT/.test(t)&&Number.isFinite(Date.parse(t))));}
