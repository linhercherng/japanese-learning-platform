import {pocketReview,reviewCueItems,pocketContrast,contrastCueItems} from './core/kana-pocket-review.mjs';
import {setPocket,pendingPocketListen} from './core/kana-pocket.mjs';
import {pendingContrast} from './core/kana-contrast.mjs';
import {pocketReviewView,reviewLocal} from './ui/kana-pocket-review.mjs';
import {recordKanaExposure,readDictation} from './core/kana-studio.mjs';

export function createKanaPocketReview({getContext,update,render,toast,now,cacheDraft}){
 let saving=false;
 function current(){
  const [name,key]=location.hash.slice(1).split('/'),ctx=getContext();
  if(name!=='kana-pocket-review'||pendingPocketListen(ctx.state)||pendingContrast(ctx.state))return null;
  const review=pocketReview(ctx.state,key);if(!review)return null;
  const ui=reviewLocal(ctx.session,key),entry=review.entries[ui.index];return entry?{key,ui,entry}:null;
 }
 async function action(d){
  const c=current();if(!c||c.key!==d.reviewSession||c.entry.question.id!==d.reviewQuestion)return;
  const pair=pocketContrast(c.entry),name=d.pocketReviewAction;
  if(['toggle','contrast','cover','uncover'].includes(name)){
   let focus=name;
   if(name==='toggle'&&!c.ui.covered){c.ui.revealed=!c.ui.revealed;c.ui.contrast=false;}
   else if(name==='contrast'&&pair&&!c.ui.covered){c.ui.contrast=!c.ui.contrast;c.ui.revealed=false;}
   else if(name==='cover'&&pair&&c.ui.contrast&&!c.ui.covered){c.ui.covered=true;focus='uncover';}
   else if(name==='uncover'&&pair&&c.ui.contrast&&c.ui.covered){c.ui.covered=false;focus='cover';}
   else return;
   render(false);document.querySelector('[data-pocket-review-action="'+focus+'"]')?.focus();return;
  }
  if(d.pocketReviewAction!=='keep'||saving||getContext().state.v3.kanaPocket?.[c.entry.item]?.active)return;
  saving=true;const origin=location.hash,index=c.ui.index,time=now();let kept=false;
  try{
   await update(s=>{if(!pocketReview(s,c.key)||pendingPocketListen(s)||pendingContrast(s))return s;kept=true;return setPocket(s,c.entry.item,true,time);});
   if(kept&&location.hash===origin&&current()?.ui===c.ui&&c.ui.index===index){render(false);document.querySelector('#pocket-review-picker')?.focus();toast('已留回口袋');}
  }finally{saving=false;}
 }
 function click(event){const b=event.target.closest('button');if(!b?.dataset.pocketReviewAction)return;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected)b.disabled=false;});}
 function change(event){
  const c=current(),value=event.target.value;if(!c||event.target.dataset.pocketReviewPicker!==c.key||!/^\d+$/.test(value))return;
  const index=Number(value),review=pocketReview(getContext().state,c.key);if(!review.entries[index])return;
  c.ui.index=index;c.ui.revealed=false;c.ui.contrast=false;c.ui.covered=false;render(false);document.querySelector('#pocket-review-picker')?.focus();
 }
 function afterRender(name,key){
  if(name!=='kana-pocket-review')return;const ctx=getContext();if(pendingPocketListen(ctx.state)||pendingContrast(ctx.state))return;
  const review=pocketReview(ctx.state,key);if(!review)return;const ui=reviewLocal(ctx.session,key),entry=review.entries[ui.index];if(!entry)return;
  // Freeze only text actually shown by this render, even if the learner navigates while saving.
  const pair=pocketContrast(entry),contrast=pair&&ui.contrast;if(contrast&&ui.covered)return;
  const items=contrast?contrastCueItems(pair):reviewCueItems(entry,ui.revealed,ctx.state.v3.kanaNotes?.[entry.item]?.text||''),time=now();
  update(s=>{const next=recordKanaExposure(s,items,time);for(const item of items){const draft=readDictation(next,item);if(draft)cacheDraft(draft.key,next.drafts[draft.key]);}return next;}).catch(error=>toast(error.message));
 }
 document.addEventListener('click',click);document.addEventListener('change',change);
 return {views:{'kana-pocket-review':id=>pocketReviewView(getContext(),id)},afterRender,dispose(){document.removeEventListener('click',click);document.removeEventListener('change',change);}};
}
