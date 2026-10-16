import {escapeHtml as e,heading,back,icon,note} from './shared.mjs';
import {supportLessons} from '../content/learning-support.mjs';
import {readingLessons} from '../content/support-readings.mjs';
import {resources,supportCategories} from '../content/support-resources.mjs';
import {isComplete} from '../content/catalog.mjs';
const lessons=[...supportLessons,...readingLessons];

function resourceComparison(){
 return `${heading('看看不同的學習方法。','2026-10-16查核9個網站的公開功能頁，對照日和已提供與本次補上的內容。')}${note('這是功能與學習方式的比較，並非品質排名；外站功能與收費可能調整，請以原站為準。')}${resources.map(r=>`<section class="lesson-text"><h2><a href="${e(r.url)}" target="_blank" rel="noopener noreferrer">${e(r.title)} ↗</a></h2><p>${e(r.strength)}</p><dl><dt>日和已經有</dt><dd>${e(r.existing)}</dd><dt>值得補強</dt><dd>${e(r.gap)}</dd><dt>這次補上</dt><dd>${e(r.applied)}</dd></dl><p class="source-note">${e(r.note)}</p><a class="text-button" href="#support/${e(r.category)}">看看相關補充單元 ${icon('arrow')}</a></section>`).join('')}`;
}

export function supportView(ctx,category){
 if(category==='resources')return `${back('學習補給','support')}${resourceComparison()}`;
 const current=supportCategories.find(c=>c.id===category);
 if(category&&!current)return `${heading('找不到這個補給分類。','原本的課程與學習紀錄仍保留。')}${back('回到學習補給','support')}`;
 const list=lessons.filter(u=>u.category===category);
 return `${back('全部課程','courses')}${heading(current?.title||'讀懂差別，記得更牢。',current?.description||'24個知識單元與8篇分級閱讀，補上學習時容易卡住的地方。')}${current?`<nav class="library-tabs support-tabs" aria-label="補給分類">${supportCategories.map(c=>`<a href="#support/${c.id}" ${c.id===category?'class="active" aria-current="page"':''}>${e(c.title)}</a>`).join('')}</nav><p class="row-title">${list.length} 個單元 · ${list.filter(u=>isComplete(ctx.state,u)).length} 已完成練習</p><div class="lesson-list">${list.map(u=>`<a class="life-card" href="#study/${e(u.id)}"><span class="path-level">${e(u.level)}</span><div><h2>${e(u.title)}</h2><p>${e(u.goal)}</p><small>約 ${u.minutes} 分鐘 · ${isComplete(ctx.state,u)?'已完成本版練習':'理解 → 回想 → 自己寫'}</small></div>${icon('arrow')}</a>`).join('')}</div>`:`<div class="path-list">${supportCategories.map((c,i)=>`<a class="path-row" href="#support/${c.id}"><span class="step-dot">${i+1}</span><div><h2>${e(c.title)}</h2><p>${e(c.description)}</p><small>${lessons.filter(u=>u.category===c.id).length} 個單元</small></div>${icon('arrow')}</a>`).join('')}</div><section class="lesson-text"><h2>從你卡住的地方開始</h2><p>不確定怎麼念，先練發音；會背規則卻常選錯，讀文法對比；看到漢字就猜中文，先看字詞；句子懂了卻抓不到重點，就讀短篇找線索。</p><p>先看兩個例子，再收起提示回想。錯答和用過提示的項目會進入既有複習，寫作仍採自評。</p></section>`}<div class="resource-links"><a href="#support/resources">9站學習方式與資源比較 ${icon('arrow')}</a><a href="#practice-hub">回到短練與到期複習 ${icon('arrow')}</a></div>${note('這批是日和原創補充試用教材，教師審校尚未完成。音訊為合成語音；重音請搭配可靠辭典查核。外站只提供連結，離線包不包含外站內容。')}`;
}
