import {topics} from '../content/catalog.mjs';
import {pendingLife} from '../core/life-memory.mjs';
import {lifeNextStep} from '../core/life-progress.mjs';
import {lifeWorkspaceIndex} from '../core/life-workspace.mjs';
import {heading,back,primary,note,escapeHtml as e,dateLabel} from './shared.mjs';

export const lifeCompletionLinks='<nav class="resource-links" aria-label="完整生活學習路線"><a href="#life-path">生活日語今天怎麼練</a><a href="#life-workspace">我的生活練習簿：找原稿與再想稿</a><a href="#life-guide">生活日語完整學習指南</a></nav>';
export const workspaceOptions={
 level:[['all','全部程度'],['L','生活起步'],['N5','N5'],['N4','N4'],['N3','N3'],['N2','N2']],
 kind:[['all','全部練習種類'],['recall','中文回想'],['dictation','生活聽寫'],['notes','生活線索']],
 scope:[['all','全部有紀錄'],['written','有文字原稿'],['retry','有文字再想稿'],['note-drafts','線索待保存']]
};
const option=(id,label,value)=>`<option value="${e(id)}" ${id===value?'selected':''}>${e(label)}</option>`;
const pendingView=p=>`<section class="hero"><h2>先接續這輪，再學下一步。</h2><p>原題、首答與提示保留；練習簿先收起。</p>${primary('接續這輪原題','v3-practice/'+p.id)}</section>`;

export function lifePathView(ctx,time){
 const step=lifeNextStep(ctx.state,time);
 return `${back('生活記憶目錄','life-memory')}${heading('生活日語，今天一小步。','先接續，再回想；每次選一條路就好。')}<section class="hero"><span class="eyebrow">依目前生活練習紀錄</span><h2>${e(step.title)}</h2><p>${e(step.detail)}</p>${step.kind==='repair'?primary('到地圖開始弱點三題','life-map'):primary(step.kind==='done'?'看看複習預告':step.kind==='pending'?'接續這輪原題':'開始這一小步',step.route)}</section><section class="v3-section"><h2>想自己選？從現在的需要開始。</h2><p>不用把所有工具做完。先練一句，有需要再加一點。</p><nav class="resource-links" aria-label="生活學習方向"><a href="#life-memory">剛開始：挑今天用得到的場景</a><a href="#life-workspace">已經寫過：找回原稿或再想稿</a><a href="#life-guide">不知道怎麼練：看六段完整指南</a></nav></section><details class="life-sentence-navigation"><summary>其他工具與進度</summary><nav aria-label="其他生活工具"><a href="#life-recall">看中文，自己想日文</a><a href="#life-dictation">聽一句，自己寫出來</a><a href="#life-notes">保存自己的生活線索</a><a href="#life-topic">同主題，換已學場景</a><a href="#life-map">記憶地圖與原輪回顧</a><a href="#life-schedule">隔天與七日複習預告</a></nav></details>${note('今天看懂、主動寫出與隔天想起分開記錄。這裡只提供下一步，不自動開題、修改原稿或推論已熟練。')}`;
}

function resultCard(row){
 const mode=row.kind==='recall'?'中文回想':row.kind==='dictation'?'生活聽寫':'生活線索';
 const statuses=row.kind==='notes'?[row.saved?'已有保存線索':'',row.draft?'另有待保存草稿':''].filter(Boolean):[row.original?row.written?'原稿有文字':'原稿目前空白':'',row.retry?row.retryWritten?'再想稿有文字':'再想稿目前空白':''].filter(Boolean);
 return `<a class="life-map-unit" href="#${e(row.route)}"><span class="tag">${e(row.level==='L'?'生活起步':row.level)} · ${e(mode)}${row.kind!=='notes'?` · 第 ${row.slot+1} 句`:''}</span><h3>${e(row.title)}</h3><p>${statuses.join(' · ')}</p><small>${e(dateLabel(row.updatedAt))} · 點進去後，主動展開內容</small></a>`;
}
export function lifeWorkspaceView(ctx,filters={}){
 const top=back('今天怎麼練','life-path')+heading('我的生活練習簿','原稿、再想稿與生活線索，一起找回來。'),pending=pendingLife(ctx.state);
 if(pending)return top+pendingView(pending);
 const r=lifeWorkspaceIndex(ctx.state,filters);
 const select=(name,label,options)=>`<label>${label}<select name="${name}">${options.map(([id,text])=>option(id,text,filters[name]||'all')).join('')}</select></label>`;
 return `${top}<form class="life-workspace-search" data-life-workspace-search><label for="life-workspace-query">搜尋課名、場景或自己的文字</label><input type="search" id="life-workspace-query" data-life-workspace-query name="query" maxlength="160" value="${e(filters.query||'')}" aria-describedby="life-workspace-help"><p id="life-workspace-help">只在這個瀏覽器搜尋，不預覽文字；輸入完成後按搜尋。日文選字不會自動送出。</p><div class="life-memory-filters">${select('level','程度',workspaceOptions.level)}${select('kind','練習種類',workspaceOptions.kind)}${select('scope','草稿與線索狀態',workspaceOptions.scope)}${select('topic','生活場景',[['all','全部場景'],...topics])}</div><div class="life-card-actions"><button class="primary" type="submit">搜尋練習簿</button><button class="secondary" type="button" data-life-workspace-action="reset">清除搜尋與篩選</button></div></form><section class="v3-section" aria-labelledby="life-workspace-results"><h2 id="life-workspace-results" tabindex="-1">找到 ${r.total} 筆練習 · 第 ${r.page} / ${r.pages} 頁</h2><p>每句每種模式各一筆，原稿與再想稿合在同一入口；空白草稿也保留。這是文字紀錄，與答對、課程完成和熟練度分開。</p><div class="life-map-list">${r.rows.map(resultCard).join('')||'<p class="filter-empty">找不到符合的練習。可清除篩選，或先選一課寫一句。</p>'}</div><nav class="life-card-actions" aria-label="練習簿分頁">${r.page>1?`<button class="secondary" data-life-workspace-action="page" data-life-workspace-page="${r.page-1}">上一頁練習</button>`:''}${r.page<r.pages?`<button class="secondary" data-life-workspace-action="page" data-life-workspace-page="${r.page+1}">下一頁練習</button>`:''}</nav></section><nav class="resource-links" aria-label="練習簿下一步"><a href="#life-memory">選一個生活場景開始</a><a href="#life-guide">查看完整學習指南</a><a href="#profile">匯出學習備份</a></nav>${note('搜尋不記為看過參考，也不新增作答。內容仍在原編輯頁：日文與個人文字預設收起，準備好再展開。片段補練只暫存，不會出現在練習簿。')}`;
}
