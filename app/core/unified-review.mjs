import {memoryEvidence,memoryStatusLabels} from './memory-evidence.mjs';
import {unifiedLearning} from './unified-learning.mjs';
export {memoryStatusLabels};
/** Share the same read-only evidence with the daily recommendation. */
export function unifiedReview(state,time,quiz=null){
 const evidence=memoryEvidence(state,time),route=unifiedLearning(state,time,quiz);
 return {...evidence,main:route.main,pending:route.pending,tracks:route.tracks.map(t=>({...t,...evidence.tracks.find(r=>r.goal===t.goal),next:route.pending[0]||t}))};
}
