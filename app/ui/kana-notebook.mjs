import {notebookPage} from '../core/kana-notebook.mjs';
import {escapeHtml as e,heading,back,primary,note} from './shared.mjs';
const groups={all:'全部分類',basic:'基本字',voiced:'濁音',semivoiced:'半濁音',contracted:'拗音'};
const options=(choices,value)=>Object.entries(choices).map(([id,title])=>'<option value="'+id+'" '+(value===id?'selected':'')+'>'+title+'</option>').join('');
export function notebookView(ctx){
 const p=notebookPage(ctx.state,ctx.session.kanaNotebook),f=p.filters;
 return back('今天怎麼練','kana-path')+heading('找回自己的記憶線索。','保存的訣竅與未完成草稿，放在同一本線索簿。')+
 '<form data-notebook-form><label for="notebook-query">搜尋假名、讀音或自己的文字</label><input id="notebook-query" class="lesson-input" type="search" maxlength="80" value="'+e(f.query)+'" autocomplete="off"><div class="kc-filters"><label>字形<select id="notebook-script">'+options({all:'平片全部',hira:'平假名',kata:'片假名'},f.script)+'</select></label><label>分類<select id="notebook-group">'+options(groups,f.group)+'</select></label><label>線索範圍<select id="notebook-scope">'+options({all:'全部線索與草稿',pocket:'只看口袋字',drafts:'只看未保存草稿'},f.scope)+'</select></label></div><div class="button-row"><button class="primary" type="submit">搜尋線索</button><button class="secondary" type="button" data-notebook-action="clear">清除篩選</button></div></form>'+
 '<p id="notebook-results" role="status">找到 '+p.total+' 個字 · 第 '+(p.page+1)+' / '+p.pages+' 頁，每頁最多10字。</p>'+p.entries.map(n=>'<section class="v3-section"><h2 class="jp" lang="ja">'+e(n.glyph)+'</h2><p>輔助讀音：'+e(n.reading)+' · '+(n.draft?'未按保存的草稿':'已保存線索')+(n.pocket?' · 仍在口袋':'')+'</p><p class="memory-note artifact-text">'+(n.text?e(n.text):'空白草稿，可回去繼續寫。')+'</p><nav class="ks-links" aria-label="這個字的下一步">'+primary(n.draft?'接續這份草稿':'編輯自己的線索','kana-notes/'+n.id)+primary('看筆順','stroke/'+n.id)+primary('收起範字，聽音默寫','kana-dictation/'+n.id)+'</nav></section>').join('')+
 (p.total?'':'<section class="v3-section"><h2>沒有符合的線索。</h2><p>可以清除篩選，或先從記憶地圖挑一個字寫下自己的聯想。</p>'+primary('挑一個字寫線索','kana-map')+'</section>')+
 '<nav class="button-row" aria-label="線索分頁"><button class="secondary" data-notebook-action="previous" '+(!p.page?'disabled':'')+'>上一頁線索</button><button class="secondary" data-notebook-action="next" '+(p.page+1===p.pages?'disabled':'')+'>下一頁線索</button></nav>'+note('這頁顯示的字與文字會記為看過提示；未顯示的頁面不預先記錄。篩選只暫存本次分頁，刷新會清除；草稿仍要進入原編輯頁按保存。線索與草稿隨JSON備份保留。');
}
