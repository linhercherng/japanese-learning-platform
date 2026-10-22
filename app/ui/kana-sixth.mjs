import {kana} from '../content/kana.mjs';
import {memoryFor} from '../content/kana-memory.mjs';
import {duelPairs,nextFlipStart} from '../content/kana-sixth.mjs';
import {newFlip} from '../core/kana-sixth.mjs';
import {escapeHtml as e,heading,back,primary,note,audioButton} from './shared.mjs';
const groups={basic:'基本字',voiced:'濁音',semivoiced:'半濁音',contracted:'拗音'};
export function flipLocal(session,item){if(session.kanaFlip?.key!==item)session.kanaFlip=newFlip(item);return session.kanaFlip;}
export function pendingDuel(state,pair){return state.v3.sessions.find(s=>s.source==='kana-duel'&&s.reference===pair&&!s.completedAt);}
export function flipView(ctx,item='h-3042'){
 const start=kana.find(k=>k.id===item);if(!start)return back('今天怎麼練','kana-path')+heading('這組翻卡無法開啟。','請重新選分類。')+primary('重新選擇','kana-flip');
 const r=flipLocal(ctx.session,item),k=kana.find(k=>k.id===r.queue[r.cursor]);
 const picker='<label for="six-family">這次練哪一類？</label><select id="six-family" data-six-family>'+['hira','kata'].flatMap(script=>Object.entries(groups).map(([group,label])=>{const first=kana.find(k=>k.script===script&&memoryFor(k.id).group===group);return '<option value="'+first.id+'" '+(start.script===script&&memoryFor(start.id).group===group?'selected':'')+'>'+(script==='hira'?'平':'片')+'假名・'+label+'</option>';})).join('')+'</select>';
 const intro=back('今天怎麼練','kana-path')+heading('看見字，先在心裡讀。','每組最多三張，先自己回想讀音，再聽音與看訣竅。')+picker;
 if(!k)return intro+'<section class="hero"><h2>這輪翻卡已對照。</h2><p>這是自行回想與對照，不是發音評分，也不新增答對數。</p><h3>這輪曾選「還不熟」</h3>'+r.needs.map(id=>'<button class="v3-line" data-six-action="flip-review" data-six-start="'+id+'"><strong class="jp">'+e(kana.find(k=>k.id===id).glyph)+'</strong><span>下一輪再想一次</span></button>').join('')+(r.needs.length?'':'<p>這輪沒有留下「還不熟」標記；隔天再獨立檢查。</p>')+'</section>'+primary('換下一組三張','kana-flip/'+nextFlipStart(item))+primary('隔天再檢查','kana-check')+note('本輪自評只暫存在頁面，刷新會重新開始；既有作答、提示與備份保留。');
 const attrs=' data-six-item="'+k.id+'" data-six-index="'+r.cursor+'"';
 return intro+'<section class="v3-section"><p>'+ (r.cursor+1)+' / '+r.queue.length+' 次展示'+(r.repeated.includes(k.id)&&r.cursor>=3?' · 隔開後再看':'')+'</p><div class="k6-glyph jp" lang="ja">'+e(k.glyph)+'</div><p>先自己讀一次；再按對照確認，不必搶快。</p>'+
 (r.revealed?'<div class="feedback"><h2>輔助讀音：'+e(k.reading)+'</h2>'+audioButton(k.glyph)+'<p class="jp" lang="ja">'+e(k.word)+'（'+e(k.wordReading)+'）</p><p>'+e(memoryFor(k.id).tip)+'</p></div><div class="button-row"><button class="secondary" data-six-action="flip-again"'+attrs+'>還不熟，稍後再想</button><button class="primary" data-six-action="flip-next"'+attrs+'>先往下一張</button></div>':'<button class="primary" data-six-action="flip-reveal"'+attrs+'>展開讀音與訣竅</button>')+'</section>'+note('還不熟的卡，後方至少有兩張才排到末尾，每卡最多一次；不足時留待下一輪。最多六次展示，不把自評當作答對。')+'<button class="secondary" data-six-action="flip-reset">這組重新開始</button>'+primary('換下一組三張','kana-flip/'+nextFlipStart(item))+note('本輪暫存，刷新會重新開始。看字與對照會記錄提示曝光；想確認是否記住，隔天再檢查。');
}
export function duelView(ctx,pairId){
 if(!pairId)return back('今天怎麼練','kana-path')+heading('一次只分清這兩個字。','六組常見混淆，每組兩題；先聽聲音，練雙向辨別。')+duelPairs.map((p,i)=>'<a class="v3-line" href="#kana-duel/'+p.id+'"><strong>'+(i+1)+' '+e(p.label)+'</strong><span>兩題聽辨</span></a>').join('')+note('先不預覽字形。需要時可進入對照，練習首答與提示分開保留。');
 const p=duelPairs.find(p=>p.id===pairId);if(!p)return back('二選一目錄','kana-duel')+heading('這組二選一無法開啟。','請重新選擇。');
 const pending=pendingDuel(ctx.state,p.id),shown=!pending&&ctx.session.sixCompare===p.id;
 return back('二選一目錄','kana-duel')+heading(p.label,'兩個方向各聽一次，先只找出一處差異。')+
 (pending?'<section class="hero"><h2>先接續原來的二選一。</h2><p>題目與首答已固定，這裡先收起對照。</p>'+primary('接續原來的二選一','v3-practice/'+pending.id)+'</section>':'<button class="primary" data-six-action="duel-start" data-six-pair="'+p.id+'">直接開始兩題聽辨</button><button class="secondary lesson-footer" data-six-action="duel-compare" data-six-pair="'+p.id+'" aria-expanded="'+shown+'">'+(shown?'收起對照':'先看一處差異（會記錄提示）')+'</button>'+
 (shown?'<section class="v3-section"><div class="k6-pair jp" lang="ja"><span>'+e(p.left)+'</span><span>'+e(p.right)+'</span></div><p>'+e(p.difference)+'</p>'+note(p.memoryTip)+'</section>':''))+
 note('這是當天二選一加練；選項較少的正確率，不當成跨日熟練或正式檢定成績。教材與合成音尚待教師審校。')+primary('查看隔天檢查','kana-check');
}
