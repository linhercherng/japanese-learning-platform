import {pocketReview} from '../core/kana-pocket-review.mjs';
import {pendingPocketListen} from '../core/kana-pocket.mjs';
import {escapeHtml as e,heading,back,primary,note,audioButton} from './shared.mjs';

export function reviewLocal(session,key){
 if(session.pocketReview?.key!==key)session.pocketReview={key,index:0,revealed:false};
 return session.pocketReview;
}
export function pocketReviewView(ctx,id){
 const review=pocketReview(ctx.state,id),pending=pendingPocketListen(ctx.state);
 if(!review)return back('不熟字口袋','kana-pocket')+heading('這輪還不能回顧。','請從已完成的口袋聽辨結果進入。')+primary('回到口袋','kana-pocket');
 if(pending)return back('不熟字口袋','kana-pocket')+heading('先接續原輪，再看回顧。','聽辨尚未完成，字卡與解說先收起。')+primary('接續口袋聽音回想','v3-practice/'+pending.id);
 const ui=reviewLocal(ctx.session,id),entry=review.entries[ui.index]||review.entries[0],q=entry.question,cue=ctx.state.v3.kanaNotes?.[entry.item]?.text||'',active=ctx.state.v3.kanaPocket?.[entry.item]?.active,attrs=' data-review-session="'+e(id)+'" data-review-question="'+e(q.id)+'"';
 return back('回到這輪聽辨結果','v3-practice/'+id)+heading('一個字，留一處好記的線索。','先看看原首答，再決定要不要展開訣竅。')+
 '<label for="pocket-review-picker">回顧哪一個字？</label><select id="pocket-review-picker" data-pocket-review-picker="'+e(id)+'">'+review.entries.map((r,i)=>'<option value="'+i+'" '+(i===ui.index?'selected':'')+'>第'+(i+1)+'字 · '+e(r.status)+'</option>').join('')+'</select>'+
 '<section class="hero"><h2>第'+(ui.index+1)+' / '+review.entries.length+'字 · '+e(entry.status)+'</h2><p>原首答'+(entry.answer.hinted?'用過提示':'未用提示')+'；這裡保留當時的紀錄。</p><p>參考字</p><div class="k6-glyph jp" lang="ja">'+e(q.transcript)+'</div><p>原選字：<span class="jp" lang="ja">'+e(entry.chosen)+'</span></p>'+
 '<button class="secondary" data-pocket-review-action="toggle"'+attrs+' aria-expanded="'+ui.revealed+'" aria-controls="pocket-review-cue">'+(ui.revealed?'收起線索，再想一次':'展開一處記憶線索')+'</button>'+
 (ui.revealed?'<div id="pocket-review-cue" class="kf-answer"><h3>挑一處最容易想起來的線索</h3><p>'+e(q.explanation)+'</p>'+audioButton(q.transcript)+(cue?'<h3>我的記憶線索</h3><p>'+e(cue)+'</p>':'')+'</div>':'<div id="pocket-review-cue" hidden></div>')+'</section>'+
 '<section class="v3-section"><h2>下一次，想再練這個字嗎？</h2>'+(active?'<p>目前仍在口袋，之後可以再回想。</p>':'<p>這個字已移出口袋；想多練一次，可以自己留回。</p><button class="primary" data-pocket-review-action="keep"'+attrs+'>還想再練，留回口袋</button>')+primary('寫自己的記憶線索','kana-notes/'+entry.item)+'</section>'+
 note('已顯示的字與展開的線索會記為提示；回顧不新增答對數、不改寫原首答，也不代表已跨日記住。切字或刷新後，線索會收起。')+
 '<nav class="button-row lesson-footer" aria-label="回顧後的下一步">'+primary('回到不熟字口袋','kana-pocket')+primary('隔天再檢查','kana-check')+'</nav>';
}
