import {buildQuestion} from './kana-lab.mjs';
import {coachQuestion} from './kana-coach.mjs';
export function typingQuestion(id,registry){
 if(!String(id).startsWith('kt:'))return null;
 const q=buildQuestion('kb:'+id.slice(3),registry);if(!q)return null;
 const {tokens,answerOrder,...base}=q;
 return {...base,id,kind:'cloze',accepted:[answerOrder.map(i=>tokens[i]).join('')],inputMaxLength:50,inputHelp:'請用日文鍵盤輸入題目要求的假名；半形片假名可接受，漢字、羅馬字及另一套字形不列為正確。先完成選字，再按提交。打字不是手寫評分。',explanation:q.explanation.replace('小字和前字合成字塊；字塊不等同發音拍數。','對照後，下次收起提示再輸入。'),prompt:q.prompt.replace('先聽詞音，拼出','聽詞音，輸入')};
}
export function validRecallReference(source,reference,ids,registry){
 if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length)return false;
 if(source==='kana-type')return ids.length<=3&&ids.every(id=>typingQuestion(id,registry)?.reviewItem===reference);
 return source==='kana-week'&&/^\d{4}-\d\d-\d\d$/.test(reference)&&Number.isFinite(Date.parse(reference))&&new Date(reference).toISOString().slice(0,10)===reference&&ids.length<=10&&ids.every(id=>/^kc:check:/.test(id)&&coachQuestion(id));
}
