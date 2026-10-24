import {dailyMemory,dailyMemoryParam,dailyMemoryReason} from '../core/daily-memory.mjs';
import {unifiedLearning} from '../core/unified-learning.mjs';
import {escapeHtml as e,heading,back,primary,note} from './shared.mjs';
const labels={K:'五十音',L:'生活日語',N5:'N5',N4:'N4',N3:'N3',N2:'N2'};
export function dailyMemoryEvidenceView(r){
 return `<details class="unified-details"><summary>這個建議的記憶依據</summary><p>本區目前：需要再複習 ${r.summary.review}、紀錄待確認 ${r.summary.uncertain}、跨日待確認 ${r.summary.waiting}、已有跨日證據 ${r.summary.retained}、已有七日證據 ${r.summary.week} 項能力。</p><p>複習間隔：首次或需幫忙隔天再想，已有跨日證據隔三天，七日證據隔七天；從最後練習、回饋或參考起算。</p><p>可追溯歷史：答前提示 ${r.history.hint}、答後回饋 ${r.history.feedback}、參考 ${r.history.reference}、舊階段不明 ${r.history.legacy} 次。答後回饋不改寫原首答，但會重新起算下一次間隔。</p>${r.nextDay?`<p>另有 ${r.waiting} 項正在間隔中，最早 ${e(r.nextDay)} 再確認。</p>`:''}<nav class="resource-links" aria-label="追溯推薦原因"><a href="#${r.goal==='K'?'kana-history':'course-history/'+e(r.goal)}">查看提示與回饋時間線</a><a href="#weaknesses/${e(r.goal)}:all:1">查看本區記憶與弱點</a></nav></details>`;
}
export function dailyMemoryView(ctx,param,time){
 const parsed=dailyMemoryParam(param),base=back('回首頁，看每日推薦','home');
 if(!parsed)return base+heading('找不到這個今日複習。','回首頁更新推薦，原活動仍保留。')+primary('更新今天的路線','home');
 const route=unifiedLearning(ctx.state,time,ctx.session?.quiz),r=dailyMemory(ctx.state,parsed.goal,time,{mode:parsed.mode}),pending=route.pending[0];
 return `${base}${heading('今日原題複習',labels[parsed.goal]+' · 每次只想起一小步')}${pending?`<section class="hero"><h2>先接續已保存的活動</h2><p>原題、答案與草稿保持，先完成這一輪。</p>${primary('接續原來這一步',e(pending.route))}</section>`:route.finishedToday?`<section class="hero"><h2>今天已完成一小輪，可以先休息。</h2>${primary('回看原結果',e(route.main.route))}</section>`:r.mode===parsed.mode&&r.questionIds.length?`<section class="hero"><span class="eyebrow">${e(route.day)} · ${e(labels[parsed.goal])}</span><h2>今天先回想 ${r.questionIds.length} 題</h2><p>${e(dailyMemoryReason(r))}</p><ul>${r.items.map(i=>`<li>${e(i.title)} · ${e(i.abilityLabel)} · ${e(i.label)}</li>`).join('')}</ul><button class="primary" data-v3-action="start-today-review" data-v3-review="${e(param)}">收起線索，開始回想</button></section>`:`<section class="self-check"><h2>目前沒有這類到期原題。</h2><p>${e(['wait','clock'].includes(r.mode)?dailyMemoryReason(r):'日期或進度已更新；回首頁重新看看今天的一小步。')}</p>${primary('更新今天的路線','home')}</section>`}${dailyMemoryEvidenceView(r)}${note('這裡只選實際練過的原題，不顯示答案或個人線索。答前看過提示另列；答後回饋不倒算。寫作自評與檢定成績分開。')}`;
}
