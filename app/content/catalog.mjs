import {resolveKanaWordQuestion} from './kana-words.mjs';
import {coachQuestion} from './kana-coach.mjs';
import {kana,kanaLessons,kanaPhonology} from './kana.mjs';
import {lifeLessons as originalLife} from './life.mjs';
import {additionalLifeLessons} from './life-expanded.mjs';
import {supplements} from './life-v2-supplement.mjs';
import {units as n5Units} from './n5.mjs';
import {units as n4Units} from './n4.mjs';
import {scenarios as n5Scenes} from './n5-scenarios.mjs';
import {scenarios as n4Scenes} from './n4-scenarios.mjs';
import {words as n5Lexicon} from './n5-lexicon.mjs';
import {units as n3Units} from './n3.mjs';
import {scenarios as n3Scenes} from './n3-scenarios.mjs';
import {forms as n5Forms} from './n5-exams.mjs';
import {forms as n4Forms} from './n4-exams.mjs';
import {forms as n3Forms} from './n3-exams.mjs';
import {words as n4Lexicon} from './n4-lexicon.mjs';
import {words as n3Lexicon} from './n3-lexicon.mjs';
import {units as n2Units} from './n2.mjs';
import {scenarios as n2Scenes} from './n2-scenarios.mjs';
import {forms as n2Forms} from './n2-exams.mjs';
import {words as n2Lexicon} from './n2-lexicon.mjs';
import {v3Questions} from './practice-v3.mjs';
import {supportLessons} from './learning-support.mjs';
import {readingLessons} from './support-readings.mjs';
import {kanaDrills} from './kana-drills.mjs';
export {v3Questions} from './practice-v3.mjs';
export {deepLessons} from './deep-lessons.mjs';
export const topics=[['greetings','招呼與自介'],['family','家庭與人際'],['schedule','時間與行程'],['food','飲食與餐廳'],['shopping','購物與付款'],['transport','交通與問路'],['travel','住宿與旅遊'],['weather','天氣與季節'],['health','身體與就醫'],['help','緊急與求助'],['routine','日常作息'],['school','學校與學習'],['work','工作與職場'],['hobbies','興趣與休閒'],['sport','運動與活動'],['home','租屋與居家'],['mail','郵局與寄送'],['public','銀行與公共服務'],['technology','手機與網路'],['culture','文化與交流']];
export const levels=['N5','N4','N3','N2'];
export const lifeLessons=[...originalLife,...additionalLifeLessons].sort((a,b)=>a.id.localeCompare(b.id));
export const units=[...n5Units,...n4Units,...n3Units,...n2Units];
export const scenarios=[...n5Scenes,...n4Scenes,...n3Scenes,...n2Scenes].map(scene=>({...scene,minutes:20,vocabulary:scene.words.map(w=>{const ex=scene.dialogue.find(d=>d.jp.includes(w.jp));return {...w,example:ex?.jp||w.jp,exampleZh:ex?.zh||w.zh};}),grammar:[],kanji:[],reading:null}));
export const forms=[...n5Forms,...n4Forms,...n3Forms,...n2Forms];
const wordMap=new Map();
function includeWord(word,level){const key=`${word.jp}\n${word.reading}`,old=wordMap.get(key);if(old){if(!old.levels.includes(level))old.levels.push(level);if(!old.example&&word.example){old.example=word.example;old.exampleZh=word.exampleZh;}}else wordMap.set(key,{...word,id:stableId('w',key),levels:[level]});}
for(const level of levels){
 const lexicon={N5:n5Lexicon,N4:n4Lexicon,N3:n3Lexicon,N2:n2Lexicon}[level];
 const source=[...units.filter(u=>u.level===level).flatMap(u=>u.vocabulary),...scenarios.filter(s=>s.level===level).flatMap(s=>s.vocabulary),...lexicon.map(([jp,reading,zh])=>({jp,reading,zh}))];
 for(const word of source)includeWord(word,level);
}
for(const unit of [...supportLessons,...readingLessons])for(const word of unit.vocabulary)includeWord(word,unit.level);
export const words=[...wordMap.values()];
const kanjiMap=new Map();
for(const unit of units)for(const k of unit.kanji){const old=kanjiMap.get(k.glyph);if(old){if(!old.levels.includes(unit.level))old.levels.push(unit.level);for(const word of k.words)if(!old.words.some(w=>w.jp===word.jp&&w.reading===word.reading))old.words.push(word);}else kanjiMap.set(k.glyph,{...k,id:`j-${k.glyph.codePointAt(0).toString(16)}`,levels:[unit.level],strokeCode:k.glyph.codePointAt(0).toString(16).padStart(5,'0'),script:'kanji',group:'kanji',hint:'先看筆順，從詞中的讀音理解這個字。',word:k.words[0].jp,reading:k.words[0].reading,wordReading:k.words[0].reading});}
export const kanjiItems=[...kanjiMap.values()].map(k=>({...k,words:k.words.slice(0,6)}));
export const grammarItems=[...units,...supportLessons.filter(u=>u.category==='grammar')].flatMap(unit=>unit.grammar.map((g,i)=>({...g,id:`g-${unit.id}-${i}`,unitId:unit.id,level:unit.level})));
const lifeTopics=['greetings','greetings','shopping','schedule','home','family','food','shopping','transport','transport','travel','travel'];
export const lifeUnits=lifeLessons.map((l,index)=>({id:l.id,level:'L',title:l.title,topic:lifeTopics[index],goal:l.goal,minutes:l.minutes,vocabulary:l.words.map(w=>{const ex=l.dialogue.find(d=>d.jp.includes(w.jp));return {...w,example:ex?.jp||w.jp,exampleZh:ex?.zh||w.zh};}),grammar:[{pattern:l.pattern.sample,meaning:l.goal,formation:`${l.pattern.prefix||'目標詞句'}＋${l.pattern.suffix||'完整招呼句'}`,explanation:l.hint,pitfall:'依本課情境與參考句檢查，不把所有單字任意放進句型。',contrast:l.quiz.map(q=>q.explanation).join(' '),examples:[{jp:l.sample,zh:'本課文字任務的參考；依任務資訊理解完整句子。'}]}],kanji:[],dialogue:l.dialogue,reading:{title:'再理解一次這段生活對話',jp:l.dialogue.map(d=>d.jp).join('\n'),zh:l.dialogue.map(d=>d.zh).join('\n'),questions:[]},questions:l.quiz.map((q,i)=>({id:`${l.id}-q${i}`,kind:'choice',dimension:'language',prompt:q.prompt,options:q.options,correct:q.correct,explanation:q.explanation})),writing:{prompt:l.writingPrompt,sample:l.sample,checklist:['有寫出任務要求的資訊','助詞與句型已對照本課參考','語氣適合這個生活場合']}}));
for(const unit of lifeUnits){const extra=supplements[unit.id];unit.grammar=extra.grammar;unit.reading=extra.reading;unit.questions.push(...extra.additionalQuestions);unit.vocabulary.push(...extra.additionalVocabulary);unit.dialogue.push(...extra.additionalDialogue);}
export const allUnits=[...lifeUnits,...units,...scenarios,...supportLessons,...readingLessons];
export const unitById=new Map(allUnits.map(u=>[u.id,u]));
export const questionById=new Map(allUnits.flatMap(u=>unitQuestions(u).map(q=>[q.id,{...q,unitId:u.id,level:u.level}])));
export const allWritingItems=[...kana,...kanjiItems];
export function unitQuestions(unit){return [...unit.questions,...(unit.reading?.questions||[]).map(q=>({...q,passage:q.passage||unit.reading.jp}))];}
export function completionKey(unit){return unit.level==='L'?`${unit.id}:v2`:unit.id;}
export function isComplete(state,unit){return Boolean(state.completed[completionKey(unit)]);}
export const knownItems=new Set([...kana.map(k=>k.id),...kanaLessons.map(l=>l.id),...allUnits.map(u=>u.id),...questionById.keys(),...lifeLessons.flatMap(l=>l.quiz.map((_,i)=>`${l.id}-q${i}`)),...kanaPhonology.flatMap(p=>p.questions.map((_,i)=>`${p.lessonId}-p${i}`))]);
export const knownLessons=new Set([...kanaLessons.map(l=>l.id),...allUnits.flatMap(u=>[u.id,completionKey(u)])]);
for(const word of words){knownItems.add(word.id);knownItems.add(`${word.id}-read`);knownItems.add(`${word.id}-meaning`);}
for(const k of kanjiItems)knownItems.add(k.id);
for(const form of forms)for(const section of form.sections)for(const q of section.questions){knownItems.add(q.id);questionById.set(q.id,q);}
for(const q of v3Questions){knownItems.add(q.id);questionById.set(q.id,q);}
for(const q of kanaDrills){knownItems.add(q.id);questionById.set(q.id,q);}
export function stableId(prefix,text){let a=2166136261,b=5381;for(const char of text){const n=char.codePointAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b,33)^n;}return `${prefix}-${(a>>>0).toString(16).padStart(8,'0')}${(b>>>0).toString(16).padStart(8,'0')}`;}
export function wordQuestion(id){
 const word=words.find(w=>id===`${w.id}-read`||id===`${w.id}-meaning`);if(!word)return null;
 if(id.endsWith('-read'))return {id,kind:'cloze',dimension:'vocabulary',prompt:`「${word.jp}」的假名讀音是？`,accepted:[...new Set([word.reading,word.reading.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60))])],explanation:`${word.jp}（${word.reading}）：${word.zh}。把詞放回句子裡使用。`};
 const alternatives=[...new Set(words.filter(w=>w.zh!==word.zh&&!w.zh.includes(word.zh)&&!word.zh.includes(w.zh)).map(w=>w.zh))].slice(0,3);
 const options=[word.zh,...alternatives],rotation=parseInt(word.id.slice(-2),16)%options.length;const rotated=[...options.slice(rotation),...options.slice(0,rotation)];
 return {id,kind:'choice',dimension:'vocabulary',prompt:`「${word.jp}」在詞卡中的意思是？`,options:rotated,correct:rotated.indexOf(word.zh),explanation:`${word.jp}（${word.reading}）表示${word.zh}。${word.example||''}`};
}
const legacyReviewQuestions=new Map();
for(const target of kana)for(const dimension of ['recognition','listening']){
 const alternatives=[...new Map(kana.filter(k=>k.script===target.script&&k.group===target.group&&k.reading!==target.reading).map(k=>[k.reading,k])).values()].slice(0,3);
 if(!alternatives.length)continue;const id=`rv-${target.id}-${dimension}`,choices=[target,...alternatives];
 legacyReviewQuestions.set(id,{id,reviewItem:target.id,kind:dimension==='listening'?'listen':'choice',dimension,prompt:dimension==='recognition'?`「${target.glyph}」的輔助讀音是？`:'先聽，再選出這個字。',transcript:target.glyph,options:choices.map(k=>dimension==='recognition'?k.reading:k.glyph),correct:0,explanation:`${target.glyph} 的輔助讀音是 ${target.reading}。`});
}
for(const unit of kanaPhonology)unit.questions.forEach((q,i)=>{const id=`${unit.lessonId}-p${i}`;legacyReviewQuestions.set(id,{id,kind:'choice',dimension:'language',prompt:q.prompt,options:q.choices,correct:q.choices.indexOf(q.answer),explanation:q.explanation});});
export function resolveQuestion(id){return questionById.get(id)||legacyReviewQuestions.get(id)||coachQuestion(id)||resolveKanaWordQuestion(id,words)||wordQuestion(id);}
const examQuestionIds=new Set(forms.flatMap(f=>f.sections.flatMap(s=>s.questions.map(q=>q.id))));
// This old item has two plausible answers; retain its history, omit it from V3 evidence and routes.
const unreliableQuestionIds=new Set(['N4-12-G2']);
export function resolveLearningQuestion(id,dimension){
 if(examQuestionIds.has(id)||unreliableQuestionIds.has(id))return null;
 const q=resolveQuestion(id)||legacyReviewQuestions.get(`rv-${id}-${dimension}`)||kanaDrills.find(q=>q.reviewItem===id&&q.dimension===dimension);
 if(q){const word=words.find(w=>id===`${w.id}-read`||id===`${w.id}-meaning`);return {...q,level:q.level||word?.levels[0]||'K'};}
 if(dimension==='writing'){const item=allWritingItems.find(k=>k.id===id),unit=unitById.get(id);if(item||unit||kanaLessons.some(l=>l.id===id))return {id,dimension,level:unit?.level||item?.levels?.[0]||'K'};}
 return null;
}
export function reviewQuestions(reviews,limit=15){
 const seen=new Set();return reviews.flatMap(r=>{const q=resolveQuestion(r.item)||legacyReviewQuestions.get(`rv-${r.item}-${r.dimension}`)||kanaDrills.find(q=>q.reviewItem===r.item&&q.dimension===r.dimension);if(!q||seen.has(q.id))return [];seen.add(q.id);return [q];}).slice(0,limit);
}
export function practicePool({level='all',dimension='all'}={}){
 const graded=allUnits.filter(u=>level==='all'||u.level===level).flatMap(u=>unitQuestions(u).map(q=>resolveQuestion(q.id)));
 const kanaQuestions=level==='all'||level==='K'?[...legacyReviewQuestions.values()]:[];
 return [...graded,...kanaQuestions].filter(q=>dimension==='all'||q.dimension===dimension);
}
