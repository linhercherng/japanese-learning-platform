import {coachLinks} from './kana-coach.mjs';
import {escapeHtml as e,icon,primary,back,note,heading,audioButton,wordAudioButton,strokeSvg} from './shared.mjs';
import {unitById,resolveQuestion,words} from '../content/catalog.mjs';
import {mastery} from '../core/learning.mjs';
import {memoryFor} from '../content/kana-memory.mjs';
export function kanaView(ctx){
 const {kana,kanaLessons,state,session}=ctx;
 const items=kana.filter(k=>k.script===session.script&&k.group===session.group);
 const selected=items.find(k=>k.id===session.selected)||items[0];
 const rowStart=Math.floor(items.indexOf(selected)/5)*5;
 const smallGroup=items.slice(rowStart,rowStart+5);
 const tile=k=>`<button class="kana-tile ${k.id===selected.id?'active':''}" data-kana="${e(k.id)}" aria-label="認識${e(k.glyph)}" aria-pressed="${k.id===selected.id}"><span class="jp" lang="ja">${e(k.glyph)}</span><small>${state.settings.roman?e(k.reading):'　'}</small><span class="kana-indicator">${state.reviews[`${k.id}:recognition`]?'已練':''}</span></button>`;
 const lesson=kanaLessons.find(l=>l.items.includes(selected.id))||kanaLessons[0];
 return `${heading('五十音，慢慢記。','一次選一行，先看、再聽、再親手寫。')}${coachLinks()}<div class="lesson-footer">${primary('記憶小訣竅＋分組加練','kana-memory')}</div><nav class="course-switch"><a class="active" href="#kana">五十音</a><a href="#life">生活課程</a></nav>
 <div class="segmented"><button data-script="hira" class="${session.script==='hira'?'active':''}" aria-pressed="${session.script==='hira'}">平假名</button><button data-script="kata" class="${session.script==='kata'?'active':''}" aria-pressed="${session.script==='kata'}">片假名</button></div>
 <div class="filters">${[['basic','基本字'],['voiced','濁音・半濁音'],['contracted','拗音']].map(([g,t])=>`<button data-group="${g}" class="${session.group===g?'active':''}" aria-pressed="${session.group===g}">${t}</button>`).join('')}</div>
 <div class="row-title"><strong>先看這 ${smallGroup.length} 個字</strong><span>${rowStart+1}～${rowStart+smallGroup.length} / ${items.length}</span></div><div class="kana-row all-kana">${smallGroup.map(tile).join('')}</div><div class="button-row"><button class="text-button" data-row-delta="-5" ${rowStart===0?'disabled':''}>← 上一行</button><button class="text-button" data-row-delta="5" ${rowStart+5>=items.length?'disabled':''}>下一行 →</button></div>
 <section class="kana-detail" id="selected-card"><div class="kana-detail-header"><span class="large-kana jp" lang="ja">${e(selected.glyph)}</span><div><h2>${state.settings.roman?e(selected.reading):'連結字形與聲音'}</h2><p>${e(memoryFor(selected.id)?.tip||selected.hint)}</p>${audioButton(selected.glyph)}</div></div><div class="word-example"><span class="jp" lang="ja">${e(selected.word)}</span><span>${e(selected.meaning)}</span></div>${audioButton(selected.word)}<div class="button-row">${primary('看筆順、寫一次',`stroke/${selected.id}`)}</div>${note('看完後收起提示，讓自己想一次。')}</section>
 <details><summary>展開全部 ${items.length} 個字${icon('arrow')}</summary><div class="full-kana">${items.map(k=>`<button data-kana="${e(k.id)}" aria-label="認識${e(k.glyph)}" lang="ja">${e(k.glyph)}</button>`).join('')}</div></details><div class="section-title"><h2>選一小課，循序學習</h2><span>18 個單元</span></div><div class="lesson-list">${kanaLessons.map(l=>`<a class="life-card" href="#unit/${l.id}"><span class="step-dot">${l.id.slice(1)}</span><div><h3>${e(l.title)}</h3><p>${e(l.goal)}</p><small>${state.completed[l.id]?'✓ 已完成練習':'開始一小步'}</small></div>${icon('arrow')}</a>`).join('')}</div>`;
}
export function unitView(ctx,id){
 const lesson=ctx.kanaLessons.find(l=>l.id===id)||ctx.kanaLessons[0];
 const items=lesson.items.map(id=>ctx.kana.find(k=>k.id===id)).filter(Boolean);
 const special=ctx.kanaPhonology.find(p=>p.lessonId===lesson.id);
 return `${back('五十音課程','kana')}${heading(lesson.title,lesson.goal)}<span class="tag">${lesson.id}${ctx.state.completed[lesson.id]?' · 已完成練習':''}</span><div class="lesson-footer">${note(lesson.note||'一次少量，先連結字形與聲音。')}</div>${special?`<section class="self-check"><h2>先理解這個重點</h2><p>${e(special.concept)}</p></section>`:''}<div class="section-title"><h2>這一課的字</h2><span>${items.length} 個</span></div><div class="kana-row">${items.map(k=>`<a class="kana-tile" href="#stroke/${k.id}"><span class="jp" lang="ja">${e(k.glyph)}</span><small>${ctx.state.settings.roman?e(k.reading):'看筆順'}</small></a>`).join('')}</div>
 ${(lesson.examples||[]).map(x=>`<section class="self-check"><p class="jp" lang="ja">${e(x.jp)}</p><p>${e(x.zh)}</p>${audioButton(x.jp)}</section>`).join('')}<div class="lesson-footer"><button class="primary" data-start-unit="${lesson.id}">收起提示，測試回想${icon('arrow')}</button></div><p class="review-explainer">完成小測後會記錄首次作答，答錯項目加入複習。</p>`;
}
export function itemPaths(ctx,item){
 if(item.strokeCode&&ctx.strokes[item.strokeCode])return ctx.strokes[item.strokeCode];
 return (item.componentStrokeCodes||[]).flatMap((code,i)=>(ctx.strokes[code]||[]).map(d=>({d,transform:i?'translate(67 46) scale(.38)':'scale(.7)'})));
}
export function strokeView(ctx,id){
 const item=(ctx.writingItems||ctx.kana).find(k=>k.id===id)||ctx.kana[0],paths=itemPaths(ctx,item);
 return `${back(item.script==='kanji'?'回到漢字詞庫':'回到五十音',item.script==='kanji'?'library/kanji':'kana')}<div class="progress-strip"><span>01 認識字形</span><i></i><span class="active">02 看筆順</span><i></i><span>03 自己寫</span></div><div class="character-title"><div><h1><span lang="ja">${e(item.glyph)}</span>先看，再寫。</h1><p>${e(memoryFor(item.id)?.tip||item.hint)}</p></div><span class="tag">${paths.length} 筆</span></div>${item.script==='kanji'?wordAudioButton({jp:item.word,reading:item.wordReading}):audioButton(item.glyph)}<div class="lesson-footer"><div class="stroke-board">${strokeSvg(paths)}</div></div><div class="stroke-step-controls">${paths.map((_,i)=>`<button data-stroke-step="${i}">第 ${i+1} 筆</button>`).join('')}</div><p id="stroke-hint" class="stroke-hint">看清楚方向，慢慢記住順序。</p><button class="secondary" data-action="animate-strokes">${icon('play')}播放完整筆順</button><div class="lesson-footer">${primary('換我寫寫看',`write/${item.id}`)}</div><p class="source-note">筆順：KanjiVG · CC BY-SA 3.0</p>`;
}
export function writingView(ctx,id){
 const item=(ctx.writingItems||ctx.kana).find(k=>k.id===id)||ctx.kana[0];
 return `${back('再看一次筆順',`stroke/${item.id}`)}${heading(ctx.session.guide?`寫一次 ${item.glyph}，再回想。`:'先聽聲音，再自己寫。','先描寫，再收起提示。作品會保存在這個瀏覽器。').replace('<h1>','<h1 id="writing-title">')}<div class="segmented"><button data-mode="trace" class="${ctx.session.guide?'active':''}" aria-pressed="${ctx.session.guide}">① 跟著描寫</button><button data-mode="recall" class="${ctx.session.guide?'':'active'}" aria-pressed="${!ctx.session.guide}">② 收起提示默寫</button></div>${item.script==='kanji'?wordAudioButton({jp:item.word,reading:item.wordReading}):audioButton(item.glyph)}<div class="writing-board ${ctx.session.guide?'':'no-guide'}" id="writing-board"><span class="board-label" id="writing-label">${ctx.session.guide?e(item.glyph)+' · 字跡草稿自動保存':'默寫草稿自動保存'}</span>${strokeSvg(itemPaths(ctx,item),true)}<canvas id="writing-canvas" aria-label="手寫區，可使用手指、滑鼠或觸控筆"></canvas></div><div class="tools-row"><button data-action="undo">${icon('undo')}退一筆</button><button data-action="clear">${icon('trash')}重新寫</button><button data-action="compare">${icon('eye')}對照示範</button></div>${note('先不看示範，想一想字形和筆順。寫得不完美也沒關係。')}<section class="self-check"><h2>自己檢查一下</h2><label><input id="writing-order" type="checkbox">我有照筆順寫</label><label><input id="writing-recall" type="checkbox">我能收起提示，自己寫一次</label><p>手寫採自評，未自動辨識或評分。</p></section><div class="lesson-footer"><button class="primary" data-save-writing="${item.id}">保存作品與自評${icon('check')}</button></div><p class="review-explainer">紙上練習也可以完成自評。若沒有畫字，保存的是自評紀錄。</p>`;
}
export function reviewView(ctx){
 const reviews=Object.values(ctx.state.reviews),due=ctx.due;
 const dimensions={recognition:'認字',listening:'聽辨',writing:'書寫自評',language:'語言運用',grammar:'文法',vocabulary:'詞彙',kanji:'漢字',reading:'讀解'};
 const rows=reviews.slice(0,100).map(r=>{
  const k=ctx.writingItems.find(k=>k.id===r.item),q=resolveQuestion(r.item),unit=unitById.get(q?.unitId||r.item),word=words.find(w=>r.item.startsWith(w.id));
  const route=k?'stroke/'+k.id:unit?'study/'+unit.id:word?'library/words':'practice-hub';
  return '<a class="life-card" href="#'+route+'"><span class="review-glyphs" lang="ja">'+e(k?.glyph||word?.jp?.slice(0,2)||'想起')+'</span><div><h3>'+e(dimensions[r.dimension])+' · '+mastery(r)+'</h3><p>'+e(unit?.title||word?.jp||q?.prompt||r.item)+'</p><p>首次無提示答對 '+r.independent+' / '+r.total+' 次</p><small>下次：'+new Date(r.due).toLocaleDateString('zh-TW')+'</small></div></a>';
 }).join('');
 return heading('把學過的，再想一次。','認字、聽辨、詞彙、文法、讀解與書寫各自安排複習。')+'<section class="hero"><span class="eyebrow">SPACED RECALL</span><h2>'+due.length+' 個項目待複習</h2><p>'+(due.length?'答錯或還需要提示的，今天再練一點。':'今天沒有到期項目。你可以開始新課或自由加練。')+'</p>'+(due.length?'<button class="primary" data-action="start-review">開始到期複習</button>':primary('開始一個小單元','courses'))+'</section><div class="section-title"><h2>各項能力的紀錄</h2><span>'+reviews.length+' 個能力項目</span></div><div class="life-list">'+(rows||'<p class="filter-empty">還沒有作答紀錄。完成第一課回想，就會出現在這裡。</p>')+'</div>';
}
