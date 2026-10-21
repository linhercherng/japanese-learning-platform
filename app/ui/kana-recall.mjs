import {kana} from '../content/kana.mjs';
import {words} from '../content/catalog.mjs';
import {buildExamples} from '../content/kana-lab.mjs';
import {memoryFor} from '../content/kana-memory.mjs';
import {weekSchedule,kanaRecallReport} from '../core/kana-recall.mjs';
import {studyDay} from '../core/v3-state.mjs';
import {studioSelectView} from './kana-studio.mjs';
import {escapeHtml as e,heading,back,primary,note,audioButton} from './shared.mjs';
export const recallLinks=()=>'<nav class="ks-links" aria-label="第四批五十音記憶"><a href="#kana-type">聽音打字回想</a><a href="#kana-week">七日回想</a><a href="#kana-recall">回想小結</a></nav>';
export function typingView(ctx,item){
 if(!item)return studioSelectView(ctx,'kana-type','聽音打字回想')+note('已會點選字塊？改用日文鍵盤輸入，一次最多3詞。')+recallLinks();
 const k=kana.find(k=>k.id===item);if(!k)return heading('這張字卡無法開啟。','請重新選字。')+primary('選擇字卡','kana-type');
 const examples=buildExamples(item,words),pending=ctx.state.v3.sessions.find(s=>s.source==='kana-type'&&s.reference===item&&!s.completedAt);
 return back('練習工坊','kana-studio')+heading('收起選項，自己打出來。','聽詞音、看意思，用假名從記憶找回完整詞。')+'<p class="ks-target jp" lang="ja">'+e(k.glyph)+'</p>'+note('請先切換日文鍵盤。每題會標明要輸入平假名讀音或片假名詞形；先完成選字，再按提交。打字與手寫是不同練習。')+(examples.length?examples.map(w=>'<section class="v3-section"><h2>'+e(w.zh)+'</h2>'+audioButton(w.audio)+'</section>').join('')+'<button class="primary" data-recall-action="type-start" data-recall-item="'+item+'">'+(pending?'接續':'開始')+' '+examples.length+' 詞打字</button>':'<section class="v3-section"><h2>這張卡目前沒有可用的自然詞。</h2><p>先換到同音平假名，用實際詞例練習。</p>'+primary('看平假名詞例','kana-type/'+memoryFor(item).partnerId)+'</section>')+'<details><summary>還不熟悉日文輸入？</summary><p>先在日文鍵盤輸入假名，確定候選字後再提交。這裡要求假名，不需轉成漢字；也可先用拼詞字塊練習。瀏覽器不會自動安裝鍵盤。</p>'+primary('先用生活詞拼拼看','kana-build/'+item)+'</details>'+note('草稿與首次答案都會保留。需要提示可以按提示鈕；提示後想起來也有價值，但會與無提示答案分開。')+recallLinks();
}
export function weekView(ctx,time){
 const schedule=weekSchedule(ctx.state,time),sessions=ctx.state.v3.sessions.filter(s=>s.source==='kana-week'),pending=sessions.find(s=>!s.completedAt),today=sessions.find(s=>s.reference===studyDay(time)),active=pending||today;
 return back('練習工坊','kana-studio')+heading('隔了七天，還想得起來嗎？','份量少一點，留時間觀察真正的回想。')+note('只挑最近一次同能力作答已隔至少7個台北日曆日、近7天也未看過已紀錄圖像／線索提示的字。認字與聽辨各自看，不補從未練過的新字。')+(active?'<section class="v3-section"><h2>'+(active.completedAt?'今天已留下一次紀錄。':'先接著完成原來這輪。')+'</h2>'+primary(active.completedAt?'查看今天的結果':'接續七日回想','v3-practice/'+active.id)+'</section>':schedule.questions.length?'<section class="hero"><h2>這輪'+schedule.questions.length+'題，慢慢想。</h2><p>共有'+schedule.eligible+'個字卡能力符合條件，這次最多10題；先照顧需要複習的項目。</p><button class="primary" data-recall-action="week-start">收起提示，開始七日回想</button></section>':'<section class="v3-section"><h2>尚無符合條件的七日項目。</h2><p>'+(schedule.nextDay?'若期間沒有再次練習或查看提示，最早可在 '+e(schedule.nextDay)+' 檢查。':'先練少量字，之後會依真實日期提供檢查。')+'</p>'+primary('先做一輪三字','kana-mini')+'</section>')+note('開始後題目固定，離開也能續作。若中間先看提示或另做同字練習，結果會分開記錄或排除比較；完成一輪不等於長期熟練。')+recallLinks();
}
export function recallView(ctx,time){
 const r=kanaRecallReport(ctx.state,time),labels={recognition:'認字',listening:'聽辨',language:'詞語運用（拼詞／輸入等）'},total=Object.values(r.abilities).reduce((n,a)=>n+a.total,0);
 return back('練習工坊','kana-studio')+heading('看看怎麼想起來，再走下一步。',r.start+' ～ '+r.end)+note('同一字、同一能力、同一天只取第一筆。當天反覆練習不會增加無提示成功數；詞語運用不替代聽辨，手寫保留自評。')+Object.entries(r.abilities).map(([d,a])=>'<section class="v3-section"><h2>'+labels[d]+'</h2><p><strong>'+a.correct+' / '+a.total+'</strong> 次每日首答無提示正確</p><p>'+a.hinted+' 次使用提示 · '+a.needsReview+' 次需再複習'+(a.ambiguous?' · '+a.ambiguous+' 次同時紀錄無法確定先後':'')+'</p></section>').join('')+'<section class="v3-section"><h2>手寫自評</h2><p>'+r.writing+' 個字卡日留下自評，不計入上面的客觀答對數。</p>'+primary('想自己寫一次','kana-dictation')+'</section>'+(total?'':'<section class="hero"><h2>先留下一次自己的回想。</h2>'+primary('先做一輪三字','kana-mini')+'</section>')+'<section class="v3-section"><h2>下一小步</h2><p>'+r.week.eligible+' 個字卡能力可做七日回想。</p>'+primary('查看七日回想','kana-week')+(r.recommendations.length?'<h3>先照顧這幾個字</h3>'+r.recommendations.map(k=>'<a class="v3-line" href="#kana-map/'+k.id+'"><strong class="jp">'+e(k.glyph)+'</strong><span>看認字／聽辨紀錄與練習</span></a>').join(''):'<p>目前沒有已知認字／聽辨弱點；繼續少量練習，再觀察跨日紀錄。</p>')+'</section>'+recallLinks();
}
