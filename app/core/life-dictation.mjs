import {unitById,unitQuestions} from '../content/catalog.mjs';
import {memoryPhrases,pendingLife} from './life-memory.mjs';
import {validateState} from './learning.mjs';
import {recordLifeExposure} from './life-memory-state.mjs';
import {parseLifeDictationRef,lifeDictationKey,lifeRecallKey,validateLifeDictationDraft} from './life-dictation-state.mjs';
export {parseLifeDictationRef,lifeDictationKey,lifeRecallKey};
export function lifeDictationPhrase(ref){const parsed=parseLifeDictationRef(ref);if(!parsed)return null;const line=memoryPhrases(parsed.unitId)[parsed.slot];return line?{...line,...parsed}:null;}
function storeLifeTextDraft(state,ref,text,time,keyFor){const p=parseLifeDictationRef(ref);if(!p)throw Error('找不到這句生活練習。');if(pendingLife(state))throw Error('請先完成原輪生活回想，再寫生活句子。');const key=keyFor(p.reference),draft={text,points:[],time};validateLifeDictationDraft(key,draft);const next=structuredClone(state);next.drafts[key]=draft;next.revision++;return validateState(next);}
export const storeLifeDictationDraft=(state,ref,text,time)=>storeLifeTextDraft(state,ref,text,time,lifeDictationKey);
export const storeLifeRecallDraft=(state,ref,text,time)=>storeLifeTextDraft(state,ref,text,time,lifeRecallKey);
export function exposeLifeDictation(state,ref,time){const p=parseLifeDictationRef(ref);return !p||pendingLife(state)?state:recordLifeExposure(state,unitQuestions(unitById.get(p.unitId)).map(q=>q.id),time);}
// Exact Unicode sequences only: differences are guidance, never a language grade.
export function compareLifeText(own,original){if(typeof own!=='string'||typeof original!=='string'||own.length>300||original.length>300)throw Error('對照文字請限制在 300 字內。');const a=Array.from(own),b=Array.from(original),w=b.length+1,table=new Uint16Array((a.length+1)*w);
 for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)table[i*w+j]=a[i]===b[j]?1+table[(i+1)*w+j+1]:Math.max(table[(i+1)*w+j],table[i*w+j+1]);
 const out=[];function push(kind,text){const last=out.at(-1);if(last?.kind===kind)last.text+=text;else out.push({kind,text});}let i=0,j=0;
 while(i<a.length||j<b.length){if(i<a.length&&j<b.length&&a[i]===b[j]){push('same',a[i]);i++;j++;}else if(i<a.length&&(j===b.length||table[(i+1)*w+j]>=table[i*w+j+1]))push('own',a[i++]);else push('original',b[j++]);}return out;
}
