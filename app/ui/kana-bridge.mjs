import {kana} from '../content/kana.mjs';import {memoryFor} from '../content/kana-memory.mjs';
import {bridgeCards,bridgePartner} from '../content/kana-bridge.mjs';import {nextFlipStart} from '../content/kana-sixth.mjs';
import {pendingBridge} from '../core/kana-bridge.mjs';
import {escapeHtml as e,heading,back,primary,note,audioButton} from './shared.mjs';
const groups={basic:'基本字',voiced:'濁音',semivoiced:'半濁音',contracted:'拗音'};
export function bridgeView(ctx,item='h-3042'){
 const k=kana.find(k=>k.id===item);if(!k)return back('今天怎麼練','kana-path')+heading('這組平片互換無法開啟。','請重新選分類。')+primary('重新選擇','kana-bridge');
 const pending=pendingBridge(ctx.state,item),shown=!pending&&ctx.session.bridgeCompare===item,attrs=' data-bridge-item="'+k.id+'"',latest=ctx.state.v3.sessions.filter(s=>s.source==='kana-bridge'&&s.reference===item&&s.completedAt).at(-1);
 return back('今天怎麼練','kana-path')+heading('同一聲音，連起兩種字形。','每次三題，把平假名與片假名的對應關係練熟一點。')+
 '<label for="bridge-family">這次練哪個方向？</label><select id="bridge-family" data-bridge-family>'+['hira','kata'].flatMap(script=>Object.entries(groups).map(([group,label])=>{const first=kana.find(c=>c.script===script&&memoryFor(c.id).group===group);return '<option value="'+first.id+'" '+(k.script===script&&memoryFor(k.id).group===group?'selected':'')+'>看'+(script==='hira'?'平選片':'片選平')+'・'+label+'</option>';})).join('')+'</select>'+
 '<section class="hero"><h2>'+(k.script==='hira'?'看平假名，選片假名。':'看片假名，選平假名。')+'</h2><p>同類三個字，每題三選一；先自己想，再看對照。</p>'+
 (pending?'<p>原來的題目與首答已固定，這裡先收起對照。</p>'+primary('接續原來的三題','v3-practice/'+pending.id):'<button class="primary" data-bridge-action="start"'+attrs+'>開始平片互換三題</button>')+'</section>'+
 (!pending?'<button class="secondary" data-bridge-action="compare"'+attrs+' aria-expanded="'+shown+'" aria-controls="bridge-comparison">'+(shown?'收起雙形對照':'先看同音雙形對照（會記錄提示）')+'</button>':'')+
 (shown?'<section id="bridge-comparison" class="v3-section"><h2>同音雙形對照</h2><p>把同一個讀音連到兩種字形，再各找一個形狀線索。</p>'+bridgeCards(item).map(source=>{const target=bridgePartner(source.id),hira=source.script==='hira'?source:target,kata=source.script==='kata'?source:target;return '<section class="v3-section"><div class="k6-pair jp" lang="ja"><span>'+e(hira.glyph)+'</span><span>'+e(kata.glyph)+'</span></div><p>平假名 → 片假名 · 輔助讀音 '+e(hira.reading)+'</p>'+audioButton(hira.glyph)+'<p>平假名線索：'+e(memoryFor(hira.id).tip)+'</p><p>片假名線索：'+e(memoryFor(kata.id).tip)+'</p></section>';}).join('')+'</section>':'')+
 '<nav class="button-row lesson-footer" aria-label="切換平片練法">'+primary('同一組，反向再想','kana-bridge/'+bridgePartner(item).id)+primary('換下一組三字','kana-bridge/'+nextFlipStart(item))+'</nav>'+note('反向是另一輪首答；同日或本輪看過雙形對照，會另外標記使用提示。這裡只練字形辨認，不代表已會聽、會寫或跨日記住。')+
 (latest?primary('看看最近這輪結果','v3-practice/'+latest.id):'')+primary('隔天再檢查','kana-check')+note('對照開關只暫存在頁面，刷新收起；已開始的三題與首答會保存。教材與合成語音尚待教師審校。');
}
