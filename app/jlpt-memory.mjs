import {questionById} from './content/catalog.mjs';
import {jlptLevels,jlptUnitMeta,jlptQuestionUnits,jlptUnitQuestionIds} from './content/jlpt-memory-ids.mjs';
import {recordJlptExposure} from './core/jlpt-memory-state.mjs';
import {jlptBlocker,pendingJlpt,startJlptRound,storeJlptNote,jlptNoteKey,jlptRoundReview} from './core/jlpt-memory.mjs';
import {jlptLocal,jlptCardItems,jlptCardAudio,jlptPathView,jlptHubView,jlptMapView,jlptReviewView,jlptCardsView,jlptNoteView,jlptRoundView} from './ui/jlpt-memory.mjs';
import {jlptGuideView} from './ui/jlpt-guide.mjs';

export function createJlptMemory({getContext,update,render,toast,now,id,play,cacheDraft}){
 let lastRoute='',epoch=0,run=0,busy=false,disposed=false,composing=false,pointerBlocked=false;
 const route=()=>location.hash.slice(1).split('/'),local=()=>jlptLocal(getContext().session);
 const focus=selector=>document.querySelector(selector)?.focus?.({preventScroll:false});
 const fresh=(ticket,origin)=>!disposed&&ticket===epoch&&location.hash===origin;
 function pack(unit,kind='words',offset=0){const pool=jlptCardItems(unit,kind);return {kind,offset,queue:[offset,offset+1,offset+2].filter(i=>pool[i]),cursor:0,run:++run,open:false,retried:[],deferred:[]};}
 function onRoute(name,param){const key=name+'/'+(param||'');if(key===lastRoute)return;lastRoute=key;epoch++;composing=false;pointerBlocked=false;const ui=local();ui.noteOpen=false;ui.roundIndex=0;ui.roundRevealed=false;ui.roundPassage=false;ui.cards=name==='jlpt-cards'&&jlptUnitMeta.has(param)?pack(param):null;}
 const expose=(unit,time)=>update(s=>recordJlptExposure(s,jlptUnitQuestionIds(unit),time,{kind:'reference',ref:'page:'+route()[0]+':'+unit}));
 function currentCard(d){const [name,unit]=route(),card=local().cards;return name==='jlpt-cards'&&unit===d.jlptUnit&&card&&String(card.run)===d.jlptRun&&String(card.cursor)===d.jlptCursor?{unit,card}:null;}
 async function action(d){
  const [name,param]=route();if(disposed||busy||composing||!name.startsWith('jlpt-')||jlptBlocker(getContext().state))return;
  const ui=local(),action=d.jlptAction,ticket=epoch,origin=location.hash;
  if(name==='jlpt-memory'&&(!param||jlptLevels.includes(param))&&['reset','page'].includes(action)){
   if(action==='reset')ui.filters={query:'',scope:'all',page:1};else{const page=Number(d.jlptPage);if(!Number.isInteger(page)||page<1)return;ui.filters.page=page;}render(false);focus('#jlpt-results');return;
  }
  if(action==='start'||action==='start-review'){
   let options;if(action==='start'&&name==='jlpt-memory'&&param===d.jlptUnit&&jlptUnitMeta.has(param)&&['memory','skill'].includes(d.jlptMode))options={unitId:param,mode:d.jlptMode,ability:d.jlptAbility};
   if(action==='start-review'&&name==='jlpt-review'&&param===d.jlptLevel+':'+d.jlptMode&&['check','week','repair'].includes(d.jlptMode))options={level:d.jlptLevel,mode:d.jlptMode};
   if(!options)return;busy=true;let destination;
   try{await update(s=>{const next=startJlptRound(s,{...options,id:id(),time:now()});destination=pendingJlpt(next)?.id;return next;});if(destination&&fresh(ticket,origin))location.hash='v3-practice/'+destination;}finally{busy=false;}return;
  }
  if(['reveal','audio','known','again','next-group','restart-group'].includes(action)){
   const current=currentCard(d);if(!current)return;const {unit,card}=current,item=card.queue[card.cursor];
   if(['known','again'].includes(action)){
    if(!card.open||item===undefined)return;
    if(action==='again'&&!card.retried.includes(item)){card.retried.push(item);if(card.queue.length-card.cursor-1>=2)card.queue.push(item);else card.deferred.push(item);}
    card.cursor++;card.open=false;render(false);focus('#jlpt-card-heading');return;
   }
   if(['next-group','restart-group'].includes(action)){
    if(card.cursor<card.queue.length)return;const offset=action==='next-group'?card.offset+3:card.offset;if(offset>=jlptCardItems(unit,card.kind).length)return;ui.cards=pack(unit,card.kind,offset);render(false);focus('#jlpt-card-heading');return;
   }
   if(item===undefined||action==='reveal'&&card.open||action==='audio'&&!card.open)return;
   busy=true;try{await expose(unit,now());if(!fresh(ticket,origin)||ui.cards!==card||jlptBlocker(getContext().state))return;if(action==='reveal'){card.open=true;render(false);focus('#jlpt-card-heading');}else{const text=jlptCardAudio(unit,card);if(text&&getContext().audioIndex?.[text])await play(text,1);}}finally{busy=false;}return;
  }
  if(name==='jlpt-note'&&jlptUnitMeta.has(param)&&d.jlptUnit===param){
   if(action==='note-close'){ui.noteOpen=false;render(false);focus('[data-jlpt-action="note-open"]');return;}
   if(action==='note-open'&&!ui.noteOpen){busy=true;try{if(getContext().state.drafts[jlptNoteKey(param)]?.text.trim())await expose(param,now());if(fresh(ticket,origin)&&!jlptBlocker(getContext().state)){ui.noteOpen=true;render(false);focus('#jlpt-note-input');}}finally{busy=false;}}return;
  }
  if(name==='jlpt-round'&&d.jlptRound===param&&['round-reveal','round-audio','round-passage'].includes(action)){
   const review=jlptRoundReview(getContext().state,param,now()),entry=review?.entries[ui.roundIndex];if(!entry||entry.q.id!==d.jlptQuestion)return;
   if(action==='round-reveal'&&ui.roundRevealed){ui.roundRevealed=false;render(false);focus('[data-jlpt-action="round-reveal"]');return;}
   if(action==='round-passage'&&ui.roundPassage){ui.roundPassage=false;render(false);focus('[data-jlpt-action="round-passage"]');return;}
   if(action==='round-audio'&&entry.q.kind!=='listen'||action==='round-passage'&&!entry.q.passage)return;
   busy=true;const time=new Date(Math.max(Date.parse(now()),Date.parse(entry.answer.time)+1)).toISOString();
   try{await update(s=>recordJlptExposure(s,[entry.q.id],time,{kind:'reference',ref:'jlpt:round:'+param+':'+action}));if(!fresh(ticket,origin)||jlptBlocker(getContext().state))return;if(action==='round-audio')await play(entry.q.transcript,1);else{if(action==='round-reveal')ui.roundRevealed=true;else ui.roundPassage=true;render(false);focus('#jlpt-round-heading');}}finally{busy=false;}
  }
 }
 function click(event){const b=event.target.closest('button');if(!b)return;if(pointerBlocked){pointerBlocked=false;event.preventDefault();return;}if(!b.dataset.jlptAction)return;b.disabled=true;action({...b.dataset}).catch(error=>toast(error.message)).finally(()=>{if(b.isConnected)b.disabled=false;});}
 function pointerdown(event){const b=event.target.closest('button');pointerBlocked=Boolean(composing&&b&&(b.dataset.jlptAction||b.form?.hasAttribute('data-jlpt-search')));}
 const pointercancel=()=>{pointerBlocked=false;};
 function compositionstart(event){if(Object.hasOwn(event.target.dataset||{},'jlptQuery')||event.target.dataset?.jlptNoteInput)composing=true;}
 function compositionend(event){if(Object.hasOwn(event.target.dataset||{},'jlptQuery')||event.target.dataset?.jlptNoteInput)composing=false;}
 function input(event){
  const field=event.target,unit=field.dataset?.jlptNoteInput,[name,param]=route();if(disposed||name!=='jlpt-note'||param!==unit||!local().noteOpen||jlptBlocker(getContext().state))return;
  const text=field.value,time=now();if(text.length>160){toast('個人線索請限制在160字內。');return;}const key=jlptNoteKey(unit);cacheDraft(key,{text,points:[],time});update(s=>storeJlptNote(s,unit,text,time)).catch(error=>toast(error.message));
 }
 function submit(event){
  if(!event.target.hasAttribute?.('data-jlpt-search'))return;event.preventDefault();const [name,param]=route();if(disposed||name!=='jlpt-memory'||param&&!jlptLevels.includes(param)||jlptBlocker(getContext().state))return;
  if(pointerBlocked){pointerBlocked=false;return;}if(composing||event.isComposing)return;const data=new FormData(event.target),query=String(data.get('query')||''),scope=String(data.get('scope')||'all');if(query.length>160)return;local().filters={query,scope:['all','weak','new','practiced','notes'].includes(scope)?scope:'all',page:1};render(false);focus('#jlpt-results');
 }
 function change(event){
  if(disposed||busy||composing||jlptBlocker(getContext().state))return;const [name,param]=route(),field=event.target;
  if(name==='jlpt-cards'&&field.dataset?.jlptCardKind===param&&['words','grammar','kanji'].includes(field.value)){local().cards=pack(param,field.value);render(false);focus('#jlpt-card-kind');}
  if(name==='jlpt-round'&&field.dataset?.jlptRoundPicker===param){const index=Number(field.value);if(!Number.isInteger(index)||!jlptRoundReview(getContext().state,param,now())?.entries[index])return;Object.assign(local(),{roundIndex:index,roundRevealed:false,roundPassage:false});render(false);focus('#jlpt-round-picker');}
 }
 function toggle(event){const el=event.target,[name,unit]=route();if(!disposed&&el.open&&['study','lesson'].includes(name)&&el.dataset?.jlptReference===unit&&jlptUnitMeta.has(unit))expose(unit,now()).catch(error=>toast(error.message));}
 function afterRender(name,param){
  if(disposed)return;const ctx=getContext(),time=now();
  if(['study','lesson'].includes(name)&&jlptUnitMeta.has(param)&&['learn','words','read'].includes(ctx.session.studyTab||'learn'))expose(param,time).catch(error=>toast(error.message));

 }
 const listeners={click,pointerdown,pointercancel,compositionstart,compositionend,input,submit,change};for(const [name,fn] of Object.entries(listeners))document.addEventListener(name,fn);document.addEventListener('toggle',toggle,true);
 return {views:{'jlpt-path':level=>jlptPathView(getContext(),level,now()),'jlpt-memory':param=>jlptHubView(getContext(),param,now(),local().filters),'jlpt-map':level=>jlptMapView(getContext(),level,now()),'jlpt-review':ref=>jlptReviewView(getContext(),ref,now()),'jlpt-cards':unit=>jlptCardsView(getContext(),unit,local().cards||{}),'jlpt-note':unit=>jlptNoteView(getContext(),unit,local().noteOpen),'jlpt-round':sid=>jlptRoundView(getContext(),sid,now(),local()),'jlpt-guide':jlptGuideView},onRoute,afterRender,dispose(){disposed=true;for(const [name,fn] of Object.entries(listeners))document.removeEventListener(name,fn);document.removeEventListener('toggle',toggle,true);}};
}
