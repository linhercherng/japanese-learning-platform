// Ability counts describe practice records, not mastery.
import {unitById} from '../content/catalog.mjs';
import {lifeUnitIds} from '../content/life-memory-ids.mjs';
import {pendingLife} from '../core/life-memory.mjs';
import {lifeSkills,lifeSkillCandidates,lifeSkillSummary} from '../core/life-skills.mjs';
import {lifeDailyCompleted} from '../core/life-retention.mjs';
import {escapeHtml as e,heading,back,primary,note} from './shared.mjs';
export function lifeSkillView(ctx,unitId,time){
 const unit=unitById.get(unitId);if(!lifeUnitIds.has(unitId))return `${heading('先選一課，再練一種能力。','從生活記憶目錄找到今天用得到的場景。')}${primary('生活記憶目錄','life-memory')}`;
 const p=pendingLife(ctx.state),top=`${back('本課三句記憶','life-memory/'+unitId)}${heading('一次，練清楚一種能力。',unit.title)}`;
 if(p)return `${top}<section class="hero"><h2>先接續原輪生活回想</h2><p>已提交 ${Object.keys(p.answers).length} / ${p.questionIds.length} 題，保留原題、首答與提示。</p>${primary('接續這輪原題','v3-practice/'+p.id)}</section>`;
 return `${top}<p>優先回想最近錯答或提示題；有未練原題時，至少留一題給新練習，再接到期題。每輪同課、同能力，最多三題。</p>${lifeDailyCompleted(ctx.state,time)?note('今天已完成一輪，可以先休息。這裡是自行加練，同日練對不算跨日記住。'):''}<div class="life-skill-options">${lifeSkills.map(([key,label,description])=>{const r=lifeSkillSummary(ctx.state,unitId,key,time),qs=lifeSkillCandidates(ctx.state,unitId,key,time);return `<section class="life-skill-card"><h2>${e(label)}</h2><p>${e(description)}</p><p class="life-skill-count">本課原題 ${r.total} 題 · 練過 ${r.practiced} 題 · 未練 ${r.remaining} 題</p><p>最近錯答或提示 ${r.weak} 題</p><button class="primary" data-life-skill-action="start" data-life-skill-unit="${e(unitId)}" data-life-skill="${key}" ${qs.length?'':'disabled'}>${qs.length?`開始${e(label)} ${qs.length} 題`:'本課暫無這種題'}</button></section>`;}).join('')}</div><nav class="resource-links" aria-label="其他練法"><a href="#life-topic/${e(unit.topic)}:${e(unit.level)}">同主題，換已學場景回想</a><a href="#life-notes/${e(unitId)}">記下自己的生活線索</a><a href="#life-cards/${e(unitId)}">先用逐句回想卡暖身</a><a href="#study/${e(unitId)}" data-open-writing>用自己的日文寫一句</a><a href="#life-schedule">今日收尾與複習預告</a><a href="#life-map">生活記憶地圖</a></nav>${note('題數是這個瀏覽器截至目前的練習紀錄，不代表熟練度。看過或聽過本課參考，當日相關原題另列提示；原首答保留，隔天再確認。')}`;
}
