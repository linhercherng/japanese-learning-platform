import {familyIds} from '../content/kana-family.mjs';import {beginV3Session} from './v3-learning.mjs';
export function pendingFamily(state,family){return state.v3.sessions.find(s=>s.source==='kana-family'&&s.reference===family&&!s.completedAt);}
export function startFamily(state,{family,id,time}){const ids=familyIds(family);return ids.length?beginV3Session(state,ids,{id,source:'kana-family',reference:family,time}):state;}
