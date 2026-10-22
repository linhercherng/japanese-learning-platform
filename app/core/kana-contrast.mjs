import {contrastIds} from '../content/kana-contrast.mjs';
import {beginV3Session} from './v3-learning.mjs';
export const pendingContrast=state=>state.v3.sessions.find(s=>s.source==='kana-contrast'&&!s.completedAt);
export function startContrast(state,{reference,id,time}){
 if(pendingContrast(state)||state.v3.sessions.some(s=>s.source==='kana-pocket-listen'&&!s.completedAt))return state;const ids=contrastIds(reference);
 return ids.length?beginV3Session(state,ids,{id,time,source:'kana-contrast',reference}):state;
}
