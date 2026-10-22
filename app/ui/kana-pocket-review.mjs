import {pocketReview,pocketContrast} from '../core/kana-pocket-review.mjs';
import {pendingPocketListen} from '../core/kana-pocket.mjs';
import {pendingContrast} from '../core/kana-contrast.mjs';
import {contrastPair} from '../content/kana-contrast.mjs';
import {escapeHtml as e,heading,back,primary,note,audioButton} from './shared.mjs';

export function reviewLocal(session,key){
 if(session.pocketReview?.key!==key)session.pocketReview={key,index:0,revealed:false,contrast:false,covered:false};
 return session.pocketReview;
}
function contrastCards(pair,attrs){
 return '<div id="pocket-review-contrast" class="kf-answer"><h3>兩個字，挑一處差異記。</h3><p>這是這輪原選字的對照，不代表一直分不清這兩個字。</p><button class="primary" data-pocket-review-action="cover"'+attrs+'>遮住字形，自己回想</button><div class="kl-cards">'+[pair.reference,pair.selected].map((k,i)=>'<section class="kl-card"><h3>'+(i?'我當時選的字':'參考字')+'</h3><div class="row-title"><span class="jp" lang="ja">'+e(k.glyph)+'</span></div><p>輔助讀音：'+e(k.reading)+'</p>'+audioButton(k.glyph,i?'聽原選字':'聽參考字')+'<p><span class="jp" lang="ja">'+e(k.word)+'（'+e(k.wordReading)+'）</span>・'+e(k.meaning)+'</p><p>'+e(k.tip)+'</p></section>').join('')+'</div>'+(pair.difference?'<h3>先看這一處</h3><p>'+e(pair.difference)+'</p>':'')+(contrastPair(pair.reference.id+':'+pair.selected.id)?primary('收起雙卡，聽兩題','kana-contrast/'+pair.reference.id+':'+pair.selected.id):'')+'</div>';
}
function reviewCard(entry,ui,cue,attrs){
 const pair=pocketContrast(entry),contrast=pair&&ui.contrast;
 if(contrast&&ui.covered)return '<div class="kf-answer"><h3>字形先收起，自己想一次。</h3><p>回想剛才參考字的字形與一處差異，再揭開核對。不必搶快，也不用判自己得幾分。</p><button class="primary" data-pocket-review-action="uncover"'+attrs+'>揭開雙卡，自己核對</button></div>';
 return (contrast?'':'<p>參考字</p><div class="k6-glyph jp" lang="ja">'+e(entry.question.transcript)+'</div><p>原選字：<span class="jp" lang="ja">'+e(entry.chosen)+'</span></p>')+
 '<button class="secondary" data-pocket-review-action="toggle"'+attrs+' aria-expanded="'+Boolean(ui.revealed&&!contrast)+'" aria-controls="pocket-review-cue">'+(ui.revealed&&!contrast?'收起線索，再想一次':'展開一處記憶線索')+'</button>'+
 (ui.revealed&&!contrast?'<div id="pocket-review-cue" class="kf-answer"><h3>挑一處最容易想起來的線索</h3><p>'+e(entry.question.explanation)+'</p>'+audioButton(entry.question.transcript)+(cue?'<h3>我的記憶線索</h3><p>'+e(cue)+'</p>':'')+'</div>':'<div id="pocket-review-cue" hidden></div>')+
 (pair?'<button class="secondary" data-pocket-review-action="contrast"'+attrs+' aria-expanded="'+Boolean(contrast)+'" aria-controls="pocket-review-contrast">'+(contrast?'收起雙字對照':'對照參考字與原選字')+'</button>'+(contrast?contrastCards(pair,attrs):'<div id="pocket-review-contrast" hidden></div>'):'');
}
export function pocketReviewView(ctx,id){
 const review=pocketReview(ctx.state,id),pending=pendingPocketListen(ctx.state)||pendingContrast(ctx.state);
 if(!review)return back('不熟字口袋','kana-pocket')+heading('這輪還不能回顧。','請從已完成的口袋聽辨結果進入。')+primary('回到口袋','kana-pocket');
 if(pending)return back('不熟字口袋','kana-pocket')+heading('先接續原輪，再看回顧。','聽辨尚未完成，字卡與解說先收起。')+primary(pending.source==='kana-contrast'?'接續錯字雙向聽辨':'接續口袋聽音回想','v3-practice/'+pending.id);
 const ui=reviewLocal(ctx.session,id),entry=review.entries[ui.index]||review.entries[0],q=entry.question,cue=ctx.state.v3.kanaNotes?.[entry.item]?.text||'',active=ctx.state.v3.kanaPocket?.[entry.item]?.active,attrs=' data-review-session="'+e(id)+'" data-review-question="'+e(q.id)+'"';
 return back('回到這輪聽辨結果','v3-practice/'+id)+heading('一個字，一處記憶線索。','先看看原首答，再決定要不要展開訣竅。')+
 '<label for="pocket-review-picker">回顧哪一個字？</label><select id="pocket-review-picker" data-pocket-review-picker="'+e(id)+'">'+review.entries.map((r,i)=>'<option value="'+i+'" '+(i===ui.index?'selected':'')+'>第'+(i+1)+'字 · '+e(r.status)+'</option>').join('')+'</select>'+
 '<section class="v3-section"><h2>第'+(ui.index+1)+' / '+review.entries.length+'字 · '+e(entry.status)+'</h2><p>原首答'+(entry.answer.hinted?'用過提示':'未用提示')+'；這裡保留當時的紀錄。</p>'+reviewCard(entry,ui,cue,attrs)+'</section>'+
 '<section class="v3-section"><h2>下一次，想再練這個字嗎？</h2>'+(active?'<p>目前仍在口袋，之後可以再回想。</p>':'<p>這個字已移出口袋；想多練一次，可以自己留回。</p><button class="primary" data-pocket-review-action="keep"'+attrs+'>還想再練，留回口袋</button>')+primary('寫自己的記憶線索','kana-notes/'+entry.item)+'</section>'+
 note('已顯示的字與展開的線索會記為提示；回顧、遮住與揭開不新增答對數、不改寫原首答，也不代表已跨日記住。切字或刷新後，線索與對照會收起。')+
 '<nav class="button-row lesson-footer" aria-label="回顧後的下一步">'+primary('回到不熟字口袋','kana-pocket')+primary('隔天再檢查','kana-check')+'</nav>';
}
