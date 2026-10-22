import {rowRoundById} from '../content/kana-row.mjs';import {beginV3Session} from './v3-learning.mjs';
export function pendingRow(state,rowId){return state.v3.sessions.find(s=>s.source==='kana-row'&&!s.completedAt&&rowRoundById.get(s.reference)?.rowId===rowId);}
export function startRow(state,{round,id,time}){const r=rowRoundById.get(round);return r&&!pendingRow(state,r.rowId)?beginV3Session(state,r.questionIds,{id,source:'kana-row',reference:round,time}):state;}
