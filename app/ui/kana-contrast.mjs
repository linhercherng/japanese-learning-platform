import {contrastPair} from '../content/kana-contrast.mjs';
import {pendingContrast} from '../core/kana-contrast.mjs';
import {pendingPocketListen} from '../core/kana-pocket.mjs';
import {escapeHtml as e,heading,back,primary,note} from './shared.mjs';
export function contrastView(ctx,reference){
 if(!contrastPair(reference))return back('不熟字口袋','kana-pocket')+heading('這兩字目前無法做聽辨。','請從原錯答的雙卡對照進入。')+primary('回到口袋','kana-pocket');
 const pending=pendingContrast(ctx.state)||pendingPocketListen(ctx.state),latest=ctx.state.v3.sessions.filter(s=>s.source==='kana-contrast'&&s.reference===reference&&s.completedAt).at(-1);
 return back('不熟字口袋','kana-pocket')+heading('收起線索，聽兩題。','兩個字各當一次目標，先聽聲音，再自己選。')+
 '<section class="v3-section"><h2>'+(pending?'先接續原來的聽辨':'從聲音重新想起字形')+'</h2><p>'+(pending?'原輪與首答已保存，先完成原輪，再換字對。':'字卡與訣竅先收起；這是新一輪兩選一，原錯答仍保留。')+'</p>'+
 (pending?primary('接續原來的聽辨','v3-practice/'+pending.id):'<button class="primary" data-contrast-action="start" data-contrast-reference="'+e(reference)+'">開始雙向聽辨兩題</button>')+'</section>'+
 (latest?primary('看看最近這輪結果','v3-practice/'+latest.id):'')+note('剛看過這兩字的同日／本輪提示，會另列為使用提示。兩選一的當天加練不是跨日掌握，也不代表會手寫或真人發音正確；完成不自動移出口袋。')+primary('隔天再檢查','kana-check');
}
