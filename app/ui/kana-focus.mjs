import {rhythmCards,rhythmGroups} from '../content/kana-focus.mjs';
import {selectRepairQuestions,pendingRepair} from '../core/kana-focus.mjs';
import {escapeHtml as e,heading,back,primary,note,audioButton} from './shared.mjs';
export function beatState(session,id){
 if(session.kanaBeat?.id!==id)session.kanaBeat={id,taps:0,revealed:false};
 return session.kanaBeat;
}
export function pathView(ctx,time){
 const pending=pendingRepair(ctx.state),count=selectRepairQuestions(ctx.state,time).length;
 const paths=[
  ['剛開始，先記少量','先用三字小循環認字、聽辨，再慢慢收起圖像。',[['清濁聲音家族','kana-family'],['平片互換三題','kana-bridge'],['看字想聲翻卡','kana-flip'],['一次三字','kana-mini'],['提示慢慢退場','kana-fade']]],
  ['容易混淆，找出差異','依實際錯答選練習，或回到字卡找一處記憶線索。',[['混淆字二選一','kana-duel'],['弱點三題','kana-repair'],['混淆字專練','kana-confusions'],['寫自己的線索','kana-notes']]],
  ['放進生活詞，聲音連字形','先聽完整詞，練拍數或拼詞，再試著自己輸入。',[['一拍一格','kana-beats'],['生活詞拼拼看','kana-build'],['聽音打字回想','kana-type'],['聽音默寫','kana-dictation']]],
  ['隔天再想，看看記住多少','用真正日期留下回想紀錄；沒有符合項目時不用硬補題。',[['隔天檢查','kana-check'],['七日回想','kana-week'],['回想小結','kana-recall'],['記憶地圖','kana-map']]]
 ];
 return back('練習工坊','kana-studio')+heading('今天，先練一件事。','不必每個入口都做，選最貼近你現在需要的一種。')+
 '<section class="hero"><h2>'+(pending?'先接續原來那輪。':count?'有'+count+'個字可以再想一次。':'先從三個字開始。')+'</h2>'+primary(pending?'接續弱點回想':count?'開始弱點三題':'做一輪三字',pending?'v3-practice/'+pending.id:count?'kana-repair':'kana-mini')+'</section>'+
 paths.map(([title,description,links])=>'<section class="v3-section"><h2>'+title+'</h2><p>'+description+'</p><nav class="ks-links" aria-label="'+title+'">'+links.map(([label,route])=>'<a href="#'+route+'">'+label+'</a>').join('')+'</nav></section>').join('')+note('當天看懂是進步，隔天獨立想起來再另外記錄。書寫與發音仍需分開練習。');
}
export function repairView(ctx,time){
 const pending=pendingRepair(ctx.state),questions=selectRepairQuestions(ctx.state,time),latest=ctx.state.v3.sessions.filter(s=>s.source==='kana-repair'&&s.completedAt).at(-1);
 return back('今天怎麼練','kana-path')+heading('只挑需要的，最多三題。','每個字先照顧一種弱能力，少一點，專心想一次。')+
 (pending?'<section class="hero"><h2>接著完成原來這輪。</h2><p>題目已固定，先收起範字；不因其他練習重排。</p>'+primary('接續弱點回想','v3-practice/'+pending.id)+'</section>':questions.length?'<section class="hero"><h2>這輪'+questions.length+'字、'+questions.length+'題。</h2><p>認字'+questions.filter(q=>q.dimension==='recognition').length+'題 · 聽辨'+questions.filter(q=>q.dimension==='listening').length+'題。到期與較早練過的弱項優先。</p><button class="primary" data-focus-action="repair-start">收起提示，開始弱點三題</button></section>':'<section class="hero"><h2>目前沒有已知認字／聽辨弱點。</h2><p>這裡不補從未練過的新字，也不把手寫自評當成答錯。</p>'+primary('先做少量三字練習','kana-mini')+'</section>')+
 note('當天首答答錯或看提示，即使後來答對仍保留複習需要。隔天再獨立回想；完成三題不代表已經長期記住。')+(latest?primary('看看最近這輪結果','v3-practice/'+latest.id):'')+primary('查看字卡與能力紀錄','kana-map');
}
export function rhythmView(ctx,id='tea'){
 const card=rhythmCards.find(c=>c.id===id);if(!card)return back('今天怎麼練','kana-path')+heading('這張節奏卡無法開啟。','請重新選擇生活詞。')+primary('選一個詞','kana-beats');
 const ui=beatState(ctx.session,card.id),group=rhythmGroups.find(g=>g.id===card.group),index=rhythmCards.indexOf(card),attrs=' data-focus-card="'+card.id+'"';
 return back('今天怎麼練','kana-path')+heading('一拍一格，聲音慢慢記。','先聽完整詞，自己數一次；再打開拍格對照。')+
 '<label for="rhythm-word">這次聽哪個詞？</label><select id="rhythm-word" data-focus-word>'+rhythmGroups.map(g=>'<optgroup label="'+e(g.title)+'">'+rhythmCards.filter(c=>c.group===g.id).map(c=>'<option value="'+c.id+'" '+(c.id===id?'selected':'')+'>'+e(c.zh)+'</option>').join('')+'</optgroup>').join('')+'</select>'+
 '<section class="v3-section"><span class="tag">'+e(group.title)+'</span><h2>'+e(card.zh)+'</h2>'+audioButton(card.audio)+'<p>聽完再按，每按一次算一拍。這是自行對照，不會自動評分拍點或發音。</p><p class="kf-count" role="status" aria-live="polite">你數了'+ui.taps+'拍</p><div class="button-row"><button class="primary" data-focus-action="tap"'+attrs+'>點一下，數一拍</button><button class="secondary" data-focus-action="reset"'+attrs+'>重新數拍</button></div><button class="secondary lesson-footer" data-focus-action="reveal" aria-expanded="'+ui.revealed+'" aria-controls="rhythm-answer"'+attrs+'>'+(ui.revealed?'收起拍格，再聽一次':'展開拍格對照（會記錄提示）')+'</button>'+
 (ui.revealed?'<div id="rhythm-answer" class="kf-answer"><h3>參考分拍：'+card.beats.length+'拍</h3><p class="jp" lang="ja">'+e(card.jp)+'（'+e(card.reading)+'）</p><ol class="kf-beats" aria-label="依序分拍">'+card.beats.map(b=>'<li lang="ja" class="jp">'+e(b)+'</li>').join('')+'</ol><p>'+e(card.tip)+'</p>'+note(group.tip)+'</div>':'')+'</section>'+
 '<nav class="button-row" aria-label="切換生活詞">'+(index?primary('上一個詞','kana-beats/'+rhythmCards[index-1].id):'')+(index<rhythmCards.length-1?primary('下一個詞','kana-beats/'+rhythmCards[index+1].id):primary('回到練法選擇','kana-path'))+'</nav>'+note('數拍只暫存在本頁，換詞或刷新會重新開始；不加入無提示答對數。拍格是節奏提示，完整詞音不會被切成不自然的單音。教材與合成音尚待教師審校。')+
 '<details><summary>拍數和字塊有什麼不同？</summary><p>拼詞字塊協助記詞形；拍格協助保留聲音長度。這裡只整理12個詞，不是通用斷音工具。</p><p>規則參考：<a href="https://www.coelang.tufs.ac.jp/mt/ja/pmod/practical/01-11-02.php" target="_blank" rel="noopener noreferrer">東京外國語大學發音模組</a>；繁中解說與拍格為日和自編。</p></details>';
}
