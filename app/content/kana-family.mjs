import {kana} from './kana.mjs';import {memoryFor} from './kana-memory.mjs';
const byId=new Map(kana.map(k=>[k.id,k])),raw=new Map();
const mark=glyph=>glyph.normalize('NFD').includes('\u309a')?'ring':glyph.normalize('NFD').includes('\u3099')?'dots':'plain';
export const familyMark=item=>byId.has(item)?mark(byId.get(item).glyph):null;
for(const k of kana){const key=k.script+':'+k.glyph.normalize('NFD').replace(/[\u3099\u309a]/g,'');if(!raw.has(key))raw.set(key,[]);raw.get(key).push(k);}
export const families=[...raw.values()].filter(m=>m.length>=2&&m.some(k=>mark(k.glyph)==='plain')).map(m=>{const members=m.slice().sort((a,b)=>['plain','dots','ring'].indexOf(mark(a.glyph))-['plain','dots','ring'].indexOf(mark(b.glyph)));return {id:members[0].id,script:members[0].script,group:members[0].group,members};});
export const familyById=new Map(families.map(f=>[f.id,f]));
export const familyMarkLabels={plain:'原字',dots:'加兩點',ring:'加小圈'};
export const familyQuestions=families.flatMap(f=>f.members.map(k=>({id:'kg:'+f.id+':'+k.id,reviewItem:k.id,cueItems:f.members.map(m=>m.id),kind:'listen',dimension:'listening',level:'K',unitId:f.group==='contracted'?'K14':'K13',transcript:k.glyph,prompt:'先聽一音，從同一家族選字。',options:[k.glyph,...f.members.filter(m=>m.id!==k.id).map(m=>m.glyph)],correct:0,explanation:'這個家族：'+f.members.map(m=>m.glyph+'（'+m.reading+'，'+familyMarkLabels[familyMark(m.id)]+'）').join('、')+'。先認原字，再留意右上的標記；這裡是小組聽辨加練。'})));
const questions=new Map(familyQuestions.map(q=>[q.id,q]));
export const familyQuestion=id=>questions.get(id)||null;
export const familyIds=id=>(familyById.get(id)?.members||[]).map(k=>'kg:'+id+':'+k.id);
export function validFamilyReference(id,ids){const expected=familyIds(id);return expected.length>=2&&Array.isArray(ids)&&JSON.stringify(expected)===JSON.stringify(ids);}
export function familyVisibleItems(id,selected){
 const k=familyById.get(id)?.members.find(k=>k.id===selected);if(!k)return [];const text=k.glyph+k.reading+k.word+k.wordReading+memoryFor(k.id).tip;
 return kana.filter(k=>text.includes(k.glyph)).map(k=>k.id);
}
export function nextFamily(id){const f=familyById.get(id);if(!f)return null;const pool=families.filter(p=>p.script===f.script);return pool[(pool.findIndex(p=>p.id===id)+1)%pool.length].id;}
