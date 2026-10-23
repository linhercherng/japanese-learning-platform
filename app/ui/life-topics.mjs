import {topics,lifeTopicLevels,parseLifeTopicRoute} from '../content/life-topics.mjs';
import {lifeTopicSummary} from '../core/life-topics.mjs';
import {pendingLife} from '../core/life-memory.mjs';
import {lifeDailyCompleted} from '../core/life-retention.mjs';
import {escapeHtml as e,heading,back,primary,note} from './shared.mjs';
const levelName=level=>level==='L'?'生活起步':level;
export function lifeTopicView(ctx,param,time){
 const route=parseLifeTopicRoute(param);if(!route)return `${back('生活主題回想','life-topic')}${heading('先選一個生活主題。','找不到這個主題或程度上限，請從目錄重新選擇。')}${primary('回生活主題目錄','life-topic')}`;
 const {topic,ceiling}=route,key=topic?topic+':'+ceiling:ceiling,label=topics.find(([id])=>id===topic)?.[1],p=pendingLife(ctx.state),top=`${back(topic?'全部生活主題':'生活記憶目錄',topic?'life-topic/'+ceiling:'life-memory')}${heading(topic?label:'同主題，換場景回想。','把學過的一點，帶到不同場合再想一次。')}`;
 if(p)return `${top}<section class="hero"><h2>先接續原輪生活回想</h2><p>保留原題、首答與草稿，完成後再選主題。</p>${primary('接續這輪原題','v3-practice/'+p.id)}</section>`;
 const select=`<label class="life-topic-ceiling">我的程度上限<select data-life-topic-ceiling="${e(key)}">${lifeTopicLevels.map(level=>`<option value="${level}" ${level===ceiling?'selected':''}>${e(levelName(level))}${level==='L'?'':'與以下'}</option>`).join('')}</select></label><p>只選上限內實際練過的原題；不會用更難或沒做過的新題湊數。</p>`;
 if(!topic)return `${top}${select}<div class="life-topic-list">${topics.map(([id,name])=>{const r=lifeTopicSummary(ctx.state,id,ceiling,time);return `<a class="life-topic-link" href="#life-topic/${id}:${ceiling}"><h2>${e(name)}</h2><p>範圍內 ${r.availableUnits} 課 · 已練過 ${r.practicedUnits} 課</p><small>${r.questions?`這次最多 ${r.questions} 題`:'先學一課，再來回想'}</small></a>`;}).join('')}</div>${note('題數與已練課數是這個瀏覽器截至目前的紀錄，不能當成熟練度；目錄不顯示答案或個人線索，也不新增提示紀錄。')}`;
 const r=lifeTopicSummary(ctx.state,topic,ceiling,time);
 return `${top}${select}<section class="hero"><span class="eyebrow">${e(levelName(ceiling))}以內 · ${e(label)}</span><h2>${r.questions?`這次 ${r.questions} 課，各 1 題`:'還沒有可回想的原題'}</h2><p>範圍內 ${r.availableUnits} 課，已練過 ${r.practicedUnits} 課。</p>${r.questions?`<p>${r.practicedUnits===1?'目前只有 1 課有練習紀錄，這次先回想這一課。':'最多選三個不同單元，每課只取一題，換個場合再自己想。'}</p><p>先回想最近錯答或用過提示的題目，再到期題及其他已練原題。</p><button class="primary" data-life-topic-action="start" data-life-topic-reference="${e(key)}">開始主題回想 ${r.questions} 題</button>`:`<p>先完成這個主題的一課原題，再回來少量練習；也可以調整程度上限，看看其他學過的課。</p>${primary('先選一課生活場景','life-memory')}`}</section>${lifeDailyCompleted(ctx.state,time)?note('今天已完成一輪，可以先休息；這裡是自行加練，同日做對不算跨日記住。'):''}<nav class="resource-links" aria-label="主題回想前後"><a href="#life-topic/${e(ceiling)}">換一個生活主題</a><a href="#life-map">看看學過與需要加練的場景</a><a href="#life-notes">生活線索簿</a><a href="#life-schedule">今日收尾與複習預告</a><a href="#life-check">隔天生活複習</a></nav>${note('使用原題、原選項與原音，沿用首次作答及提示紀錄；今日看過本課參考，相關原題會另列使用提示。這不是新情境遷移能力、自由口說或書寫的評量，隔天再確認能否自己想起來。')}`;
}
