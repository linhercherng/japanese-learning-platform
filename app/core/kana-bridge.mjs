import {bridgeIds} from '../content/kana-bridge.mjs';
import {beginV3Session} from './v3-learning.mjs';
export function pendingBridge(state,item){return state.v3.sessions.find(s=>s.source==='kana-bridge'&&s.reference===item&&!s.completedAt);}
export function startBridge(state,{item,id,time}){const questions=bridgeIds(item);return questions.length?beginV3Session(state,questions,{id,source:'kana-bridge',reference:item,time}):state;}
