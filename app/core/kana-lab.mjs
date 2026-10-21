import {kanaMemoryMap} from './kana-coach.mjs';
import {memoryFor} from '../content/kana-memory.mjs';
import {validateState} from './learning.mjs';
import {validateKanaNotes} from './kana-studio-state.mjs';
export const noteKey=item=>'text:KN-'+item;
export function saveKanaNote(state,item,text,time){
 if(typeof text!=='string'||text.length>160)throw Error('記憶線索最多160字。');
 const next=structuredClone(state);next.v3.kanaNotes??={};next.v3.kanaNotes[item]={text:text.trim(),updatedAt:time};validateKanaNotes(next.v3.kanaNotes);delete next.drafts[noteKey(item)];next.revision++;return validateState(next);
}

export function selectMiniCards(state,{script='hira',group='basic',time=new Date().toISOString()}={}){
 const pool=kanaMemoryMap(state,time).filter(k=>k.script===script&&(group==='all'||memoryFor(k.id).group===group));
 const unseen=k=>!k.recognition.total&&!k.listening.total,weak=k=>['recognition','listening'].some(d=>k[d].weak||k[d].total&&k[d].due);
 const review=pool.filter(weak),fresh=pool.filter(unseen),selected=review.slice(0,2);for(const k of [...fresh,...review.slice(2),...pool])if(selected.length<3&&!selected.some(x=>x.id===k.id))selected.push(k);
 return selected.map(k=>({id:k.id,glyph:k.glyph,script:k.script,reason:weak(k)?'需要再回想':unseen(k)?'尚未練過':'溫和複習'}));
}
