// One phrase at a time, without self-evaluation scores.
import {unitById} from '../content/catalog.mjs';
import {lifeUnitIds} from '../content/life-memory-ids.mjs';
import {pendingLife} from '../core/life-memory.mjs';
import {currentLifeCard,lifeCardSummary} from '../core/life-cards.mjs';
import {escapeHtml as e,heading,back,primary,note,icon} from './shared.mjs';
export const lifeCardsLocal=session=>session.lifeCards??={unitId:null,round:null,run:0};
export function lifeCardsView(ctx,unitId){
 const unit=unitById.get(unitId);if(!lifeUnitIds.has(unitId))return `${heading('找不到這組生活回想卡。','請從原課重新選擇。')}${primary('生活記憶目錄','life-memory')}`;
 const p=pendingLife(ctx.state),ui=lifeCardsLocal(ctx.session),round=ui.unitId===unitId?ui.round:null;
 const top=`${back('本課三句記憶','life-memory/'+unitId)}${heading('一句一句，慢慢想起來。',unit.title)}`;
 if(p)return `${top}<section class="hero"><h2>先接續未完成的生活回想</h2><p>原句與自評卡先收起，完成原輪後再對照。</p>${primary('接續原輪生活回想','v3-practice/'+p.id)}</section>`;
 const attrs=`data-life-cards-unit="${e(unitId)}" data-life-cards-run="${ui.run}"${round?` data-life-cards-cursor="${round.cursor}"`:''}`;
 const button=(label,action,extra='',style='secondary')=>`<button class="${style}" data-life-cards-action="${action}" ${attrs} ${extra}>${label}</button>`;
 const dictationLink=`<nav class="resource-links"><a href="#life-recall/${e(unitId)}:0">看中文，想一句日文</a><a href="#life-dictation/${e(unitId)}:0">聽一句，自己寫出整句日文</a></nav>`;
 const guidance=note('這是暫存自評，不增加答對數或課程完成。離頁、刷新或換方向會收起並重新開始；實際看過或聽過的本課參考仍會保存，今日作答另列提示。');
 if(!round)return `${top}<section class="self-check"><h2>今天選一個方向就好</h2><p>每次只看一句。先自己想，再揭開核對；這裡使用原課三句與合成音。</p><div class="life-card-directions">${button('看中文，想日文','start','data-life-cards-mode="meaning"','primary')}${button('聽日文，想意思','start','data-life-cards-mode="sound"')}</div><p>想不起來時，隔至少兩句再試一次；間隔不足就留到稍後。每句最多重想一次，整輪最多六次。</p></section>${dictationLink}${guidance}`;
 const summary=lifeCardSummary(round);
 if(summary.done)return `${top}<section class="life-day-finish"><h2 id="life-card-heading" tabindex="-1">這一輪先到這裡。</h2><p>最後一次自評：${summary.remember} 句這次想起來，${summary.again} 句留到稍後再想。</p><p>已回想 ${summary.visits} 次，共 ${summary.total} 句。這是自己的感受，還需要收起參考做題、隔天再確認。</p>${button('收起卡片，回想原課三題','practice','','primary')}</section><nav class="resource-links" aria-label="接下來的一小步"><a href="#life-notes/${e(unitId)}">記下自己的生活線索</a><a href="#life-skill/${e(unitId)}">只選一種能力，少量練習</a><a href="#study/${e(unitId)}" data-open-writing>用自己的日文寫一句</a><a href="#life-check">隔天生活複習</a><a href="#life-schedule">生活複習預告</a></nav>${button('再選一個回想方向','reset')}${dictationLink}${guidance}`;
 const line=currentLifeCard(round),index=round.queue[round.cursor],repeated=round.queue.slice(0,round.cursor).includes(index);
 const audio=()=>`<div class="life-card-actions">${button(`${icon('sound')}聽完整原句`,'audio','data-life-cards-rate="1"','sound-button')}${button(`${icon('sound')}慢速聽原句`,'audio','data-life-cards-rate="0.75"','sound-button')}</div>`;
 return `${top}<section class="life-recall-card"><span class="eyebrow">${round.mode==='meaning'?'看意思，想日文':'聽日文，想意思'} · 第 ${index+1} / ${summary.total} 句${repeated?' · 隔句再想':''}</span><h2 id="life-card-heading" tabindex="-1">${round.mode==='meaning'?e(line.zh):'先聽一句，想想在說什麼。'}</h2>${round.mode==='sound'?`${audio()}<p>先把意思說給自己聽。不方便播放時，也可直接揭開參考。</p>`:'<p>先在心裡想，或試著說一句；準備好再核對。</p>'}${round.revealed?`<div class="life-phrase-reference"><p class="jp" lang="ja">${e(line.jp)}</p>${line.reading?`<p class="reading" lang="ja">${e(line.reading)}</p>`:''}${round.mode==='sound'?`<p>${e(line.zh)}</p>`:''}<p class="source-note">${e(line.speaker)} · 原課合成音／待教師審校</p></div>${round.mode==='meaning'?audio():''}`:''}${button(round.revealed?'收起參考，再想一次':'想過了，揭開原句核對','reveal',`aria-expanded="${round.revealed}"`,round.revealed?'secondary':'primary')}${round.revealed?`<div class="life-card-ratings" aria-label="這次的自評">${button('這次想起來','rate','data-life-cards-rating="remember"','primary')}${button('還想再練','rate','data-life-cards-rating="again"')}</div>`:''}</section><p class="review-explainer">自評「還想再練」會在可隔兩句時排到後面一次；不足兩句就留到稍後，不連續翻同一句。</p>${button('換方向，重新開始','reset')}${dictationLink}${guidance}`;
}
