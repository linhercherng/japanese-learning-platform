import {escapeHtml as e} from './shared.mjs';
import {unitById,forms,topics} from '../content/catalog.mjs';
import {kanaLessons} from '../content/kana.mjs';
import {deepLessons} from '../content/deep-lessons.mjs';
import {supportCategories} from '../content/support-resources.mjs';

const item=(label,route)=>({label,route});
const home=item('今日學習','home'),courses=item('全部課程','courses'),practice=item('練習','practice-hub'),exam=item('檢定模擬','exam'),profile=item('我的學習','profile');
const kana=item('五十音','kana'),support=item('學習補給','support'),deep=item('六步深化課程','deep'),pairs=item('相似假名','confusion'),weekly=item('每週回顧','weekly');
const levelLabel=level=>level==='L'?'生活起步':`${level} 主線`;
function unitTrail(id){
 const u=unitById.get(id);if(!u)return [home,courses,item('課程內容',`study/${id||''}`)];
 const parents=u.kind==='support'?[support,item(supportCategories.find(c=>c.id===u.category)?.title||'補給分類',`support/${u.category}`)]:u.id.startsWith('S-')?[item('生活任務','topics'),item(topics.find(([id])=>id===u.topic)?.[1]||'生活分類',`topics/${u.topic}`)]:[item(levelLabel(u.level),`level/${u.level}`)];
 return [home,courses,...parents,item(u.title,`study/${u.id}`)];
}

// Reconstruct from stable route/catalog/session data, so deep links do not need browser history.
// Recall routes deliberately omit glyphs, word examples and answer text.
export function navigationContext(ctx,name='home',param){
 const state=ctx.state,route=param?`${name}/${param}`:name;
 let section='courses',trail;
 switch(name){
  case 'home':section='home';trail=[home];break;
  case 'courses':trail=[home,courses];break;
  case 'level':trail=[home,courses,item(param?levelLabel(param):'分級課程',route)];break;
  case 'life':trail=[home,courses,item('生活起步',route)];break;
  case 'topics':trail=[home,courses,item('生活任務','topics')];if(topics.some(([id])=>id===param))trail.push(item(topics.find(([id])=>id===param)[1],route));break;
  case 'support':trail=[home,courses,support];if(param)trail.push(item(param==='resources'?'學習網站與資源比較':supportCategories.find(c=>c.id===param)?.title||'補給分類',route));break;
  case 'study':case 'lesson':trail=unitTrail(param);break;
  case 'kana':trail=[home,courses,kana];break;
  case 'unit':trail=[home,courses,kana,item(kanaLessons.find(l=>l.id===param)?.title||'五十音單元',route)];break;
  case 'kana-map':case 'kana-confusions':case 'kana-check':
   trail=[home,courses,kana,item('記憶地圖','kana-map')];if(name!=='kana-map')trail.push(item(name==='kana-check'?'隔天檢查':'混淆字專練',name));else if(param)trail.push(item('字卡記憶紀錄',route));break;
  case 'kana-memory':trail=[home,courses,kana,item('五十音記憶加練',route)];break;
  case 'stroke':case 'write':{
   if(name==='write')section='practice-hub';
   const parent=param?.startsWith('j-')?item('漢字與筆順','library/kanji'):kana;
   trail=[home,courses,parent,item(name==='stroke'?'筆順示範':'手寫練習',route)];break;
  }
  case 'quiz':section='practice-hub';trail=[home,courses,kana];if(ctx.session?.quiz?.lesson)trail.push(item('五十音單元',`unit/${ctx.session.quiz.lesson}`));trail.push(item('五十音回想',route));break;
  case 'practice-hub':section='practice-hub';trail=[home,practice];break;
  case 'practice':{
   section='practice-hub';const id=state.practice?.unitId;
   trail=unitById.has(id)?[...unitTrail(id),item('課內回想',route)]:id==='library-words'?[home,courses,item('詞彙與例句','library/words'),item('詞卡回想',route)]:id==='review-set'?[home,practice,item('到期複習與錯題','review'),item('複習回想',route)]:[home,practice,item('能力回想',route)];break;
  }
  case 'review':case 'weaknesses':section='practice-hub';trail=[home,practice,item(name==='review'?'到期複習與錯題':'概念與能力紀錄',route)];break;
  case 'library':trail=[home,courses,item(({words:'詞彙與例句',kanji:'漢字與筆順',grammar:'句型與文法'})[param]||'學習資料庫',route)];break;
  case 'deep':trail=[home,courses,deep];if(param)trail.push(item(deepLessons.find(u=>u.id===param)?.title||'深化單元',route));break;
  case 'confusion':section='practice-hub';trail=[home,practice,pairs];if(param)trail.push(item('相似字對照',route));break;
  case 'daily':section='home';trail=[home,item('每日安排',route)];break;
  case 'v3-practice':{
   section='practice-hub';const s=state.v3.sessions.find(s=>s.id===param);
   const origin=s?.source==='kana-map'?['kana-map']:s?.source==='kana-check'?['kana-check']:s?.source==='kana-confusion'?['kana-confusions']:s?.source==='daily'?['daily',s.reference]:s?.source==='lesson'?['deep',s.reference]:s?.source==='confusion'?['confusion',s.reference]:s?.source==='kana'?['kana-memory']:['weaknesses'];
   trail=[...navigationContext(ctx,...origin).trail,item('回想練習',route)];break;
  }
  case 'exam':section='exam';trail=[home,exam];break;
  case 'exam-session':case 'exam-result':{
   section='exam';const s=name==='exam-session'?state.activeExam:state.examAttempts.find(a=>a.id===param),form=forms.find(f=>f.id===s?.formId);
   trail=[home,exam,item(`${form?`${form.level} · `:''}${name==='exam-session'?'模擬作答':'模擬結果'}`,route)];break;
  }
  case 'profile':section='profile';trail=[home,profile];break;
  case 'weekly':case 'revise':section='profile';trail=[home,profile,weekly];if(name==='revise')trail.push(item('作品修訂',route));break;
  default:section='home';trail=[home];
 }
 if(['practice','v3-practice'].includes(name))trail=trail.map(c=>{const [source,id]=c.route.split('/');return id&&['study','deep','unit'].includes(source)?item(id,c.route):c;});
 const rail=trail.some(c=>c.route.startsWith('topics'))?'topics':name==='review'?'review':section==='courses'?'courses':section==='profile'?'profile':section==='home'?'home':null;
 return {trail,section,rail};
}
export function navigationView({trail}){
 return `<nav class="location-nav" aria-label="目前位置"><span class="location-label">目前位置</span><ol>${trail.map((c,i)=>`<li>${i===trail.length-1?`<span aria-current="page">${e(c.label)}</span>`:`<a href="#${e(c.route)}">${e(c.label)}</a>`}</li>`).join('')}</ol></nav>`;
}
