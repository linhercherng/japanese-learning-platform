import {validateState} from './learning.mjs';
import {validateKanaNotes} from './kana-studio-state.mjs';
export const noteKey=item=>'text:KN-'+item;
export function saveKanaNote(state,item,text,time){
 if(typeof text!=='string'||text.length>160)throw Error('記憶線索最多160字。');
 const next=structuredClone(state);next.v3.kanaNotes??={};next.v3.kanaNotes[item]={text:text.trim(),updatedAt:time};validateKanaNotes(next.v3.kanaNotes);delete next.drafts[noteKey(item)];next.revision++;return validateState(next);
}
